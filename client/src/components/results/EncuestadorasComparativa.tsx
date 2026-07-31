import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PartyConfig {
  id?: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  party_type?: string;
  is_active?: boolean;
}

// 1. Configuración estática de respaldo extraída directamente de tu base de datos SQL
const DEFAULT_PARTY_CONFIGS: Record<string, PartyConfig> = {
  PP: {
    party_key: "PP",
    display_name: "PP",
    color: "#005497",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pp.png",
  },
  PSOE: {
    party_key: "PSOE",
    display_name: "PSOE",
    color: "#E20613",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/psoe.png",
  },
  VOX: {
    party_key: "VOX",
    display_name: "VOX",
    color: "#5AC035",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/vox.png",
  },
  SUMAR: {
    party_key: "SUMAR",
    display_name: "SUMAR",
    color: "#E61455",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/sumar.png",
  },
  PODEMOS: {
    party_key: "PODEMOS",
    display_name: "PODEMOS",
    color: "#9169F4",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pod.png",
  },
  ERC: {
    party_key: "ERC",
    display_name: "ERC",
    color: "#F95838",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/erc.png",
  },
  BILDU: {
    party_key: "BILDU",
    display_name: "BILDU",
    color: "#08A3A6",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bildu.png",
  },
  JUNTS: {
    party_key: "JUNTS",
    display_name: "JUNTS",
    color: "#00C4B2",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/junts.png",
  },
  PNV: {
    party_key: "PNV",
    display_name: "PNV",
    color: "#2A8343",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pnv.png",
  },
  "Adelante Andalucía": {
    party_key: "Adelante Andalucía",
    display_name: "ADELANTE ANDALUCÍA",
    color: "#24C87E",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/Adelante%20Andalucia.png",
  },
  BNG: {
    party_key: "BNG",
    display_name: "Bloque Nacionalista Galego",
    color: "#6AADE4",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bng.png",
  },
  CC: {
    party_key: "CC",
    display_name: "Coalición Canaria",
    color: "#25BAF2",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/CoalicionCanaria.png",
  },
  UPN: {
    party_key: "UPN",
    display_name: "Unión del Pueblo Navarro",
    color: "#A30E12",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/upn.png",
  },
  "Aliança Catalana": {
    party_key: "Aliança Catalana",
    display_name: "Aliança Catalana",
    color: "#0F4C81",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/AliancaCatalana.png",
  },
  D21: {
    party_key: "D21",
    display_name: "D21",
    color: "#FF7F50",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/InShot_20260627_105907307.jpg",
  },
  "Se Acabó La Fiesta": {
    party_key: "Se Acabó La Fiesta",
    display_name: "Se Acabó la Fiesta",
    color: "#ECC29E",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/SeAcaboLaFiesta.png",
  },
  PACMA: {
    party_key: "PACMA",
    display_name: "PACMA",
    color: "#22D65D",
    logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/PACMA.png",
  },
};

// Escaños del Barómetro BC
const BAROMETRO_BC: Record<string, string> = {
  PP: "130-133",
  PSOE: "102",
  VOX: "70-72",
  ERC: "10",
  BILDU: "8",
  SUMAR: "5",
  JUNTS: "4-7",
  PNV: "5",
  PODEMOS: "4",
  "Adelante Andalucía": "2",
  BNG: "2",
  CC: "1",
  UPN: "1",
  "Aliança Catalana": "0-2",
  D21: "0-1",
  "Se Acabó La Fiesta": "0",
  PACMA: "0",
};

// CSV Histórico
const CSV_DATA_STATICS: Record<string, { votos: number; pct: number }> = {
  PP: { votos: 8263724, pct: 32.62 },
  PSOE: { votos: 6628162, pct: 26.17 },
  VOX: { votos: 4410736, pct: 17.41 },
  SUMAR: { votos: 1592018, pct: 6.28 },
  PODEMOS: { votos: 834050, pct: 3.29 },
  ERC: { votos: 529759, pct: 2.09 },
  "Se Acabó La Fiesta": { votos: 454934, pct: 1.80 },
  "Adelante Andalucía": { votos: 395046, pct: 1.56 },
  BILDU: { votos: 353169, pct: 1.39 },
  JUNTS: { votos: 302719, pct: 1.20 },
  PNV: { votos: 252263, pct: 1.00 },
  BNG: { votos: 201809, pct: 0.80 },
  CC: { votos: 126132, pct: 0.50 },
  UPN: { votos: 50453, pct: 0.20 },
};

/**
 * Normaliza cualquier texto quitando acentos, caracteres especiales y espacios en blanco
 */
function cleanKey(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

interface Props {
  partyConfigs?: PartyConfig[];
  respuestasDB?: Array<{
    party_key?: string;
    voto_generales?: string;
    total_votos_raw?: number;
    total_votos?: number;
    porcentaje_voto?: number;
  }>;
  csvMediaData?: Record<string, { votos: number; pct: number }>;
}

export default function BarometroGenerales({
  partyConfigs = [],
  respuestasDB = [],
  csvMediaData,
}: Props) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  const effectiveCsvData = useMemo(() => {
    return csvMediaData && Object.keys(csvMediaData).length > 0
      ? csvMediaData
      : CSV_DATA_STATICS;
  }, [csvMediaData]);

  // 1. Diccionario Unificado de Configuración (Prioridad: Props > Fallback DB)
  const partyConfigMap = useMemo(() => {
    const map = new Map<string, PartyConfig>();

    // Primero agregamos el fallback por defecto
    Object.entries(DEFAULT_PARTY_CONFIGS).forEach(([key, config]) => {
      map.set(cleanKey(key), config);
      if (config.party_key) map.set(cleanKey(config.party_key), config);
      if (config.display_name) map.set(cleanKey(config.display_name), config);
    });

    // Sobrescribimos con los datos dinámicos recibidos por props
    partyConfigs.forEach((p) => {
      if (p.party_key) map.set(cleanKey(p.party_key), p);
      if (p.display_name) map.set(cleanKey(p.display_name), p);
    });

    return map;
  }, [partyConfigs]);

  // 2. Diccionario de Respuestas de la DB
  const respuestasMap = useMemo(() => {
    const map = new Map<string, { count: number; pct: number }>();

    // Calculamos total si los datos vienen crudos
    const totalVotosGlobal = respuestasDB.reduce((acc, curr) => {
      return acc + Number(curr.total_votos ?? curr.total_votos_raw ?? 0);
    }, 0);

    respuestasDB.forEach((item) => {
      const key = item.party_key || item.voto_generales;
      if (key) {
        const count = Number(item.total_votos ?? item.total_votos_raw ?? 0);
        let pct = Number(item.porcentaje_voto ?? 0);

        if (pct === 0 && totalVotosGlobal > 0) {
          pct = Number(((count / totalVotosGlobal) * 100).toFixed(2));
        }

        const normalizedKey = cleanKey(key);
        map.set(normalizedKey, { count, pct });
      }
    });

    return map;
  }, [respuestasDB]);

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="border-b bg-muted/10">
        <CardTitle className="text-xl font-bold">Barómetro de Elecciones Generales</CardTitle>
        <CardDescription>
          Comparativa de escaños, datos procesados del CSV y respuestas registradas.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {Object.keys(BAROMETRO_BC).map((key) => {
            const normalized = cleanKey(key);

            // Búsqueda de configuración de partido
            const config = partyConfigMap.get(normalized);

            // Búsqueda de CSV
            const csvEntryKey = Object.keys(effectiveCsvData).find(
              (k) => cleanKey(k) === normalized
            );
            const csvInfo = csvEntryKey ? effectiveCsvData[csvEntryKey] : undefined;

            // Búsqueda en Respuestas DB
            const dbInfo = respuestasMap.get(normalized);

            const logoUrl = config?.logo_url;
            const partyColor = config?.color || "#000000";
            const partyDisplayName = config?.display_name || key;
            const hasImageError = imageErrors[key] || !logoUrl;
            const escanos = BAROMETRO_BC[key];

            return (
              <div
                key={key}
                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-lg border bg-card hover:bg-muted/5 transition-colors gap-4"
              >
                {/* Logo & Partido */}
                <div className="flex items-center gap-3 min-w-[260px]">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center p-1 border shadow-xs shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: `${partyColor}15`,
                      borderColor: partyColor,
                    }}
                  >
                    {!hasImageError && logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={partyDisplayName}
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(key)}
                      />
                    ) : (
                      <span className="text-xs font-bold font-mono" style={{ color: partyColor }}>
                        {key.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: partyColor }}
                      />
                      {partyDisplayName}
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono">{key}</span>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 items-center flex-1 max-w-xl text-center md:text-right">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Escaños BC
                    </span>
                    <Badge
                      className="text-xs font-bold text-white px-2 py-0.5 border-none"
                      style={{ backgroundColor: partyColor }}
                    >
                      {escanos}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Voto CSV (%)
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {csvInfo ? `${csvInfo.pct}%` : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Respuestas
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {dbInfo ? `${dbInfo.pct}%` : "0%"}
                      <span className="text-xs font-normal text-muted-foreground block md:inline md:ml-1">
                        ({dbInfo ? dbInfo.count : 0})
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
