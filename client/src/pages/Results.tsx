// ═══════════════════════════════════════════════════════════════════════════
// Results.tsx — Versión corregida y mejorada
// Fixes: comentarios, logos partidos, simulador, gobierno, infografía, mobile
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Vote, Star, TrendingUp, X, Image, FileText, Award,
  Building2, Crown, UserCheck,
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

// ─── CSS ─────────────────────────────────────────────────────────────────────
const RESULTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@700;800&display=swap');

.r-root { min-height: 100vh; display: flex; flex-direction: column; background: #0a0a0f; color: #f0eff8; font-family: 'DM Sans', sans-serif; }
.r-header { position: sticky; top: 0; z-index: 60; height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: rgba(10,10,15,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.07); gap: 8px; }
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

/* Subnav */
.r-subnav { position: sticky; top: 58px; z-index: 50; background: rgba(17,17,24,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); overflow-x: auto; }
.r-subnav::-webkit-scrollbar { height: 3px; }
.r-subnav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.r-subnav-inner { display: flex; align-items: stretch; padding: 0 16px; min-width: max-content; }
.r-nav-group { position: relative; display: flex; align-items: center; }
.r-nav-group-btn { display: flex; align-items: center; gap: 6px; padding: 12px 14px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; color: #7a7990; transition: all 0.18s; white-space: nowrap; }
.r-nav-group-btn:hover { color: #f0eff8; }
.r-nav-group-btn.active { color: #e8465a; border-bottom-color: #e8465a; }
.r-dropdown { position: absolute; top: 100%; left: 0; min-width: 200px; z-index: 100; background: #18181f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; animation: dropIn 0.15s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.5); margin-top: 2px; }
@keyframes dropIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
.r-dropdown-item { display: block; width: 100%; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; background: none; border: none; color: #7a7990; border-left: 2px solid transparent; transition: all 0.15s; }
.r-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #f0eff8; }
.r-dropdown-item.active { color: #e8465a; border-left-color: #e8465a; background: rgba(232,70,90,0.06); font-weight: 700; }

/* Main */
.r-main { flex: 1; padding: 24px 20px 60px; max-width: 1180px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.r-space { display: flex; flex-direction: column; gap: 18px; }

/* Quick stats */
.r-quickstats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.r-stat-card { background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 14px; text-align: center; }
.r-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #7a7990; margin-bottom: 4px; }
.r-stat-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: #f0eff8; line-height: 1; }
.r-stat-value.accent { color: #e8465a; }
.r-stat-suffix { font-size: 10px; color: #7a7990; margin-top: 2px; }

/* Sort bar */
.r-sort-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.r-sort-btn { padding: 5px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; transition: all 0.18s; }
.r-sort-btn.active { background: #e8465a; border-color: #e8465a; color: #fff; }
.r-sort-hint { margin-left: auto; font-size: 11px; color: #5a596a; }

/* Party cards */
.r-party-card { background: #111118; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; }
.r-party-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.r-party-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.r-party-logo-wrap { width: 40px; height: 40px; border-radius: 9px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.r-party-info { flex: 1; min-width: 0; }
.r-party-name { font-size: 13px; font-weight: 700; color: #f0eff8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-party-votes { font-size: 11px; color: #7a7990; margin-top: 1px; }
.r-party-edad { font-size: 10px; color: #c9a96e; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.r-party-seats { text-align: right; flex-shrink: 0; }
.r-party-seats-num { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; line-height: 1; }
.r-party-seats-label { font-size: 9px; color: #7a7990; }
.r-party-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
.r-party-bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: #5a596a; }
.r-party-bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.r-party-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s cubic-bezier(0.22,1,0.36,1); }

/* Section card */
.r-section { background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
.r-section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; color: #f0eff8; letter-spacing: -0.01em; margin: 0 0 4px; }
.r-section-sub { font-size: 12px; color: #7a7990; margin: 0 0 16px; }

/* Leader cards */
.r-leader-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.r-leader-card { background: #18181f; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 12px; text-align: center; transition: all 0.2s; }
.r-leader-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
.r-leader-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin: 0 auto 10px; display: block; }
.r-leader-img-placeholder { width: 72px; height: 72px; border-radius: 50%; background: #18181f; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #7a7990; margin: 0 auto 10px; }
.r-leader-name { font-size: 12px; font-weight: 700; color: #f0eff8; margin-bottom: 8px; line-height: 1.3; }
.r-leader-score { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #e8465a; line-height: 1; margin-bottom: 4px; }
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
.r-sim-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; color: #f0eff8; margin: 0 0 2px; }
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
.r-sim-row-seats { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 800; min-width: 28px; text-align: right; }
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
.r-infog-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #f0eff8; margin: 0 0 6px; }
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
`;

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

// ─── Government Builder Modal ─────────────────────────────────────────────────
function GobiernoModal({
  onClose, leaders, partyMeta, logoPresidenciaB64
}: {
  onClose: () => void;
  leaders: PartyLeader[];
  partyMeta: Record<string, PartyMeta>;
  logoPresidenciaB64: string;
}) {
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedLeader, setSelectedLeader] = useState("");
  const [ministerios, setMinisterios] = useState<Record<string, string>>(
    Object.fromEntries(MINISTERIOS.map(m => [m.id, ""]))
  );
  const [nombreGobierno, setNombreGobierno] = useState("Gobierno de España");
  const [generando, setGenerando] = useState(false);

  const partyLeaders = leaders.filter(l => l.party_key === selectedParty);
  const partyKeys = Array.from(new Set(leaders.map(l => l.party_key)));

  const updateMin = (id: string, val: string) => {
    setMinisterios(prev => ({ ...prev, [id]: val }));
  };

  const generarInfografia = async () => {
    setGenerando(true);
    try {
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

      // Título gobierno
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'DM Sans', sans-serif";
      ctx.fillText(nombreGobierno, 400, 52);
      ctx.font = "16px 'DM Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long" }), 400, 78);

      // Divider
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(40, 110, 1520, 1);

      // Partido y presidente
      const pm = partyMeta[selectedParty];
      if (pm) {
        ctx.fillStyle = pm.color || "#e8465a";
        ctx.beginPath();
        ctx.roundRect(40, 130, 300, 60, 10);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'DM Sans', sans-serif";
        ctx.fillText(pm.name || selectedParty, 60, 155);
        ctx.font = "13px 'DM Sans', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(`Presidente: ${selectedLeader}`, 60, 178);
      }

      // Grid ministerios
      const cols = 4;
      const rows = Math.ceil(MINISTERIOS.length / cols);
      const boxW = 350;
      const boxH = 70;
      const startX = 40;
      const startY = 220;
      const gapX = 390;
      const gapY = 80;

      MINISTERIOS.forEach((min, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * gapX;
        const y = startY + row * gapY;
        const titular = ministerios[min.id] || "Sin asignar";

        // Box
        ctx.fillStyle = titular !== "Sin asignar" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)";
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH - 6, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = titular !== "Sin asignar" ? (pm?.color || "#e8465a") + "40" : "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "9px monospace";
        ctx.fillText(min.titulo.toUpperCase(), x + 10, y + 18);
        ctx.fillStyle = "#f0eff8";
        ctx.font = "bold 13px 'DM Sans', sans-serif";
        ctx.fillText(titular.length > 38 ? titular.slice(0, 38) + "…" : titular, x + 10, y + 40);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "16px serif";
        ctx.fillText(min.icon, x + boxW - 28, y + 38);
      });

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
      <div className="r-gov-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="r-infog-title">🏛️ Constructor de Gobierno</div>
            <div className="r-infog-sub">Asigna ministros y genera una infografía</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7a7990", cursor: "pointer" }}><X size={18} /></button>
        </div>

        {/* Partido y presidente */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Partido gobernante</label>
            <select className="r-select" value={selectedParty} onChange={e => { setSelectedParty(e.target.value); setSelectedLeader(""); }}>
              <option value="">Seleccionar partido…</option>
              {partyKeys.map(pk => <option key={pk} value={pk}>{partyMeta[pk]?.name || pk}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Presidente del Gobierno</label>
            <select className="r-select" value={selectedLeader} onChange={e => setSelectedLeader(e.target.value)} disabled={!selectedParty}>
              <option value="">Seleccionar líder…</option>
              {partyLeaders.map(l => <option key={l.id} value={l.leader_name}>{l.leader_name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#7a7990", display: "block", marginBottom: 6 }}>Nombre del Gobierno</label>
          <input className="r-gov-ministry-input" style={{ borderRadius: 9, padding: "9px 12px", fontSize: 13 }} value={nombreGobierno} onChange={e => setNombreGobierno(e.target.value)} placeholder="Gobierno de España" />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#7a7990", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ministerios</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
          {MINISTERIOS.map(min => (
            <div key={min.id} className="r-gov-ministry">
              <div className="r-gov-ministry-title">{min.icon} {min.titulo}</div>
              <input
                className="r-gov-ministry-input"
                placeholder="Nombre del ministro/a…"
                value={ministerios[min.id] || ""}
                onChange={e => updateMin(min.id, e.target.value)}
              />
            </div>
          ))}
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
        </div>
      </div>
    </div>
  );
}

// ─── InfografiaModal mejorada ─────────────────────────────────────────────────
function InfografiaModal({ parties, onClose, onGenerate }: {
  parties: PartyStats[]; onClose: () => void;
  onGenerate: (type: "general" | "party" | "other", party?: string) => void;
}) {
  const [type, setType] = useState<"general" | "party" | "other">("general");
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
            { t: "other" as const, icon: <Image size={20} color="#22c55e" />, bg: "rgba(34,197,94,0.15)", label: "Otros", desc: "Líderes y demografía" },
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
// ─────────────────────────────────────────────────────────────
// UTIL
// ─────────────────────────────────────────────────────────────
const normalizeKey = (k?: string) =>
  (k || "").trim().toLowerCase();

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import { Building2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PartyMeta {
  color: string;
  name: string;
  logo: string;
  key?: string;
}

interface PartyLeader {
  id: string;
  party_key: string;
  leader_name: string;
  photo_url: string | null;
  is_active: boolean;
  display_name: string;
  color: string;
  logo_url: string;
}

interface LiderPreferido {
  id: string;
  partido: string;
  lider_preferido: string;
  votos: number;
  porcentaje: number;
  photo_url: string | null;
  color: string;
  display_name: string;
  logo_url: string;
}

interface LeaderRating {
  leader_name: string;
  avg_rating: number;
  field_name: string;
}

interface PartyStats {
  nombre: string;
  votos: number;
  porcentaje: number;
}

interface ChartDataItem {
  name: string;
  votos: number;
  porcentaje: number;
}

// Mapeo de campos de valoración a nombres de líderes
const LEADER_MAP: Record<string, { name: string; field: string }> = {
  val_feijoo: { name: "Alberto Feijóo", field: "val_feijoo" },
  val_sanchez: { name: "Pedro Sánchez", field: "val_sanchez" },
  val_abascal: { name: "Santiago Abascal", field: "val_abascal" },
  val_alvise: { name: "Álvise Pérez", field: "val_alvise" },
  val_yolanda_diaz: { name: "Yolanda Díaz", field: "val_yolanda_diaz" },
  val_irene_montero: { name: "Irene Montero", field: "val_irene_montero" },
  val_ayuso: { name: "Isabel Díaz Ayuso", field: "val_ayuso" },
  val_buxade: { name: "Jorge Buxadé", field: "val_buxade" },
};

// ─── Componentes Helper ───────────────────────────────────────────────────────

interface PartyLogoImgProps {
  src: string | null | undefined;
  name: string;
  color: string;
  size: number;
}

function PartyLogoImg({ src, name, color, size }: PartyLogoImgProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: `2px solid ${color}`,
      }}
      onError={() => setHasError(true)}
    />
  );
}

interface GobiernoModalProps {
  onClose: () => void;
  leaders: PartyLeader[];
  partyMeta: Record<string, PartyMeta>;
  logoPresidenciaB64: string;
}

function GobiernoModal({
  onClose,
  leaders,
  partyMeta,
  logoPresidenciaB64,
}: GobiernoModalProps) {
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
          background: "#18181f",
          borderRadius: 12,
          padding: 24,
          maxWidth: 700,
          maxHeight: "80vh",
          overflow: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#f0eff8", marginBottom: 16, fontSize: 20, fontWeight: 700 }}>
          Constructor de Gobierno
        </h3>
        <p style={{ color: "#7a7990", marginBottom: 20, fontSize: 14 }}>
          Selecciona ministros de diferentes partidos para construir tu gobierno ideal.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {leaders.map((leader) => {
            const pm = partyMeta[leader.party_key];
            const color = pm?.color || leader.color;
            return (
              <div
                key={leader.id}
                style={{
                  padding: 12,
                  border: `1px solid ${color}40`,
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${color}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <PartyLogoImg src={leader.photo_url} name={leader.leader_name} color={color} size={40} />
                  <div>
                    <div style={{ color: "#f0eff8", fontWeight: 700, fontSize: 12 }}>
                      {leader.leader_name}
                    </div>
                    <div style={{ color, fontSize: 10, fontWeight: 600 }}>{leader.display_name}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            color: "#f0eff8",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─── Líderes por partido ─────────────────────────────────────────────────────

interface LideresDePartidosSectionProps {
  partyMeta: Record<string, PartyMeta>;
}

export function LideresDePartidosSection({ partyMeta }: LideresDePartidosSectionProps) {
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [lideresPreferidos, setLideresPreferidos] = useState<LiderPreferido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"candidatos" | "gobierno">("candidatos");
  const [logoB64, setLogoB64] = useState("");
  const [showGobModal, setShowGobModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar logo presidencia
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/logo-presidencia-blanco.png");
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = () => setLogoB64(reader.result as string);
          reader.readAsDataURL(blob);
        }
      } catch (err) {
        console.warn("No se pudo cargar logo presidencia:", err);
      }
    };
    loadLogo();
  }, []);

  // Cargar datos principales
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargar líderes del partido
        const { data: leaderData, error: leaderError } = await supabase
          .from("party_leaders")
          .select(
            `id, party_key, leader_name, photo_url, is_active, 
             party_configuration(display_name, color, logo_url)`
          )
          .eq("is_active", true)
          .order("party_key");

        if (leaderError) throw leaderError;

        const mappedLeaders: PartyLeader[] = (leaderData || []).map((row: any) => ({
          id: row.id,
          party_key: row.party_key,
          leader_name: row.leader_name,
          photo_url: row.photo_url,
          is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#e8465a",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));

        setLeaders(mappedLeaders);

        // Cargar preferencias de líderes usando la vista
        const { data: prefData, error: prefError } = await supabase
          .from("ranking_lideres_por_partido")
          .select("partido, lider_preferido, total_votos, porcentaje");

        if (prefError) {
          console.warn("Error en vista ranking:", prefError);
          // Fallback: cargar directamente desde lideres_preferidos
          await loadPreferencesDirectly(mappedLeaders);
        } else {
          processPreferenceData(prefData || [], mappedLeaders);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(
          err instanceof Error ? err.message : "Error desconocido al cargar datos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Cargar preferencias directamente como fallback
  const loadPreferencesDirectly = async (mappedLeaders: PartyLeader[]) => {
    try {
      const { data: rawData, error } = await supabase
        .from("lideres_preferidos")
        .select("partido, lider_preferido")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const aggregated = aggregatePreferences(rawData || [], mappedLeaders);
      setLideresPreferidos(aggregated);
    } catch (err) {
      console.error("Error en fallback:", err);
    }
  };

  // Procesar datos de la vista
  const processPreferenceData = (
    data: any[],
    mappedLeaders: PartyLeader[]
  ) => {
    const result: LiderPreferido[] = data.map((row) => {
      const leaderInfo = mappedLeaders.find(
        (l) => l.party_key === row.partido && l.leader_name === row.lider_preferido
      );
      const partyInfo = mappedLeaders.find((l) => l.party_key === row.partido);

      return {
        id: `${row.partido}-${row.lider_preferido}`,
        partido: row.partido,
        lider_preferido: row.lider_preferido,
        votos: row.total_votos || 0,
        porcentaje: row.porcentaje || 0,
        photo_url: leaderInfo?.photo_url ?? null,
        color: partyInfo?.color ?? "#e8465a",
        display_name: partyInfo?.display_name ?? row.partido,
        logo_url: partyInfo?.logo_url ?? "",
      };
    });

    setLideresPreferidos(result);
  };

  // Agregar preferencias manualmente (si falla la vista)
  const aggregatePreferences = (rawData: any[], mappedLeaders: PartyLeader[]) => {
    const counts: Record<string, Record<string, number>> = {};

    rawData.forEach((r: any) => {
      if (!counts[r.partido]) counts[r.partido] = {};
      counts[r.partido][r.lider_preferido] =
        (counts[r.partido][r.lider_preferido] || 0) + 1;
    });

    const result: LiderPreferido[] = [];
    Object.entries(counts).forEach(([partido, leaders]) => {
      const total = Object.values(leaders).reduce((a, b) => a + b, 0);
      Object.entries(leaders).forEach(([lider, votos]) => {
        const leaderInfo = mappedLeaders.find(
          (l) => l.party_key === partido && l.leader_name === lider
        );
        const partyInfo = mappedLeaders.find((l) => l.party_key === partido);

        result.push({
          id: `${partido}-${lider}`,
          partido,
          lider_preferido: lider,
          votos,
          porcentaje: total > 0 ? (votos / total) * 100 : 0,
          photo_url: leaderInfo?.photo_url ?? null,
          color: partyInfo?.color ?? "#e8465a",
          display_name: partyInfo?.display_name ?? partido,
          logo_url: partyInfo?.logo_url ?? "",
        });
      });
    });

    return result;
  };

  // Memoización de datos por partido
  const byParty = useMemo(() => {
    const m: Record<string, PartyLeader[]> = {};
    leaders.forEach((l) => {
      if (!m[l.party_key]) m[l.party_key] = [];
      m[l.party_key].push(l);
    });
    return m;
  }, [leaders]);

  const prefByParty = useMemo(() => {
    const m: Record<string, LiderPreferido[]> = {};
    lideresPreferidos.forEach((l) => {
      if (!m[l.partido]) m[l.partido] = [];
      m[l.partido].push(l);
    });
    Object.keys(m).forEach((k) => m[k].sort((a, b) => b.votos - a.votos));
    return m;
  }, [lideresPreferidos]);

  if (loading) {
    return (
      <div className="r-loader">
        <div className="r-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          background: "#2a1f30",
          borderRadius: 8,
          color: "#e8465a",
          borderLeft: "4px solid #e8465a",
        }}
      >
        <strong>Error al cargar datos:</strong> {error}
      </div>
    );
  }

  const partyKeys = Object.keys(byParty);
  const allLeadersForGov = leaders;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#f0eff8",
            margin: 0,
          }}
        >
          Líderes por Partido
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="r-mode-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`r-mode-tab${subTab === "candidatos" ? " active" : ""}`}
              onClick={() => setSubTab("candidatos")}
            >
              Candidatos
            </button>
            <button
              className={`r-mode-tab${subTab === "gobierno" ? " active" : ""}`}
              onClick={() => setSubTab("gobierno")}
            >
              Constructor de Gobierno
            </button>
          </div>
          {selectedParty && subTab === "candidatos" && (
            <button className="r-subtab-btn" onClick={() => setSelectedParty(null)}>
              ← Ver todos
            </button>
          )}
        </div>
      </div>

      {/* Tab: Gobierno */}
      {subTab === "gobierno" && (
        <div className="r-section">
          <div className="r-section-title" style={{ marginBottom: 6 }}>
            🏛️ Constructor de Gobierno
          </div>
          <p className="r-section-sub">
            Selecciona un partido, asigna ministros y genera una infografía oficial
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {partyKeys.map((pk) => {
              const info = byParty[pk][0];
              const pm = partyMeta[pk] || {
                color: info.color,
                name: info.display_name,
                logo: info.logo_url,
              };
              return (
                <button
                  key={pk}
                  className="r-party-card"
                  style={{
                    borderColor:
                      selectedParty === pk ? pm.color : undefined,
                    background:
                      selectedParty === pk ? `${pm.color}12` : undefined,
                  }}
                  onClick={() => {
                    setSelectedParty(pk);
                    setShowGobModal(true);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PartyLogoImg
                      src={pm.logo || info.logo_url}
                      name={pm.name}
                      color={pm.color}
                      size={32}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#f0eff8",
                        }}
                      >
                        {pm.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#7a7990" }}>
                        {byParty[pk].length} candidato
                        {byParty[pk].length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button
              className="r-infog-generate"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                fontSize: 14,
              }}
              onClick={() => setShowGobModal(true)}
            >
              <Building2 size={16} />
              Abrir Constructor de Gobierno
            </button>
          </div>
        </div>
      )}

      {/* Tab: Candidatos */}
      {subTab === "candidatos" && (
        <>
          {!selectedParty && (
            <div className="r-subtab-bar">
              {partyKeys.map((pk) => {
                const info = byParty[pk][0];
                const pm = partyMeta[pk];
                const color = pm?.color || info.color;
                const name = pm?.name || info.display_name;
                const logo = pm?.logo || info.logo_url;
                const tot = (prefByParty[pk] || []).reduce(
                  (a, b) => a + b.votos,
                  0
                );

                return (
                  <button
                    key={pk}
                    className="r-subtab-btn"
                    onClick={() => setSelectedParty(pk)}
                    style={{
                      borderColor: `${color}40`,
                      color,
                      background: `${color}0d`,
                    }}
                  >
                    {logo && (
                      <img
                        src={logo}
                        alt={name}
                        style={{
                          width: 13,
                          height: 13,
                          objectFit: "contain",
                        }}
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    )}
                    {name}
                    {tot > 0 && (
                      <span style={{ fontSize: 10, opacity: 0.6 }}>
                        · {tot}v
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {(selectedParty ? [selectedParty] : partyKeys).map((partyKey) => {
            const partyLeaders = byParty[partyKey] || [];
            const partyPrefs = prefByParty[partyKey] || [];
            const info = partyLeaders[0];

            if (!info) return null;

            const pm = partyMeta[partyKey];
            const color = pm?.color || info.color;
            const name = pm?.name || info.display_name;
            const logo = pm?.logo || info.logo_url;
            const tot = partyPrefs.reduce((a, b) => a + b.votos, 0);

            const leadersWithVotes = partyLeaders
              .map((l) => {
                const pref = partyPrefs.find(
                  (p) => p.lider_preferido === l.leader_name
                );
                return {
                  ...l,
                  votos: pref?.votos ?? 0,
                  porcentaje: pref?.porcentaje ?? 0,
                };
              })
              .sort((a, b) => b.votos - a.votos);

            const extraPrefs = partyPrefs.filter(
              (p) =>
                !partyLeaders.some((l) => l.leader_name === p.lider_preferido)
            );

            const chartData: ChartDataItem[] = [
              ...leadersWithVotes
                .filter((l) => l.votos > 0)
                .map((l) => ({
                  name: l.leader_name,
                  votos: l.votos,
                  porcentaje: l.porcentaje,
                })),
              ...extraPrefs.map((e) => ({
                name: e.lider_preferido,
                votos: e.votos,
                porcentaje: e.porcentaje,
              })),
            ]
              .sort((a, b) => b.votos - a.votos)
              .slice(0, 10);

            return (
              <div
                key={partyKey}
                className="r-section"
                style={{ borderColor: `${color}25` }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    paddingBottom: 14,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <PartyLogoImg
                    src={logo}
                    name={name}
                    color={color}
                    size={34}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 16,
                        fontWeight: 800,
                        color,
                      }}
                    >
                      {name}
                    </div>
                    <div style={{ fontSize: 11, color: "#7a7990" }}>
                      {partyLeaders.length} candidato
                      {partyLeaders.length !== 1 ? "s" : ""} ·{" "}
                      {tot > 0 ? `${tot} votos` : "Sin votos aún"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  {leadersWithVotes.map((leader) => (
                    <div key={leader.id} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          position: "relative",
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: `2px solid ${color}`,
                          margin: "0 auto 8px",
                        }}
                      >
                        {leader.photo_url ? (
                          <img
                            src={leader.photo_url}
                            alt={leader.leader_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#fff",
                            }}
                          >
                            {leader.leader_name.charAt(0)}
                          </div>
                        )}
                        {leader.votos > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              background: color,
                              color: "#fff",
                              fontSize: 8,
                              fontWeight: 800,
                              padding: "1px 3px",
                              borderRadius: 100,
                            }}
                          >
                            {leader.votos}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#f0eff8",
                          marginBottom: 4,
                          lineHeight: 1.3,
                        }}
                      >
                        {leader.leader_name}
                      </div>
                      {leader.votos > 0 ? (
                        <>
                          <div
                            style={{
                              height: 3,
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: 2,
                              overflow: "hidden",
                              marginBottom: 2,
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${leader.porcentaje}%`,
                                background: color,
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 10, color: "#7a7990" }}>
                            {leader.porcentaje.toFixed(1)}%
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 10, color: "#5a596a" }}>
                          Sin votos
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {chartData.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#f0eff8",
                        marginBottom: 10,
                      }}
                    >
                      Distribución de preferencias
                    </div>
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(80, chartData.length * 32)}
                    >
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 8, right: 44, top: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.04)"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          stroke="rgba(255,255,255,0.15)"
                          fontSize={10}
                          tick={{ fill: "#7a7990" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="transparent"
                          fontSize={10}
                          width={110}
                          tick={{ fill: "#c0bfd8" }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#18181f",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 8,
                            fontSize: 11,
                          }}
                          formatter={(v: any, _: any, p: any) => [
                            `${v} votos (${p.payload.porcentaje?.toFixed(1)}%)`,
                            "Preferencia",
                          ]}
                        />
                        <Bar
                          dataKey="votos"
                          radius={[0, 5, 5, 0]}
                          label={{
                            position: "right",
                            fontSize: 10,
                            fill: "#7a7990",
                            formatter: (v: number) => (v > 0 ? v : ""),
                          }}
                        >
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={color}
                              fillOpacity={Math.max(0.4, 0.9 - i * 0.07)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {extraPrefs.length > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 9,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#5a596a",
                            fontWeight: 700,
                            marginBottom: 6,
                          }}
                        >
                          Otros mencionados:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {extraPrefs.map((ep) => (
                            <span
                              key={ep.lider_preferido}
                              style={{
                                fontSize: 10,
                                padding: "2px 9px",
                                borderRadius: 100,
                                background: `${color}12`,
                                border: `1px solid ${color}35`,
                                color,
                              }}
                            >
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
        />
      )}
    </div>
  );
}

// ─── Valoraciones por partido ────────────────────────────────────────────────

interface LeadersByPartyAvgProps {
  leaderRatings: LeaderRating[];
  generalStats: PartyStats[];
  generalPartyMap: Record<string, PartyMeta>;
}

export function LeadersByPartyAvg({
  leaderRatings,
  generalStats,
  generalPartyMap,
}: LeadersByPartyAvgProps) {
  const [partyAvgs, setPartyAvgs] = useState<
    {
      partyName: string;
      color: string;
      logo: string;
      ratings: { name: string; avg: number }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        const { data, error } = await supabase
          .from("respuestas")
          .select(
            `voto_generales, val_feijoo, val_sanchez, val_abascal, val_alvise, 
             val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade`
          )
          .not("voto_generales", "is", null);

        if (error) throw error;

        if (!data?.length) {
          setLoading(false);
          return;
        }

        const fields = Object.keys(LEADER_MAP);
        const byParty: Record<
          string,
          { sums: Record<string, number>; counts: Record<string, number> }
        > = {};

        data.forEach((row: any) => {
          const p = row.voto_generales;
          if (!p) return;
          if (!byParty[p]) byParty[p] = { sums: {}, counts: {} };

          fields.forEach((f) => {
            if (row[f] != null) {
              byParty[p].sums[f] = (byParty[p].sums[f] || 0) + row[f];
              byParty[p].counts[f] = (byParty[p].counts[f] || 0) + 1;
            }
          });
        });

        const result = Object.entries(byParty)
          .filter(([, d]) => Object.keys(d.sums).length > 0)
          .map(([partyName, d]) => {
            const pm = Object.values(generalPartyMap).find(
              (p) => p.name === partyName || p.key === partyName
            );
            return {
              partyName,
              color: pm?.color || "#e8465a",
              logo: pm?.logo || "",
              ratings: fields
                .map((f) => ({
                  name: LEADER_MAP[f]?.name || f,
                  avg:
                    d.counts[f] > 0
                      ? Math.round((d.sums[f] / d.counts[f]) * 10) / 10
                      : 0,
                }))
                .sort((a, b) => b.avg - a.avg),
            };
          })
          .sort((a, b) => {
            const as_ = generalStats.find((s) => s.nombre === a.partyName);
            const bs_ = generalStats.find((s) => s.nombre === b.partyName);
            return (bs_?.votos || 0) - (as_?.votos || 0);
          })
          .slice(0, 8);

        setPartyAvgs(result);
      } catch (err) {
        console.error("Error cargando valoraciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcess();
  }, [generalStats, generalPartyMap]);

  if (loading) {
    return (
      <div className="r-loader">
        <div className="r-spin" />
      </div>
    );
  }

  if (!partyAvgs.length) return null;

  const shortNames = [
    "Feijóo",
    "Sánchez",
    "Abascal",
    "Álvise",
    "Y. Díaz",
    "I. Montero",
    "Ayuso",
    "Buxadé",
  ];

  return (
    <div className="r-section">
      <div className="r-section-title">Media valoraciones por partido</div>
      <p className="r-section-sub">
        ¿Cómo valoran los votantes de cada partido a los líderes?
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="r-lxp-table">
          <thead>
            <tr>
              <th style={{ minWidth: 110 }}>Partido</th>
              {shortNames.map((n) => (
                <th key={n} style={{ textAlign: "center", minWidth: 60 }}>
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partyAvgs.map((p) => (
              <tr key={p.partyName}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <PartyLogoImg
                      src={p.logo}
                      name={p.partyName}
                      color={p.color}
                      size={18}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        color: p.color,
                        fontSize: 11,
                      }}
                    >
                      {p.partyName}
                    </span>
                  </div>
                </td>
                {Object.values(LEADER_MAP).map((leader, idx) => {
                  const r = p.ratings.find((r) => r.name === leader.name);
                  const avg = r?.avg ?? 0;
                  const color =
                    avg >= 7
                      ? "#22c55e"
                      : avg >= 4
                        ? "#f59e0b"
                        : avg >= 1
                          ? "#e8465a"
                          : "#5a596a";

                  return (
                    <td key={idx} style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color,
                        }}
                      >
                        {avg > 0 ? avg.toFixed(1) : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  useEffect(() => {
    if (generalStats.length > 0 && !initialized) {
      const base: Record<string, number> = {};
      generalStats.forEach(p => { base[p.id] = p.votos; });
      setSimulatorVotes(base);
      const provBase: Record<string, Record<string, number>> = {};
      Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; });
      setProvinciaVotes(provBase);
      setInitialized(true);
    }
  }, [generalStats, votosPorProvincia, initialized]);

  const simulatorPartyMap = useMemo(() => {
    const m = { ...generalPartyMap };
    customParties.forEach(p => { m[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" }; });
    return m;
  }, [generalPartyMap, customParties]);

  const effectiveVotesByProvince = useMemo(() => {
    if (!Object.keys(votosPorProvincia).length) return {};
    const totalNac = Object.values(simulatorVotes).reduce((a, v) => a + Math.max(0, v || 0), 0);
    if (totalNac === 0) return {};
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
    Object.entries(simulatorVotes).forEach(([k, v]) => { nv[k] = Math.max(0, Math.floor(v || 0)); });
    const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
    return obtenerEstadisticas(nv, escanos, nombres, logos).map(s => ({ ...s, color: simulatorPartyMap[s.id]?.color || "#e8465a" }));
  }, [simulatorEscanosByProvince, simulatorVotes, simulatorPartyMap]);

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
          ? <SpainMapProvincial votosPorProvincia={effectiveVotesByProvince} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />
          : <SpainMapRealistic votosPorProvincia={effectiveVotesByProvince} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />}
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
  type: "general" | "party" | "other",
  partyName?: string,
  topLeaders?: Array<{ name: string; party: string; votes: number; color: string }>
) {
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
  const title = type === "general" ? "Resultados de la Encuesta" : type === "party" ? `Análisis: ${partyName}` : "Análisis de Líderes";
  ctx.fillText(title, 40, 100);

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
      const color = party.color || "#C41E3A";
      // Bar
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(60, y + 10, 580, 22, 4); ctx.fill();
      const barGrad = ctx.createLinearGradient(60, 0, 640, 0);
      barGrad.addColorStop(0, color);
      barGrad.addColorStop(1, color + "88");
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
  } else if (type === "party" && partyName) {
    const party = stats.find(s => s.nombre === partyName);
    if (party) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.roundRect(40, 230, 720, 520, 12); ctx.fill();
      ctx.fillStyle = party.color || "#C41E3A";
      ctx.font = "bold 52px Georgia, serif"; ctx.fillText(party.porcentaje.toFixed(1) + "%", 60, 320);
      ctx.fillStyle = "#fff"; ctx.font = "18px 'DM Sans', sans-serif";
      ctx.fillText(`${party.votos.toLocaleString("es-ES")} votos`, 60, 360);
      ctx.fillStyle = party.color || "#C41E3A"; ctx.font = "bold 72px Georgia, serif";
      ctx.fillText(String(party.escanos), 60, 460);
      ctx.fillStyle = "#7a7990"; ctx.font = "16px 'DM Sans', sans-serif";
      ctx.fillText("escaños", 60, 490);
    }
  }

  // Mostrar TOP 10 líderes si type es "other", sino hemiciclo
  if (type === "other" && topLeaders && topLeaders.length > 0) {
    // TOP 10 LÍDERES MÁS VOTADOS
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.roundRect(40, 230, 1120, 520, 12); ctx.fill();
    
    ctx.fillStyle = "#C41E3A";
    ctx.font = "bold 18px Georgia, serif";
    ctx.fillText("TOP 10 LÍDERES MÁS VOTADOS", 60, 265);
    
    const maxVotes = Math.max(...topLeaders.map(l => l.votes));
    topLeaders.slice(0, 10).forEach((leader, i) => {
      const y = 300 + i * 38;
      const barWidth = (leader.votes / maxVotes) * 800;
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px 'DM Sans', sans-serif";
      ctx.fillText(`${i + 1}. ${leader.name}`, 60, y);
      ctx.fillStyle = leader.color;
      ctx.font = "11px monospace";
      ctx.fillText(leader.party, 500, y);
      
      ctx.fillStyle = leader.color + "40";
      ctx.beginPath(); ctx.roundRect(620, y - 12, barWidth, 16, 4); ctx.fill();
      ctx.fillStyle = leader.color;
      ctx.font = "bold 11px monospace";
      ctx.fillText(leader.votes.toString(), 630 + barWidth, y);
    });
  } else {
    // Hemiciclo visual simplificado (semicírculo con datos)
    const hx = 1000, hy = 480, hr = 200;
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

  const link = document.createElement("a");
  link.download = `infografia-encuesta-bc-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png", 0.95);
  link.click();
}

// ─── Componente Principal ─────────────────────────────────────────────────────
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
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showInfografiaModal, setShowInfografiaModal] = useState(false);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  const [edadMediaPorPartido, setEdadMediaPorPartido] = useState<Record<string, number>>({});
  const [leadersSubTab, setLeadersSubTab] = useState<"individual" | "porpartido">("individual");

  useEffect(() => { document.title = "La Encuesta de BC"; }, []);

  const normalizePartyKey = (v: string) => v?.trim().toUpperCase();

  const generalPartyMap = useMemo((): Record<string, PartyMeta> => {
    const d: Record<string, PartyMeta> = {};
    partyConfigData.parties.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

  const youthPartyMap = useMemo((): Record<string, PartyMeta> => {
    const d: Record<string, PartyMeta> = {};
    partyConfigData.youth.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

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
      const { data } = await supabase.from("party_configuration").select("party_key, display_name, color, logo_url, party_type, is_active").eq("is_active", true);
      const all = data || [];
      setRuntimePartyConfig(all.map((r: any) => ({ key: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url, partyType: r.party_type })));
      setPartyConfigData({
        parties: all.filter((r: any) => r.party_type === "general").map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })),
        youth: all.filter((r: any) => ["youth", "asociacion_juvenil", "juvenile"].includes(r.party_type)).map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url }))
      });
    };
    loadPartyConfig();
    const ch = supabase.channel("party-config-results").on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, loadPartyConfig).subscribe();
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
                  const { data: md } = await supabase.from("respuestas").select("provincia, edad, posicion_ideologica, voto_generales");
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
          const { data: vld } = await supabase.from("valoraciones_lideres_view").select("*");
          if (vld?.length) {
            const lm: Record<string, { name: string; fieldName: string }> = { feijoo: { name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" }, sanchez: { name: "Pedro Sánchez", fieldName: "val_sanchez" }, abascal: { name: "Santiago Abascal", fieldName: "val_abascal" }, alvise: { name: "Alvise Pérez", fieldName: "val_alvise" }, yolanda_diaz: { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" }, irene_montero: { name: "Irene Montero", fieldName: "val_irene_montero" }, ayuso: { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" }, buxade: { name: "Jorge Buxadé", fieldName: "val_buxade" } };
            setLeaderRatings(vld.map((r: any) => { const l = lm[r.lider]; return { name: l?.name ?? r.lider, fieldName: l?.fieldName ?? r.lider, average: parseFloat(r.valoracion_media) || 0, count: r.total_valoraciones || 0 }; }));
          }
        } catch {
          const { data: ar } = await supabase.from("respuestas").select("val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade");
          if (ar) {
            const ls = [{ name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" }, { name: "Pedro Sánchez", fieldName: "val_sanchez" }, { name: "Santiago Abascal", fieldName: "val_abascal" }, { name: "Alvise Pérez", fieldName: "val_alvise" }, { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" }, { name: "Irene Montero", fieldName: "val_irene_montero" }, { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" }, { name: "Jorge Buxadé", fieldName: "val_buxade" }];
            setLeaderRatings(ls.map(l => { let s = 0, c = 0; ar.forEach((r: any) => { const v = r[l.fieldName]; if (v != null) { s += v; c++; } }); return { ...l, average: Math.round(c > 0 ? (s / c) * 10 : 0) / 10, count: c }; }));
          }
        }

        try { const { data } = await supabase.from("media_nota_ejecutivo").select("nota_media"); if (data?.[0]) setNotaEjecutivo(data[0].nota_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("edad_promedio").select("edad_media"); if (data?.[0]) setEdadPromedio(data[0].edad_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("ideologia_promedio").select("ideologia_media"); if (data?.[0]) setIdeologiaPromedio(data[0].ideologia_media); } catch { /* skip */ }
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

  const handleGenerarInfografia = async (type: "general" | "party" | "other", party?: string) => {
    // TODO: Pasar datos de líderes desde LideresDePartidosSection
    await generarInfografiaPNG(generalStats, totalResponses, edadPromedio, ideologiaPromedio, type, party);
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
            <button className="r-hbtn r-hbtn-ai" onClick={() => setShowAIAnalysis(true)}>
              <Sparkles size={12} /><span>Análisis IA</span>
            </button>
            <button className="r-hbtn r-hbtn-infog" onClick={() => setShowInfografiaModal(true)}>
              <Image size={12} /><span>Infografía</span>
            </button>
            <button className="r-hbtn r-hbtn-pdf" onClick={() => downloadPDFWithMetrics(generalStats, activeTab, totalResponses, null, null)}>
              <FileText size={12} /><span>PDF</span>
            </button>
            <button className="r-hbtn r-hbtn-outline" onClick={() => setLocation("/")}>← Volver</button>
            <ShareResultsModern stats={generalStats} youthStats={youthStats} totalResponses={totalResponses} cooldownMinutes={15} />
            <FollowUsMenu />
          </div>
        </header>

        {/* NavBar */}
        <ResultsNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="r-main">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="r-space">
              {/* Quick stats */}
              <div className="r-quickstats">
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
              </div>

              {showSortBar && (
                <div className="r-sort-bar">
                  <span style={{ fontSize: 11, color: "#7a7990" }}>Ordenar:</span>
                  {(["votos", "escanos"] as const).map(opt => (
                    <button key={opt} className={`r-sort-btn${sortBy === opt ? " active" : ""}`} onClick={() => setSortBy(opt)}>
                      {opt === "votos" ? "Votos" : "Escaños"}
                    </button>
                  ))}
                  <span className="r-sort-hint">{totalEscanos} escaños en juego</span>
                </div>
              )}

              {showPartyList && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(sortBy === "votos" ? [...stats].sort((a, b) => b.votos - a.votos) : [...stats].sort((a, b) => b.escanos - a.escanos)).map(party => {
                    const lookup = activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup;
                    const rk = resolvePartyKey(party.id, lookup);
                    const logoUrl = lookup[rk]?.logo || party.logo || "";
                    const partyColor = lookup[rk]?.color || party.color || "#e8465a";
                    const edadMedia = edadMediaPorPartido[party.nombre] || edadMediaPorPartido[party.id];
                    return (
                      <div key={party.id} className="r-party-card" style={{ borderColor: `${partyColor}20` }} onClick={() => setSelectedPartyForStats(party.nombre)}>
                        <div className="r-party-card-top">
                          <div className="r-party-logo-wrap" style={{ background: `${partyColor}18` }}>
                            <PartyLogoImg src={logoUrl} name={party.nombre} color={partyColor} size={34} />
                          </div>
                          <div className="r-party-info">
                            <div className="r-party-name">{party.nombre}</div>
                            <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                            {activeTab === "general" && edadMedia && (
                              <div className="r-party-edad">
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a96e", display: "inline-block" }} />
                                Edad media: {edadMedia} años
                              </div>
                            )}
                          </div>
                          <div className="r-party-seats">
                            <div className="r-party-seats-num" style={{ color: partyColor }}>{party.escanos}</div>
                            <div className="r-party-seats-label">escaños</div>
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
              {activeTab === "lideres-preferidos" && <LeadersResultsChart partyColors={partyColorMap} />}
              {activeTab === "preguntas-varias" && <PreguntasVariasSection />}
              {activeTab === "ccaa" && <CCAAResltsSection partyMeta={generalPartyMetaLookup} />}
              {activeTab === "provincias" && <ProvincesResultsSection partyMeta={generalPartyMetaLookup} />}
              {activeTab === "comparacion-ccaa" && <CCAAComparisonSection partyMeta={generalPartyMetaLookup} />}
              {activeTab === "encuestadoras-externas" && <EncuestadorasComparativa generalStats={generalStats} totalResponses={totalResponses} />}
              {activeTab === "lideres-partidos" && <LideresDePartidosSection partyMeta={generalPartyMetaLookup} />}
              {activeTab === "simulador-electoral" && (
                <SimuladorElectoral
                  generalStats={generalStats}
                  generalPartyMap={generalPartyMap}
                  votosPorProvincia={votosPorProvincia}
                  provinciaMetricsMap={provinciaMetricsMap}
                />
              )}

              {activeTab === "leaders" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Valoración de Líderes</h2>
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
                              const km: Record<string, keyof typeof LEADERS> = { val_feijoo: "FEIJOO", val_sanchez: "SANCHEZ", val_abascal: "ABASCAL", val_alvise: "ALVISE", val_yolanda_diaz: "YOLANDA", val_irene_montero: "IRENE", val_ayuso: "AYUSO", val_buxade: "BUXADE" };
                              const lk = km[leader.fieldName]; const ld = lk ? LEADERS[lk] : null; let li: string | undefined;
                              if (ld?.image) { const fn = ld.image.split("/").pop(); if (fn) { const ek = Object.keys(EMBEDDED_LEADERS).find(k => k.toLowerCase().includes(fn.toLowerCase().replace(/\.[^/.]+$/, ""))); if (ek) li = EMBEDDED_LEADERS[ek]; } }
                              if (!li && ld?.image) li = ld.image;
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
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvincia} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />}
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
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvinciaJuveniles} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvinciaJuveniles} provinciaMetricsMap={{}} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />}
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
              {!["simulador-electoral", "lideres-partidos", "encuestadoras-externas"].includes(activeTab) && (
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
          )}
        </main>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.8)", padding: "16px 20px", textAlign: "center", fontSize: 11, color: "#5a596a" }}>
          La Encuesta de Batalla Cultural © 2025 · Datos anónimos y públicos
        </footer>

        <PartyStatsModal isOpen={!!selectedPartyForStats} onClose={() => setSelectedPartyForStats(null)} partyName={selectedPartyForStats || ""} partyType={activeTab === "general" ? "general" : "youth"} />
        <AIAnalysisModal open={showAIAnalysis} onOpenChange={setShowAIAnalysis} totalResponses={totalResponses} edadPromedio={edadPromedio} ideologiaPromedio={ideologiaPromedio} topParties={[...stats].sort((a, b) => b.votos - a.votos).slice(0, 5)} />
        {showInfografiaModal && <InfografiaModal parties={generalStats} onClose={() => setShowInfografiaModal(false)} onGenerate={handleGenerarInfografia} />}
      </div>
    </>
  );
}
