-- Corrige el trigger function que está rompiendo inserts en respuestas
-- Error observado: DELETE requires a WHERE clause

create or replace function public.check_and_delete_respuesta()
returns trigger
language plpgsql
as $$
begin
  -- Mantener la fila por defecto.
  -- Si necesitas reglas de veto/prohibidos, aplica siempre filtros con WHERE por NEW.id.
  return new;
end;
$$;
