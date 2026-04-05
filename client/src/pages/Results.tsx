import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LEADERS } from '@/lib/surveyData';
import { EMBEDDED_LEADERS } from '@/lib/embeddedLeaders';
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { calcularEscanosGeneralesPorProvincia, calcularEscanosJuvenilesPorProvincia } from "@/lib/dhondtByProvince";
import {
  Loader2, Download, Sparkles, Plus, Trash2, RefreshCw,
  Map, Grid3x3, ChevronDown, Users, BarChart2, MapPin,
  Vote, Star, TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ShareResultsModern } from "@/components/ShareResultsModern";
import { CommentsSection } from "@/components/CommentsSection";
import { TrendenciesChart } from "@/components/TrendenciesChart";
import PartyLogo from "@/components/PartyLogo";
import { PartyStatsModal } from "@/components/PartyStatsModal";
import { LeadersResultsChart } from "@/components/LeadersResultsChart";
import { CCAAResltsSection } from "@/components/CCAAResltsSection";
import { ProvincesResultsSection } from "@/components/ProvincesResultsSection";
import { CCAAComparisonSection } from "@/components/CCAAComparisonSection";
import { SpainMapProvincial } from "@/components/results/SpainMapProvincial";
import { SpainMapRealistic } from "@/components/results/SpainMapRealistic";
import { CongressHemicycle } from "@/components/results/CongressHemicycle";
import EncuestadorasComparativa from "@/components/results/EncuestadorasComparativa";
import PreguntasVariasSection from "@/components/results/PreguntasVariasSection";
import FollowUsMenu from "@/components/FollowUsMenu";
import PactometerInteractive from "@/components/PactometerInteractive";
import { AIAnalysisModal } from "@/components/AIAnalysisModal";
import { usePartySync } from "@/hooks/usePartySync";
import { setRuntimePartyConfig } from "@/lib/partyRuntimeConfig";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PartyStats {
  id: string; nombre: string; votos: number; porcentaje: number;
  escanos: number; logo: string; color?: string;
}
interface LeaderRating { name: string; fieldName: string; average: number; count: number; }
interface CustomSimulatorParty { key: string; name: string; color: string; }
interface PartyLeader {
  id: number; party_key: string; leader_name: string; photo_url: string;
  is_active: boolean; display_name: string; color: string; logo_url: string;
}
interface LiderPreferido {
  partido: string; lider_preferido: string; votos: number; porcentaje: number;
  photo_url?: string; color?: string; display_name?: string; logo_url?: string;
}

// ─── Tab navigation types ─────────────────────────────────────────────────────
type TabKey =
  | "general" | "mapa-hemiciclo" | "encuestadoras-externas" | "ccaa"
  | "provincias" | "comparacion-ccaa" | "youth" | "asoc-juv-mapa-hemiciclo"
  | "leaders" | "tendencias" | "lideres-preferidos" | "lideres-partidos"
  | "preguntas-varias" | "simulador-electoral";

interface TabGroup { label: string; icon: React.ReactNode; tabs: { key: TabKey; label: string }[]; }

const TAB_GROUPS: TabGroup[] = [
  {
    label: "Elecciones", icon: <Vote className="w-4 h-4" />, tabs: [
      { key: "general", label: "Resultados Generales" },
      { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
      { key: "simulador-electoral", label: "Simulador Electoral" },
      { key: "encuestadoras-externas", label: "Encuestadoras" },
    ],
  },
  {
    label: "Territorio", icon: <MapPin className="w-4 h-4" />, tabs: [
      { key: "ccaa", label: "Comunidades Autónomas" },
      { key: "provincias", label: "Provincias" },
      { key: "comparacion-ccaa", label: "Comparar CCAA" },
    ],
  },
  {
    label: "Juventud", icon: <Users className="w-4 h-4" />, tabs: [
      { key: "youth", label: "Asociaciones Juveniles" },
      { key: "asoc-juv-mapa-hemiciclo", label: "Mapa y Hemiciclo Juvenil" },
    ],
  },
  {
    label: "Líderes", icon: <Star className="w-4 h-4" />, tabs: [
      { key: "lideres-partidos", label: "Líderes por Partido" },
      { key: "leaders", label: "Valoración de Líderes" },
      { key: "lideres-preferidos", label: "Líderes Preferidos" },
    ],
  },
  {
    label: "Análisis", icon: <BarChart2 className="w-4 h-4" />, tabs: [
      { key: "tendencias", label: "Tendencias por Día" },
      { key: "preguntas-varias", label: "Preguntas Varias" },
    ],
  },
];

// ─── NavBar con dropdowns ─────────────────────────────────────────────────────
function ResultsNavBar({ activeTab, onTabChange }: {
  activeTab: TabKey; onTabChange: (t: TabKey) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="sticky top-14 z-40 w-full border-b border-slate-200/60 bg-white/85 backdrop-blur-xl shadow-sm overflow-visible">
      <div className="container overflow-visible">
        <nav className="flex items-center gap-0.5 py-0.5 overflow-visible">
          {TAB_GROUPS.map((group) => {
            const activeTabInGroup = group.tabs.find((t) => t.key === activeTab);
            const isGroupActive = !!activeTabInGroup;
            const isOpen = openGroup === group.label;
            return (
              <div key={group.label} className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold rounded-t-lg transition-all duration-150 whitespace-nowrap border-b-2
                    ${isGroupActive
                      ? "text-[#C41E3A] border-[#C41E3A] bg-red-50/60"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60"
                    }`}
                >
                  {group.icon}
                  <span>{activeTabInGroup ? activeTabInGroup.label : group.label}</span>
                  <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-0 min-w-[210px] bg-white rounded-b-xl rounded-tr-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    {group.tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { onTabChange(tab.key); setOpenGroup(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-2
                          ${activeTab === tab.key
                            ? "bg-red-50 text-[#C41E3A] font-semibold border-[#C41E3A]"
                            : "text-slate-600 hover:bg-slate-50 font-medium border-transparent hover:border-slate-200"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
// ─── LideresDePartidosSection ─────────────────────────────────────────────────
function LideresDePartidosSection() {
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [lideresPreferidos, setLideresPreferidos] = useState<LiderPreferido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. party_leaders + party_configuration
        const { data: leadersData } = await supabase
          .from("party_leaders")
          .select(`id, party_key, leader_name, photo_url, is_active, party_configuration!inner(display_name, color, logo_url)`)
          .eq("is_active", true)
          .order("party_key");

        const mappedLeaders: PartyLeader[] = (leadersData || []).map((row: any) => ({
          id: row.id,
          party_key: row.party_key,
          leader_name: row.leader_name,
          photo_url: row.photo_url,
          is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#C41E3A",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));
        setLeaders(mappedLeaders);

        // 2. lideres_preferidos → contar votos por (partido, lider)
        const { data: prefData } = await supabase
          .from("lideres_preferidos")
          .select("partido, lider_preferido");

        if (prefData && prefData.length > 0) {
          const counts: Record<string, Record<string, number>> = {};
          prefData.forEach((row: any) => {
            if (!counts[row.partido]) counts[row.partido] = {};
            counts[row.partido][row.lider_preferido] = (counts[row.partido][row.lider_preferido] || 0) + 1;
          });

          const arr: LiderPreferido[] = [];
          Object.entries(counts).forEach(([partido, lideres]) => {
            const total = Object.values(lideres).reduce((a, b) => a + b, 0);
            Object.entries(lideres).forEach(([lider, votos]) => {
              const leaderInfo = mappedLeaders.find((l) => l.party_key === partido && l.leader_name === lider);
              const partyInfo = mappedLeaders.find((l) => l.party_key === partido);
              arr.push({
                partido, lider_preferido: lider, votos,
                porcentaje: total > 0 ? (votos / total) * 100 : 0,
                photo_url: leaderInfo?.photo_url,
                color: partyInfo?.color,
                display_name: partyInfo?.display_name ?? partido,
                logo_url: partyInfo?.logo_url,
              });
            });
          });
          setLideresPreferidos(arr);
        }
      } catch (err) {
        console.error("Error fetching líderes de partidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const byParty = useMemo(() => {
    const m: Record<string, PartyLeader[]> = {};
    leaders.forEach((l) => { if (!m[l.party_key]) m[l.party_key] = []; m[l.party_key].push(l); });
    return m;
  }, [leaders]);

  const prefByParty = useMemo(() => {
    const m: Record<string, LiderPreferido[]> = {};
    lideresPreferidos.forEach((l) => { if (!m[l.partido]) m[l.partido] = []; m[l.partido].push(l); });
    Object.keys(m).forEach((k) => { m[k].sort((a, b) => b.votos - a.votos); });
    return m;
  }, [lideresPreferidos]);

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#C41E3A]" /></div>;

  const partyKeys = Object.keys(byParty);
  if (partyKeys.length === 0) return <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]"><p>No hay líderes configurados aún.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#2D2D2D]">Líderes por Partido</h2>
        {selectedParty && (
          <Button variant="outline" onClick={() => setSelectedParty(null)} className="text-sm">
            ← Ver todos
          </Button>
        )}
      </div>

      {/* Filtro por partido */}
      {!selectedParty && (
        <div className="flex flex-wrap gap-2">
          {partyKeys.map((pk) => {
            const info = byParty[pk][0];
            const totalVotos = (prefByParty[pk] || []).reduce((a, b) => a + b.votos, 0);
            return (
              <button key={pk} onClick={() => setSelectedParty(pk)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:shadow-md"
                style={{ borderColor: info.color, color: info.color, backgroundColor: `${info.color}12` }}>
                {info.logo_url && <img src={info.logo_url} alt={info.display_name} className="w-4 h-4 object-contain" />}
                <span>{info.display_name}</span>
                {totalVotos > 0 && <span className="text-xs opacity-60">· {totalVotos} votos</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Tarjetas por partido */}
      {(selectedParty ? [selectedParty] : partyKeys).map((partyKey) => {
        const partyLeaders = byParty[partyKey] || [];
        const partyPrefs = prefByParty[partyKey] || [];
        const info = partyLeaders[0];
        if (!info) return null;
        const partyColor = info.color;
        const totalVotos = partyPrefs.reduce((a, b) => a + b.votos, 0);

        // Merge leaders + votos
        const leadersWithVotes = partyLeaders.map((leader) => {
          const pref = partyPrefs.find((p) => p.lider_preferido === leader.leader_name);
          return { ...leader, votos: pref?.votos ?? 0, porcentaje: pref?.porcentaje ?? 0 };
        }).sort((a, b) => b.votos - a.votos);

        // Líderes en lideres_preferidos no configurados en party_leaders
        const extraPrefs = partyPrefs.filter((p) => !partyLeaders.some((l) => l.leader_name === p.lider_preferido));

        const chartData = [
          ...leadersWithVotes.filter((l) => l.votos > 0).map((l) => ({ name: l.leader_name, votos: l.votos, porcentaje: l.porcentaje })),
          ...extraPrefs.map((e) => ({ name: e.lider_preferido, votos: e.votos, porcentaje: e.porcentaje })),
        ].sort((a, b) => b.votos - a.votos).slice(0, 10);

        return (
          <div key={partyKey} className="glass-surface rounded-2xl overflow-hidden border" style={{ borderColor: `${partyColor}35` }}>
            {/* Cabecera */}
            <div className="flex items-center gap-4 px-6 py-4" style={{ background: `linear-gradient(135deg, ${partyColor}15, ${partyColor}08)` }}>
              {info.logo_url && <img src={info.logo_url} alt={info.display_name} className="h-10 w-10 object-contain" />}
              <div className="flex-1">
                <h3 className="text-lg font-bold" style={{ color: partyColor }}>{info.display_name}</h3>
                <p className="text-xs text-slate-400">
                  {partyLeaders.length} candidato{partyLeaders.length !== 1 ? "s" : ""} ·{" "}
                  {totalVotos > 0 ? `${totalVotos} voto${totalVotos !== 1 ? "s" : ""} recibidos` : "Sin votos aún"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Grid de fotos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {leadersWithVotes.map((leader) => (
                  <div key={leader.id} className="flex flex-col items-center gap-2 text-center group">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-105"
                      style={{ border: `3px solid ${partyColor}` }}>
                      {leader.photo_url ? (
                        <img src={leader.photo_url} alt={leader.leader_name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: partyColor }}>
                          {leader.leader_name.charAt(0)}
                        </div>
                      )}
                      {/* Badge con nº votos */}
                      {leader.votos > 0 && (
                        <div className="absolute bottom-0 right-0 text-white text-[9px] font-bold px-1 rounded-full" style={{ backgroundColor: partyColor }}>
                          {leader.votos}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#2D2D2D] leading-tight">{leader.leader_name}</p>
                    {leader.votos > 0 ? (
                      <div className="w-full space-y-1">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: partyColor, width: `${leader.porcentaje}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 tabular-nums">{leader.porcentaje.toFixed(1)}%</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-300">Sin votos</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Gráfico horizontal */}
              {chartData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" style={{ color: partyColor }} />
                    Distribución de votos
                  </h4>
                  <ResponsiveContainer width="100%" height={Math.max(100, chartData.length * 38)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 50, top: 2, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                      <XAxis type="number" stroke="#bbb" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={120} tick={{ fill: "#444" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: `1px solid ${partyColor}30` }}
                        formatter={(value: any, _: any, props: any) => [
                          `${value} voto${value !== 1 ? "s" : ""} (${props.payload.porcentaje?.toFixed(1)}%)`,
                          "Preferencia",
                        ]}
                      />
                      <Bar dataKey="votos" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#666", formatter: (v: number) => v > 0 ? v : "" }}>
                        {chartData.map((_, idx) => (
                          <Cell key={idx} fill={partyColor} fillOpacity={Math.max(0.4, 0.9 - idx * 0.07)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Candidatos extra (personalizados por encuestados) */}
                  {extraPrefs.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-semibold mb-2">Otros candidatos mencionados:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {extraPrefs.map((ep) => (
                          <span key={ep.lider_preferido} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white border"
                            style={{ borderColor: `${partyColor}50`, color: partyColor }}>
                            {ep.lider_preferido} · {ep.votos}v
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {totalVotos === 0 && (
                <p className="text-sm text-center text-slate-300 py-2">Aún no hay votos para este partido</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SimuladorElectoral ───────────────────────────────────────────────────────
interface SimuladorElectoralProps {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
}

function SimuladorElectoral({ generalStats, generalPartyMap, votosPorProvincia, provinciaMetricsMap }: SimuladorElectoralProps) {
  const [mode, setMode] = useState<"nacional" | "circunscripcion">("nacional");
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [provinciaVotes, setProvinciaVotes] = useState<Record<string, Record<string, number>>>({});
  const [selectedCirc, setSelectedCirc] = useState<string>("");
  const [customParties, setCustomParties] = useState<CustomSimulatorParty[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#7c3aed");
  const [mapView, setMapView] = useState<"schematic" | "realistic">("realistic");
  const [simProvinciaSeleccionada, setSimProvinciaSeleccionada] = useState<string | null>(null);
  const [simVotosProvincia, setSimVotosProvincia] = useState<Record<string, number>>({});
  const [simEscanosProvincia, setSimEscanosProvincia] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (generalStats.length > 0 && !initialized) {
      const base: Record<string, number> = {};
      generalStats.forEach((p) => { base[p.id] = p.votos; });
      setSimulatorVotes(base);
      const provBase: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; });
      setProvinciaVotes(provBase);
      setInitialized(true);
    }
  }, [generalStats, votosPorProvincia, initialized]);

  const simulatorPartyMap = useMemo(() => {
    const m = { ...generalPartyMap };
    customParties.forEach((p) => { m[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" }; });
    return m;
  }, [generalPartyMap, customParties]);

  // Votos efectivos por provincia (nacional proporcional + overrides por circunscripción)
  const effectiveVotesByProvince = useMemo(() => {
    if (!Object.keys(votosPorProvincia).length) return {};
    const totalNac = Object.values(simulatorVotes).reduce((a, v) => a + Math.max(0, v || 0), 0);
    if (totalNac === 0) return {};
    const shares = Object.entries(simulatorVotes).reduce<Record<string, number>>((acc, [p, v]) => {
      acc[p] = Math.max(0, v || 0) / totalNac; return acc;
    }, {});

    const result: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, realVotes]) => {
      if (provinciaVotes[prov]) {
        result[prov] = { ...provinciaVotes[prov] };
        customParties.forEach((cp) => { if (result[prov][cp.key] === undefined) result[prov][cp.key] = 0; });
      } else {
        const provTotal = Object.values(realVotes).reduce((a, v) => a + v, 0);
        const sim: Record<string, number> = {};
        Object.entries(shares).forEach(([p, share]) => { sim[p] = Math.round(provTotal * share); });
        result[prov] = sim;
      }
    });
    return result;
  }, [votosPorProvincia, simulatorVotes, provinciaVotes, customParties]);

  const simulatorEscanosByProvince = useMemo(() => {
    if (!Object.keys(effectiveVotesByProvince).length) return {};
    return calcularEscanosGeneralesPorProvincia(effectiveVotesByProvince);
  }, [effectiveVotesByProvince]);

  const simulatorStats = useMemo(() => {
    const escanosTotales: Record<string, number> = {};
    Object.values(simulatorEscanosByProvince).forEach((pe) => {
      Object.entries(pe).forEach(([p, e]) => { escanosTotales[p] = (escanosTotales[p] || 0) + e; });
    });
    const nv: Record<string, number> = {};
    Object.entries(simulatorVotes).forEach(([k, v]) => { nv[k] = Math.max(0, Math.floor(v || 0)); });
    const nombres: Record<string, string> = {};
    const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
    return obtenerEstadisticas(nv, escanosTotales, nombres, logos).map((s) => ({
      ...s, color: simulatorPartyMap[s.id]?.color || "#C41E3A",
    }));
  }, [simulatorEscanosByProvince, simulatorVotes, simulatorPartyMap]);

  const addCustomParty = () => {
    const name = newPartyName.trim();
    if (!name) return;
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
    const baseKey = slug || `PARTY_${Date.now()}`;
    const key = simulatorPartyMap[baseKey] ? `${baseKey}_${Date.now()}` : baseKey;
    setCustomParties((prev) => [...prev, { key, name, color: newPartyColor }]);
    setSimulatorVotes((prev) => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };

  const removeCustomParty = (key: string) => {
    setCustomParties((prev) => prev.filter((p) => p.key !== key));
    setSimulatorVotes((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const resetToOriginal = () => {
    const base: Record<string, number> = {};
    generalStats.forEach((p) => { base[p.id] = p.votos; });
    setSimulatorVotes(base);
    const provBase: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; });
    setProvinciaVotes(provBase);
    setCustomParties([]);
  };

  const totalSimVotes = Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const basePartyEntries = Object.entries(simulatorPartyMap).filter(([k]) => !customParties.find((cp) => cp.key === k));
  const availableCircs = Object.keys(votosPorProvincia).sort();
  const circVotos = selectedCirc ? (provinciaVotes[selectedCirc] || {}) : {};
  const circTotal = Object.values(circVotos).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const totalEscanos = simulatorStats.reduce((a, s) => a + s.escanos, 0);
  const mayoriaAbs = Math.floor(totalEscanos / 2) + 1;

  return (
    <div className="space-y-5">
      {/* Panel de control */}
      <div className="glass-surface p-6 rounded-2xl space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#2D2D2D]">Simulador Electoral</h2>
            <p className="text-sm text-slate-400 mt-0.5">Los resultados se actualizan en tiempo real al modificar los votos</p>
          </div>
          <Button onClick={resetToOriginal} variant="outline" className="flex items-center gap-2 border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white text-sm h-9">
            <RefreshCw className="h-3.5 w-3.5" />Restaurar datos reales
          </Button>
        </div>

        {/* Modo */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {(["nacional", "circunscripcion"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-white shadow text-[#C41E3A]" : "text-slate-500 hover:text-slate-700"}`}>
              {m === "nacional" ? "Nacional" : "Por Circunscripción"}
            </button>
          ))}
        </div>

        {/* Modo nacional */}
        {mode === "nacional" && (
          <>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-slate-400">Total votos:</span>
              <span className="text-[#C41E3A] font-bold text-base">{totalSimVotes.toLocaleString()}</span>
              <span className="ml-auto text-xs text-slate-300">Los cambios se aplican proporcionalmente a todas las provincias</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {basePartyEntries.map(([partyKey, party]) => {
                const votes = simulatorVotes[partyKey] ?? 0;
                const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                return (
                  <div key={partyKey} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors">
                    {party.logo ? (
                      <img src={party.logo} alt={party.name} className="w-6 h-6 object-contain flex-shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }} />
                    )}
                    <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{party.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ backgroundColor: party.color, width: `${Math.min(100, parseFloat(pct) * 3)}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-9 text-right tabular-nums">{pct}%</span>
                    </div>
                    <input type="number" min={0} value={votes}
                      onChange={(e) => setSimulatorVotes((prev) => ({ ...prev, [partyKey]: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-22 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A] w-[90px]"
                    />
                  </div>
                );
              })}
              {customParties.map((party) => {
                const votes = simulatorVotes[party.key] ?? 0;
                const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                return (
                  <div key={party.key} className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }} />
                    <span className="text-sm font-semibold text-slate-600 flex-1 truncate">{party.name}</span>
                    <span className="text-xs text-slate-400 w-9 text-right tabular-nums">{pct}%</span>
                    <input type="number" min={0} value={votes}
                      onChange={(e) => setSimulatorVotes((prev) => ({ ...prev, [party.key]: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-[90px] rounded-lg border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                    <button onClick={() => removeCustomParty(party.key)} className="text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modo circunscripción */}
        {mode === "circunscripcion" && (
          <>
            <div>
              <label className="text-sm font-semibold text-[#2D2D2D] block mb-2">Seleccionar circunscripción</label>
              <select value={selectedCirc} onChange={(e) => setSelectedCirc(e.target.value)}
                className="w-full sm:w-72 rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C41E3A]">
                <option value="">— Selecciona una provincia —</option>
                {availableCircs.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
              </select>
            </div>
            {selectedCirc ? (
              <>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                  Editando <strong>{selectedCirc}</strong> · Total: <strong>{circTotal.toLocaleString()} votos</strong>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(simulatorPartyMap).map(([partyKey, party]) => {
                    const votes = provinciaVotes[selectedCirc]?.[partyKey] ?? 0;
                    const pct = circTotal > 0 ? ((votes / circTotal) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={partyKey} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        {party.logo ? <img src={party.logo} alt={party.name} className="w-5 h-5 object-contain flex-shrink-0" /> : <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }} />}
                        <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{party.name}</span>
                        <span className="text-xs text-slate-400 w-9 text-right tabular-nums">{pct}%</span>
                        <input type="number" min={0} value={votes}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setProvinciaVotes((prev) => ({ ...prev, [selectedCirc]: { ...(prev[selectedCirc] || {}), [partyKey]: val } }));
                          }}
                          className="w-[90px] rounded-lg border border-slate-200 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-300">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Selecciona una provincia para editar</p>
              </div>
            )}
          </>
        )}

        {/* Crear partido */}
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="mb-2.5 text-sm font-semibold text-slate-600 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Añadir partido personalizado</p>
          <div className="flex flex-wrap gap-2">
            <input type="text" value={newPartyName} onChange={(e) => setNewPartyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomParty()} placeholder="Nombre del partido" className="min-w-[170px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]" />
            <input type="color" value={newPartyColor} onChange={(e) => setNewPartyColor(e.target.value)} className="h-9 w-12 rounded-md border border-slate-300 bg-white cursor-pointer" />
            <Button onClick={addCustomParty} className="bg-[#C41E3A] hover:bg-[#A01830] text-white flex items-center gap-1.5 text-sm h-9"><Plus className="h-3.5 w-3.5" />Añadir</Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="glass-surface p-6 rounded-2xl">
        <div className="flex items-baseline gap-3 mb-4">
          <h3 className="text-xl font-bold text-[#2D2D2D]">Escaños simulados</h3>
          <span className="text-xs text-slate-400">Mayoría absoluta: <strong className="text-amber-600">{mayoriaAbs}</strong></span>
        </div>
        <div className="space-y-2.5">
          {[...simulatorStats].sort((a, b) => b.escanos - a.escanos).filter((s) => s.escanos > 0 || s.votos > 0).map((party) => (
            <div key={party.id} className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }} />
              <span className="text-sm font-semibold text-[#2D2D2D] w-32 truncate">{party.nombre}</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-300" style={{ backgroundColor: party.color, width: `${(party.escanos / 350) * 100}%` }} />
                {/* Línea de mayoría */}
                <div className="absolute top-0 h-full w-px bg-amber-400 opacity-70" style={{ left: `${(mayoriaAbs / 350) * 100}%` }} />
              </div>
              <span className="text-base font-bold w-9 text-right tabular-nums" style={{ color: party.color }}>{party.escanos}</span>
              <span className="text-xs text-slate-400 w-11 text-right tabular-nums">{party.porcentaje.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pactómetro */}
      <div className="liquid-glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-[#2D2D2D] mb-1">Pactómetro Simulado</h2>
        <p className="text-xs text-slate-400 mb-4">Selecciona partidos para calcular si alcanzan mayoría</p>
        <PactometerInteractive
          stats={simulatorStats.map((s) => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))}
          totalSeats={350} requiredForMajority={176}
        />
      </div>

      {/* Mapa */}
      <div className="liquid-glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#2D2D2D]">Mapa Provincial (Simulado)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Se actualiza automáticamente</p>
          </div>
          <div className="flex gap-1.5">
            {(["schematic", "realistic"] as const).map((v) => (
              <Button key={v} onClick={() => setMapView(v)} variant={mapView === v ? "default" : "outline"}
                className={`flex items-center gap-1.5 text-sm h-8 px-3 ${mapView === v ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}>
                {v === "schematic" ? <><Grid3x3 className="w-3.5 h-3.5" />Esquemática</> : <><Map className="w-3.5 h-3.5" />Realista</>}
              </Button>
            ))}
          </div>
        </div>
        {mapView === "schematic" ? (
          <SpainMapProvincial votosPorProvincia={effectiveVotesByProvince} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />
        ) : (
          <SpainMapRealistic votosPorProvincia={effectiveVotesByProvince} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />
        )}
      </div>

      {/* Hemiciclo */}
      <div className="liquid-glass p-4 rounded-2xl">
        <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Hemiciclo Simulado</h2>
        <CongressHemicycle escanos={simulatorEscanosByProvince} totalEscanos={350} provinciaSeleccionada={simProvinciaSeleccionada} votosProvincia={simVotosProvincia} escanosProvincia={simEscanosProvincia} partyMeta={simulatorPartyMap} />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Results() {
  usePartySync();
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [edadPromedio, setEdadPromedio] = useState<number | null>(null);
  const [ideologiaPromedio, setIdeologiaPromedio] = useState<number | null>(null);
  const [notaEjecutivo, setNotaEjecutivo] = useState<number | null>(null);
  const [selectedPartyForStats, setSelectedPartyForStats] = useState<string | null>(null);
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [escanosGeneralesPorProvincia, setEscanosGeneralesPorProvincia] = useState<Record<string, number>>({});
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null);
  const [votosPorPartidoProvincia, setVotosPorPartidoProvincia] = useState<Record<string, number>>({});
  const [escanosProvincia, setEscanosProvincia] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"votos" | "escanos">("votos");
  const [mapView, setMapView] = useState<"schematic" | "realistic">("realistic");
  const [votosPorProvinciaJuveniles, setVotosPorProvinciaJuveniles] = useState<Record<string, Record<string, number>>>({});
  const [escanosJuvenilesPorProvincia, setEscanosJuvenilesPorProvincia] = useState<Record<string, number>>({});
  const [provinciaSeleccionadaJuveniles, setProvinciaSeleccionadaJuveniles] = useState<string | null>(null);
  const [votosPorPartidoProvinciaJuveniles, setVotosPorPartidoProvinciaJuveniles] = useState<Record<string, number>>({});
  const [escanosProvinciaJuveniles, setEscanosProvinciaJuveniles] = useState<Record<string, number>>({});
  const [provinciaMetricsMapJuveniles] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });

  useEffect(() => { document.title = "La Encuesta de BC"; }, []);

  const normalizePartyKey = (v: string) => v?.trim().toUpperCase();

  const generalPartyMap = useMemo(() => {
    const d: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    partyConfigData.parties.forEach((p) => { d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl }; });
    return d;
  }, [partyConfigData]);

  const youthPartyMap = useMemo(() => {
    const d: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    partyConfigData.youth.forEach((p) => { d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl }; });
    return d;
  }, [partyConfigData]);

  const resolvePartyKey = (value: string, metaMap: Record<string, { key: string; name: string; color: string; logo: string }>) => {
    if (metaMap[value]) return value;
    const n = normalizePartyKey(value);
    const f = Object.keys(metaMap).find((k) => normalizePartyKey(k) === n);
    if (f) return f;
    const fk = Object.entries(metaMap).find(([, p]) => normalizePartyKey(String(p?.key || "")) === n)?.[0];
    if (fk) return fk;
    const fn = Object.entries(metaMap).find(([, p]) => normalizePartyKey(String(p?.name || "")) === n)?.[0];
    return fn || f || value;
  };

  const buildLookup = (map: Record<string, { key: string; name: string; color: string; logo: string }>) => {
    const lookup: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    Object.entries(map).forEach(([k, p]) => {
      [k, p.key, p.name, normalizePartyKey(k), normalizePartyKey(p.key), normalizePartyKey(p.name)].forEach((a) => { if (a) lookup[String(a)] = p; });
    });
    return lookup;
  };

  const generalPartyMetaLookup = useMemo(() => buildLookup(generalPartyMap), [generalPartyMap]);
  const youthPartyMetaLookup = useMemo(() => buildLookup(youthPartyMap), [youthPartyMap]);

  useEffect(() => {
    if (Object.keys(votosPorProvincia).length > 0 && generalStats.length > 0) {
      const e = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      setEscanosGeneralesPorProvincia(e);
      setGeneralStats((prev) => prev.map((s) => ({ ...s, escanos: e[s.id] || 0 })));
    }
  }, [votosPorProvincia]);

  useEffect(() => {
    if (Object.keys(votosPorProvinciaJuveniles).length > 0 && youthStats.length > 0) {
      const e = calcularEscanosJuvenilesPorProvincia(votosPorProvinciaJuveniles);
      setEscanosJuvenilesPorProvincia(e);
      setYouthStats((prev) => prev.map((s) => ({ ...s, escanos: e[s.id] || 0 })));
    }
  }, [votosPorProvinciaJuveniles]);

  useEffect(() => {
    const loadPartyConfig = async () => {
      const { data } = await supabase.from("party_configuration").select("party_key, display_name, color, logo_url, party_type, is_active").eq("is_active", true);
      const all = data || [];
      setRuntimePartyConfig(all.map((r: any) => ({ key: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url, partyType: r.party_type })));
      setPartyConfigData({
        parties: all.filter((r: any) => r.party_type === "general").map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })),
        youth: all.filter((r: any) => ["youth", "asociacion_juvenil", "juvenile"].includes(r.party_type)).map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })),
      });
    };
    loadPartyConfig();
    const ch = supabase.channel("party-config-results").on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, loadPartyConfig).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Total respuestas
        try { const { data } = await supabase.from("total_respuestas_view").select("total_respuestas"); setTotalResponses(data?.[0]?.total_respuestas || 0); }
        catch { try { const { count } = await supabase.from("respuestas").select("*", { count: "exact", head: true }); setTotalResponses(count || 0); } catch { setTotalResponses(631); } }

        // Votos generales
        try {
          const { data: gd } = await supabase.from("votos_generales_totales").select("*");
          if (gd && gd.length > 0) {
            const gv: Record<string, number> = {};
            Object.keys(generalPartyMap).forEach((k) => { gv[k] = 0; });
            gd.forEach((r: any) => { gv[resolvePartyKey(String(r.partido_id || ""), generalPartyMap)] = r.votos; });
            const escanos = Object.keys(votosPorProvincia).length > 0 ? calcularEscanosGeneralesPorProvincia(votosPorProvincia) : calcularEscanosGenerales(gv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setGeneralStats(obtenerEstadisticas(gv, escanos, nombres, logos).map((s) => ({ ...s, color: generalPartyMap[resolvePartyKey(s.id, generalPartyMap)]?.color })));

            // Votos por provincia
            try {
              const { data: pd } = await supabase.from("votos_por_provincia_view").select("provincia, partido, votos");
              if (pd && pd.length > 0) {
                const vp: Record<string, Record<string, number>> = {};
                pd.forEach((r: any) => { if (r.provincia && r.partido) { if (!vp[r.provincia]) vp[r.provincia] = {}; vp[r.provincia][resolvePartyKey(String(r.partido), generalPartyMap)] = r.votos; } });
                setVotosPorProvincia(vp);
                // Métricas por provincia
                try {
                  const { data: md } = await supabase.from("respuestas").select("provincia, edad, posicion_ideologica");
                  if (md) {
                    const pc: Record<string, { es: number; is: number; c: number }> = {};
                    md.forEach((r: any) => { if (r.provincia) { if (!pc[r.provincia]) pc[r.provincia] = { es: 0, is: 0, c: 0 }; if (r.edad != null) pc[r.provincia].es += r.edad; if (r.posicion_ideologica != null) pc[r.provincia].is += r.posicion_ideologica; pc[r.provincia].c++; } });
                    const mm: Record<string, { edad_promedio: number; ideologia_promedio: number }> = {};
                    Object.entries(pc).forEach(([p, c]) => { mm[p] = { edad_promedio: c.c > 0 ? c.es / c.c : 0, ideologia_promedio: c.c > 0 ? c.is / c.c : 0 }; });
                    setProvinciaMetricsMap(mm);
                  }
                } catch { /* skip */ }
              }
            } catch (e) { console.error(e); }
          }
        } catch (e) { console.error(e); }

        // Votos juveniles
        try {
          const { data: yd } = await supabase.from("votos_juveniles_totales").select("*");
          if (yd && yd.length > 0) {
            const yv: Record<string, number> = {};
            yd.forEach((r: any) => { yv[resolvePartyKey(String(r.asociacion_id || ""), youthPartyMap)] = r.votos; });
            const escanos = calcularEscanosJuveniles(yv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setYouthStats(obtenerEstadisticas(yv, escanos, nombres, logos).map((s) => ({ ...s, color: youthPartyMap[resolvePartyKey(s.id, youthPartyMap)]?.color })));
          }
        } catch (e) { console.error(e); }

        // Votos juveniles por provincia
        try {
          const { data: jpd } = await supabase.from("votos_por_provincia_juveniles_view").select("provincia, asociacion, votos");
          if (jpd && jpd.length > 0) {
            const vjp: Record<string, Record<string, number>> = {};
            jpd.forEach((r: any) => { if (r.provincia && r.asociacion) { if (!vjp[r.provincia]) vjp[r.provincia] = {}; vjp[r.provincia][resolvePartyKey(String(r.asociacion), youthPartyMap)] = r.votos; } });
            setVotosPorProvinciaJuveniles(vjp);
          }
        } catch (e) { console.error(e); }

        // Valoraciones líderes
        try {
          const { data: vld } = await supabase.from("valoraciones_lideres_view").select("*");
          if (vld && vld.length > 0) {
            const lm: Record<string, { name: string; fieldName: string }> = { feijoo: { name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" }, sanchez: { name: "Pedro Sánchez", fieldName: "val_sanchez" }, abascal: { name: "Santiago Abascal", fieldName: "val_abascal" }, alvise: { name: "Alvise Pérez", fieldName: "val_alvise" }, yolanda_diaz: { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" }, irene_montero: { name: "Irene Montero", fieldName: "val_irene_montero" }, ayuso: { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" }, buxade: { name: "Jorge Buxadé", fieldName: "val_buxade" } };
            setLeaderRatings(vld.map((r: any) => { const l = lm[r.lider]; return { name: l?.name ?? r.lider, fieldName: l?.fieldName ?? r.lider, average: parseFloat(r.valoracion_media) || 0, count: r.total_valoraciones || 0 }; }));
          }
        } catch {
          try {
            const { data: ar } = await supabase.from("respuestas").select("val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade");
            if (ar) {
              const ls = [{ name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" }, { name: "Pedro Sánchez", fieldName: "val_sanchez" }, { name: "Santiago Abascal", fieldName: "val_abascal" }, { name: "Alvise Pérez", fieldName: "val_alvise" }, { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" }, { name: "Irene Montero", fieldName: "val_irene_montero" }, { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" }, { name: "Jorge Buxadé", fieldName: "val_buxade" }];
              setLeaderRatings(ls.map((l) => { let s = 0, c = 0; ar.forEach((r: any) => { const v = r[l.fieldName]; if (v != null) { s += v; c++; } }); return { ...l, average: Math.round(c > 0 ? (s / c) * 10 : 0) / 10, count: c }; }));
            }
          } catch (e) { console.error(e); }
        }

        try { const { data } = await supabase.from("media_nota_ejecutivo").select("nota_media"); if (data?.[0]) setNotaEjecutivo(data[0].nota_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("edad_promedio").select("edad_media"); if (data?.[0]) setEdadPromedio(data[0].edad_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("ideologia_promedio").select("ideologia_media"); if (data?.[0]) setIdeologiaPromedio(data[0].ideologia_media); } catch { /* skip */ }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [generalPartyMap, youthPartyMap]);

  const stats = activeTab === "general" ? generalStats : activeTab === "youth" ? youthStats : [];
  const totalEscanos = activeTab === "general" ? 350 : activeTab === "youth" ? 100 : 0;

  const partyColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    [...Object.values(generalPartyMap), ...Object.values(youthPartyMap)].forEach((p: any) => {
      if (!p) return;
      if (p.key && p.color) m[p.key.toUpperCase()] = p.color;
      if (p.name && p.color) m[p.name.toUpperCase()] = p.color;
    });
    return m;
  }, [generalPartyMap, youthPartyMap]);

  const exportToPDF = async () => {
    try {
      const { downloadPDFWithMetrics } = await import("@/lib/pdfExportMetrics");
      await downloadPDFWithMetrics(stats, activeTab === "simulador-electoral" ? "general" : activeTab, totalResponses, edadPromedio, ideologiaPromedio);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="container h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/favicon.png" alt="BC" className="h-7 w-7 flex-shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-sm font-bold text-[#2D2D2D] leading-none">Resultados en Vivo</h1>
              <p className="text-xs text-slate-400 mt-0.5">{totalResponses.toLocaleString()} respuestas · Batalla Cultural</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button onClick={() => setShowAIAnalysis(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg">
              <Sparkles className="h-3.5 w-3.5" /><span className="hidden sm:inline">Análisis IA</span>
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span>
            </Button>
            <ShareResultsModern stats={generalStats} youthStats={youthStats} totalResponses={totalResponses} cooldownMinutes={15} />
            <Button onClick={() => setLocation("/")} variant="ghost" className="text-xs h-8 px-3 text-slate-400 hover:text-slate-700 rounded-lg">
              ← Volver
            </Button>
            <FollowUsMenu />
          </div>
        </div>
      </header>

      {/* NavBar */}
      <ResultsNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 container py-8">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="space-y-6">
            {/* Stats rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-surface p-4 rounded-xl text-center">
                <p className="text-xs text-slate-400 mb-1">Respuestas</p>
                <p className="text-2xl font-bold text-[#C41E3A]">{totalResponses.toLocaleString()}</p>
              </div>
              {edadPromedio !== null && (
                <div className="glass-surface p-4 rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-1">Edad media</p>
                  <p className="text-2xl font-bold text-[#2D2D2D]">{edadPromedio}<span className="text-xs font-normal text-slate-400"> años</span></p>
                </div>
              )}
              {ideologiaPromedio !== null && (
                <div className="glass-surface p-4 rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-1">Ideología media</p>
                  <p className="text-2xl font-bold text-[#2D2D2D]">{ideologiaPromedio}<span className="text-xs font-normal text-slate-400">/10</span></p>
                </div>
              )}
              {notaEjecutivo !== null && (
                <div className="glass-surface p-4 rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-1">Nota Ejecutivo</p>
                  <p className="text-2xl font-bold text-[#2D2D2D]">{notaEjecutivo}<span className="text-xs font-normal text-slate-400">/10</span></p>
                </div>
              )}
            </div>

            {/* Ordenar */}
            {(activeTab === "general" || activeTab === "youth") && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-400">Ordenar:</span>
                {(["votos", "escanos"] as const).map((opt) => (
                  <button key={opt} onClick={() => setSortBy(opt)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${sortBy === opt ? "bg-[#C41E3A] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {opt === "votos" ? "Votos" : "Escaños"}
                  </button>
                ))}
                <span className="ml-auto text-xs text-slate-300">{totalEscanos} escaños en juego</span>
              </div>
            )}

            {/* Lista partidos */}
            {stats.length > 0 && (activeTab === "general" || activeTab === "youth") && (
              <div className="space-y-2.5">
                {(sortBy === "votos" ? [...stats].sort((a, b) => b.votos - a.votos) : [...stats].sort((a, b) => b.escanos - a.escanos)).map((party) => {
                  const lookup = activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup;
                  const rk = resolvePartyKey(party.id, lookup);
                  const logoUrl = party.logo || lookup[rk]?.logo || "";
                  const partyColor = party.color || lookup[rk]?.color || "#C41E3A";
                  return (
                    <div key={party.id} className="p-4 rounded-2xl hover:shadow-md transition-all cursor-pointer border glass-surface" style={{ borderColor: `${partyColor}25` }} onClick={() => setSelectedPartyForStats(party.nombre)}>
                      <div className="flex items-center gap-3 mb-2.5">
                        {logoUrl ? (
                          <PartyLogo src={logoUrl} alt={party.nombre} partyName={party.nombre} size={40} strictExternal />
                        ) : (
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: partyColor }}>{party.nombre.charAt(0)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#2D2D2D] truncate text-sm">{party.nombre}</h3>
                          <p className="text-xs text-slate-400">{party.votos.toLocaleString()} votos</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold tabular-nums" style={{ color: partyColor }}>{party.escanos}</p>
                          <p className="text-[10px] text-slate-400">escaños</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{party.porcentaje.toFixed(1)}% de votos</span>
                          <span>{((party.escanos / totalEscanos) * 100).toFixed(1)}% de escaños</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: partyColor, width: `${party.porcentaje}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contenido por tab */}
            {activeTab === "tendencias" && <TrendenciesChart partyColors={partyColorMap} />}
            {activeTab === "lideres-preferidos" && <LeadersResultsChart partyColors={partyColorMap} />}
            {activeTab === "preguntas-varias" && <PreguntasVariasSection />}
            {activeTab === "ccaa" && <CCAAResltsSection partyMeta={generalPartyMetaLookup} />}
            {activeTab === "provincias" && <ProvincesResultsSection partyMeta={generalPartyMetaLookup} />}
            {activeTab === "comparacion-ccaa" && <CCAAComparisonSection partyMeta={generalPartyMetaLookup} />}
            {activeTab === "encuestadoras-externas" && <EncuestadorasComparativa generalStats={generalStats} totalResponses={totalResponses} />}
            {activeTab === "lideres-partidos" && <LideresDePartidosSection />}
            {activeTab === "simulador-electoral" && <SimuladorElectoral generalStats={generalStats} generalPartyMap={generalPartyMap} votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} />}

            {/* Valoración líderes */}
            {activeTab === "leaders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2D2D2D]">Valoración de Líderes Políticos</h2>
                {leaderRatings.length === 0 ? (
                  <div className="liquid-glass p-8 rounded-2xl text-center text-slate-400"><p>Aún no hay valoraciones.</p></div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {leaderRatings.map((leader) => {
                        const km: Record<string, keyof typeof LEADERS> = { val_feijoo: "FEIJOO", val_sanchez: "SANCHEZ", val_abascal: "ABASCAL", val_alvise: "ALVISE", val_yolanda_diaz: "YOLANDA", val_irene_montero: "IRENE", val_ayuso: "AYUSO", val_buxade: "BUXADE" };
                        const lk = km[leader.fieldName]; const ld = lk ? LEADERS[lk] : null; const lp = ld?.image;
                        let li: string | undefined;
                        if (lp) { const fn = lp.split("/").pop(); if (fn) { const ek = Object.keys(EMBEDDED_LEADERS).find((k) => k.toLowerCase().includes(fn.toLowerCase().replace(/\.[^/.]+$/, ""))); if (ek) li = EMBEDDED_LEADERS[ek]; } }
                        if (!li && lp) li = lp;
                        return (
                          <div key={leader.fieldName} className="glass-surface p-5 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
                            {li ? <img src={li} alt={leader.name} className="w-full h-32 object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">Sin imagen</div>}
                            <h4 className="font-semibold text-[#2D2D2D] text-sm">{leader.name}</h4>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Valoración</span>
                                <span className="text-[#C41E3A] font-bold">{leader.average.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#C41E3A] rounded-full" style={{ width: `${(leader.average / 10) * 100}%` }} />
                              </div>
                              <p className="text-xs text-slate-400">{leader.count} respuestas</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-[#2D2D2D] mb-5">Comparativa</h3>
                      <ResponsiveContainer width="100%" height={340}>
                        <BarChart data={leaderRatings}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#bbb" angle={-35} textAnchor="end" height={80} fontSize={11} />
                          <YAxis stroke="#bbb" domain={[0, 10]} fontSize={11} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: any) => v.toFixed(1)} />
                          <Bar dataKey="average" fill="#C41E3A" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mapa y Hemiciclo */}
            {activeTab === "mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvincia).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-bold text-[#2D2D2D]">Mapa Provincial</h2>
                        <div className="flex gap-1.5">
                          {(["schematic", "realistic"] as const).map((v) => (
                            <Button key={v} onClick={() => setMapView(v)} variant={mapView === v ? "default" : "outline"} className={`flex items-center gap-1.5 text-sm h-8 px-3 ${mapView === v ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}>
                              {v === "schematic" ? <><Grid3x3 className="w-3.5 h-3.5" />Esquemática</> : <><Map className="w-3.5 h-3.5" />Realista</>}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {mapView === "schematic" ? (
                        <SpainMapProvincial votosPorProvincia={votosPorProvincia} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />
                      ) : (
                        <SpainMapRealistic votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Pactómetro</h2>
                      <PactometerInteractive stats={generalStats.map((s) => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Hemiciclo del Congreso</h2>
                      <CongressHemicycle escanos={escanosGeneralesPorProvincia} totalEscanos={350} provinciaSeleccionada={provinciaSeleccionada} votosProvincia={votosPorPartidoProvincia} escanosProvincia={escanosProvincia} partyMeta={generalPartyMetaLookup} />
                    </div>
                  </>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center"><p className="text-slate-400">Cargando datos de provincias...</p></div>
                )}
              </div>
            )}

            {/* Asoc. Juveniles */}
            {activeTab === "asoc-juv-mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-bold text-[#2D2D2D]">Mapa - Asociaciones Juveniles</h2>
                        <div className="flex gap-1.5">
                          {(["schematic", "realistic"] as const).map((v) => (
                            <Button key={v} onClick={() => setMapView(v)} variant={mapView === v ? "default" : "outline"} className={`flex items-center gap-1.5 text-sm h-8 px-3 ${mapView === v ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}>
                              {v === "schematic" ? <><Grid3x3 className="w-3.5 h-3.5" />Esquemática</> : <><Map className="w-3.5 h-3.5" />Realista</>}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {mapView === "schematic" ? (
                        <SpainMapProvincial votosPorProvincia={votosPorProvinciaJuveniles} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />
                      ) : (
                        <SpainMapRealistic votosPorProvincia={votosPorProvinciaJuveniles} provinciaMetricsMap={provinciaMetricsMapJuveniles} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      {youthStats.length > 0 && <PactometerInteractive stats={youthStats.map((s) => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={100} requiredForMajority={51} />}
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Hemiciclo Asociaciones Juveniles</h2>
                      <CongressHemicycle escanos={escanosJuvenilesPorProvincia} totalEscanos={100} provinciaSeleccionada={provinciaSeleccionadaJuveniles} votosProvincia={votosPorPartidoProvinciaJuveniles} escanosProvincia={escanosProvinciaJuveniles} partyMeta={youthPartyMetaLookup} />
                    </div>
                  </>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center"><p className="text-slate-400">Cargando datos de asociaciones juveniles...</p></div>
                )}
              </div>
            )}

            {/* Metodología */}
            {!["simulador-electoral", "lideres-partidos", "encuestadoras-externas"].includes(activeTab) && (
              <div className="liquid-glass p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">Metodología</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-400">
                  <p><span className="font-semibold text-slate-500">Ley d'Hondt.</span> Sistema de reparto proporcional usado en España.</p>
                  <p><span className="font-semibold text-slate-500">Umbral mínimo.</span> 3% en generales, 4% en asociaciones juveniles.</p>
                  <p><span className="font-semibold text-slate-500">Actualización.</span> Datos en tiempo real cada 10 segundos.</p>
                </div>
              </div>
            )}

            <CommentsSection activeTab={activeTab === "simulador-electoral" ? "general" : activeTab} />

            <div className="text-center py-2">
              <p className="text-slate-400 text-sm mb-3">¿Aún no has respondido la encuesta?</p>
              <Button onClick={() => setLocation("/encuesta")} className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-10 rounded-xl font-semibold">
                Responder Encuesta
              </Button>
            </div>
          </div>
        )}
      </main>

      <PartyStatsModal isOpen={!!selectedPartyForStats} onClose={() => setSelectedPartyForStats(null)} partyName={selectedPartyForStats || ""} partyType={activeTab === "general" ? "general" : "youth"} />

      <footer className="border-t border-slate-200 bg-white/60 py-5 text-center text-xs text-slate-400">
        La Encuesta de Batalla Cultural © 2025 · Datos anónimos y públicos
      </footer>

      <AIAnalysisModal open={showAIAnalysis} onOpenChange={setShowAIAnalysis} totalResponses={totalResponses} edadPromedio={edadPromedio} ideologiaPromedio={ideologiaPromedio} topParties={[...stats].sort((a, b) => b.votos - a.votos).slice(0, 5)} />
    </div>
  );
}
