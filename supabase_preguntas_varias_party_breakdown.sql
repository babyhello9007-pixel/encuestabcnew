-- Breakdown de "Preguntas Varias" por voto político (voto_generales / voto_asociacion_juvenil)
-- Ejecutar en Supabase SQL Editor

create table if not exists public.preguntas_varias_party_breakdown_cache (
  question_key text not null,
  option_value text not null,
  party_vote text not null,
  votes_count integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint preguntas_varias_breakdown_pkey primary key (question_key, option_value, party_vote)
);

create index if not exists idx_preguntas_breakdown_question
  on public.preguntas_varias_party_breakdown_cache(question_key);

create index if not exists idx_preguntas_breakdown_option
  on public.preguntas_varias_party_breakdown_cache(option_value);

create index if not exists idx_preguntas_breakdown_votes_desc
  on public.preguntas_varias_party_breakdown_cache(votes_count desc);

create or replace function public.refresh_preguntas_varias_party_breakdown_cache()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.preguntas_varias_party_breakdown_cache;

  insert into public.preguntas_varias_party_breakdown_cache (question_key, option_value, party_vote, votes_count, updated_at)
  select
    q.question_key,
    q.option_value,
    q.party_vote,
    count(*)::integer as votes_count,
    now() as updated_at
  from (
    select
      'monarquia_republica'::text as question_key,
      trim(coalesce(r.monarquia_republica, '')) as option_value,
      trim(coalesce(nullif(r.voto_generales, ''), nullif(r.voto_asociacion_juvenil, ''), 'SIN_PARTIDO')) as party_vote
    from public.respuestas r
    union all
    select
      'division_territorial'::text as question_key,
      trim(coalesce(r.division_territorial, '')) as option_value,
      trim(coalesce(nullif(r.voto_generales, ''), nullif(r.voto_asociacion_juvenil, ''), 'SIN_PARTIDO')) as party_vote
    from public.respuestas r
    union all
    select
      'sistema_pensiones'::text as question_key,
      trim(coalesce(r.sistema_pensiones, '')) as option_value,
      trim(coalesce(nullif(r.voto_generales, ''), nullif(r.voto_asociacion_juvenil, ''), 'SIN_PARTIDO')) as party_vote
    from public.respuestas r
  ) q
  where q.option_value <> ''
  group by q.question_key, q.option_value, q.party_vote;
end;
$$;

create or replace function public.trg_refresh_preguntas_varias_party_breakdown()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.refresh_preguntas_varias_party_breakdown_cache();
  return null;
end;
$$;

drop trigger if exists trg_refresh_preguntas_varias_party_breakdown on public.respuestas;
create trigger trg_refresh_preguntas_varias_party_breakdown
after insert or update or delete on public.respuestas
for each statement
execute function public.trg_refresh_preguntas_varias_party_breakdown();

create or replace view public.preguntas_varias_party_breakdown as
select
  question_key,
  option_value,
  party_vote,
  votes_count,
  updated_at
from public.preguntas_varias_party_breakdown_cache;

-- Primera carga manual
select public.refresh_preguntas_varias_party_breakdown_cache();
