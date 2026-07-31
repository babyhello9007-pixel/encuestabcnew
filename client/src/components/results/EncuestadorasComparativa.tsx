import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PartyLogo from "@/components/PartyLogo";

export interface PartyConfig {
  id: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

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

interface Props {
  partyConfigs?: PartyConfig[];
  respuestasDB?: Array<{
    party_key: string;
    total_votos_raw: number;
    porcentaje_voto: number;
  }>;
  csvMediaData?: Record<string, { votos: number; pct: number }>;
}

export default function BarometroGenerales({
  partyConfigs = [],
  respuestasDB = [],
  csvMediaData,
}: Props) {
  const effectiveCsvData = useMemo(() => {
    return csvMediaData && Object.keys(csvMediaData).length > 0
      ? csvMediaData
      : CSV_DATA_STATICS;
  }, [csvMediaData]);

  // Index respuestas DB by upper-cased key for safer lookups
  const respuestasMap = useMemo(() => {
    const map: Record<string, { count: number; pct: number }> = {};
    respuestasDB.forEach((item) => {
      if (item.party_key) {
        map[item.party_key.trim().toUpperCase()] = {
          count: Number(item.total_votos_raw),
          pct: Number(item.porcentaje_voto),
        };
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
            const normalizedKey = key.trim().toUpperCase();
            
            // Search config by key matching
            const config = partyConfigs.find(
              (p) => p.party_key.trim().toUpperCase() === normalizedKey
            );

            const escanos = BAROMETRO_BC[key];
            const csvInfo = effectiveCsvData[key];
            const dbInfo = respuestasMap[normalizedKey];

            return (
              <div
                key={key}
                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-lg border bg-card hover:bg-muted/5 transition-colors gap-4"
              >
                {/* Logo & Partido */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center p-1 border shadow-xs shrink-0"
                    style={{
                      backgroundColor: config ? `${config.color}15` : "#f0f0f0",
                      borderColor: config?.color || "#ccc",
                    }}
                  >
                    {config ? (
                      <PartyLogo src={config.logo_url} alt={config.display_name} partyName={config.display_name} size={28} />
                    ) : (
                      <span className="text-xs font-bold">{key.slice(0, 3)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config?.color || "#999" }}
                      />
                      {config?.display_name || key}
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono">{key}</span>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 items-center flex-1 max-w-xl text-center md:text-right">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Escaños BC</span>
                    <Badge className="text-xs font-bold text-white px-2 py-0.5" style={{ backgroundColor: config?.color || "#666" }}>
                      {escanos}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Voto CSV (%)</span>
                    <span className="text-sm font-semibold text-foreground">
                      {csvInfo ? `${csvInfo.pct}%` : "—"}
                    </span>
                  </div>

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
