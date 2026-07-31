import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PartyLogo from "@/components/PartyLogo";

// Si usas Vite o Next.js, puedes importar el CSV directamente como raw string
import csvRawText from "@/data/generales_2026-07-31.csv?raw";

// Partidos estrictamente generales (ID de public.party_configuration)
export interface PartyConfig {
  id: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

export const GENERAL_PARTIES: Record<string, PartyConfig> = {
  PP: { id: 160, party_key: "PP", display_name: "PP", color: "#005497", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pp.png" },
  PSOE: { id: 2, party_key: "PSOE", display_name: "PSOE", color: "#E20613", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/psoe.png" },
  VOX: { id: 162, party_key: "VOX", display_name: "VOX", color: "#5AC035", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/vox.png" },
  ERC: { id: 7, party_key: "ERC", display_name: "ERC", color: "#F95838", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/erc.png" },
  BILDU: { id: 10, party_key: "BILDU", display_name: "BILDU", color: "#08A3A6", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bildu.png" },
  SUMAR: { id: 123, party_key: "SUMAR", display_name: "SUMAR", color: "#E61455", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/sumar.png" },
  JUNTS: { id: 6, party_key: "JUNTS", display_name: "JUNTS", color: "#00C4B2", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/junts.png" },
  PNV: { id: 8, party_key: "PNV", display_name: "PNV", color: "#2A8343", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pnv.png" },
  PODEMOS: { id: 5, party_key: "PODEMOS", display_name: "PODEMOS", color: "#9169F4", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pod.png" },
  "Adelante Andalucía": { id: 24, party_key: "Adelante Andalucía", display_name: "ADELANTE ANDALUCÍA", color: "#24C87E", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/Adelante%20Andalucia.png" },
  BNG: { id: 17, party_key: "BNG", display_name: "BNG", color: "#6AADE4", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bng.png" },
  CC: { id: 12, party_key: "CC", display_name: "Coalición Canaria", color: "#25BAF2", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/CoalicionCanaria.png" },
  UPN: { id: 13, party_key: "UPN", display_name: "Unión del Pueblo Navarro", color: "#A30E12", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/upn.png" },
  "Aliança Catalana": { id: 9, party_key: "Aliança Catalana", display_name: "Aliança Catalana", color: "#0F4C81", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/AliancaCatalana.png" },
  D21: { id: 189, party_key: "D21", display_name: "D21", color: "#FF7F50", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/InShot_20260627_105907307.jpg" },
  "Se Acabó La Fiesta": { id: 11, party_key: "Se Acabó La Fiesta", display_name: "Se Acabó la Fiesta", color: "#ECC29E", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/SeAcaboLaFiesta.png" },
  PACMA: { id: 26, party_key: "PACMA", display_name: "PACMA", color: "#22D65D", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/PACMA.png" },
};

// Datos calculados exactamente desde generales_2026-07-31.csv
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

interface Props {
  respuestasDB?: Array<{
    party_key: string;
    total_votos_raw: number;
    porcentaje_voto: number;
  }>;
  csvMediaData?: Record<string, { votos: number; pct: number }>;
}

export default function BarometroGenerales({ respuestasDB = [], csvMediaData }: Props) {
  // Usar props si existen, de lo contrario fallback a los datos parsed del CSV
  const effectiveCsvData = useMemo(() => {
    if (csvMediaData && Object.keys(csvMediaData).length > 0) {
      return csvMediaData;
    }
    return CSV_DATA_STATICS;
  }, [csvMediaData]);

  const respuestasMap = useMemo(() => {
    const map: Record<string, { count: number; pct: number }> = {};
    respuestasDB.forEach((item) => {
      map[item.party_key] = {
        count: Number(item.total_votos_raw),
        pct: Number(item.porcentaje_voto),
      };
    });
    return map;
  }, [respuestasDB]);

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="border-b bg-muted/10">
        <CardTitle className="text-xl font-bold">Barómetro de Elecciones Generales</CardTitle>
        <CardDescription>
          Comparativa de escaños (Barómetro BC), datos procesados del CSV (`generales_2026-07-31.csv`) y respuestas registradas.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {Object.keys(BAROMETRO_BC).map((key) => {
            const config = GENERAL_PARTIES[key];
            if (!config) return null;

            const escanos = BAROMETRO_BC[key];
            const csvInfo = effectiveCsvData[key];
            const dbInfo = respuestasMap[key] || respuestasMap[config.display_name];

            return (
              <div
                key={key}
                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-lg border bg-card hover:bg-muted/5 transition-colors gap-4"
              >
                {/* Logo & Partido */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center p-1 border shadow-xs shrink-0"
                    style={{ backgroundColor: `${config.color}15`, borderColor: config.color }}
                  >
                    <PartyLogo src={config.logo_url} alt={config.display_name} partyName={config.display_name} size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                      {config.display_name}
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono">{config.party_key}</span>
                  </div>
                </div>

                {/* Métricas: Escaños, Media Encuestas CSV y Respuestas */}
                <div className="grid grid-cols-3 gap-4 items-center flex-1 max-w-xl text-center md:text-right">
                  {/* Escaños BC */}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Escaños BC</span>
                    <Badge className="text-xs font-bold text-white px-2 py-0.5" style={{ backgroundColor: config.color }}>
                      {escanos}
                    </Badge>
                  </div>

                  {/* Datos procesados del CSV de Generales */}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Voto CSV (%)</span>
                    <span className="text-sm font-semibold text-foreground">
                      {csvInfo ? `${csvInfo.pct}%` : "—"}
                    </span>
                  </div>

                  {/* Respuestas Encuestas (voto_generales en respuestas) */}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Respuestas</span>
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
