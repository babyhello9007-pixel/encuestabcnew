-- ============================================================================
-- SCRIPT: Poblar tabla encuestadoras con datos reales de España
-- ============================================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM public.encuestadoras;

-- Insertar encuestadoras españolas reales
INSERT INTO public.encuestadoras (nombre, sigla, pais, sitio_web, logo_url, credibilidad)
VALUES
  (
    'Centro de Investigaciones Sociológicas',
    'CIS',
    'España',
    'https://www.cis.es',
    'https://www.cis.es/cis/export/sites/default/galerias/ficheros/logo-cis.png',
    95
  ),
  (
    'Metroscopia',
    'Metroscopia',
    'España',
    'https://www.metroscopia.org',
    'https://www.metroscopia.org/images/logo-metroscopia.png',
    88
  ),
  (
    'GAD3',
    'GAD3',
    'España',
    'https://www.gad3.com',
    'https://www.gad3.com/images/logo-gad3.png',
    82
  ),
  (
    'Sigma Dos',
    'Sigma Dos',
    'España',
    'https://www.sigmados.es',
    'https://www.sigmados.es/images/logo-sigmados.png',
    85
  ),
  (
    'DYM',
    'DYM',
    'España',
    'https://www.dym.es',
    'https://www.dym.es/images/logo-dym.png',
    78
  ),
  (
    'Celeste-Tel',
    'Celeste-Tel',
    'España',
    'https://www.celestetel.com',
    'https://www.celestetel.com/images/logo-celestetel.png',
    75
  ),
  (
    'Invymark',
    'Invymark',
    'España',
    'https://www.invymark.com',
    'https://www.invymark.com/images/logo-invymark.png',
    72
  ),
  (
    'Electomania',
    'Electomania',
    'España',
    'https://www.electomania.es',
    'https://www.electomania.es/images/logo-electomania.png',
    70
  ),
  (
    'Sondea',
    'Sondea',
    'España',
    'https://www.sondea.es',
    'https://www.sondea.es/images/logo-sondea.png',
    68
  ),
  (
    'Iop Consulting',
    'IOP',
    'España',
    'https://www.iopconsulting.com',
    'https://www.iopconsulting.com/images/logo-iop.png',
    65
  ),
  (
    'La Encuesta de Batalla Cultural',
    'BC',
    'España',
    'https://encuestabc.manus.space',
    'https://encuestabc.manus.space/logo-bc.svg',
    100
  )
ON CONFLICT (nombre) DO UPDATE SET
  sigla = EXCLUDED.sigla,
  pais = EXCLUDED.pais,
  sitio_web = EXCLUDED.sitio_web,
  logo_url = EXCLUDED.logo_url,
  credibilidad = EXCLUDED.credibilidad,
  updated_at = NOW();

-- Verificar que se insertaron correctamente
SELECT id, nombre, sigla, credibilidad, logo_url FROM public.encuestadoras ORDER BY credibilidad DESC;
