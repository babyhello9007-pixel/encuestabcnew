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
  Sparkles,
} from "lucide-react";

// --- Interfaces de Datos ---
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

// Interfaz corregida para coincidir con la DDL real de party_configuration
interface PartyConfig {
  id?: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active?: boolean;
  party_type?: string;
}

interface TransferenciaVotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyColors?: Record<string, string>;
}

type ModeFilter = "ALL" | "FIDELITY" | "LEAKAGE";

// Fallback de colores
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
  // Estados de datos
  const [transferData, setTransferData] = useState<TransferenciaVotoData[]>([]);
  const [partyConfigs, setPartyConfigs] = useState<Record<string, PartyConfig>>({});
  const [loading, setLoading] = useState(true);

  // Estados de UI, Filtros y Paginación
  const [selectedOrigen, setSelectedOrigen] = useState<string>("GLOBAL");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Paginación para manejar alto volumen de datos en la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Carga de datos de Supabase corregida
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Consulta CORREGIDA a party_configuration según DDL
        const { data: partyData, error: partyErr } = await supabase
          .from("party_configuration")
          .select("party_key, display_name, color, logo_url, is_active")
          .eq("is_active", true);

        if (!partyErr && partyData) {
          const configMap: Record<string, PartyConfig> = {};
          partyData.forEach((p) => {
            if (p.party_key) {
              configMap[p.party_key.toUpperCase()] = p;
            }
            if (p.display_name) {
              configMap[p.display_name.toUpperCase()] = p;
            }
          });
          setPartyConfigs(configMap);
        } else if (partyErr) {
          console.warn("Advertencia al cargar party_configuration:", partyErr.message);
        }

        // 2. Obtener datos de transferencia
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

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrigen, modeFilter, searchTerm]);

  // Auxiliares para obtener color y logo de partidos
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

  // --- CÁLCULOS MÉTRICOS Y KPIS ---
  const metrics = useMemo(() => {
    if (transferData.length === 0)
      return { totalVotos: 0, movilidadPct: 0, topFidelidad: null, topFuga: null };

    let totalVotosGlobal = 0;
    let totalMovilizados = 0;

    const fidelidadByParty: Record<string, { party: string; pct: number; votos: number }> = {};
    const fugaByParty: Record<
      string,
      { origen: string; destino: string; pct: number; votos: number }
    > = {};

    const totalPorOrigen: Record<string, number> = {};
    transferData.forEach((d) => {
      totalPorOrigen[d.origen_partido] =
        (totalPorOrigen[d.origen_partido] || 0) + d.votos_transferidos;
      totalVotosGlobal += d.votos_transferidos;
      if (d.origen_partido !== d.destino_partido) {
        totalMovilizados += d.votos_transferidos;
      }
    });

    transferData.forEach((d) => {
      const isFidelidad = d.origen_partido === d.destino_partido;
      const pct = (d.votos_transferidos / (totalPorOrigen[d.origen_partido] || 1)) * 100;

      if (isFidelidad) {
        fidelidadByParty[d.origen_partido] = {
          party: d.origen_partido,
          pct,
          votos: d.votos_transferidos,
        };
      } else {
        if (
          !fugaByParty[d.origen_partido] ||
          fugaByParty[d.origen_partido].votos < d.votos_transferidos
        ) {
          fugaByParty[d.origen_partido] = {
            origen: d.origen_partido,
            destino: d.destino_partido,
            pct,
            votos: d.votos_transferidos,
          };
        }
      }
    });

    const topFidelidad = Object.values(fidelidadByParty).sort((a, b) => b.pct - a.pct)[0] || null;
    const topFuga = Object.values(fugaByParty).sort((a, b) => b.votos - a.votos)[0] || null;
    const movilidadPct = totalVotosGlobal > 0 ? (totalMovilizados / totalVotosGlobal) * 100 : 0;

    return { totalVotos: totalVotosGlobal, movilidadPct, topFidelidad, topFuga };
  }, [transferData]);

  // --- FILTRADO DE DATOS ---
  const filteredData = useMemo(() => {
    return transferData.filter((item) => {
      if (selectedOrigen !== "GLOBAL" && item.origen_partido !== selectedOrigen) {
        return false;
      }

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

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const partidosOrigen = useMemo(() => {
    const set = new Set(transferData.map((d) => d.origen_partido));
    return Array.from(set);
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        {/* BOTÓN DE CIERRE */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <X size={20} />
        </button>

        {/* CABECERA */}
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
              transition: "all 0.2s",
              marginRight: 40
            }}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        {/* CONTENEDOR CON SCROLL INTERNO PARA EVITAR DESBORDAMIENTO EN PANTALLAS PEQUEÑAS */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 12 }}>
              <Loader2 className="animate-spin" size={36} style={{ color: "#818cf8" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Procesando matriz de transferencias...</span>
            </div>
          ) : transferData.length > 0 ? (
            <>
              {/* 1. TARJETAS KPIS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: 10, borderRadius: 12, display: "flex" }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Mayor Fidelidad
                    </div>
                    {metrics.topFidelidad ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <PartyBadge party={metrics.topFidelidad.party} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>
                          {metrics.topFidelidad.pct.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: 10, borderRadius: 12, display: "flex" }}>
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Mayor Transvase de Voto
                    </div>
                    {metrics.topFuga ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                        <PartyBadge party={metrics.topFuga.origen} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <ArrowRight size={12} style={{ color: "#94a3b8" }} />
                        <PartyBadge party={metrics.topFuga.destino} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginLeft: 2 }}>
                          ({metrics.topFuga.votos.toLocaleString()})
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: 10, borderRadius: 12, display: "flex" }}>
                    <Shuffle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Movilidad Electorado
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#c084fc", marginTop: 2 }}>
                      {metrics.movilidadPct.toFixed(1)}%{" "}
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>cambió de voto</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CONTROLES Y FILTROS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {/* Selector de partidos de origen */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginRight: 4 }}>Origen:</span>
                  <button
                    onClick={() => setSelectedOrigen("GLOBAL")}
                    style={{
                      background: selectedOrigen === "GLOBAL" ? "#818cf8" : "rgba(255,255,255,0.05)",
                      color: selectedOrigen === "GLOBAL" ? "#ffffff" : "#94a3b8",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                    }}
                  >
                    🌐 Matriz Global
                  </button>

                  {partidosOrigen.map((partido) => {
                    const isSelected = selectedOrigen === partido;
                    const pColor = getPartyColor(partido);
                    const logo = getPartyLogo(partido);
                    const name = getPartyDisplayName(partido);

                    return (
                      <button
                        key={partido}
                        onClick={() => setSelectedOrigen(partido)}
                        style={{
                          background: isSelected ? pColor : "rgba(255,255,255,0.05)",
                          color: isSelected ? "#ffffff" : "#cbd5e1",
                          border: isSelected ? `1px solid ${pColor}` : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.2s",
                        }}
                      >
                        {logo ? (
                          <img src={logo} alt={name} style={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: pColor,
                              boxShadow: isSelected ? "0 0 8px currentColor" : "none",
                            }}
                          />
                        )}
                        {name}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <button
                      onClick={() => setModeFilter("ALL")}
                      style={{
                        background: modeFilter === "ALL" ? "rgba(255,255,255,0.12)" : "transparent",
                        color: modeFilter === "ALL" ? "#f8fafc" : "#94a3b8",
                        border: "none",
                        borderRadius: 7,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setModeFilter("FIDELITY")}
                      style={{
                        background: modeFilter === "FIDELITY" ? "rgba(34, 197, 94, 0.2)" : "transparent",
                        color: modeFilter === "FIDELITY" ? "#4ade80" : "#94a3b8",
                        border: "none",
                        borderRadius: 7,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🛡️ Fidelidad
                    </button>
                    <button
                      onClick={() => setModeFilter("LEAKAGE")}
                      style={{
                        background: modeFilter === "LEAKAGE" ? "rgba(239, 68, 68, 0.2)" : "transparent",
                        color: modeFilter === "LEAKAGE" ? "#f87171" : "#94a3b8",
                        border: "none",
                        borderRadius: 7,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      💸 Transvase / Fuga
                    </button>
                  </div>

                  <div style={{ position: "relative", minWidth: 220 }}>
                    <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      placeholder="Buscar partido origen/destino..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "6px 12px 6px 32px",
                        fontSize: 12,
                        color: "#f8fafc",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. VISUALIZACIÓN SANKEY */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={16} style={{ color: "#818cf8" }} />
                    Diagrama de Flujo de Transferencias (Sankey Dynamic View)
                  </h3>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    {selectedOrigen === "GLOBAL" ? "Flujos de todo el electorado" : `Flujos con origen ${getPartyDisplayName(selectedOrigen)}`}
                  </span>
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

              {/* 4. TABLA DETALLADA Y PAGINADA */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                    Detalle Numérico ({filteredData.length} resultados)
                  </h3>

                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          padding: 4,
                          color: "#fff",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          opacity: currentPage === 1 ? 0.4 : 1,
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          padding: 4,
                          color: "#fff",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          opacity: currentPage === totalPages ? 0.4 : 1,
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "rgba(255,255,255,0.01)" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600 }}>Origen</th>
                        <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 600, width: 30 }}></th>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600 }}>Destino</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", color: "#94a3b8", fontWeight: 600 }}>Votos Transferidos</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 600, minWidth: 180 }}>
                          Porcentaje de Transvase
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, idx) => {
                          const isFidelidad = row.origen_partido === row.destino_partido;
                          const origenColor = getPartyColor(row.origen_partido);
                          const porcentajeNormalized = Math.min((row.porcentaje / maxPorcentaje) * 100, 100);

                          return (
                            <tr
                              key={`${row.origen_partido}-${row.destino_partido}-${idx}`}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                background: isFidelidad ? "rgba(34, 197, 94, 0.02)" : "transparent",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = isFidelidad ? "rgba(34, 197, 94, 0.02)" : "transparent")
                              }
                            >
                              <td style={{ padding: "10px 14px" }}>
                                <PartyBadge
                                  party={row.origen_partido}
                                  getColor={getPartyColor}
                                  getLogo={getPartyLogo}
                                  getDisplayName={getPartyDisplayName}
                                />
                              </td>

                              <td style={{ padding: "10px 0", textAlign: "center", color: isFidelidad ? "#4ade80" : "#64748b" }}>
                                <ArrowRight size={14} />
                              </td>

                              <td style={{ padding: "10px 14px" }}>
                                <PartyBadge
                                  party={row.destino_partido}
                                  getColor={getPartyColor}
                                  getLogo={getPartyLogo}
                                  getDisplayName={getPartyDisplayName}
                                />
                              </td>

                              <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#f8fafc" }}>
                                {row.votos_transferidos.toLocaleString()}
                              </td>

                              <td style={{ padding: "10px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                    <div
                                      style={{
                                        height: "100%",
                                        width: `${porcentajeNormalized}%`,
                                        background: isFidelidad ? "#4ade80" : origenColor,
                                        borderRadius: 4,
                                        transition: "width 0.5s ease-out",
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: isFidelidad ? "#4ade80" : "#f8fafc",
                                      minWidth: 45,
                                      textAlign: "right",
                                    }}
                                  >
                                    {row.porcentaje.toFixed(2)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: 28, textAlign: "center", color: "#64748b" }}>
                            No se encontraron transferencias con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <p style={{ margin: 0 }}>No hay datos de transferencia de voto disponibles en la base de datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE SECUNDARIO: BADGE DE PARTIDO
// ==========================================
interface PartyBadgeProps {
  party: string;
  getColor: (party: string) => string;
  getLogo: (party: string) => string | null;
  getDisplayName: (party: string) => string;
}

function PartyBadge({ party, getColor, getLogo, getDisplayName }: PartyBadgeProps) {
  const color = getColor(party);
  const logo = getLogo(party);
  const displayName = getDisplayName(party);
  const [imgError, setImgError] = useState(false);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 20,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {logo && !imgError ? (
        <img
          src={logo}
          alt={displayName}
          onError={() => setImgError(true)}
          style={{ width: 15, height: 15, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      )}
      {displayName}
    </span>
  );
}

// ==========================================
// COMPONENTE SECUNDARIO: SANKEY DIAGRAM (SVG DINO & ESCALABLE)
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
  getPartyLogo,
  getPartyDisplayName,
  hoveredNode,
  setHoveredNode,
}: SankeyChartProps) {
  const [activeLink, setActiveLink] = useState<TransferenciaVotoData | null>(null);

  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Sin datos para generar el diagrama de flujo.
      </div>
    );
  }

  // Agrupar nodos
  const origenesMap: Record<string, number> = {};
  const destinosMap: Record<string, number> = {};
  let totalVotos = 0;

  data.forEach((d) => {
    origenesMap[d.origen_partido] = (origenesMap[d.origen_partido] || 0) + d.votos_transferidos;
    destinosMap[d.destino_partido] = (destinosMap[d.destino_partido] || 0) + d.votos_transferidos;
    totalVotos += d.votos_transferidos;
  });

  const origenes = Object.keys(origenesMap);
  const destinos = Object.keys(destinosMap);

  // Altura dinámicamente adaptada según la cantidad de elementos
  const maxItems = Math.max(origenes.length, destinos.length);
  const svgHeight = Math.max(maxItems * 38 + 40, 280);
  const width = 850;
  const nodeWidth = 20;
  const leftX = 140;
  const rightX = width - 140;

  // Cálculo de posiciones verticales
  let currentYLeft = 20;
  const origenesPos: Record<string, { y: number; height: number }> = {};
  origenes.forEach((orig) => {
    const rawHeight = (origenesMap[orig] / (totalVotos || 1)) * (svgHeight - 80);
    const h = Math.max(rawHeight, 12);
    origenesPos[orig] = { y: currentYLeft, height: h };
    currentYLeft += h + 14;
  });

  let currentYRight = 20;
  const destinosPos: Record<string, { y: number; height: number }> = {};
  destinos.forEach((dest) => {
    const rawHeight = (destinosMap[dest] / (totalVotos || 1)) * (svgHeight - 80);
    const h = Math.max(rawHeight, 12);
    destinosPos[dest] = { y: currentYRight, height: h };
    currentYRight += h + 14;
  });

  const origOffset: Record<string, number> = {};
  const destOffset: Record<string, number> = {};
  origenes.forEach((o) => (origOffset[o] = 0));
  destinos.forEach((d) => (destOffset[d] = 0));

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${svgHeight}`} style={{ width: "100%", height: "auto", minWidth: 650 }}>
        <defs>
          {data.map((d, i) => {
            const c1 = getPartyColor(d.origen_partido);
            const c2 = getPartyColor(d.destino_partido);
            return (
              <linearGradient key={`sankey-grad-${i}`} id={`sankey-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={c1} stopOpacity="0.6" />
                <stop offset="100%" stopColor={c2} stopOpacity="0.6" />
              </linearGradient>
            );
          })}
        </defs>

        {/* CINTAS DE FLUJO */}
        {data.map((d, i) => {
          const origP = origenesPos[d.origen_partido];
          const destP = destinosPos[d.destino_partido];
          if (!origP || !destP) return null;

          const calculatedThickness = (d.votos_transferidos / (totalVotos || 1)) * (svgHeight - 80);
          const linkThickness = Math.max(calculatedThickness, 2.5);

          const y1 = origP.y + origOffset[d.origen_partido] + linkThickness / 2;
          const y2 = destP.y + destOffset[d.destino_partido] + linkThickness / 2;

          origOffset[d.origen_partido] += linkThickness;
          destOffset[d.destino_partido] += linkThickness;

          const xi = leftX + nodeWidth;
          const xf = rightX;
          const interpolate = (xi + xf) / 2;
          const pathD = `M ${xi} ${y1} C ${interpolate} ${y1}, ${interpolate} ${y2}, ${xf} ${y2}`;

          const isHighlighted =
            hoveredNode === d.origen_partido ||
            hoveredNode === d.destino_partido ||
            (activeLink?.origen_partido === d.origen_partido && activeLink?.destino_partido === d.destino_partido);

          return (
            <path
              key={`link-${d.origen_partido}-${d.destino_partido}-${i}`}
              d={pathD}
              fill="none"
              stroke={`url(#sankey-grad-${i})`}
              strokeWidth={linkThickness}
              strokeOpacity={hoveredNode ? (isHighlighted ? 0.95 : 0.06) : 0.6}
              style={{ transition: "stroke-opacity 0.2s ease", cursor: "pointer" }}
              onMouseEnter={() => setActiveLink(d)}
              onMouseLeave={() => setActiveLink(null)}
            />
          );
        })}

        {/* NODOS ORIGEN */}
        {origenes.map((orig) => {
          const pos = origenesPos[orig];
          const color = getPartyColor(orig);
          const name = getPartyDisplayName(orig);
          return (
            <g
              key={`orig-${orig}`}
              onMouseEnter={() => setHoveredNode(orig)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={leftX}
                y={pos.y}
                width={nodeWidth}
                height={pos.height}
                rx={3}
                fill={color}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              />
              <text x={leftX - 8} y={pos.y + pos.height / 2 + 4} textAnchor="end" fill="#f8fafc" fontSize={11} fontWeight={700}>
                {name}
              </text>
            </g>
          );
        })}

        {/* NODOS DESTINO */}
        {destinos.map((dest) => {
          const pos = destinosPos[dest];
          const color = getPartyColor(dest);
          const name = getPartyDisplayName(dest);
          return (
            <g
              key={`dest-${dest}`}
              onMouseEnter={() => setHoveredNode(dest)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={rightX}
                y={pos.y}
                width={nodeWidth}
                height={pos.height}
                rx={3}
                fill={color}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              />
              <text x={rightX + nodeWidth + 8} y={pos.y + pos.height / 2 + 4} textAnchor="start" fill="#f8fafc" fontSize={11} fontWeight={700}>
                {name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* TOOLTIP FLOTANTE */}
      {activeLink && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.8)",
            borderRadius: 12,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <PartyBadge party={activeLink.origen_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
          <ArrowRight size={12} style={{ color: "#94a3b8" }} />
          <PartyBadge party={activeLink.destino_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />

          <div style={{ height: 18, width: 1, background: "rgba(255,255,255,0.1)" }} />

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
              {activeLink.votos_transferidos.toLocaleString()}{" "}
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>votos</span>
            </div>
            <div style={{ fontSize: 10, color: "#818cf8", fontWeight: 700 }}>
              {activeLink.porcentaje.toFixed(2)}% del partido origen
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
