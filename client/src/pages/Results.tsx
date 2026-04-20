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
  Vote, Star, TrendingUp, X, Image, FileText, Award,
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
  transition: all 0.18s;
}
.r-hbtn-ai { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
.r-hbtn-ai:hover { background: rgba(245,158,11,0.25); }
.r-hbtn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #7a7990; }
.r-hbtn-outline:hover { color: #f0eff8; border-color: rgba(255,255,255,0.2); }
.r-hbtn-infog { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; }
.r-hbtn-infog:hover { background: rgba(99,102,241,0.25); }

/* Subnav */
.r-subnav {
  position: sticky; top: 58px; z-index: 50;
  background: rgba(17,17,24,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow-x: auto;
  overflow-y: visible;
  height: auto;
}
.r-subnav::-webkit-scrollbar { height: 0; }
.r-subnav-inner { display: flex; align-items: stretch; padding: 0 24px; min-width: max-content; gap: 0; }
.r-nav-group {
  position: relative;
  display: flex;
  align-items: center;}
.r-nav-group-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 11px 16px;
  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: #7a7990; transition: all 0.18s; white-space: nowrap;
  position: relative;
}
.r-nav-group-btn:hover { color: #f0eff8; }
.r-nav-group-btn.active { color: #e8465a; border-bottom-color: #e8465a; }
.r-dropdown {
  position: absolute; top: 100%; left: 0; min-width: 220px; z-index: 100;
  background: #18181f; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; overflow: hidden;
  animation: dropIn 0.15s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  margin-top: 2px;
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

/* Sort bar */
.r-sort-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.r-sort-btn {
  padding: 5px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1); background: transparent;
  color: #7a7990; transition: all 0.18s;
}
.r-sort-btn.active { background: #e8465a; border-color: #e8465a; color: #fff; }
.r-sort-hint { margin-left: auto; font-size: 11px; color: #5a596a; }

/* Party cards */
.r-party-card {
  background: #111118; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 18px 20px;
  cursor: pointer; transition: all 0.2s;
}
.r-party-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
.r-party-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.r-party-logo-wrap {
  width: 44px; height: 44px; border-radius: 10px;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.r-party-info { flex: 1; min-width: 0; }
.r-party-name { font-size: 14px; font-weight: 700; color: #f0eff8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-party-votes { font-size: 12px; color: #7a7990; margin-top: 2px; }
.r-party-edad { font-size: 11px; color: #c9a96e; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.r-party-seats { text-align: right; flex-shrink: 0; }
.r-party-seats-num { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 800; line-height: 1; }
.r-party-seats-label { font-size: 10px; color: #7a7990; }
.r-party-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
.r-party-bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: #5a596a; }
.r-party-bar-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.r-party-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s cubic-bezier(0.22,1,0.36,1); }

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

/* Leader cards */
.r-leader-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.r-leader-card {
  background: #18181f; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 20px 16px; text-align: center;
  transition: all 0.2s;
}
.r-leader-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
.r-leader-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; display: block; }
.r-leader-img-placeholder { width: 80px; height: 80px; border-radius: 50%; background: #18181f; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; color: #7a7990; margin: 0 auto 12px; }
.r-leader-name { font-size: 13px; font-weight: 700; color: #f0eff8; margin-bottom: 10px; line-height: 1.3; }
.r-leader-score { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: #e8465a; line-height: 1; margin-bottom: 6px; }
.r-leader-bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.r-leader-bar-fill { height: 100%; border-radius: 2px; }
.r-leader-count { font-size: 11px; color: #5a596a; }

/* Leader by party sub-tabs */
.r-subtab-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.r-subtab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08); background: transparent;
  color: #7a7990; transition: all 0.18s;
}
.r-subtab-btn:hover { border-color: rgba(255,255,255,0.16); color: #f0eff8; }
.r-subtab-btn.active { color: #fff; border-color: transparent; }

/* Leader valoracion por partido */
.r-lxp-table { width: 100%; border-collapse: collapse; }
.r-lxp-table th { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5a596a; padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
.r-lxp-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #f0eff8; vertical-align: middle; }
.r-lxp-table tr:last-child td { border-bottom: none; }
.r-lxp-table tr:hover td { background: rgba(255,255,255,0.02); }

/* Simulator */
.r-sim-wrap { background: #0d0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
.r-sim-header { padding: 40px 54px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
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

/* Methodology */
.r-method { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 640px) { .r-method { grid-template-columns: 1fr; } }
.r-method-item { }
.r-method-key { font-size: 12px; font-weight: 700; color: #f0eff8; margin-bottom: 4px; }
.r-method-val { font-size: 12px; color: #7a7990; line-height: 1.6; }

/* Circ select */
.r-select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #f0eff8; font-family: inherit; outline: none; appearance: none; transition: border-color 0.18s; }
.r-select:focus { border-color: #e8465a; }
.r-select option { background: #18181f; }
.r-circ-info { display: flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 10px 16px; font-size: 13px; color: #f59e0b; margin-bottom: 14px; }
.r-empty-circ { text-align: center; padding: 40px 20px; color: #5a596a; }
.r-trash-btn { background: none; border: none; color: #5a596a; cursor: pointer; padding: 4px; transition: color 0.18s; }
.r-trash-btn:hover { color: #e8465a; }

/* Map toggle */
.r-map-toggle { display: flex; gap: 4px; }
.r-map-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #7a7990; transition: all 0.18s; }
.r-map-btn.active { background: #e8465a; border-color: #e8465a; color: #fff; }

/* CTA */
.r-cta { text-align: center; padding: 24px; }
.r-cta-text { font-size: 14px; color: #7a7990; margin-bottom: 12px; }
.r-cta-btn { padding: 10px 28px; border-radius: 10px; background: #e8465a; border: none; color: #fff; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.18s; }
.r-cta-btn:hover { background: #ff6b7a; }

/* Helpers */
.r-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
.r-loader { display: flex; align-items: center; justify-content: center; padding: 60px 20px; }
.r-spin { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08); border-top-color: #e8465a; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
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
interface PartyLeaderAvg {
  party_key: string; display_name: string; color: string; logo_url: string;
  leaders: { fieldName: string; name: string; avg: number; count: number }[];
  overall: number;
}

type TabKey =
  | "general" | "mapa-hemiciclo" | "encuestadoras-externas" | "ccaa"
  | "provincias" | "comparacion-ccaa" | "youth" | "asoc-juv-mapa-hemiciclo"
  | "leaders" | "tendencias" | "lideres-preferidos" | "lideres-partidos"
  | "preguntas-varias" | "simulador-electoral";

interface TabGroup { label: string; icon: React.ReactNode; tabs: { key: TabKey; label: string }[]; }

const TAB_GROUPS: TabGroup[] = [
  { label: "Elecciones", icon: <Vote className="w-3.5 h-3.5" />, tabs: [{ key: "general", label: "Resultados Generales" }, { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" }, { key: "simulador-electoral", label: "Simulador Electoral" }, { key: "encuestadoras-externas", label: "Encuestadoras" }] },
  { label: "Territorio", icon: <MapPin className="w-3.5 h-3.5" />, tabs: [{ key: "ccaa", label: "Comunidades Autónomas" }, { key: "provincias", label: "Provincias" }, { key: "comparacion-ccaa", label: "Comparar CCAA" }] },
  { label: "Juventud", icon: <Users className="w-3.5 h-3.5" />, tabs: [{ key: "youth", label: "Asociaciones Juveniles" }, { key: "asoc-juv-mapa-hemiciclo", label: "Mapa y Hemiciclo Juvenil" }] },
  { label: "Líderes", icon: <Star className="w-3.5 h-3.5" />, tabs: [{ key: "lideres-partidos", label: "Líderes por Partido" }, { key: "leaders", label: "Valoración de Líderes" }, { key: "lideres-preferidos", label: "Líderes Preferidos" }] },
  { label: "Análisis", icon: <BarChart2 className="w-3.5 h-3.5" />, tabs: [{ key: "tendencias", label: "Tendencias por Día" }, { key: "preguntas-varias", label: "Preguntas Varias" }] },
];

// ─── NavBar ───────────────────────────────────────────────────────────────────
function ResultsNavBar({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpenGroup(null); };
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
                    <button key={tab.key} className={`r-dropdown-item${activeTab === tab.key ? " active" : ""}`}
                      onClick={() => { onTabChange(tab.key); setOpenGroup(null); }}>
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

// ─── Infografía modal ─────────────────────────────────────────────────────────
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
        <p className="r-infog-sub">Selecciona el tipo de infografía que deseas generar</p>
        <div className="r-infog-grid">
          <button className={`r-infog-option${type === "general" ? " selected" : ""}`} onClick={() => setType("general")}>
            <div className="r-infog-option-icon" style={{ background: "rgba(232,70,90,0.15)" }}><BarChart2 size={22} color="#e8465a" /></div>
            <span className="r-infog-option-label">General</span>
            <span className="r-infog-option-desc">Resultados globales de la encuesta</span>
          </button>
          <button className={`r-infog-option${type === "party" ? " selected" : ""}`} onClick={() => setType("party")}>
            <div className="r-infog-option-icon" style={{ background: "rgba(99,102,241,0.15)" }}><Award size={22} color="#818cf8" /></div>
            <span className="r-infog-option-label">Por Partido</span>
            <span className="r-infog-option-desc">Perfil detallado de un partido</span>
          </button>
          <button className={`r-infog-option${type === "other" ? " selected" : ""}`} onClick={() => setType("other")}>
            <div className="r-infog-option-icon" style={{ background: "rgba(34,197,94,0.15)" }}><Image size={22} color="#22c55e" /></div>
            <span className="r-infog-option-label">Otros</span>
            <span className="r-infog-option-desc">Líderes, demografía y más</span>
          </button>
        </div>
        {type === "party" && (
          <select className="r-infog-party-select" value={selectedParty} onChange={e => setSelectedParty(e.target.value)}>
            <option value="">Selecciona un partido...</option>
            {parties.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
        )}
        <div className="r-infog-footer">
          <button className="r-infog-cancel" onClick={onClose}>Cancelar</button>
          <button className="r-infog-generate" onClick={() => { onGenerate(type, selectedParty); onClose(); }}>
            <Download size={14} style={{ display: "inline", marginRight: 6 }} />Generar PDF
          </button>
        </div>
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
        const { data: leadersData } = await supabase
          .from("party_leaders")
          .select(`id, party_key, leader_name, photo_url, is_active, party_configuration!inner(display_name, color, logo_url)`)
          .eq("is_active", true).order("party_key");
        const mappedLeaders: PartyLeader[] = (leadersData || []).map((row: any) => ({
          id: row.id, party_key: row.party_key, leader_name: row.leader_name,
          photo_url: row.photo_url, is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#e8465a",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));
        setLeaders(mappedLeaders);
        const { data: prefData } = await supabase.from("lideres_preferidos").select("partido, lider_preferido");
        if (prefData && prefData.length > 0) {
          const counts: Record<string, Record<string, number>> = {};
          prefData.forEach((row: any) => { if (!counts[row.partido]) counts[row.partido] = {}; counts[row.partido][row.lider_preferido] = (counts[row.partido][row.lider_preferido] || 0) + 1; });
          const arr: LiderPreferido[] = [];
          Object.entries(counts).forEach(([partido, lideres]) => {
            const total = Object.values(lideres).reduce((a, b) => a + b, 0);
            Object.entries(lideres).forEach(([lider, votos]) => {
              const leaderInfo = mappedLeaders.find(l => l.party_key === partido && l.leader_name === lider);
              const partyInfo = mappedLeaders.find(l => l.party_key === partido);
              arr.push({ partido, lider_preferido: lider, votos, porcentaje: total > 0 ? (votos / total) * 100 : 0, photo_url: leaderInfo?.photo_url, color: partyInfo?.color, display_name: partyInfo?.display_name ?? partido, logo_url: partyInfo?.logo_url });
            });
          });
          setLideresPreferidos(arr);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const byParty = useMemo(() => { const m: Record<string, PartyLeader[]> = {}; leaders.forEach(l => { if (!m[l.party_key]) m[l.party_key] = []; m[l.party_key].push(l); }); return m; }, [leaders]);
  const prefByParty = useMemo(() => { const m: Record<string, LiderPreferido[]> = {}; lideresPreferidos.forEach(l => { if (!m[l.partido]) m[l.partido] = []; m[l.partido].push(l); }); Object.keys(m).forEach(k => { m[k].sort((a, b) => b.votos - a.votos); }); return m; }, [lideresPreferidos]);

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  const partyKeys = Object.keys(byParty);
  if (partyKeys.length === 0) return <div className="r-section"><p style={{ color: "#7a7990", textAlign: "center" }}>No hay líderes configurados aún.</p></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter chips */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Líderes por Partido</h2>
        {selectedParty && (
          <button className="r-subtab-btn" onClick={() => setSelectedParty(null)} style={{ borderColor: "rgba(255,255,255,0.14)", color: "#f0eff8" }}>← Ver todos</button>
        )}
      </div>
      {!selectedParty && (
        <div className="r-subtab-bar">
          {partyKeys.map(pk => {
            const info = byParty[pk][0]; const totalVotos = (prefByParty[pk] || []).reduce((a, b) => a + b.votos, 0);
            return (
              <button key={pk} className="r-subtab-btn" onClick={() => setSelectedParty(pk)}
                style={{ borderColor: `${info.color}40`, color: info.color, background: `${info.color}0d` }}>
                {info.logo_url && <img src={info.logo_url} alt={info.display_name} style={{ width: 14, height: 14, objectFit: "contain" }} />}
                {info.display_name}
                {totalVotos > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>· {totalVotos}v</span>}
              </button>
            );
          })}
        </div>
      )}
      {(selectedParty ? [selectedParty] : partyKeys).map(partyKey => {
        const partyLeaders = byParty[partyKey] || []; const partyPrefs = prefByParty[partyKey] || [];
        const info = partyLeaders[0]; if (!info) return null;
        const partyColor = info.color; const totalVotos = partyPrefs.reduce((a, b) => a + b.votos, 0);
        const leadersWithVotes = partyLeaders.map(l => { const pref = partyPrefs.find(p => p.lider_preferido === l.leader_name); return { ...l, votos: pref?.votos ?? 0, porcentaje: pref?.porcentaje ?? 0 }; }).sort((a, b) => b.votos - a.votos);
        const extraPrefs = partyPrefs.filter(p => !partyLeaders.some(l => l.leader_name === p.lider_preferido));
        const chartData = [...leadersWithVotes.filter(l => l.votos > 0).map(l => ({ name: l.leader_name, votos: l.votos, porcentaje: l.porcentaje })), ...extraPrefs.map(e => ({ name: e.lider_preferido, votos: e.votos, porcentaje: e.porcentaje }))].sort((a, b) => b.votos - a.votos).slice(0, 10);
        return (
          <div key={partyKey} className="r-section" style={{ borderColor: `${partyColor}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {info.logo_url && <img src={info.logo_url} alt={info.display_name} style={{ height: 36, width: 36, objectFit: "contain", borderRadius: 8 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: partyColor }}>{info.display_name}</div>
                <div style={{ fontSize: 12, color: "#7a7990" }}>{partyLeaders.length} candidato{partyLeaders.length !== 1 ? "s" : ""} · {totalVotos > 0 ? `${totalVotos} votos` : "Sin votos aún"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 16, marginBottom: 20 }}>
              {leadersWithVotes.map(leader => (
                <div key={leader.id} style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${partyColor}`, margin: "0 auto 10px" }}>
                    {leader.photo_url ? <img src={leader.photo_url} alt={leader.leader_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", background: partyColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>{leader.leader_name.charAt(0)}</div>}
                    {leader.votos > 0 && <div style={{ position: "absolute", bottom: 0, right: 0, background: partyColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 100 }}>{leader.votos}</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f0eff8", marginBottom: 6, lineHeight: 1.3 }}>{leader.leader_name}</div>
                  {leader.votos > 0 ? (
                    <>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                        <div style={{ height: "100%", width: `${leader.porcentaje}%`, background: partyColor, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#7a7990" }}>{leader.porcentaje.toFixed(1)}%</div>
                    </>
                  ) : <div style={{ fontSize: 10, color: "#5a596a" }}>Sin votos</div>}
                </div>
              ))}
            </div>
            {chartData.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0eff8", marginBottom: 12 }}>Distribución de preferencias</div>
                <ResponsiveContainer width="100%" height={Math.max(90, chartData.length * 36)}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 50, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.15)" fontSize={11} tick={{ fill: "#7a7990" }} />
                    <YAxis type="category" dataKey="name" stroke="transparent" fontSize={11} width={120} tick={{ fill: "#c0bfd8" }} />
                    <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v: any, _: any, p: any) => [`${v} votos (${p.payload.porcentaje?.toFixed(1)}%)`, "Preferencia"]} />
                    <Bar dataKey="votos" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#7a7990", formatter: (v: number) => v > 0 ? v : "" }}>
                      {chartData.map((_, i) => <Cell key={i} fill={partyColor} fillOpacity={Math.max(0.4, 0.9 - i * 0.07)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {extraPrefs.length > 0 && (
                  <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#5a596a", fontWeight: 700, marginBottom: 8 }}>Otros candidatos mencionados:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {extraPrefs.map(ep => (
                        <span key={ep.lider_preferido} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: `${partyColor}12`, border: `1px solid ${partyColor}35`, color: partyColor }}>
                          {ep.lider_preferido} · {ep.votos}v
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {totalVotos === 0 && <p style={{ fontSize: 13, textAlign: "center", color: "#5a596a" }}>Aún no hay votos para este partido</p>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Valoración líderes por partido ──────────────────────────────────────────
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

// ─── Valoración de líderes por partido (media) ────────────────────────────────
function LeadersByPartyAvg({ leaderRatings, generalStats, generalPartyMap }: {
  leaderRatings: LeaderRating[];
  generalStats: PartyStats[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
}) {
  const [partyAvgs, setPartyAvgs] = useState<{ partyName: string; color: string; logo: string; ratings: { name: string; avg: number }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchByParty = async () => {
      try {
        // Fetch valoraciones medias agrupadas por voto_generales
        const { data } = await supabase
          .from("respuestas")
          .select("voto_generales, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade")
          .not("voto_generales", "is", null);

        if (!data || data.length === 0) { setLoading(false); return; }

        const byParty: Record<string, { sums: Record<string, number>; counts: Record<string, number> }> = {};
        data.forEach((row: any) => {
          const p = row.voto_generales;
          if (!p) return;
          if (!byParty[p]) byParty[p] = { sums: {}, counts: {} };
          const fields = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
          fields.forEach(f => {
            if (row[f] != null) {
              byParty[p].sums[f] = (byParty[p].sums[f] || 0) + row[f];
              byParty[p].counts[f] = (byParty[p].counts[f] || 0) + 1;
            }
          });
        });

        const result = Object.entries(byParty)
          .filter(([, d]) => Object.keys(d.sums).length > 0)
          .map(([partyName, d]) => {
            const partyMeta = Object.values(generalPartyMap).find(p => p.name === partyName || p.key === partyName);
            return {
              partyName,
              color: partyMeta?.color || "#e8465a",
              logo: partyMeta?.logo || "",
              ratings: Object.keys(d.sums).map(f => ({
                name: LEADER_MAP[f]?.name || f,
                avg: d.counts[f] > 0 ? Math.round((d.sums[f] / d.counts[f]) * 10) / 10 : 0,
              })).sort((a, b) => b.avg - a.avg),
            };
          }).sort((a, b) => {
            const aStats = generalStats.find(s => s.nombre === a.partyName);
            const bStats = generalStats.find(s => s.nombre === b.partyName);
            return (bStats?.votos || 0) - (aStats?.votos || 0);
          }).slice(0, 8);

        setPartyAvgs(result);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchByParty();
  }, [generalStats, generalPartyMap]);

  if (loading) return <div className="r-loader"><div className="r-spin" /></div>;
  if (partyAvgs.length === 0) return null;

  return (
    <div className="r-section" style={{ marginTop: 0 }}>
      <div className="r-section-title">Media de valoraciones por partido</div>
      <p className="r-section-sub">¿Cómo valoran los votantes de cada partido a los líderes políticos?</p>
      <div style={{ overflowX: "auto" }}>
        <table className="r-lxp-table">
          <thead>
            <tr>
              <th style={{ minWidth: 130 }}>Partido</th>
              {["Feijóo", "Sánchez", "Abascal", "Alvise", "Y. Díaz", "I. Montero", "Ayuso", "Buxadé"].map(n => (
                <th key={n} style={{ textAlign: "center", minWidth: 70 }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partyAvgs.map(p => {
              const fieldOrder = ["val_feijoo", "val_sanchez", "val_abascal", "val_alvise", "val_yolanda_diaz", "val_irene_montero", "val_ayuso", "val_buxade"];
              return (
                <tr key={p.partyName}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {p.logo && <img src={p.logo} alt={p.partyName} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3 }} />}
                      <span style={{ fontWeight: 700, color: p.color, fontSize: 12 }}>{p.partyName}</span>
                    </div>
                  </td>
                  {fieldOrder.map(f => {
                    const r = p.ratings.find(r => r.name === (LEADER_MAP[f]?.name));
                    const avg = r?.avg ?? 0;
                    const color = avg >= 7 ? "#22c55e" : avg >= 4 ? "#f59e0b" : avg >= 1 ? "#e8465a" : "#5a596a";
                    return (
                      <td key={f} style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color }}>{avg > 0 ? avg.toFixed(1) : "—"}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: "#5a596a" }}>
        Colores: <span style={{ color: "#22c55e" }}>■</span> ≥7 positivo · <span style={{ color: "#f59e0b" }}>■</span> 4-7 neutro · <span style={{ color: "#e8465a" }}>■</span> &lt;4 negativo
      </div>
    </div>
  );
}

// ─── SimuladorElectoral (redefinido) ──────────────────────────────────────────
interface SimuladorProps {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
}

function SimuladorElectoral({ generalStats, generalPartyMap, votosPorProvincia, provinciaMetricsMap }: SimuladorProps) {
  const [mode, setMode] = useState<"nacional" | "circunscripcion">("nacional");
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [provinciaVotes, setProvinciaVotes] = useState<Record<string, Record<string, number>>>({});
  const [selectedCirc, setSelectedCirc] = useState("");
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
      if (provinciaVotes[prov]) { result[prov] = { ...provinciaVotes[prov] }; customParties.forEach(cp => { if (result[prov][cp.key] === undefined) result[prov][cp.key] = 0; }); }
      else { const provTotal = Object.values(realVotes).reduce((a, v) => a + v, 0); const sim: Record<string, number> = {}; Object.entries(shares).forEach(([p, share]) => { sim[p] = Math.round(provTotal * share); }); result[prov] = sim; }
    });
    return result;
  }, [votosPorProvincia, simulatorVotes, provinciaVotes, customParties]);

  const simulatorEscanosByProvince = useMemo(() => {
    if (!Object.keys(effectiveVotesByProvince).length) return {};
    return calcularEscanosGeneralesPorProvincia(effectiveVotesByProvince);
  }, [effectiveVotesByProvince]);

  const simulatorStats = useMemo(() => {
    const escanosTotales: Record<string, number> = {};
    Object.values(simulatorEscanosByProvince).forEach(pe => { Object.entries(pe).forEach(([p, e]) => { escanosTotales[p] = (escanosTotales[p] || 0) + e; }); });
    const nv: Record<string, number> = {};
    Object.entries(simulatorVotes).forEach(([k, v]) => { nv[k] = Math.max(0, Math.floor(v || 0)); });
    const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
    return obtenerEstadisticas(nv, escanosTotales, nombres, logos).map(s => ({ ...s, color: simulatorPartyMap[s.id]?.color || "#e8465a" }));
  }, [simulatorEscanosByProvince, simulatorVotes, simulatorPartyMap]);

  const addCustomParty = () => {
    const name = newPartyName.trim(); if (!name) return;
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
    const baseKey = slug || `PARTY_${Date.now()}`;
    const key = simulatorPartyMap[baseKey] ? `${baseKey}_${Date.now()}` : baseKey;
    setCustomParties(prev => [...prev, { key, name, color: newPartyColor }]);
    setSimulatorVotes(prev => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };
  const removeCustomParty = (key: string) => { setCustomParties(prev => prev.filter(p => p.key !== key)); setSimulatorVotes(prev => { const n = { ...prev }; delete n[key]; return n; }); };
  const resetToOriginal = () => {
    const base: Record<string, number> = {}; generalStats.forEach(p => { base[p.id] = p.votos; }); setSimulatorVotes(base);
    const provBase: Record<string, Record<string, number>> = {}; Object.entries(votosPorProvincia).forEach(([prov, data]) => { provBase[prov] = { ...data }; }); setProvinciaVotes(provBase);
    setCustomParties([]);
  };

  const totalSimVotes = Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const basePartyEntries = Object.entries(simulatorPartyMap).filter(([k]) => !customParties.find(cp => cp.key === k));
  const availableCircs = Object.keys(votosPorProvincia).sort();
  const circVotos = selectedCirc ? (provinciaVotes[selectedCirc] || {}) : {};
  const circTotal = Object.values(circVotos).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const totalEscanos = simulatorStats.reduce((a, s) => a + s.escanos, 0);
  const mayoriaAbs = Math.floor(totalEscanos / 2) + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Control panel */}
      <div className="r-sim-wrap">
        <div className="r-sim-header">
          <div>
            <p className="r-sim-title">Simulador Electoral</p>
            <p className="r-sim-sub">Modifica los votos y observa cómo cambia el reparto de escaños en tiempo real</p>
          </div>
          <button onClick={resetToOriginal} className="r-hbtn r-hbtn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
            <RefreshCw size={13} />Restaurar datos reales
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
                <span style={{ marginLeft: "auto", fontSize: 11 }}>Los cambios se proyectan proporcionalmente a todas las provincias</span>
              </div>
              <div className="r-sim-party-grid">
                {basePartyEntries.map(([partyKey, party]) => {
                  const votes = simulatorVotes[partyKey] ?? 0;
                  const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={partyKey} className="r-sim-party-row">
                      {party.logo ? <img src={party.logo} alt={party.name} className="r-sim-party-logo" /> : <span style={{ width: 16, height: 16, borderRadius: "50%", background: party.color, flexShrink: 0, display: "inline-block" }} />}
                      <span className="r-sim-party-name">{party.name}</span>
                      <div className="r-sim-pct-bar"><div className="r-sim-pct-fill" style={{ width: `${Math.min(100, parseFloat(pct) * 3)}%`, background: party.color }} /></div>
                      <span className="r-sim-pct">{pct}%</span>
                      <input type="number" min={0} value={votes} className="r-sim-input"
                        onChange={e => setSimulatorVotes(prev => ({ ...prev, [partyKey]: Math.max(0, Number(e.target.value) || 0) }))} />
                    </div>
                  );
                })}
                {customParties.map(party => {
                  const votes = simulatorVotes[party.key] ?? 0;
                  const pct = totalSimVotes > 0 ? ((votes / totalSimVotes) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={party.key} className="r-sim-party-row" style={{ borderStyle: "dashed" }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: party.color, flexShrink: 0, display: "inline-block" }} />
                      <span className="r-sim-party-name">{party.name}</span>
                      <span className="r-sim-pct">{pct}%</span>
                      <input type="number" min={0} value={votes} className="r-sim-input"
                        onChange={e => setSimulatorVotes(prev => ({ ...prev, [party.key]: Math.max(0, Number(e.target.value) || 0) }))} />
                      <button className="r-trash-btn" onClick={() => removeCustomParty(party.key)}><Trash2 size={13} /></button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {mode === "circunscripcion" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <select className="r-select" style={{ maxWidth: 300 }} value={selectedCirc} onChange={e => setSelectedCirc(e.target.value)}>
                  <option value="">— Selecciona una provincia —</option>
                  {availableCircs.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
              </div>
              {selectedCirc ? (
                <>
                  <div className="r-circ-info">
                    Editando <strong style={{ margin: "0 4px" }}>{selectedCirc}</strong> · Total: <strong style={{ marginLeft: 4 }}>{circTotal.toLocaleString()} votos</strong>
                  </div>
                  <div className="r-sim-party-grid">
                    {Object.entries(simulatorPartyMap).map(([partyKey, party]) => {
                      const votes = provinciaVotes[selectedCirc]?.[partyKey] ?? 0;
                      const pct = circTotal > 0 ? ((votes / circTotal) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={partyKey} className="r-sim-party-row">
                          {party.logo ? <img src={party.logo} alt={party.name} className="r-sim-party-logo" /> : <span style={{ width: 14, height: 14, borderRadius: "50%", background: party.color, flexShrink: 0, display: "inline-block" }} />}
                          <span className="r-sim-party-name">{party.name}</span>
                          <span className="r-sim-pct">{pct}%</span>
                          <input type="number" min={0} value={votes} className="r-sim-input"
                            onChange={e => { const val = Math.max(0, Number(e.target.value) || 0); setProvinciaVotes(prev => ({ ...prev, [selectedCirc]: { ...(prev[selectedCirc] || {}), [partyKey]: val } })); }} />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="r-empty-circ">
                  <MapPin size={36} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
                  <p style={{ fontSize: 13 }}>Selecciona una provincia para editar sus votos</p>
                </div>
              )}
            </>
          )}

          {/* Add custom party */}
          <div className="r-sim-add">
            <div className="r-sim-add-title"><Plus size={12} />Añadir partido personalizado</div>
            <div className="r-sim-add-row">
              <input type="text" value={newPartyName} onChange={e => setNewPartyName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomParty()} placeholder="Nombre del partido" className="r-sim-add-input" />
              <input type="color" value={newPartyColor} onChange={e => setNewPartyColor(e.target.value)} style={{ height: 38, width: 44, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "none", cursor: "pointer" }} />
              <button onClick={addCustomParty} className="r-sim-add-btn"><Plus size={13} />Añadir</button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="r-section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <div className="r-section-title">Escaños simulados</div>
          <span style={{ fontSize: 12, color: "#f59e0b" }}>Mayoría absoluta: <strong>{mayoriaAbs}</strong></span>
        </div>
        <p className="r-section-sub">Resultado del reparto proporcional mediante Ley d'Hondt</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

      {/* Pactómetro */}
      <div className="r-section">
        <div className="r-section-title">Pactómetro Simulado</div>
        <p className="r-section-sub">Selecciona partidos para calcular si alcanzan la mayoría absoluta</p>
        <PactometerInteractive stats={simulatorStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
      </div>

      {/* Mapa */}
      <div className="r-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="r-section-title" style={{ marginBottom: 2 }}>Mapa Provincial Simulado</div>
            <p style={{ fontSize: 12, color: "#7a7990", margin: 0 }}>Se actualiza automáticamente</p>
          </div>
          <div className="r-map-toggle">
            {(["schematic", "realistic"] as const).map(v => (
              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                {v === "schematic" ? <><Grid3x3 size={12} />Esquemática</> : <><Map size={12} />Realista</>}
              </button>
            ))}
          </div>
        </div>
        {mapView === "schematic"
          ? <SpainMapProvincial votosPorProvincia={effectiveVotesByProvince} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />
          : <SpainMapRealistic votosPorProvincia={effectiveVotesByProvince} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={simulatorPartyMap} onProvinceClick={(p, d, v, e) => { setSimProvinciaSeleccionada(p); setSimVotosProvincia(v); setSimEscanosProvincia(e); }} />}
      </div>

      {/* Hemiciclo */}
      <div className="r-section">
        <div className="r-section-title" style={{ marginBottom: 16 }}>Hemiciclo Simulado</div>
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
  const [showInfografiaModal, setShowInfografiaModal] = useState(false);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  // Edad media por partido
  const [edadMediaPorPartido, setEdadMediaPorPartido] = useState<Record<string, number>>({});
  // Sub-tab for leaders
  const [leadersSubTab, setLeadersSubTab] = useState<"individual" | "porpartido">("individual");

  useEffect(() => { document.title = "La Encuesta de BC"; }, []);

  const normalizePartyKey = (v: string) => v?.trim().toUpperCase();
  const generalPartyMap = useMemo(() => { const d: Record<string, { key: string; name: string; color: string; logo: string }> = {}; partyConfigData.parties.forEach(p => { d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl }; }); return d; }, [partyConfigData]);
  const youthPartyMap = useMemo(() => { const d: Record<string, { key: string; name: string; color: string; logo: string }> = {}; partyConfigData.youth.forEach(p => { d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl }; }); return d; }, [partyConfigData]);

  const resolvePartyKey = (value: string, metaMap: Record<string, { key: string; name: string; color: string; logo: string }>) => {
    if (metaMap[value]) return value;
    const n = normalizePartyKey(value);
    const f = Object.keys(metaMap).find(k => normalizePartyKey(k) === n);
    if (f) return f;
    const fk = Object.entries(metaMap).find(([, p]) => normalizePartyKey(String(p?.key || "")) === n)?.[0];
    if (fk) return fk;
    const fn = Object.entries(metaMap).find(([, p]) => normalizePartyKey(String(p?.name || "")) === n)?.[0];
    return fn || f || value;
  };

  const buildLookup = (map: Record<string, { key: string; name: string; color: string; logo: string }>) => {
    const lookup: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    Object.entries(map).forEach(([k, p]) => { [k, p.key, p.name, normalizePartyKey(k), normalizePartyKey(p.key), normalizePartyKey(p.name)].forEach(a => { if (a) lookup[String(a)] = p; }); });
    return lookup;
  };

  const generalPartyMetaLookup = useMemo(() => buildLookup(generalPartyMap), [generalPartyMap]);
  const youthPartyMetaLookup = useMemo(() => buildLookup(youthPartyMap), [youthPartyMap]);

  useEffect(() => { if (Object.keys(votosPorProvincia).length > 0 && generalStats.length > 0) { const e = calcularEscanosGeneralesPorProvincia(votosPorProvincia); setEscanosGeneralesPorProvincia(e); setGeneralStats(prev => prev.map(s => ({ ...s, escanos: e[s.id] || 0 }))); } }, [votosPorProvincia]);
  useEffect(() => { if (Object.keys(votosPorProvinciaJuveniles).length > 0 && youthStats.length > 0) { const e = calcularEscanosJuvenilesPorProvincia(votosPorProvinciaJuveniles); setEscanosJuvenilesPorProvincia(e); setYouthStats(prev => prev.map(s => ({ ...s, escanos: e[s.id] || 0 }))); } }, [votosPorProvinciaJuveniles]);

  useEffect(() => {
    const loadPartyConfig = async () => {
      const { data } = await supabase.from("party_configuration").select("party_key, display_name, color, logo_url, party_type, is_active").eq("is_active", true);
      const all = data || [];
      setRuntimePartyConfig(all.map((r: any) => ({ key: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url, partyType: r.party_type })));
      setPartyConfigData({ parties: all.filter((r: any) => r.party_type === "general").map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })), youth: all.filter((r: any) => ["youth", "asociacion_juvenil", "juvenile"].includes(r.party_type)).map((r: any) => ({ partyKey: r.party_key, displayName: r.display_name, color: r.color, logoUrl: r.logo_url })) });
    };
    loadPartyConfig();
    const ch = supabase.channel("party-config-results").on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, loadPartyConfig).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        try { const { data } = await supabase.from("total_respuestas_view").select("total_respuestas"); setTotalResponses(data?.[0]?.total_respuestas || 0); }
        catch { try { const { count } = await supabase.from("respuestas").select("*", { count: "exact", head: true }); setTotalResponses(count || 0); } catch { setTotalResponses(0); } }

        try {
          const { data: gd } = await supabase.from("votos_generales_totales").select("*");
          if (gd && gd.length > 0) {
            const gv: Record<string, number> = {};
            Object.keys(generalPartyMap).forEach(k => { gv[k] = 0; });
            gd.forEach((r: any) => { gv[resolvePartyKey(String(r.partido_id || ""), generalPartyMap)] = r.votos; });
            const escanos = Object.keys(votosPorProvincia).length > 0 ? calcularEscanosGeneralesPorProvincia(votosPorProvincia) : calcularEscanosGenerales(gv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setGeneralStats(obtenerEstadisticas(gv, escanos, nombres, logos).map(s => ({ ...s, color: generalPartyMap[resolvePartyKey(s.id, generalPartyMap)]?.color })));

            // Votos por provincia
            try {
              const { data: pd } = await supabase.from("votos_por_provincia_view").select("provincia, partido, votos");
              if (pd && pd.length > 0) {
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
          if (yd && yd.length > 0) {
            const yv: Record<string, number> = {}; yd.forEach((r: any) => { yv[resolvePartyKey(String(r.asociacion_id || ""), youthPartyMap)] = r.votos; });
            const escanos = calcularEscanosJuveniles(yv);
            const nombres: Record<string, string> = {}; const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([k, p]) => { nombres[k] = p.name; logos[k] = p.logo; });
            setYouthStats(obtenerEstadisticas(yv, escanos, nombres, logos).map(s => ({ ...s, color: youthPartyMap[resolvePartyKey(s.id, youthPartyMap)]?.color })));
          }
        } catch (e) { console.error(e); }

        try {
          const { data: jpd } = await supabase.from("votos_por_provincia_juveniles_view").select("provincia, asociacion, votos");
          if (jpd && jpd.length > 0) { const vjp: Record<string, Record<string, number>> = {}; jpd.forEach((r: any) => { if (r.provincia && r.asociacion) { if (!vjp[r.provincia]) vjp[r.provincia] = {}; vjp[r.provincia][resolvePartyKey(String(r.asociacion), youthPartyMap)] = r.votos; } }); setVotosPorProvinciaJuveniles(vjp); }
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
              setLeaderRatings(ls.map(l => { let s = 0, c = 0; ar.forEach((r: any) => { const v = r[l.fieldName]; if (v != null) { s += v; c++; } }); return { ...l, average: Math.round(c > 0 ? (s / c) * 10 : 0) / 10, count: c }; }));
            }
          } catch (e) { console.error(e); }
        }

        try { const { data } = await supabase.from("media_nota_ejecutivo").select("nota_media"); if (data?.[0]) setNotaEjecutivo(data[0].nota_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("edad_promedio").select("edad_media"); if (data?.[0]) setEdadPromedio(data[0].edad_media); } catch { /* skip */ }
        try { const { data } = await supabase.from("ideologia_promedio").select("ideologia_media"); if (data?.[0]) setIdeologiaPromedio(data[0].ideologia_media); } catch { /* skip */ }
      } catch (err) { console.error("Error fetching results:", err); }
      finally { setLoading(false); }
    };
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [generalPartyMap, youthPartyMap]);

  const stats = activeTab === "general" ? generalStats : activeTab === "youth" ? youthStats : [];
  const totalEscanos = activeTab === "general" ? 350 : activeTab === "youth" ? 100 : 0;
  const partyColorMap = useMemo(() => { const m: Record<string, string> = {}; [...Object.values(generalPartyMap), ...Object.values(youthPartyMap)].forEach((p: any) => { if (!p) return; if (p.key && p.color) m[p.key.toUpperCase()] = p.color; if (p.name && p.color) m[p.name.toUpperCase()] = p.color; }); return m; }, [generalPartyMap, youthPartyMap]);

  const exportToPDF = async (type?: "general" | "party" | "other", party?: string) => {
    try {
      const { downloadPDFWithMetrics } = await import("@/lib/pdfExportMetrics");
      await downloadPDFWithMetrics(stats, activeTab === "simulador-electoral" ? "general" : activeTab, totalResponses, edadPromedio, ideologiaPromedio);
    } catch (err) { console.error(err); }
  };

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
            <button className="r-hbtn r-hbtn-outline" onClick={() => exportToPDF()}>
              <Download size={12} /><span>PDF</span>
            </button>
            <ShareResultsModern stats={generalStats} youthStats={youthStats} totalResponses={totalResponses} cooldownMinutes={15} />
            <button className="r-hbtn r-hbtn-outline" onClick={() => setLocation("/")}>← Volver</button>
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
                    <div className="r-stat-label">Ideología media</div>
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

              {/* Sort bar */}
              {(activeTab === "general" || activeTab === "youth") && (
                <div className="r-sort-bar">
                  <span style={{ fontSize: 12, color: "#7a7990" }}>Ordenar:</span>
                  {(["votos", "escanos"] as const).map(opt => (
                    <button key={opt} className={`r-sort-btn${sortBy === opt ? " active" : ""}`} onClick={() => setSortBy(opt)}>
                      {opt === "votos" ? "Votos" : "Escaños"}
                    </button>
                  ))}
                  <span className="r-sort-hint">{totalEscanos} escaños en juego</span>
                </div>
              )}

              {/* Party list */}
              {stats.length > 0 && (activeTab === "general" || activeTab === "youth") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(sortBy === "votos" ? [...stats].sort((a, b) => b.votos - a.votos) : [...stats].sort((a, b) => b.escanos - a.escanos)).map(party => {
                    const lookup = activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup;
                    const rk = resolvePartyKey(party.id, lookup);
                    const logoUrl = party.logo || lookup[rk]?.logo || "";
                    const partyColor = party.color || lookup[rk]?.color || "#e8465a";
                    const edadMedia = edadMediaPorPartido[party.nombre] || edadMediaPorPartido[party.id];
                    return (
                      <div key={party.id} className="r-party-card" style={{ borderColor: `${partyColor}20` }} onClick={() => setSelectedPartyForStats(party.nombre)}>
                        <div className="r-party-card-top">
                          <div className="r-party-logo-wrap" style={{ background: `${partyColor}18` }}>
                            {logoUrl ? <img src={logoUrl} alt={party.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: partyColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>{party.nombre.charAt(0)}</div>}
                          </div>
                          <div className="r-party-info">
                            <div className="r-party-name">{party.nombre}</div>
                            <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                            {activeTab === "general" && edadMedia && (
                              <div className="r-party-edad">
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a96e", display: "inline-block", flexShrink: 0 }} />
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
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Sub-tabs */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#f0eff8", margin: 0 }}>Valoración de Líderes</h2>
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
                              const lk = km[leader.fieldName]; const ld = lk ? LEADERS[lk] : null; const lp = ld?.image;
                              let li: string | undefined;
                              if (lp) { const fn = lp.split("/").pop(); if (fn) { const ek = Object.keys(EMBEDDED_LEADERS).find(k => k.toLowerCase().includes(fn.toLowerCase().replace(/\.[^/.]+$/, ""))); if (ek) li = EMBEDDED_LEADERS[ek]; } }
                              if (!li && lp) li = lp;
                              const scoreColor = leader.average >= 7 ? "#22c55e" : leader.average >= 4 ? "#f59e0b" : "#e8465a";
                              return (
                                <div key={leader.fieldName} className="r-leader-card">
                                  {li
                                    ? <img src={li} alt={leader.name} className="r-leader-img" style={{ border: `2px solid ${scoreColor}30` }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                    : <div className="r-leader-img-placeholder">{leader.name.charAt(0)}</div>}
                                  <div className="r-leader-name">{leader.name}</div>
                                  <div className="r-leader-score" style={{ color: scoreColor }}>{leader.average.toFixed(1)}</div>
                                  <div style={{ fontSize: 10, color: "#7a7990", marginBottom: 8 }}>sobre 10</div>
                                  <div className="r-leader-bar-track">
                                    <div className="r-leader-bar-fill" style={{ background: scoreColor, width: `${(leader.average / 10) * 100}%` }} />
                                  </div>
                                  <div className="r-leader-count">{leader.count.toLocaleString("es-ES")} valoraciones</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="r-section">
                            <div className="r-section-title" style={{ marginBottom: 16 }}>Comparativa</div>
                            <ResponsiveContainer width="100%" height={320}>
                              <BarChart data={leaderRatings}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" angle={-30} textAnchor="end" height={80} fontSize={11} tick={{ fill: "#7a7990" }} />
                                <YAxis stroke="rgba(255,255,255,0.1)" domain={[0, 10]} fontSize={11} tick={{ fill: "#7a7990" }} />
                                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => v.toFixed(1)} />
                                <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                                  {leaderRatings.map((l) => {
                                    const c = l.average >= 7 ? "#22c55e" : l.average >= 4 ? "#f59e0b" : "#e8465a";
                                    return <Cell key={l.fieldName} fill={c} fillOpacity={0.85} />;
                                  })}
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

              {/* Mapa y Hemiciclo */}
              {activeTab === "mapa-hemiciclo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.keys(votosPorProvincia).length > 0 ? (
                    <>
                      <div className="r-section">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                          <div className="r-section-title">Mapa Provincial</div>
                          <div className="r-map-toggle">
                            {(["schematic", "realistic"] as const).map(v => (
                              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                                {v === "schematic" ? <><Grid3x3 size={12} />Esquemática</> : <><Map size={12} />Realista</>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {mapView === "schematic"
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvincia} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={generalPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionada(p); setVotosPorPartidoProvincia(v); setEscanosProvincia(e); }} />}
                      </div>
                      <div className="r-section">
                        <div className="r-section-title" style={{ marginBottom: 16 }}>Pactómetro</div>
                        <PactometerInteractive stats={generalStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
                      </div>
                      <div className="r-section">
                        <div className="r-section-title" style={{ marginBottom: 16 }}>Hemiciclo del Congreso</div>
                        <CongressHemicycle escanos={escanosGeneralesPorProvincia} totalEscanos={350} provinciaSeleccionada={provinciaSeleccionada} votosProvincia={votosPorPartidoProvincia} escanosProvincia={escanosProvincia} partyMeta={generalPartyMetaLookup} />
                      </div>
                    </>
                  ) : <div className="r-section" style={{ textAlign: "center", color: "#7a7990" }}>Cargando datos de provincias...</div>}
                </div>
              )}

              {/* Mapa Juvenil */}
              {activeTab === "asoc-juv-mapa-hemiciclo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                    <>
                      <div className="r-section">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                          <div className="r-section-title">Mapa — Asociaciones Juveniles</div>
                          <div className="r-map-toggle">
                            {(["schematic", "realistic"] as const).map(v => (
                              <button key={v} className={`r-map-btn${mapView === v ? " active" : ""}`} onClick={() => setMapView(v)}>
                                {v === "schematic" ? <><Grid3x3 size={12} />Esquemática</> : <><Map size={12} />Realista</>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {mapView === "schematic"
                          ? <SpainMapProvincial votosPorProvincia={votosPorProvinciaJuveniles} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />
                          : <SpainMapRealistic votosPorProvincia={votosPorProvinciaJuveniles} provinciaMetricsMap={provinciaMetricsMapJuveniles} isYouthAssociations={true} partyMeta={youthPartyMetaLookup} onProvinceClick={(p, d, v, e) => { setProvinciaSeleccionadaJuveniles(p); setVotosPorPartidoProvinciaJuveniles(v); setEscanosProvinciaJuveniles(e); }} />}
                      </div>
                      <div className="r-section">
                        {youthStats.length > 0 && <PactometerInteractive stats={youthStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={100} requiredForMajority={51} />}
                      </div>
                      <div className="r-section">
                        <div className="r-section-title" style={{ marginBottom: 16 }}>Hemiciclo Asociaciones Juveniles</div>
                        <CongressHemicycle escanos={escanosJuvenilesPorProvincia} totalEscanos={100} provinciaSeleccionada={provinciaSeleccionadaJuveniles} votosProvincia={votosPorPartidoProvinciaJuveniles} escanosProvincia={escanosProvinciaJuveniles} partyMeta={youthPartyMetaLookup} />
                      </div>
                    </>
                  ) : <div className="r-section" style={{ textAlign: "center", color: "#7a7990" }}>Cargando datos de asociaciones juveniles...</div>}
                </div>
              )}

              {/* Metodología */}
              {!["simulador-electoral", "lideres-partidos", "encuestadoras-externas"].includes(activeTab) && (
                <div className="r-section">
                  <div className="r-section-title" style={{ fontSize: 14, marginBottom: 14 }}>Metodología</div>
                  <div className="r-method">
                    <div className="r-method-item"><div className="r-method-key">Ley d'Hondt.</div><div className="r-method-val">Sistema de reparto proporcional usado en España.</div></div>
                    <div className="r-method-item"><div className="r-method-key">Umbral mínimo.</div><div className="r-method-val">3% en generales, 4% en asociaciones juveniles.</div></div>
                    <div className="r-method-item"><div className="r-method-key">Actualización.</div><div className="r-method-val">Datos en tiempo real cada 10 segundos.</div></div>
                  </div>
                </div>
              )}

              <CommentsSection activeTab={activeTab === "simulador-electoral" ? "general" : activeTab} />

              <div className="r-cta">
                <p className="r-cta-text">¿Aún no has respondido la encuesta?</p>
                <button className="r-cta-btn" onClick={() => setLocation("/encuesta")}>Responder Encuesta</button>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.8)", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "#5a596a" }}>
          La Encuesta de Batalla Cultural © 2025 · Datos anónimos y públicos
        </footer>

        <PartyStatsModal isOpen={!!selectedPartyForStats} onClose={() => setSelectedPartyForStats(null)} partyName={selectedPartyForStats || ""} partyType={activeTab === "general" ? "general" : "youth"} />
        <AIAnalysisModal open={showAIAnalysis} onOpenChange={setShowAIAnalysis} totalResponses={totalResponses} edadPromedio={edadPromedio} ideologiaPromedio={ideologiaPromedio} topParties={[...stats].sort((a, b) => b.votos - a.votos).slice(0, 5)} />
        {showInfografiaModal && <InfografiaModal parties={generalStats} onClose={() => setShowInfografiaModal(false)} onGenerate={exportToPDF} />}
      </div>
    </>
  );
}
