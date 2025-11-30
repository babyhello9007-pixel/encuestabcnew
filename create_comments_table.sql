-- Crear tabla de comentarios si no existe
CREATE TABLE IF NOT EXISTS comentarios_resultados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255),
  texto TEXT NOT NULL,
  tab VARCHAR(50) NOT NULL CHECK (tab IN ('general', 'youth')),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para mejorar las búsquedas por tab
CREATE INDEX IF NOT EXISTS idx_comentarios_tab ON comentarios_resultados(tab);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios_resultados(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE comentarios_resultados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read" ON comentarios_resultados
  FOR SELECT USING (true);

-- Política para permitir inserción pública
CREATE POLICY "Allow public insert" ON comentarios_resultados
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualización de likes
CREATE POLICY "Allow public update likes" ON comentarios_resultados
  FOR UPDATE USING (true) WITH CHECK (true);
