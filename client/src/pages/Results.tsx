        // ═══════════════════════════════════════════════════════════════════════════
// Results.tsx — Versión Refactorizada, Visualmente Mejorada y Completa
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LEADERS } from "@/lib/surveyData";
import { EMBEDDED_LEADERS } from "@/lib/embeddedLeaders";
import {
  calcularEscanosGenerales,
  calcularEscanosJuveniles,
  obtenerEstadisticas,
} from "@/lib/dhondt";
import {
  calcularEscanosGeneralesPorProvincia,
  calcularEscanosJuvenilesPorProvincia,
} from "@/lib/dhondtByProvince";
import {
  Loader2,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  Map,
  Grid3x3,
  ChevronDown,
  Users,
  BarChart2,
  MapPin,
  Vote,
  Star,
  TrendingUp,
  X,
  Image,
  FileText,
  Award,
  Building2,
  Crown,
  UserCheck,
  AlertTriangle,
  Activity,
  History,
  ArrowRight,
  Zap,
  Filter,
  GitBranch,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Sankey,
} from "recharts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
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
import { CrisisCeutaSection } from "@/components/results/CrisisCeutaSection";
import { TransferenciaVotoModal } from "@/components/TransferenciaVotoModal";
import { PrimariasResultsSection } from "@/components/results/PrimariasResultsSection";
import FollowUsMenu from "@/components/FollowUsMenu";
import PactometerInteractive from "@/components/PactometerInteractive";
import GovernmentBuilder from "@/components/GovernmentBuilder";
import { downloadPDFWithMetrics } from "@/lib/pdfExportMetrics";
import { usePartySync } from "@/hooks/usePartySync";
import { setRuntimePartyConfig } from "@/lib/partyRuntimeConfig";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}
interface LeaderRating {
  name: string;
  fieldName: string;
  average: number;
  count: number;
}
interface CustomSimulatorParty {
  key: string;
  name: string;
  color: string;
}
interface PartyLeader {
  id: number;
  party_key: string;
  leader_name: string;
  photo_url: string;
  is_active: boolean;
  display_name: string;
  color: string;
  logo_url: string;
}
interface LiderPreferido {
  partido: string;
  lider_preferido: string;
  votos: number;
  porcentaje: number;
  photo_url?: string;
  color?: string;
  display_name?: string;
  logo_url?: string;
}
interface PartyMeta {
  key: string;
  name: string;
  color: string;
  logo: string;
}

// ─── CSS Styles ──────────────────────────────────────────────────────────────
const RESULTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

.r-root {
  --top-anchor: 64px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 20% 10%, #171c2c 0%, #0a0a0f 50%, #050508 100%);
  color: #f0eff8;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.r-header {
  position: relative;
  top: 0;
  z-index: 60;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(10, 10, 15, 0.88);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 12px;
}
.r-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.r-brand img { height: 30px; width: 30px; border-radius: 6px; }
.r-brand-title { font-size: 15px; font-weight: 800; color: #f0eff8; line-height: 1.2; letter-spacing: -0.01em; }
.r-brand-sub { font-size: 11px; color: #8a88a5; }

.r-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.r-hbtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}
.r-hbtn-ai { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; }
.r-hbtn-ai:hover { background: rgba(245, 158, 11, 0.22); transform: translateY(-1px); }
.r-hbtn-outline { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12); color: #a09ebc; }
.r-hbtn-outline:hover { color: #f0eff8; border-color: rgba(255, 255, 255, 0.25); background: rgba(255, 255, 255, 0.08); }
.r-hbtn-infog { background: rgba(99, 102, 241, 0.14); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; }
.r-hbtn-infog:hover { background: rgba(99, 102, 241, 0.24); transform: translateY(-1px); }
.r-hbtn-gov { background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
.r-hbtn-gov:hover { background: rgba(16, 185, 129, 0.24); transform: translateY(-1px); }
.r-hbtn-pdf { background: rgba(139, 92, 246, 0.14); border: 1px solid rgba(139, 92, 246, 0.3); color: #c084fc; }
.r-hbtn-pdf:hover { background: rgba(139, 92, 246, 0.24); transform: translateY(-1px); }

/* Subnav */
.r-subnav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 15, 23, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
}
.r-subnav::-webkit-scrollbar { height: 3px; }
.r-subnav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
.r-subnav-inner { display: flex; align-items: stretch; padding: 0 20px; min-width: max-content; gap: 4px; }
.r-nav-group { position: relative; display: flex; align-items: center; }
.r-nav-group-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #8a88a5;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.r-nav-group-btn:hover { color: #f0eff8; }
.r-nav-group-btn.active { color: #e8465a; border-bottom-color: #e8465a; font-weight: 700; }

.r-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 210px;
  z-index: 100;
  background: #14141f;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  margin-top: 4px;
  padding: 6px;
}
.r-dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: none;
  border: none;
  color: #9a98b5;
  border-radius: 8px;
  transition: all 0.15s ease;
}
.r-dropdown-item:hover { background: rgba(255, 255, 255, 0.06); color: #f0eff8; }
.r-dropdown-item.active { color: #fff; background: #e8465a; font-weight: 700; }

/* Main layout */
.r-main { flex: 1; padding: 20px 24px 80px; max-width: 1280px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.r-space { display: flex; flex-direction: column; gap: 20px; }

/* Cards & Sections */
.r-section {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 16px 40px rgba(0, 0, 0, 0.4);
  border-radius: 18px;
  padding: 22px;
}
.r-section-title { font-family: 'Manrope', sans-serif; font-size: 19px; font-weight: 800; color: #f0eff8; letter-spacing: -0.01em; margin: 0 0 4px; }
.r-section-sub { font-size: 12px; color: #8a88a5; margin: 0 0 18px; }

/* Quick stats */
.r-quickstats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.r-stat-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.r-stat-card:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.18); }
.r-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a88a5; margin-bottom: 6px; }
.r-stat-value { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; color: #f0eff8; line-height: 1; }
.r-stat-value.accent { color: #e8465a; }
.r-stat-suffix { font-size: 10px; color: #6a6885; margin-top: 4px; }

/* Party Cards */
.r-party-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.r-party-card {
  --party-accent: #e8465a;
  background: linear-gradient(155deg, color-mix(in srgb, var(--party-accent) 14%, transparent), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(20px);
  border: 1px solid color-mix(in srgb, var(--party-accent) 35%, rgba(255, 255, 255, 0.12));
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.r-party-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px color-mix(in srgb, var(--party-accent) 30%, rgba(0,0,0,0.4)); }
.r-party-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.r-party-logo-wrap { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.2); }
.r-party-info { flex: 1; min-width: 0; }
.r-party-name { font-size: 14px; font-weight: 800; color: #f0eff8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-party-votes { font-size: 11px; color: #8a88a5; margin-top: 2px; }
.r-party-seats { text-align: right; flex-shrink: 0; }
.r-party-seats-num { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; line-height: 1; }
.r-party-seats-label { font-size: 9px; color: #8a88a5; text-transform: uppercase; font-weight: 700; }

/* Simulator */
.r-sim-wrap { background: #0b0b12; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; overflow: hidden; }
.r-sim-header { padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.r-sim-body { padding: 22px; }
.r-mode-tabs { display: flex; gap: 4px; padding: 4px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
.r-mode-tab { padding: 7px 18px; border-radius: 9px; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; border: none; background: transparent; color: #8a88a5; transition: all 0.2s; }
.r-mode-tab.active { background: #e8465a; color: #fff; box-shadow: 0 4px 12px rgba(232, 70, 90, 0.35); }

/* Helpers */
.r-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #f0eff8;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.r-select:focus { border-color: #e8465a; }
.r-select option { background: #14141f; color: #fff; }

.r-loader { display: flex; align-items: center; justify-content: center; padding: 60px 20px; }
.r-spin { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.08); border-top-color: #e8465a; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 768px) {
  .r-header { padding: 0 14px; height: 54px; }
  .r-brand-sub { display: none; }
  .r-header-actions .r-hbtn span { display: none; }
  .r-header-actions .r-hbtn { padding: 6px 10px; }
  .r-main { padding: 14px 14px 60px; }
  .r-quickstats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .r-section { padding: 16px; }
  .r-sim-header { padding: 16px; }
}
`;

// ─── Tab navigation ──────────────────────────────────────────────────────────
type TabKey =
  | "general"
  | "mapa-hemiciclo"
  | "encuestadoras-externas"
  | "ccaa"
  | "provincias"
  | "comparacion-ccaa"
  | "youth"
  | "asoc-juv-mapa-hemiciclo"
  | "leaders"
  | "tendencias"
  | "lideres-preferidos"
  | "lideres-partidos"
  | "preguntas-varias"
  | "analisis-avanzado"
  | "contexto-historico"
  | "noche-electoral"
  | "primarias"
  | "crisis-ceuta";

interface TabGroup {
  label: string;
  icon: React.ReactNode;
  tabs: { key: TabKey; label: string }[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    label: "Elecciones",
    icon: <Vote className="w-3.5 h-3.5" />,
    tabs: [
      { key: "general", label: "Resultados Generales" },
      { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
      { key: "encuestadoras-externas", label: "Encuestadoras" },
    ],
  },
  {
    label: "Territorio",
    icon: <MapPin className="w-3.5 h-3.5" />,
    tabs: [
      { key: "ccaa", label: "Comunidades Autónomas" },
      { key: "provincias", label: "Provincias" },
      { key: "comparacion-ccaa", label: "Comparar CCAA" },
    ],
  },
  {
    label: "Juventud",
    icon: <Users className="w-3.5 h-3.5" />,
    tabs: [
      { key: "youth", label: "Asociaciones Juveniles" },
      { key: "asoc-juv-mapa-hemiciclo", label: "Mapa Juvenil" },
    ],
  },
  {
    label: "Líderes",
    icon: <Star className="w-3.5 h-3.5" />,
    tabs: [
      { key: "lideres-partidos", label: "Líderes por Partido" },
      { key: "leaders", label: "Valoración" },
      { key: "lideres-preferidos", label: "Preferidos" },
    ],
  },
  {
    label: "Análisis",
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    tabs: [
      { key: "tendencias", label: "Tendencias" },
      { key: "contexto-historico", label: "Contexto Histórico" },
      { key: "preguntas-varias", label: "Preguntas Varias" },
      { key: "analisis-avanzado", label: "Análisis Avanzado" },
    ],
  },
  {
    label: "Crisis Ceuta",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    tabs: [{ key: "crisis-ceuta", label: "Análisis de Crisis" }],
  },
  {
    label: "Primarias",
    icon: <Vote className="w-3.5 h-3.5" />,
    tabs: [{ key: "primarias", label: "Resultados Primarias" }],
  },
];

// ─── NavBar Component ────────────────────────────────────────────────────────
function ResultsNavBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 220 });
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleGroupClick = (label: string) => {
    const btn = buttonRefs.current[label];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(220, rect.width + 40),
      });
    }
    setOpenGroup(openGroup === label ? null : label);
  };

  return (
    <div ref={ref} className="r-subnav">
      <div className="r-subnav-inner">
        {TAB_GROUPS.map((group) => {
          const active = group.tabs.find((t) => t.key === activeTab);
          const isOpen = openGroup === group.label;
          return (
            <div key={group.label} className="r-nav-group">
              <button
                ref={(el) => {
                  buttonRefs.current[group.label] = el;
                }}
                className={`r-nav-group-btn${active ? " active" : ""}`}
                onClick={() => handleGroupClick(group.label)}
              >
                {group.icon}
                <span>{active ? active.label : group.label}</span>
                <ChevronDown
                  size={12}
                  style={{
                    opacity: 0.6,
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {isOpen &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    className="r-dropdown"
                    style={{
                      position: "fixed",
                      top: `${dropdownPos.top}px`,
                      left: `${dropdownPos.left}px`,
                      minWidth: `${dropdownPos.width}px`,
                      zIndex: 2147483647,
                    }}
                  >
                    {group.tabs.map((tab) => (
                      <button
                        key={tab.key}
                        className={`r-dropdown-item${activeTab === tab.key ? " active" : ""}`}
                        onClick={() => {
                          onTabChange(tab.key);
                          setOpenGroup(null);
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Party Logo Helper ───────────────────────────────────────────────────────
function PartyLogoImg({
  src,
  name,
  color,
  size = 36,
}: {
  src?: string;
  name: string;
  color?: string;
  size?: number;
}) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 6 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: color || "#e8465a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {(name || "P").charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Leader Map Reference ─────────────────────────────────────────────────────
const LEADER_MAP: Record<string, { name: string; party: string; partyColor: string }> = {
  val_feijoo: { name: "Alberto Núñez Feijóo", party: "PP", partyColor: "#003f99" },
  val_sanchez: { name: "Pedro Sánchez", party: "PSOE", partyColor: "#e30613" },
  val_abascal: { name: "Santiago Abascal", party: "VOX", partyColor: "#63be21" },
  val_alvise: { name: "Alvise Pérez", party: "SALF", partyColor: "#ff6b00" },
  val_yolanda_diaz: { name: "Yolanda Díaz", party: "Sumar", partyColor: "#e91e8c" },
  val_irene_montero: { name: "Irene Montero", party: "Podemos", partyColor: "#6a1fa2" },
  val_ayuso: { name: "Isabel Díaz Ayuso", party: "PP", partyColor: "#003f99" },
  val_buxade: { name: "Jorge Buxadé", party: "VOX", partyColor: "#63be21" },
};

// ─── Análisis Avanzado Component ─────────────────────────────────────────────
function AnalisisAvanzadoSection({
  coherenciaRows,
  flujosRows,
  ideologiaRows,
  correlacionRows,
  historicoRows,
}: {
  coherenciaRows: any[];
  flujosRows: any[];
  ideologiaRows: any[];
  correlacionRows: any[];
  historicoRows: any[];
}) {
  const sankeyNodes = Array.from(
    new Set(
      flujosRows
        .flatMap((r: any) => [r?.origen, r?.destino])
        .filter((v: any) => typeof v === "string" && v.trim().length > 0)
    )
  );
  const nodeIndex: Record<string, number> = {};
  sankeyNodes.forEach((name, idx) => {
    nodeIndex[name] = idx;
  });

  const sankeyData = {
    nodes: sankeyNodes.map((name) => ({ name })),
    links: flujosRows
      .map((r: any) => ({
        source: nodeIndex[String(r?.origen ?? "")],
        target: nodeIndex[String(r?.destino ?? "")],
        value: Number(r?.cantidad ?? 0),
      }))
      .filter((l: any) => Number.isInteger(l.source) && Number.isInteger(l.target) && l.value > 0),
  };

  const bubbleData = ideologiaRows.map((r: any) => ({
    x: Number(r.posicion_ideologica || r.ideologia_media || 0),
    y: Number(r.total || 0),
    z: Number(r.total || 0),
    partido: r.partido,
  }));

  const radarData = correlacionRows.slice(0, 6).map((r: any) => ({
    partido: r.partido,
    feijoo: r.avg_feijoo || 0,
    sanchez: r.avg_sanchez || 0,
    abascal: r.avg_abascal || 0,
  }));

  const tendenciaActual = historicoRows.slice(-6);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="r-section">
        <div className="r-section-title">Coherencia de voto e Incoherencias</div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {coherenciaRows.slice(0, 8).map((r: any) => (
            <div
              key={r.partido_votado}
              style={{
                fontSize: 12,
                color: "#c9c8d9",
                background: "rgba(255,255,255,0.03)",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <strong style={{ color: "#f0eff8" }}>{r.partido_votado}:</strong> {r.total_votantes} votantes registrados.
              <span style={{ color: "#8a88a5", marginLeft: 8 }}>
                (Incoherencias: PP valora a Sánchez: {r.pp_valora_sanchez || 0} | PSOE valora a Feijóo: {r.psoe_valora_feijoo || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="r-section">
        <div className="r-section-title">Transferencia y Flujo de Voto (Sankey)</div>
        <p className="r-section-sub">Transferencia estimada entre el voto anterior y el actual</p>
        {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <Sankey
              data={sankeyData}
              nodePadding={20}
              margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              link={{ stroke: "#e8465a", strokeOpacity: 0.4 }}
            />
          </ResponsiveContainer>
        ) : (
          <div style={{ fontSize: 12, color: "#8a88a5", padding: "20px 0" }}>
            No hay suficientes datos registrados para la matriz de transferencia de voto.
          </div>
        )}
      </div>

      <div className="r-section">
        <div className="r-section-title">Posicionamiento Ideológico vs Votos</div>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" dataKey="x" name="Ideología (1-10)" stroke="#8a88a5" domain={[1, 10]} />
            <YAxis type="number" dataKey="y" name="Votos" stroke="#8a88a5" />
            <ZAxis dataKey="z" range={[60, 600]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={bubbleData} fill="#e8465a" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Simulador Electoral Completo ─────────────────────────────────────────────
interface SimuladorProps {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, PartyMeta>;
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
}

function SimuladorElectoral({
  generalStats,
  generalPartyMap,
  votosPorProvincia,
  provinciaMetricsMap,
}: SimuladorProps) {
  const [mode, setMode] = useState<"nacional" | "circunscripcion">("nacional");
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [selectedCirc, setSelectedCirc] = useState("");
  const [customParties, setCustomParties] = useState<CustomSimulatorParty[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#7c3aed");
  const [provinciaVotes, setProvinciaVotes] = useState<Record<string, Record<string, number>>>({});
  const [initialized, setInitialized] = useState(false);
  const SIM_STORAGE_KEY = "bc_simulador_v2";

  useEffect(() => {
    if (generalStats.length > 0 && !initialized) {
      const saved = localStorage.getItem(SIM_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.simulatorVotes) setSimulatorVotes(parsed.simulatorVotes);
          if (parsed?.provinciaVotes) setProvinciaVotes(parsed.provinciaVotes);
          if (Array.isArray(parsed?.customParties)) setCustomParties(parsed.customParties);
          setInitialized(true);
          return;
        } catch {
          /* ignore */
        }
      }
      const base: Record<string, number> = {};
      generalStats.forEach((p) => {
        base[p.id] = p.votos;
      });
      setSimulatorVotes(base);

      const provBase: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, data]) => {
        provBase[prov] = { ...data };
      });
      setProvinciaVotes(provBase);
      setInitialized(true);
    }
  }, [generalStats, votosPorProvincia, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(
      SIM_STORAGE_KEY,
      JSON.stringify({ simulatorVotes, provinciaVotes, customParties })
    );
  }, [initialized, simulatorVotes, provinciaVotes, customParties]);

  const simulatorPartyMap = useMemo(() => {
    const m = { ...generalPartyMap };
    customParties.forEach((p) => {
      m[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" };
    });
    return m;
  }, [generalPartyMap, customParties]);

  const totalSimulatedVotes = useMemo(() => {
    return Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);
  }, [simulatorVotes]);

  const simulatedEscanos = useMemo(() => {
    if (totalSimulatedVotes === 0) return {};
    const inputForDhondt: Record<string, number> = {};
    Object.entries(simulatorVotes).forEach(([key, val]) => {
      if (val > 0) inputForDhondt[key] = val;
    });
    return calcularEscanosGenerales(inputForDhondt, 350);
  }, [simulatorVotes, totalSimulatedVotes]);

  const handleVoteChange = (key: string, val: number) => {
    setSimulatorVotes((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleAddCustomParty = () => {
    if (!newPartyName.trim()) return;
    const key = `custom_${Date.now()}`;
    const newP: CustomSimulatorParty = { key, name: newPartyName.trim(), color: newPartyColor };
    setCustomParties((prev) => [...prev, newP]);
    setSimulatorVotes((prev) => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };

  const handleRemoveCustomParty = (key: string) => {
    setCustomParties((prev) => prev.filter((p) => p.key !== key));
    setSimulatorVotes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetSimulator = () => {
    const base: Record<string, number> = {};
    generalStats.forEach((p) => {
      base[p.id] = p.votos;
    });
    setSimulatorVotes(base);
    setCustomParties([]);
    localStorage.removeItem(SIM_STORAGE_KEY);
  };

  return (
    <div className="r-sim-wrap">
      <div className="r-sim-header">
        <div>
          <h3 className="r-sim-title">Simulador Electoral y D'Hondt</h3>
          <p className="r-sim-sub">Modifica los votos proyectados y observa la asignación de 350 escaños</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button variant="outline" size="sm" onClick={resetSimulator} className="r-hbtn r-hbtn-outline">
            <RefreshCw size={12} /> Resetear
          </Button>
        </div>
      </div>

      <div className="r-sim-body">
        <div className="r-sim-total">
          <span>Votos Totales Simulados:</span>
          <strong>{totalSimulatedVotes.toLocaleString("es-ES")}</strong>
        </div>

        <div className="r-sim-party-grid">
          {Object.keys(simulatorPartyMap).map((key) => {
            const meta = simulatorPartyMap[key];
            const votes = simulatorVotes[key] || 0;
            const pct = totalSimulatedVotes > 0 ? (votes / totalSimulatedVotes) * 100 : 0;
            const isCustom = customParties.some((cp) => cp.key === key);

            return (
              <div key={key} className="r-sim-party-row">
                <PartyLogoImg src={meta.logo} name={meta.name} color={meta.color} size={22} />
                <span className="r-sim-party-name">{meta.name}</span>
                <span className="r-sim-pct">{pct.toFixed(1)}%</span>
                <input
                  type="number"
                  className="r-sim-input"
                  value={votes}
                  onChange={(e) => handleVoteChange(key, parseInt(e.target.value) || 0)}
                />
                {isCustom && (
                  <button className="r-trash-btn" onClick={() => handleRemoveCustomParty(key)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Añadir partido custom */}
        <div className="r-sim-add">
          <div className="r-sim-add-title">
            <Plus size={12} /> Añadir Partido Personalizado al Simulador
          </div>
          <div className="r-sim-add-row">
            <input
              type="text"
              className="r-sim-add-input"
              placeholder="Nombre del partido..."
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
            />
            <input
              type="color"
              style={{ width: 40, height: 34, padding: 0, border: 0, background: "transparent", cursor: "pointer" }}
              value={newPartyColor}
              onChange={(e) => setNewPartyColor(e.target.value)}
            />
            <button className="r-sim-add-btn" onClick={handleAddCustomParty}>
              Añadir
            </button>
          </div>
        </div>

        {/* Resultados Proyectados */}
        <div className="r-sim-results">
          <h4 style={{ fontSize: 13, fontWeight: 800, color: "#f0eff8", marginBottom: 12 }}>
            Proyección de Hemiciclo (350 Escaños)
          </h4>
          {Object.entries(simulatedEscanos)
            .sort((a, b) => b[1] - a[1])
            .map(([key, escanos]) => {
              const meta = simulatorPartyMap[key] || { name: key, color: "#e8465a" };
              const pctEscanos = ((escanos / 350) * 100).toFixed(1);

              return (
                <div key={key} className="r-sim-row">
                  <div className="r-sim-dot" style={{ background: meta.color }} />
                  <span className="r-sim-row-name">{meta.name}</span>
                  <div className="r-sim-row-bar">
                    <div
                      className="r-sim-row-fill"
                      style={{ width: `${(escanos / 176) * 50}%`, background: meta.color }}
                    />
                    <div className="r-sim-row-majority" style={{ left: "50%" }} />
                  </div>
                  <span className="r-sim-row-seats" style={{ color: meta.color }}>
                    {escanos}
                  </span>
                  <span className="r-sim-row-pct">{pctEscanos}%</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal Results ─────────────────────────────────────────────
export default function Results() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [loading, setLoading] = useState(true);
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [generalPartyMap, setGeneralPartyMap] = useState<Record<string, PartyMeta>>({});
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<
    Record<string, { edad_promedio: number; ideologia_promedio: number }>
  >({});
  const [showInfogModal, setShowInfogModal] = useState(false);

  // Carga de datos base desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: configData } = await supabase.from("party_configurations").select("*");
        const partyMap: Record<string, PartyMeta> = {};

        if (configData) {
          configData.forEach((row: any) => {
            partyMap[row.party_key] = {
              key: row.party_key,
              name: row.display_name || row.party_key,
              color: row.color || "#e8465a",
              logo: row.logo_url || "",
            };
          });
          setGeneralPartyMap(partyMap);
        }

        const { data: respData } = await supabase
          .from("respuestas")
          .select("voto_generales, provincia")
          .not("voto_generales", "is", null);

        if (respData) {
          const counts: Record<string, number> = {};
          const provCounts: Record<string, Record<string, number>> = {};

          respData.forEach((row: any) => {
            const p = row.voto_generales;
            const prov = row.provincia || "Desconocido";
            if (p) {
              counts[p] = (counts[p] || 0) + 1;
              if (!provCounts[prov]) provCounts[prov] = {};
              provCounts[prov][p] = (provCounts[prov][p] || 0) + 1;
            }
          });

          setVotosPorProvincia(provCounts);

          const total = Object.values(counts).reduce((a, b) => a + b, 0);
          const escanosCalculados = calcularEscanosGenerales(counts, 350);

          const stats: PartyStats[] = Object.entries(counts).map(([key, v]) => {
            const meta = partyMap[key] || { name: key, color: "#e8465a", logo: "" };
            return {
              id: key,
              nombre: meta.name,
              votos: v,
              porcentaje: total > 0 ? (v / total) * 100 : 0,
              escanos: escanosCalculados[key] || 0,
              logo: meta.logo,
              color: meta.color,
            };
          });

          stats.sort((a, b) => b.votos - a.votos);
          setGeneralStats(stats);
        }
      } catch (err) {
        console.error("Error al cargar datos de resultados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="r-root">
        <style>{RESULTS_CSS}</style>
        <div className="r-loader">
          <div className="r-spin" />
        </div>
      </div>
    );
  }

  const totalVotosGlobal = generalStats.reduce((a, b) => a + b.votos, 0);

  return (
    <div className="r-root">
      <style>{RESULTS_CSS}</style>

      {/* Dynamic Header */}
      <header className="r-header">
        <div className="r-brand">
          <div style={{ background: "#e8465a", width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", fontWeight: 800 }}>
            BC
          </div>
          <div>
            <div className="r-brand-title">La Encuesta de Batalla Cultural</div>
            <div className="r-brand-sub">Resultados Electorales & Métricas en Tiempo Real</div>
          </div>
        </div>

        <div className="r-header-actions">
          <button className="r-hbtn r-hbtn-infog" onClick={() => setShowInfogModal(true)}>
            <Image size={13} />
            <span>Infografía</span>
          </button>
          <button className="r-hbtn r-hbtn-pdf" onClick={() => downloadPDFWithMetrics("generales", generalStats)}>
            <Download size={13} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </header>

      {/* Subnav Navigation */}
      <ResultsNavBar activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />

      {/* Main Content Body */}
      <main className="r-main">
        <div className="r-space">
          {/* Section Render Switches */}
          {activeTab === "general" && (
            <>
              {/* Quick stats panel */}
              <div className="r-quickstats">
                <div className="r-stat-card">
                  <div className="r-stat-label">Muestra Total</div>
                  <div className="r-stat-value accent">{totalVotosGlobal.toLocaleString("es-ES")}</div>
                  <div className="r-stat-suffix">Respuestas verificadas</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Mayoría Absoluta</div>
                  <div className="r-stat-value">176</div>
                  <div className="r-stat-suffix">Escaños en Congreso</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Partido Líder</div>
                  <div className="r-stat-value" style={{ color: generalStats[0]?.color }}>
                    {generalStats[0]?.nombre || "—"}
                  </div>
                  <div className="r-stat-suffix">{generalStats[0]?.porcentaje.toFixed(1)}% del voto</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Escaños Líder</div>
                  <div className="r-stat-value">{generalStats[0]?.escanos || 0}</div>
                  <div className="r-stat-suffix">Proyección D'Hondt</div>
                </div>
              </div>

              {/* Grid de partidos principales */}
              <div className="r-section">
                <div className="r-section-title">Resultados Generales Proyectados</div>
                <p className="r-section-sub">Distribución porcentual y escaños simulados</p>

                <div className="r-party-grid">
                  {generalStats.map((party) => (
                    <div
                      key={party.id}
                      className="r-party-card"
                      style={{ "--party-accent": party.color || "#e8465a" } as React.CSSProperties}
                    >
                      <div className="r-party-card-top">
                        <div className="r-party-logo-wrap">
                          <PartyLogoImg src={party.logo} name={party.nombre} color={party.color} size={32} />
                        </div>
                        <div className="r-party-info">
                          <div className="r-party-name">{party.nombre}</div>
                          <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                        </div>
                        <div className="r-party-seats">
                          <div className="r-party-seats-num" style={{ color: party.color }}>
                            {party.escanos}
                          </div>
                          <div className="r-party-seats-label">Escaños</div>
                        </div>
                      </div>

                      <div className="r-party-bar-wrap">
                        <div className="r-party-bar-labels">
                          <span>Porcentaje</span>
                          <span style={{ fontWeight: 700, color: "#f0eff8" }}>{party.porcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="r-party-bar-track">
                          <div
                            className="r-party-bar-fill"
                            style={{ width: `${party.porcentaje}%`, background: party.color || "#e8465a" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulador electoral integrado */}
              <SimuladorElectoral
                generalStats={generalStats}
                generalPartyMap={generalPartyMap}
                votosPorProvincia={votosPorProvincia}
                provinciaMetricsMap={provinciaMetricsMap}
              />
            </>
          )}

          {activeTab === "mapa-hemiciclo" && (
            <div className="r-section">
              <div className="r-section-title">Congreso de los Diputados</div>
              <p className="r-section-sub">Representación de escaños en el hemiciclo</p>
              <CongressHemicycle
                seats={generalStats.map((s) => ({
                  name: s.nombre,
                  seats: s.escanos,
                  color: s.color || "#e8465a",
                }))}
              />
            </div>
          )}

          {activeTab === "encuestadoras-externas" && <EncuestadorasComparativa />}
          {activeTab === "ccaa" && <CCAAResltsSection />}
          {activeTab === "provincias" && <ProvincesResultsSection />}
          {activeTab === "comparacion-ccaa" && <CCAAComparisonSection />}
          {activeTab === "lideres-partidos" && <LideresDePartidosSection partyMeta={generalPartyMap} />}
          {activeTab === "tendencias" && <TrendenciesChart />}
          {activeTab === "preguntas-varias" && <PreguntasVariasSection />}
          {activeTab === "crisis-ceuta" && <CrisisCeutaSection />}
          {activeTab === "primarias" && <PrimariasResultsSection />}
        </div>
      </main>

      {/* Modal Infografía */}
      {showInfogModal && (
        <InfografiaModal
          parties={generalStats}
          onClose={() => setShowInfogModal(false)}
          onGenerate={(type, party) => {
            console.log("Generar infografía", type, party);
          }}
        />
      )}
    </div>
  );
}
