// ═══════════════════════════════════════════════════════════════════════════
// Results.tsx — Versión corregida y mejorada
// Fixes: comentarios, logos partidos, simulador, gobierno, infografía, mobile
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { calcularEscanosGeneralesPorProvincia, calcularEscanosJuvenilesPorProvincia } from "@/lib/dhondtByProvince";
import {
  Loader2, Download, Plus, Trash2, RefreshCw,
  Map, Grid3x3, ChevronDown, Users, BarChart2, MapPin,
  Vote, Star, TrendingUp, X, Image, FileText, Award,
  Building2, Crown, UserCheck, AlertTriangle, Activity,
  History, ArrowRight, Zap, Filter, GitBranch,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend, AreaChart, Area, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Sankey
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
import { LideresRankingSection } from "@/components/results/LideresRankingSection";
import { Top5LideresWidget } from "@/components/results/Top5LideresWidget";
import FollowUsMenu from "@/components/FollowUsMenu";
import PactometerInteractive from "@/components/PactometerInteractive";
import GovernmentBuilder from "@/components/GovernmentBuilder";
import { downloadPDFWithMetrics } from "@/lib/pdfExportMetrics";
import { usePartySync } from "@/hooks/usePartySync";
import { setRuntimePartyConfig } from "@/lib/partyRuntimeConfig";
import { getTopRegionsByParty, normalizeInfographicColor, withInfographicAlpha } from "@/lib/infographicUtils";
import { createCanonicalPartyIndex, normalizePartyReference, resolveCanonicalParty, sanitizePartyColor, type CanonicalPartyConfigRow } from "@/lib/canonicalPartyConfig";

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
interface CanonicalPartyLeaderRow {
  party_key: string;
  leader_name: string;
  photo_url: string;
  is_active?: boolean | null;
}
interface LiderPreferido {
  partido: string; lider_preferido: string; votos: number; porcentaje: number;
  photo_url?: string; color?: string; display_name?: string; logo_url?: string;
}
interface CandidateVoteHistoryTarget {
  id: number; party_key: string; leader_name: string; photo_url: string;
  display_name: string; color: string; votos: number; porcentaje: number;
  comparisonCandidates?: Omit<CandidateVoteHistoryTarget, "comparisonCandidates">[];
}
interface CandidateVoteHistoryPoint {
  fecha: string; etiqueta: string; votosDia: number; acumulado: number;
}
interface PartyMeta {
  key: string; name: string; color: string; logo: string;
}
interface RankingLiderPartido {
  partido: string; lider_preferido: string; total_votos: number; porcentaje: number;
}
interface HistoricoEleccion {
  año: number; tipo: string; partido: string;
  porcentaje: number; escanos: number; votos: number;
}
interface VotoHistorico {
  partido: string; tipo: string; snapshot_at: string;
  votos: number; porcentaje: number;
}
interface NocheElectoralRow {
  id: number;
  election_date: string; region_name: string; region_flag_url: string | null; close_at: string; escrutado?: number | null;
  results: { party_id: number; party_key: string; display_name: string; color: string; logo_url?: string; porcentaje_voto: number; escanos: number | null; proyected_escaños?: number | null; proyected_porcentaje?: number | null; candidato?: string | null; is_projection: boolean; is_final: boolean; }[];
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const RESULTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

.r-root { --top-anchor: 64px; min-height: 100vh; display: flex; flex-direction: column; background: radial-gradient(circle at 20% 10%, #1f2937 0%, #0a0a0f 45%, #07070b 100%); color: #f0eff8; font-family: 'Plus Jakarta Sans', sans-serif; }
.r-header { position: relative; top: 0; z-index: 60; height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: rgba(10,10,15,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.07); gap: 8px; }
.r-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.r-brand img { height: 28px; width: 28px; }
.r-brand-title { font-size: 14px; font-weight: 700; color: #f0eff8; line-height: 1.2; }
.r-brand-sub { font-size: 11px; color: #7a7990; }
.r-header-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.r-hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
.r-hbtn-ai { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
.r-hbtn-ai:hover { background: rgba(245,158,11,0.25); }
.r-hbtn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #7a7990; }
.r-hbtn-outline:hover { color: #f0eff8; border-color: rgba(255,255,255,0.2); }
.r-hbtn-infog { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; }
.r-hbtn-infog:hover { background: rgba(99,102,241,0.25); }
.r-hbtn-gov { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
.r-hbtn-gov:hover { background: rgba(16,185,129,0.25); }
.r-hbtn-pdf { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #a78bfa; }
.r-hbtn-pdf:hover { background: rgba(139,92,246,0.25); }

/* Subnav */
.r-subnav { position: relative; top: 0; z-index: 50; background: rgba(17,17,24,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); overflow-x: auto; }
.r-subnav::-webkit-scrollbar { height: 3px; }
.r-subnav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.r-subnav-inner { display: flex; align-items: stretch; padding: 0 16px; min-width: max-content; }
.r-nav-group { position: relative; display: flex; align-items: center; }
.r-nav-group-btn { display: flex; align-items: center; gap: 6px; padding: 12px 14px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; color: #7a7990; transition: all 0.18s; white-space: nowrap; }
.r-nav-group-btn:hover { color: #f0eff8; }
.r-nav-group-btn.active { color: #e8465a; border-bottom-color: #e8465a; }
.r-dropdown { position: absolute; top: 100%; left: 0; min-width: 200px; z-index: 100; background: #18181f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; animation: dropIn 0.15s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.5); margin-top: 2px; }
@keyframes dropIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.r-dropdown-item { display: block; width: 100%; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; background: none; border: none; color: #7a7990; border-left: 2px solid transparent; transition: all 0.15s; }
.r-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #f0eff8; }
.r-dropdown-item.active { color: #e8465a; border-left-color: #e8465a; background: rgba(232,70,90,0.06); font-weight: 700; }

/* Main */
.r-main { flex: 1; padding: 14px 20px 60px; max-width: 1180px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.r-space { display: flex; flex-direction: column; gap: 18px; }

/* Quick stats */
.r-quickstats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.r-stat-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(22px) saturate(165%); -webkit-backdrop-filter: blur(22px) saturate(165%); border: 1px solid rgba(255,255,255,0.14); box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 14px 38px rgba(5,8,20,0.38); border-radius: 14px; padding: 16px 14px; text-align: center; }
.r-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #7a7990; margin-bottom: 4px; }
.r-stat-value { font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #f0eff8; line-height: 1; }
.r-stat-value.accent { color: #e8465a; }
.r-stat-suffix { font-size: 10px; color: #7a7990; margin-top: 2px; }

/* Sort bar */
.r-sort-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.r-sort-btn { padding: 5px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; transition: all 0.18s; }
.r-sort-btn.active { background: #e8465a; border-color: #e8465a; color: #fff; }
.r-sort-hint { margin-left: auto; font-size: 11px; color: #5a596a; }

/* Party cards */
.r-party-card { --party-accent: #e8465a; background: linear-gradient(160deg, color-mix(in srgb, var(--party-accent) 12%, transparent), rgba(255,255,255,0.03)); backdrop-filter: blur(20px) saturate(175%); -webkit-backdrop-filter: blur(20px) saturate(175%); border: 1px solid color-mix(in srgb, var(--party-accent) 38%, rgba(255,255,255,0.16)); border-radius: 16px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; }
.r-party-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px color-mix(in srgb, var(--party-accent) 35%, rgba(0,0,0,0.32)); }
.r-party-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.r-party-logo-wrap { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.r-party-info { flex: 1; min-width: 0; }
.r-party-name { font-size: 16px; font-weight: 800; color: #f0eff8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-party-votes { font-size: 13px; color: #7a7990; margin-top: 2px; font-weight: 600; }
.r-party-edad { font-size: 12px; color: #c9a96e; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.r-party-seats { text-align: right; flex-shrink: 0; display: flex; flex-direction: row; gap: 12px; min-width: auto; align-items: center; }
.r-party-seats > div { flex: 1; min-width: 80px; }
.r-party-seats-num { font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; line-height: 1; }
.r-party-seats-label { font-size: 9px; color: #7a7990; }
.r-party-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
.r-party-bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: #5a596a; }
.r-party-bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.r-party-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s cubic-bezier(0.22,1,0.36,1); }

/* Mobile responsive */
@media (max-width: 768px) {
  .r-header { height: 52px; padding: 0 16px; }
  .r-brand img { height: 24px; width: 24px; }
  .r-brand-title { font-size: 12px; }
  .r-brand-sub { font-size: 10px; }
  .r-header-actions { gap: 4px; }
  .r-hbtn { padding: 5px 10px; font-size: 11px; }
  .r-subnav-inner { padding: 0 12px; }
  .r-nav-group-btn { padding: 10px 12px; font-size: 11px; }
  .r-main { padding: 12px 16px 40px; }
  .r-quickstats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .r-stat-card { padding: 12px 10px; }
  .r-stat-value { font-size: 20px; }
  .r-sort-bar { gap: 6px; }
  .r-sort-btn { padding: 4px 10px; font-size: 10px; }
  .r-sort-hint { font-size: 10px; }
  .r-party-card { padding: 12px 14px; }
  .r-party-card-top { gap: 10px; margin-bottom: 10px; }
  .r-party-logo-wrap { width: 48px; height: 48px; }
  .r-party-name { font-size: 14px; }
  .r-party-votes { font-size: 11px; }
  .r-party-edad { font-size: 10px; }
  .r-party-seats { gap: 8px; }
  .r-party-seats > div { min-width: 60px; }
  .r-party-seats-num { font-size: 18px; }
  .r-party-seats-label { font-size: 8px; }
}

@media (max-width: 480px) {
  .r-header { height: 48px; padding: 0 12px; }
  .r-brand img { height: 20px; width: 20px; }
  .r-brand-title { font-size: 11px; }
  .r-brand-sub { display: none; }
  .r-header-actions { gap: 3px; }
  .r-hbtn { padding: 4px 8px; font-size: 10px; }
  .r-subnav-inner { padding: 0 8px; }
  .r-nav-group-btn { padding: 8px 10px; font-size: 10px; }
  .r-main { padding: 10px 12px 30px; }
  .r-quickstats { grid-template-columns: 1fr; gap: 6px; }
  .r-stat-card { padding: 10px 8px; }
  .r-stat-label { font-size: 9px; }
  .r-stat-value { font-size: 18px; }
  .r-sort-bar { gap: 4px; flex-wrap: wrap; }
  .r-sort-btn { padding: 3px 8px; font-size: 9px; }
  .r-sort-hint { display: none; }
  .r-party-card { padding: 10px 12px; }
  .r-party-card-top { flex-direction: column; gap: 8px; margin-bottom: 8px; align-items: stretch; }
  .r-party-logo-wrap { width: 40px; height: 40px; flex-shrink: 0; }
  .r-party-info { width: 100%; }
  .r-party-name { font-size: 13px; }
  .r-party-votes { font-size: 10px; }
  .r-party-edad { font-size: 9px; }
  .r-party-seats { width: 100%; flex-wrap: wrap; gap: 4px; justify-content: space-between; }
  .r-party-seats > div { flex: 1; min-width: 45px; }
  .r-party-seats-num { font-size: 14px; }
  .r-party-seats-label { font-size: 7px; }
}

/* Section card */
.r-section { background: linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)); backdrop-filter: blur(24px) saturate(170%); -webkit-backdrop-filter: blur(24px) saturate(170%); border: 1px solid rgba(255,255,255,0.14); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 48px rgba(1,6,18,0.45); border-radius: 16px; padding: 20px; }
.r-section-title { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; color: #f0eff8; letter-spacing: -0.01em; margin: 0 0 4px; }
.r-section-sub { font-size: 12px; color: #7a7990; margin: 0 0 16px; }


.r-direct-grid { display: grid; gap: 12px; }
.r-direct-card { background: linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 14px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 18px 44px rgba(0,0,0,0.35); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); }
.r-direct-header { display:flex; align-items:center; gap:10px; }
.r-direct-meta { margin-left:auto; display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.r-direct-pill { font-size:11px; border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:4px 10px; color:#d8dbea; background: rgba(255,255,255,0.08); }
.r-direct-list { display:grid; gap:6px; margin-top:8px; }
.r-direct-row { display:flex; align-items:center; gap:8px; font-size:12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px 10px; }

/* Leader cards */
.r-leader-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.r-leader-card { background: linear-gradient(155deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 16px 12px; text-align: center; transition: all 0.2s; }
.r-leader-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
.r-leader-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin: 0 auto 10px; display: block; }
.r-leader-img-placeholder { width: 72px; height: 72px; border-radius: 50%; background: #18181f; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #7a7990; margin: 0 auto 10px; }
.r-leader-name { font-size: 12px; font-weight: 700; color: #f0eff8; margin-bottom: 8px; line-height: 1.3; }
.r-leader-score { font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; color: #e8465a; line-height: 1; margin-bottom: 4px; }
.r-leader-bar-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 3px; }
.r-leader-bar-fill { height: 100%; border-radius: 2px; }
.r-leader-count { font-size: 10px; color: #5a596a; }

/* Subtabs */
.r-subtab-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.r-subtab-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #7a7990; transition: all 0.18s; }
.r-subtab-btn:hover { border-color: rgba(255,255,255,0.16); color: #f0eff8; }
.r-subtab-btn.active { color: #fff; border-color: transparent; }

/* Leader valoracion por partido */
.r-lxp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.r-lxp-table th { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5a596a; padding: 8px 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
.r-lxp-table td { padding: 9px 10px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #f0eff8; vertical-align: middle; }
.r-lxp-table tr:last-child td { border-bottom: none; }
.r-lxp-table tr:hover td { background: rgba(255,255,255,0.02); }

/* Simulator */
.r-sim-wrap { background: #0d0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
.r-sim-header { padding: 20px 22px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.r-sim-title { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; color: #f0eff8; margin: 0 0 2px; }
.r-sim-sub { font-size: 11px; color: #7a7990; margin: 0; }
.r-sim-body { padding: 20px; }
.r-mode-tabs { display: flex; gap: 2px; padding: 3px; background: rgba(255,255,255,0.05); border-radius: 10px; width: fit-content; margin-bottom: 16px; }
.r-mode-tab { padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; border: none; background: transparent; color: #7a7990; transition: all 0.18s; }
.r-mode-tab.active { background: #e8465a; color: #fff; }
.r-sim-total { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; padding: 8px 14px; margin-bottom: 14px; font-size: 12px; color: #7a7990; flex-wrap: wrap; }
.r-sim-total strong { color: #e8465a; font-size: 15px; }
.r-sim-party-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.r-sim-party-row { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; padding: 8px 12px; transition: border-color 0.18s; }
.r-sim-party-row:hover { border-color: rgba(255,255,255,0.12); }
.r-sim-party-logo { width: 20px; height: 20px; object-fit: contain; border-radius: 4px; flex-shrink: 0; }
.r-sim-party-name { flex: 1; font-size: 12px; font-weight: 600; color: #f0eff8; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-sim-pct { font-size: 10px; color: #7a7990; min-width: 30px; text-align: right; }
.r-sim-input { width: 72px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 7px; padding: 4px 7px; text-align: right; font-size: 11px; color: #f0eff8; font-family: inherit; outline: none; flex-shrink: 0; transition: border-color 0.18s; }
.r-sim-input:focus { border-color: #e8465a; }
.r-sim-results { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-top: 16px; }
.r-sim-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.r-sim-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.r-sim-row-name { font-size: 12px; font-weight: 600; color: #f0eff8; width: 100px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.r-sim-row-bar { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; position: relative; }
.r-sim-row-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.r-sim-row-majority { position: absolute; top: 0; height: 100%; width: 1px; background: rgba(245,158,11,0.6); }
.r-sim-row-seats { font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800; min-width: 28px; text-align: right; }
.r-sim-row-pct { font-size: 10px; color: #5a596a; min-width: 34px; text-align: right; }
.r-sim-add { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
.r-sim-add-title { font-size: 11px; font-weight: 700; color: #5a596a; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
.r-sim-add-row { display: flex; gap: 6px; flex-wrap: wrap; }
.r-sim-add-input { flex: 1; min-width: 120px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 7px 10px; font-size: 12px; color: #f0eff8; font-family: inherit; outline: none; }
.r-sim-add-btn { display: flex; align-items: center; gap: 4px; padding: 7px 14px; background: #e8465a; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; color: #fff; font-family: inherit; cursor: pointer; }

/* Map */
.r-map-toggle { display: flex; gap: 4px; }
.r-map-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 7px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; transition: all 0.18s; }
.r-map-btn.active { background: #e8465a; border-color: #e8465a; color: #fff; }

/* Infog modal */
.r-infog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
.r-infog-modal { background: #111118; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; padding: 28px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; }
.r-infog-title { font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #f0eff8; margin: 0 0 6px; }
.r-infog-sub { font-size: 13px; color: #7a7990; margin: 0 0 20px; }
.r-infog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.r-infog-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.08); background: #18181f; cursor: pointer; transition: all 0.18s; text-align: center; }
.r-infog-option:hover { border-color: rgba(255,255,255,0.18); }
.r-infog-option.selected { border-color: #e8465a; background: rgba(232,70,90,0.08); }
.r-infog-option-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.r-infog-option-label { font-size: 12px; font-weight: 700; color: #f0eff8; }
.r-infog-option-desc { font-size: 10px; color: #7a7990; }
.r-infog-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.r-infog-cancel { padding: 9px 18px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
.r-infog-generate { padding: 9px 22px; border-radius: 9px; border: none; background: #e8465a; color: #fff; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; }

/* Government builder */
.r-gov-modal { background: #111118; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; padding: 28px; max-width: 780px; width: 100%; max-height: 92vh; overflow-y: auto; }
.r-gov-ministry { background: #18181f; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; transition: border-color 0.2s; }
.r-gov-ministry:hover { border-color: rgba(255,255,255,0.14); }
.r-gov-ministry-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #5a596a; margin-bottom: 6px; }
.r-gov-ministry-name { font-size: 13px; font-weight: 600; color: #f0eff8; margin-bottom: 4px; }
.r-gov-ministry-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 7px; padding: 6px 10px; font-size: 12px; color: #f0eff8; font-family: inherit; outline: none; margin-top: 4px; transition: border-color 0.18s; }
.r-gov-ministry-input:focus { border-color: #e8465a; }

/* Methodology */
.r-method { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.r-method-key { font-size: 11px; font-weight: 700; color: #f0eff8; margin-bottom: 3px; }
.r-method-val { font-size: 11px; color: #7a7990; line-height: 1.5; }

/* Select */
.r-select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; padding: 9px 12px; font-size: 13px; color: #f0eff8; font-family: inherit; outline: none; appearance: none; transition: border-color 0.18s; }
.r-select:focus { border-color: #e8465a; }
.r-select option { background: #18181f; }
.r-circ-info { display: flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 9px; padding: 9px 14px; font-size: 12px; color: #f59e0b; margin-bottom: 12px; }
.r-empty-circ { text-align: center; padding: 36px 20px; color: #5a596a; }
.r-trash-btn { background: none; border: none; color: #5a596a; cursor: pointer; padding: 4px; transition: color 0.18s; }
.r-trash-btn:hover { color: #e8465a; }

/* CTA */
.r-cta { text-align: center; padding: 20px; }
.r-cta-text { font-size: 13px; color: #7a7990; margin-bottom: 10px; }
.r-cta-btn { padding: 9px 24px; border-radius: 9px; background: #e8465a; border: none; color: #fff; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; }
.r-cta-btn:hover { background: #ff6b7a; }

/* Helpers */
.r-loader { display: flex; align-items: center; justify-content: center; padding: 60px 20px; }
.r-spin { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08); border-top-color: #e8465a; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .r-header { padding: 0 12px; height: 52px; }
  .r-brand-title { font-size: 13px; }
  .r-brand-sub { display: none; }
  .r-header-actions .r-hbtn span { display: none; }
  .r-header-actions .r-hbtn { padding: 6px 8px; }
  .r-main { padding: 14px 12px 50px; }
  .r-quickstats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .r-stat-value { font-size: 20px; }
  .r-section { padding: 16px 14px; }
  .r-section-title { font-size: 16px; }
  .r-party-card { padding: 12px 14px; }
  .r-leader-grid { grid-template-columns: repeat(2, 1fr); }
  .r-sim-party-grid { grid-template-columns: 1fr; }
  .r-method { grid-template-columns: 1fr; }
  .r-lxp-table { font-size: 10px; }
  .r-lxp-table th, .r-lxp-table td { padding: 6px 8px; }
  .r-infog-grid { grid-template-columns: 1fr; }
  .r-sim-header { padding: 14px 16px; }
  .r-sim-body { padding: 14px; }
  .r-gov-modal { padding: 20px 16px; }
}
@media (max-width: 480px) {
  .r-quickstats { grid-template-columns: repeat(2, 1fr); }
  .r-sim-add-row { flex-direction: column; }
  .r-nav-group-btn { padding: 10px 10px; font-size: 11px; }
}

/* BC visual refresh: solo presentación, sin cambios de datos o interacción */
.r-root {
  background:
    radial-gradient(circle at 6% 0%, rgba(232, 70, 90, 0.16), transparent 26%),
    radial-gradient(circle at 96% 18%, rgba(56, 189, 248, 0.1), transparent 28%),
    linear-gradient(145deg, #060914 0%, #0b1020 52%, #070a14 100%);
}
.r-header {
  background: linear-gradient(180deg, rgba(9, 14, 30, 0.9), rgba(10, 14, 27, 0.68));
  border-bottom-color: rgba(255, 255, 255, 0.13);
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.07);
}
.r-subnav {
  background: rgba(10, 16, 32, 0.78);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.17);
}
.r-stat-card,
.r-party-card,
.r-section,
.r-sim-wrap,
.r-sim-results,
.r-infog-modal,
.r-gov-modal {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035));
  backdrop-filter: blur(24px) saturate(155%);
  -webkit-backdrop-filter: blur(24px) saturate(155%);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.12), inset -1px -1px 0 rgba(2, 6, 23, 0.3), 14px 18px 38px rgba(2, 6, 23, 0.3);
}
.r-stat-card,
.r-party-card,
.r-section,
.r-sim-wrap {
  border-radius: 20px;
}
.r-stat-card:hover,
.r-party-card:hover,
.r-section:hover,
.r-sim-wrap:hover {
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.16), 18px 24px 46px rgba(2, 6, 23, 0.4), 0 0 28px rgba(232, 70, 90, 0.07);
}
.r-dropdown,
.r-infog-option,
.r-gov-ministry,
.r-sim-party-row,
.r-mode-tabs {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.78), rgba(15, 23, 42, 0.62));
  border-color: rgba(255, 255, 255, 0.13);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.08), 10px 14px 28px rgba(2, 6, 23, 0.22);
}
.r-sort-btn,
.r-subtab-btn,
.r-map-btn,
.r-hbtn-outline {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.r-sort-btn:hover,
.r-subtab-btn:hover,
.r-map-btn:hover,
.r-hbtn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}
.r-select,
.r-sim-input,
.r-sim-add-input,
.r-gov-ministry-input {
  background: rgba(2, 6, 23, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: inset 2px 2px 5px rgba(2, 6, 23, 0.22), inset -1px -1px 2px rgba(255, 255, 255, 0.04);
}
.r-cta-btn,
.r-hbtn-ai,
.r-hbtn-infog,
.r-hbtn-gov,
.r-hbtn-pdf {
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16);
}
@media (max-width: 768px) {
  .r-stat-card,
  .r-party-card,
  .r-section,
  .r-sim-wrap { border-radius: 16px; }
}
`;

// ─── Tab navigation ──────────────────────────────────────────────────────────
type TabKey =
  | "general" | "mapa-hemiciclo" | "encuestadoras-externas" | "ccaa"
  | "provincias" | "comparacion-ccaa" | "youth" | "asoc-juv-mapa-hemiciclo"
  | "leaders" | "tendencias" | "lideres-preferidos" | "lideres-partidos"
  | "preguntas-varias" | "analisis-avanzado" | "contexto-historico" | "noche-electoral" | "primarias" | "crisis-ceuta" | "lideres-ranking";

interface TabGroup { label: string; icon: React.ReactNode; tabs: { key: TabKey; label: string }[]; }

async function exportResultsSummaryPng(stats: PartyStats[], activeTab: TabKey, totalResponses: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1120;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear el lienzo de exportación.");
  const drawRounded = (x: number, y: number, width: number, height: number, radius: number) => {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  };
  const rows = stats.slice().sort((a, b) => b.votos - a.votos).slice(0, 8);
  const title = activeTab === "general" ? "Resultados Generales" : activeTab === "youth" ? "Asociaciones Juveniles" : "Resumen de Resultados";
  const date = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date());

  const background = context.createLinearGradient(0, 0, 1800, 1120);
  background.addColorStop(0, "#060817");
  background.addColorStop(0.55, "#11162b");
  background.addColorStop(1, "#210d17");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#e8465a";
  context.fillRect(0, 0, 1800, 14);
  context.fillStyle = "#f8fafc";
  context.font = "900 56px Inter, Arial, sans-serif";
  context.fillText("BATALLA CULTURAL", 96, 125);
  context.font = "800 32px Inter, Arial, sans-serif";
  context.fillStyle = "#e8465a";
  context.fillText(title.toUpperCase(), 96, 178);
  context.font = "500 24px Inter, Arial, sans-serif";
  context.fillStyle = "#aeb8cc";
  context.fillText(`Generado el ${date}`, 96, 220);

  context.fillStyle = "rgba(255,255,255,0.07)";
  drawRounded(1190, 84, 510, 170, 28);
  context.fillStyle = "#aeb8cc";
  context.font = "700 23px Inter, Arial, sans-serif";
  context.fillText("RESPUESTAS ANALIZADAS", 1230, 140);
  context.fillStyle = "#f8fafc";
  context.font = "900 68px Inter, Arial, sans-serif";
  context.fillText(totalResponses.toLocaleString("es-ES"), 1230, 215);

  const columnWidth = 765;
  const cardHeight = 150;
  rows.forEach((row, index) => {
    const column = index % 2;
    const line = Math.floor(index / 2);
    const x = 96 + column * (columnWidth + 80);
    const y = 310 + line * (cardHeight + 34);
    context.fillStyle = "rgba(255,255,255,0.065)";
    drawRounded(x, y, columnWidth, cardHeight, 24);
    context.fillStyle = row.color || "#e8465a";
    drawRounded(x + 26, y + 27, 12, 96, 6);
    context.fillStyle = "#f8fafc";
    context.font = "800 31px Inter, Arial, sans-serif";
    context.fillText(row.nombre, x + 68, y + 62);
    context.fillStyle = "#b6c0d3";
    context.font = "600 22px Inter, Arial, sans-serif";
    context.fillText(`${row.votos.toLocaleString("es-ES")} votos · ${Number(row.porcentaje || 0).toFixed(1)}%`, x + 68, y + 105);
    context.textAlign = "right";
    context.fillStyle = "#f8fafc";
    context.font = "900 42px Inter, Arial, sans-serif";
    context.fillText(`${row.escanos || 0}`, x + columnWidth - 34, y + 79);
    context.fillStyle = "#aeb8cc";
    context.font = "700 16px Inter, Arial, sans-serif";
    context.fillText("ESCAÑOS", x + columnWidth - 34, y + 108);
    context.textAlign = "left";
  });
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.fillRect(96, 1016, 1608, 1);
  context.fillStyle = "#8d99ae";
  context.font = "600 18px Inter, Arial, sans-serif";
  context.fillText("Resultados de participación anónima · Batalla Cultural", 96, 1065);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((file) => file ? resolve(file) : reject(new Error("El navegador no pudo crear el PNG.")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `batalla-cultural-${activeTab}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

const TAB_GROUPS: TabGroup[] = [
  { label: "Elecciones", icon: <Vote className="w-3.5 h-3.5" />, tabs: [
    { key: "general", label: "Resultados Generales" },
    { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
    { key: "encuestadoras-externas", label: "Encuestadoras" },
  ]},
  { label: "Territorio", icon: <MapPin className="w-3.5 h-3.5" />, tabs: [
    { key: "ccaa", label: "Comunidades Autónomas" },
    { key: "provincias", label: "Provincias" },
    { key: "comparacion-ccaa", label: "Comparar CCAA" },
  ]},
  { label: "Juventud", icon: <Users className="w-3.5 h-3.5" />, tabs: [
    { key: "youth", label: "Asociaciones Juveniles" },
    { key: "asoc-juv-mapa-hemiciclo", label: "Mapa Juvenil" },
  ]},
  { label: "Líderes", icon: <Star className="w-3.5 h-3.5" />, tabs: [
    { key: "lideres-partidos", label: "Líderes por Partido" },
    { key: "leaders", label: "Valoración" },
    { key: "lideres-preferidos", label: "Preferidos" },
    { key: "lideres-ranking", label: "Ranking de Líderes" },
  ]},
  { label: "Análisis", icon: <BarChart2 className="w-3.5 h-3.5" />, tabs: [
    { key: "tendencias", label: "Tendencias" },
    { key: "contexto-historico", label: "Contexto Histórico" },
    { key: "preguntas-varias", label: "Preguntas Varias" },
  ]},
  { label: "Crisis Ceuta", icon: <AlertTriangle className="w-3.5 h-3.5" />, tabs: [
    { key: "crisis-ceuta", label: "Análisis de Crisis" },
  ]},
];

// ─── NavBar ───────────────────────────────────────────────────────────────────
function ResultsNavBar({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 220 });
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideNav = ref.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideNav && !insideDropdown) setOpenGroup(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleGroupClick = (label: string, e: React.MouseEvent) => {
    const btn = buttonRefs.current[label];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(220, rect.width + 48),
      });
    }
    setOpenGroup(openGroup === label ? null : label);
  };

  return (
    <div ref={ref} className="r-subnav" style={{ position: "relative" }}>
      <div className="r-subnav-inner">
        {TAB_GROUPS.map(group => {
          const active = group.tabs.find(t => t.key === activeTab);
          const isOpen = openGroup === group.label;
          return (
            <div key={group.label} className="r-nav-group" style={{ position: "relative" }}>
              <button
                ref={(el) => { buttonRefs.current[group.label] = el; }}
                className={`r-nav-group-btn${active ? " active" : ""}`}
                onClick={(e) => handleGroupClick(group.label, e)}
              >
                {group.icon}
                <span>{active ? active.label : group.label}</span>
                <ChevronDown size={11} style={{ opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
              </button>
              {isOpen && (
                createPortal(
                  <div ref={dropdownRef} className="r-dropdown" style={{ position: "fixed", top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px`, minWidth: `${dropdownPos.width}px`, zIndex: 2147483647 }}>
                    {group.tabs.map(tab => (
                      <button key={tab.key} className={`r-dropdown-item${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => { onTabChange(tab.key); setOpenGroup(null); }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Party Logo helper ────────────────────────────────────────────────────────
function PartyLogoImg({ src, name, color, size = 36 }: { src?: string; name: string; color?: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name} style={{ width: size, height: size, objectFit: "contain", borderRadius: 6 }} onError={() => setErr(true)} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 6, background: color || "#e8465a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  );
}

// ─── MINISTERIOS ──────────────────────────────────────────────────────────────
const MINISTERIOS = [
  { id: "presidencia", titulo: "Presidencia del Gobierno", icon: "🏛️" },
  { id: "vicepresidencia", titulo: "Vicepresidencia 1ª", icon: "🔑" },
  { id: "vicepresidencia2", titulo: "Vicepresidencia 2ª", icon: "🔑" },
  { id: "exteriores", titulo: "Asuntos Exteriores", icon: "🌍" },
  { id: "defensa", titulo: "Defensa", icon: "⚔️" },
  { id: "interior", titulo: "Interior", icon: "🛡️" },
  { id: "hacienda", titulo: "Hacienda", icon: "💰" },
  { id: "justicia", titulo: "Justicia", icon: "⚖️" },
  { id: "educacion", titulo: "Educación", icon: "📚" },
  { id: "sanidad", titulo: "Sanidad", icon: "🏥" },
  { id: "trabajo", titulo: "Trabajo", icon: "🔨" },
  { id: "economia", titulo: "Economía", icon: "📊" },
  { id: "industria", titulo: "Industria", icon: "🏭" },
  { id: "transportes", titulo: "Transportes", icon: "🚂" },
  { id: "agricultura", titulo: "Agricultura", icon: "🌾" },
  { id: "cultura", titulo: "Cultura", icon: "🎭" },
  { id: "ciencia", titulo: "Ciencia e Innovación", icon: "🔬" },
  { id: "inclusion", titulo: "Inclusión y Seguridad Social", icon: "🤝" },
];
type MinisterioEditable = { id: string; titulo: string; icon: string; ministro: string; partido: string; foto: string };

// ─── Government Builder Modal ─────────────────────────────────────────────────
function GobiernoModal({
  onClose, leaders, partyMeta, logoPresidenciaB64, initialParty
}: {
  onClose: () => void;
  leaders: PartyLeader[];
  partyMeta: Record<string, PartyMeta>;
  logoPresidenciaB64: string;
  initialParty?: string | null;
}) {
  const GOV_STORAGE_KEY = "bc_gobierno_builder_state_v1";
  const [selectedParty, setSelectedParty] = useState(initialParty || "");
  const [selectedLeader, setSelectedLeader] = useState("");
  const [ministerios, setMinisterios] = useState<MinisterioEditable[]>(
    MINISTERIOS.map(m => ({ id: m.id, titulo: m.titulo, icon: m.icon, ministro: "", partido: "", foto: "" }))
  );
  const [nombreGobierno, setNombreGobierno] = useState("Gobierno de España");
  const [generando, setGenerando] = useState(false);
  const [dragMinistryId, setDragMinistryId] = useState<string | null>(null);

  const partyLeaders = leaders.filter(l => l.party_key === selectedParty);
  const partyKeys = Array.from(new Set(leaders.map(l => l.party_key)));

  useEffect(() => {
    if (initialParty) setSelectedParty(initialParty);
  }, [initialParty]);

  const updateMin = (id: string, patch: Partial<MinisterioEditable>) => {
    setMinisterios(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };
  const handleAddMinistry = () => setMinisterios(prev => [...prev, { id: `custom_${Date.now()}`, titulo: "Nuevo Ministerio", icon: "🏛️", ministro: "", partido: "", foto: "" }]);
  const handleRemoveMinistry = (id: string) => setMinisterios(prev => prev.filter(m => m.id !== id));
  const handleMoveMinistry = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setMinisterios(prev => {
      const from = prev.findIndex(m => m.id === fromId);
      const to = prev.findIndex(m => m.id === toId);
      if (from < 0 || to < 0) return prev;
      const clone = [...prev];
      const [item] = clone.splice(from, 1);
      clone.splice(to, 0, item);
      return clone;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(GOV_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.selectedParty) setSelectedParty(parsed.selectedParty);
      if (parsed?.selectedLeader) setSelectedLeader(parsed.selectedLeader);
      if (parsed?.nombreGobierno) setNombreGobierno(parsed.nombreGobierno);
      if (Array.isArray(parsed?.ministerios)) setMinisterios(parsed.ministerios);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    localStorage.setItem(GOV_STORAGE_KEY, JSON.stringify({ selectedParty, selectedLeader, nombreGobierno, ministerios }));
  }, [selectedParty, selectedLeader, nombreGobierno, ministerios]);

  useEffect(() => {
    if (!selectedLeader) return;
    const matched = leaders.find((l) => l.leader_name === selectedLeader);
    const leaderParty = matched?.party_key || selectedParty || "";

    setMinisterios((prev) => prev.map((m) => m.id === "presidencia"
      ? { ...m, ministro: selectedLeader, partido: leaderParty, foto: m.foto || matched?.photo_url || "" }
      : m));

    if (leaderParty && leaderParty !== selectedParty) setSelectedParty(leaderParty);
  }, [selectedLeader, selectedParty, leaders]);


  const buildImageCandidates = (src?: string) => {
    if (!src) return [] as string[];
    const clean = String(src).trim();
    if (!clean) return [] as string[];
    const noProto = clean.replace(/^https?:\/\//, "");
    return [
      clean,
      `https://images.weserv.nl/?url=${encodeURIComponent(noProto)}`,
      `https://proxy.cors.sh/${clean}`,
    ];
  };

  const openPreviewTab = () => {
    const preview = window.open("", "_blank", "noopener,noreferrer");
    if (!preview) return;
    const cards = ministerios.map((m) => {
      const leader = leaders.find(l => l.leader_name === m.ministro);
      const pKey = m.partido || leader?.party_key || "";
      const meta = partyMeta[pKey];
      const image = m.foto || leader?.photo_url || "";
      return `<article style="border:1px solid rgba(255,255,255,.18);background:linear-gradient(160deg,rgba(255,255,255,.20),rgba(255,255,255,.06));backdrop-filter:blur(12px);border-radius:16px;padding:12px;color:#fff;">
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${image}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;background:${meta?.color || '#444'}" onerror="this.style.display='none'"/>
          <div><div style="font-weight:700">${m.titulo || 'Ministerio'}</div><div style="font-size:12px;opacity:.85">${m.ministro || 'Sin asignar'}</div></div>
        </div>
      </article>`;
    }).join('');
    preview.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Preview Gobierno</title></head><body style="margin:0;padding:20px;background:#0c0f1a;font-family:Inter,system-ui"><h1 style="color:#fff">${nombreGobierno}</h1><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">${cards}</div><div style="margin-top:16px"><button onclick="window.print()" style="padding:10px 14px;border-radius:10px;border:0;background:#C41E3A;color:#fff">Capturar / Guardar (Imprimir)</button></div></body></html>`);
    preview.document.close();
  };

  const generarInfografia = async () => {
    setGenerando(true);
    try {
      const loadImage = (src?: string) => new Promise<HTMLImageElement | null>((resolve) => {
        const candidates = buildImageCandidates(src);
        if (!candidates.length) return resolve(null);
        const tryNext = (idx: number) => {
          if (idx >= candidates.length) return resolve(null);
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";
          img.onload = () => resolve(img);
          img.onerror = () => tryNext(idx + 1);
          img.src = candidates[idx];
        };
        tryNext(0);
      });
      // Crear canvas con el gobierno
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d")!;

      // Fondo oscuro con gradiente
      const grad = ctx.createLinearGradient(0, 0, 0, 1000);
      grad.addColorStop(0, "#0a0a1a");
      grad.addColorStop(1, "#111128");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      // Franja roja superior
      ctx.fillStyle = "#C41E3A";
      ctx.fillRect(0, 0, 1600, 6);

      // Logo presidencia
      if (logoPresidenciaB64) {
        const img = new window.Image();
        await new Promise<void>((resolve) => {
          img.onload = () => { ctx.drawImage(img, 40, 20, 320, 80); resolve(); };
          img.onerror = () => resolve();
          img.src = logoPresidenciaB64;
        });
      }

      // Título gobierno (más arriba)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px 'DM Sans', sans-serif";
      ctx.fillText(nombreGobierno, 400, 44);
      ctx.font = "16px 'DM Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long" }), 400, 68);

      // Divider
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(40, 96, 1520, 1);

      // Partido y presidente
      const pm = partyMeta[selectedParty];
      if (pm) {
        ctx.fillStyle = pm.color || "#e8465a";
        ctx.beginPath();
        ctx.roundRect(40, 112, 300, 64, 10);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'DM Sans', sans-serif";
        ctx.fillText(pm.name || selectedParty, 60, 140);
        ctx.font = "13px 'DM Sans', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(`Presidente: ${selectedLeader || "—"}`, 60, 162);
      }

      // Grid ministerios (mismo estilo que previsualización instantánea)
      const cols = 4;
      const boxW = 360;
      const boxH = 150;
      const startX = 40;
      const startY = 200;
      const gapX = 20;
      const gapY = 16;

      for (let i = 0; i < ministerios.length; i++) {
        const min = ministerios[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (boxW + gapX);
        const y = startY + row * (boxH + gapY);
        const leader = leaders.find(l => l.leader_name === min.ministro);
        const pKey = min.partido || leader?.party_key || "";
        const pMeta = partyMeta[pKey];
        const titular = min.ministro || "Sin asignar";

        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.beginPath(); ctx.roundRect(x, y, boxW, boxH, 14); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.stroke();

        // avatar
        const avatarX = x + 14, avatarY = y + 16, avatarS = 36;
        ctx.fillStyle = pMeta?.color || "#444";
        ctx.beginPath(); ctx.arc(avatarX + avatarS / 2, avatarY + avatarS / 2, avatarS / 2, 0, Math.PI * 2); ctx.fill();
        const avatarImg = await loadImage(min.foto || leader?.photo_url);
        if (avatarImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX + avatarS / 2, avatarY + avatarS / 2, avatarS / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarS, avatarS);
          ctx.restore();
        } else {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px 'DM Sans', sans-serif";
          ctx.fillText((titular || "I").charAt(0).toUpperCase(), avatarX + 12, avatarY + 24);
        }

        // texts
        ctx.fillStyle = "#f0eff8"; ctx.font = "bold 13px 'DM Sans', sans-serif";
        ctx.fillText(min.titulo || "Ministerio", x + 58, y + 30);
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "12px 'DM Sans', sans-serif";
        ctx.fillText(titular.length > 32 ? `${titular.slice(0, 32)}…` : titular, x + 14, y + 68);

        // party tag + logo
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath(); ctx.roundRect(x + 14, y + 82, 94, 20, 10); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace";
        ctx.fillText((pMeta?.name || pKey || "IND").slice(0, 12), x + 20, y + 96);
        const logoImg = await loadImage(pMeta?.logo);
        if (logoImg) {
          ctx.drawImage(logoImg, x + boxW - 44, y + 84, 24, 24);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.font = "10px monospace";
          ctx.fillText("IND", x + boxW - 44, y + 98);
        }
      }

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "11px monospace";
      ctx.fillText("Generado por La Encuesta de Batalla Cultural · datos.encuestadebc.es", 40, 975);

      // Descargar
      const link = document.createElement("a");
      link.download = `gobierno-${selectedParty || "españa"}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 0.95);
      link.click();
    } catch (e) {
      console.error(e);
      alert("Error generando infografía");
    }
    setGenerando(false);
  };

  return (
    <div className="r-infog-backdrop" onClick={onClose}>
      <div className="r-gov-modal" onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(165deg, rgba(25,29,46,.92), rgba(14,16,28,.88))", backdropFilter: "blur(16px) saturate(145%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="r-infog-title">🏛️ Constructor de Gobierno</div>
            <div className="r-infog-sub">Asigna ministros y genera una infografía</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7a7990", cursor: "pointer" }}><X size={18} /></button>
        </div>

        {/* Partido y presidencia */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Partido gobernante</label>
            <select className="r-select" value={selectedParty} onChange={e => {
              const partyKey = e.target.value;
              setSelectedParty(partyKey);
              const firstLeader = leaders.find(l => l.party_key === partyKey);
              if (firstLeader) setSelectedLeader(firstLeader.leader_name);
            }}>
              <option value="">Seleccionar partido…</option>
              {partyKeys.map(pk => <option key={pk} value={pk}>{partyMeta[pk]?.name || pk}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Candidato/a a presidencia (auto-presidente)</label>
            <select className="r-select" value={selectedLeader} onChange={e => setSelectedLeader(e.target.value)}>
              <option value="">Seleccionar candidato…</option>
              {leaders.map(l => <option key={l.id} value={l.leader_name}>{l.leader_name} ({l.party_key})</option>)}
              <option value="Independiente">Independiente (IND)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Nombre del Gobierno</label>
          <input className="r-gov-ministry-input" style={{ borderRadius: 9, padding: "9px 12px", fontSize: 13 }} value={nombreGobierno} onChange={e => setNombreGobierno(e.target.value)} placeholder="Gobierno de España" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7a7990", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ministerios</div>
          <button className="r-infog-generate" style={{ padding: "6px 10px", fontSize: 11 }} onClick={handleAddMinistry}><Plus size={12} />Añadir</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
          {ministerios.map(min => (
            <div
              key={min.id}
              className="r-gov-ministry"
              draggable
              onDragStart={() => setDragMinistryId(min.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragMinistryId) handleMoveMinistry(dragMinistryId, min.id); setDragMinistryId(null); }}
              style={{ transition: "all .2s ease", borderColor: dragMinistryId === min.id ? "#e8465a" : undefined }}
            >
              <div className="r-gov-ministry-title">{min.icon || "🏛️"} {min.titulo}</div>
              <input className="r-gov-ministry-input" placeholder="Título del ministerio…" value={min.titulo} onChange={e => updateMin(min.id, { titulo: e.target.value })} />
              <select className="r-select" value={min.ministro} onChange={e => updateMin(min.id, { ministro: e.target.value })}>
                <option value="">Candidato predefinido…</option>
                {leaders.map(l => <option key={l.id} value={l.leader_name}>{l.leader_name} ({l.party_key})</option>)}
                <option value="Independiente">Independiente</option>
              </select>
              <input
                className="r-gov-ministry-input"
                placeholder="Nombre del ministro/a…"
                value={min.ministro || ""}
                onChange={e => updateMin(min.id, { ministro: e.target.value })}
              />
              <input className="r-gov-ministry-input" placeholder="Partido (opcional)" value={min.partido || ""} onChange={e => updateMin(min.id, { partido: e.target.value })} />
              <input className="r-gov-ministry-input" placeholder="URL imagen ministro (opcional)" value={min.foto || ""} onChange={e => updateMin(min.id, { foto: e.target.value })} />
              <button className="r-trash-btn" onClick={() => handleRemoveMinistry(min.id)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7a7990", marginBottom: 8 }}>Previsualización (todos los ministerios)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {ministerios.map(min => {
              const leader = leaders.find(l => l.leader_name === min.ministro);
              const pKey = min.partido || leader?.party_key || "";
              const pMeta = partyMeta[pKey];
              return (
                <div key={`preview_${min.id}`} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {leader?.photo_url
                      ? <img src={leader.photo_url} alt={min.ministro} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                      : <div style={{ width: 28, height: 28, borderRadius: "50%", background: pMeta?.color || "#444", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{(min.ministro || "IND").charAt(0)}</div>}
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{min.titulo}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#f0eff8" }}>{min.ministro || "Sin asignar"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#7a7990", marginTop: 4 }}>
                    {pMeta?.logo ? <img src={pMeta.logo} alt={pKey} style={{ width: 14, height: 14, objectFit: "contain" }} /> : <span style={{ padding: "1px 5px", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10 }}>IND</span>}
                    <span>{pMeta?.name || pKey || "IND"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="r-infog-footer">
          <button className="r-infog-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="r-infog-generate"
            onClick={generarInfografia}
            disabled={generando}
            style={{ display: "flex", alignItems: "center", gap: 6, opacity: generando ? 0.7 : 1 }}
          >
            <Download size={13} />
            {generando ? "Generando…" : "Generar Infografía PNG"}
          </button>
          <button className="r-infog-cancel" onClick={openPreviewTab}>Abrir preview en pestaña</button>
        </div>
      </div>
    </div>
  );
}

// ─── InfografiaModal mejorada ─────────────────────────────────────────────────
function InfografiaModal({ parties, onClose, onGenerate }: {
  parties: PartyStats[]; onClose: () => void;
  onGenerate: (type: "general" | "party" | "leaders", party?: string) => Promise<void>;
}) {
  const [type, setType] = useState<"general" | "party" | "leaders">("general");
  const [selectedParty, setSelectedParty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generate = async () => {
    if (type === "party" && !selectedParty) {
      setGenerationError("Selecciona un partido antes de generar su infografía.");
      return;
    }
    setGenerationError(null);
    setIsGenerating(true);
    try {
      await onGenerate(type, selectedParty || undefined);
      onClose();
    } catch (error) {
      console.error("No se pudo generar la infografía:", error);
      setGenerationError("No se pudo generar la infografía. Prueba de nuevo en unos segundos.");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="r-infog-backdrop" onClick={onClose}>
      <div className="r-infog-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h2 className="r-infog-title">Generar Infografía</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7a7990", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <p className="r-infog-sub">Selecciona el tipo de infografía</p>
        <div className="r-infog-grid">
          {[
            { t: "general" as const, icon: <BarChart2 size={20} color="#e8465a" />, bg: "rgba(232,70,90,0.15)", label: "General", desc: "Resultados globales" },
            { t: "party" as const, icon: <Award size={20} color="#818cf8" />, bg: "rgba(99,102,241,0.15)", label: "Por Partido", desc: "Perfil detallado" },
            { t: "leaders" as const, icon: <Users size={20} color="#34d399" />, bg: "rgba(52,211,153,0.15)", label: "Top 5 Líderes", desc: "Ranking de valoración" },
          ].map(opt => (
            <button key={opt.t} className={`r-infog-option${type === opt.t ? " selected" : ""}`} onClick={() => setType(opt.t)}>
              <div className="r-infog-option-icon" style={{ background: opt.bg }}>{opt.icon}</div>
              <span className="r-infog-option-label">{opt.label}</span>
              <span className="r-infog-option-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
        {type === "party" && (
          <select className="r-select" style={{ marginBottom: 16 }} value={selectedParty} onChange={e => setSelectedParty(e.target.value)}>
            <option value="">Selecciona un partido...</option>
            {parties.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
        )}
        {generationError && <p style={{ margin: "0 0 12px", color: "#ff8a98", fontSize: 12 }}>{generationError}</p>}
        <div className="r-infog-footer">
          <button className="r-infog-cancel" onClick={onClose} disabled={isGenerating}>Cancelar</button>
          <button className="r-infog-generate" onClick={generate} disabled={isGenerating || (type === "party" && !selectedParty)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={13} />{isGenerating ? "Generando…" : "Generar PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LEADER_MAP ───────────────────────────────────────────────────────────────
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

// ─── Líderes por partido ──────────────────────────────────────────────────────
function LideresDePartidosSection({ partyMeta }: { partyMeta: Record<string, PartyMeta> }) {
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [lideresPreferidos, setLideresPreferidos] = useState<LiderPreferido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"candidatos" | "gobierno">("candidatos");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidatePartyFilter, setCandidatePartyFilter] = useState("ALL");
  const [candidateSort, setCandidateSort] = useState<"votes" | "percentage" | "alphabetical">("votes");
  const [hoveredCandidateId, setHoveredCandidateId] = useState<number | null>(null);
  const [selectedCandidateHistory, setSelectedCandidateHistory] = useState<CandidateVoteHistoryTarget | null>(null);
  const [logoB64, setLogoB64] = useState("");
  const [showGobModal, setShowGobModal] = useState(false);

  useEffect(() => {
    // Intentar cargar logo presidencia desde public
    fetch("/logo-presidencia-blanco.png").then(r => r.blob()).then(blob => {
      const reader = new FileReader();
      reader.onload = () => setLogoB64(reader.result as string);
      reader.readAsDataURL(blob);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: ld } = await supabase
          .from("party_leaders")
          .select(`id, party_key, leader_name, photo_url, is_active, party_configuration!inner(display_name, color, logo_url)`)
          .eq("is_active", true).order("party_key");
        const mapped: PartyLeader[] = (ld || []).map((row: any) => ({
          id: row.id, party_key: row.party_key, leader_name: row.leader_name,
          photo_url: row.photo_url, is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#e8465a",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));
        setLeaders(mapped);
        const { data: pd } = await supabase.from("ranking_lideres_por_partido").select("partido, lider_preferido, total_votos, porcentaje");
        if (pd?.length) {
          const arr: LiderPreferido[] = pd.map((r: any) => {
            const li = mapped.find(l => l.party_key === r.partido && l.leader_name === r.lider_preferido);
            const pi = mapped.find(l => l.party_key === r.partido);
            return {
              partido: r.partido,
              lider_preferido: r.lider_preferido,
              votos: Number(r.total_votos || 0),
              porcentaje: Number(r.porcentaje || 0),
              photo_url: li?.photo_url,
              color: pi?.color,
              display_name: pi?.display_name ?? r.partido,
              logo_url: pi?.logo_url
            };
          });
          setLideresPreferidos(arr);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const byParty = useMemo(() => {
    const m: Record<string, PartyLeader[]> = {};
    leaders.forEach(l => { if (!m[l.party_key]) m[l.party_key] = []; m[l.party_key].push(l); });
    return m;
  }, [leaders]);

  const prefByParty = useMemo(() => {
    const m: Record<string, LiderPreferido[]> = {};
    lideresPreferidos.forEach(l => { if (!m[l.partido]) m[l.partido] = []; m[l.partido].push(l); });
    Object.keys(m).forEach(k => m[k].sort((a, b) => b.votos - a.votos));
    return m;
  }, [lideresPreferidos]);

  const historyComparisonCandidates = useMemo(() => leaders.map((leader) => {
    const preference = (prefByParty[leader.party_key] || []).find((item) => item.lider_preferido === leader.leader_name);
    return { ...leader, votos: preference?.votos ?? 0, porcentaje: preference?.porcentaje ?? 0 };
  }), [leaders, prefByParty]);

  const allLeadersForGov: PartyLeader[] = leaders;

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  const partyKeys = Object.keys(byParty);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Líderes por Partido</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="r-mode-tabs" style={{ marginBottom: 0 }}>
            <button className={`r-mode-tab${subTab === "candidatos" ? " active" : ""}`} onClick={() => setSubTab("candidatos")}>Candidatos</button>
            <button className={`r-mode-tab${subTab === "gobierno" ? " active" : ""}`} onClick={() => setSubTab("gobierno")}>Constructor de Gobierno</button>
          </div>
          {selectedParty && subTab === "candidatos" && (
            <button className="r-subtab-btn" onClick={() => setSelectedParty(null)}>← Ver todos</button>
          )}
        </div>
      </div>

      {/* Sub-tab: Gobierno */}
      {subTab === "gobierno" && (
        <div className="r-section">
          <div className="r-section-title" style={{ marginBottom: 6 }}>🏛️ Constructor de Gobierno</div>
          <p className="r-section-sub">Selecciona un partido, asigna ministros y genera una infografía oficial</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
            {partyKeys.map(pk => {
              const info = byParty[pk][0];
              const pm = partyMeta[pk] || { color: info.color, name: info.display_name, logo: info.logo_url };
              return (
                <button key={pk}
                  className="r-party-card"
                  style={{ borderColor: selectedParty === pk ? pm.color : undefined, background: selectedParty === pk ? `${pm.color}12` : undefined }}
                  onClick={() => { setSelectedParty(pk); setShowGobModal(true); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PartyLogoImg src={pm.logo || info.logo_url} name={pm.name} color={pm.color} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0eff8" }}>{pm.name}</div>
                      <div style={{ fontSize: 10, color: "#7a7990" }}>{byParty[pk].length} candidato{byParty[pk].length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button className="r-infog-generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: 14 }}
              onClick={() => setShowGobModal(true)}>
              <Building2 size={16} />Abrir Constructor de Gobierno
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab: Candidatos */}
      {subTab === "candidatos" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.025)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f0eff8" }}>Buscar candidato</div>
              <div style={{ fontSize: 10, color: "#7a7990", marginTop: 2 }}>Filtra, busca y ordena el listado de candidatos según el criterio que prefieras.</div>
            </div>
            <div style={{ display: "flex", gap: 8, width: "min(680px, 100%)", flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 175px" }}>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Filtrar por partido</span>
                <select value={candidatePartyFilter} onChange={(event) => setCandidatePartyFilter(event.target.value)} style={{ width: "100%", border: "1px solid rgba(255,255,255,.14)", borderRadius: 9, background: "#101019", color: "#f0eff8", padding: "9px 12px", fontSize: 12, outline: "none" }}>
                  <option value="ALL">Todos los partidos</option>
                  {partyKeys.map((partyKey) => <option key={partyKey} value={partyKey}>{partyMeta[partyKey]?.name || byParty[partyKey]?.[0]?.display_name || partyKey}</option>)}
                </select>
              </label>
              <label style={{ flex: "1 1 220px" }}>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Buscar por nombre de candidato</span>
                <input
                  type="search"
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="Buscar por nombre, ej. Abreu"
                  style={{ width: "100%", border: "1px solid rgba(255,255,255,.14)", borderRadius: 9, background: "rgba(10,10,16,.72)", color: "#f0eff8", padding: "9px 12px", fontSize: 12, outline: "none" }}
                />
              </label>
              <label style={{ flex: "1 1 170px" }}>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Ordenar candidatos</span>
                <select value={candidateSort} onChange={(event) => setCandidateSort(event.target.value as "votes" | "percentage" | "alphabetical")} style={{ width: "100%", border: "1px solid rgba(255,255,255,.14)", borderRadius: 9, background: "#101019", color: "#f0eff8", padding: "9px 12px", fontSize: 12, outline: "none" }}>
                  <option value="votes">Ordenar: más votos</option>
                  <option value="percentage">Ordenar: mayor porcentaje</option>
                  <option value="alphabetical">Ordenar: A–Z</option>
                </select>
              </label>
            </div>
          </div>
          {!selectedParty && (
            <div className="r-subtab-bar">
              {partyKeys.map(pk => {
                const info = byParty[pk][0];
                const pm = partyMeta[pk];
                const color = pm?.color || info.color;
                const name = pm?.name || info.display_name;
                const logo = pm?.logo || info.logo_url;
                const tot = (prefByParty[pk] || []).reduce((a, b) => a + b.votos, 0);
                return (
                  <button key={pk} className="r-subtab-btn" onClick={() => setSelectedParty(pk)}
                    style={{ borderColor: `${color}40`, color, background: `${color}0d` }}>
                    {logo && <img src={logo} alt={name} style={{ width: 13, height: 13, objectFit: "contain" }} onError={e => (e.currentTarget.style.display = "none")} />}
                    {name}
                    {tot > 0 && <span style={{ fontSize: 10, opacity: 0.6 }}>· {tot}v</span>}
                  </button>
                );
              })}
            </div>
          )}
          {(selectedParty ? [selectedParty] : partyKeys).filter((partyKey) => candidatePartyFilter === "ALL" || partyKey === candidatePartyFilter).map(partyKey => {
            const partyLeaders = byParty[partyKey] || [];
            const partyPrefs = prefByParty[partyKey] || [];
            const info = partyLeaders[0]; if (!info) return null;
            const pm = partyMeta[partyKey];
            const color = pm?.color || info.color;
            const name = pm?.name || info.display_name;
            const logo = pm?.logo || info.logo_url;
            const tot = partyPrefs.reduce((a, b) => a + b.votos, 0);
            const leadersWithVotes = partyLeaders
              .map(l => {
                const pref = partyPrefs.find(p => p.lider_preferido === l.leader_name);
                return { ...l, votos: pref?.votos ?? 0, porcentaje: pref?.porcentaje ?? 0 };
              })
              .filter(leader => !candidateSearch.trim() || leader.leader_name.toLocaleLowerCase("es").includes(candidateSearch.trim().toLocaleLowerCase("es")))
              .sort((a, b) => {
                if (candidateSort === "alphabetical") return a.leader_name.localeCompare(b.leader_name, "es");
                if (candidateSort === "percentage") {
                  const aPct = tot > 0 ? a.votos / tot : 0;
                  const bPct = tot > 0 ? b.votos / tot : 0;
                  return bPct - aPct || b.votos - a.votos || a.leader_name.localeCompare(b.leader_name, "es");
                }
                return b.votos - a.votos || a.leader_name.localeCompare(b.leader_name, "es");
              });
            const extraPrefs = partyPrefs.filter(p => !partyLeaders.some(l => l.leader_name === p.lider_preferido));
            const chartData = [...leadersWithVotes.filter(l => l.votos > 0).map(l => ({ name: l.leader_name, votos: l.votos, porcentaje: l.porcentaje })), ...extraPrefs.map(e => ({ name: e.lider_preferido, votos: e.votos, porcentaje: e.porcentaje }))].sort((a, b) => b.votos - a.votos).slice(0, 10);

            if (candidateSearch.trim() && leadersWithVotes.length === 0) return null;

            return (
              <div key={partyKey} className="r-section" style={{ borderColor: `${color}25` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <PartyLogoImg src={logo} name={name} color={color} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#7a7990" }}>{partyLeaders.length} candidato{partyLeaders.length !== 1 ? "s" : ""} · {tot > 0 ? `${tot} votos` : "Sin votos aún"}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))", gap: 16, marginBottom: 16 }}>
                  {leadersWithVotes.map(leader => {
                    const isHovered = hoveredCandidateId === leader.id;
                    const percentageOfParty = tot > 0 ? (leader.votos / tot) * 100 : 0;
                    return (
                    <div key={leader.id} style={{ textAlign: "center" }}>
                      <div
                        tabIndex={0}
                        role="button"
                        onClick={() => setSelectedCandidateHistory({ ...leader, votos: leader.votos, porcentaje: leader.porcentaje, comparisonCandidates: historyComparisonCandidates })}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCandidateHistory({ ...leader, votos: leader.votos, porcentaje: leader.porcentaje, comparisonCandidates: historyComparisonCandidates }); } }}
                        onMouseEnter={() => setHoveredCandidateId(leader.id)}
                        onMouseLeave={() => setHoveredCandidateId(null)}
                        onFocus={() => setHoveredCandidateId(leader.id)}
                        onBlur={() => setHoveredCandidateId(null)}
                        aria-label={`${leader.leader_name}: ${leader.votos} votos, ${percentageOfParty.toFixed(1)}% del total del partido`}
                        style={{ position: "relative", width: 82, height: 94, margin: "0 auto 6px", overflow: "visible", borderRadius: 10, outline: "none", cursor: "pointer" }}
                      >
                        <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", border: `2px solid ${color}`, margin: "0 auto", background: `${color}1a`, boxShadow: `0 7px 18px ${color}30` }}>
                          {leader.photo_url ? <img src={leader.photo_url} alt={leader.leader_name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>{leader.leader_name.charAt(0)}</div>}
                        </div>
                        {leader.votos > 0 && <div role="status" aria-label={`${leader.votos} votos para ${leader.leader_name}`} title={`${leader.votos} votos`} style={{ position: "absolute", top: 62, left: "50%", transform: "translateX(-50%)", zIndex: 2, minWidth: 42, background: color, color: "#fff", fontSize: 10, lineHeight: "18px", fontWeight: 900, whiteSpace: "nowrap", padding: "1px 8px", borderRadius: 999, border: "2px solid #17161e", boxShadow: "0 6px 14px rgba(0,0,0,.42)" }}>{leader.votos} voto{leader.votos === 1 ? "" : "s"}</div>}
                        <div role="tooltip" aria-hidden={!isHovered} style={{ position: "absolute", zIndex: 4, bottom: "calc(100% + 7px)", left: "50%", transform: `translateX(-50%) translateY(${isHovered ? "0" : "8px"}) scale(${isHovered ? 1 : .92})`, width: 158, padding: "9px 10px", borderRadius: 11, background: "linear-gradient(145deg, rgba(3,5,11,.98), rgba(15,18,29,.98))", border: `1px solid ${color}`, borderTop: `3px solid ${color}`, boxShadow: `0 16px 30px rgba(0,0,0,.58), 0 0 22px ${color}55`, color: "#f8fafc", textAlign: "center", opacity: isHovered ? 1 : 0, pointerEvents: "none", transition: "opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease" }}>
                          <div style={{ color, fontSize: 20, lineHeight: 1, fontWeight: 900, letterSpacing: "-.03em" }}>{percentageOfParty.toFixed(1)}%</div>
                          <div style={{ marginTop: 4, color: "#e8e9ef", fontSize: 10, fontWeight: 800 }}>del total del partido</div>
                          <div style={{ marginTop: 5, color: "#9ca3af", fontSize: 9, fontWeight: 700 }}>{leader.votos} voto{leader.votos === 1 ? "" : "s"} registrados</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f0eff8", marginBottom: 4, lineHeight: 1.3 }}>{leader.leader_name}</div>
                      {leader.votos > 0 ? (
                        <>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                            <div style={{ height: "100%", width: `${leader.porcentaje}%`, background: color, borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: "#7a7990" }}>{leader.porcentaje.toFixed(1)}%</div>
                        </>
                      ) : <div style={{ fontSize: 10, color: "#5a596a" }}>Sin votos</div>}
                    </div>
                    );
                  })}
                </div>
                {chartData.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f0eff8", marginBottom: 10 }}>Distribución de preferencias</div>
                    <ResponsiveContainer width="100%" height={Math.max(80, chartData.length * 32)}>
                      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 44, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" stroke="rgba(255,255,255,0.15)" fontSize={10} tick={{ fill: "#7a7990" }} />
                        <YAxis type="category" dataKey="name" stroke="transparent" fontSize={10} width={110} tick={{ fill: "#c0bfd8" }} />
                        <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v: any, _: any, p: any) => [`${v} votos (${p.payload.porcentaje?.toFixed(1)}%)`, "Preferencia"]} />
                        <Bar dataKey="votos" radius={[0, 5, 5, 0]} label={{ position: "right", fontSize: 10, fill: "#7a7990", formatter: (v: number) => v > 0 ? v : "" }}>
                          {chartData.map((_, i) => <Cell key={i} fill={color} fillOpacity={Math.max(0.4, 0.9 - i * 0.07)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {extraPrefs.length > 0 && (
                      <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9 }}>
                        <div style={{ fontSize: 10, color: "#5a596a", fontWeight: 700, marginBottom: 6 }}>Otros mencionados:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {extraPrefs.map(ep => (
                            <span key={ep.lider_preferido} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 100, background: `${color}12`, border: `1px solid ${color}35`, color }}>
                              {ep.lider_preferido} · {ep.votos}v
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {showGobModal && (
        <GobiernoModal
          onClose={() => setShowGobModal(false)}
          leaders={allLeadersForGov}
          partyMeta={partyMeta}
          logoPresidenciaB64={logoB64}
          initialParty={selectedParty}
        />
      )}
      {selectedCandidateHistory && <CandidateVoteHistoryModal target={selectedCandidateHistory} onClose={() => setSelectedCandidateHistory(null)} />}
    </div>
  );
}

function CandidateVoteHistoryModal({ target, onClose }: { target: CandidateVoteHistoryTarget; onClose: () => void }) {
  const [history, setHistory] = useState<CandidateVoteHistoryPoint[]>([]);
  const [comparisonId, setComparisonId] = useState("");
  const [comparisonHistory, setComparisonHistory] = useState<CandidateVoteHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const comparisonTarget = useMemo(() => target.comparisonCandidates?.find((candidate) => String(candidate.id) === comparisonId), [target.comparisonCandidates, comparisonId]);

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const partyCandidates = Array.from(new Set([target.party_key, target.display_name].filter(Boolean)));
        const { data, error: queryError } = await supabase
          .from("lideres_preferidos")
          .select("created_at")
          .in("partido", partyCandidates)
          .eq("lider_preferido", target.leader_name)
          .order("created_at", { ascending: true });
        if (queryError) throw queryError;
        const byDay: Record<string, number> = {};
        (data || []).forEach((row: { created_at?: string | null }) => {
          const day = row.created_at?.slice(0, 10);
          if (day) byDay[day] = (byDay[day] || 0) + 1;
        });
        let accumulated = 0;
        const points = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, votosDia]) => {
          accumulated += votosDia;
          return { fecha: date, etiqueta: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), votosDia, acumulado: accumulated };
        });
        if (!cancelled) setHistory(points);
      } catch (historyError) {
        console.error("Error loading candidate vote history:", historyError);
        if (!cancelled) setError("No se pudo cargar el historial temporal de votos de este candidato.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadHistory();
    return () => { cancelled = true; };
  }, [target.party_key, target.display_name, target.leader_name]);

  useEffect(() => {
    if (!comparisonTarget) { setComparisonHistory([]); return; }
    let cancelled = false;
    const loadComparison = async () => {
      try {
        const partyCandidates = Array.from(new Set([comparisonTarget.party_key, comparisonTarget.display_name].filter(Boolean)));
        const { data, error: queryError } = await supabase.from("lideres_preferidos").select("created_at").in("partido", partyCandidates).eq("lider_preferido", comparisonTarget.leader_name).order("created_at", { ascending: true });
        if (queryError) throw queryError;
        const byDay: Record<string, number> = {};
        (data || []).forEach((row: { created_at?: string | null }) => { const day = row.created_at?.slice(0, 10); if (day) byDay[day] = (byDay[day] || 0) + 1; });
        let accumulated = 0;
        const points = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, votosDia]) => ({ fecha: date, etiqueta: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), votosDia, acumulado: accumulated += votosDia }));
        if (!cancelled) setComparisonHistory(points);
      } catch (comparisonError) {
        console.error("Error loading comparison candidate history:", comparisonError);
        if (!cancelled) setComparisonHistory([]);
      }
    };
    loadComparison();
    return () => { cancelled = true; };
  }, [comparisonTarget?.party_key, comparisonTarget?.display_name, comparisonTarget?.leader_name]);

  const chartData = useMemo(() => {
    if (!comparisonTarget) return history;
    const primary = new globalThis.Map(history.map((point) => [point.fecha, point]));
    const secondary = new globalThis.Map(comparisonHistory.map((point) => [point.fecha, point]));
    const dates = Array.from(new Set([...Array.from(primary.keys()), ...Array.from(secondary.keys())])).sort();
    let primaryAccumulated = 0;
    let comparisonAccumulated = 0;
    return dates.map((date) => {
      const primaryPoint = primary.get(date);
      const comparisonPoint = secondary.get(date);
      if (primaryPoint) primaryAccumulated = primaryPoint.acumulado;
      if (comparisonPoint) comparisonAccumulated = comparisonPoint.acumulado;
      return { fecha: date, etiqueta: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), votosDia: primaryPoint?.votosDia ?? 0, acumulado: primaryAccumulated, comparacion: comparisonAccumulated };
    });
  }, [history, comparisonHistory, comparisonTarget]);

  const handleExportHistoryPng = async () => {
    if (!chartRef.current || isExporting || !history.length) return;
    setIsExporting(true);
    try {
      const chartCanvas = await html2canvas(chartRef.current, { backgroundColor: "#11131c", scale: 2, useCORS: true });
      const canvas = document.createElement("canvas");
      const headerHeight = 104;
      canvas.width = chartCanvas.width;
      canvas.height = chartCanvas.height + headerHeight * 2;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo crear el lienzo de exportación.");
      const scale = 2;
      context.fillStyle = "#0b0d14";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = target.color;
      context.fillRect(0, 0, 10 * scale, canvas.height);
      context.fillStyle = "#f8fafc";
      context.font = `800 ${22 * scale}px Arial, sans-serif`;
      context.fillText(`Evolución de votos · ${target.leader_name}`, 28 * scale, 38 * scale);
      context.fillStyle = "#cbd5e1";
      context.font = `600 ${12 * scale}px Arial, sans-serif`;
      context.fillText(`${target.display_name} · ${target.votos.toLocaleString("es-ES")} votos actuales · Generado el ${new Date().toLocaleDateString("es-ES")}`, 28 * scale, 64 * scale);
      context.drawImage(chartCanvas, 0, headerHeight * 2);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("No se pudo convertir el gráfico a PNG.")), "image/png"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `evolucion_votos_${target.leader_name.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (exportError) {
      console.error("Error exporting candidate vote history:", exportError);
      setError("No se pudo exportar la evolución en PNG. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareComparison = async () => {
    const query = new URLSearchParams({ tab: "lideres-partidos", leader: target.leader_name });
    if (comparisonTarget) query.set("comparacion", comparisonTarget.leader_name);
    const url = `${window.location.origin}/resultados?${query.toString()}`;
    const text = comparisonTarget ? `Evolución de votos: ${target.leader_name} frente a ${comparisonTarget.leader_name} · Batalla Cultural.` : `Evolución de votos de ${target.leader_name} · Batalla Cultural.`;
    const canNativeShare = typeof navigator.share === "function";
    try {
      if (canNativeShare) await navigator.share({ title: "Comparativa de líderes · Batalla Cultural", text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      setShareFeedback(canNativeShare ? "Comparativa compartida." : "Enlace copiado al portapapeles.");
    } catch (shareError) {
      if ((shareError as Error)?.name !== "AbortError") setShareFeedback("No se pudo compartir. Copia el enlace desde la barra del navegador.");
    }
    window.setTimeout(() => setShareFeedback(null), 3500);
  };

  return createPortal(
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1300, padding: 18, background: "rgba(3,5,11,.78)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <section role="dialog" aria-modal="true" aria-labelledby="candidate-history-title" onClick={(event) => event.stopPropagation()} style={{ width: "min(680px, 100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 20, border: `1px solid ${target.color}66`, background: "linear-gradient(145deg, #171923, #0b0d14)", boxShadow: "0 28px 90px rgba(0,0,0,.65)", padding: 22, position: "relative" }}>
        <button onClick={onClose} aria-label="Cerrar evolución de votos" style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#f8fafc", cursor: "pointer" }}><X size={17} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 44 }}>
          <div style={{ width: 62, height: 62, overflow: "hidden", borderRadius: "50%", border: `3px solid ${target.color}`, background: `${target.color}26`, flexShrink: 0 }}>
            {target.photo_url ? <img src={target.photo_url} alt={target.leader_name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, background: target.color }}>{target.leader_name.charAt(0)}</div>}
          </div>
          <div>
            <div style={{ color: target.color, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>{target.display_name}</div>
            <h3 id="candidate-history-title" style={{ margin: "3px 0 0", color: "#f8fafc", fontSize: 22, fontWeight: 900 }}>{target.leader_name}</h3>
            <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: 12 }}>Evolución acumulada de votos registrados</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, margin: "20px 0 16px" }}>
          <div style={{ padding: 13, borderRadius: 12, background: `${target.color}16`, border: `1px solid ${target.color}35` }}><div style={{ color: "#9ca3af", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Votos actuales</div><div style={{ color: "#f8fafc", marginTop: 4, fontSize: 24, fontWeight: 900 }}>{target.votos.toLocaleString("es-ES")}</div></div>
          <div style={{ padding: 13, borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}><div style={{ color: "#9ca3af", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Apoyo en su partido</div><div style={{ color: target.color, marginTop: 4, fontSize: 24, fontWeight: 900 }}>{target.porcentaje.toFixed(1)}%</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", margin: "0 0 14px", padding: "9px 11px", borderRadius: 10, background: "rgba(99,102,241,.09)", border: "1px solid rgba(129,140,248,.2)" }}><span style={{ color: "#c7d2fe", fontSize: 11, fontWeight: 700 }}>Comparte esta evolución{comparisonTarget ? ` con ${comparisonTarget.leader_name}` : ""}.</span><button type="button" onClick={handleShareComparison} style={{ border: "1px solid rgba(165,180,252,.45)", borderRadius: 7, padding: "5px 9px", background: "rgba(165,180,252,.12)", color: "#eef2ff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Compartir enlace</button>{shareFeedback && <span role="status" style={{ width: "100%", color: "#a7f3d0", fontSize: 10, fontWeight: 700 }}>{shareFeedback}</span>}</div>
        {(target.comparisonCandidates?.filter((candidate) => candidate.id !== target.id && candidate.votos > 0).length || 0) > 0 && <label style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px", padding: "9px 11px", borderRadius: 10, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)", color: "#cbd5e1", fontSize: 11, fontWeight: 800 }}>Comparar con <select aria-label="Comparar evolución con otro candidato" value={comparisonId} onChange={(event) => setComparisonId(event.target.value)} style={{ flex: 1, minWidth: 0, background: "#11131c", color: "#f8fafc", border: "1px solid rgba(255,255,255,.15)", borderRadius: 7, padding: "6px 8px", fontSize: 11 }}><option value="">Sin comparación</option>{target.comparisonCandidates?.filter((candidate) => candidate.id !== target.id && candidate.votos > 0).sort((a, b) => a.leader_name.localeCompare(b.leader_name, "es")).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.leader_name} · {candidate.display_name}</option>)}</select></label>}
        {loading ? <div style={{ minHeight: 220, display: "grid", placeItems: "center", color: "#9ca3af" }}><Loader2 size={28} className="animate-spin" /></div> : error ? <div role="alert" style={{ padding: 22, borderRadius: 12, color: "#fecaca", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", fontSize: 13 }}>{error}</div> : history.length ? <div ref={chartRef} style={{ borderRadius: 14, padding: "12px 8px 4px", background: "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.01))", border: "1px solid rgba(255,255,255,.07)" }}><div style={{ padding: "0 10px 8px", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}><div><div style={{ fontSize: 12, color: "#f8fafc", fontWeight: 900 }}>Línea temporal de votos</div><div style={{ fontSize: 10, color: comparisonTarget && comparisonHistory.length === 0 ? "#fbbf24" : "#9ca3af", marginTop: 2 }}>{comparisonTarget ? (comparisonHistory.length ? `Comparando con ${comparisonTarget.leader_name}.` : `${comparisonTarget.leader_name} no tiene registros temporales suficientes para trazar su serie.`) : "Acumulado de preferencias registradas por día."}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: target.color, fontSize: 11, fontWeight: 900 }}>{history.length} hitos</span><button onClick={handleExportHistoryPng} disabled={isExporting} style={{ border: `1px solid ${target.color}66`, background: `${target.color}1a`, color: "#f8fafc", borderRadius: 7, padding: "5px 8px", fontSize: 10, fontWeight: 800, cursor: isExporting ? "wait" : "pointer", opacity: isExporting ? .6 : 1 }}>{isExporting ? "Generando…" : "Exportar PNG"}</button></div></div><ResponsiveContainer width="100%" height={286}><ComposedChart data={chartData} margin={{ top: 14, right: 20, bottom: 0, left: -18 }}><defs><linearGradient id={`candidate-votes-${target.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={target.color} stopOpacity={0.45} /><stop offset="100%" stopColor={target.color} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.07)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="etiqueta" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ stroke: target.color, strokeWidth: 1, strokeDasharray: "4 4" }} content={({ active, payload }) => { const point = payload?.[0]?.payload as (CandidateVoteHistoryPoint & { comparacion?: number }) | undefined; return active && point ? <div style={{ background: "#0b0d14", border: `1px solid ${target.color}88`, borderRadius: 9, padding: "9px 10px", color: "#f8fafc", fontSize: 11, boxShadow: "0 12px 28px rgba(0,0,0,.35)" }}><div style={{ color: "#cbd5e1", fontWeight: 800 }}>{new Date(`${point.fecha}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</div><div style={{ marginTop: 5 }}>Votos nuevos: <strong>{point.votosDia.toLocaleString("es-ES")}</strong></div><div style={{ marginTop: 2, color: target.color }}>{target.leader_name}: <strong>{point.acumulado.toLocaleString("es-ES")}</strong></div>{comparisonTarget && <div style={{ marginTop: 2, color: comparisonTarget.color }}>{comparisonTarget.leader_name}: <strong>{(point.comparacion ?? 0).toLocaleString("es-ES")}</strong></div>}</div> : null; }} /><Area type="monotone" dataKey="acumulado" name="Área acumulada" stroke="transparent" fill={`url(#candidate-votes-${target.id})`} /><Line type="monotone" dataKey="acumulado" name={target.leader_name} stroke="#f8fafc" strokeWidth={5} strokeOpacity={0.38} dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="acumulado" name={target.leader_name} stroke={target.color} strokeWidth={3} dot={{ r: 4, fill: target.color, stroke: "#f8fafc", strokeWidth: 2 }} activeDot={{ r: 7, fill: target.color, stroke: "#ffffff", strokeWidth: 2 }} />{comparisonTarget && comparisonHistory.length > 0 && <Line type="monotone" dataKey="comparacion" name={comparisonTarget.leader_name} stroke={comparisonTarget.color || "#fbbf24"} strokeWidth={3} strokeDasharray="7 5" dot={{ r: 3, fill: comparisonTarget.color || "#fbbf24", stroke: "#0b0d14", strokeWidth: 2 }} activeDot={{ r: 6 }} />}</ComposedChart></ResponsiveContainer></div> : <div style={{ padding: 28, textAlign: "center", color: "#9ca3af", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px dashed rgba(255,255,255,.13)", fontSize: 13 }}>Aún no hay registros temporales suficientes para representar la evolución de este candidato.</div>}
      </section>
    </div>,
    document.body,
  );
}

// ─── LeadersByPartyAvg ────────────────────────────────────────────────────────
function LeadersByPartyAvg({ leaderRatings, generalStats, generalPartyMap }: {
  leaderRatings: LeaderRating[];
  generalStats: PartyStats[];
  generalPartyMap: Record<string, PartyMeta>;
}) {
  const [partyAvgs, setPartyAvgs] = useState<{ partyName: string; color: string; logo: string; ratings: { name: string; avg: number }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("respuestas")
          .select("voto_generales, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade")
          .not("voto_generales", "is", null);
        if (!data?.length) { setLoading(false); return; }
        const byP: Record<string, { sums: Record<string, number>; counts: Record<string, number> }> = {};
        const fields = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
        data.forEach((row: any) => {
          const p = row.voto_generales; if (!p) return;
          if (!byP[p]) byP[p] = { sums: {}, counts: {} };
          fields.forEach(f => { if (row[f] != null) { byP[p].sums[f] = (byP[p].sums[f] || 0) + row[f]; byP[p].counts[f] = (byP[p].counts[f] || 0) + 1; } });
        });
        const result = Object.entries(byP).filter(([, d]) => Object.keys(d.sums).length > 0).map(([partyName, d]) => {
          const pm = Object.values(generalPartyMap).find(p => p.name === partyName || p.key === partyName);
          return { partyName, color: pm?.color || "#e8465a", logo: pm?.logo || "", ratings: fields.map(f => ({ name: LEADER_MAP[f]?.name || f, avg: d.counts[f] > 0 ? Math.round((d.sums[f] / d.counts[f]) * 10) / 10 : 0 })).sort((a, b) => b.avg - a.avg) };
        }).sort((a, b) => { const as_ = generalStats.find(s => s.nombre === a.partyName); const bs_ = generalStats.find(s => s.nombre === b.partyName); return (bs_?.votos || 0) - (as_?.votos || 0); }).slice(0, 8);
        setPartyAvgs(result);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch_();
  }, [generalStats, generalPartyMap]);

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  if (!partyAvgs.length) return null;
  const fieldOrder = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
  const shortNames = ["Feijóo", "Sánchez", "Abascal", "Alvise", "Y. Díaz", "I. Montero", "Ayuso", "Buxadé"];

  return (
    <div className="r-section">
      <div className="r-section-title">Media valoraciones por partido</div>
      <p className="r-section-sub">¿Cómo valoran los votantes de cada partido a los líderes?</p>
      <div style={{ overflowX: "auto" }}>
        <table className="r-lxp-table">
          <thead>
            <tr>
              <th style={{ minWidth: 110 }}>Partido</th>
              {shortNames.map(n => <th key={n} style={{ textAlign: "center", minWidth: 60 }}>{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {partyAvgs.map(p => (
              <tr key={p.partyName}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <PartyLogoImg src={p.logo} name={p.partyName} color={p.color} size={18} />
                    <span style={{ fontWeight: 700, color: p.color, fontSize: 11 }}>{p.partyName}</span>
                  </div>
                </td>
                {fieldOrder.map(f => {
                  const r = p.ratings.find(r => r.name === LEADER_MAP[f]?.name);
                  const avg = r?.avg ?? 0;
                  const color = avg >= 7 ? "#22c55e" : avg >= 4 ? "#f59e0b" : avg >= 1 ? "#e8465a" : "#5a596a";
                  return <td key={f} style={{ textAlign: "center" }}><span style={{ fontSize: 13, fontWeight: 700, color }}>{avg > 0 ? avg.toFixed(1) : "—"}</span></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalisisAvanzadoSection({
  coherenciaRows, flujosRows, ideologiaRows, correlacionRows, historicoRows,
}: {
  coherenciaRows: any[]; flujosRows: any[]; ideologiaRows: any[]; correlacionRows: any[]; historicoRows: any[];
}) {
  const sankeyNodes = Array.from(
    new Set(
      flujosRows
        .flatMap((r: any) => [r?.origen, r?.destino])
        .filter((v: any) => typeof v === "string" && v.trim().length > 0)
    )
  );
  const nodeIndex: Record<string, number> = {};
  sankeyNodes.forEach((name, idx) => { nodeIndex[name] = idx; });
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
  const bubbleData = ideologiaRows.map((r: any) => ({ x: Number(r.ideologia_media || 0), y: Number(r.total || 0), z: Number(r.total || 0), partido: r.partido }));
  const radarData = correlacionRows.slice(0, 6).map((r: any) => ({ partido: r.partido, feijoo: r.avg_feijoo || 0, sanchez: r.avg_sanchez || 0, abascal: r.avg_abascal || 0 }));
  const tendenciaActual = historicoRows.slice(-5);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="r-section"><div className="r-section-title">Coherencia de voto</div>
        <div style={{ display: "grid", gap: 8 }}>{coherenciaRows.slice(0, 8).map((r: any) => <div key={r.partido_votado} style={{ fontSize: 12, color: "#c9c8d9" }}>
          {r.partido_votado}: {r.total_votantes} votantes · Incoherencias detectadas → PP valora Sánchez: {r.pp_valora_sanchez || 0}, PSOE valora Feijóo: {r.psoe_valora_feijoo || 0}, VOX valora Sánchez: {r.vox_valora_sanchez || 0}, PSOE valora Abascal: {r.psoe_valora_abascal || 0}.
        </div>)}</div>
      </div>
      <div className="r-section">
        <div className="r-section-title">Sankey: flujo generales → autonómicas</div>
        {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <Sankey data={sankeyData} nodePadding={20} margin={{ left: 20, right: 20, top: 10, bottom: 10 }} link={{ stroke: "#8884d8" }} />
          </ResponsiveContainer>
        ) : (
          <div style={{ fontSize: 12, color: "#7a7990" }}>Sin datos suficientes para flujo de voto.</div>
        )}
      </div>
      <div className="r-section"><div className="r-section-title">Bubble: tamaño votos / posición ideológica</div><ResponsiveContainer width="100%" height={250}><ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis type="number" dataKey="x" name="Ideología" stroke="#7a7990" /><YAxis type="number" dataKey="y" name="Votos" stroke="#7a7990" /><ZAxis dataKey="z" range={[50, 600]} /><Tooltip cursor={{ strokeDasharray: "3 3" }} /><Scatter data={bubbleData} fill="#e8465a" /></ScatterChart></ResponsiveContainer></div>
      <div className="r-section"><div className="r-section-title">Radar líderes (promedio por partido)</div><ResponsiveContainer width="100%" height={260}><RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="partido" /><PolarRadiusAxis angle={30} domain={[0, 10]} /><Radar name="Feijóo" dataKey="feijoo" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} /><Radar name="Sánchez" dataKey="sanchez" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} /><Radar name="Abascal" dataKey="abascal" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} /><Legend /></RadarChart></ResponsiveContainer></div>
      <div className="r-section"><div className="r-section-title">Predicción y tendencia (últimos snapshots)</div><ResponsiveContainer width="100%" height={250}><LineChart data={tendenciaActual}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="snapshot_at" tick={{ fill: "#7a7990", fontSize: 10 }} /><YAxis tick={{ fill: "#7a7990", fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="porcentaje" stroke="#f59e0b" dot={false} /></LineChart></ResponsiveContainer></div>
    </div>
  );
}

// ─── Simulador Electoral ──────────────────────────────────────────────────────
interface SimuladorProps {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, PartyMeta>;
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
}

function SimuladorElectoral({ generalStats, generalPartyMap, votosPorProvincia, provinciaMetricsMap }: SimuladorProps) {
  const [mode, setMode] = useState<"nacional" | "circunscripcion">("nacional");
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [selectedCirc, setSelectedCirc] = useState("");
  const [customParties, setCustomParties] = useState<CustomSimulatorParty[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#7c3aed");
  const [mapView, setMapView] = useState<"schematic" | "realistic">("realistic");
  const [simProvinciaSeleccionada, setSimProvinciaSeleccionada] = useState<string | null>(null);
  const [simVotosProvincia, setSimVotosProvincia] = useState<Record<string, number>>({});
  const [simEscanosProvincia, setSimEscanosProvincia] = useState<Record<string, number>>({});
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
        } catch { /* ignore */ }
      }
      const base: Record<string, number> = {};
      generalStats.forEach(p => { base[p.id] = p.votos; });
      setSimulatorVotes(base);
      const provBase: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; });
      setProvinciaVotes(provBase);
      setInitialized(true);
    }
  }, [generalStats, votosPorProvincia, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify({ simulatorVotes, provinciaVotes, customParties }));
  }, [initialized, simulatorVotes, provinciaVotes, customParties]);

  const simulatorPartyMap = useMemo(() => {
    const m = { ...generalPartyMap };
    customParties.forEach(p => { m[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" }; });
    return m;
  }, [generalPartyMap, customParties]);

  const simulatorPartyIndex = useMemo(
    () => createCanonicalPartyIndex(
      Object.values(simulatorPartyMap).map((party) => ({
        party_key: party.key,
        display_name: party.name,
        color: party.color,
        logo_url: party.logo,
      })) as CanonicalPartyConfigRow[],
    ),
    [simulatorPartyMap],
  );

  useEffect(() => {
    if (!Object.keys(votosPorProvincia).length) return;
    setProvinciaVotes(prev => {
      if (Object.keys(prev).length) return prev;
      const seeded: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, votes]) => {
        seeded[prov] = { ...votes };
      });
      return seeded;
    });
  }, [votosPorProvincia]);

  const effectiveVotesByProvince = useMemo(() => {
    if (!Object.keys(votosPorProvincia).length) return {};
    const totalNac = Object.values(simulatorVotes).reduce((a, v) => a + Math.max(0, v || 0), 0);
    if (totalNac === 0) {
      if (Object.keys(provinciaVotes).length) return { ...provinciaVotes };
      return {};
    }
    const shares = Object.entries(simulatorVotes).reduce<Record<string, number>>((acc, [p, v]) => { acc[p] = Math.max(0, v || 0) / totalNac; return acc; }, {});
    const result: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, realVotes]) => {
      if (provinciaVotes[prov]) { result[prov] = { ...provinciaVotes[prov] }; }
      else { const tot = Object.values(realVotes).reduce((a, v) => a + v, 0); const sim: Record<string, number> = {}; Object.entries(shares).forEach(([p, share]) => { sim[p] = Math.round(tot * share); }); result[prov] = sim; }
    });
    return result;
  }, [votosPorProvincia, simulatorVotes, provinciaVotes]);

  const simulatorEscanosByProvince = useMemo(() => {
    if (!Object.keys(effectiveVotesByProvince).length) return {};
    return calcularEscanosGeneralesPorProvincia(effectiveVotesByProvince);
  }, [effectiveVotesByProvince]);

  const simulatorStats = useMemo(() => {
    const escanos: Record<string, number> = {};
    Object.values(simulatorEscanosByProvince).forEach(pe => { Object.entries(pe).forEach(([p, e]) => { escanos[p] = (escanos[p] || 0) + e; }); });
    const nv: Record<string, number> = {};
    Object.values(effectiveVotesByProvince).forEach((provVotes) => {
      Object.entries(provVotes).forEach(([k, v]) => {
        nv[k] = (nv[k] || 0) + Math.max(0, Math.floor(v || 0));
      });
    });
    if (!Object.keys(nv).length) {
      Object.entries(simulatorVotes).forEach(([k, v]) => { nv[k] = Math.max(0, Math.floor(v || 0)); });
    }
    const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
    return obtenerEstadisticas(nv, escanos, nombres, logos).map(s => ({ ...s, color: simulatorPartyMap[s.id]?.color || "#e8465a" }));
  }, [simulatorEscanosByProvince, simulatorVotes, simulatorPartyMap, effectiveVotesByProvince]);

  const addCustomParty = () => {
    const name = newPartyName.trim(); if (!name) return;
    const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase() + "_" + Date.now();
    setCustomParties(prev => [...prev, { key, name, color: newPartyColor }]);
    setSimulatorVotes(prev => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };
  const removeCustomParty = (key: string) => {
    setCustomParties(prev => prev.filter(p => p.key !== key));
    setSimulatorVotes(prev => { const n = { ...prev }; delete n[key]; return n; });
  };
  const resetToOriginal = () => {
    const base: Record<string, number> = {};
    generalStats.forEach(p => { base[p.id] = p.votos; });
    setSimulatorVotes(base);
    const provBase: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; });
    setProvinciaVotes(provBase);
    setCustomParties([]);
  };

  const totalSimVotes = Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const totalEscanos = simulatorStats.reduce((a, s) => a + s.escanos, 0);
  const mayoriaAbs = Math.floor(totalEscanos / 2) + 1;
  const availableCircs = Object.keys(votosPorProvincia).sort();
  const circVotos = selectedCirc ? (provinciaVotes[selectedCirc] || {}) : {};
  const circTotal = Object.values(circVotos).reduce((a, b) => a + Math.max(0, b || 0), 0);

  const updateSimVote = useCallback((key: string, val: number) => {
    setSimulatorVotes(prev => ({ ...prev, [key]: Math.max(0, val) }));
  }, []);

  const updateProvVote = useCallback((prov: string, key: string, val: number) => {
    setProvinciaVotes(prev => ({ ...prev, [prov]: { ...(prev[prov] || {}), [key]: Math.max(0, val) } }));
  }, []);

  useEffect(() => {
    if (!Object.keys(provinciaVotes).length) return;
    const totals: Record<string, number> = {};
    Object.values(provinciaVotes).forEach((pv) => {
      Object.entries(pv).forEach(([partyKey, votes]) => {
        totals[partyKey] = (totals[partyKey] || 0) + Math.max(0, Number(votes || 0));
      });
    });
    if (Object.keys(totals).length) setSimulatorVotes(prev => ({ ...prev, ...totals }));
  }, [provinciaVotes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="r-sim-wrap">
        <div className="r-sim-header">
          <div>
            <p className="r-sim-title">Simulador Electoral</p>
            <p className="r-sim-sub">Modifica votos y observa el reparto de escaños</p>
          </div>
          <button onClick={resetToOriginal} className="r-hbtn r-hbtn-outline">
            <RefreshCw size={12} />Restaurar
          </button>
        </div>
        <div className="r-sim-body">
          <div className="r-mode-tabs">
            {(["nacional", "circunscripcion"] as const).map(m => (
              <button key={m} className={`r-mode-tab${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>
                {m === "nacional" ? "Nacional" : "Por Circunscripción"}
              </button>
            ))}
          </div>

          {mode === "nacional" && (
            <>
              <div className="r-sim-total">
                <span>Total votos:</span>
                <strong>{totalSimVotes.toLocaleString("es-ES")}</strong>
              </div>
              <div className="r-sim-party-grid">
                {Object.entries(simulatorPartyMap).map(([partyKey, party]) => {
                  const votes = simulatorVotes[partyKey] ?? 0;
                  const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                  const isCustom = customParties.some(cp => cp.key === partyKey);
                  return (
                    <div key={partyKey} className="r-sim-party-row" style={{ borderStyle: isCustom ? "dashed" : "solid" }}>
                      <PartyLogoImg src={party.logo} name={party.name} color={party.color} size={20} />
                      <span className="r-sim-party-name">{party.name}</span>
                      <span className="r-sim-pct">{pct}%</span>
                      <input type="number" min={0} value={votes} className="r-sim-input"
                        onChange={e => updateSimVote(partyKey, Number(e.target.value))} />
                      {isCustom && <button className="r-trash-btn" onClick={() => removeCustomParty(partyKey)}><Trash2 size={12} /></button>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {mode === "circunscripcion" && (
            <>
              <select className="r-select" style={{ maxWidth: 280, marginBottom: 12 }} value={selectedCirc} onChange={e => setSelectedCirc(e.target.value)}>
                <option value="">— Selecciona una provincia —</option>
                {availableCircs.map(prov => <option key={prov} value={prov}>{prov}</option>)}
              </select>
              {selectedCirc ? (
                <>
                  <div className="r-circ-info">
                    Editando <strong style={{ margin: "0 4px" }}>{selectedCirc}</strong> · {circTotal.toLocaleString()} votos
                  </div>
                  <div className="r-sim-party-grid">
                    {Object.entries(simulatorPartyMap).map(([partyKey, party]) => {
                      const votes = provinciaVotes[selectedCirc]?.[partyKey] ?? 0;
                      const pct = circTotal > 0 ? ((votes / circTotal) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={partyKey} className="r-sim-party-row">
                          <PartyLogoImg src={party.logo} name={party.name} color={party.color} size={18} />
                          <span className="r-sim-party-name">{party.name}</span>
                          <span className="r-sim-pct">{pct}%</span>
                          <input type="number" min={0} value={votes} className="r-sim-input"
                            onChange={e => updateProvVote(selectedCirc, partyKey, Number(e.target.value))} />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="r-empty-circ">
                  <MapPin size={32} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
                  <p style={{ fontSize: 12 }}>Selecciona una provincia para editar</p>
                </div>
              )}
            </>
          )}

          <div className="r-sim-add">
            <div className="r-sim-add-title"><Plus size={11} />Añadir partido personalizado</div>
            <div className="r-sim-add-row">
              <input type="text" value={newPartyName} onChange={e => setNewPartyName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomParty()} placeholder="Nombre del partido" className="r-sim-add-input" />
              <input type="color" value={newPartyColor} onChange={e => setNewPartyColor(e.target.value)} style={{ height: 36, width: 40, borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", background: "none", cursor: "pointer" }} />
              <button onClick={addCustomParty} className="r-sim-add-btn"><Plus size={12} />Añadir</button>
            </div>
          </div>
        </div>
      </div>

      <div className="r-section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
          <div className="r-section-title">Escaños simulados</div>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>Mayoría absoluta: <strong>{mayoriaAbs}</strong></span>
        </div>
        <p className="r-section-sub">Reparto proporcional mediante Ley d'Hondt</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...simulatorStats].sort((a, b) => b.escanos - a.escanos).filter(s => s.escanos > 0 || s.votos > 0).map(party => (
            <div key={party.id} className="r-sim-row">
              <div className="r-sim-dot" style={{ background: party.color }} />
              <span className="r-sim-row-name">{party.nombre}</span>
              <div className="r-sim-row-bar">
                <div className="r-sim-row-fill" style={{ background: party.color, width: `${(party.escanos / 350) * 100}%` }} />
                <div className="r-sim-row-majority" style={{ left: `${(mayoriaAbs / 350) * 100}%` }} />
              </div>
              <span className="r-sim-row-seats" style={{ color: party.color }}>{party.escanos}</span>
              <span className="r-sim-row-pct">{party.porcentaje.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="r-section">
        <div className="r-section-title">Pactómetro Simulado</div>
        <p className="r-section-sub">Selecciona partidos para ver si alcanzan la mayoría absoluta</p>
        <PactometerInteractive stats={simulatorStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
      </div>

      <div className="r-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div className="r-section-title">Mapa Provincial Simulado</div>
          <div className="r-map-toggle">
            {(["schematic", "realistic"] as const).map(v => (
              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                {v === "schematic" ? <><Grid3x3 size={11} />Esquemática</> : <><Map size={11} />Realista</>}
              </button>
            ))}
          </div>
        </div>
        {mapView === "schematic"
          ? <SpainMapProvincial votosPorProvincia={effectiveVotesByProvince} isYouthAssociations={false} partyIndex={simulatorPartyIndex} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />
          : <SpainMapRealistic votosPorProvincia={effectiveVotesByProvince} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyIndex={simulatorPartyIndex} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />}
      </div>

      <div className="r-section">
        <div className="r-section-title" style={{ marginBottom: 14 }}>Hemiciclo Simulado</div>
        <CongressHemicycle escanos={simulatorEscanosByProvince} totalEscanos={350} provinciaSeleccionada={simProvinciaSeleccionada} votosProvincia={simVotosProvincia} escanosProvincia={simEscanosProvincia} partyMeta={simulatorPartyMap} />
      </div>
    </div>
  );
}

// ─── Generador de Infografía PNG profesional ──────────────────────────────────
async function generarInfografiaPNG(
  stats: PartyStats[],
  totalResponses: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null,
  type: "general" | "party" | "leaders",
  partyName?: string,
  topLeaders?: Array<{ name: string; party: string; votes: number; average?: number; color: string }>,
  topLiderPorPartido?: Array<{ partido: string; lider: string; votos: number; porcentaje: number }>,
  topRegionPorPartido?: Array<{ partido: string; region: string; votos: number }>,
  top5LideresPorPartido?: Record<string, Array<{ nombre: string; votos: number; porcentaje: number; photo_url?: string }>>,
  preguntasVariasPorPartido?: Record<string, { division_territorial?: string; monarquia_republica?: string; sistema_pensiones?: string }>,
  partyLogos?: Record<string, string>
) {
  if (!stats.length) {
    throw new Error("No hay resultados disponibles para generar la infografía.");
  }
  const loadImage = (src?: string) => new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d")!;

  // BG
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
  bgGrad.addColorStop(0, "#0a0a1a");
  bgGrad.addColorStop(1, "#12121f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 800);

  // Franja roja izquierda
  const redGrad = ctx.createLinearGradient(0, 0, 0, 800);
  redGrad.addColorStop(0, "#C41E3A");
  redGrad.addColorStop(1, "#8B0000");
  ctx.fillStyle = redGrad;
  ctx.fillRect(0, 0, 8, 800);

  // Header
  ctx.fillStyle = "#C41E3A";
  ctx.font = "bold 13px monospace";
  ctx.fillText("LA ENCUESTA DE BATALLA CULTURAL", 40, 38);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(40, 48, 1120, 1);

  // Título principal
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Georgia, serif";
  const title = type === "general" ? "Resultados de la Encuesta" : type === "party" ? `Análisis: ${partyName}` : "Top 5 de Líderes";
  ctx.fillText(title, 40, 100);
  if (type === "party" && partyName) {
    const logo = await loadImage((partyLogos || {})[partyName]);
    if (logo) ctx.drawImage(logo, 1085, 28, 72, 72);
  }

  // Stats principales
  const statBoxes = [
    { label: "RESPUESTAS", value: totalResponses.toLocaleString("es-ES"), color: "#C41E3A" },
    { label: "EDAD MEDIA", value: edadPromedio ? `${edadPromedio.toFixed(1)} años` : "—", color: "#3B82F6" },
    { label: "IDEOLOGÍA", value: ideologiaPromedio ? `${ideologiaPromedio.toFixed(1)}/10` : "—", color: "#8B5CF6" },
  ];
  statBoxes.forEach((sb, i) => {
    const x = 40 + i * 280;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(x, 120, 260, 80, 10); ctx.fill();
    ctx.strokeStyle = sb.color + "40"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = sb.color; ctx.font = "bold 11px monospace";
    ctx.fillText(sb.label, x + 16, 148);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(sb.value, x + 16, 182);
  });

  // Barras partidos
  if (type === "general") {
    const topParties = [...stats].sort((a, b) => b.votos - a.votos).slice(0, 10);
    const maxVotos = Math.max(...topParties.map(p => p.votos), 1);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(40, 230, 720, 520, 12); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "bold 11px monospace"; ctx.fillText("DISTRIBUCIÓN DE VOTO", 60, 262);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(60, 270, 680, 1);
    topParties.forEach((party, i) => {
      const y = 288 + i * 44;
      const barW = Math.max(4, (party.votos / maxVotos) * 580);
      const color = normalizeInfographicColor(party.color);
      // Bar
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(60, y + 10, 580, 22, 4); ctx.fill();
      const barGrad = ctx.createLinearGradient(60, 0, 640, 0);
      barGrad.addColorStop(0, color);
      barGrad.addColorStop(1, withInfographicAlpha(color));
      ctx.fillStyle = barGrad;
      ctx.beginPath(); ctx.roundRect(60, y + 10, barW, 22, 4); ctx.fill();
      // Party name
      ctx.fillStyle = "#f0eff8"; ctx.font = "bold 12px 'DM Sans', sans-serif";
      ctx.fillText(party.nombre.slice(0, 18), 60, y + 8);
      // Percentage
      ctx.fillStyle = color; ctx.font = "bold 11px monospace";
      ctx.fillText(`${party.porcentaje.toFixed(1)}%`, 650, y + 25);
      // Seats
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
      ctx.fillText(`${party.escanos} esc.`, 700, y + 25);
    });
    const topLeaderRows = (topLiderPorPartido || []).slice(0, 5);
    const topRegionRows = (topRegionPorPartido || []).slice(0, 5);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(780, 230, 380, 250, 12); ctx.fill();
    ctx.fillStyle = "#C41E3A"; ctx.font = "bold 12px monospace"; ctx.fillText("TOP 1 LÍDER POR PARTIDO", 800, 256);
    topLeaderRows.forEach((row, i) => {
      const y = 290 + i * 34;
      ctx.fillStyle = "#f0eff8"; ctx.font = "bold 11px 'DM Sans', sans-serif"; ctx.fillText(row.partido, 800, y);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "11px 'DM Sans', sans-serif"; ctx.fillText(row.lider, 870, y);
      ctx.fillStyle = "#7a7990"; ctx.font = "10px monospace"; ctx.fillText(`${row.porcentaje.toFixed(1)}%`, 1110, y);
    });
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(780, 500, 380, 250, 12); ctx.fill();
    ctx.fillStyle = "#3b82f6"; ctx.font = "bold 12px monospace"; ctx.fillText("REGIÓN TOP POR PARTIDO", 800, 526);
    topRegionRows.forEach((row, i) => {
      const y = 560 + i * 34;
      ctx.fillStyle = "#f0eff8"; ctx.font = "bold 11px 'DM Sans', sans-serif"; ctx.fillText(row.partido, 800, y);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "11px 'DM Sans', sans-serif"; ctx.fillText(row.region, 870, y);
      ctx.fillStyle = "#7a7990"; ctx.font = "10px monospace"; ctx.fillText(String(row.votos), 1110, y);
    });
  } else if (type === "leaders") {
    const ranking = [...(topLeaders || [])].sort((a, b) => (b.average || 0) - (a.average || 0)).slice(0, 5);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(40, 230, 1120, 500, 14); ctx.fill();
    ctx.fillStyle = "#34d399"; ctx.font = "bold 13px monospace"; ctx.fillText("RANKING DE VALORACIÓN · ESCALA 1–10", 70, 270);
    ranking.forEach((leader, index) => {
      const y = 315 + index * 76;
      const color = normalizeInfographicColor(leader.color || "#34d399");
      ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.roundRect(70, y, 1060, 56, 10); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(102, y + 28, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#08111a"; ctx.font = "bold 15px monospace"; ctx.textAlign = "center"; ctx.fillText(String(index + 1), 102, y + 34); ctx.textAlign = "left";
      ctx.fillStyle = "#f8fafc"; ctx.font = "bold 17px 'DM Sans', sans-serif"; ctx.fillText(leader.name, 140, y + 25);
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = "11px 'DM Sans', sans-serif"; ctx.fillText(leader.party || "Sin adscripción", 140, y + 43);
      ctx.fillStyle = "rgba(255,255,255,.09)"; ctx.beginPath(); ctx.roundRect(410, y + 20, 460, 16, 8); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(410, y + 20, Math.max(4, Math.min(460, ((leader.average || 0) / 10) * 460)), 16, 8); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px Georgia, serif"; ctx.fillText(`${(leader.average || 0).toFixed(2)}/10`, 910, y + 33);
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.font = "11px monospace"; ctx.fillText(`${leader.votes.toLocaleString("es-ES")} valoraciones`, 910, y + 49);
    });
    if (!ranking.length) {
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "16px 'DM Sans', sans-serif"; ctx.fillText("Aún no hay valoraciones suficientes para formar el Top 5.", 70, 330);
    }
  } else if (type === "party" && partyName) {
    const party = stats.find(s => s.nombre === partyName);
    if (party) {
      const partyColor = normalizeInfographicColor(party.color);
      // Sección izquierda: Resultados principales
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(40, 230, 350, 520, 12); ctx.fill();
      ctx.fillStyle = partyColor;
      ctx.font = "bold 48px Georgia, serif"; ctx.fillText(party.porcentaje.toFixed(1) + "%", 60, 310);
      ctx.fillStyle = "#fff"; ctx.font = "14px 'DM Sans', sans-serif";
      ctx.fillText(`${party.votos.toLocaleString("es-ES")} votos`, 60, 345);
      ctx.fillStyle = partyColor; ctx.font = "bold 56px Georgia, serif";
      ctx.fillText(String(party.escanos), 60, 430);
      ctx.fillStyle = "#7a7990"; ctx.font = "14px 'DM Sans', sans-serif";
      ctx.fillText("escaños", 60, 460);
      
      const top5 = (top5LideresPorPartido?.[partyName] || []).slice(0, 5);
      const preguntas = preguntasVariasPorPartido?.[partyName] || {};
      // Sección derecha: TOP 5 líderes
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(410, 230, 350, 520, 12); ctx.fill();
      ctx.fillStyle = partyColor; ctx.font = "bold 14px monospace"; ctx.fillText("TOP 5 LÍDERES", 430, 260);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(430, 268, 310, 1);
      for (let i = 0; i < 5; i++) {
        const y = 295 + i * 38;
        const row = top5[i];
        const initial = (row?.nombre || "—").charAt(0).toUpperCase();
        const leaderImg = await loadImage(row?.photo_url);
        if (leaderImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(442, y - 5, 12, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(leaderImg, 430, y - 17, 24, 24);
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath(); ctx.arc(442, y - 5, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 10px 'DM Sans', sans-serif"; ctx.fillText(initial, 438, y - 1);
        }
        ctx.fillStyle = "#f0eff8"; ctx.font = "bold 11px 'DM Sans', sans-serif";
        ctx.fillText(`${i + 1}. ${row?.nombre || "Sin dato"}`, 460, y);
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
        ctx.fillText(`${row ? row.porcentaje.toFixed(1) : "0.0"}%`, 685, y);
      }
      
      // Sección inferior: Preguntas Varias
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(780, 230, 380, 520, 12); ctx.fill();
      ctx.fillStyle = partyColor; ctx.font = "bold 14px monospace"; ctx.fillText("PREGUNTAS VARIAS", 800, 260);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(800, 268, 340, 1);
      const preguntasRows = [
        { q: "División territorial", a: preguntas.division_territorial || "—" },
        { q: "Monarquía/República", a: preguntas.monarquia_republica || "—" },
        { q: "Sistema pensiones", a: preguntas.sistema_pensiones || "—" }
      ];
      preguntasRows.forEach((p, i) => {
        const y = 310 + i * 72;
        ctx.fillStyle = "#f0eff8"; ctx.font = "bold 11px 'DM Sans', sans-serif";
        ctx.fillText(p.q, 800, y);
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "10px 'DM Sans', sans-serif";
        ctx.fillText(String(p.a).slice(0, 28), 800, y + 24);
      });
    }
  }

  // Hemiciclo visual simplificado
  // Hemiciclo visual simplificado (para infografía general)
  if (type === "general") {
    const hx = 1020, hy = 218, hr = 120;
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath(); ctx.arc(hx, hy, hr + 20, Math.PI, 0); ctx.fill();
    const sortedBySeats = [...stats].sort((a, b) => b.escanos - a.escanos).filter(s => s.escanos > 0);
    const totalSeats = sortedBySeats.reduce((a, s) => a + s.escanos, 0) || 350;
    let angle = Math.PI;
    sortedBySeats.forEach(party => {
      const span = (party.escanos / totalSeats) * Math.PI;
      ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, hr, angle, angle + span);
      ctx.closePath(); ctx.fillStyle = party.color || "#e8465a"; ctx.fill();
      angle += span;
    });
    ctx.fillStyle = "#0a0a1a"; ctx.beginPath(); ctx.arc(hx, hy, hr * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 26px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("350", hx, hy - 10);
    ctx.fillStyle = "#7a7990"; ctx.font = "12px monospace";
    ctx.fillText("ESCAÑOS", hx, hy + 14);
    ctx.textAlign = "left";
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(0, 762, 1200, 1);
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "11px monospace";
  ctx.fillText(`Datos: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })} · La Encuesta de Batalla Cultural`, 40, 785);
  ctx.fillText(`encuestadebc.es`, 1060, 785);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("No se pudo convertir la infografía a PNG."));
    }, "image/png");
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `infografia-encuesta-bc-${type === "party" && partyName ? partyName.toLowerCase().replace(/[^a-z0-9]+/gi, "-") : "general"}-${Date.now()}.png`;
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Results() {
  usePartySync();
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "general";
    return new URLSearchParams(window.location.search).get("tab") === "lideres-partidos"
      ? "lideres-partidos"
      : "general";
  });
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
  const [sortBy, setSortBy] = useState<"votos" | "escanos" | "barometro" | "media">("votos");
  const [mapView, setMapView] = useState<"schematic" | "realistic">("realistic");
  const [votosPorProvinciaJuveniles, setVotosPorProvinciaJuveniles] = useState<Record<string, Record<string, number>>>({});
  const [escanosJuvenilesPorProvincia, setEscanosJuvenilesPorProvincia] = useState<Record<string, number>>({});
  const [provinciaSeleccionadaJuveniles, setProvinciaSeleccionadaJuveniles] = useState<string | null>(null);
  const [votosPorPartidoProvinciaJuveniles, setVotosPorPartidoProvinciaJuveniles] = useState<Record<string, number>>({});
  const [escanosProvinciaJuveniles, setEscanosProvinciaJuveniles] = useState<Record<string, number>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [showInfografiaModal, setShowInfografiaModal] = useState(false);
  const [showTransferenciaModal, setShowTransferenciaModal] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("transferencia") === "1"
  );
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  const [canonicalPartyRows, setCanonicalPartyRows] = useState<CanonicalPartyConfigRow[]>([]);
  const [edadMediaPorPartido, setEdadMediaPorPartido] = useState<Record<string, number>>({});
  const [leadersSubTab, setLeadersSubTab] = useState<"individual" | "porpartido">("individual");
  const [coherenciaRows, setCoherenciaRows] = useState<any[]>([]);
  const [flujosRows, setFlujosRows] = useState<any[]>([]);
  const [ideologiaRows, setIdeologiaRows] = useState<any[]>([]);
  const [correlacionRows, setCorrelacionRows] = useState<any[]>([]);
  const [historicoRows, setHistoricoRows] = useState<any[]>([]);
  const [historicoElecciones, setHistoricoElecciones] = useState<HistoricoEleccion[]>([]);
  const [nocheElectoralRows, setNocheElectoralRows] = useState<NocheElectoralRow[]>([]);
  const [leaderPhotoByName, setLeaderPhotoByName] = useState<Record<string, string>>({});
  const [barometroBC, setBarometroBC] = useState<Record<string, number>>({});
  const [mediaEncuestas, setMediaEncuestas] = useState<Record<string, number>>({});
  const [liderPorPartido, setLiderPorPartido] = useState<Record<string, string>>({});
  const [porcentajeLiderPorPartido, setPorcentajeLiderPorPartido] = useState<Record<string, number>>({});

  useEffect(() => { document.title = "La Encuesta de BC"; }, []);

  const normalizePartyKey = (v: string) => normalizePartyReference(v);

  const generalPartyMap = useMemo((): Record<string, PartyMeta> => {
    const d: Record<string, PartyMeta> = {};
    partyConfigData.parties.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: sanitizePartyColor(p.color), logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

  const youthPartyMap = useMemo((): Record<string, PartyMeta> => {
    const d: Record<string, PartyMeta> = {};
    partyConfigData.youth.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: sanitizePartyColor(p.color), logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

  const canonicalPartyIndex = useMemo(
    () => createCanonicalPartyIndex(canonicalPartyRows),
    [canonicalPartyRows],
  );

  const resolvePartyKey = (value: string, metaMap: Record<string, PartyMeta>) => {
    if (metaMap[value]) return value;
    const n = normalizePartyKey(value);
    return Object.keys(metaMap).find(k => normalizePartyKey(k) === n) ||
      Object.entries(metaMap).find(([, p]) => normalizePartyKey(String(p?.name || "")) === n)?.[0] ||
      value;
  };

  const buildLookup = (map: Record<string, PartyMeta>): Record<string, PartyMeta> => {
    const lookup: Record<string, PartyMeta> = {};
    Object.entries(map).forEach(([k, p]) => {
      [k, p.key, p.name, normalizePartyKey(k), normalizePartyKey(p.key), normalizePartyKey(p.name)].forEach(a => {
        if (a) lookup[String(a)] = p;
      });
    });
    return lookup;
  };

  const generalPartyMetaLookup = useMemo(() => buildLookup(generalPartyMap), [generalPartyMap]);
  const youthPartyMetaLookup = useMemo(() => buildLookup(youthPartyMap), [youthPartyMap]);

  useEffect(() => {
    if (Object.keys(votosPorProvincia).length > 0 && generalStats.length > 0) {
      const e = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      setEscanosGeneralesPorProvincia(e);
      setGeneralStats(prev => prev.map(s => ({ ...s, escanos: e[s.id] || 0 })));
    }
  }, [votosPorProvincia]);

  useEffect(() => {
    if (Object.keys(votosPorProvinciaJuveniles).length > 0 && youthStats.length > 0) {
      const e = calcularEscanosJuvenilesPorProvincia(votosPorProvinciaJuveniles);
      setEscanosJuvenilesPorProvincia(e);
      setYouthStats(prev => prev.map(s => ({ ...s, escanos: e[s.id] || 0 })));
    }
  }, [votosPorProvinciaJuveniles]);

  useEffect(() => {
    const loadPartyConfig = async () => {
      const [partyConfigResult, leadersResult] = await Promise.all([
        supabase.from("party_configuration").select("party_key, display_name, color, logo_url, party_type, is_active").eq("is_active", true),
        supabase.from("party_leaders").select("party_key, leader_name, photo_url, is_active").eq("is_active", true),
      ]);
      const all = (partyConfigResult.data || []) as CanonicalPartyConfigRow[];
      setCanonicalPartyRows(all);
      setRuntimePartyConfig(all.map((r: any) => ({ key: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url, partyType: r.party_type })));
      setPartyConfigData({
        parties: all.filter((r: any) => r.party_type === "general").map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })),
        youth: all.filter((r: any) => ["youth", "asociacion_juvenil", "juvenile"].includes(r.party_type)).map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url }))
      });
      const leaderPhotoIndex: Record<string, string> = {};
      (leadersResult.data || []).forEach((leader: any) => {
        const partyKey = normalizePartyReference(leader.party_key);
        const leaderName = normalizePartyReference(leader.leader_name);
        const photoUrl = String(leader.photo_url || "").trim();
        if (!leaderName || !photoUrl) return;
        if (partyKey) leaderPhotoIndex[`${partyKey}::${leaderName}`] = photoUrl;
        if (!leaderPhotoIndex[leaderName]) leaderPhotoIndex[leaderName] = photoUrl;
      });
      setLeaderPhotoByName(leaderPhotoIndex);
    };
    loadPartyConfig();
    const ch = supabase.channel("party-and-leaders-results")
      .on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, loadPartyConfig)
      .on("postgres_changes", { event: "*", schema: "public", table: "party_leaders" }, loadPartyConfig)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        try { const { data } = await supabase.from("total_respuestas_view").select("total_respuestas"); setTotalResponses(data?.[0]?.total_respuestas || 0); }
        catch { const { count } = await supabase.from("respuestas").select("*", { count: "exact", head: true }); setTotalResponses(count || 0); }

        try {
          const { data: gd } = await supabase.from("votos_generales_totales").select("*");
          if (gd?.length) {
            const gv: Record<string, number> = {};
            Object.keys(generalPartyMap).forEach(k => { gv[k] = 0; });
            gd.forEach((r: any) => { gv[resolvePartyKey(String(r.partido_id || ""), generalPartyMap)] = r.votos; });
            const escanos = Object.keys(votosPorProvincia).length > 0 ? calcularEscanosGeneralesPorProvincia(votosPorProvincia) : calcularEscanosGenerales(gv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setGeneralStats(obtenerEstadisticas(gv, escanos, nombres, logos).map(s => ({ ...s, color: generalPartyMap[resolvePartyKey(s.id, generalPartyMap)]?.color })));

            try {
              const { data: pd } = await supabase.from("votos_por_provincia_view").select("provincia, partido, votos");
              if (pd?.length) {
                const vp: Record<string, Record<string, number>> = {};
                pd.forEach((r: any) => { if (r.provincia && r.partido) { if (!vp[r.provincia]) vp[r.provincia] = {}; vp[r.provincia][resolvePartyKey(String(r.partido), generalPartyMap)] = r.votos; } });
                setVotosPorProvincia(vp);
                try {
                  const { data: md } = await supabase.from("respuestas").select("provincia, edad, posicion_ideologica, voto_generales").limit(2500);
                  if (md) {
                    const pc: Record<string, { es: number; is: number; c: number }> = {};
                    const pp: Record<string, { sum: number; count: number }> = {};
                    md.forEach((r: any) => {
                      if (r.provincia) { if (!pc[r.provincia]) pc[r.provincia] = { es: 0, is: 0, c: 0 }; if (r.edad != null) pc[r.provincia].es += r.edad; if (r.posicion_ideologica != null) pc[r.provincia].is += r.posicion_ideologica; pc[r.provincia].c++; }
                      if (r.voto_generales && r.edad != null) { if (!pp[r.voto_generales]) pp[r.voto_generales] = { sum: 0, count: 0 }; pp[r.voto_generales].sum += r.edad; pp[r.voto_generales].count++; }
                    });
                    const mm: Record<string, { edad_promedio: number; ideologia_promedio: number }> = {};
                    Object.entries(pc).forEach(([p, c]) => { mm[p] = { edad_promedio: c.c > 0 ? c.es / c.c : 0, ideologia_promedio: c.c > 0 ? c.is / c.c : 0 }; });
                    setProvinciaMetricsMap(mm);
                    const edadPP: Record<string, number> = {};
                    Object.entries(pp).forEach(([p, d]) => { if (d.count > 0) edadPP[p] = Math.round(d.sum / d.count); });
                    setEdadMediaPorPartido(edadPP);
                  }
                } catch { /* skip */ }
              }
            } catch (e) { console.error(e); }
          }
        } catch (e) { console.error(e); }

        try {
          const { data: yd } = await supabase.from("votos_juveniles_totales").select("*");
          if (yd?.length) {
            const yv: Record<string, number> = {};
            yd.forEach((r: any) => { yv[resolvePartyKey(String(r.asociacion_id || ""), youthPartyMap)] = r.votos; });
            const escanos = calcularEscanosJuveniles(yv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setYouthStats(obtenerEstadisticas(yv, escanos, nombres, logos).map(s => ({ ...s, color: youthPartyMap[resolvePartyKey(s.id, youthPartyMap)]?.color })));
          }
        } catch (e) { console.error(e); }

        try {
          const { data: jpd } = await supabase.from("votos_por_provincia_juveniles_view").select("provincia, asociacion, votos");
          if (jpd?.length) { const vjp: Record<string, Record<string, number>> = {}; jpd.forEach((r: any) => { if (r.provincia && r.asociacion) { if (!vjp[r.provincia]) vjp[r.provincia] = {}; vjp[r.provincia][resolvePartyKey(String(r.asociacion), youthPartyMap)] = r.votos; } }); setVotosPorProvinciaJuveniles(vjp); }
        } catch (e) { console.error(e); }

        try {
          const { data: ratings, error: ratingsError } = await supabase
            .from("valoraciones_lideres")
            .select("party_key, leader_name, valoracion")
            .gte("valoracion", 1)
            .lte("valoracion", 10)
            .limit(10_000);
          if (ratingsError) throw ratingsError;
          const grouped = new globalThis.Map<string, { name: string; partyKey: string; total: number; score: number }>();
          (ratings || []).forEach((rating: any) => {
            const partyKey = String(rating.party_key || "").trim();
            const name = String(rating.leader_name || "").trim();
            const score = Number(rating.valoracion);
            if (!partyKey || !name || !Number.isFinite(score)) return;
            const key = `${partyKey.toLocaleLowerCase()}::${name.toLocaleLowerCase()}`;
            const current = grouped.get(key) || { name, partyKey, total: 0, score: 0 };
            current.total += 1;
            current.score += score;
            grouped.set(key, current);
          });
          const aggregatedLeaders = Array.from(grouped.values()) as Array<{ name: string; partyKey: string; total: number; score: number }>;
          setLeaderRatings(aggregatedLeaders
            .map((leader) => ({
              name: leader.name,
              fieldName: `${leader.partyKey}::${leader.name}`,
              average: Math.round((leader.score / leader.total) * 10) / 10,
              count: leader.total,
            }))
            .sort((a, b) => b.average - a.average || b.count - a.count || a.name.localeCompare(b.name, "es")));
        } catch (error) {
          console.error("Error cargando valoraciones_lideres:", error);
          setLeaderRatings([]);
        }

        try { const { data } = await supabase.from("media_nota_ejecutivo").select("nota_media"); if (data?.[0]) setNotaEjecutivo(data[0].nota_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("edad_promedio").select("edad_media"); if (data?.[0]) setEdadPromedio(data[0].edad_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("ideologia_promedio").select("ideologia_media"); if (data?.[0]) setIdeologiaPromedio(data[0].ideologia_media); } catch { /* skip */ }

        try {
          const { data: bc } = await supabase.from("BarómetroBC").select("partido, escaños");
          if (bc?.length) {
            const bcMap: Record<string, number> = {};
            bc.forEach((r: any) => {
              let partyKey = resolvePartyKey(String(r.partido || ""), generalPartyMap);
              // Si no encuentra por party_key, buscar por display_name
              if (!generalPartyMap[partyKey]) {
                const found = Object.entries(generalPartyMap).find(([, p]) => 
                  p.name?.toLowerCase() === String(r.partido || "").toLowerCase()
                );
                if (found) partyKey = found[0];
              }
              bcMap[partyKey] = parseInt(r.escaños || "0", 10) || 0;
            });
            setBarometroBC(bcMap);
          }
        } catch (e) { console.warn("Error loading BarómetroBC:", e); }

        try {
          const { data: me } = await supabase.from("MediaEncuestas").select("partido, escaños");
          if (me?.length) {
            const meMap: Record<string, number> = {};
            me.forEach((r: any) => {
              let partyKey = resolvePartyKey(String(r.partido || ""), generalPartyMap);
              // Si no encuentra por party_key, buscar por display_name
              if (!generalPartyMap[partyKey]) {
                const found = Object.entries(generalPartyMap).find(([, p]) => 
                  p.name?.toLowerCase() === String(r.partido || "").toLowerCase()
                );
                if (found) partyKey = found[0];
              }
              meMap[partyKey] = parseInt(r.escaños || "0", 10) || 0;
            });
            setMediaEncuestas(meMap);
          }
        } catch (e) { console.warn("Error loading MediaEncuestas:", e); }

        try {
          const { data: topLideres } = await supabase.from("top_lider_por_partido").select("partido, lider_top, porcentaje_lider_top");
          if (topLideres?.length) {
            const liderMap: Record<string, string> = {};
            const porcentajeMap: Record<string, number> = {};
            topLideres.forEach((r: any) => {
              let partyKey = resolvePartyKey(String(r.partido || ""), generalPartyMap);
              if (!generalPartyMap[partyKey]) {
                const found = Object.entries(generalPartyMap).find(([, p]) => 
                  p.name?.toLowerCase() === String(r.partido || "").toLowerCase()
                );
                if (found) partyKey = found[0];
              }
              liderMap[partyKey] = r.lider_top || "N/A";
              porcentajeMap[partyKey] = parseFloat(r.porcentaje_lider_top || "0") || 0;
            });
            setLiderPorPartido(liderMap);
            setPorcentajeLiderPorPartido(porcentajeMap);
          }
        } catch (e) { console.warn("Error loading top_lider_por_partido:", e); }

        try { 
          const { data } = await supabase.from("coherencia_voto_lider_view").select("*"); 
          setCoherenciaRows(data || []);
        } catch (e) {
          console.warn("Error loading coherencia:", e);
          setCoherenciaRows([]);
        }
        try { 
          const { data } = await supabase.from("flujos_voto_view").select("*").limit(40); 
          setFlujosRows(data || []);
        } catch (e) {
          console.warn("Error loading flujos:", e);
          setFlujosRows([]);
        }
        try { 
          const { data } = await supabase.from("ideologia_por_partido").select("*"); 
          setIdeologiaRows(data || []);
        } catch (e) {
          console.warn("Error loading ideologia:", e);
          setIdeologiaRows([]);
        }
        try { 
          const { data } = await supabase.from("correlacion_voto_valoracion").select("*"); 
          setCorrelacionRows(data || []);
        } catch (e) {
          console.warn("Error loading correlacion:", e);
          setCorrelacionRows([]);
        }
        try { 
          const { data } = await supabase.from("votos_historico_resumen").select("*").order("snapshot_at", { ascending: true }).limit(150); 
          setHistoricoRows(data || []);
        } catch (e) {
          console.warn("Error loading historico:", e);
          setHistoricoRows([]);
        }
        try { const { data } = await supabase.from("elecciones_historicas").select("*").order("año", { ascending: true }); setHistoricoElecciones((data || []) as HistoricoEleccion[]); } catch {}
        try {
          const { data } = await supabase
            .from("electionsdirect")
            .select("id,election_date,region_name,region_flag_url,close_at,escrutado,electiondirect_results(porcentaje_voto,escanos,proyected_escaños,proyected_porcentaje,Candidato,is_projection,is_final,party_configuration(id,party_key,display_name,color,logo_url))")
            .order("close_at", { ascending: true });
          const normalized = (data || []).map((r: any) => ({
            id: r.id,
            election_date: r.election_date,
            region_name: r.region_name,
            region_flag_url: r.region_flag_url,
            close_at: r.close_at,
            escrutado: r.escrutado,
            results: (r.electiondirect_results || []).map((x: any) => ({
              party_id: x.party_configuration?.id,
              party_key: x.party_configuration?.party_key,
              display_name: x.party_configuration?.display_name,
              color: x.party_configuration?.color,
              logo_url: x.party_configuration?.logo_url,
              porcentaje_voto: Number(x.porcentaje_voto || 0),
              escanos: x.escanos,
              proyected_escaños: x.proyected_escaños,
              proyected_porcentaje: x.proyected_porcentaje,
              candidato: x.Candidato,
              is_projection: !!x.is_projection,
              is_final: !!x.is_final,
            })),
          }));
          setNocheElectoralRows(normalized as NocheElectoralRow[]);
        } catch {}
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
  const historicoPorPartido = useMemo(() => {
    if (!historicoElecciones || historicoElecciones.length === 0) return [];
    
    return historicoElecciones.map((h: any) => ({
      año: Number(h.año ?? h.ano),
      PP: Number(h.pp ?? h.PP ?? 0),
      PSOE: Number(h.psoe ?? h.PSOE ?? 0),
      VOX: Number(h.vox ?? h.VOX ?? 0),
      SUMAR: Number(h.sumar ?? h.SUMAR ?? 0),
      PODEMOS: Number(h.podemos ?? h.PODEMOS ?? 0),
      Ciudadanos: Number(h.ciudadanos ?? h.CIUDADANOS ?? 0),
      ERC: Number(h.erc ?? h.ERC ?? 0),
      JUNTS: Number(h.junts ?? h.JUNTS ?? 0),
	  PNV: Number(h.pnv ?? h.PNV ?? 0),
      BILDU: Number(h.bildu ?? h.BILDU ?? 0),
    })).sort((a: any, b: any) => a.año - b.año);
  }, [historicoElecciones]);
  const comparativa2023VsActual = useMemo(() => {
    if (!historicoElecciones || historicoElecciones.length === 0) return [];
    
    const r2023 = historicoElecciones.find((h: any) => h.año === 2023);
    if (!r2023) return [];
    
    const parties = ['PP', 'PSOE', 'VOX', 'SUMAR', 'PODEMOS', 'Ciudadanos', 'ERC', 'JUNTS', 'PNV', 'BILDU',];
    return parties.map(p => {
      const current = generalStats.find(g => g.nombre === p || g.id === p)?.escanos || 0;
      const key = p.toLowerCase();
      return { partido: p, escanos_2023: Number((r2023 as any)[key] || 0), escanos_actuales: current };
    });
  }, [historicoElecciones, generalStats]);

  const handleGenerarInfografia = async (type: "general" | "party" | "leaders", party?: string) => {
    let top1PorPartido: Array<{ partido: string; lider: string; votos: number; porcentaje: number }> = [];
    let topRegionPorPartido: Array<{ partido: string; region: string; votos: number }> = [];
    let top5LideresPorPartido: Record<string, Array<{ nombre: string; votos: number; porcentaje: number; photo_url?: string }>> = {};
    let preguntasVarias: Record<string, { division_territorial?: string; monarquia_republica?: string; sistema_pensiones?: string }> = {};
    let partyLogos: Record<string, string> = {};
    
    try {
      const { data: partyConfig } = await supabase.from("party_configuration").select("party_key, display_name, logo_url");
      const byAnyName: Record<string, { key: string; display: string; logo_url?: string }> = {};
      (partyConfig || []).forEach((p: any) => {
        const key = String(p.party_key || "").trim();
        const display = String(p.display_name || "").trim();
        if (!key) return;
        byAnyName[key.toLowerCase()] = { key, display, logo_url: p.logo_url || "" };
        if (display) byAnyName[display.toLowerCase()] = { key, display, logo_url: p.logo_url || "" };
        if (p.logo_url) {
          partyLogos[key] = p.logo_url;
          if (display) partyLogos[display] = p.logo_url;
        }
      });
      const selectedPartyCanonical = party ? byAnyName[String(party).trim().toLowerCase()] : undefined;

      const { data: topLeaderRows } = await supabase.from("top_lider_por_partido").select("partido, lider_top, votos_lider_top, porcentaje_lider_top");
      if (topLeaderRows?.length) top1PorPartido = topLeaderRows.map((r: any) => ({ partido: r.partido, lider: r.lider_top, votos: Number(r.votos_lider_top || 0), porcentaje: Number(r.porcentaje_lider_top || 0) }));

      const { data: leaderPhotosRows } = await supabase.from("party_leaders").select("leader_name, photo_url").eq("is_active", true);
      const photoByLeader: Record<string, string> = {};
      (leaderPhotosRows || []).forEach((l: any) => {
        if (l?.leader_name && l?.photo_url) photoByLeader[String(l.leader_name).trim().toLowerCase()] = l.photo_url;
      });
      const { data: top5Rows } = await supabase.from("ranking_lideres_por_partido").select("partido, lider_preferido, total_votos, porcentaje").order("partido", { ascending: true }).order("total_votos", { ascending: false });
      if (top5Rows?.length) {
        top5Rows.forEach((r: any) => {
          const rawPartido = String(r.partido || "").trim();
          const canonical = byAnyName[rawPartido.toLowerCase()];
          const keys = [rawPartido, canonical?.key, canonical?.display].filter(Boolean) as string[];
          const targetKey = keys[0];
          if (!top5LideresPorPartido[targetKey]) top5LideresPorPartido[targetKey] = [];
          if (top5LideresPorPartido[targetKey].length < 5) {
            const payload = {
              nombre: r.lider_preferido,
              votos: Number(r.total_votos || 0),
              porcentaje: Number(r.porcentaje || 0),
              photo_url: photoByLeader[String(r.lider_preferido || "").trim().toLowerCase()]
            };
            keys.forEach((k) => {
              if (!top5LideresPorPartido[k]) top5LideresPorPartido[k] = [];
              if (top5LideresPorPartido[k].length < 5) top5LideresPorPartido[k].push(payload);
            });
          }
        });
      }

      if (party) {
        const filterParty = selectedPartyCanonical?.display || selectedPartyCanonical?.key || party;
        const { data: respuestasData } = await supabase.from("respuestas").select("division_territorial, monarquia_republica, sistema_pensiones").eq("voto_generales", filterParty).limit(1000);
        if (respuestasData?.length) {
          const countMap = (arr: any[], field: string) => {
            const counts: Record<string, number> = {};
            arr.forEach(r => { const val = r[field]; if (val) counts[val] = (counts[val] || 0) + 1; });
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
          };
          const payload = {
            division_territorial: countMap(respuestasData, "division_territorial"),
            monarquia_republica: countMap(respuestasData, "monarquia_republica"),
            sistema_pensiones: countMap(respuestasData, "sistema_pensiones")
          };
          [party, selectedPartyCanonical?.key, selectedPartyCanonical?.display].filter(Boolean).forEach((k: any) => { preguntasVarias[k] = payload; });
        }
      }

      // Derivamos esta información de respuestas reales. Así la infografía no
      // depende de una vista opcional de Supabase que puede no estar instalada.
      const { data: regionRows, error: regionRowsError } = await supabase
        .from("respuestas")
        .select("voto_generales, comunidad_autonoma")
        .not("voto_generales", "is", null)
        .not("comunidad_autonoma", "is", null)
        .limit(10_000);
      if (!regionRowsError && regionRows?.length) {
        topRegionPorPartido = getTopRegionsByParty(regionRows);
      }
    } catch (e) {
      console.error("Error cargando datos extendidos para infografía:", e);
    }
    const topLeaders = leaderRatings.slice().sort((a, b) => b.average - a.average).map((leader) => ({ name: leader.name, party: "Valoración BC", votes: leader.count, average: leader.average, color: leader.average >= 7 ? "#34d399" : leader.average >= 4 ? "#fbbf24" : "#fb7185" }));
    await generarInfografiaPNG(generalStats, totalResponses, edadPromedio, ideologiaPromedio, type, party, topLeaders, top1PorPartido, topRegionPorPartido, top5LideresPorPartido, preguntasVarias, partyLogos);
  };

  const showSortBar = activeTab === "general" || activeTab === "youth";
  const showPartyList = stats.length > 0 && showSortBar;

  return (
    <>
      <style>{RESULTS_CSS}</style>
      <div className="r-root">
        {/* Header */}
        <header className="r-header">
          <div className="r-brand">
            <img src="/favicon.png" alt="BC" />
            <div>
              <div className="r-brand-title">Resultados en Vivo</div>
              <div className="r-brand-sub">{totalResponses.toLocaleString("es-ES")} respuestas · Batalla Cultural</div>
            </div>
          </div>
          <div className="r-header-actions">
            <button className="r-hbtn r-hbtn-infog" onClick={() => setShowInfografiaModal(true)}>
              <Image size={12} /><span>Infografía</span>
            </button>
            <button className="r-hbtn r-hbtn-pdf" onClick={async () => {
              try {
                await downloadPDFWithMetrics(generalStats, activeTab, totalResponses, null, null);
                alert("¡PDF generado y descargado con éxito!");
              } catch (e) {
                console.error("Error PDF:", e);
                alert("Error generando PDF. Comprueba que las librerías estén cargadas.");
              }
            }} title="Exportar informe oficial en PDF">
              <FileText size={12} /><span>PDF</span>
            </button>
            <button className="r-hbtn r-hbtn-ai" onClick={async () => {
              try {
                await exportResultsSummaryPng(stats, activeTab, totalResponses);
                alert("¡Resumen PNG descargado con éxito!");
              } catch (err) {
                console.error("Error exportando imagen PNG:", err);
                alert("No se pudo exportar la imagen. Inténtalo de nuevo.");
              }
            }} title="Exportar resumen actual en imagen PNG de alta calidad">
              <Download size={12} /><span>Exportar PNG</span>
            </button>
            
            <button className="r-hbtn r-hbtn-outline" onClick={() => setLocation("/")}>← Volver</button>
            <div className="hidden md:block"><FollowUsMenu /></div>
          </div>
        </header>

        {/* NavBar */}
        <ResultsNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="r-main" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="r-space" style={{ animation: 'slideInUp 0.8s ease-out 0.2s both' }}>
              {/* Quick stats */}
              <div className="r-quickstats" style={{ animation: 'slideInUp 0.6s ease-out' }}>
                <div className="r-stat-card">
                  <div className="r-stat-label">Respuestas</div>
                  <div className="r-stat-value accent">{totalResponses.toLocaleString("es-ES")}</div>
                </div>
                {edadPromedio !== null && (
                  <div className="r-stat-card">
                    <div className="r-stat-label">Edad media</div>
                    <div className="r-stat-value">{edadPromedio.toFixed(1)}</div>
                    <div className="r-stat-suffix">años</div>
                  </div>
                )}
                {ideologiaPromedio !== null && (
                  <div className="r-stat-card">
                    <div className="r-stat-label">Ideología</div>
                    <div className="r-stat-value">{ideologiaPromedio.toFixed(1)}</div>
                    <div className="r-stat-suffix">/ 10</div>
                  </div>
                )}
                {notaEjecutivo !== null && (
                  <div className="r-stat-card">
                    <div className="r-stat-label">Nota Ejecutivo</div>
                    <div className="r-stat-value">{notaEjecutivo.toFixed(1)}</div>
                    <div className="r-stat-suffix">/ 10</div>
                  </div>
                )}
                <div className="r-stat-card">
                  <div className="r-stat-label">Abstención BarómetroBC</div>
                  <div className="r-stat-value">40</div>
                  <div className="r-stat-suffix">%</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Nivel de Cabreo</div>
                  <div className="r-stat-value">7</div>
                  <div className="r-stat-suffix">/ 10</div>
                </div>
              </div>

              {showSortBar && (
                <div className="r-sort-bar">
                  <span style={{ fontSize: 11, color: "#7a7990" }}>Ordenar:</span>
                  {(["votos", "escanos", "barometro", "media"] as const).map(opt => (
                    <button key={opt} className={`r-sort-btn${sortBy === opt ? " active" : ""}`} onClick={() => setSortBy(opt as any)}>
                      {opt === "votos" ? "Votos" : opt === "escanos" ? "Escaños" : opt === "barometro" ? "BarómetroBC" : "Media"}
                    </button>
                  ))}
                  <span className="r-sort-hint">{totalEscanos} escaños en juego</span>
                  {activeTab === "general" && (
                    <button
                      onClick={() => setShowTransferenciaModal(true)}
                      style={{
                        marginLeft: "auto",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(232,70,90,0.15)",
                        border: "1px solid rgba(232,70,90,0.3)",
                        color: "#e8465a",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,70,90,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,70,90,0.15)";
                      }}
                    >
                      <GitBranch size={11} style={{ display: "inline", marginRight: 4 }} />
                      Transferencia de Voto
                    </button>
                  )}
                </div>
              )}

              {showPartyList && activeTab === "general" && (
                <Top5LideresWidget />
              )}

              {showPartyList && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(sortBy === "votos" ? [...stats].sort((a, b) => b.votos - a.votos) : sortBy === "escanos" ? [...stats].sort((a, b) => b.escanos - a.escanos) : sortBy === "barometro" ? [...stats].sort((a, b) => (barometroBC[b.id] ?? 0) - (barometroBC[a.id] ?? 0)) : [...stats].sort((a, b) => (mediaEncuestas[b.id] ?? 0) - (mediaEncuestas[a.id] ?? 0))).map(party => {
                    const canonicalParty = resolveCanonicalParty(party.id, canonicalPartyIndex) || resolveCanonicalParty(party.nombre, canonicalPartyIndex);
                    const displayName = canonicalParty?.display_name || party.nombre;
                    const logoUrl = canonicalParty?.logo_url || "";
                    const partyColor = canonicalParty?.color || "#64748B";
                    const edadMedia = edadMediaPorPartido[displayName] || edadMediaPorPartido[party.id] || edadMediaPorPartido[party.nombre];
                    return (
                      <div key={party.id} className="r-party-card" style={{ borderColor: `${partyColor}45`, ["--party-accent" as any]: partyColor }} onClick={() => setSelectedPartyForStats(displayName)}>
                        <div className="r-party-card-top">
                          <div className="r-party-logo-wrap" style={{ background: `${partyColor}18` }}>
                            <PartyLogoImg src={logoUrl} name={displayName} color={partyColor} size={48} />
                          </div>
                          <div className="r-party-info">
                            <div className="r-party-name">{displayName}</div>
                            <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                            {activeTab === "general" && edadMedia && (
                              <div className="r-party-edad">
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a96e", display: "inline-block", marginRight: 4 }} />
                                Edad media: {edadMedia} años
                              </div>
                            )}
                            {activeTab === "general" && liderPorPartido[party.id] && (
                              <div style={{ marginTop: 6 }}>
                                <div style={{ fontSize: 12, color: partyColor, fontWeight: 600, marginBottom: 4 }}>
                                  Líder: {liderPorPartido[party.id]}
                                </div>
                                <div style={{ height: 4, background: `${partyColor}26`, borderRadius: 2, overflow: "hidden" }}>
                                  <div style={{ height: "100%", background: partyColor, width: `${Math.min(porcentajeLiderPorPartido[party.id] || 0, 100)}%`, transition: "width 0.5s ease" }} />
                                </div>
                                <div style={{ fontSize: 9, color: "#7a7990", marginTop: 2, textAlign: "right" }}>
                                  {(porcentajeLiderPorPartido[party.id] || 0).toFixed(1)}% apoyo
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="r-party-seats" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <div style={{ textAlign: "center", flex: 1 }}>
                              <div className="r-party-seats-num" style={{ color: partyColor, fontSize: 28 }}>{party.escanos}</div>
                              <div className="r-party-seats-label" style={{ fontSize: 11 }}>EncuestaBC</div>
                            </div>
                            <div style={{ textAlign: "center", flex: 1, position: "relative", cursor: "help" }} title="Encuesta independiente de opinión">
                              <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 24 }}>{barometroBC[party.id] ?? 0}</div>
                              <div style={{ color: "#7a7990", fontSize: 10 }}>Barómetro</div>
                            </div>
                            <div style={{ textAlign: "center", flex: 1, position: "relative", cursor: "help" }} title="Promedio de encuestas">
                              <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 24 }}>{mediaEncuestas[party.id] ?? 0}</div>
                              <div style={{ color: "#7a7990", fontSize: 10 }}>Media</div>
                            </div>
                            {party.escanos !== (mediaEncuestas[party.id] ?? 0) && (
                              <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, position: "relative", cursor: "help" }} title="Variación entre EncuestaBC y Media de encuestas">
                                {party.escanos > (mediaEncuestas[party.id] ?? 0) ? (
                                  <span style={{ color: "#22c55e" }}>↑ +{party.escanos - (mediaEncuestas[party.id] ?? 0)}</span>
                                ) : (
                                  <span style={{ color: "#ef4444" }}>↓ {party.escanos - (mediaEncuestas[party.id] ?? 0)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="r-party-bar-wrap">
                          <div className="r-party-bar-labels">
                            <span>{party.porcentaje.toFixed(1)}% votos</span>
                            <span>{((party.escanos / totalEscanos) * 100).toFixed(1)}% escaños</span>
                          </div>
                          <div className="r-party-bar-track">
                            <div className="r-party-bar-fill" style={{ background: partyColor, width: `${party.porcentaje}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tabs content */}
              {activeTab === "tendencias" && <TrendenciesChart partyColors={partyColorMap} />}
              {activeTab === "analisis-avanzado" && (
                <AnalisisAvanzadoSection
                  coherenciaRows={coherenciaRows}
                  flujosRows={flujosRows}
                  ideologiaRows={ideologiaRows}
                  correlacionRows={correlacionRows}
                  historicoRows={historicoRows}
                />
              )}
              {activeTab === "contexto-historico" && (
                <div style={{ display: "grid", gap: 14 }}>
                  {!historicoPorPartido.length ? <div className="r-section" style={{ textAlign: "center", padding: "44px 22px" }}><History size={28} color="#60a5fa" style={{ margin: "0 auto 10px" }} /><div className="r-section-title">Contexto histórico pendiente de datos</div><p style={{ margin: "8px auto 0", maxWidth: 530, color: "#9ca3af", fontSize: 13, lineHeight: 1.6 }}>No se han encontrado filas utilizables en <code>elecciones_historicas</code>. Cuando se registren años y escaños por partido, aparecerán aquí sin estimaciones ni datos simulados.</p></div> : <>
                  <div className="r-section" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                      <div><div className="r-section-title" style={{ marginBottom: 4 }}>Contexto histórico y ciclos electorales</div><div style={{ color: "#9ca3af", fontSize: 12 }}>Evolución de escaños registrada en la serie histórica disponible.</div></div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span className="r-badge">{historicoPorPartido.length} convocatorias</span><span className="r-badge">{historicoPorPartido[0]?.año}–{historicoPorPartido.at(-1)?.año}</span></div>
                    </div>
                    <ResponsiveContainer width="100%" height={340}>
                      <LineChart data={historicoPorPartido} margin={{ top: 12, right: 14, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="año" tick={{ fill: "#7a7990" }} />
                        <YAxis tick={{ fill: "#7a7990" }} />
                        <Tooltip contentStyle={{ background: "#11131c", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, color: "#f8fafc" }} labelStyle={{ color: "#f8fafc", fontWeight: 800 }} itemStyle={{ color: "#dbeafe" }} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        {["PP", "PSOE", "VOX", "SUMAR", "PODEMOS", "Ciudadanos", "ERC", "JUNTS", "PNV", "BILDU",].map((p) => (
                          <Line key={p} name={p} type="monotone" dataKey={p} stroke={partyColorMap[p.toUpperCase()] || "#e8465a"} strokeWidth={2.2} activeDot={{ r: 5 }} dot={{ r: 2, strokeWidth: 0 }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="r-section">
                    <div className="r-section-title">Comparativa 2023 vs proyección actual de Encuesta BC</div>
                    <p style={{ color: "#9ca3af", fontSize: 12, margin: "4px 0 12px" }}>La referencia histórica usa el registro de 2023 almacenado en Supabase; la segunda barra aplica la distribución actual de la encuesta.</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparativa2023VsActual} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="partido" tick={{ fill: "#7a7990" }} />
                      <YAxis tick={{ fill: "#7a7990" }} />
                      <Tooltip contentStyle={{ background: "#11131c", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, color: "#f8fafc" }} labelStyle={{ color: "#f8fafc", fontWeight: 800 }} itemStyle={{ color: "#dbeafe" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="escanos_2023" fill="#60a5fa" name="2023" />
                      <Bar dataKey="escanos_actuales" fill="#e8465a" name="Actual BC" />
                    </BarChart>
	                    </ResponsiveContainer>
	                </div>
	                </>}
	                </div>
	              )}
              {activeTab === "noche-electoral" && (
                <div className="r-section">
                  <div className="r-section-title">Modo Directo: Noche Electoral</div>
                  <div className="r-direct-grid">
                    {nocheElectoralRows.length === 0 && <div style={{ fontSize: 12, color: "#7a7990" }}>Sin datos en tiempo real todavía.</div>}
                    {nocheElectoralRows.map((r, i) => {
                      const seconds = Math.max(0, Math.floor((new Date(r.close_at).getTime() - Date.now()) / 1000));
                      const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
                      const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
                      const ss = String(seconds % 60).padStart(2, "0");
                      return <div key={`${r.region_name}-${i}`} className="r-direct-card">
                        <div className="r-direct-header">
                          {r.region_flag_url ? <img src={r.region_flag_url} alt={r.region_name} style={{ width: 20, height: 14, objectFit: "cover" }} /> : null}
                          <strong>{r.region_name}</strong>
                          <div className="r-direct-meta"><span className="r-direct-pill">Cierre: {hh}:{mm}:{ss}</span><span className="r-direct-pill">Escrutado: {r.escrutado == null ? "—" : `${Number(r.escrutado).toFixed(1)}%`}</span></div>
                        </div>
                        <div style={{ fontSize: 12, color: "#7a7990" }}>Resultados por partido (desde party_configuration)</div>
                        <div className="r-direct-list">
                          {r.results?.map((pr, idx) => (
                            <div key={`${pr.party_id}-${idx}`} className="r-direct-row">
                              {pr.logo_url ? <img src={pr.logo_url} alt={pr.display_name} style={{ width: 16, height: 16, objectFit: "contain", borderRadius: 3 }} /> : null}
                              <span style={{ width: 8, height: 8, borderRadius: 999, background: pr.color || "#999" }} />
                              <span style={{ minWidth: 120 }}>{pr.display_name}</span>
                              <b>{(pr.proyected_porcentaje ?? pr.porcentaje_voto).toFixed(2)}%</b>
                              <span style={{ color: "#7a7990" }}>{pr.escanos ?? "-"} escaños</span>
                              <span style={{ color: "#7a7990" }}>proj: {pr.proyected_escaños ?? "-"} </span>
                              {pr.candidato ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  {leaderPhotoByName[String(pr.candidato).trim().toLowerCase()] ? <img src={leaderPhotoByName[String(pr.candidato).trim().toLowerCase()]} alt={pr.candidato || ""} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} /> : null}
                                  <span>{pr.candidato}</span>
                                </span>
                              ) : null}
                              <span style={{ marginLeft: "auto", color: pr.is_final ? "#22c55e" : "#f59e0b" }}>{pr.is_final ? "Final" : pr.is_projection ? "Proyección" : "Parcial"}</span>
                            </div>
                          ))}
                        </div>
                      </div>;
                    })}
                  </div>
                </div>
              )}
              {activeTab === "lideres-preferidos" && <LeadersResultsChart partyColors={partyColorMap} />}
              {activeTab === "preguntas-varias" && <PreguntasVariasSection partyIndex={canonicalPartyIndex} />}
              {activeTab === "crisis-ceuta" && <CrisisCeutaSection partyMeta={generalPartyMetaLookup} />}
              {activeTab === "lideres-ranking" && <LideresRankingSection />}
              {activeTab === "ccaa" && <CCAAResltsSection partyIndex={canonicalPartyIndex} />}
              {activeTab === "provincias" && <ProvincesResultsSection partyIndex={canonicalPartyIndex} />}
              {activeTab === "comparacion-ccaa" && <CCAAComparisonSection partyIndex={canonicalPartyIndex} />}
              {activeTab === "encuestadoras-externas" && <EncuestadorasComparativa />}
              {activeTab === "lideres-partidos" && <LideresDePartidosSection partyMeta={generalPartyMetaLookup} />}

              {activeTab === "leaders" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Valoración de Líderes</h2>
                    <div className="r-mode-tabs" style={{ marginBottom: 0 }}>
                      <button className={`r-mode-tab${leadersSubTab === "individual" ? " active" : ""}`} onClick={() => setLeadersSubTab("individual")}>Individual</button>
                      <button className={`r-mode-tab${leadersSubTab === "porpartido" ? " active" : ""}`} onClick={() => setLeadersSubTab("porpartido")}>Por Partido</button>
                    </div>
                  </div>

                  {leadersSubTab === "individual" && (
                    leaderRatings.length === 0
                      ? <div className="r-section" style={{ textAlign: "center", color: "#7a7990" }}>Aún no hay valoraciones.</div>
                      : (
                        <>
                          <div className="r-leader-grid">
                            {leaderRatings.map(leader => {
                              const [partyKey, ...leaderNameParts] = leader.fieldName.split("::");
                              const canonicalLeaderName = leaderNameParts.join("::") || leader.name;
                              const normalizedLeaderName = normalizePartyReference(canonicalLeaderName);
                              const li = leaderPhotoByName[`${normalizePartyReference(partyKey)}::${normalizedLeaderName}`] || leaderPhotoByName[normalizedLeaderName];
                              const scoreColor = leader.average >= 7 ? "#22c55e" : leader.average >= 4 ? "#f59e0b" : "#e8465a";
                              return (
                                <div key={leader.fieldName} className="r-leader-card">
                                  {li ? <img src={li} alt={leader.name} className="r-leader-img" style={{ border: `2px solid ${scoreColor}30` }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div className="r-leader-img-placeholder">{leader.name.charAt(0)}</div>}
                                  <div className="r-leader-name">{leader.name}</div>
                                  <div className="r-leader-score" style={{ color: scoreColor }}>{leader.average.toFixed(1)}</div>
                                  <div style={{ fontSize: 10, color: "#7a7990", marginBottom: 6 }}>sobre 10</div>
                                  <div className="r-leader-bar-track"><div className="r-leader-bar-fill" style={{ background: scoreColor, width: `${(leader.average / 10) * 100}%` }} /></div>
                                  <div className="r-leader-count">{leader.count.toLocaleString("es-ES")} valoraciones</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="r-section">
                            <div className="r-section-title" style={{ marginBottom: 14 }}>Comparativa</div>
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={leaderRatings}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" angle={-30} textAnchor="end" height={70} fontSize={10} tick={{ fill: "#7a7990" }} />
                                <YAxis stroke="rgba(255,255,255,0.1)" domain={[0, 10]} fontSize={10} tick={{ fill: "#7a7990" }} />
                                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v: any) => v.toFixed(1)} />
                                <Bar dataKey="average" radius={[5, 5, 0, 0]}>
                                  {leaderRatings.map(l => <Cell key={l.fieldName} fill={l.average >= 7 ? "#22c55e" : l.average >= 4 ? "#f59e0b" : "#e8465a"} fillOpacity={0.85} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </>
                      )
                  )}

                  {leadersSubTab === "porpartido" && (
                    <LeadersByPartyAvg leaderRatings={leaderRatings} generalStats={generalStats} generalPartyMap={generalPartyMap} />
                  )}
                </div>
              )}

              {activeTab === "mapa-hemiciclo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {Object.keys(votosPorProvincia).length > 0 ? (
                    <>
                      <div className="r-section">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                          <div className="r-section-title">Mapa Provincial</div>
                          <div className="r-map-toggle">
                            {(["schematic", "realistic"] as const).map(v => (
                              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                                {v === "schematic" ? <><Grid3x3 size={11} />Esquemática</> : <><Map size={11} />Realista</>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {mapView === "schematic"
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvincia} isYouthAssociations={false} partyIndex={canonicalPartyIndex} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyIndex={canonicalPartyIndex} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />}
                      </div>
                      <div className="r-section">
                        <div className="r-section-title">Pactómetro</div>
                        <PactometerInteractive stats={generalStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
                      </div>
                      <div className="r-section">
                        <div className="r-section-title" style={{ marginBottom: 14 }}>Hemiciclo del Congreso</div>
                        <CongressHemicycle escanos={escanosGeneralesPorProvincia} totalEscanos={350} provinciaSeleccionada={provinciaSeleccionada} votosProvincia={votosPorPartidoProvincia} escanosProvincia={escanosProvincia} partyMeta={generalPartyMetaLookup} />
                      </div>
                    </>
                  ) : <div className="r-section" style={{ textAlign: "center", color: "#7a7990" }}>Cargando datos de provincias...</div>}
                </div>
              )}

              {activeTab === "asoc-juv-mapa-hemiciclo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                    <>
                      <div className="r-section">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                          <div className="r-section-title">Mapa — Asociaciones Juveniles</div>
                          <div className="r-map-toggle">
                            {(["schematic", "realistic"] as const).map(v => (
                              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                                {v === "schematic" ? <><Grid3x3 size={11} />Esquemática</> : <><Map size={11} />Realista</>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {mapView === "schematic"
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvinciaJuveniles} isYouthAssociations={true} partyIndex={canonicalPartyIndex} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvinciaJuveniles} provinciaMetricsMap={{}} isYouthAssociations={true} partyIndex={canonicalPartyIndex} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />}
                      </div>
                      <div className="r-section">
                        {youthStats.length > 0 && <PactometerInteractive stats={youthStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={100} requiredForMajority={51} />}
                      </div>
                      <div className="r-section">
                        <div className="r-section-title" style={{ marginBottom: 14 }}>Hemiciclo Asociaciones Juveniles</div>
                        <CongressHemicycle escanos={escanosJuvenilesPorProvincia} totalEscanos={100} provinciaSeleccionada={provinciaSeleccionadaJuveniles} votosProvincia={votosPorPartidoProvinciaJuveniles} escanosProvincia={escanosProvinciaJuveniles} partyMeta={youthPartyMetaLookup} />
                      </div>
                    </>
                  ) : <div className="r-section" style={{ textAlign: "center", color: "#7a7990" }}>Cargando datos...</div>}
                </div>
              )}

              {/* Metodología */}
              {!["lideres-partidos", "encuestadoras-externas"].includes(activeTab) && (
                <div className="r-section">
                  <div className="r-section-title" style={{ fontSize: 13, marginBottom: 12 }}>Metodología</div>
                  <div className="r-method">
                    <div><div className="r-method-key">Ley d'Hondt.</div><div className="r-method-val">Reparto proporcional usado en España.</div></div>
                    <div><div className="r-method-key">Umbral mínimo.</div><div className="r-method-val">3% generales, 4% asociaciones juveniles.</div></div>
                    <div><div className="r-method-key">Actualización.</div><div className="r-method-val">Datos en tiempo real cada 10 segundos.</div></div>
                  </div>
                </div>
              )}

              <CommentsSection activeTab={activeTab} />

              <div className="r-cta">
                <p className="r-cta-text">¿Aún no has respondido la encuesta?</p>
                <button className="r-cta-btn" onClick={() => setLocation("/encuesta")}>Responder Encuesta</button>
              </div>
            </div>
        </main>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.8)", padding: "16px 20px", textAlign: "center", fontSize: 11, color: "#5a596a" }}>
          La Encuesta de Batalla Cultural © 2025 · Datos anónimos y públicos
        </footer>

        <PartyStatsModal isOpen={!!selectedPartyForStats} onClose={() => setSelectedPartyForStats(null)} partyName={selectedPartyForStats || ""} partyType={activeTab === "general" ? "general" : "youth"} accentColor={selectedPartyForStats ? (activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup)[resolvePartyKey(selectedPartyForStats, activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup)]?.color : undefined} partyLogo={selectedPartyForStats ? (activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup)[resolvePartyKey(selectedPartyForStats, activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup)]?.logo : undefined} partyKey={selectedPartyForStats ? resolvePartyKey(selectedPartyForStats, activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup) : undefined} />
        {showInfografiaModal && <InfografiaModal parties={generalStats} onClose={() => setShowInfografiaModal(false)} onGenerate={handleGenerarInfografia} />}
        <TransferenciaVotoModal isOpen={showTransferenciaModal} onClose={() => setShowTransferenciaModal(false)} partyColors={partyColorMap} />
      </div>
    </>
  );
}
