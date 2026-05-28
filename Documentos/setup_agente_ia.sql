-- 1. Crear tabla de asignación de asesores si no existe
CREATE TABLE IF NOT EXISTS public.lotes_asesores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
    asesor_id UUID NOT NULL REFERENCES public.usuarios_productor(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(lote_id, asesor_id)
);

-- 2. RPC 1: alertas_activas_usuario
CREATE OR REPLACE FUNCTION public.alertas_activas_usuario()
RETURNS TABLE (
  id UUID,
  severidad text,
  indice text,
  zona_afectada text,
  texto_ia text,
  recomendacion text,
  wapp_enviado boolean,
  revisada boolean,
  creado_en timestamp with time zone,
  lote_nombre text,
  superficie numeric,
  cultivo text,
  etapa_fenologica text,
  variedad text,
  ndvi_actual numeric,
  ndvi_historico numeric,
  desviacion_pct numeric,
  orden_severidad integer
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    CASE WHEN a.indice = 'ndvi' THEN 'severa'::text ELSE 'moderada'::text END AS severidad,
    a.indice::text,
    a.zona_afectada::text,
    a.zona_afectada::text AS texto_ia,
    'Revisar el sector indicado del lote para evaluar estrés hídrico o nutricional.'::text AS recomendacion,
    a.wapp_enviado,
    a.revisada,
    a.creado_hace AS creado_en,
    c.nombre::text AS lote_nombre,
    l.superficie::numeric,
    c.tipo::text AS cultivo,
    'Fase Vegetativa'::text AS etapa_fenologica,
    c.variedad::text,
    ROUND(COALESCE(i.ndvi_media, l.ultimo_ndvi)::numeric, 4) AS ndvi_actual,
    ROUND(COALESCE((SELECT AVG(ndvi_media) FROM indices_satelitales WHERE lote_id = l.id), 0.6)::numeric, 4) AS ndvi_historico,
    ROUND(COALESCE(((COALESCE(i.ndvi_media, l.ultimo_ndvi) - (SELECT AVG(ndvi_media) FROM indices_satelitales WHERE lote_id = l.id)) / NULLIF((SELECT AVG(ndvi_media) FROM indices_satelitales WHERE lote_id = l.id), 0) * 100), -12.5)::numeric, 2) AS desviacion_pct,
    CASE a.indice WHEN 'ndvi' THEN 1 WHEN 'ndwi' THEN 2 ELSE 3 END AS orden_severidad
  FROM alertas a
  JOIN lotes l ON a.lote_id = l.id
  JOIN campos cp ON l.id_campo = cp.id
  LEFT JOIN cultivos c ON l.id_cultivos = c.id
  LEFT JOIN LATERAL (
    SELECT ndvi_media
    FROM indices_satelitales
    WHERE lote_id = l.id
    ORDER BY fecha_imagen DESC
    LIMIT 1
  ) i ON true
  WHERE a.revisada = false
    AND cp.id_usuarios = auth.uid()
    AND a.creado_hace >= NOW() - INTERVAL '7 days'
  ORDER BY orden_severidad, a.creado_hace DESC;
END;
$$;

-- 3. RPC 2: alertas_activas_asesor
CREATE OR REPLACE FUNCTION public.alertas_activas_asesor()
RETURNS TABLE (
  id UUID,
  severidad text,
  indice text,
  zona_afectada text,
  texto_ia text,
  recomendacion text,
  creado_en timestamp with time zone,
  lote_nombre text,
  superficie numeric,
  productor_nombre text,
  cultivo text,
  etapa_fenologica text,
  ndvi_actual numeric,
  desviacion_pct numeric,
  orden_severidad integer
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    CASE WHEN a.indice = 'ndvi' THEN 'severa'::text ELSE 'moderada'::text END AS severidad,
    a.indice::text,
    a.zona_afectada::text,
    a.zona_afectada::text AS texto_ia,
    'Se sugiere visita técnica para corroborar vigor.'::text AS recomendacion,
    a.creado_hace AS creado_en,
    c.nombre::text AS lote_nombre,
    l.superficie::numeric,
    u.nombre::text AS productor_nombre,
    c.tipo::text AS cultivo,
    'Fase Vegetativa'::text AS etapa_fenologica,
    ROUND(COALESCE(i.ndvi_media, l.ultimo_ndvi)::numeric, 4) AS ndvi_actual,
    ROUND(COALESCE(((COALESCE(i.ndvi_media, l.ultimo_ndvi) - (SELECT AVG(ndvi_media) FROM indices_satelitales WHERE lote_id = l.id)) / NULLIF((SELECT AVG(ndvi_media) FROM indices_satelitales WHERE lote_id = l.id), 0) * 100), -12.5)::numeric, 2) AS desviacion_pct,
    CASE a.indice WHEN 'ndvi' THEN 1 WHEN 'ndwi' THEN 2 ELSE 3 END AS orden_severidad
  FROM alertas a
  JOIN lotes l ON a.lote_id = l.id
  JOIN campos cp ON l.id_campo = cp.id
  JOIN usuarios_productor u ON cp.id_usuarios = u.id
  LEFT JOIN cultivos c ON l.id_cultivos = c.id
  LEFT JOIN LATERAL (
    SELECT ndvi_media
    FROM indices_satelitales
    WHERE lote_id = l.id
    ORDER BY fecha_imagen DESC
    LIMIT 1
  ) i ON true
  JOIN lotes_asesores la ON la.lote_id = l.id
  WHERE a.revisada = false
    AND la.asesor_id = auth.uid()
    AND a.creado_hace >= NOW() - INTERVAL '7 days'
  ORDER BY orden_severidad, a.creado_hace DESC;
END;
$$;

-- 4. RPC 3: estado_ndvi_lotes
CREATE OR REPLACE FUNCTION public.estado_ndvi_lotes()
RETURNS TABLE (
  id UUID,
  lote_nombre text,
  superficie numeric,
  cultivo text,
  etapa_fenologica text,
  fecha_siembra date,
  ndvi_actual numeric,
  ndwi_actual numeric,
  mndwi_actual numeric,
  ndvi_historico numeric,
  desviacion_pct numeric,
  nubosidad numeric,
  ultima_imagen date,
  dias_desde_imagen integer,
  estado_ndvi text,
  estado_nubosidad text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH ultimo_indice AS (
    SELECT DISTINCT ON (lote_id)
      lote_id,
      ndvi_media,
      ndwi_media,
      mndwi_media,
      nubosidad_pct,
      fecha_imagen
    FROM indices_satelitales
    ORDER BY lote_id, fecha_imagen DESC
  ),
  historico AS (
    SELECT
      lote_id,
      AVG(ndvi_media) AS ndvi_promedio
    FROM indices_satelitales
    WHERE fecha_imagen >= NOW() - INTERVAL '3 years'
    GROUP BY lote_id
  )
  SELECT
    l.id,
    c.nombre::text AS lote_nombre,
    l.superficie::numeric,
    c.tipo::text AS cultivo,
    'Fase Vegetativa'::text AS etapa_fenologica,
    c.fecha_siembra,
    ROUND(COALESCE(ui.ndvi_media, l.ultimo_ndvi)::numeric, 4) AS ndvi_actual,
    ROUND(COALESCE(ui.ndwi_media, 0.15)::numeric, 4) AS ndwi_actual,
    ROUND(COALESCE(ui.mndwi_media, -0.2)::numeric, 4) AS mndwi_actual,
    ROUND(COALESCE(h.ndvi_promedio, 0.6)::numeric, 4) AS ndvi_historico,
    ROUND(COALESCE(((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0) * 100), -10.0)::numeric, 2) AS desviacion_pct,
    ROUND(COALESCE(ui.nubosidad_pct, 5.0)::numeric, 2) AS nubosidad,
    ui.fecha_imagen AS ultima_imagen,
    EXTRACT(DAY FROM NOW() - COALESCE(ui.fecha_imagen, l.creado_en))::INTEGER AS dias_desde_imagen,
    CASE
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.30 THEN 'severa'::text
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.20 THEN 'moderada'::text
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.10 THEN 'leve'::text
      ELSE 'normal'::text
    END AS estado_ndvi,
    CASE
      WHEN COALESCE(ui.nubosidad_pct, 5.0) > 50 THEN 'alta'::text
      WHEN COALESCE(ui.nubosidad_pct, 5.0) > 20 THEN 'moderada'::text
      ELSE 'baja'::text
    END AS estado_nubosidad
  FROM lotes l
  JOIN campos cp ON l.id_campo = cp.id
  LEFT JOIN cultivos c ON l.id_cultivos = c.id
  LEFT JOIN ultimo_indice ui ON l.id = ui.lote_id
  LEFT JOIN historico h ON l.id = h.lote_id
  WHERE l.activo = true
    AND cp.id_usuarios = auth.uid()
  ORDER BY
    CASE
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.30 THEN 1
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.20 THEN 2
      WHEN ((COALESCE(ui.ndvi_media, l.ultimo_ndvi) - h.ndvi_promedio) / NULLIF(h.ndvi_promedio, 0)) <= -0.10 THEN 3
      ELSE 4
    END,
    c.nombre;
END;
$$;

-- 5. RPC 4: clima_lote
CREATE OR REPLACE FUNCTION public.clima_lote(lote_id uuid)
RETURNS TABLE (
  id UUID,
  nombre text,
  lat numeric,
  lon numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    c.nombre::text AS nombre,
    ROUND(ST_Y(ST_Centroid(l.poligono))::numeric, 6) AS lat,
    ROUND(ST_X(ST_Centroid(l.poligono))::numeric, 6) AS lon
  FROM lotes l
  JOIN campos cp ON l.id_campo = cp.id
  LEFT JOIN cultivos c ON l.id_cultivos = c.id
  WHERE l.id = lote_id
    AND cp.id_usuarios = auth.uid()
  LIMIT 1;
END;
$$;

-- 6. RPC 5: historial_alertas
CREATE OR REPLACE FUNCTION public.historial_alertas()
RETURNS TABLE (
  id UUID,
  severidad text,
  indice text,
  zona_afectada text,
  texto_ia text,
  recomendacion text,
  wapp_enviado boolean,
  revisada boolean,
  creado_en timestamp with time zone,
  lote_nombre text,
  cultivo text,
  etapa_fenologica text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    CASE WHEN a.indice = 'ndvi' THEN 'severa'::text ELSE 'moderada'::text END AS severidad,
    a.indice::text,
    a.zona_afectada::text,
    a.zona_afectada::text AS texto_ia,
    'Revisar en el campo.'::text AS recomendacion,
    a.wapp_enviado,
    a.revisada,
    a.creado_hace AS creado_en,
    c.nombre::text AS lote_nombre,
    c.tipo::text AS cultivo,
    'Fase Vegetativa'::text AS etapa_fenologica
  FROM alertas a
  JOIN lotes l ON a.lote_id = l.id
  JOIN campos cp ON l.id_campo = cp.id
  LEFT JOIN cultivos c ON l.id_cultivos = c.id
  WHERE cp.id_usuarios = auth.uid()
    AND a.creado_hace >= NOW() - INTERVAL '30 days'
  ORDER BY a.creado_hace DESC
  LIMIT 50;
END;
$$;

-- 7. RPC 6: marcar_alerta_revisada
CREATE OR REPLACE FUNCTION public.marcar_alerta_revisada(alerta_id uuid)
RETURNS TABLE (
  id UUID,
  revisada boolean,
  revisada_en timestamp with time zone
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.alertas a
  SET
    revisada    = true
  WHERE a.id = alerta_id
    AND a.lote_id IN (
      SELECT l.id FROM lotes l
      JOIN campos cp ON l.id_campo = cp.id
      WHERE cp.id_usuarios = auth.uid()
    );
    
  RETURN QUERY
  SELECT a.id, a.revisada, NOW() AS revisada_en
  FROM public.alertas a
  WHERE a.id = alerta_id;
END;
$$;

-- 8. Datos de Prueba (Seeding) para Lote 'La Esperanza'
-- Este bloque inserta un historial óptimo de vigor y una captura reciente con caída crítica (-35%) para probar el agente.
DO $$
DECLARE
    v_lote_id UUID;
    v_cultivo_id UUID;
    v_asesor_id UUID;
BEGIN
    -- A. Buscar el cultivo 'La Esperanza'
    SELECT id INTO v_cultivo_id FROM public.cultivos WHERE nombre = 'La Esperanza' LIMIT 1;
    
    -- B. Buscar el lote correspondiente
    SELECT id INTO v_lote_id FROM public.lotes WHERE id_cultivos = v_cultivo_id LIMIT 1;
    
    IF v_lote_id IS NOT NULL THEN
        -- Limpiar registros anteriores del test
        DELETE FROM public.indices_satelitales WHERE lote_id = v_lote_id;
        
        -- Insertar registros históricos (vigorosos)
        INSERT INTO public.indices_satelitales (lote_id, fecha_imagen, satelite, ndvi_media, ndvi_p10, ndwi_media, mndwi_media, nubosidad_pct) VALUES
        (v_lote_id, '2026-05-01', 'Sentinel-2', 0.65, 0.58, 0.12, -0.22, 2.1),
        (v_lote_id, '2026-05-06', 'Sentinel-2', 0.66, 0.60, 0.10, -0.24, 0.5),
        (v_lote_id, '2026-05-11', 'Sentinel-2', 0.64, 0.57, 0.15, -0.20, 4.8),
        (v_lote_id, '2026-05-16', 'Sentinel-2', 0.65, 0.59, 0.13, -0.21, 1.2);
        
        -- Insertar captura actual con ANOMALÍA CRÍTICA (Caída severa de NDVI = 0.42, caída de -35%)
        INSERT INTO public.indices_satelitales (lote_id, fecha_imagen, satelite, ndvi_media, ndvi_p10, ndwi_media, mndwi_media, nubosidad_pct) VALUES
        (v_lote_id, '2026-05-28', 'Sentinel-2', 0.42, 0.31, -0.05, -0.28, 0.2);
        
        -- C. Buscar un asesor en usuarios_productor para autorizarlo
        SELECT id INTO v_asesor_id FROM public.usuarios_productor WHERE rol = 'asesor' LIMIT 1;
        
        IF v_asesor_id IS NOT NULL THEN
            DELETE FROM public.lotes_asesores WHERE lote_id = v_lote_id AND asesor_id = v_asesor_id;
            INSERT INTO public.lotes_asesores (lote_id, asesor_id) VALUES (v_lote_id, v_asesor_id);
            RAISE NOTICE 'Asesor vinculado exitosamente para Lote La Esperanza';
        END IF;
        
        RAISE NOTICE 'Datos de prueba cargados con éxito para Lote La Esperanza';
    ELSE
        RAISE NOTICE 'Lote La Esperanza no encontrado en la base de datos';
    END IF;
END $$;

