create table if not exists public.votos_historico (
  id           bigserial primary key,
  partido      text not null,
  votos        integer not null default 0,
  porcentaje   numeric(5,2) not null default 0,
  tipo         text not null default 'general',
  snapshot_at  timestamptz not null default now()
);

create index if not exists votos_historico_partido_idx on public.votos_historico(partido, tipo, snapshot_at);

create or replace view public.votos_historico_resumen as
select
  partido,
  tipo,
  snapshot_at,
  votos,
  porcentaje,
  lag(votos) over (partition by partido, tipo order by snapshot_at) as votos_anterior,
  votos - lag(votos) over (partition by partido, tipo order by snapshot_at) as variacion_votos
from public.votos_historico
order by partido, tipo, snapshot_at;

create or replace view public.correlacion_voto_valoracion as
select
  voto_generales                          as partido,
  count(*)                                as total,
  round(avg(val_feijoo)::numeric, 2)      as avg_feijoo,
  round(avg(val_sanchez)::numeric, 2)     as avg_sanchez,
  round(avg(val_abascal)::numeric, 2)     as avg_abascal,
  round(avg(val_alvise)::numeric, 2)      as avg_alvise,
  round(avg(val_yolanda_diaz)::numeric,2) as avg_yolanda,
  round(avg(val_irene_montero)::numeric,2)as avg_irene,
  round(avg(val_ayuso)::numeric, 2)       as avg_ayuso,
  round(avg(val_buxade)::numeric, 2)      as avg_buxade
from public.respuestas
where voto_generales is not null
group by voto_generales
order by total desc;

create or replace view public.coherencia_voto_lider as
select
  voto_generales as partido_votado,
  count(*) as total_votantes,
  sum(case when voto_generales = 'PP' and val_sanchez >= 7 then 1 else 0 end) as pp_valora_sanchez,
  sum(case when voto_generales = 'PSOE' and val_feijoo >= 7 then 1 else 0 end) as psoe_valora_feijoo,
  sum(case when voto_generales = 'VOX' and val_sanchez >= 7 then 1 else 0 end) as vox_valora_sanchez,
  sum(case when voto_generales = 'PSOE' and val_abascal >= 7 then 1 else 0 end) as psoe_valora_abascal
from public.respuestas
where voto_generales is not null
group by voto_generales
order by total_votantes desc;

create or replace view public.ideologia_por_partido as
select
  voto_generales as partido,
  count(*) as total,
  round(avg(posicion_ideologica)::numeric, 2) as ideologia_media,
  round(min(posicion_ideologica)::numeric, 2) as ideologia_min,
  round(max(posicion_ideologica)::numeric, 2) as ideologia_max,
  round(stddev(posicion_ideologica)::numeric, 2) as ideologia_stddev
from public.respuestas
where voto_generales is not null
  and posicion_ideologica is not null
group by voto_generales
order by ideologia_media;

create or replace view public.flujos_voto as
select
  voto_generales  as origen,
  voto_autonomicas as destino,
  count(*)         as cantidad
from public.respuestas
where voto_generales is not null
  and voto_autonomicas is not null
group by voto_generales, voto_autonomicas
order by cantidad desc;

create or replace view public.demografico_por_partido as
select
  voto_generales as partido,
  count(*) as total,
  round(avg(edad)::numeric, 1) as edad_media,
  round(avg(posicion_ideologica)::numeric, 2) as ideologia_media,
  sum(case when edad < 25 then 1 else 0 end) as menores_25,
  sum(case when edad between 25 and 34 then 1 else 0 end) as entre_25_34,
  sum(case when edad between 35 and 44 then 1 else 0 end) as entre_35_44,
  sum(case when edad between 45 and 54 then 1 else 0 end) as entre_45_54,
  sum(case when edad >= 55 then 1 else 0 end) as mayores_55
from public.respuestas
where voto_generales is not null
group by voto_generales
order by total desc;

create table if not exists public.elecciones_historicas (
  id            bigserial primary key,
  año           integer not null,
  tipo          text not null default 'generales',
  partido       text not null,
  porcentaje    numeric(5,2),
  escanos       integer,
  votos         bigint,
  created_at    timestamptz not null default now()
);

create or replace function public.guardar_snapshot_votos()
returns void language plpgsql as $$
declare
  total_gen integer;
begin
  select count(*) into total_gen from public.respuestas;
  if total_gen = 0 then return; end if;

  insert into public.votos_historico (partido, votos, porcentaje, tipo, snapshot_at)
  select
    voto_generales as partido,
    count(*) as votos,
    round(count(*)::numeric * 100.0 / total_gen, 2) as porcentaje,
    'general' as tipo,
    now() as snapshot_at
  from public.respuestas
  where voto_generales is not null
  group by voto_generales;
end;
$$;

create or replace view public.ranking_lideres_por_partido as
select
  partido,
  lider_preferido,
  count(*) as total_votos,
  round(
    count(*)::numeric * 100.0 / sum(count(*)) over (partition by partido),
    2
  ) as porcentaje
from public.lideres_preferidos
group by partido, lider_preferido
order by partido, count(*) desc;
