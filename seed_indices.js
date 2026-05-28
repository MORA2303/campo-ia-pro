import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedTestIndices() {
  console.log("🚀 Iniciando siembra de datos de prueba para Lote 'La Esperanza'...");

  try {
    // A. Buscar el cultivo 'La Esperanza'
    const { data: cultivo, error: cultErr } = await supabase
      .from('cultivos')
      .select('id')
      .eq('nombre', 'La Esperanza')
      .limit(1)
      .single();

    if (cultErr || !cultivo) {
      console.error("❌ Cultivo 'La Esperanza' no encontrado. Asegúrate de haber corrido seed_script.js primero.", cultErr?.message);
      return;
    }

    const cultivoId = cultivo.id;
    console.log(`📌 Cultivo 'La Esperanza' encontrado ID: ${cultivoId}`);

    // B. Buscar el lote correspondiente
    const { data: lote, error: loteErr } = await supabase
      .from('lotes')
      .select('id')
      .eq('id_cultivos', cultivoId)
      .limit(1)
      .single();

    if (loteErr || !lote) {
      console.error("❌ Lote para cultivo 'La Esperanza' no encontrado.", loteErr?.message);
      return;
    }

    const loteId = lote.id;
    console.log(`📌 Lote correspondiente encontrado ID: ${loteId}`);

    // Limpiar registros históricos previos del test
    const { error: delErr } = await supabase
      .from('indices_satelitales')
      .delete()
      .eq('lote_id', loteId);

    if (delErr) {
      console.warn("⚠️ Advertencia al limpiar registros previos en 'indices_satelitales':", delErr.message);
    }

    // Insertar registros históricos (vigorosos)
    const indicesAInsertar = [
      { lote_id: loteId, fecha_imagen: '2026-05-01', satelite: 'Sentinel-2', ndvi_media: 0.65, ndvi_p10: 0.58, ndwi_media: 0.12, mndwi_media: -0.22, nubosidad_pct: 2.1 },
      { lote_id: loteId, fecha_imagen: '2026-05-06', satelite: 'Sentinel-2', ndvi_media: 0.66, ndvi_p10: 0.60, ndwi_media: 0.10, mndwi_media: -0.24, nubosidad_pct: 0.5 },
      { lote_id: loteId, fecha_imagen: '2026-05-11', satelite: 'Sentinel-2', ndvi_media: 0.64, ndvi_p10: 0.57, ndwi_media: 0.15, mndwi_media: -0.20, nubosidad_pct: 4.8 },
      { lote_id: loteId, fecha_imagen: '2026-05-16', satelite: 'Sentinel-2', ndvi_media: 0.65, ndvi_p10: 0.59, ndwi_media: 0.13, mndwi_media: -0.21, nubosidad_pct: 1.2 },
      // Captura actual con anomalía crítica (Caída severa de NDVI = 0.42, caída del 35% respecto a la media de 0.65)
      { lote_id: loteId, fecha_imagen: '2026-05-28', satelite: 'Sentinel-2', ndvi_media: 0.42, ndvi_p10: 0.31, ndwi_media: -0.05, mndwi_media: -0.28, nubosidad_pct: 0.2 }
    ];

    const { error: insErr } = await supabase
      .from('indices_satelitales')
      .insert(indicesAInsertar);

    if (insErr) {
      console.error("❌ Error al insertar datos en 'indices_satelitales':", insErr.message);
      return;
    }
    console.log("✅ 5 registros satelitales insertados con éxito en 'indices_satelitales'.");

    // C. Buscar un asesor en usuarios_productor para vincularlo
    let { data: asesor, error: asesorErr } = await supabase
      .from('usuarios_productor')
      .select('id, nombre, apellido')
      .eq('rol', 'asesor')
      .limit(1)
      .single();

    if (asesorErr || !asesor) {
      console.log("ℹ️ No se encontró ningún asesor. Creando un asesor de prueba...");
      const { data: nuevoAsesor, error: createAsesorErr } = await supabase
        .from('usuarios_productor')
        .insert({
          nombre: "Martín",
          apellido: "López",
          whatsapp: "+5491166667777",
          mail: "martin.lopez@ejemplo.com",
          rol: "asesor"
        })
        .select()
        .single();

      if (createAsesorErr) {
        console.error("❌ Error al crear asesor de prueba:", createAsesorErr.message);
        return;
      }
      asesor = nuevoAsesor;
      console.log(`✅ Asesor creado exitosamente: ${asesor.nombre} ${asesor.apellido}`);
    } else {
      console.log(`📌 Asesor encontrado: ${asesor.nombre} ${asesor.apellido} (ID: ${asesor.id})`);
    }

    // Vincular asesor al lote en lotes_asesores
    const { error: unlinkErr } = await supabase
      .from('lotes_asesores')
      .delete()
      .eq('lote_id', loteId)
      .eq('asesor_id', asesor.id);

    const { error: linkErr } = await supabase
      .from('lotes_asesores')
      .insert({
        lote_id: loteId,
        asesor_id: asesor.id
      });

    if (linkErr) {
      console.error("❌ Error al vincular asesor en lotes_asesores:", linkErr.message);
    } else {
      console.log(`✅ Asesor ${asesor.nombre} ${asesor.apellido} vinculado exitosamente al lote 'La Esperanza'.`);
    }

    console.log("\n🎉 PROCESO DE SIEMBRA COMPLETADO EXITOSAMENTE.");

  } catch (err) {
    console.error("❌ Error inesperado durante la siembra:", err.message);
  }
}

seedTestIndices();
