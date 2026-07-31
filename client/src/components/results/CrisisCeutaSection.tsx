import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface PartyMeta {
  key: string;
  name: string;
  color: string;
  logo: string;
}

interface CrisisCeutaData {
  partido: string;
  opinion: string;
  votos: number;
  porcentaje: number;
}

interface CrisisCeutaResumen {
  opinion: string;
  total_votos: number;
  porcentaje: number;
}

interface CrisisCeutaSectionProps {
  partyMeta: Record<string, PartyMeta>;
}

export function CrisisCeutaSection({ partyMeta }: CrisisCeutaSectionProps) {
  const [crisisData, setCrisisData] = useState<CrisisCeutaData[]>([]);
  const [crisisResumen, setCrisisResumen] = useState<CrisisCeutaResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrisisData = async () => {
      try {
        setLoading(true);

        // Fetch crisis data by party
        const { data: byParty, error: byPartyError } = await supabase
          .from("crisis_ceuta_por_partido")
          .select("*");

        if (byPartyError) throw byPartyError;
        setCrisisData(byParty || []);

        // Fetch crisis summary
        const { data: summary, error: summaryError } = await supabase
          .from("crisis_ceuta_resumen")
          .select("*");

        if (summaryError) throw summaryError;
        setCrisisResumen(summary || []);
      } catch (error) {
        console.error("Error fetching crisis data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrisisData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <Loader2 className="animate-spin" size={28} style={{ color: "#e8465a" }} />
      </div>
    );
  }

  if (!crisisData || crisisData.length === 0 || !crisisResumen || crisisResumen.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#7a7990" }}>
        <p>No hay datos de Crisis Ceuta disponibles.</p>
      </div>
    );
  }

  // Group data by opinion
  const dataByOpinion: Record<string, CrisisCeutaData[]> = {};
  crisisData.forEach((item) => {
    if (!dataByOpinion[item.opinion]) {
      dataByOpinion[item.opinion] = [];
    }
    dataByOpinion[item.opinion].push(item);
  });

  const opinionLabels: Record<string, string> = {
    "invasion": "Lo considero invasión territorial",
    "humanitaria": "Crisis humanitaria (intervención UE)",
    "geopolitica": "Consecuencia del deterioro geopolítico",
    "gestion": "Fallo grave en la gestión diplomática",
    "derecho": "Drama humano - derecho a migrar",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Resumen general */}
      <div className="r-section">
        <div className="r-section-title">Resumen de Opiniones</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {crisisResumen.map((item) => (
            <div
              key={item.opinion}
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a7990", marginBottom: 8, textTransform: "uppercase" }}>
                {opinionLabels[item.opinion] || item.opinion}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f0eff8", marginBottom: 4 }}>
                {(item.porcentaje ?? 0).toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: "#7a7990" }}>
                {(item.total_votos ?? 0).toLocaleString()} votos
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis por opinión */}
      {Object.entries(dataByOpinion).map(([opinion, data]) => (
        <div key={opinion} className="r-section">
          <div className="r-section-title">
            {opinionLabels[opinion] || opinion}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="partido" tick={{ fill: "#7a7990", fontSize: 12 }} />
              <YAxis tick={{ fill: "#7a7990", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(17,17,24,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#f0eff8",
                }}
                cursor={{ fill: "rgba(232,70,90,0.1)" }}
              />
              <Legend />
              <Bar dataKey="votos" fill="#e8465a" name="Votos" />
              <Bar dataKey="porcentaje" fill="#818cf8" name="Porcentaje (%)" />
            </BarChart>
          </ResponsiveContainer>

          {/* Tabla detallada */}
          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", color: "#7a7990", fontWeight: 600 }}>Partido</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", color: "#7a7990", fontWeight: 600 }}>Votos</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", color: "#7a7990", fontWeight: 600 }}>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={`${row.partido}-${row.opinion}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 12px", color: "#f0eff8", fontWeight: 500 }}>{row.partido}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#f0eff8" }}>
                      {(row.votos ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#e8465a", fontWeight: 600 }}>
                      {(row.porcentaje ?? 0).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
  
