import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  X,
  Search,
  Download,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Shuffle,
  BarChart3,
  GitCommit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- Interfaces ---
interface TransferenciaVotoDataRaw {
  partido_anterior?: string;
  origen_partido?: string;
  partido_nuevo?: string;
  destino_partido?: string;
  total_transferencias?: number;
  votos_transferidos?: number;
  porcentaje?: number;
}

interface TransferenciaVotoData {
  origen_partido: string;
  destino_partido: string;
  votos_transferidos: number;
  porcentaje: number;
}

interface PartyConfig {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active?: boolean;
}

interface TransferenciaVotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyColors?: Record<string, string>;
}

type ModeFilter = "ALL" | "FIDELITY" | "LEAKAGE";

const FALLBACK_COLORS: Record<string, string> = {
  PP: "#1e40af",
  PSOE: "#ef4444",
  VOX: "#16a34a",
  SUMAR: "#ec4899",
  PODEMOS: "#8b5cf6",
  ERC: "#f59e0b",
  JUNTS: "#06b6d4",
  PNV: "#059669",
  BILDU: "#10b981",
  D21: "#f97316",
  OTROS: "#6b7280",
};

export function TransferenciaVotoModal({
  isOpen,
  onClose,
  partyColors = {},
}: TransferenciaVotoModalProps) {
  const [transferData, setTransferData] = useState<TransferenciaVotoData[]>([]);
  const [partyConfigs, setPartyConfigs] = useState<Record<string, PartyConfig>>({});
  const [loading, setLoading] = useState(true);

  const [selectedOrigen, setSelectedOrigen] = useState<string>("GLOBAL");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: partyData, error: partyErr } = await supabase
          .from("party_configuration")
          .select("party_key, display_name, color, logo_url, is_active")
          .eq("is_active", true);

        if (!partyErr && partyData) {
          const configMap: Record<string, PartyConfig> = {};
          partyData.forEach((p) => {
            if (p.party_key) configMap[p.party_key.toUpperCase()] = p;
            if (p.display_name) configMap[p.display_name.toUpperCase()] = p;
          });
          setPartyConfigs(configMap);
        }

        const { data, error } = await supabase
          .from("transferencia_votos_view")
          .select("*");

        if (error) throw error;

        const formattedData: TransferenciaVotoData[] = (data || []).map(
          (item: TransferenciaVotoDataRaw) => ({
            origen_partido: (
              item.origen_partido ||
              item.partido_anterior ||
              "Otros"
            ).trim(),
            destino_partido: (
              item.destino_partido ||
              item.partido_nuevo ||
              "Otros"
            ).trim(),
            votos_transferidos: Number(
              item.votos_transferidos ?? item.total_transferencias ?? 0
            ),
            porcentaje: Number(item.porcentaje ?? 0),
          })
        );

        setTransferData(formattedData);
      } catch (err) {
        console.error("Error fetching transfer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrigen, modeFilter, searchTerm]);

  const getPartyColor = useCallback(
    (partyName: string): string => {
      if (!partyName) return "#818cf8";
      const key = partyName.toUpperCase();
      if (partyConfigs[key]?.color) return partyConfigs[key].color;
      if (partyColors[partyName]) return partyColors[partyName];
      return FALLBACK_COLORS[key] || "#818cf8";
    },
    [partyConfigs, partyColors]
  );

  const getPartyLogo = useCallback(
    (partyName: string): string | null => {
      if (!partyName) return null;
      const key = partyName.toUpperCase();
      return partyConfigs[key]?.logo_url || null;
    },
    [partyConfigs]
  );

  const getPartyDisplayName = useCallback(
    (partyName: string): string => {
      if (!partyName) return "";
      const key = partyName.toUpperCase();
      return partyConfigs[key]?.display_name || partyName;
    },
    [partyConfigs]
  );

  const metrics = useMemo(() => {
    if (transferData.length === 0)
      return { totalVotos: 0, movilidadPct: 0, topFidelidad: null, topFuga: null };

    let totalVotosGlobal = 0;
    let totalMovilizados = 0;

    const fidelidadByParty: Record<string, { party: string; pct: number; votos: number }> = {};
    const fugaByParty: Record<string, { origen: string; destino: string; pct: number; votos: number }> = {};
    const totalPorOrigen: Record<string, number> = {};

    transferData.forEach((d) => {
      totalPorOrigen[d.origen_partido] = (totalPorOrigen[d.origen_partido] || 0) + d.votos_transferidos;
      totalVotosGlobal += d.votos_transferidos;
      if (d.origen_partido !== d.destino_partido) {
        totalMovilizados += d.votos_transferidos;
      }
    });

    transferData.forEach((d) => {
      const isFidelidad = d.origen_partido === d.destino_partido;
      const pct = (d.votos_transferidos / (totalPorOrigen[d.origen_partido] || 1)) * 100;

      if (isFidelidad) {
        fidelidadByParty[d.origen_partido] = { party: d.origen_partido, pct, votos: d.votos_transferidos };
      } else {
        if (!fugaByParty[d.origen_partido] || fugaByParty[d.origen_partido].votos < d.votos_transferidos) {
          fugaByParty[d.origen_partido] = { origen: d.origen_partido, destino: d.destino_partido, pct, votos: d.votos_transferidos };
        }
      }
    });

    return {
      totalVotos: totalVotosGlobal,
      movilidadPct: totalVotosGlobal > 0 ? (totalMovilizados / totalVotosGlobal) * 100 : 0,
      topFidelidad: Object.values(fidelidadByParty).sort((a, b) => b.pct - a.pct)[0] || null,
      topFuga: Object.values(fugaByParty).sort((a, b) => b.votos - a.votos)[0] || null,
    };
  }, [transferData]);

  const filteredData = useMemo(() => {
    return transferData.filter((item) => {
      if (selectedOrigen !== "GLOBAL" && item.origen_partido !== selectedOrigen) return false;

      const isFidelidad = item.origen_partido === item.destino_partido;
      if (modeFilter === "FIDELITY" && !isFidelidad) return false;
      if (modeFilter === "LEAKAGE" && isFidelidad) return false;

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchOrigen = item.origen_partido.toLowerCase().includes(term) ||
          getPartyDisplayName(item.origen_partido).toLowerCase().includes(term);
        const matchDestino = item.destino_partido.toLowerCase().includes(term) ||
          getPartyDisplayName(item.destino_partido).toLowerCase().includes(term);
        if (!matchOrigen && !matchDestino) return false;
      }

      return true;
    });
  }, [transferData, selectedOrigen, modeFilter, searchTerm, getPartyDisplayName]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const partidosOrigen = useMemo(() => {
    return Array.from(new Set(transferData.map((d) => d.origen_partido)));
  }, [transferData]);

  const maxPorcentaje = useMemo(() => {
    if (transferData.length === 0) return 100;
    const max = Math.max(...transferData.map((d) => d.porcentaje));
    return max > 0 ? max : 100;
  }, [transferData]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Origen Partido", "Destino Partido", "Votos Transferidos", "Porcentaje (%)"];
    const rows = filteredData.map((d) => [
      `"${getPartyDisplayName(d.origen_partido)}"`,
      `"${getPartyDisplayName(d.destino_partido)}"`,
      d.votos_transferidos,
      d.porcentaje.toFixed(2),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `transferencia_voto_${selectedOrigen}_${modeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(9, 9, 14, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(17,17,24,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 24,
          maxWidth: 1150,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: "absolute",
            top: 20, right: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
            color: "#94a3b8",
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        {/* Cabecera */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ background: "rgba(129, 140, 248, 0.15)", padding: 8, borderRadius: 10, color: "#818cf8" }}>
                <GitCommit size={22} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Transferencia y Matriz de Voto
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Análisis visual inter-partidista de fuga, fidelidad e intercambio de electores.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "8px 16px",
              color: "#f8fafc",
              fontSize: 13,
              fontWeight: 600,
              cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
              opacity: filteredData.length === 0 ? 0.5 : 1,
              marginRight: 40,
            }}
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 12 }}>
              <Loader2 className="animate-spin" size={36} style={{ color: "#818cf8" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Cargando matriz de transferencias...</span>
            </div>
          ) : transferData.length > 0 ? (
            <>
              {/* Tarjetas KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: 10, borderRadius: 12 }}><ShieldCheck size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Mayor Fidelidad</div>
                    {metrics.topFidelidad ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <PartyBadge party={metrics.topFidelidad.party} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>{metrics.topFidelidad.pct.toFixed(1)}%</span>
                      </div>
                    ) : <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>}
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: 10, borderRadius: 12 }}><TrendingUp size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Mayor Transvase</div>
                    {metrics.topFuga ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <PartyBadge party={metrics.topFuga.origen} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <ArrowRight size={12} style={{ color: "#94a3b8" }} />
                        <PartyBadge party={metrics.topFuga.destino} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                      </div>
                    ) : <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>}
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: 10, borderRadius: 12 }}><Shuffle size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Movilidad Electorado</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#c084fc", marginTop: 2 }}>
                      {metrics.movilidadPct.toFixed(1)}% <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>cambió de voto</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Origen:</span>
                  <button
                    onClick={() => setSelectedOrigen("GLOBAL")}
                    style={{
                      background: selectedOrigen === "GLOBAL" ? "#818cf8" : "rgba(255,255,255,0.05)",
                      color: selectedOrigen === "GLOBAL" ? "#fff" : "#94a3b8",
                      border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    🌐 Matriz Global
                  </button>
                  {partidosOrigen.map((partido) => (
                    <button
                      key={partido}
                      onClick={() => setSelectedOrigen(partido)}
                      style={{
                        background: selectedOrigen === partido ? getPartyColor(partido) : "rgba(255,255,255,0.05)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                      }}
                    >
                      {getPartyDisplayName(partido)}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={() => setModeFilter("ALL")} style={{ background: modeFilter === "ALL" ? "rgba(255,255,255,0.12)" : "transparent", color: modeFilter === "ALL" ? "#fff" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Todos</button>
                    <button onClick={() => setModeFilter("FIDELITY")} style={{ background: modeFilter === "FIDELITY" ? "rgba(34, 197, 94, 0.2)" : "transparent", color: modeFilter === "FIDELITY" ? "#4ade80" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🛡️ Fidelidad</button>
                    <button onClick={() => setModeFilter("LEAKAGE")} style={{ background: modeFilter === "LEAKAGE" ? "rgba(239, 68, 68, 0.2)" : "transparent", color: modeFilter === "LEAKAGE" ? "#f87171" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>💸 Transvase</button>
                  </div>

                  <div style={{ position: "relative", minWidth: 220 }}>
                    <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      placeholder="Buscar partido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px 6px 32px", fontSize: 12, color: "#f8fafc", outline: "none", width: "100%"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Diagrama de Flujo (Sankey Recalculado) */}
              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={16} style={{ color: "#818cf8" }} /> Diagrama Sankey
                  </h3>
                </div>

                <SankeyChart
                  data={filteredData}
                  getPartyColor={getPartyColor}
                  getPartyLogo={getPartyLogo}
                  getPartyDisplayName={getPartyDisplayName}
                  hoveredNode={hoveredNode}
                  setHoveredNode={setHoveredNode}
                />
              </div>

              {/* Tabla Detallada */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                    Detalle Numérico ({filteredData.length} resultados)
                  </h3>

                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>Página {currentPage} de {totalPages}</span>
                      <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 4, color: "#fff", opacity: currentPage === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
                      <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 4, color: "#fff", opacity: currentPage === totalPages ? 0.4 : 1 }}><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>

                <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "rgba(255,255,255,0.01)" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8" }}>Origen</th>
                        <th style={{ width: 30 }}></th>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8" }}>Destino</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", color: "#94a3b8" }}>Votos Transferidos</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", minWidth: 180 }}>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, idx) => {
                        const isFidelidad = row.origen_partido === row.destino_partido;
                        const pctNorm = Math.min((row.porcentaje / maxPorcentaje) * 100, 100);
                        return (
                          <tr key={`${row.origen_partido}-${row.destino_partido}-${idx}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "10px 14px" }}><PartyBadge party={row.origen_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} /></td>
                            <td style={{ textAlign: "center", color: isFidelidad ? "#4ade80" : "#64748b" }}><ArrowRight size={14} /></td>
                            <td style={{ padding: "10px 14px" }}><PartyBadge party={row.destino_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} /></td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#f8fafc" }}>{row.votos_transferidos.toLocaleString()}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pctNorm}%`, background: isFidelidad ? "#4ade80" : getPartyColor(row.origen_partido), borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isFidelidad ? "#4ade80" : "#f8fafc", minWidth: 45, textAlign: "right" }}>{row.porcentaje.toFixed(2)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>No hay datos disponibles.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartyBadge({ party, getColor, getLogo, getDisplayName }: { party: string; getColor: (p: string) => string; getLogo: (p: string) => string | null; getDisplayName: (p: string) => string }) {
  const color = getColor(party);
  const logo = getLogo(party);
  const displayName = getDisplayName(party);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: `${color}18`, border: `1px solid ${color}40`, color: "#fff", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {logo ? <img src={logo} alt={displayName} style={{ width: 15, height: 15, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />}
      {displayName}
    </span>
  );
}

// ==========================================
// SANKEY ENGINE (100% DECLARATIVO & MATEMÁTICAMENTE EXACTO)
// ==========================================
interface SankeyChartProps {
  data: TransferenciaVotoData[];
  getPartyColor: (party: string) => string;
  getPartyLogo: (party: string) => string | null;
  getPartyDisplayName: (party: string) => string;
  hoveredNode: string | null;
  setHoveredNode: (node: string | null) => void;
}

function SankeyChart({
  data,
  getPartyColor,
  getPartyDisplayName,
  hoveredNode,
  setHoveredNode,
}: SankeyChartProps) {
  const [activeLink, setActiveLink] = useState<TransferenciaVotoData | null>(null);

  // CÁLCULO MATEMÁTICO PREVIO DE LAYOUT (Sin mutaciones en JSX)
  const layout = useMemo(() => {
    if (!data || data.length === 0) return null;

    const width = 900;
    const nodeWidth = 18;
    const paddingX = 180;
    const leftX = paddingX;
    const rightX = width - paddingX;

    // Agrupar totales
    const origenesTotales: Record<string, number> = {};
    const destinosTotales: Record<string, number> = {};
    let totalVotosGlobal = 0;

    data.forEach((d) => {
      origenesTotales[d.origen_partido] = (origenesTotales[d.origen_partido] || 0) + d.votos_transferidos;
      destinosTotales[d.destino_partido] = (destinosTotales[d.destino_partido] || 0) + d.votos_transferidos;
      totalVotosGlobal += d.votos_transferidos;
    });

    const listOrigenes = Object.keys(origenesTotales);
    const listDestinos = Object.keys(destinosTotales);

    const gap = 20;
    const topMargin = 30;
    const minNodeHeight = 18;

    // Calcular alturas de nodos ajustadas
    const maxItems = Math.max(listOrigenes.length, listDestinos.length);
    const calculatedHeight = Math.max(maxItems * 48 + topMargin * 2, 340);
    const usableHeight = calculatedHeight - topMargin * 2 - (maxItems - 1) * gap;

    // Nodos Izquierda (Origen)
    let curYLeft = topMargin;
    const origNodes: Record<string, { y: number; height: number; total: number }> = {};
    listOrigenes.forEach((orig) => {
      const h = Math.max((origenesTotales[orig] / (totalVotosGlobal || 1)) * usableHeight, minNodeHeight);
      origNodes[orig] = { y: curYLeft, height: h, total: origenesTotales[orig] };
      curYLeft += h + gap;
    });

    // Nodos Derecha (Destino)
    let curYRight = topMargin;
    const destNodes: Record<string, { y: number; height: number; total: number }> = {};
    listDestinos.forEach((dest) => {
      const h = Math.max((destinosTotales[dest] / (totalVotosGlobal || 1)) * usableHeight, minNodeHeight);
      destNodes[dest] = { y: curYRight, height: h, total: destinosTotales[dest] };
      curYRight += h + gap;
    });

    // Trazado exacto de enlaces
    const curOffsetsOrig: Record<string, number> = {};
    const curOffsetsDest: Record<string, number> = {};
    listOrigenes.forEach((o) => (curOffsetsOrig[o] = 0));
    listDestinos.forEach((d) => (curOffsetsDest[d] = 0));

    const computedLinks = data.map((d, index) => {
      const oNode = origNodes[d.origen_partido];
      const dNode = destNodes[d.destino_partido];

      if (!oNode || !dNode) return null;

      // Grosor relativo al nodo origen
      const origRatio = d.votos_transferidos / (oNode.total || 1);
      const thickness = Math.max(origRatio * oNode.height, 2);

      const y1 = oNode.y + curOffsetsOrig[d.origen_partido] + thickness / 2;
      const destRatio = d.votos_transferidos / (dNode.total || 1);
      const destThickness = Math.max(destRatio * dNode.height, 2);
      const y2 = dNode.y + curOffsetsDest[d.destino_partido] + destThickness / 2;

      curOffsetsOrig[d.origen_partido] += thickness;
      curOffsetsDest[d.destino_partido] += destThickness;

      const x1 = leftX + nodeWidth;
      const x2 = rightX;
      const mx = (x1 + x2) / 2;

      const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;

      return {
        id: `link-${index}`,
        data: d,
        path,
        thickness,
        colorOrigen: getPartyColor(d.origen_partido),
        colorDestino: getPartyColor(d.destino_partido),
      };
    }).filter(Boolean);

    return {
      width,
      height: Math.max(curYLeft, curYRight) + topMargin,
      leftX,
      rightX,
      nodeWidth,
      origNodes,
      destNodes,
      links: computedLinks,
    };
  }, [data, getPartyColor]);

  if (!layout) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Sin datos suficientes.</div>;
  }

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          {layout.links.map((link) => link && (
            <linearGradient key={`grad-${link.id}`} id={`grad-${link.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={link.colorOrigen} stopOpacity="0.55" />
              <stop offset="100%" stopColor={link.colorDestino} stopOpacity="0.55" />
            </linearGradient>
          ))}
        </defs>

        {/* Flujos */}
        {layout.links.map((link) => {
          if (!link) return null;
          const isHighlighted =
            hoveredNode === link.data.origen_partido ||
            hoveredNode === link.data.destino_partido ||
            (activeLink?.origen_partido === link.data.origen_partido && activeLink?.destino_partido === link.data.destino_partido);

          return (
            <path
              key={link.id}
              d={link.path}
              fill="none"
              stroke={`url(#grad-${link.id})`}
              strokeWidth={link.thickness}
              strokeOpacity={hoveredNode || activeLink ? (isHighlighted ? 0.9 : 0.08) : 0.5}
              style={{ transition: "stroke-opacity 0.2s ease", cursor: "pointer" }}
              onMouseEnter={() => setActiveLink(link.data)}
              onMouseLeave={() => setActiveLink(null)}
            />
          );
        })}

        {/* Nodos Origen */}
        {Object.entries(layout.origNodes).map(([party, pos]) => (
          <g key={`orig-${party}`} onMouseEnter={() => setHoveredNode(party)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
            <rect x={layout.leftX} y={pos.y} width={layout.nodeWidth} height={pos.height} rx={4} fill={getPartyColor(party)} />
            <text x={layout.leftX - 10} y={pos.y + pos.height / 2 + 4} textAnchor="end" fill="#f8fafc" fontSize={12} fontWeight={700}>
              {getPartyDisplayName(party)}
            </text>
          </g>
        ))}

        {/* Nodos Destino */}
        {Object.entries(layout.destNodes).map(([party, pos]) => (
          <g key={`dest-${party}`} onMouseEnter={() => setHoveredNode(party)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
            <rect x={layout.rightX} y={pos.y} width={layout.nodeWidth} height={pos.height} rx={4} fill={getPartyColor(party)} />
            <text x={layout.rightX + layout.nodeWidth + 10} y={pos.y + pos.height / 2 + 4} textAnchor="start" fill="#f8fafc" fontSize={12} fontWeight={700}>
              {getPartyDisplayName(party)}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {activeLink && (
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {getPartyDisplayName(activeLink.origen_partido)} → {getPartyDisplayName(activeLink.destino_partido)}:
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#818cf8" }}>
            {activeLink.votos_transferidos.toLocaleString()} votos ({activeLink.porcentaje.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
}
