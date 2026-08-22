-- Esquema no destructivo para el Contexto Histórico de Resultados.
-- No inserta datos de ejemplo: la serie solo mostrará elecciones que cargues tú.

create table if not exists public.elecciones_historicas (
  id bigint generated always as identity primary key,
  año integer not null unique,
  pp integer not null default 0,
  psoe integer not null default 0,
  vox integer not null default 0,
  sumar integer not null default 0,
  podemos integer not null default 0,
  ciudadanos integer not null default 0,
  erc integer not null default 0,
  junts integer not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Vista de consulta estable para auditoría o futuros usos SQL.
create or replace view public.contexto_historico_escanos as
select año, pp, psoe, vox, sumar, podemos, ciudadanos, erc, junts
from public.elecciones_historicas
order by año asc;

grant select on public.elecciones_historicas to anon, authenticated;
grant select on public.contexto_historico_escanos to anon, authenticated;
