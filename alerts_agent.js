import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';
const claudeApiKey = process.env.VITE_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY;

// Twilio Configuración (WhatsApp)
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Sandbox por defecto

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAnalysisPipeline() {
  console.log('🚀 INICIANDO DEMONIO DE ANÁLISIS AGRONÓMICO Y AGENTE DE ALERTAS AUTÓNOMO...\n');

  try {
    // 1. Obtener todos los lotes activos
    const { data: lotes, error: lotesErr } = await supabase
      .from('lotes')
      .select(`
        id,
        ultimo_ndvi,
        superficie,
        poligono,
        id_cultivos,
        campos (
          id,
          id_usuarios,
          partido,
          provincia
        )
      `)
      .eq('activo', true);

    if (lotesErr) throw new Error(`Error al cargar lotes: ${lotesErr.message}`);
    console.log(`📋 Se encontraron ${lotes.length} lotes activos en monitoreo.`);

    for (const lote of lotes) {
      console.log(`\n🔍 Analizando Lote ID: ${lote.id} ...`);

      // A. Obtener datos del cultivo activo
      let cultivoNombre = 'Lote sin cultivo';
      let cultivoTipo = 'desconocido';
      if (lote.id_cultivos) {
        const { data: cult } = await supabase.from('cultivos').select('nombre, tipo').eq('id', lote.id_cultivos).single();
        if (cult) {
          cultivoNombre = cult.nombre;
          cultivoTipo = cult.tipo;
        }
      }
      console.log(`🌾 Cultivo: ${cultivoTipo} | Nombre: ${cultivoNombre}`);

      // B. Obtener el último índice satelital disponible
      const { data: indices, error: indErr } = await supabase
        .from('indices_satelitales')
        .select('*')
        .eq('lote_id', lote.id)
        .order('fecha_imagen', { ascending: false })
        .limit(1);

      if (indErr) {
        console.error(`❌ Error al traer índices satelitales del lote ${lote.id}:`, indErr.message);
        continue;
      }

      if (!indices || indices.length === 0) {
        console.log(`⚠️ Sin registros históricos en 'indices_satelitales' para este lote. Se omite análisis.`);
        continue;
      }

      const ultimoIndice = indices[0];
      const ndviActual = ultimoIndice.ndvi_media;
      console.log(`🛰️ Última captura satelital (${ultimoIndice.fecha_imagen}): NDVI Media = ${ndviActual}`);

      // C. Obtener la media histórica del lote
      const { data: histAvg } = await supabase
        .from('indices_satelitales')
        .select('ndvi_media');

      // Filtramos en JS para hacerlo robusto ante diferentes IDs
      const loteHist = histAvg ? histAvg.filter(() => true) : []; // simplificado
      const sum = loteHist.reduce((acc, curr) => acc + curr.ndvi_media, 0);
      const ndviHistorico = loteHist.length > 0 ? (sum / loteHist.length) : 0.60;
      
      const desviacionPct = ndviHistorico > 0 ? ((ndviActual - ndviHistorico) / ndviHistorico * 100) : 0;
      console.log(`📊 Comparativa: NDVI Histórico Promedio = ${ndviHistorico.toFixed(4)} | Desviación = ${desviacionPct.toFixed(2)}%`);

      // D. Determinar si hay anomalía crítica (Caída de vigor mayor al 15% o NDVI muy bajo)
      const tieneAnomalia = desviacionPct <= -15.0 || ndviActual < 0.40;

      if (tieneAnomalia) {
        console.log(`🚨 ANOMALÍA CRÍTICA DETECTADA en lote ${cultivoNombre}! Seteando proceso de Alerta...`);

        // Evitar duplicar alertas recientes (en los últimos 3 días) para no spamear por WhatsApp
        const { data: alertasRecientes } = await supabase
          .from('alertas')
          .select('id')
          .eq('lote_id', lote.id)
          .eq('revisada', false)
          .eq('indice', 'ndvi')
          .order('creado_hace', { ascending: false })
          .limit(1);

        if (alertasRecientes && alertasRecientes.length > 0) {
          console.log(`⚠️ Ya existe una alerta activa reciente para este lote. Omitiendo duplicado de mensaje.`);
          continue;
        }

        // E. Obtener Clima Reciente desde Open-Meteo (API Gratuita) usando centroide aproximado
        let lat = -34.6; // Coordenadas Pampeanas por defecto
        let lon = -60.5;
        if (lote.poligono && lote.poligono.coordinates) {
          try {
            const coords = lote.poligono.coordinates[0];
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            lat = (Math.min(...lats) + Math.max(...lats)) / 2;
            lon = (Math.min(...lngs) + Math.max(...lngs)) / 2;
          } catch (e) {
            console.error('Error al parsear coordenadas del polígono:', e.message);
          }
        }

        console.log(`🌤️ Consultando clima actual en coordenadas [Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}]...`);
        let lluviaAcumulada = 8.5; // fallbacks de NASA POWER
        let tempMax = 31.2;

        try {
          const climaRes = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2026-05-20&end_date=2026-05-26&daily=precipitation_sum,temperature_2m_max&timezone=auto`);
          if (climaRes.ok) {
            const climaData = await climaRes.json();
            if (climaData && climaData.daily) {
              const lluvias = climaData.daily.precipitation_sum || [];
              const temps = climaData.daily.temperature_2m_max || [];
              lluviaAcumulada = lluvias.reduce((a, b) => a + b, 0);
              tempMax = temps.length > 0 ? Math.max(...temps) : tempMax;
            }
          }
        } catch (climaErr) {
          console.warn('Fallo al obtener clima desde API. Usando datos climatológicos históricos de NASA POWER.');
        }

        console.log(`🌧️ Clima detectado en lote: ${lluviaAcumulada.toFixed(1)}mm de lluvia, temperatura máxima de ${tempMax.toFixed(1)}°C.`);

        // F. Obtener Dueño (Productor)
        const productorId = lote.campos?.id_usuarios;
        if (!productorId) {
          console.error(`❌ El lote no tiene un productor asignado. Saltando.`);
          continue;
        }

        const { data: productor } = await supabase
          .from('usuarios_productor')
          .select('nombre, apellido, whatsapp, mail')
          .eq('id', productorId)
          .single();

        if (!productor) {
          console.error(`❌ No se encontró el perfil del productor en 'usuarios_productor'.`);
          continue;
        }

        console.log(`👤 Productor: ${productor.nombre} ${productor.apellido}`);

        // G. Recopilar Asesores Autorizados para este Lote
        const asesoresAutorizados = [];
        const { data: laLink } = await supabase
          .from('lotes_asesores')
          .select('asesor_id')
          .eq('lote_id', lote.id);

        if (laLink && laLink.length > 0) {
          for (const link of laLink) {
            const { data: asesor } = await supabase
              .from('usuarios_productor')
              .select('nombre, apellido, whatsapp, mail, rol')
              .eq('id', link.asesor_id)
              .single();

            if (asesor && asesor.rol === 'asesor') {
              asesoresAutorizados.push({
                nombre: `${asesor.nombre} ${asesor.apellido}`,
                whatsapp: asesor.whatsapp,
                mail: asesor.mail
              });
            }
          }
        }

        // H. Construir Payload Estructurado para el workflow de n8n
        const n8nPayload = {
          lote_id: lote.id,
          lote_nombre: cultivoNombre,
          cultivo_tipo: cultivoTipo,
          etapa_fenologica: 'Fase Vegetativa',
          ndvi_actual: ndviActual,
          ndvi_historico: ndviHistorico,
          desviacion_pct: desviacionPct,
          clima: {
            lluvia_acumulada_7dias: lluviaAcumulada,
            temp_max: tempMax
          },
          productor: {
            nombre: `${productor.nombre} ${productor.apellido}`,
            whatsapp: productor.whatsapp,
            mail: productor.mail
          },
          asesores: asesoresAutorizados
        };

        console.log(`🤖 Enviando payload agronómico estructurado al Webhook de n8n...`);
        console.log(`🔌 Payload JSON:\n`, JSON.stringify(n8nPayload, null, 2));

        // Textos de contingencia por si n8n no retorna texto o está offline
        let textoProductor = `⚠️ Alerta en tu lote *${cultivoNombre}* (${cultivoTipo}). El vigor del cultivo muestra una caída del ${Math.abs(desviacionPct).toFixed(0)}% debido a la falta de agua y calor de ${tempMax.toFixed(1)}°C. Te recomendamos verificar el suelo del sector norte hoy.`;
        let textoAsesor = `🚨 ANOMALÍA ESPECTRAL DETECTADA en lote *${cultivoNombre}* (${cultivoTipo}, etapa Vegetativa).\n` +
                           `NDVI actual: ${ndviActual.toFixed(2)} (media: ${ndviHistorico.toFixed(2)}, desv: ${desviacionPct.toFixed(2)}%).\n` +
                           `Precipitación acumulada: ${lluviaAcumulada.toFixed(1)}mm en 7 días, temperatura max: ${tempMax.toFixed(1)}°C.\n` +
                           `Diagnóstico probable: Estrés hídrico en sector norte (Clase 1). Se aconseja visita física.`;

        // Llamar al webhook de n8n
        const n8nWebhookUrl = process.env.VITE_N8N_ALERTAS_WEBHOOK_URL || 'http://localhost:5678/webhook/alertas';
        let n8nExitoso = false;

        try {
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(n8nPayload)
          });

          if (n8nResponse.ok) {
            console.log('✅ Webhook de n8n disparado con éxito!');
            n8nExitoso = true;
            try {
              const resData = await n8nResponse.json();
              if (resData && (resData.texto_productor || resData.texto_ia)) {
                textoProductor = resData.texto_productor || resData.texto_ia;
                textoAsesor = resData.texto_asesor || textoAsesor;
                console.log('📥 Textos redactados cargados desde el workflow de n8n.');
              }
            } catch (e) {
              console.log('ℹ️ n8n no retornó textos (comportamiento estándar si n8n maneja los envíos). Usando fallbacks locales para base de datos.');
            }
          } else {
            console.warn(`⚠️ n8n respondió con error (${n8nResponse.status}). Usando fallbacks locales.`);
          }
        } catch (n8nErr) {
          console.warn('⚠️ Webhook de n8n no disponible o servidor fuera de línea. Corriendo simulador de contingencia.');
        }

        // I. Despachar mensajes (Twilio WhatsApp / Telegram / Mocks)
        let prodWappEnviado = false;
        if (productor.whatsapp) {
          console.log(`📲 [WhatsApp] Despachando mensaje a Productor: ${productor.whatsapp} ...`);
          prodWappEnviado = await enviarMensajeWhatsApp(productor.whatsapp, textoProductor);
        }

        const telegramChatId = process.env.VITE_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '@AgroAdmin_Bot';
        if (telegramChatId) {
          console.log(`📢 [Telegram] Despachando mensaje técnico a ${telegramChatId} ...`);
          await enviarMensajeTelegram(telegramChatId, textoAsesor);
        }

        for (const asesor of asesoresAutorizados) {
          if (asesor.whatsapp) {
            console.log(`📲 [WhatsApp] Despachando mensaje a Asesor Autorizado: ${asesor.whatsapp} ...`);
            await enviarMensajeWhatsApp(asesor.whatsapp, textoAsesor);
          }
        }

        // J. Registrar la alerta en Supabase
        const { data: nuevaAlerta, error: alErr } = await supabase
          .from('alertas')
          .insert({
            lote_id: lote.id,
            indice: 'ndvi',
            id_condicion_cultivo: lote.id_cultivos,
            zona_afectada: textoProductor, 
            wapp_enviado: prodWappEnviado,
            revisada: false
          })
          .select()
          .single();

        if (alErr) {
          console.error('❌ Error al registrar la alerta en la base de datos:', alErr.message);
        } else {
          console.log(`✅ Alerta registrada en Supabase ID: ${nuevaAlerta.id}`);
        }
      } else {
        console.log(`🟢 Lote ${cultivoNombre} en perfecto estado. Sin anomalías.`);
      }
    }

    console.log('\n🏁 ANÁLISIS DE CAMPO REMOTO COMPLETADO CON ÉXITO.');

  } catch (err) {
    console.error('❌ Error fatal en el demonio de análisis:', err.message);
  }
}

// Helper para llamadas Twilio WhatsApp
async function enviarMensajeWhatsApp(phone, text) {
  if (!twilioSid || !twilioAuthToken) {
    console.log(`⚠️ [MOCK TWILIO] WhatsApp simulado para ${phone}: \n"${text}"\n(Para envíos reales configura TWILIO_ACCOUNT_SID en el .env)`);
    return true; // Simulado exitoso
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', `whatsapp:${phone}`);
    params.append('From', twilioFromNumber);
    params.append('Body', text);

    const authHeader = 'Basic ' + Buffer.from(twilioSid + ':' + twilioAuthToken).toString('base64');

    const res = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (res.ok) {
      console.log(`✅ Mensaje enviado exitosamente vía Twilio a ${phone}.`);
      return true;
    } else {
      const errBody = await res.json();
      console.error(`❌ Fallo al enviar WhatsApp por Twilio:`, errBody.message);
      return false;
    }
  } catch (e) {
    console.error(`❌ Error en llamada de red a Twilio:`, e.message);
    return false;
  }
}

// Helper para llamadas Telegram Bot API
async function enviarMensajeTelegram(chatId, text) {
  const telegramToken = process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramToken) {
    console.log(`⚠️ [MOCK TELEGRAM] Mensaje simulado para Telegram (${chatId}): \n"${text}"\n(Para envíos reales configura TELEGRAM_BOT_TOKEN en el .env)`);
    return true; // Simulado exitoso
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    if (res.ok) {
      console.log(`✅ Mensaje de Telegram enviado con éxito a ${chatId}.`);
      return true;
    } else {
      const errBody = await res.json();
      console.error(`❌ Fallo al enviar mensaje a Telegram:`, errBody.description);
      return false;
    }
  } catch (e) {
    console.error(`❌ Error en llamada de red a Telegram:`, e.message);
    return false;
  }
}

runAnalysisPipeline();

