import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const alertasMockDef = [
  { tipo: "ndvi", descripcion: "Caída severa de vigor en sector norte durante floración.", estado: "Activa" },
  { tipo: "ndwi", descripcion: "NDWI por debajo del umbral en zona central del lote.", estado: "Activa" },
  { tipo: "ndvi", descripcion: "Leve descenso de vigor respecto a la media histórica.", estado: "Activa" },
  { tipo: "mndwi", descripcion: "Anegamiento parcial detectado tras lluvias intensas.", estado: "Resuelta" },
  { tipo: "ndvi", descripcion: "Pequeña caída puntual en borde sur.", estado: "Resuelta" }
];

async function seedAlertas() {
  console.log("Iniciando seeder de alertas...");

  // Obtener lotes actuales
  const { data: lotes, error: lErr } = await supabase.from('lotes').select('id, id_cultivos');
  if (lErr || !lotes || lotes.length === 0) {
    return console.error("Error al obtener lotes o no hay lotes:", lErr);
  }

  for (const lote of lotes) {
    // Generar 1 a 3 alertas aleatorias por lote
    const numAlertas = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numAlertas; i++) {
      const mock = alertasMockDef[Math.floor(Math.random() * alertasMockDef.length)];
      
      const { error: aErr } = await supabase.from('alertas').insert({
        lote_id: lote.id,
        indice: mock.tipo,
        id_condicion_cultivo: lote.id_cultivos,
        zona_afectada: mock.descripcion,
        wapp_enviado: true,
        revisada: mock.estado === "Resuelta"
      });
      
      if (aErr) console.error("Error insertando alerta:", aErr);
    }
    console.log(`Alertas insertadas para el lote ${lote.id}`);
  }

  console.log("Seeding de alertas completado con éxito!");
}

seedAlertas();
