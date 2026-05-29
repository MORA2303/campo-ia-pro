import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpcs() {
  console.log("🔍 Diagnosticando funciones RPC en Supabase...\n");

  const rpcs = [
    { name: 'alertas_activas_usuario', params: {} },
    { name: 'alertas_activas_asesor', params: {} },
    { name: 'estado_ndvi_lotes', params: {} },
    { name: 'historial_alertas', params: {} }
  ];

  for (const rpc of rpcs) {
    try {
      console.log(`📡 Llamando a RPC: '${rpc.name}'...`);
      const { data, error } = await supabase.rpc(rpc.name, rpc.params);
      if (error) {
        console.error(`❌ RPC '${rpc.name}' falló con error:`, error.message, `(Código: ${error.code})`);
      } else {
        console.log(`✅ RPC '${rpc.name}' respondió correctamente. Registros devueltos: ${data ? data.length : 0}`);
      }
    } catch (e) {
      console.error(`💥 Excepción llamando a RPC '${rpc.name}':`, e.message);
    }
  }
}

testRpcs();
