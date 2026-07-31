import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Sankey, Sink, Source, Link, Node, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2, X } from "lucide-react";

interface TransferenciaVotoData {
  origen_partido: string;
  destino_partido: string;
  votos_transferidos: number;
  porcentaje: number;
}

interface SankeyNode {
  name: string;
  color?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
}

interface TransferenciaVotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyColors?: Record<string, string>;
}

export function TransferenciaVotoModal({ isOpen, onClose, partyColors = {} }: TransferenciaVotoModalProps) {
  const [transferData, setTransferData] = useState<TransferenciaVotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sankeyData, setSankeyData] = useState<{ nodes: SankeyNode[]; links: SankeyLink[] }>({ nodes: [], links: [] });

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

        // Process data for Sankey diagram
        if (data && data.length > 0) {
          const uniqueParties = new Set<string>();
          data.forEach((item) => {
            uniqueParties.add(item.origen_partido);
            uniqueParties.add(item.destino_partido);
          });

          const partiesList = Array.from(uniqueParties).sort();
          const nodes: SankeyNode[] = partiesList.map((party) => ({
            name: party,
            color: partyColors[party.toUpperCase()] || "#e8465a",
          }));

          const links: SankeyLink[] = data.map((item) => {
            const sourceIdx = partiesList.indexOf(item.origen_partido);
            const targetIdx = partiesList.indexOf(item.destino_partido);
            return {
              source: sourceIdx,
              target: targetIdx,
              value: item.votos_transferidos,
              color: `${partyColors[item.origen_partido.toUpperCase()] || "#e8465a"}40`, // 25% opacity
            };
          });

          setSankeyData({ nodes, links });
        }
      } catch (error) {
        console.error("Error fetching transfer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferData();
  }, [isOpen, partyColors]);

  if (!isOpen) return null;

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
        ) : sankeyData.nodes.length > 0 ? (
          <>
            {/* Sankey Diagram */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={400}>
                <Sankey
                  data={sankeyData}
                  node={{ fill: "#e8465a", fillOpacity: 1 }}
                  link={{ stroke: "rgba(232,70,90,0.25)", strokeOpacity: 0.5 }}
                  nodePadding={50}
                  margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
                >
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,17,24,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#f0eff8",
                      padding: 12,
                    }}
                  />
                  {sankeyData.nodes.map((node, index) => (
                    <Node
                      key={`node-${index}`}
                      name={node.name}
                      fill={node.color}
                      fillOpacity={1}
                    />
                  ))}
                  {sankeyData.links.map((link, index) => (
                    <Link
                      key={`link-${index}`}
                      sourceNode={sankeyData.nodes[link.source]}
                      targetNode={sankeyData.nodes[link.target]}
                      linkWidth={Math.max(1, link.value / 100)}
                      stroke={link.color}
                      strokeOpacity={0.4}
                    />
                  ))}
                </Sankey>
              </ResponsiveContainer>
            </div>

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
