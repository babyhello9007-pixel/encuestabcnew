-- Vista para ranking de líderes por partido
create view public.ranking_lideres_por_partido as
select
  partido,
  lider_preferido,
  count(*) as total_votos,
  round(
    count(*)::numeric * 100.0 / sum(count(*)) over (
      partition by
        partido
    ),
    2
  ) as porcentaje
from
  lideres_preferidos
group by
  partido,
  lider_preferido
order by
  partido,
  (count(*)) desc;

-- Dar permisos de lectura pública a la vista
grant select on public.ranking_lideres_por_partido to anon, authenticated;
