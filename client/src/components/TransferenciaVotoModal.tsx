import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, X } from "lucide-react";

interface TransferenciaVotoData {
  origen_partido: string;
  destino_partido: string;
  votos_transferidos: number;
  porcentaje: number;
}

interface TransferenciaVotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyColors?: Record<string, string>;
}

export function TransferenciaVotoModal({ isOpen, onClose, partyColors = {} }: TransferenciaVotoModalProps) {
  const [transferData, setTransferData] = useState<TransferenciaVotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTransferData = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("transferencia_votos_view")
          .select("*");

        if (error) throw error;

        setTransferData(data || []);
      } catch (error) {
        console.error("Error fetching transfer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Agrupar datos por partido origen para gráficos
  const dataByOrigen: Record<string, TransferenciaVotoData[]> = {};
  transferData.forEach((item) => {
    if (!dataByOrigen[item.origen_partido]) {
      dataByOrigen[item.origen_partido] = [];
    }
    dataByOrigen[item.origen_partido].push(item);
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(17,17,24,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: 28,
          maxWidth: 1000,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 8,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7a7990",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#f0eff8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#7a7990";
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f0eff8", marginBottom: 8, marginTop: 0 }}>
          Transferencia de Voto
        </h2>
        <p style={{ fontSize: 13, color: "#7a7990", marginBottom: 20 }}>
          Visualización de flujos de votos entre partidos basada en el voto anterior
        </p>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
            <Loader2 className="animate-spin" size={28} style={{ color: "#e8465a" }} />
          </div>
        ) : transferData.length > 0 ? (
          <>
            {/* Gráficos por partido origen */}
            {Object.entries(dataByOrigen).map(([origen, data]) => (
              <div key={origen} style={{ marginBottom: 28 }}>
                <div className="r-section">
                  <div className="r-section-title">
                    Votos de {origen} que se transfieren a otros partidos
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="destino_partido" tick={{ fill: "#7a7990", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#7a7990", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(17,17,24,0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#f0eff8",
                          padding: 12,
                        }}
                        formatter={(value) => {
                          if (typeof value === "number") {
                            return value.toLocaleString();
                          }
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="votos_transferidos" fill="#e8465a" name="Votos" />
                      <Bar dataKey="porcentaje" fill="#818cf8" name="Porcentaje (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}

            {/* Tabla detallada */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0eff8", marginBottom: 12 }}>
                Detalle de Transferencias
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", color: "#7a7990", fontWeight: 600 }}>
                        De Partido
                      </th>
                      <th style={{ padding: "10px 12px", textAlign: "left", color: "#7a7990", fontWeight: 600 }}>
                        A Partido
                      </th>
                      <th style={{ padding: "10px 12px", textAlign: "right", color: "#7a7990", fontWeight: 600 }}>
                        Votos Transferidos
                      </th>
                      <th style={{ padding: "10px 12px", textAlign: "right", color: "#7a7990", fontWeight: 600 }}>
                        Porcentaje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "10px 12px", color: "#f0eff8", fontWeight: 500 }}>
                          {row.origen_partido}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#f0eff8", fontWeight: 500 }}>
                          {row.destino_partido}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#f0eff8" }}>
                          {row.votos_transferidos.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#e8465a", fontWeight: 600 }}>
                          {row.porcentaje.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen de flujos */}
            <div style={{ marginTop: 28, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0eff8", marginBottom: 12 }}>
                Resumen de Transferencias
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {Object.entries(dataByOrigen).map(([origen, data]) => {
                  const totalVotos = data.reduce((sum, item) => sum + item.votos_transferidos, 0);
                  return (
                    <div
                      key={origen}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#7a7990", marginBottom: 6 }}>
                        Desde {origen}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#e8465a", marginBottom: 4 }}>
                        {totalVotos.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: "#7a7990" }}>
                        votos transferidos
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#7a7990" }}>
            <p>No hay datos de transferencia de voto disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
