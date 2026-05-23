import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const polygonAround = (lat, lng, size = 0.04) => [
  [lng - size, lat + size],
  [lng + size, lat + size],
  [lng + size * 0.7, lat - size],
  [lng - size * 1.1, lat - size * 0.8],
  [lng - size, lat + size], // Cerrar el polígono
];

const lotesMock = [
  { nombre: "La Esperanza", cultivo: "soja", etapa: "Floración R2", superficie: 320, ndvi: 0.42, center: [-34.6, -60.5], polygon: polygonAround(-34.6, -60.5, 0.05) },
  { nombre: "El Trébol", cultivo: "maiz", etapa: "V8", superficie: 180, ndvi: 0.61, center: [-34.8, -60.2], polygon: polygonAround(-34.8, -60.2, 0.035) },
  { nombre: "San Jorge", cultivo: "trigo", etapa: "Encañazón", superficie: 95, ndvi: 0.55, center: [-35.0, -60.8], polygon: polygonAround(-35.0, -60.8, 0.025) },
  { nombre: "Don Ángel", cultivo: "soja", etapa: "V6", superficie: 410, ndvi: 0.74, center: [-34.4, -61.0], polygon: polygonAround(-34.4, -61.0, 0.06) },
  { nombre: "La Paloma", cultivo: "maiz", etapa: "V12", superficie: 230, ndvi: 0.79, center: [-35.2, -60.4], polygon: polygonAround(-35.2, -60.4, 0.04) },
];

async function seed() {
  console.log("Iniciando seeder...");

  // 1. Insertar productor
  const { data: productor, error: pErr } = await supabase.from('usuarios_productor').insert({
    nombre: "Juan",
    apellido: "Pérez",
    whatsapp: "+5491155551234",
    mail: "juan.perez@ejemplo.com"
  }).select().single();
  
  if (pErr) return console.error("Error Productor:", pErr);
  console.log("Productor creado:", productor.id);

  // 2. Insertar campo
  const { data: campo, error: cErr } = await supabase.from('campos').insert({
    partido: "Pergamino",
    provincia: "Buenos Aires",
    id_usuarios: productor.id,
    superficie: 1235,
    activo: true
  }).select().single();

  if (cErr) return console.error("Error Campo:", cErr);
  console.log("Campo creado:", campo.id);

  // 3. Insertar lotes y cultivos
  const lotesIds = [];
  for (const loteMock of lotesMock) {
    // GeoJSON polygon
    const geojson = {
      type: "Polygon",
      coordinates: [loteMock.polygon],
      crs: { type: "name", properties: { name: "EPSG:4326" } }
    };

    const { data: lote, error: lErr } = await supabase.from('lotes').insert({
      id_campo: campo.id,
      ultimo_ndvi: loteMock.ndvi,
      poligono: geojson,
      superficie: loteMock.superficie,
      activo: true
    }).select().single();

    if (lErr) return console.error("Error Lote:", lErr);
    lotesIds.push(lote.id);

    // Insertar cultivo activo
    const { data: cultivo, error: cultErr } = await supabase.from('cultivos').insert({
      nombre: loteMock.nombre, // mock usa el nombre de lote, lo ponemos en cultivo
      id_campo: campo.id,
      tipo: loteMock.cultivo,
      campaña: "2024/25"
    }).select().single();

    if (cultErr) return console.error("Error Cultivo:", cultErr);

    // Vincular cultivo al lote
    await supabase.from('lotes').update({ id_cultivos: cultivo.id }).eq('id', lote.id);
    
    console.log(`Lote ${loteMock.nombre} insertado.`);
  }

  // Update campo with lotes
  await supabase.from('campos').update({ id_lotes: lotesIds }).eq('id', campo.id);
  console.log("Seeding completado con éxito!");
}

seed();
