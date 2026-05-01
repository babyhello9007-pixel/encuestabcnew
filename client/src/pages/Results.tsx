// ═══════════════════════════════════════════════════════════════════════════
// Results.tsx — Versión COMPLETA REPARADA
// Fixes: navbar dropdown funcional, líderes sincronizados, infografía mejorada,
//        simulador electoral, constructor de gobierno avanzado, análisis y contexto histórico
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
  Building2, Crown, UserCheck, AlertTriangle, Activity,
  History, ArrowRight, Zap, Filter, GitBranch, TrendingDown,
  AlertCircle, CheckCircle, Clock, Percent, PieChart, LineChart as LineChartIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Sankey, Sink, Source, Link,
  PieChart as PieChartComp, Pie
} from "recharts";
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
interface CoherenciaData {
  partido_votado: string;
  total_votantes: number;
  pp_valora_sanchez: number;
  psoe_valora_feijoo: number;
  vox_valora_sanchez: number;
  psoe_valora_abascal: number;
}
interface FlujoVoto {
  origen: string;
  destino: string;
  cantidad: number;
}
interface NavTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  submenu?: Array<{ id: string; label: string }>;
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
.r-hbtn-pdf { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #a78bfa; }
.r-hbtn-pdf:hover { background: rgba(139,92,246,0.25); }

/* Navbar mejorada con dropdown */
.r-navbar { position: sticky; top: 58px; z-index: 50; background: rgba(17,17,24,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
.r-navbar-inner { display: flex; align-items: stretch; padding: 0 16px; min-width: max-content; overflow-x: auto; }
.r-navbar-inner::-webkit-scrollbar { height: 3px; }
.r-navbar-inner::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.r-nav-item { position: relative; display: flex; align-items: center; }
.r-nav-btn { display: flex; align-items: center; gap: 6px; padding: 12px 14px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; color: #7a7990; transition: all 0.18s; white-space: nowrap; }
.r-nav-btn:hover { color: #f0eff8; }
.r-nav-btn.active { color: #e8465a; border-bottom-color: #e8465a; }
.r-dropdown { position: absolute; top: 100%; left: 0; min-width: 200px; z-index: 100; background: #18181f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; animation: dropIn 0.15s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.5); margin-top: 2px; display: none; }
.r-dropdown.show { display: block; }
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
.r-leader-score { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 800; color: #e8465a; margin-bottom: 4px; }
.r-leader-party { font-size: 10px; color: #7a7990; }

/* Modal */
.r-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); }
.r-modal { background: #111118; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 90vw; max-height: 90vh; overflow-y: auto; padding: 24px; position: relative; }
.r-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #7a7990; cursor: pointer; font-size: 24px; }

/* Responsive */
@media (max-width: 768px) {
  .r-quickstats { grid-template-columns: repeat(2, 1fr); }
  .r-leader-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
  .r-modal { max-width: 95vw; padding: 16px; }
}
`;

// ─── Navbar Component ─────────────────────────────────────────────────────────
interface NavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: NavTab[];
}

function ResultsNavbar({ activeTab, onTabChange, tabs }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleTabClick = (tabId: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setOpenDropdown(openDropdown === tabId ? null : tabId);
    } else {
      onTabChange(tabId);
      setOpenDropdown(null);
    }
  };

  const handleSubmenuClick = (tabId: string, submenuId: string) => {
    onTabChange(submenuId);
    setOpenDropdown(null);
  };

  return (
    <nav className="r-navbar">
      <div className="r-navbar-inner">
        {tabs.map(tab => (
          <div key={tab.id} className="r-nav-item">
            <button
              className={`r-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id, !!tab.submenu)}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.submenu && <ChevronDown size={14} />}
            </button>
            {tab.submenu && (
              <div className={`r-dropdown ${openDropdown === tab.id ? 'show' : ''}`}>
                {tab.submenu.map(item => (
                  <button
                    key={item.id}
                    className={`r-dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => handleSubmenuClick(tab.id, item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─── Improved Government Builder Component ─────────────────────────────────────
interface MinisterioConfig {
  nombre: string;
  partido: string;
  color: string;
  foto: string | null;
  esIndependiente: boolean;
}

function GovernmentBuilderImproved({ leaders, partyMeta }: { leaders: PartyLeader[]; partyMeta: Record<string, PartyMeta> }) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [ministerios, setMinisterios] = useState<Record<string, MinisterioConfig>>({});
  const [presidenteKey, setPresidenteKey] = useState<string>("");
  const [nombreGobierno, setNombreGobierno] = useState("Gobierno de España");
  const [logoB64, setLogoB64] = useState<string>("");
  const [generando, setGenerando] = useState(false);

  const ministeriosList = [
    "Presidencia", "Defensa", "Interior", "Justicia",
    "Economía", "Hacienda", "Industria", "Transportes",
    "Educación", "Sanidad", "Trabajo", "Cultura",
    "Medio Ambiente", "Agricultura", "Vivienda", "Igualdad"
  ];

  const handleSelectMinister = (ministerId: string, leader: PartyLeader) => {
    const pm = partyMeta[leader.party_key];
    setMinisterios(prev => ({
      ...prev,
      [ministerId]: {
        nombre: leader.leader_name,
        partido: pm?.name || leader.party_key,
        color: pm?.color || leader.color,
        foto: leader.photo_url || null,
        esIndependiente: false,
      }
    }));
  };

  const handleRemoveMinister = (ministerId: string) => {
    setMinisterios(prev => {
      const newState = { ...prev };
      delete newState[ministerId];
      return newState;
    });
  };

  const handleFotoUpload = (ministerId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setMinisterios(prev => ({
        ...prev,
        [ministerId]: { ...prev[ministerId], foto: b64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  const generarInfografia = async () => {
    setGenerando(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1800;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d")!;

      // Fondo
      const bg = ctx.createLinearGradient(0, 0, 0, 1100);
      bg.addColorStop(0, "#08080f");
      bg.addColorStop(1, "#0d0d1a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1800, 1100);

      // Franja color partido
      const selectedPartyMeta = selectedParty ? partyMeta[selectedParty] : null;
      const govColor = selectedPartyMeta?.color || "#C41E3A";
      const topGrad = ctx.createLinearGradient(0, 0, 1800, 0);
      topGrad.addColorStop(0, govColor);
      topGrad.addColorStop(1, govColor + "88");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1800, 8);

      // Header bg
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(0, 8, 1800, 120);

      // Logo presidencia
      if (logoB64) {
        const img = new window.Image();
        await new Promise<void>(r => {
          img.onload = () => { ctx.drawImage(img, 30, 20, 280, 70); r(); };
          img.onerror = r;
          img.src = logoB64;
        });
      }

      // Logo partido
      if (selectedPartyMeta?.logo) {
        const pImg = new window.Image();
        pImg.crossOrigin = "anonymous";
        await new Promise<void>(r => {
          pImg.onload = () => { ctx.drawImage(pImg, 340, 24, 64, 64); r(); };
          pImg.onerror = r;
          pImg.src = selectedPartyMeta.logo;
        });
      }

      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Georgia, serif";
      ctx.fillText(nombreGobierno, 420, 52);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "15px 'DM Sans', sans-serif";
      const dateStr = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long" });
      ctx.fillText(`${selectedPartyMeta?.name || ""} · ${presidenteKey ? `Presidente: ${presidenteKey}` : ""} · ${dateStr}`, 420, 78);

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(30, 140, 1740, 1);

      // Grid ministerios
      const cols = 4;
      const startX = 30;
      const startY = 160;
      const boxW = 420;
      const boxH = 220;

      let idx = 0;
      for (const [ministerId, config] of Object.entries(ministerios)) {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = startX + col * (boxW + 10);
        const y = startY + row * (boxH + 10);

        // Box
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(x, y, boxW, boxH);
        ctx.strokeStyle = config.color + "40";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // Foto
        if (config.foto) {
          const fImg = new window.Image();
          await new Promise<void>(r => {
            fImg.onload = () => { ctx.drawImage(fImg, x + 10, y + 10, 80, 80); r(); };
            fImg.onerror = r;
            fImg.src = config.foto!;
          });
        }

        // Texto
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px 'DM Sans', sans-serif";
        ctx.fillText(config.nombre.slice(0, 20), x + 100, y + 30);
        ctx.fillStyle = config.color;
        ctx.font = "12px 'DM Sans', sans-serif";
        ctx.fillText(config.partido, x + 100, y + 50);
        ctx.fillStyle = "#7a7990";
        ctx.font = "11px 'DM Sans', sans-serif";
        ctx.fillText(ministerId, x + 10, y + 110);

        idx++;
      }

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, 1050, 1800, 1);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "11px monospace";
      ctx.fillText(`Gobierno: ${new Date().toLocaleDateString("es-ES")}`, 30, 1080);

      const link = document.createElement("a");
      link.download = `gobierno-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 0.95);
      link.click();
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="r-section">
      <div className="r-section-title">Constructor de Gobierno</div>
      <p className="r-section-sub">Diseña tu gobierno seleccionando ministros</p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#f0eff8", display: "block", marginBottom: 8 }}>
          Selecciona Partido
        </label>
        <select
          value={selectedParty || ""}
          onChange={(e) => setSelectedParty(e.target.value || null)}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "#18181f",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#f0eff8",
            fontFamily: "inherit",
            cursor: "pointer"
          }}
        >
          <option value="">-- Selecciona un partido --</option>
          {Object.entries(partyMeta).map(([key, meta]) => (
            <option key={key} value={key}>{meta.name}</option>
          ))}
        </select>
      </div>

      {selectedParty && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#f0eff8", display: "block", marginBottom: 8 }}>
            Nombre del Gobierno
          </label>
          <input
            type="text"
            value={nombreGobierno}
            onChange={(e) => setNombreGobierno(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#18181f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#f0eff8",
              fontFamily: "inherit"
            }}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {ministeriosList.map(ministerId => {
          const config = ministerios[ministerId];
          return (
            <div
              key={ministerId}
              style={{
                background: "#18181f",
                border: `1px solid ${config ? (config.color + "40") : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: 12,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {config ? (
                <>
                  {config.foto && (
                    <img
                      src={config.foto}
                      alt={config.nombre}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        margin: "0 auto 8px",
                        objectFit: "cover"
                      }}
                    />
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f0eff8", marginBottom: 4 }}>
                    {config.nombre.slice(0, 15)}
                  </div>
                  <div style={{ fontSize: 10, color: config.color, marginBottom: 8 }}>
                    {config.partido}
                  </div>
                  <button
                    onClick={() => handleRemoveMinister(ministerId)}
                    style={{
                      background: "rgba(232,70,90,0.2)",
                      border: "1px solid rgba(232,70,90,0.5)",
                      color: "#e8465a",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Remover
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7a7990", marginBottom: 8 }}>
                    {ministerId}
                  </div>
                  <button
                    onClick={() => {/* Abrir selector de líderes */}}
                    style={{
                      background: "rgba(99,102,241,0.2)",
                      border: "1px solid rgba(99,102,241,0.5)",
                      color: "#818cf8",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Asignar
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={generarInfografia}
        disabled={generando || Object.keys(ministerios).length === 0}
        style={{
          width: "100%",
          padding: "12px",
          background: generando ? "#5a596a" : "#e8465a",
          border: "none",
          borderRadius: 8,
          color: "#fff",
          fontWeight: 600,
          cursor: generando ? "not-allowed" : "pointer",
          opacity: generando || Object.keys(ministerios).length === 0 ? 0.5 : 1
        }}
      >
        {generando ? "Generando..." : "Descargar Infografía"}
      </button>
    </div>
  );
}

// ─── Electoral Simulator Component ─────────────────────────────────────────────
function ElectoralSimulator({ stats, partyMeta }: { stats: PartyStats[]; partyMeta: Record<string, PartyMeta> }) {
  const [simulatedVotes, setSimulatedVotes] = useState<Record<string, number>>({});
  const [simulatedSeats, setSimulatedSeats] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    stats.forEach(s => {
      initial[s.id] = s.votos;
    });
    setSimulatedVotes(initial);
  }, [stats]);

  const handleVoteChange = (partyId: string, value: number) => {
    setSimulatedVotes(prev => ({ ...prev, [partyId]: Math.max(0, value) }));
    recalculateSeats();
  };

  const recalculateSeats = () => {
    const total = Object.values(simulatedVotes).reduce((a, b) => a + b, 0);
    const seats: Record<string, number> = {};
    stats.forEach(s => {
      const pct = total > 0 ? (simulatedVotes[s.id] / total) * 100 : 0;
      seats[s.id] = Math.round(pct * 3.5); // Aproximación simple
    });
    setSimulatedSeats(seats);
  };

  return (
    <div className="r-section">
      <div className="r-section-title">Simulador Electoral</div>
      <p className="r-section-sub">Ajusta los votos y observa los cambios en escaños</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {stats.map(party => (
          <div key={party.id} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f0eff8", marginBottom: 8 }}>
              {party.nombre}
            </div>
            <input
              type="number"
              value={simulatedVotes[party.id] || 0}
              onChange={(e) => handleVoteChange(party.id, parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                color: "#f0eff8",
                marginBottom: 8,
                fontFamily: "inherit"
              }}
            />
            <div style={{ fontSize: 11, color: "#7a7990" }}>
              Escaños: <span style={{ color: party.color, fontWeight: 700 }}>{simulatedSeats[party.id] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Coherence Analysis Component ─────────────────────────────────────────────
function CoherenceAnalysis() {
  const [coherenceData, setCoherenceData] = useState<CoherenciaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("coherencia_voto_lider")
          .select("*");
        if (data) setCoherenceData(data);
      } catch (e) {
        console.error("Error fetching coherence data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 20 }}>Cargando...</div>;

  return (
    <div className="r-section">
      <div className="r-section-title">Análisis de Coherencia</div>
      <p className="r-section-sub">Detecta incoherencias entre voto y valoración de líderes</p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ textAlign: "left", padding: 8, color: "#7a7990" }}>Partido</th>
              <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>Total Votantes</th>
              <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>Incoherencias</th>
              <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>% Incoherencia</th>
            </tr>
          </thead>
          <tbody>
            {coherenceData.map((row, i) => {
              const totalIncoherent = (row.pp_valora_sanchez || 0) + (row.psoe_valora_feijoo || 0) + 
                                     (row.vox_valora_sanchez || 0) + (row.psoe_valora_abascal || 0);
              const pctIncoherent = row.total_votantes > 0 ? ((totalIncoherent / row.total_votantes) * 100).toFixed(1) : "0";
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: 8, color: "#f0eff8", fontWeight: 600 }}>{row.partido_votado}</td>
                  <td style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>{row.total_votantes}</td>
                  <td style={{ textAlign: "center", padding: 8, color: "#e8465a", fontWeight: 600 }}>{totalIncoherent}</td>
                  <td style={{ textAlign: "center", padding: 8, color: "#f59e0b", fontWeight: 600 }}>{pctIncoherent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Historical Context Component ─────────────────────────────────────────────
function HistoricalContext() {
  const [historicalData, setHistoricalData] = useState<HistoricoEleccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("elecciones_historicas")
          .select("*")
          .order("año", { ascending: false });
        if (data) setHistoricalData(data);
      } catch (e) {
        console.error("Error fetching historical data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 20 }}>Cargando...</div>;

  const years = [...new Set(historicalData.map(d => d.año))].sort((a, b) => b - a);
  const parties = [...new Set(historicalData.map(d => d.partido))];

  return (
    <div className="r-section">
      <div className="r-section-title">Contexto Histórico</div>
      <p className="r-section-sub">Comparativa con elecciones anteriores (2015-2023)</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {parties.slice(0, 8).map(party => {
          const partyData = historicalData.filter(d => d.partido === party).sort((a, b) => b.año - a.año);
          return (
            <div key={party} style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f0eff8", marginBottom: 12 }}>
                {party}
              </div>
              {partyData.slice(0, 3).map((d, i) => (
                <div key={i} style={{ fontSize: 11, marginBottom: 8, paddingBottom: 8, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ color: "#7a7990", marginBottom: 2 }}>{d.año}</div>
                  <div style={{ color: "#f0eff8", fontWeight: 600 }}>
                    {d.porcentaje?.toFixed(2)}% · {d.escanos} esc.
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vote Flow (Sankey) Component ─────────────────────────────────────────────
function VoteFlowAnalysis() {
  const [flowData, setFlowData] = useState<FlujoVoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const { data } = await supabase
          .from("flujos_voto")
          .select("*")
          .order("cantidad", { ascending: false });
        if (data) setFlowData(data);
      } catch (e) {
        console.error("Error fetching flow data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 20 }}>Cargando...</div>;

  return (
    <div className="r-section">
      <div className="r-section-title">Flujos de Voto</div>
      <p className="r-section-sub">Cambios de voto entre elecciones generales y autonómicas</p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ textAlign: "left", padding: 8, color: "#7a7990" }}>Origen (Generales)</th>
              <th style={{ textAlign: "left", padding: 8, color: "#7a7990" }}>Destino (Autonómicas)</th>
              <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {flowData.slice(0, 20).map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: 8, color: "#f0eff8", fontWeight: 600 }}>{row.origen}</td>
                <td style={{ padding: 8, color: "#f0eff8" }}>{row.destino}</td>
                <td style={{ textAlign: "center", padding: 8, color: "#e8465a", fontWeight: 600 }}>{row.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Infografía mejorada con mapa de España ──────────────────────────────────
function InfografiaImproved({ stats, topLeaders }: { stats: PartyStats[]; topLeaders?: any[] }) {
  const downloadInfografia = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;

    // Fondo
    const bg = ctx.createLinearGradient(0, 0, 0, 800);
    bg.addColorStop(0, "#08080f");
    bg.addColorStop(1, "#0d0d1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 800);

    // Header
    ctx.fillStyle = "#f0eff8";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText("Encuesta Electoral", 40, 50);
    ctx.fillStyle = "#7a7990";
    ctx.font = "14px 'DM Sans', sans-serif";
    ctx.fillText(new Date().toLocaleDateString("es-ES"), 40, 80);

    // Top 5 partidos
    const topParties = [...stats].sort((a, b) => b.votos - a.votos).slice(0, 5);
    const maxVotos = Math.max(...topParties.map(p => p.votos), 1);

    topParties.forEach((party, i) => {
      const y = 120 + i * 50;
      const barW = (party.votos / maxVotos) * 600;

      ctx.fillStyle = party.color || "#C41E3A";
      ctx.fillRect(40, y, barW, 30);
      ctx.fillStyle = "#f0eff8";
      ctx.font = "bold 12px 'DM Sans', sans-serif";
      ctx.fillText(party.nombre, 50, y + 20);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`${party.porcentaje.toFixed(1)}%`, barW + 50, y + 20);
    });

    // Hemiciclo
    const hx = 950, hy = 350, hr = 120;
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.arc(hx, hy, hr + 20, Math.PI, 0);
    ctx.fill();

    const sortedBySeats = [...stats].sort((a, b) => b.escanos - a.escanos).filter(s => s.escanos > 0);
    const totalSeats = sortedBySeats.reduce((a, s) => a + s.escanos, 0) || 350;
    let angle = Math.PI;

    sortedBySeats.forEach(party => {
      const span = (party.escanos / totalSeats) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, hr, angle, angle + span);
      ctx.closePath();
      ctx.fillStyle = party.color || "#e8465a";
      ctx.fill();
      angle += span;
    });

    ctx.fillStyle = "#0a0a1a";
    ctx.beginPath();
    ctx.arc(hx, hy, hr * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("350", hx, hy - 5);
    ctx.fillStyle = "#7a7990";
    ctx.font = "11px monospace";
    ctx.fillText("ESCAÑOS", hx, hy + 12);
    ctx.textAlign = "left";

    // Footer
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 750, 1200, 1);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    ctx.fillText("La Encuesta de Batalla Cultural · encuestadebc.es", 40, 775);

    const link = document.createElement("a");
    link.download = `infografia-encuesta-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png", 0.95);
    link.click();
  };

  return (
    <div className="r-section">
      <div className="r-section-title">Infografía Electoral</div>
      <p className="r-section-sub">Resumen visual de resultados</p>
      <button
        onClick={downloadInfografia}
        style={{
          padding: "10px 16px",
          background: "#818cf8",
          border: "none",
          borderRadius: 8,
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Descargar Infografía
      </button>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
type TabKey = "general" | "juventud" | "lideres" | "infografia" | "simulador" | "gobierno" | "analisis" | "contexto" | "flujos";

export default function Results() {
  usePartySync();
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [rankingLideres, setRankingLideres] = useState<RankingLiderPartido[]>([]);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  const [allLeadersForGov, setAllLeadersForGov] = useState<PartyLeader[]>([]);

  useEffect(() => {
    document.title = "La Encuesta de BC";
  }, []);

  const generalPartyMap = useMemo((): Record<string, PartyMeta> => {
    const d: Record<string, PartyMeta> = {};
    partyConfigData.parties.forEach(p => {
      d[String(p.partyKey || "")] = { key: p.partyKey, name: p.displayName, color: p.color, logo: p.logoUrl };
    });
    return d;
  }, [partyConfigData]);

  // Cargar datos principales
  useEffect(() => {
    const fetch_ = async () => {
      try {
        // Cargar estadísticas generales
        const { data: generalData } = await supabase
          .from("respuestas")
          .select("voto_generales")
          .not("voto_generales", "is", null);

        if (generalData) {
          const stats = calcularEscanosGenerales(generalData.map(r => r.voto_generales));
          setGeneralStats(stats);
          setTotalResponses(generalData.length);
        }

        // Cargar ranking de líderes por partido
        const { data: rankingData } = await supabase
          .from("ranking_lideres_por_partido")
          .select("*");

        if (rankingData) {
          setRankingLideres(rankingData);
        }

        // Cargar líderes para constructor de gobierno
        const { data: leadersData } = await supabase
          .from("party_leaders")
          .select("*")
          .eq("is_active", true);

        if (leadersData) {
          setAllLeadersForGov(leadersData);
        }
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
  }, []);

  const navTabs: NavTab[] = [
    { id: "general", label: "General", icon: <Vote size={14} /> },
    { id: "juventud", label: "Juventud", icon: <Users size={14} /> },
    {
      id: "lideres",
      label: "Líderes",
      icon: <Star size={14} />,
      submenu: [
        { id: "lideres-individual", label: "Individual" },
        { id: "lideres-porpartido", label: "Por Partido" }
      ]
    },
    { id: "infografia", label: "Infografía", icon: <Image size={14} /> },
    { id: "simulador", label: "Simulador", icon: <Zap size={14} /> },
    { id: "gobierno", label: "Gobierno", icon: <Building2 size={14} /> },
    {
      id: "analisis",
      label: "Análisis",
      icon: <BarChart2 size={14} />,
      submenu: [
        { id: "coherencia", label: "Coherencia" },
        { id: "flujos", label: "Flujos de Voto" }
      ]
    },
    { id: "contexto", label: "Contexto Histórico", icon: <History size={14} /> }
  ];

  if (loading) {
    return (
      <div className="r-root">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="r-root">
      <style>{RESULTS_CSS}</style>

      {/* Header */}
      <header className="r-header">
        <div className="r-brand">
          <span className="r-brand-title">La Encuesta de BC</span>
          <span className="r-brand-sub">Resultados en vivo</span>
        </div>
        <div className="r-header-actions">
          <button className="r-hbtn r-hbtn-ai" onClick={() => setActiveTab("analisis")}>
            <Sparkles size={14} />
            Análisis IA
          </button>
          <button className="r-hbtn r-hbtn-pdf">
            <Download size={14} />
            PDF
          </button>
        </div>
      </header>

      {/* Navbar mejorada */}
      <ResultsNavbar
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as TabKey)}
        tabs={navTabs}
      />

      {/* Main content */}
      <main className="r-main">
        <div className="r-space">
          {/* Quick Stats */}
          {(activeTab === "general" || activeTab === "juventud") && (
            <div className="r-quickstats">
              <div className="r-stat-card">
                <div className="r-stat-label">Total Respuestas</div>
                <div className="r-stat-value">{totalResponses.toLocaleString("es-ES")}</div>
              </div>
              <div className="r-stat-card">
                <div className="r-stat-label">Partidos</div>
                <div className="r-stat-value">{generalStats.length}</div>
              </div>
              <div className="r-stat-card">
                <div className="r-stat-label">Escaños Total</div>
                <div className="r-stat-value accent">350</div>
              </div>
              <div className="r-stat-card">
                <div className="r-stat-label">Mayoría</div>
                <div className="r-stat-value">176</div>
              </div>
            </div>
          )}

          {/* Tabs Content */}
          {activeTab === "general" && (
            <>
              <div className="r-section">
                <div className="r-section-title">Resultados Generales</div>
                <p className="r-section-sub">Distribución de voto por partido</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {generalStats.map(party => (
                    <div key={party.id} className="r-party-card">
                      <div className="r-party-card-top">
                        <div className="r-party-logo-wrap" style={{ background: party.color + "20" }}>
                          {party.logo && <img src={party.logo} alt={party.nombre} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
                        </div>
                        <div className="r-party-info">
                          <div className="r-party-name">{party.nombre}</div>
                          <div className="r-party-votes">{party.votos.toLocaleString("es-ES")} votos</div>
                        </div>
                        <div className="r-party-seats">
                          <div className="r-party-seats-num" style={{ color: party.color }}>
                            {party.escanos}
                          </div>
                          <div className="r-party-seats-label">escaños</div>
                        </div>
                      </div>
                      <div className="r-party-bar-wrap">
                        <div className="r-party-bar-labels">
                          <span>0%</span>
                          <span style={{ color: party.color, fontWeight: 700 }}>{party.porcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="r-party-bar-track">
                          <div className="r-party-bar-fill" style={{ width: `${party.porcentaje}%`, background: party.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "lideres" && (
            <>
              <div className="r-section">
                <div className="r-section-title">Líderes Preferidos</div>
                <p className="r-section-sub">Ranking de líderes más votados por partido</p>
                {rankingLideres.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ textAlign: "left", padding: 8, color: "#7a7990" }}>Partido</th>
                          <th style={{ textAlign: "left", padding: 8, color: "#7a7990" }}>Líder</th>
                          <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>Votos</th>
                          <th style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingLideres.slice(0, 20).map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <td style={{ padding: 8, color: "#f0eff8", fontWeight: 600 }}>{row.partido}</td>
                            <td style={{ padding: 8, color: "#f0eff8" }}>{row.lider_preferido}</td>
                            <td style={{ textAlign: "center", padding: 8, color: "#7a7990" }}>{row.total_votos}</td>
                            <td style={{ textAlign: "center", padding: 8, color: "#e8465a", fontWeight: 600 }}>{row.porcentaje}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 20, color: "#7a7990" }}>
                    No hay datos de líderes disponibles
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "infografia" && (
            <InfografiaImproved stats={generalStats} />
          )}

          {activeTab === "simulador" && (
            <ElectoralSimulator stats={generalStats} partyMeta={generalPartyMap} />
          )}

          {activeTab === "gobierno" && (
            <GovernmentBuilderImproved leaders={allLeadersForGov} partyMeta={generalPartyMap} />
          )}

          {activeTab === "coherencia" && (
            <CoherenceAnalysis />
          )}

          {activeTab === "flujos" && (
            <VoteFlowAnalysis />
          )}

          {activeTab === "contexto" && (
            <HistoricalContext />
          )}
        </div>
      </main>
    </div>
  );
}
