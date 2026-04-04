-- Sincronización de configuración visual de partidos para AdminParties/Results.
-- Ejecutar en Supabase SQL Editor.

BEGIN;

CREATE TABLE IF NOT EXISTS public.party_configuration (
  id BIGSERIAL PRIMARY KEY,
  party_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url TEXT NOT NULL,
  party_type TEXT NOT NULL CHECK (party_type IN ('general', 'youth')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by INTEGER,
  updated_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_party_configuration_type ON public.party_configuration (party_type);
CREATE INDEX IF NOT EXISTS idx_party_configuration_active ON public.party_configuration (is_active);

CREATE OR REPLACE FUNCTION public.set_party_configuration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_party_configuration_updated_at ON public.party_configuration;
CREATE TRIGGER trg_party_configuration_updated_at
BEFORE UPDATE ON public.party_configuration
FOR EACH ROW
EXECUTE FUNCTION public.set_party_configuration_updated_at();

INSERT INTO public.party_configuration (party_key, display_name, color, logo_url, party_type, is_active)
VALUES
  ('PP', 'PP', '#0066FF', '/assets/icons/PP.png', 'general', true),
  ('PSOE', 'PSOE', '#E81B23', '/assets/icons/PSOE.png', 'general', true),
  ('VOX', 'VOX', '#2ECC71', '/assets/icons/VOX.png', 'general', true),
  ('SUMAR', 'SUMAR', '#9B2D96', '/assets/icons/SUMAR.png', 'general', true),
  ('PODEMOS', 'PODEMOS', '#7B3FF2', '/assets/icons/PODEMOS.png', 'general', true),
  ('JUNTS', 'JUNTS', '#003F9F', '/assets/icons/JUNTS.png', 'general', true),
  ('ERC', 'ERC', '#FFC400', '/assets/icons/ERCNew.png', 'general', true),
  ('PNV', 'PNV', '#00B050', '/assets/icons/PNV.png', 'general', true),
  ('ALIANZA', 'Aliança Catalana', '#003D99', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LSGJuMLqKLfIuSBC.png', 'general', true),
  ('BILDU', 'BILDU', '#00AA44', '/assets/icons/ehbildu.png', 'general', true),
  ('SAF', 'Se Acabó La Fiesta', '#FF6600', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/pVOVNQaSxYeSVYyR.png', 'general', true),
  ('CC', 'Coalición Canaria', '#FFCC00', '/assets/icons/coalicióncanaria.png', 'general', true),
  ('UPN', 'UPN', '#0066FF', '/assets/icons/UPNNew.png', 'general', true),
  ('CIUDADANOS', 'Ciudadanos', '#FF9900', '/assets/icons/ciudadanos.png', 'general', true),
  ('PLIB', 'P-Lib', '#FFD700', '/assets/icons/P-Lib.jpg', 'general', true),
  ('EB', 'Escaños en Blanco', '#999999', '/assets/icons/EscañosEnBlancoNEW.png', 'general', true),
  ('BNG', 'BNG', '#003D99', '/assets/icons/bng.png', 'general', true),
  ('FO', 'Frente Obrero', '#CC0000', '/assets/icons/FrenteObrero.png', 'general', true),
  ('CJ', 'Caminando Juntos', '#0066FF', '/assets/icons/CaminandoJuntos.png', 'general', true),
  ('FALANGE', 'Falange', '#FF0000', '/assets/icons/FALANGENEW.webp', 'general', true),
  ('IE', 'Izquierda Española', '#CC0000', '/assets/icons/IzquierdaEspañolaNEW.png', 'general', true),
  ('COMPROMIS', 'Compromís', '#FF9900', '/assets/logos/compromis-logo.png', 'general', true),
  ('DO', 'Democracia Ourensana', '#FFD700', '/assets/logos/democracia-ourensana-logo.png', 'general', true),
  ('AA', 'Adelante Andalucía', '#FF0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/tTkePaUFEpyBEbYg.png', 'general', true),
  ('CUP', 'CUP', '#FFC400', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/qlFqJHJrlRttAYmH.png', 'general', true),
  ('PACMA', 'PACMA', '#00AA44', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/hDwYeFmKiKHHhgZI.png', 'general', true),
  ('PCTE', 'PCTE', '#CC0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/OxYlERpqIvuYLNIC.png', 'general', true),
  ('UPL', 'UPL', '#0066FF', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/mwmmLxCMDbZacPQT.png', 'general', true),
  ('RECORTESCERO', 'RecortesCero', '#FF0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg', 'general', true),
  ('FI', 'Frente de Izquierdas', '#CC0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg', 'general', true),
  ('PE', 'Por España', '#0066FF', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LfhcjcOgngqwFaRh.png', 'general', true),
  ('NN', 'Núcleo Nacional', '#FF0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/cxzxAKrYdmopDhFQ.png', 'general', true),
  ('AE', 'Aragón Existe', '#FFD700', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/WYyKtKyxSmCkVtuk.png', 'general', true),
  ('CHA', 'Chunta Aragonesista', '#003D99', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/YgTqCeiHToEqDmlL.png', 'general', true),
  ('PA', 'Por Andalucía', '#FF0000', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/CeQBGvSmlrncUwYs.png', 'general', true),
  ('SHAACABAT', 'S''ha Acabat!', '#FF6600', '/assets/icons/SHaAcabat.jpg', 'youth', true),
  ('REVUELTA', 'Revuelta', '#D91E63', '/assets/icons/RevueltaNEW.jpg', 'youth', true),
  ('NNGG', 'Nuevas Generaciones del PP', '#0066FF', '/assets/icons/NuevasGeneracionesdelPP.png', 'youth', true),
  ('JVOX', 'Jóvenes de VOX', '#2ECC71', '/assets/icons/JóvenesDeVOXNEW.png', 'youth', true),
  ('VLE', 'Voces Libres España (VLE)', '#FFD700', '/assets/icons/VocesLibresDeEspañaNEW.jpg', 'youth', true),
  ('JSE', 'Juventudes Socialistas de España', '#E81B23', '/assets/icons/JuventudesSocialistasdeEspañaNEW.png', 'youth', true),
  ('PATRIOTA', 'Acción Patriota', '#FF0000', '/assets/icons/Patriota.png', 'youth', true),
  ('JIU', 'Juventudes de Izquierda Unida', '#CC0000', '/assets/icons/JuventudesDeIzquierdaUnida.jpg', 'youth', true),
  ('JCOMUNISTA', 'Juventudes Comunistas', '#CC0000', '/assets/icons/juventudescomunistas.png', 'youth', true),
  ('JCS', 'Jóvenes de Ciudadanos', '#FF9900', '/assets/icons/jóvenesdeciudadanosNEW.jpg', 'youth', true),
  ('EGI', 'EGI', '#00AA44', '/assets/icons/egi.jpg', 'youth', true),
  ('ERNAI', 'Ernai', '#00AA44', '/assets/icons/ernai.jpg', 'youth', true),
  ('JERC', 'Joventuts d''Esquerra Republicana de Catalunya', '#FFC400', '/assets/icons/ERCNew.png', 'youth', true),
  ('JNC', 'Joventut Nacionalista de Catalunya', '#003D99', '/assets/icons/JoventutNacionalistadeCatalunyaNEW.png', 'youth', true),
  ('GALIZANOVA', 'Galiza Nova', '#003D99', '/assets/icons/galizanovanew.png', 'youth', true),
  ('ARRAN', 'Arran', '#00AA44', '/assets/icons/arran-new.png', 'youth', true),
  ('JNCANA', 'Jóvenes Nacionalistas de Canarias', '#FFCC00', '/assets/icons/jncana.jpg', 'youth', true),
  ('JPV', 'Joves del País Valencià – Compromís', '#FF9900', '/assets/icons/jpv.png', 'youth', true),
  ('ACL', 'Acción Castilla y León', '#FFD700', '/assets/icons/AcciónCastillayLeónNEW.png', 'youth', true),
  ('JEC', 'Juventud Estudiante Católica', '#0066FF', '/assets/icons/JuventudEstudianteCatólicaNEW.jpg', 'youth', true),
  ('AGORA', 'ÁGORA Canarias', '#FFCC00', '/assets/icons/agora.png', 'youth', true)
ON CONFLICT (party_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  color = EXCLUDED.color,
  logo_url = EXCLUDED.logo_url,
  party_type = EXCLUDED.party_type,
  is_active = EXCLUDED.is_active,
  updated_at = now();

COMMIT;
