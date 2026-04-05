-- Party leaders table for "Líderes de Partidos" admin + results UI
create table if not exists public.party_leaders (
  id bigserial primary key,
  party_key character varying(100) not null,
  leader_name character varying(255) not null,
  photo_url text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint party_leaders_party_key_fkey
    foreign key (party_key)
    references public.party_configuration(party_key)
    on update cascade
    on delete cascade
);

create index if not exists idx_party_leaders_party_key on public.party_leaders(party_key);
create index if not exists idx_party_leaders_active on public.party_leaders(is_active);
create index if not exists idx_party_leaders_updated on public.party_leaders(updated_at desc);

create or replace function public.set_party_leaders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_party_leaders_updated_at on public.party_leaders;
create trigger trg_party_leaders_updated_at
before update on public.party_leaders
for each row
execute function public.set_party_leaders_updated_at();
