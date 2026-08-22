import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2, AlertCircle, TrendingUp, Users } from "lucide-react";

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
  partyMeta?: Record<string, PartyMeta>;
}

export function CrisisCeutaSection({ partyMeta: propsPartyMeta }: CrisisCeutaSectionProps) {
  const [crisisData, setCrisisData] = useState<CrisisCeutaData[]>([]);
  const [crisisResumen, setCrisisResumen] = useState<CrisisCeutaResumen[]>([]);
  const [partiesMap, setPartiesMap] = useState<Record<string, PartyMeta>>(propsPartyMeta || {});
  const [loading, setLoading] = useState(true);
  const [activeOpinionFilter, setActiveOpinionFilter] = useState<string>("todas");

  const opinionLabels: Record<string, string> = {
    invasion: "Invasión territorial",
    humanitaria: "Crisis humanitaria (Intervención UE)",
    geopolitica: "Consecuencia geopolítica",
    gestion: "Fallo de gestión diplomática",
    derecho: "Drama humano / Derecho a migrar",
  };

  const normalizeOpinion = (value: unknown) => {
    const normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (normalized.includes("invasion")) return "invasion";
    if (normalized.includes("humanitaria")) return "humanitaria";
    if (normalized.includes("geopolit") || normalized.includes("socioeconom")) return "geopolitica";
    if (normalized.includes("diplomat") || normalized.includes("fronter") || normalized.includes("gestion")) return "gestion";
    if (normalized.includes("derecho") || normalized.includes("migrar") || normalized.includes("vias legales") || normalized.includes("drama humano")) return "derecho";
    return String(value || "Sin clasificar").trim() || "Sin clasificar";
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Obtener los metadatos/colores/logos de la tabla party_configuration si no se pasaron como props completos
        const { data: partyConfigs, error: partyError } = await supabase
          .from("party_configuration")
          .select("party_key, display_name, color, logo_url")
          .eq("is_active", true);

        const loadedPartiesMap: Record<string, PartyMeta> = { ...propsPartyMeta };

        if (!partyError && partyConfigs) {
          partyConfigs.forEach((p) => {
            const keyLower = p.party_key.toLowerCase();
            const meta = {
              key: p.party_key,
              name: p.display_name,
              color: p.color || "#818cf8",
              logo: p.logo_url || "",
            };
            loadedPartiesMap[keyLower] = meta;
            if (p.display_name) loadedPartiesMap[p.display_name.toLowerCase().trim()] = meta;
          });
        }
        setPartiesMap(loadedPartiesMap);

        // 2. Fetch crisis data por partido
        const { data: byParty, error: byPartyError } = await supabase
          .from("crisis_ceuta_por_partido")
          .select("*");

        // 3. Fetch resumen general de opiniones
        const { data: summary, error: summaryError } = await supabase
          .from("crisis_ceuta_resumen")
          .select("*");

        if (!byPartyError && !summaryError && byParty?.length && summary?.length) {
          setCrisisData(byParty.map((row: any) => ({ ...row, opinion: normalizeOpinion(row.opinion), votos: Number(row.votos || 0), porcentaje: Number(row.porcentaje || 0) })));
          setCrisisResumen(summary.map((row: any) => ({ ...row, opinion: normalizeOpinion(row.opinion), total_votos: Number(row.total_votos || 0), porcentaje: Number(row.porcentaje || 0) })));
        } else {
          const { data: rawResponses, error: rawError } = await supabase
            .from("respuestas")
            .select("voto_generales, opinion_crisismigratoria")
            .not("opinion_crisismigratoria", "is", null);
          if (rawError) throw rawError;
          const rows = (rawResponses || []).map((row: any) => ({ party: String(row.voto_generales || "").trim(), opinion: normalizeOpinion(row.opinion_crisismigratoria) })).filter((row) => row.party && row.opinion);
          const totalByParty: Record<string, number> = {};
          const partyOpinionCounts: Record<string, number> = {};
          const opinionCounts: Record<string, number> = {};
          rows.forEach(({ party, opinion }) => {
            totalByParty[party] = (totalByParty[party] || 0) + 1;
            partyOpinionCounts[`${party}::${opinion}`] = (partyOpinionCounts[`${party}::${opinion}`] || 0) + 1;
            opinionCounts[opinion] = (opinionCounts[opinion] || 0) + 1;
          });
          setCrisisData(Object.entries(partyOpinionCounts).map(([key, votos]) => {
            const [partido, opinion] = key.split("::");
            return { partido, opinion, votos, porcentaje: totalByParty[partido] ? (votos / totalByParty[partido]) * 100 : 0 };
          }).sort((a, b) => b.votos - a.votos));
          setCrisisResumen(Object.entries(opinionCounts).map(([opinion, total_votos]) => ({ opinion, total_votos, porcentaje: rows.length ? (total_votos / rows.length) * 100 : 0 })).sort((a, b) => b.total_votos - a.total_votos));
        }
      } catch (error) {
        console.error("Error fetching datos de la crisis de Ceuta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [propsPartyMeta]);

  // Función helper para obtener metadatos del partido (color, logo, nombre corto)
  const getPartyInfo = (partidoName: string) => {
    const key = partidoName.toLowerCase().trim();
    if (partiesMap[key]) return partiesMap[key];

    // Fallback de color por defecto si no existe coincidencia exacta
    return {
      key: partidoName,
      name: partidoName,
      color: "#e8465a",
      logo: "",
    };
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          gap: 12,
        }}
      >
        <Loader2 className="animate-spin" size={32} style={{ color: "#e8465a" }} />
        <span style={{ fontSize: 13, color: "#7a7990" }}>Cargando análisis de opinión...</span>
      </div>
    );
  }

  if (!crisisData || crisisData.length === 0 || !crisisResumen || crisisResumen.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px 20px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "1px dashed rgba(255,255,255,0.1)",
          color: "#7a7990",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <AlertCircle size={32} style={{ color: "#7a7990" }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
          No hay datos disponibles sobre la Crisis de Ceuta en este momento.
        </p>
      </div>
    );
  }

  // Agrupar datos por opinión
  const dataByOpinion: Record<string, CrisisCeutaData[]> = {};
  crisisData.forEach((item) => {
    if (!dataByOpinion[item.opinion]) {
      dataByOpinion[item.opinion] = [];
    }
    dataByOpinion[item.opinion].push(item);
  });

  const opinionsKeys = Object.keys(dataByOpinion);
  const filteredOpinions =
    activeOpinionFilter === "todas"
      ? opinionsKeys
      : opinionsKeys.filter((op) => op === activeOpinionFilter);
  const totalCrisisVotes = crisisResumen.reduce((total, item) => total + Number(item.total_votos || 0), 0);
  const leadingOpinion = crisisResumen.slice().sort((a, b) => Number(b.total_votos || 0) - Number(a.total_votos || 0))[0];
  const representedParties = new Set(crisisData.map((item) => item.partido).filter(Boolean)).size;

  // Formateador personalizado para el Tooltip del gráfico de Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CrisisCeutaData = payload[0].payload;
      const party = getPartyInfo(data.partido);

      return (
        <div
          style={{
            background: "rgba(17, 17, 24, 0.95)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${party.color}44`,
            boxShadow: `0 8px 24px -4px ${party.color}22`,
            borderRadius: 12,
            padding: "12px 16px",
            color: "#f0eff8",
            minWidth: 160,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {party.logo ? (
              <img
                src={party.logo}
                alt={party.name}
                style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: party.color,
                }}
              />
            )}
            <span style={{ fontWeight: 700, fontSize: 13 }}>{party.name || data.partido}</span>
          </div>
          <div style={{ fontSize: 12, color: "#9da1b4", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>Votos:</span>
            <strong style={{ color: "#f0eff8" }}>{(data.votos ?? 0).toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: 12, color: "#9da1b4", display: "flex", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
            <span>Porcentaje:</span>
            <strong style={{ color: party.color }}>{(data.porcentaje ?? 0).toFixed(2)}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
        <div style={{ padding: "15px 16px", borderRadius: 14, border: "1px solid rgba(96,165,250,.24)", background: "linear-gradient(135deg, rgba(59,130,246,.15), rgba(15,23,42,.45))" }}><div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Respuestas analizadas</div><div style={{ color: "#f8fafc", fontWeight: 900, fontSize: 26, marginTop: 4 }}>{totalCrisisVotes.toLocaleString("es-ES")}</div></div>
        <div style={{ padding: "15px 16px", borderRadius: 14, border: "1px solid rgba(52,211,153,.24)", background: "linear-gradient(135deg, rgba(16,185,129,.13), rgba(15,23,42,.45))" }}><div style={{ color: "#86efac", fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Partidos con respuestas</div><div style={{ color: "#f8fafc", fontWeight: 900, fontSize: 26, marginTop: 4 }}>{representedParties}</div></div>
        <div style={{ padding: "15px 16px", borderRadius: 14, border: "1px solid rgba(251,191,36,.24)", background: "linear-gradient(135deg, rgba(245,158,11,.13), rgba(15,23,42,.45))" }}><div style={{ color: "#fde68a", fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Posición mayoritaria</div><div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 14, lineHeight: 1.25, marginTop: 7 }}>{leadingOpinion ? opinionLabels[leadingOpinion.opinion] || leadingOpinion.opinion : "—"}</div></div>
      </div>
      {/* 1. RESUMEN GENERAL DE OPINIONES */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <TrendingUp size={20} style={{ color: "#e8465a" }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f0eff8" }}>
            Distribución General de Opiniones
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {crisisResumen.map((item) => {
            const label = opinionLabels[item.opinion] || item.opinion;
            const pct = item.porcentaje ?? 0;

            return (
              <div
                key={item.opinion}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(232, 70, 90, 0.3)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#7a7990",
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#f0eff8",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {pct.toFixed(1)}%
                  </div>
                </div>

                {/* Barra de progreso visual */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      width: "100%",
                      height: 5,
                      background: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 10,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #e8465a, #818cf8)",
                        borderRadius: 10,
                        transition: "width 0.8s ease-out",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7a7990",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Users size={12} />
                    {(item.total_votos ?? 0).toLocaleString()} votos totales
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTROS / PESTAÑAS DE NAVEGACIÓN */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        <button
          onClick={() => setActiveOpinionFilter("todas")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: activeOpinionFilter === "todas" ? "#e8465a" : "rgba(255,255,255,0.1)",
            background: activeOpinionFilter === "todas" ? "rgba(232, 70, 90, 0.15)" : "rgba(255,255,255,0.03)",
            color: activeOpinionFilter === "todas" ? "#f0eff8" : "#7a7990",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
        >
          Ver Todas
        </button>
        {opinionsKeys.map((opKey) => (
          <button
            key={opKey}
            onClick={() => setActiveOpinionFilter(opKey)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: activeOpinionFilter === opKey ? "#e8465a" : "rgba(255,255,255,0.1)",
              background: activeOpinionFilter === opKey ? "rgba(232, 70, 90, 0.15)" : "rgba(255,255,255,0.03)",
              color: activeOpinionFilter === opKey ? "#f0eff8" : "#7a7990",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {opinionLabels[opKey] || opKey}
          </button>
        ))}
      </div>

      {/* 2. DETALLE DE GRÁFICOS Y TABLAS POR OPINIÓN */}
      {filteredOpinions.map((opinionKey) => {
        const data = dataByOpinion[opinionKey];
        const title = opinionLabels[opinionKey] || opinionKey;

        return (
          <div
            key={opinionKey}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f0eff8" }}>
                {title}
              </h4>
              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#7a7990" }}>
                Desglose por partido político según los votos registrados
              </p>
            </div>

            {/* Gráfico de Barras con Colores Oficiales */}
            <div style={{ width: "100%", height: 320, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="partido"
                    tick={({ x, y, payload }) => {
                      const party = getPartyInfo(payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={16}
                            dy={0}
                            textAnchor="middle"
                            fill="#7a7990"
                            fontSize={11}
                            fontWeight={600}
                          >
                            {party.name || payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#7a7990", fontSize: 11 }}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                  {/* Barra de Porcentaje con Cell dinamizada según el partido */}
                  <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {data.map((entry, index) => {
                      const party = getPartyInfo(entry.partido);
                      return <Cell key={`cell-${index}`} fill={party.color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla Detallada Estilizada */}
            <div
              style={{
                marginTop: 20,
                overflowX: "auto",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <th style={{ padding: "12px 16px", color: "#7a7990", fontWeight: 600 }}>Partido</th>
                    <th style={{ padding: "12px 16px", color: "#7a7990", fontWeight: 600, textAlign: "right" }}>
                      Votos
                    </th>
                    <th style={{ padding: "12px 16px", color: "#7a7990", fontWeight: 600, textAlign: "right" }}>
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => {
                    const party = getPartyInfo(row.partido);
                    return (
                      <tr
                        key={`${row.partido}-${row.opinion}`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Celda Partido con Logo y Badge de Color */}
                        <td style={{ padding: "12px 16px", color: "#f0eff8" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {party.logo ? (
                              <img
                                src={party.logo}
                                alt={party.name}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: party.color,
                                  boxShadow: `0 0 8px ${party.color}66`,
                                }}
                              />
                            )}
                            <span style={{ fontWeight: 600 }}>{party.name || row.partido}</span>
                          </div>
                        </td>

                        {/* Votos */}
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#f0eff8" }}>
                          {(row.votos ?? 0).toLocaleString()}
                        </td>

                        {/* Porcentaje con Badge Coloreado */}
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <span
                            style={{
                              background: `${party.color}22`,
                              color: party.color,
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontWeight: 700,
                              fontSize: 12,
                              border: `1px solid ${party.color}44`,
                            }}
                          >
                            {(row.porcentaje ?? 0).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
