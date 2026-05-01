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

insert into public.elecciones_historicas (año, tipo, partido, porcentaje, escanos, votos) values
(2023, 'generales', 'PP',    33.05, 137, 8091840),
(2023, 'generales', 'PSOE',  31.70, 122, 7760970),
(2023, 'generales', 'VOX',   12.39,  33, 3033744),
(2023, 'generales', 'Sumar', 12.31,  31, 3014006),
(2023, 'generales', 'Junts',  1.63,   7,  392634),
(2023, 'generales', 'ERC',    1.68,   7,  462883),
(2023, 'generales', 'Bildu',  1.44,   6,  333362),
(2023, 'generales', 'PNV',    1.38,   5,  275782),
(2019, 'generales', 'PSOE',  28.00, 120, 6792199),
(2019, 'generales', 'PP',    20.82,  89, 5047040),
(2019, 'generales', 'VOX',   15.09,  52, 3656979),
(2019, 'generales', 'Unidas Podemos', 12.84, 35, 3120222),
(2019, 'generales', 'Ciudadanos', 6.77, 10, 1650318),
(2019, 'generales', 'ERC',   3.60,  13,  869116),
(2019, 'generales', 'JxCat', 1.86,   8,  450297),
(2016, 'generales', 'PP',    33.01, 137, 7906185),
(2016, 'generales', 'PSOE',  22.66,  85, 5443846),
(2016, 'generales', 'Unidos Podemos', 21.15, 71, 5087538),
(2016, 'generales', 'Ciudadanos', 13.05, 32, 3141570),
(2016, 'generales', 'ERC',   2.64,   9,  632234),
(2016, 'generales', 'PDC',   2.01,   8,  483488),
(2015, 'generales', 'PP',    28.72, 123, 7215530),
(2015, 'generales', 'PSOE',  22.01,  90, 5530528),
(2015, 'generales', 'Podemos', 20.68, 69, 5189333),
(2015, 'generales', 'Ciudadanos', 13.93, 40, 3498200),
(2015, 'generales', 'ERC',   2.39,   9,  599289)
on conflict do nothing;

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

create or replace view public.top_region_por_partido as
with ranked as (
  select
    partido,
    provincia,
    votos,
    row_number() over (partition by partido order by votos desc, provincia asc) as rn
  from public.votos_por_provincia_view
)
select
  partido,
  provincia as region_top,
  votos as votos_region_top
from ranked
where rn = 1
order by votos_region_top desc, partido asc;

create or replace view public.top_lider_por_partido as
with ranked as (
  select
    partido,
    lider_preferido,
    total_votos,
    porcentaje,
    row_number() over (partition by partido order by total_votos desc, lider_preferido asc) as rn
  from public.ranking_lideres_por_partido
)
select
  partido,
  lider_preferido as lider_top,
  total_votos as votos_lider_top,
  porcentaje as porcentaje_lider_top
from ranked
where rn = 1
order by votos_lider_top desc, partido asc;

create table if not exists public.noche_electoral_directo (
  id bigserial primary key,
  election_date date not null,
  region_name text not null,
  region_flag_url text,
  estimate_bc numeric(5,2) not null default 0,
  final_result numeric(5,2),
  close_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists noche_electoral_directo_close_idx on public.noche_electoral_directo(close_at);
<<<<<<< codex/fix-synchronization-issues-in-leaders-by-party-ft0j1g

create table if not exists public.electionsdirect (
  id bigserial primary key,
  election_date date not null,
  region_name text not null,
  region_flag_url text,
  close_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.electiondirect_results (
  id bigserial primary key,
  election_id bigint not null references public.electionsdirect(id) on delete cascade,
  party_id bigint not null references public.party_configuration(id) on delete restrict,
  porcentaje_voto numeric(5,2) not null default 0,
  escanos integer,
  is_projection boolean not null default true,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint electiondirect_results_unique unique (election_id, party_id)
);

alter table public.electiondirect_results add column if not exists proyected_escaños numeric;
alter table public.electiondirect_results add column if not exists proyected_porcentaje numeric;
alter table public.electiondirect_results add column if not exists "Candidato" text;

create index if not exists idx_electiondirect_results_election on public.electiondirect_results(election_id);
create index if not exists idx_electiondirect_results_party on public.electiondirect_results(party_id);

create or replace view public.noche_electoral_directo as
select
  e.id,
  e.election_date,
  e.region_name,
  e.region_flag_url,
  e.close_at,
  coalesce(sum(case when r.is_projection then r.porcentaje_voto else 0 end), 0)::numeric(5,2) as estimate_bc,
  nullif(sum(case when r.is_final then r.porcentaje_voto else 0 end), 0)::numeric(5,2) as final_result
from public.electionsdirect e
left join public.electiondirect_results r on r.election_id = e.id
group by e.id, e.election_date, e.region_name, e.region_flag_url, e.close_at;
=======
>>>>>>> main
