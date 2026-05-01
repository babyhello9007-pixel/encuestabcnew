-- Crear tabla comentarios_resultados
CREATE TABLE IF NOT EXISTS public.comentarios_resultados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying(255) NULL,
  texto text NOT NULL,
  tab character varying(50) NOT NULL,
  likes integer NULL DEFAULT 0,
  estado character varying(50) NULL DEFAULT 'aprobado'::character varying,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT comentarios_resultados_pkey PRIMARY KEY (id),
  CONSTRAINT comentarios_resultados_estado_check CHECK (
    (estado)::text = ANY (
      ARRAY['pendiente'::character varying, 'aprobado'::character varying, 'rechazado'::character varying]::text[]
    )
  ),
  CONSTRAINT comentarios_resultados_tab_check CHECK (
    (tab)::text = ANY (
      ARRAY['general'::character varying, 'youth'::character varying, 'preguntas-varias'::character varying, 'ccaa'::character varying, 'encuestadoras-externas'::character varying, 'simulador-electoral'::character varying, 'provincias'::character varying, 'lideres-partidos'::character varying]::text[]
    )
  )
) TABLESPACE pg_default;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_comentarios_tab ON public.comentarios_resultados USING btree (tab) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_comentarios_estado ON public.comentarios_resultados USING btree (estado) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios_resultados USING btree (created_at DESC) TABLESPACE pg_default;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.comentarios_resultados ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (todos pueden leer comentarios aprobados)
CREATE POLICY "comentarios_select_policy" ON public.comentarios_resultados
  FOR SELECT USING (estado = 'aprobado'::character varying);

-- Política para INSERT (todos pueden insertar)
CREATE POLICY "comentarios_insert_policy" ON public.comentarios_resultados
  FOR INSERT WITH CHECK (true);

-- Política para UPDATE (solo propietario puede actualizar)
CREATE POLICY "comentarios_update_policy" ON public.comentarios_resultados
  FOR UPDATE USING (auth.uid()::text = nombre OR nombre IS NULL)
  WITH CHECK (auth.uid()::text = nombre OR nombre IS NULL);
