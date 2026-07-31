// ═══════════════════════════════════════════════════════════════════════════
// Results.tsx — Versión corregida y mejorada
// Fixes: comentarios, logos partidos, simulador, gobierno, infografía, mobile
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LEADERS } from '@/lib/surveyData';
import { EMBEDDED_LEADERS } from '@/lib/embeddedLeaders';
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
  ResponsiveContainer, Cell, LineChart, Line, Legend,
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
import { PrimariasResultsSection } from "@/components/results/PrimariasResultsSection";
import FollowUsMenu from "@/components/FollowUsMenu";
import PactometerInteractive from "@/components/PactometerInteractive";
import GovernmentBuilder from "@/components/GovernmentBuilder";
import { downloadPDFWithMetrics } from "@/lib/pdfExportMetrics";
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
.r-quickstats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
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
.r-party-logo-wrap { width: 40px; height: 40px; border-radius: 9px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.r-party-info { flex: 1; min-width: 0; }
.r-party-name { font-size: 13px; font-weight: 700; color: #f0eff8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-party-votes { font-size: 11px; color: #7a7990; margin-top: 1px; }
.r-party-edad { font-size: 10px; color: #c9a96e; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.r-party-seats-group { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.r-party-seats { text-align: center; flex-shrink: 0; }
.r-party-seats-num { font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; line-height: 1; }
.r-party-seats-label { font-size: 9px; color: #7a7990; }
.r-party-seats-box { border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 4px 8px; background: rgba(0, 0, 0, 0.25); text-align: center; }
.r-party-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
.r-party-bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: #5a596a; }
.r-party-bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.r-party-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s cubic-bezier(0.22,1,0.36,1); }

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
.r-select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 99px; padding: 9px 12px; font-size: 13px; color: #f0eff8; font-family: inherit; outline: none; appearance: none; transition: border-color 0.18s; }
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
`;

// ─── Tab navigation ──────────────────────────────────────────────────────────
type TabKey =
  | "general" | "mapa-hemiciclo" | "encuestadoras-externas" | "ccaa"
  | "provincias" | "comparacion-ccaa" | "youth" | "asoc-juv-mapa-hemiciclo"
  | "leaders" | "tendencias" | "lideres-preferidos" | "lideres-partidos"
  | "preguntas-varias" | "analisis-avanzado" | "contexto-historico" | "noche-electoral" | "primarias" | "crisis-ceuta";

interface TabGroup { label: string; icon: React.ReactNode; tabs: { key: TabKey; label: string }[]; }

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
  ]},
  { label: "Análisis", icon: <BarChart2 className="w-3.5 h-3.5" />, tabs: [
    { key: "tendencias", label: "Tendencias" },
    { key: "contexto-historico", label: "Contexto Histórico" },
    { key: "preguntas-varias", label: "Preguntas Varias" },
  ]},
  { label: "Crisis Ceuta", icon: <AlertTriangle className="w-3.5 h-3.5" />, tabs: [
    { key: "crisis-ceuta", label: "Análisis de Crisis" },
  ]},
  { label: "Primarias", icon: <Vote className="w-3.5 h-3.5" />, tabs: [
    { key: "primarias", label: "Resultados Primarias" },
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
  onGenerate: (type: "general" | "party", party?: string) => void;
}) {
  const [type, setType] = useState<"general" | "party">("general");
  const [selectedParty, setSelectedParty] = useState("");
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
        <div className="r-infog-footer">
          <button className="r-infog-cancel" onClick={onClose}>Cancelar</button>
          <button className="r-infog-generate" onClick={() => { onGenerate(type, selectedParty); onClose(); }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={13} />Generar PNG
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
  const [logoB64, setLogoB64] = useState("");
  const [showGobModal, setShowGobModal] = useState(false);

  useEffect(() => {
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

      {subTab === "candidatos" && (
        <>
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
          {(selectedParty ? [selectedParty] : partyKeys).map(partyKey => {
            const partyLeaders = byParty[partyKey] || [];
            const partyPrefs = prefByParty[partyKey] || [];
            const info = partyLeaders[0]; if (!info) return null;
            const pm = partyMeta[partyKey];
            const color = pm?.color || info.color;
            const name = pm?.name || info.display_name;
            const logo = pm?.logo || info.logo_url;
            const tot = partyPrefs.reduce((a, b) => a + b.votos, 0);
            const leadersWithVotes = partyLeaders.map(l => {
              const pref = partyPrefs.find(p => p.lider_preferido === l.leader_name);
              return { ...l, votos: pref?.votos ?? 0, porcentaje: pref?.porcentaje ?? 0 };
            }).sort((a, b) => b.votos - a.votos);
            const extraPrefs = partyPrefs.filter(p => !partyLeaders.some(l => l.leader_name === p.lider_preferido));
            const chartData = [...leadersWithVotes.filter(l => l.votos > 0).map(l => ({ name: l.leader_name, votos: l.votos, porcentaje: l.porcentaje })), ...extraPrefs.map(e => ({ name: e.lider_preferido, votos: e.votos, porcentaje: e.porcentaje }))].sort((a, b) => b.votos - a.votos).slice(0, 10);

            return (
              <div key={partyKey} className="r-section" style={{ borderColor: `${color}25` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <PartyLogoImg src={logo} name={name} color={color} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#7a7990" }}>{partyLeaders.length} candidato{partyLeaders.length !== 1 ? "s" : ""} · {tot > 0 ? `${tot} votos` : "Sin votos aún"}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 14, marginBottom: 16 }}>
                  {leadersWithVotes.map(leader => (
                    <div key={leader.id} style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `2px solid ${color}`, margin: "0 auto 8px" }}>
                        {leader.photo_url ? <img src={leader.photo_url} alt={leader.leader_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" }}>{leader.leader_name.charAt(0)}</div>}
                        {leader.votos > 0 && <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", background: color, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, boxShadow: "0 6px 12px rgba(0,0,0,.28)" }}>{leader.votos}</div>}
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
                  ))}
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
    </div>
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
                      const votes = circVotos[partyKey] ?? 0;
                      return (
                        <div key={partyKey} className="r-sim-party-row">
                          <PartyLogoImg src={party.logo} name={party.name} color={party.color} size={20} />
                          <span className="r-sim-party-name">{party.name}</span>
                          <input type="number" min={0} value={votes} className="r-sim-input"
                            onChange={e => updateProvVote(selectedCirc, partyKey, Number(e.target.value))} />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="r-empty-circ">Selecciona una provincia arriba para personalizar los votos de esa circunscripción.</div>
              )}
            </>
          )}

          {/* Añadir partido custom */}
          <div className="r-sim-add">
            <div className="r-sim-add-title"><Plus size={12} />Añadir partido personalizado</div>
            <div className="r-sim-add-row">
              <input type="text" placeholder="Nombre partido..." value={newPartyName} onChange={e => setNewPartyName(e.target.value)} className="r-sim-add-input" />
              <input type="color" value={newPartyColor} onChange={e => setNewPartyColor(e.target.value)} style={{ width: 36, height: 32, borderRadius: 6, border: "none", cursor: "pointer", background: "none" }} />
              <button onClick={addCustomParty} className="r-sim-add-btn">Añadir</button>
            </div>
          </div>

          {/* Resultados simulados */}
          <div className="r-sim-results">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f0eff8" }}>Escaños resultantes</span>
              <span style={{ fontSize: 11, color: "#7a7990" }}>Mayoría: <strong style={{ color: "#f59e0b" }}>{mayoriaAbs}</strong></span>
            </div>
            {simulatorStats.map(s => {
              const pctSeats = totalEscanos > 0 ? (s.escanos / totalEscanos) * 100 : 0;
              return (
                <div key={s.id} className="r-sim-row">
                  <div className="r-sim-dot" style={{ background: s.color }} />
                  <span className="r-sim-row-name">{s.nombre}</span>
                  <div className="r-sim-row-bar">
                    <div className="r-sim-row-fill" style={{ width: `${pctSeats}%`, background: s.color }} />
                    <div className="r-sim-row-majority" style={{ left: `${(mayoriaAbs / totalEscanos) * 100}%` }} />
                  </div>
                  <span className="r-sim-row-seats" style={{ color: s.color }}>{s.escanos}</span>
                  <span className="r-sim-row-pct">{s.porcentaje.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Results() {
  const [location, setLocation] = useLocation();

  // URL Tab handling
  const getTabFromUrl = useCallback((): TabKey => {
    const p = window.location.pathname;
    if (p.includes("/mapa-hemiciclo")) return "mapa-hemiciclo";
    if (p.includes("/encuestadoras")) return "encuestadoras-externas";
    if (p.includes("/ccaa")) return "ccaa";
    if (p.includes("/provincias")) return "provincias";
    if (p.includes("/comparacion-ccaa")) return "comparacion-ccaa";
    if (p.includes("/youth")) return "youth";
    if (p.includes("/asoc-juv-mapa-hemiciclo")) return "asoc-juv-mapa-hemiciclo";
    if (p.includes("/leaders")) return "leaders";
    if (p.includes("/tendencias")) return "tendencias";
    if (p.includes("/lideres-preferidos")) return "lideres-preferidos";
    if (p.includes("/lideres-partidos")) return "lideres-partidos";
    if (p.includes("/preguntas-varias")) return "preguntas-varias";
    if (p.includes("/analisis-avanzado")) return "analisis-avanzado";
    if (p.includes("/contexto-historico")) return "contexto-historico";
    if (p.includes("/noche-electoral")) return "noche-electoral";
    if (p.includes("/primarias")) return "primarias";
    if (p.includes("/crisis-ceuta")) return "crisis-ceuta";
    return "general";
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromUrl);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const routes: Record<TabKey, string> = {
      general: "/results",
      "mapa-hemiciclo": "/results/mapa-hemiciclo",
      "encuestadoras-externas": "/results/encuestadoras",
      ccaa: "/results/ccaa",
      provincias: "/results/provincias",
      "comparacion-ccaa": "/results/comparacion-ccaa",
      youth: "/results/youth",
      "asoc-juv-mapa-hemiciclo": "/results/asoc-juv-mapa-hemiciclo",
      leaders: "/results/leaders",
      tendencias: "/results/tendencias",
      "lideres-preferidos": "/results/lideres-preferidos",
      "lideres-partidos": "/results/lideres-partidos",
      "preguntas-varias": "/results/preguntas-varias",
      "analisis-avanzado": "/results/analisis-avanzado",
      "contexto-historico": "/results/contexto-historico",
      "noche-electoral": "/results/noche-electoral",
      primarias: "/results/primarias",
      "crisis-ceuta": "/results/crisis-ceuta",
    };
    if (routes[tab]) setLocation(routes[tab]);
  }, [setLocation]);

  // General State
  const [loading, setLoading] = useState(true);
  const [totalRespuestas, setTotalRespuestas] = useState(0);
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [generalPartyMap, setGeneralPartyMap] = useState<Record<string, PartyMeta>>({});
  const [youthPartyMap, setYouthPartyMap] = useState<Record<string, PartyMeta>>({});
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [lideresPreferidos, setLideresPreferidos] = useState<LiderPreferido[]>([]);
  const [rankingLideres, setRankingLideres] = useState<RankingLiderPartido[]>([]);
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [votosJuvenilesPorProvincia, setVotosJuvenilesPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [partyEdadesMap, setPartyEdadesMap] = useState<Record<string, number>>({});
  const [nocheElectoralData, setNocheElectoralData] = useState<NocheElectoralRow[]>([]);

  // Nuevas tablas: BarómetroBC y MediaEncuestas
  const [barometroSeats, setBarometroSeats] = useState<Record<string, string>>({});
  const [mediaEncuestasSeats, setMediaEncuestasSeats] = useState<Record<string, string>>({});

  // Advanced analysis states
  const [coherenciaRows, setCoherenciaRows] = useState<any[]>([]);
  const [flujosRows, setFlujosRows] = useState<any[]>([]);
  const [ideologiaRows, setIdeologiaRows] = useState<any[]>([]);
  const [correlacionRows, setCorrelacionRows] = useState<any[]>([]);
  const [historicoRows, setHistoricoRows] = useState<any[]>([]);

  // Modals & UI Controls
  const [sortBy, setSortBy] = useState<"escanos" | "votos" | "porcentaje">("escanos");
  const [selectedPartyModal, setSelectedPartyModal] = useState<PartyStats | null>(null);
  const [showInfografiaModal, setShowInfografiaModal] = useState(false);
  const [showGovModal, setShowGovModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [logoB64, setLogoB64] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamic Party Config Hook
  // ✅ Protegido contra retornos null
const { partyConfigs = [], loading: syncLoading = true } = usePartySync() || {};

  useEffect(() => {
    fetch("/logo-presidencia-blanco.png").then(r => r.blob()).then(blob => {
      const reader = new FileReader();
      reader.onload = () => setLogoB64(reader.result as string);
      reader.readAsDataURL(blob);
    }).catch(() => {});
  }, []);

  // Main Data Loading
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch BarómetroBC and MediaEncuestas
        const [baroRes, mediaRes] = await Promise.all([
          supabase.from("BarómetroBC").select("partido, escaños"),
          supabase.from("MediaEncuestas").select("partido, escaños")
        ]);

        if (baroRes.data) {
          const bMap: Record<string, string> = {};
          baroRes.data.forEach((r: any) => { if (r.partido) bMap[r.partido] = r.escaños || "0"; });
          setBarometroSeats(bMap);
        }

        if (mediaRes.data) {
          const mMap: Record<string, string> = {};
          mediaRes.data.forEach((r: any) => { if (r.partido) mMap[r.partido] = r.escaños || "0"; });
          setMediaEncuestasSeats(mMap);
        }

        // Fetch configurations
        const { data: configData } = await supabase.from("party_configuration").select("*");
        const gMap: Record<string, PartyMeta> = {};
        const yMap: Record<string, PartyMeta> = {};

        if (configData) {
          configData.forEach((c: any) => {
            const meta = { key: c.party_key, name: c.display_name, color: c.color, logo: c.logo_url };
            if (c.election_type === "generales") gMap[c.party_key] = meta;
            else if (c.election_type === "juveniles") yMap[c.party_key] = meta;
          });
          setRuntimePartyConfig(configData);
        }
        setGeneralPartyMap(gMap);
        setYouthPartyMap(yMap);

        // Fetch Raw Responses
        const { data: respData, count } = await supabase
          .from("respuestas")
          .select("*", { count: "exact" });

        setTotalRespuestas(count || 0);

        if (respData) {
          // Process Votes General & Youth
          const gVotes: Record<string, number> = {};
          const yVotes: Record<string, number> = {};
          const provGVotes: Record<string, Record<string, number>> = {};
          const provYVotes: Record<string, Record<string, number>> = {};
          const provMetrics: Record<string, { totalEdad: number; totalIdeo: number; count: number }> = {};
          const partyEdades: Record<string, { totalEdad: number; count: number }> = {};

          respData.forEach((r: any) => {
            const gParty = r.voto_generales;
            const yParty = r.voto_juvenil;
            const prov = r.provincia;
            const edad = r.edad ? Number(r.edad) : null;
            const ideo = r.ideologia ? Number(r.ideologia) : null;

            if (gParty) {
              gVotes[gParty] = (gVotes[gParty] || 0) + 1;
              if (prov) {
                if (!provGVotes[prov]) provGVotes[prov] = {};
                provGVotes[prov][gParty] = (provGVotes[prov][gParty] || 0) + 1;
              }
              if (edad) {
                if (!partyEdades[gParty]) partyEdades[gParty] = { totalEdad: 0, count: 0 };
                partyEdades[gParty].totalEdad += edad;
                partyEdades[gParty].count += 1;
              }
            }

            if (yParty) {
              yVotes[yParty] = (yVotes[yParty] || 0) + 1;
              if (prov) {
                if (!provYVotes[prov]) provYVotes[prov] = {};
                provYVotes[prov][yParty] = (provYVotes[prov][yParty] || 0) + 1;
              }
            }

            if (prov) {
              if (!provMetrics[prov]) provMetrics[prov] = { totalEdad: 0, totalIdeo: 0, count: 0 };
              if (edad) provMetrics[prov].totalEdad += edad;
              if (ideo) provMetrics[prov].totalIdeo += ideo;
              provMetrics[prov].count += 1;
            }
          });

          setVotosPorProvincia(provGVotes);
          setVotosJuvenilesPorProvincia(provYVotes);

          // Calculate D'Hondt Seats
          const gSeatsProv = calcularEscanosGeneralesPorProvincia(provGVotes);
          const ySeatsProv = calcularEscanosJuvenilesPorProvincia(provYVotes);

          const gSeatsTotal: Record<string, number> = {};
          Object.values(gSeatsProv).forEach(pe => {
            Object.entries(pe).forEach(([p, s]) => { gSeatsTotal[p] = (gSeatsTotal[p] || 0) + s; });
          });

          const ySeatsTotal: Record<string, number> = {};
          Object.values(ySeatsProv).forEach(pe => {
            Object.entries(pe).forEach(([p, s]) => { ySeatsTotal[p] = (ySeatsTotal[p] || 0) + s; });
          });

          // Party Names and Logos mapping
          const gNames: Record<string, string> = {}; const gLogos: Record<string, string> = {};
          Object.entries(gMap).forEach(([k, v]) => { gNames[k] = v.name; gLogos[k] = v.logo; });

          const yNames: Record<string, string> = {}; const yLogos: Record<string, string> = {};
          Object.entries(yMap).forEach(([k, v]) => { yNames[k] = v.name; yLogos[k] = v.logo; });

          const gStats = obtenerEstadisticas(gVotes, gSeatsTotal, gNames, gLogos)
            .map(s => ({ ...s, color: gMap[s.id]?.color || "#e8465a" }));

          const yStats = obtenerEstadisticas(yVotes, ySeatsTotal, yNames, yLogos)
            .map(s => ({ ...s, color: yMap[s.id]?.color || "#818cf8" }));

          setGeneralStats(gStats);
          setYouthStats(yStats);

          // Calculate Province Metrics
          const compiledProvMetrics: Record<string, { edad_promedio: number; ideologia_promedio: number }> = {};
          Object.entries(provMetrics).forEach(([prov, d]) => {
            if (d.count > 0) {
              compiledProvMetrics[prov] = {
                edad_promedio: Math.round((d.totalEdad / d.count) * 10) / 10,
                ideologia_promedio: Math.round((d.totalIdeo / d.count) * 10) / 10,
              };
            }
          });
          setProvinciaMetricsMap(compiledProvMetrics);

          // Calculate Party Average Ages
          const compiledPartyEdades: Record<string, number> = {};
          Object.entries(partyEdades).forEach(([p, d]) => {
            if (d.count > 0) compiledPartyEdades[p] = Math.round((d.totalEdad / d.count) * 10) / 10;
          });
          setPartyEdadesMap(compiledPartyEdades);

          // Calculate Leader Ratings
          const leaderFields = [
            { field: "val_feijoo", name: "Alberto Núñez Feijóo" },
            { field: "val_sanchez", name: "Pedro Sánchez" },
            { field: "val_abascal", name: "Santiago Abascal" },
            { field: "val_alvise", name: "Alvise Pérez" },
            { field: "val_yolanda_diaz", name: "Yolanda Díaz" },
            { field: "val_irene_montero", name: "Irene Montero" },
            { field: "val_ayuso", name: "Isabel Díaz Ayuso" },
            { field: "val_buxade", name: "Jorge Buxadé" },
          ];

          const ratingsCompiled: LeaderRating[] = leaderFields.map(lf => {
            let sum = 0; let count_ = 0;
            respData.forEach((r: any) => {
              const val = r[lf.field];
              if (val != null && !isNaN(val)) { sum += Number(val); count_++; }
            });
            return {
              name: lf.name,
              fieldName: lf.field,
              average: count_ > 0 ? Math.round((sum / count_) * 10) / 10 : 0,
              count: count_,
            };
          }).sort((a, b) => b.average - a.average);

          setLeaderRatings(ratingsCompiled);
        }

        // Fetch Election Night
        const { data: neData } = await supabase.from("noche_electoral").select("*").order("election_date", { ascending: false });
        if (neData) setNocheElectoralData(neData);

        // Fetch Views for Advanced Analysis
        const [coh, flu, ide, cor, hist] = await Promise.all([
          supabase.from("v_coherencia_voto").select("*"),
          supabase.from("v_flujos_voto_sankey").select("*"),
          supabase.from("v_ideologia_por_partido").select("*"),
          supabase.from("v_correlacion_lideres").select("*"),
          supabase.from("v_tendencia_temporal_voto").select("*"),
        ]);
        if (coh.data) setCoherenciaRows(coh.data);
        if (flu.data) setFlujosRows(flu.data);
        if (ide.data) setIdeologiaRows(ide.data);
        if (cor.data) setCorrelacionRows(cor.data);
        if (hist.data) setHistoricoRows(hist.data);

      } catch (e) {
        console.error("Error fetching results data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sorted Party Stats
  const sortedGeneralStats = useMemo(() => {
    return [...generalStats].sort((a, b) => {
      if (sortBy === "escanos") return b.escanos - a.escanos || b.votos - a.votos;
      if (sortBy === "votos") return b.votos - a.votos;
      return b.porcentaje - a.porcentaje;
    });
  }, [generalStats, sortBy]);

  // PDF Export Trigger
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDFWithMetrics("resultados-generales", {
        totalRespuestas,
        generalStats,
        leaderRatings,
      });
    } catch (e) {
      console.error("Error generating PDF:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading || syncLoading) {
    return (
      <div className="r-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{RESULTS_CSS}</style>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="r-root">
      <style>{RESULTS_CSS}</style>

      {/* ── HEADER ── */}
      <header className="r-header">
        <div className="r-brand">
          <img src="/logo-oficial.png" alt="Logo" onError={e => (e.currentTarget.style.display = "none")} />
          <div>
            <div className="r-brand-title">Barómetro BC</div>
            <div className="r-brand-sub">Resultados e Inteligencia Electoral</div>
          </div>
        </div>

        <div className="r-header-actions">
          <button className="r-hbtn r-hbtn-infog" onClick={() => setShowInfografiaModal(true)}>
            <Image size={13} />
            <span>Infografía</span>
          </button>
          <button className="r-hbtn r-hbtn-gov" onClick={() => setShowGovModal(true)}>
            <Building2 size={13} />
            <span>Constructor Gobierno</span>
          </button>
          <button className="r-hbtn r-hbtn-pdf" onClick={handleExportPDF} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Exportar PDF</span>
          </button>
          <FollowUsMenu />
        </div>
      </header>

      {/* ── NAVIGATION ── */}
      <ResultsNavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── MAIN CONTENT ── */}
      <main className="r-main" ref={contentRef}>
        <div className="r-space">

          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <>
              {/* Quick Stats Grid */}
              <div className="r-quickstats">
                <div className="r-stat-card">
                  <div className="r-stat-label">Total Muestra</div>
                  <div className="r-stat-value accent">{totalRespuestas.toLocaleString("es-ES")}</div>
                  <div className="r-stat-suffix">Respuestas válidas</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Partido Líder</div>
                  <div className="r-stat-value">{sortedGeneralStats[0]?.nombre || "—"}</div>
                  <div className="r-stat-suffix">{sortedGeneralStats[0]?.escanos || 0} escaños proyectados</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Mayoría Absoluta</div>
                  <div className="r-stat-value">176</div>
                  <div className="r-stat-suffix">Escaños en Congreso</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Líder Mejor Valorado</div>
                  <div className="r-stat-value">{leaderRatings[0]?.name.split(" ").slice(-1)[0] || "—"}</div>
                  <div className="r-stat-suffix">{leaderRatings[0]?.average.toFixed(1) || 0} / 10 puntos</div>
                </div>
                <div className="r-stat-card">
                  <div className="r-stat-label">Estimación de abstención</div>
                  <div className="r-stat-value" style={{ color: "#f59e0b" }}>38-42%</div>
                  <div className="r-stat-suffix">Participación estimada: ~60%</div>
                </div>
              </div>

              {/* General Results Section */}
              <div className="r-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  <div>
                    <h2 className="r-section-title">Resultados Generales</h2>
                    <p className="r-section-sub" style={{ margin: 0 }}>Proyección de escaños por Ley D'Hondt provincial</p>
                  </div>

                  {/* Sort Controls */}
                  <div className="r-sort-bar">
                    <span style={{ fontSize: 11, color: "#7a7990" }}>Ordenar por:</span>
                    <button className={`r-sort-btn${sortBy === "escanos" ? " active" : ""}`} onClick={() => setSortBy("escanos")}>Escaños</button>
                    <button className={`r-sort-btn${sortBy === "votos" ? " active" : ""}`} onClick={() => setSortBy("votos")}>Votos</button>
                    <button className={`r-sort-btn${sortBy === "porcentaje" ? " active" : ""}`} onClick={() => setSortBy("porcentaje")}>% Voto</button>
                  </div>
                </div>

                {/* Party Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {sortedGeneralStats.map(party => {
                    const partyAge = partyEdadesMap[party.id];
                    const baroEscanos = barometroSeats[party.id] || "0";
                    const mediaEscanos = mediaEncuestasSeats[party.id] || "0";

                    return (
                      <div
                        key={party.id}
                        className="r-party-card"
                        style={{ "--party-accent": party.color } as React.CSSProperties}
                        onClick={() => setSelectedPartyModal(party)}
                      >
                        <div className="r-party-card-top">
                          <div className="r-party-logo-wrap" style={{ background: `${party.color}20` }}>
                            <PartyLogoImg src={party.logo} name={party.nombre} color={party.color} size={30} />
                          </div>
                          <div className="r-party-info">
                            <div className="r-party-name">{party.nombre}</div>
                            <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                            {partyAge && <div className="r-party-edad"><Users size={10} />Edad media: {partyAge} años</div>}
                          </div>
                          <div className="r-party-seats-group">
                            <div className="r-party-seats">
                              <div className="r-party-seats-num" style={{ color: party.color }}>{party.escanos}</div>
                              <div className="r-party-seats-label">Escaños</div>
                            </div>
                            <div className="r-party-seats-box">
                              <div style={{ fontSize: 8, color: "#7a7990", fontWeight: 700 }}>#BarómetroBC</div>
                              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#f0eff8" }}>{baroEscanos}</div>
                            </div>
                            <div className="r-party-seats-box">
                              <div style={{ fontSize: 8, color: "#7a7990", fontWeight: 700 }}>Media Encuestas</div>
                              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: "#f0eff8" }}>{mediaEscanos}</div>
                            </div>
                          </div>
                        </div>

                        <div className="r-party-bar-wrap">
                          <div className="r-party-bar-labels">
                            <span>Porcentaje de voto</span>
                            <strong>{party.porcentaje.toFixed(1)}%</strong>
                          </div>
                          <div className="r-party-bar-track">
                            <div className="r-party-bar-fill" style={{ width: `${Math.min(100, party.porcentaje * 2.5)}%`, background: party.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pactometer Interactive Section */}
              <div className="r-section">
                <PactometerInteractive parties={generalStats} />
              </div>

              {/* Simulator Section */}
              <SimuladorElectoral
                generalStats={generalStats}
                generalPartyMap={generalPartyMap}
                votosPorProvincia={votosPorProvincia}
                provinciaMetricsMap={provinciaMetricsMap}
              />
            </>
          )}

          {/* TAB: MAPA Y HEMICICLO */}
          {activeTab === "mapa-hemiciclo" && (
            <div className="r-space">
              <div className="r-section">
                <div className="r-section-title">Hemiciclo del Congreso</div>
                <p className="r-section-sub">Distribución de 350 escaños de las Elecciones Generales</p>
                <CongressHemicycle parties={generalStats} />
              </div>
              <div className="r-section">
                <div className="r-section-title">Mapa Provincial Generales</div>
                <p className="r-section-sub">Partido más votado por provincia</p>
                <SpainMapRealistic votosPorProvincia={votosPorProvincia} partyMap={generalPartyMap} />
              </div>
            </div>
          )}

          {/* TAB: ENCUESTADORAS EXTERNAS */}
          {activeTab === "encuestadoras-externas" && (
            <EncuestadorasComparativa />
          )}

          {/* TAB: CCAA */}
          {activeTab === "ccaa" && (
            <CCAAResltsSection />
          )}

          {/* TAB: PROVINCIAS */}
          {activeTab === "provincias" && (
            <ProvincesResultsSection votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} partyMap={generalPartyMap} />
          )}

          {/* TAB: COMPARAR CCAA */}
          {activeTab === "comparacion-ccaa" && (
            <CCAAComparisonSection />
          )}

          {/* TAB: JUVENTUD (YOUTH) */}
          {activeTab === "youth" && (
            <div className="r-section">
              <div className="r-section-title">Asociaciones Juveniles</div>
              <p className="r-section-sub">Resultados de votación entre organizaciones juveniles</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {youthStats.map(party => (
                  <div key={party.id} className="r-party-card" style={{ "--party-accent": party.color } as React.CSSProperties}>
                    <div className="r-party-card-top">
                      <div className="r-party-logo-wrap" style={{ background: `${party.color}20` }}>
                        <PartyLogoImg src={party.logo} name={party.nombre} color={party.color} size={30} />
                      </div>
                      <div className="r-party-info">
                        <div className="r-party-name">{party.nombre}</div>
                        <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                      </div>
                      <div className="r-party-seats">
                        <div className="r-party-seats-num" style={{ color: party.color }}>{party.escanos}</div>
                        <div className="r-party-seats-label">Escaños</div>
                      </div>
                    </div>
                    <div className="r-party-bar-wrap">
                      <div className="r-party-bar-labels">
                        <span>Porcentaje</span>
                        <strong>{party.porcentaje.toFixed(1)}%</strong>
                      </div>
                      <div className="r-party-bar-track">
                        <div className="r-party-bar-fill" style={{ width: `${Math.min(100, party.porcentaje * 2.5)}%`, background: party.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MAPA JUVENIL */}
          {activeTab === "asoc-juv-mapa-hemiciclo" && (
            <div className="r-space">
              <div className="r-section">
                <div className="r-section-title">Hemiciclo Juvenil</div>
                <p className="r-section-sub">Representación de Organizaciones Juveniles</p>
                <CongressHemicycle parties={youthStats} />
              </div>
              <div className="r-section">
                <div className="r-section-title">Mapa Territorial Juvenil</div>
                <SpainMapRealistic votosPorProvincia={votosJuvenilesPorProvincia} partyMap={youthPartyMap} />
              </div>
            </div>
          )}

          {/* TAB: VALORACION LIDERES */}
          {activeTab === "leaders" && (
            <div className="r-space">
              <div className="r-section">
                <div className="r-section-title">Valoración de Líderes Políticos</div>
                <p className="r-section-sub">Puntuación media sobre 10 atribuida por los participantes</p>
                <div className="r-leader-grid">
                  {leaderRatings.map(l => (
                    <div key={l.fieldName} className="r-leader-card">
                      <div className="r-leader-name">{l.name}</div>
                      <div className="r-leader-score">{l.average.toFixed(1)}</div>
                      <div className="r-leader-bar-track">
                        <div className="r-leader-bar-fill" style={{ width: `${l.average * 10}%`, background: l.average >= 5 ? "#e8465a" : "#7a7990" }} />
                      </div>
                      <div className="r-leader-count">{l.count} valoraciones</div>
                    </div>
                  ))}
                </div>
              </div>
              <LeadersByPartyAvg leaderRatings={leaderRatings} generalStats={generalStats} generalPartyMap={generalPartyMap} />
            </div>
          )}

          {/* TAB: LIDERES POR PARTIDO */}
          {activeTab === "lideres-partidos" && (
            <LideresDePartidosSection partyMeta={generalPartyMap} />
          )}

          {/* TAB: PREFERIDOS */}
          {activeTab === "lideres-preferidos" && (
            <div className="r-section">
              <div className="r-section-title">Líder Preferido para Gobernar</div>
              <p className="r-section-sub">Preferencia directa de los encuestados</p>
              <LeadersResultsChart />
            </div>
          )}

          {/* TAB: TENDENCIAS */}
          {activeTab === "tendencias" && (
            <div className="r-section">
              <div className="r-section-title">Evolución y Tendencias</div>
              <p className="r-section-sub">Histórico de estimación de voto en el tiempo</p>
              <TrendenciesChart />
            </div>
          )}

          {/* TAB: CONTEXTO HISTORICO */}
          {activeTab === "contexto-historico" && (
            <div className="r-section">
              <div className="r-section-title">Contexto Histórico Electoral</div>
              <p className="r-section-sub">Comparativa con elecciones pasadas en España</p>
              <div style={{ fontSize: 13, color: "#7a7990", lineHeight: 1.6 }}>
                En esta sección se compara la evolución histórica del voto en elecciones generales desde 1977 hasta las últimas generales de 2023, analizando la volatilidad de los bloques ideológicos.
              </div>
            </div>
          )}

          {/* TAB: PREGUNTAS VARIAS */}
          {activeTab === "preguntas-varias" && (
            <PreguntasVariasSection />
          )}

          {/* TAB: CRISIS CEUTA */}
          {activeTab === "crisis-ceuta" && (
            <CrisisCeutaSection />
          )}

          {/* TAB: PRIMARIAS */}
          {activeTab === "primarias" && (
            <PrimariasResultsSection />
          )}

          {/* TAB: ANALISIS AVANZADO */}
          {activeTab === "analisis-avanzado" && (
            <AnalisisAvanzadoSection
              coherenciaRows={coherenciaRows}
              flujosRows={flujosRows}
              ideologiaRows={ideologiaRows}
              correlacionRows={correlacionRows}
              historicoRows={historicoRows}
            />
          )}

          {/* ── COMENTARIOS ── */}
          <div className="r-section">
            <CommentsSection />
          </div>

        </div>
      </main>

      {/* ── MODALS ── */}
      {selectedPartyModal && (
        <PartyStatsModal party={selectedPartyModal} onClose={() => setSelectedPartyModal(null)} />
      )}

      {showInfografiaModal && (
        <InfografiaModal
          parties={generalStats}
          onClose={() => setShowInfografiaModal(false)}
          onGenerate={(type, party) => {
            alert(`Generando infografía de tipo "${type}"${party ? ` para ${party}` : ""}...`);
          }}
        />
      )}

      {showGovModal && (
        <GobiernoModal
          onClose={() => setShowGovModal(false)}
          leaders={EMBEDDED_LEADERS as any}
          partyMeta={generalPartyMap}
          logoPresidenciaB64={logoB64}
        />
      )}

      {showTransferModal && (
        <TransferenciaVotoModal onClose={() => setShowTransferModal(false)} />
      )}
    </div>
  );
}
