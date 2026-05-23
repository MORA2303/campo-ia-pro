import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apxwgnwjybieoegsaxqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHdnbndqeWJpZW9lZ3NheHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzU4NjYsImV4cCI6MjA5MzcxMTg2Nn0.xKHPu2YKm_JSom4zWXWfozdGAlMs9Acxf1ygb0pPeQw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("Testeando conexión con Supabase...");
  const { data, error } = await supabase.from('usuarios_productor').select('*').limit(1);
  if (error) {
    console.error("Error al consultar 'usuarios_productor':", error.message, error.code);
  } else {
    console.log("La tabla 'usuarios_productor' EXISTE. Datos:", data);
  }
}

testConnection();
