import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzOTExMSwiZXhwIjoyMDc2OTE1MTExfQ.xQKvvPrjCEYZNBjlEAzpGFHNEqHEKXGCnLPqFIHhZjk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const encuestadoras = [
  {
    nombre: 'Centro de Investigaciones Sociológicas',
    sigla: 'CIS',
    pais: 'España',
    sitio_web: 'https://www.cis.es',
    logo_url: 'https://www.cis.es/cis/export/sites/default/galerias/ficheros/logo-cis.png',
    credibilidad: 95,
  },
  {
    nombre: 'Metroscopia',
    sigla: 'Metroscopia',
    pais: 'España',
    sitio_web: 'https://www.metroscopia.org',
    logo_url: 'https://www.metroscopia.org/images/logo-metroscopia.png',
    credibilidad: 88,
  },
  {
    nombre: 'GAD3',
    sigla: 'GAD3',
    pais: 'España',
    sitio_web: 'https://www.gad3.com',
    logo_url: 'https://www.gad3.com/images/logo-gad3.png',
    credibilidad: 82,
  },
  {
    nombre: 'Sigma Dos',
    sigla: 'Sigma Dos',
    pais: 'España',
    sitio_web: 'https://www.sigmados.es',
    logo_url: 'https://www.sigmados.es/images/logo-sigmados.png',
    credibilidad: 85,
  },
  {
    nombre: 'DYM',
    sigla: 'DYM',
    pais: 'España',
    sitio_web: 'https://www.dym.es',
    logo_url: 'https://www.dym.es/images/logo-dym.png',
    credibilidad: 78,
  },
  {
    nombre: 'Celeste-Tel',
    sigla: 'Celeste-Tel',
    pais: 'España',
    sitio_web: 'https://www.celestetel.com',
    logo_url: 'https://www.celestetel.com/images/logo-celestetel.png',
    credibilidad: 75,
  },
  {
    nombre: 'Invymark',
    sigla: 'Invymark',
    pais: 'España',
    sitio_web: 'https://www.invymark.com',
    logo_url: 'https://www.invymark.com/images/logo-invymark.png',
    credibilidad: 72,
  },
  {
    nombre: 'Electomania',
    sigla: 'Electomania',
    pais: 'España',
    sitio_web: 'https://www.electomania.es',
    logo_url: 'https://www.electomania.es/images/logo-electomania.png',
    credibilidad: 70,
  },
  {
    nombre: 'Sondea',
    sigla: 'Sondea',
    pais: 'España',
    sitio_web: 'https://www.sondea.es',
    logo_url: 'https://www.sondea.es/images/logo-sondea.png',
    credibilidad: 68,
  },
  {
    nombre: 'Iop Consulting',
    sigla: 'IOP',
    pais: 'España',
    sitio_web: 'https://www.iopconsulting.com',
    logo_url: 'https://www.iopconsulting.com/images/logo-iop.png',
    credibilidad: 65,
  },
  {
    nombre: 'La Encuesta de Batalla Cultural',
    sigla: 'BC',
    pais: 'España',
    sitio_web: 'https://encuestabc.manus.space',
    logo_url: 'https://encuestabc.manus.space/logo-bc.svg',
    credibilidad: 100,
  },
];

async function populate() {
  try {
    console.log('Poblando tabla encuestadoras...');
    
    // Insertar encuestadoras
    const { data, error } = await supabase
      .from('encuestadoras')
      .upsert(encuestadoras, { onConflict: 'nombre' });
    
    if (error) {
      console.error('Error al insertar encuestadoras:', error);
      process.exit(1);
    }
    
    console.log(`✓ ${encuestadoras.length} encuestadoras insertadas/actualizadas`);
    
    // Verificar que se insertaron
    const { data: verificacion, error: errorVerif } = await supabase
      .from('encuestadoras')
      .select('id, nombre, sigla, credibilidad, logo_url')
      .order('credibilidad', { ascending: false });
    
    if (errorVerif) {
      console.error('Error al verificar:', errorVerif);
      process.exit(1);
    }
    
    console.log('\n✓ Encuestadoras en la base de datos:');
    verificacion?.forEach((e) => {
      console.log(`  - ${e.nombre} (${e.sigla}) - Credibilidad: ${e.credibilidad}%`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populate();
