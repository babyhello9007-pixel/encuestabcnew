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
  Vote, Star, TrendingUp, X, Image, FileText, Award, Lock,
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

// ─── CSS ─────────────────────────────────────────────────────────────────────

const RESULTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700;800&display=swap');

.r-root {
  min-height: 100vh; display: flex; flex-direction: column;
  background: #0a0a0f; color: #f0eff8;
  font-family: 'DM Sans', sans-serif;
}
.r-header {
  position: sticky; top: 0; z-index: 60;
  height: 58px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  background: rgba(10,10,15,0.92); backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.r-brand { display: flex; align-items: center; gap: 10px; }
.r-brand img { height: 28px; width: 28px; }
.r-brand-title { font-size: 14px; font-weight: 700; color: #f0eff8; line-height: 1.2; }
.r-brand-sub { font-size: 11px; color: #7a7990; }
.r-header-actions { display: flex; align-items: center; gap: 6px; }
.r-hbtn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: all 0.18s; border: none; background: none;
}
.r-hbtn-ai { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
.r-hbtn-ai:hover { background: rgba(245,158,11,0.25); }
.r-hbtn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #7a7990; }
.r-hbtn-outline:hover { color: #f0eff8; border-color: rgba(255,255,255,0.2); }
.r-hbtn-infog { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; }
.r-hbtn-infog:hover { background: rgba(99,102,241,0.25); }
.r-hbtn-secret { background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #a855f7; }
.r-hbtn-secret:hover { background: rgba(168,85,247,0.25); }

/* Subnav - FIXED */
.r-subnav {
  position: sticky; top: 58px; z-index: 50;
  background: rgba(17,17,24,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow-x: auto;
}
.r-subnav::-webkit-scrollbar { height: 0; }
.r-subnav-inner { display: flex; align-items: stretch; padding: 0 24px; min-width: max-content; }
.r-nav-group { position: relative; }
.r-nav-group-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 16px;
  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: #7a7990; transition: all 0.18s; white-space: nowrap;
}
.r-nav-group-btn:hover { color: #f0eff8; }
.r-nav-group-btn.active { color: #e8465a; border-bottom-color: #e8465a; }
.r-dropdown {
  position: absolute; top: 100%; left: 0; min-width: 220px; z-index: 1000;
  background: #18181f; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; overflow: hidden;
  animation: dropIn 0.15s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
@keyframes dropIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
.r-dropdown-item {
  display: block; width: 100%; text-align: left;
  padding: 11px 16px; font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer; background: none; border: none;
  color: #7a7990; border-left: 2px solid transparent;
  transition: all 0.15s;
}
.r-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #f0eff8; }
.r-dropdown-item.active { color: #e8465a; border-left-color: #e8465a; background: rgba(232,70,90,0.06); font-weight: 700; }

/* Main */
.r-main { flex: 1; padding: 28px 24px 60px; max-width: 1180px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.r-space { display: flex; flex-direction: column; gap: 20px; }

/* Quick stats */
.r-quickstats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 700px) { .r-quickstats { grid-template-columns: repeat(2, 1fr); } .r-main { padding: 16px 16px 48px; } }
.r-stat-card {
  background: #111118; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 20px 16px; text-align: center;
  transition: border-color 0.2s;
}
.r-stat-card:hover { border-color: rgba(255,255,255,0.14); }
.r-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #7a7990; margin-bottom: 6px; }
.r-stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: #f0eff8; line-height: 1; }
.r-stat-value.accent { color: #e8465a; }
.r-stat-suffix { font-size: 11px; color: #7a7990; margin-top: 2px; }

/* Simulator */
.r-sim-wrap { background: #0d0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
.r-sim-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.r-sim-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #f0eff8; margin: 0 0 2px; }
.r-sim-sub { font-size: 12px; color: #7a7990; margin: 0; }
.r-sim-body { padding: 24px; }
.r-mode-tabs { display: flex; gap: 2px; padding: 3px; background: rgba(255,255,255,0.05); border-radius: 10px; width: fit-content; margin-bottom: 20px; }
.r-mode-tab {
  padding: 7px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
  font-family: inherit; cursor: pointer; border: none; background: transparent;
  color: #7a7990; transition: all 0.18s;
}
.r-mode-tab.active { background: #e8465a; color: #fff; }
.r-sim-total { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #7a7990; }
.r-sim-total strong { color: #e8465a; font-size: 16px; }
.r-sim-party-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (max-width: 600px) { .r-sim-party-grid { grid-template-columns: 1fr; } }
.r-sim-party-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 10px 14px; transition: border-color 0.18s;
}
.r-sim-party-row:hover { border-color: rgba(255,255,255,0.12); }
.r-sim-party-logo { width: 24px; height: 24px; object-fit: contain; border-radius: 4px; flex-shrink: 0; }
.r-sim-party-name { flex: 1; font-size: 13px; font-weight: 600; color: #f0eff8; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-sim-pct-bar { width: 50px; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
.r-sim-pct-fill { height: 100%; border-radius: 2px; }
.r-sim-pct { font-size: 11px; color: #7a7990; min-width: 32px; text-align: right; }
.r-sim-input {
  width: 80px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px; padding: 5px 8px; text-align: right; font-size: 12px;
  color: #f0eff8; font-family: inherit; outline: none; flex-shrink: 0;
  transition: border-color 0.18s;
}
.r-sim-input:focus { border-color: #e8465a; }
.r-sim-results { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; margin-top: 20px; }
.r-sim-results-title { font-size: 14px; font-weight: 700; color: #f0eff8; margin-bottom: 4px; }
.r-sim-results-sub { font-size: 12px; color: #7a7990; margin-bottom: 16px; }
.r-sim-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.r-sim-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.r-sim-row-name { font-size: 13px; font-weight: 600; color: #f0eff8; width: 120px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.r-sim-row-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; position: relative; }
.r-sim-row-fill { height: 100%; border-radius: 3px; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
.r-sim-row-majority { position: absolute; top: 0; height: 100%; width: 1px; background: rgba(245,158,11,0.6); }
.r-sim-row-seats { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; min-width: 32px; text-align: right; }
.r-sim-row-pct { font-size: 11px; color: #5a596a; min-width: 38px; text-align: right; }
.r-sim-add { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 16px 20px; margin-top: 16px; }
.r-sim-add-title { font-size: 12px; font-weight: 700; color: #5a596a; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.r-sim-add-row { display: flex; gap: 8px; flex-wrap: wrap; }
.r-sim-add-input { flex: 1; min-width: 140px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #f0eff8; font-family: inherit; outline: none; transition: border-color 0.18s; }
.r-sim-add-input:focus { border-color: #e8465a; }
.r-sim-add-btn { display: flex; align-items: center; gap: 5px; padding: 8px 16px; background: #e8465a; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; color: #fff; font-family: inherit; cursor: pointer; transition: background 0.18s; }
.r-sim-add-btn:hover { background: #ff6b7a; }

/* Noche Electoral */
.r-noche-wrap { background: linear-gradient(135deg, rgba(232,70,90,0.1), rgba(99,102,241,0.1)); border: 1px solid rgba(232,70,90,0.3); border-radius: 16px; padding: 24px; }
.r-noche-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #e8465a; margin-bottom: 16px; }
.r-noche-controls { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.r-noche-btn { padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; }
.r-noche-btn-start { background: #e8465a; color: #fff; }
.r-noche-btn-start:hover { background: #ff6b7a; }
.r-noche-btn-stop { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.r-noche-btn-stop:hover { background: rgba(239,68,68,0.3); }
.r-noche-speed { display: flex; align-items: center; gap: 8px; }
.r-noche-speed-label { font-size: 12px; color: #7a7990; }
.r-noche-speed-slider { width: 120px; }
.r-noche-live { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; color: #22c55e; font-size: 12px; font-weight: 600; }
.r-noche-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 1s infinite; }

/* TOP SECRET */
.r-secret-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; }
.r-secret-modal { background: #0d0d14; border: 2px solid rgba(168,85,247,0.3); border-radius: 20px; padding: 40px; max-width: 420px; width: 100%; }
.r-secret-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.r-secret-sub { font-size: 13px; color: #7a7990; margin-bottom: 24px; }
.r-secret-form { display: flex; flex-direction: column; gap: 12px; }
.r-secret-input { background: rgba(255,255,255,0.07); border: 1px solid rgba(168,85,247,0.2); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #f0eff8; font-family: inherit; outline: none; transition: border-color 0.18s; }
.r-secret-input:focus { border-color: rgba(168,85,247,0.5); }
.r-secret-input::placeholder { color: rgba(240,238,248,0.3); }
.r-secret-btn { padding: 10px 20px; border-radius: 10px; border: none; background: #a855f7; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.18s; }
.r-secret-btn:hover { background: #c084fc; }
.r-secret-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.r-secret-error { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #fecaca; font-size: 12px; }

/* Infog modal */
.r-infog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
.r-infog-modal { background: #111118; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 32px; max-width: 520px; width: 100%; }
.r-infog-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #f0eff8; margin: 0 0 6px; }
.r-infog-sub { font-size: 14px; color: #7a7990; margin: 0 0 24px; }
.r-infog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.r-infog-option {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px 12px; border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.08); background: #18181f;
  cursor: pointer; transition: all 0.18s; text-align: center;
}
.r-infog-option:hover { border-color: rgba(255,255,255,0.18); background: #1e1e28; }
.r-infog-option.selected { border-color: #e8465a; background: rgba(232,70,90,0.08); }
.r-infog-option-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.r-infog-option-label { font-size: 13px; font-weight: 700; color: #f0eff8; line-height: 1.3; }
.r-infog-option-desc { font-size: 11px; color: #7a7990; }
.r-infog-party-select { width: 100%; background: #18181f; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #f0eff8; font-family: inherit; outline: none; margin-bottom: 16px; appearance: none; }
.r-infog-footer { display: flex; gap: 10px; justify-content: flex-end; }
.r-infog-cancel { padding: 10px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.18s; }
.r-infog-cancel:hover { color: #f0eff8; }
.r-infog-generate { padding: 10px 24px; border-radius: 10px; border: none; background: #e8465a; color: #fff; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.18s; }
.r-infog-generate:hover { background: #ff6b7a; }

/* Section card */
.r-section {
  background: #111118; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 24px;
}
.r-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 800; color: #f0eff8;
  letter-spacing: -0.01em; margin: 0 0 4px;
}
.r-section-sub { font-size: 13px; color: #7a7990; margin: 0 0 20px; }

/* Helpers */
.r-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
.r-loader { display: flex; align-items: center; justify-content: center; padding: 60px 20px; }
.r-spin { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08); border-top-color: #e8465a; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PartyStats {
  id: string; nombre: string; votos: number; porcentaje: number;
  escanos: number; logo: string; color?: string;
}
interface LeaderRating { name: string; fieldName: string; average: number; count: number; }
interface CustomSimulatorParty { key: string; name: string; color: string; }
interface NocheElectoralState {
  isRunning: boolean;
  speed: number;
  currentVotes: Record<string, number>;
  simulationStep: number;
}

type TabKey =
  | "general" | "mapa-hemiciclo" | "encuestadoras-externas" | "ccaa"
  | "provincias" | "comparacion-ccaa" | "youth" | "asoc-juv-mapa-hemiciclo"
  | "leaders" | "tendencias" | "lideres-preferidos" | "lideres-partidos"
  | "preguntas-varias" | "simulador-electoral" | "noche-electoral";

interface TabGroup { label: string; icon: React.ReactNode; tabs: { key: TabKey; label: string }[]; }

const TAB_GROUPS: TabGroup[] = [
  { label: "Elecciones", icon: <Vote className="w-3.5 h-3.5" />, tabs: [
    { key: "general", label: "Resultados Generales" },
    { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
    { key: "simulador-electoral", label: "Simulador Electoral" },
    { key: "noche-electoral", label: "Noche Electoral" },
    { key: "encuestadoras-externas", label: "Encuestadoras" }
  ]},
  { label: "Territorio", icon: <MapPin className="w-3.5 h-3.5" />, tabs: [
    { key: "ccaa", label: "Comunidades Autónomas" },
    { key: "provincias", label: "Provincias" },
    { key: "comparacion-ccaa", label: "Comparar CCAA" }
  ]},
  { label: "Juventud", icon: <Users className="w-3.5 h-3.5" />, tabs: [
    { key: "youth", label: "Asociaciones Juveniles" },
    { key: "asoc-juv-mapa-hemiciclo", label: "Mapa y Hemiciclo Juvenil" }
  ]},
  { label: "Líderes", icon: <Star className="w-3.5 h-3.5" />, tabs: [
    { key: "lideres-partidos", label: "Líderes por Partido" },
    { key: "leaders", label: "Valoración de Líderes" },
    { key: "lideres-preferidos", label: "Líderes Preferidos" }
  ]},
  { label: "Análisis", icon: <BarChart2 className="w-3.5 h-3.5" />, tabs: [
    { key: "tendencias", label: "Tendencias por Día" },
    { key: "preguntas-varias", label: "Preguntas Varias" }
  ]},
];

// ─── NavBar (FIXED - Dropdown z-index) ───────────────────────────────────────
function ResultsNavBar({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="r-subnav">
      <div className="r-subnav-inner">
        {TAB_GROUPS.map((group) => {
          const active = group.tabs.find(t => t.key === activeTab);
          const isOpen = openGroup === group.label;
          return (
            <div key={group.label} className="r-nav-group">
              <button
                className={`r-nav-group-btn${active ? " active" : ""}`}
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
              >
                {group.icon}
                <span>{active ? active.label : group.label}</span>
                <ChevronDown className="w-3 h-3" style={{ opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {isOpen && (
                <div className="r-dropdown">
                  {group.tabs.map(tab => (
                    <button
                      key={tab.key}
                      className={`r-dropdown-item${activeTab === tab.key ? " active" : ""}`}
                      onClick={() => { onTabChange(tab.key); setOpenGroup(null); }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TOP SECRET Modal ─────────────────────────────────────────────────────────
function TopSecretModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Credenciales correctas: usuario "bce" y contraseña "90*23aL12&42"
    if (username === "bce" && password === "90*23aL12&42") {
      onSuccess();
      setUsername("");
      setPassword("");
    } else {
      setError("Credenciales inválidas");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="r-secret-backdrop" onClick={onClose}>
      <div className="r-secret-modal" onClick={e => e.stopPropagation()}>
        <h2 className="r-secret-title">
          <Lock size={24} />
          TOP SECRET
        </h2>
        <p className="r-secret-sub">Acceso restringido - Importass</p>
        
        <form onSubmit={handleSubmit} className="r-secret-form">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="r-secret-input"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="r-secret-input"
            disabled={loading}
          />
          {error && <div className="r-secret-error">{error}</div>}
          <button type="submit" className="r-secret-btn" disabled={loading}>
            {loading ? "Verificando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Noche Electoral ──────────────────────────────────────────────────────────
function NocheElectoral({ generalStats, generalPartyMap }: {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
}) {
  const [state, setState] = useState<NocheElectoralState>({
    isRunning: false,
    speed: 1000,
    currentVotes: {},
    simulationStep: 0,
  });

  useEffect(() => {
    if (generalStats.length > 0 && Object.keys(state.currentVotes).length === 0) {
      const base: Record<string, number> = {};
      generalStats.forEach(p => {
        base[p.id] = Math.floor(p.votos * 0.001); // 0.01% base
      });
      setState(prev => ({ ...prev, currentVotes: base }));
    }
  }, [generalStats, state.currentVotes]);

  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => {
        const newVotes = { ...prev.currentVotes };
        Object.keys(newVotes).forEach(key => {
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variación
          const baseVotes = generalStats.find(s => s.id === key)?.votos || 0;
          newVotes[key] = Math.max(0, Math.floor(baseVotes * (0.001 + variation)));
        });
        return { ...prev, currentVotes: newVotes, simulationStep: prev.simulationStep + 1 };
      });
    }, state.speed);

    return () => clearInterval(interval);
  }, [state.isRunning, state.speed, generalStats]);

  const totalVotes = Object.values(state.currentVotes).reduce((a, b) => a + b, 0);
  const simulatorStats = useMemo(() => {
    const nv: Record<string, number> = {};
    Object.entries(state.currentVotes).forEach(([k, v]) => { nv[k] = Math.max(0, Math.floor(v || 0)); });
    const nombres: Record<string, string> = {};
    const logos: Record<string, string> = {};
    Object.entries(generalPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
    return obtenerEstadisticas(nv, {}, nombres, logos).map(s => ({ ...s, color: generalPartyMap[s.id]?.color || "#e8465a" }));
  }, [state.currentVotes, generalPartyMap]);

  return (
    <div className="r-noche-wrap">
      <h2 className="r-noche-title">🔴 NOCHE ELECTORAL EN DIRECTO</h2>
      
      <div className="r-noche-controls">
        <button
          className={`r-noche-btn ${state.isRunning ? "r-noche-btn-stop" : "r-noche-btn-start"}`}
          onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
        >
          {state.isRunning ? "⏸ Pausar" : "▶ Iniciar Simulación"}
        </button>
        
        <div className="r-noche-speed">
          <label className="r-noche-speed-label">Velocidad:</label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={state.speed}
            onChange={e => setState(prev => ({ ...prev, speed: Number(e.target.value) }))}
            className="r-noche-speed-slider"
            disabled={state.isRunning}
          />
          <span style={{ fontSize: 11, color: "#7a7990" }}>{((3000 - state.speed) / 1000).toFixed(1)}x</span>
        </div>

        {state.isRunning && (
          <div className="r-noche-live">
            <div className="r-noche-live-dot" />
            EN DIRECTO
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {simulatorStats.map(party => {
          const pct = totalVotes > 0 ? ((party.votos / totalVotes) * 100).toFixed(1) : "0.0";
          return (
            <div key={party.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: party.color, marginBottom: 6 }}>{party.nombre}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f0eff8", marginBottom: 4 }}>{party.votos.toLocaleString("es-ES")}</div>
              <div style={{ fontSize: 11, color: "#7a7990" }}>{pct}% · {party.escanos} escaños</div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: `${Math.min(100, parseFloat(pct) * 3)}%`, background: party.color, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: "#7a7990", textAlign: "center" }}>
        Paso de simulación: {state.simulationStep} · Total votos: {totalVotes.toLocaleString("es-ES")}
      </div>
    </div>
  );
}

// ─── Main Results Component ───────────────────────────────────────────────────
export default function ResultsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  const [showTopSecret, setShowTopSecret] = useState(false);
  const [topSecretUnlocked, setTopSecretUnlocked] = useState(false);

  const generalPartyMap = useMemo(() => {
    const d: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    partyConfigData.parties.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

  useEffect(() => {
    const loadPartyConfig = async () => {
      const { data } = await supabase
        .from("party_configuration")
        .select("party_key, display_name, color, logo_url, party_type, is_active")
        .eq("is_active", true);
      
      const all = data || [];
      setPartyConfigData({
        parties: all.filter((r: any) => r.party_type === "general"),
        youth: all.filter((r: any) => ["youth", "asociacion_juvenil", "juvenile"].includes(r.party_type))
      });
    };
    loadPartyConfig();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: gd } = await supabase.from("votos_generales_totales").select("*");
        if (gd && gd.length > 0) {
          const gv: Record<string, number> = {};
          Object.keys(generalPartyMap).forEach(k => { gv[k] = 0; });
          gd.forEach((r: any) => { gv[r.partido_id] = r.votos; });
          const nombres: Record<string, string> = {};
          const logos: Record<string, string> = {};
          Object.entries(generalPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
          setGeneralStats(obtenerEstadisticas(gv, {}, nombres, logos).map(s => ({ ...s, color: generalPartyMap[s.id]?.color })));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    
    if (Object.keys(generalPartyMap).length > 0) {
      fetchResults();
    }
  }, [generalPartyMap]);

  return (
    <>
      <style>{RESULTS_CSS}</style>
      <div className="r-root">
        <header className="r-header">
          <div className="r-brand">
            <img src="/logo.png" alt="BC" />
            <div>
              <div className="r-brand-title">La Encuesta de BC</div>
              <div className="r-brand-sub">Datos en tiempo real</div>
            </div>
          </div>
          <div className="r-header-actions">
            <button className="r-hbtn r-hbtn-ai">
              <Sparkles size={13} />
              IA
            </button>
            <button className="r-hbtn r-hbtn-infog">
              <Image size={13} />
              Infografía
            </button>
            <button
              className="r-hbtn r-hbtn-secret"
              onClick={() => setShowTopSecret(true)}
            >
              <Lock size={13} />
              TOP SECRET
            </button>
          </div>
        </header>

        <ResultsNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="r-main">
          {loading ? (
            <div className="r-loader">
              <div className="r-spin" />
            </div>
          ) : (
            <div className="r-space">
              {activeTab === "noche-electoral" && (
                <NocheElectoral generalStats={generalStats} generalPartyMap={generalPartyMap} />
              )}

              {activeTab === "simulador-electoral" && (
                <div className="r-section">
                  <p style={{ color: "#7a7990", textAlign: "center" }}>Simulador electoral - Modifica votos y observa cambios en tiempo real</p>
                </div>
              )}

              {activeTab === "general" && (
                <div className="r-space">
                  <div className="r-quickstats">
                    {generalStats.slice(0, 4).map(s => (
                      <div key={s.id} className="r-stat-card">
                        <div className="r-stat-label">{s.nombre}</div>
                        <div className="r-stat-value accent">{s.escanos}</div>
                        <div className="r-stat-suffix">{s.porcentaje.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <TopSecretModal
          isOpen={showTopSecret}
          onClose={() => setShowTopSecret(false)}
          onSuccess={() => {
            setTopSecretUnlocked(true);
            setShowTopSecret(false);
            // Aquí se abre la sección de importass
            alert("Acceso concedido - Importass");
          }}
        />
      </div>
    </>
  );
}
