-- Vista opcional para acelerar el desglose político de Preguntas Varias.
-- La interfaz agrega directamente las respuestas reales si esta vista no existe,
-- si está vacía o si el usuario activa filtros por edad o comunidad autónoma.
-- Ejecutar este archivo en el SQL Editor de Supabase y mantener los GRANT finales.

create or replace view public.preguntas_varias_party_breakdown as
with respuestas_normalizadas as (
  select
    trim(voto_generales) as party_vote,
    trim(monarquia_republica) as monarquia_republica,
    trim(division_territorial) as division_territorial,
    trim(sistema_pensiones) as sistema_pensiones
  from public.respuestas
  where nullif(trim(voto_generales), '') is not null
), opciones as (
  select 'monarquia_republica'::text as question_key, monarquia_republica as option_value, party_vote from respuestas_normalizadas
  union all
  select 'division_territorial'::text, division_territorial, party_vote from respuestas_normalizadas
  union all
  select 'sistema_pensiones'::text, sistema_pensiones, party_vote from respuestas_normalizadas
)
select
  question_key,
  option_value,
  party_vote,
  count(*)::bigint as votes_count
from opciones
where nullif(option_value, '') is not null
group by question_key, option_value, party_vote;

grant select on public.preguntas_varias_party_breakdown to anon, authenticated;
