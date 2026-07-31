import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PartyLogo from "@/components/PartyLogo";

// 1. Configuración Oficial de Partidos (según public.party_configuration)
export interface PartyConfig {
  id: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

export const PARTY_CONFIG_MAP: Record<string, PartyConfig> = {
  PSOE: { id: 2, party_key: "PSOE", display_name: "PSOE", color: "#E20613", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/psoe.png" },
  PP: { id: 160, party_key: "PP", display_name: "PP", color: "#005497", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pp.png" },
  VOX: { id: 162, party_key: "VOX", display_name: "VOX", color: "#5AC035", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/vox.png" },
  SUMAR: { id: 123, party_key: "SUMAR", display_name: "SUMAR", color: "#E61455", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/sumar.png" },
  PODEMOS: { id: 5, party_key: "PODEMOS", display_name: "PODEMOS", color: "#9169F4", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pod.png" },
  JUNTS: { id: 6, party_key: "JUNTS", display_name: "JUNTS", color: "#00C4B2", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/junts.png" },
  ERC: { id: 7, party_key: "ERC", display_name: "ERC", color: "#F95838", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/erc.png" },
  PNV: { id: 8, party_key: "PNV", display_name: "PNV", color: "#2A8343", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/pnv.png" },
  BILDU: { id: 10, party_key: "BILDU", display_name: "BILDU", color: "#08A3A6", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bildu.png" },
  BNG: { id: 17, party_key: "BNG", display_name: "BNG", color: "#6AADE4", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/bng.png" },
  CC: { id: 12, party_key: "CC", display_name: "Coalición Canaria", color: "#25BAF2", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/CoalicionCanaria.png" },
  UPN: { id: 13, party_key: "UPN", display_name: "Unión del Pueblo Navarro", color: "#A30E12", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/upn.png" },
  "Se Acabó La Fiesta": { id: 11, party_key: "Se Acabó La Fiesta", display_name: "Se Acabó la Fiesta", color: "#ECC29E", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/SeAcaboLaFiesta.png" },
  "Adelante Andalucía": { id: 24, party_key: "Adelante Andalucía", display_name: "ADELANTE ANDALUCÍA", color: "#24C87E", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/Adelante%20Andalucia.png" },
  "Aliança Catalana": { id: 9, party_key: "Aliança Catalana", display_name: "Aliança Catalana", color: "#0F4C81", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/AliancaCatalana.png" },
  D21: { id: 189, party_key: "D21", display_name: "D21", color: "#FF7F50", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/InShot_20260627_105907307.jpg" },
  PACMA: { id: 26, party_key: "PACMA", display_name: "PACMA", color: "#22D65D", logo_url: "https://hlhzxxeqfznwutgkdvdp.supabase.co/storage/v1/object/public/party-logos/PACMA.png" },
};

// 2. Datos del Barómetro BC (Última proyección de escaños)
const BAROMETRO_BC: Record<string, string> = {
  PP: "130-133",
  PSOE: "102",
  VOX: "70-72",
  ERC: "10",
  BILDU: "8",
  PNV: "5",
  SUMAR: "5",
  JUNTS: "4-7",
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

interface BarometroProps {
  // Conteo devuelto de la tabla public.respuestas agrupado por voto_generales
  respuestasEncuesta?: Record<string, number>; 
  // Totales opcionales formateados de la Media de Encuestas (CSV)
  mediaEncuestasCSV?: Record<string, number>; 
}

export default function BarometroGenerales({ respuestasEncuesta = {}, mediaEncuestasCSV = {} }: BarometroProps) {
  const totalRespuestas = useMemo(() => {
    return Object.values(respuestasEncuesta).reduce((a, b) => a + b, 0);
  }, [respuestasEncuesta]);

  const partidosOrdenados = useMemo(() => {
    return Object.keys(BAROMETRO_BC);
  }, []);

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold">Barómetro Político & Estimación Electoral</CardTitle>
            <CardDescription>
              Comparativa entre datos de encuestas, barómetro de escaños y respuestas de usuarios.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs font-semibold px-3 py-1">
            Total Muestra Interna: {totalRespuestas} respuestas
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {partidosOrdenados.map((key) => {
            const config = PARTY_CONFIG_MAP[key] || {
              display_name: key,
              color: "#6B7280",
              logo_url: "",
            };

            const escanos = BAROMETRO_BC[key] || "0";
            const numVotosInternos = respuestasEncuesta[key] || 0;
            const pctInterno = totalRespuestas > 0 ? ((numVotosInternos / totalRespuestas) * 100).toFixed(1) : "0.0";
            const pctMedia = mediaEncuestasCSV[key] ? mediaEncuestasCSV[key].toFixed(1) : null;

            return (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border hover:border-muted-foreground/40 transition-all bg-card gap-4"
              >
                {/* Logo y Nombre con Color Oficial */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center p-1 border shadow-sm shrink-0"
                    style={{ backgroundColor: `${config.color}15`, borderColor: config.color }}
                  >
                    {config.logo_url ? (
                      <PartyLogo src={config.logo_url} alt={config.display_name} partyName={config.display_name} size={28} />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: config.color }}>
                        {config.display_name.slice(0, 3)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: config.color }} />
                      {config.display_name}
                    </h4>
                    <span className="text-xs text-muted-foreground">{config.party_key}</span>
                  </div>
                </div>

                {/* Bloque Barómetro BC (Escaños) */}
                <div className="flex items-center gap-6 sm:justify-end flex-1">
                  <div className="text-center sm:text-right">
                    <span className="text-xs text-muted-foreground block uppercase font-medium">Escaños BC</span>
                    <Badge
                      className="text-sm font-semibold px-2.5 py-0.5 text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {escanos}
                    </Badge>
                  </div>

                  {/* Media de Encuestas (Si aplica) */}
                  {pctMedia !== null && (
                    <div className="text-center sm:text-right min-w-[80px]">
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Media Encuestas</span>
                      <span className="text-sm font-semibold">{pctMedia}%</span>
                    </div>
                  )}

                  {/* Voto Interno (Tabla Respuestas) */}
                  <div className="text-center sm:text-right min-w-[90px]">
                    <span className="text-xs text-muted-foreground block uppercase font-medium">Respuestas</span>
                    <span className="text-sm font-bold text-foreground">
                      {pctInterno}% <span className="text-xs text-muted-foreground font-normal">({numVotosInternos})</span>
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
