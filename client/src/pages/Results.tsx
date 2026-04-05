import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LEADERS } from '@/lib/surveyData';
import { EMBEDDED_LEADERS } from '@/lib/embeddedLeaders';
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { calcularEscanosGeneralesPorProvincia, calcularEscanosJuvenilesPorProvincia } from "@/lib/dhondtByProvince";
import { Loader2, Download, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ShareResultsModern } from "@/components/ShareResultsModern";
import { CommentsSection } from "@/components/CommentsSection";
import { PartyMetricsDisplay } from "@/components/PartyMetricsDisplay";
import { TrendenciesChart } from "@/components/TrendenciesChart";
import PartyLogo from "@/components/PartyLogo";
import { PartyStatsModal } from "@/components/PartyStatsModal";
import { LeadersResultsChart } from "@/components/LeadersResultsChart";
import { CCAAResltsSection } from "@/components/CCAAResltsSection";
import { ProvincesResultsSection } from "@/components/ProvincesResultsSection";
import { CCAAComparisonSection } from "@/components/CCAAComparisonSection";
import { SpainMapProvincial } from "@/components/results/SpainMapProvincial";
import { SpainMapRealistic } from "@/components/results/SpainMapRealistic";
import { ParliamentHemicycle } from "@/components/results/ParliamentHemicycle";
import { CongressHemicycle } from "@/components/results/CongressHemicycle";

import EncuestadorasGrid from "@/components/results/EncuestadorasGrid";
import EncuestasExternasTable from "@/components/results/EncuestasExternasTable";
import EncuestadorasComparativa from "@/components/results/EncuestadorasComparativa";
import PreguntasVariasSection from "@/components/results/PreguntasVariasSection";
import Footer from "@/components/Footer";
import FollowUsMenu from "@/components/FollowUsMenu";
import Pactometer from "@/components/Pactometer";
import PactometerInteractive from "@/components/PactometerInteractive";

import { Map, Grid3x3, ArrowLeft, Plus, Trash2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AIAnalysisModal } from "@/components/AIAnalysisModal";
import { usePartySync } from "@/hooks/usePartySync";
import { setRuntimePartyConfig } from "@/lib/partyRuntimeConfig";

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

interface PartyMetrics {
  nombre: string;
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

interface CustomSimulatorParty {
  key: string;
  name: string;
  color: string;
}

// ─── Nuevo: líderes de partido desde BD ──────────────────────────────────────
interface PartyLeader {
  id: number;
  party_key: string;
  leader_name: string;
  photo_url: string;
  is_active: boolean;
  // joined from party_configuration
  display_name: string;
  color: string;
  logo_url: string;
}

// ─── Subcomponente: Líderes de Partidos ──────────────────────────────────────
function LideresDePartidosSection({ generalPartyMap }: { generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }> }) {
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("party_leaders")
          .select(`
            id,
            party_key,
            leader_name,
            photo_url,
            is_active,
            party_configuration!inner(display_name, color, logo_url)
          `)
          .eq("is_active", true)
          .order("party_key");

        if (error) throw error;

        const mapped: PartyLeader[] = (data || []).map((row: any) => ({
          id: row.id,
          party_key: row.party_key,
          leader_name: row.leader_name,
          photo_url: row.photo_url,
          is_active: row.is_active,
          display_name: row.party_configuration?.display_name ?? row.party_key,
          color: row.party_configuration?.color ?? "#C41E3A",
          logo_url: row.party_configuration?.logo_url ?? "",
        }));
        setLeaders(mapped);
      } catch (err) {
        console.error("Error fetching party leaders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  // Agrupar por partido
  const byParty = useMemo(() => {
    const map: Record<string, PartyLeader[]> = {};
    leaders.forEach((l) => {
      if (!map[l.party_key]) map[l.party_key] = [];
      map[l.party_key].push(l);
    });
    return map;
  }, [leaders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (Object.keys(byParty).length === 0) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>No hay líderes de partido configurados aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[#2D2D2D]">Líderes de Partidos</h2>
      {Object.entries(byParty).map(([partyKey, partyLeaders]) => {
        const first = partyLeaders[0];
        const partyColor = first.color;
        const partyName = first.display_name;
        const partyLogo = first.logo_url;

        return (
          <div
            key={partyKey}
            className="glass-surface rounded-2xl overflow-hidden border"
            style={{ borderColor: `${partyColor}40` }}
          >
            {/* Cabecera del partido */}
            <div
              className="flex items-center gap-4 px-6 py-4"
              style={{ backgroundColor: `${partyColor}18` }}
            >
              {partyLogo && (
                <PartyLogo src={partyLogo} alt={partyName} partyName={partyName} size={40} strictExternal />
              )}
              <h3 className="text-lg font-bold" style={{ color: partyColor }}>
                {partyName}
              </h3>
              <span className="ml-auto text-xs text-[#666666]">
                {partyLeaders.length} {partyLeaders.length === 1 ? "líder" : "líderes"}
              </span>
            </div>

            {/* Grid de líderes */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {partyLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="flex flex-col items-center gap-2 text-center group"
                >
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden border-2 shadow-md transition-transform group-hover:scale-105"
                    style={{ borderColor: partyColor }}
                  >
                    {leader.photo_url ? (
                      <img
                        src={leader.photo_url}
                        alt={leader.leader_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: partyColor }}
                      >
                        {leader.leader_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#2D2D2D] leading-tight px-1">
                    {leader.leader_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Subcomponente: Simulador Electoral ──────────────────────────────────────
interface SimuladorElectoralProps {
  generalStats: PartyStats[];
  generalPartyMap: Record<string, { key: string; name: string; color: string; logo: string }>;
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
}

function SimuladorElectoral({
  generalStats,
  generalPartyMap,
  votosPorProvincia,
  provinciaMetricsMap,
}: SimuladorElectoralProps) {
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [customParties, setCustomParties] = useState<CustomSimulatorParty[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#7c3aed");
  const [mapView, setMapView] = useState<"schematic" | "realistic">("realistic");
  const [simProvinciaSeleccionada, setSimProvinciaSeleccionada] = useState<string | null>(null);
  const [simVotosProvincia, setSimVotosProvincia] = useState<Record<string, number>>({});
  const [simEscanosProvincia, setSimEscanosProvincia] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  // Inicializar votos desde generalStats (solo una vez)
  useEffect(() => {
    if (generalStats.length > 0 && !initialized) {
      const baseVotes: Record<string, number> = {};
      generalStats.forEach((party) => {
        baseVotes[party.id] = party.votos;
      });
      setSimulatorVotes(baseVotes);
      setInitialized(true);
    }
  }, [generalStats, initialized]);

  const simulatorPartyMap = useMemo(() => {
    const merged: Record<string, { key: string; name: string; color: string; logo: string }> = {
      ...generalPartyMap,
    };
    customParties.forEach((p) => {
      merged[p.key] = { key: p.key, name: p.name, color: p.color, logo: "" };
    });
    return merged;
  }, [generalPartyMap, customParties]);

  const simulatorStats = useMemo(() => {
    const normalizedVotes: Record<string, number> = {};
    Object.entries(simulatorVotes).forEach(([key, value]) => {
      normalizedVotes[key] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    });
    const escanos = calcularEscanosGenerales(normalizedVotes);
    const nombres: Record<string, string> = {};
    const logos: Record<string, string> = {};
    Object.entries(simulatorPartyMap).forEach(([key, party]) => {
      nombres[key] = party.name;
      logos[key] = party.logo;
    });
    return obtenerEstadisticas(normalizedVotes, escanos, nombres, logos).map((s) => ({
      ...s,
      color: simulatorPartyMap[s.id]?.color || "#C41E3A",
    }));
  }, [simulatorVotes, simulatorPartyMap]);

  const simulatorVotesByProvince = useMemo(() => {
    if (!Object.keys(votosPorProvincia).length) return {};
    const totalVotes = Object.values(simulatorVotes).reduce((acc, v) => acc + Math.max(0, Number(v) || 0), 0);
    if (totalVotes === 0) return {};
    const shares = Object.entries(simulatorVotes).reduce<Record<string, number>>((acc, [party, votes]) => {
      acc[party] = Math.max(0, Number(votes) || 0) / totalVotes;
      return acc;
    }, {});
    const simulatedByProvince: Record<string, Record<string, number>> = {};
    Object.entries(votosPorProvincia).forEach(([province, provinceVotes]) => {
      const provinceTotal = Object.values(provinceVotes).reduce((acc, v) => acc + v, 0);
      const simProvince: Record<string, number> = {};
      Object.entries(shares).forEach(([party, share]) => {
        simProvince[party] = Math.round(provinceTotal * share);
      });
      simulatedByProvince[province] = simProvince;
    });
    return simulatedByProvince;
  }, [votosPorProvincia, simulatorVotes]);

  const simulatorEscanosByProvince = useMemo(() => {
    if (!Object.keys(simulatorVotesByProvince).length) return {};
    return calcularEscanosGeneralesPorProvincia(simulatorVotesByProvince);
  }, [simulatorVotesByProvince]);

  const addCustomParty = () => {
    const trimmedName = newPartyName.trim();
    if (!trimmedName) return;
    const slug = trimmedName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
    const baseKey = slug || `PARTY_${Date.now()}`;
    const key = simulatorPartyMap[baseKey] ? `${baseKey}_${Date.now()}` : baseKey;
    setCustomParties((prev) => [...prev, { key, name: trimmedName, color: newPartyColor }]);
    setSimulatorVotes((prev) => ({ ...prev, [key]: 0 }));
    setNewPartyName("");
  };

  const removeCustomParty = (key: string) => {
    setCustomParties((prev) => prev.filter((p) => p.key !== key));
    setSimulatorVotes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetToOriginal = () => {
    const baseVotes: Record<string, number> = {};
    generalStats.forEach((party) => {
      baseVotes[party.id] = party.votos;
    });
    setSimulatorVotes(baseVotes);
    setCustomParties([]);
  };

  const totalSimVotes = Object.values(simulatorVotes).reduce((a, b) => a + Math.max(0, b || 0), 0);

  // Partidos base (de la encuesta) y partidos custom separados
  const basePartyEntries = Object.entries(simulatorPartyMap).filter(
    ([key]) => !customParties.find((cp) => cp.key === key)
  );
  const customPartyEntries = customParties;

  return (
    <div className="space-y-6">
      {/* Panel de control */}
      <div className="glass-surface p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D]">Simulador Electoral</h2>
            <p className="text-sm text-[#666666] mt-1">
              Ajusta los votos de cada partido y simula el reparto de escaños usando la Ley d'Hondt.
            </p>
          </div>
          <Button
            onClick={resetToOriginal}
            variant="outline"
            className="flex items-center gap-2 border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar datos reales
          </Button>
        </div>

        {/* Total de votos simulados */}
        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 flex items-center gap-2">
          <span className="font-semibold">Total votos simulados:</span>
          <span className="text-[#C41E3A] font-bold">{totalSimVotes.toLocaleString()}</span>
        </div>

        {/* Partidos base */}
        <div>
          <h3 className="text-sm font-semibold text-[#2D2D2D] mb-3">Partidos de la encuesta</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {basePartyEntries.map(([partyKey, party]) => {
              const pct = totalSimVotes > 0
                ? (((simulatorVotes[partyKey] ?? 0) / totalSimVotes) * 100).toFixed(1)
                : "0.0";
              return (
                <label
                  key={partyKey}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
                >
                  {party.logo ? (
                    <PartyLogo src={party.logo} alt={party.name} partyName={party.name} size={28} strictExternal />
                  ) : (
                    <span
                      className="h-5 w-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: party.color }}
                    />
                  )}
                  <span className="min-w-[100px] text-sm font-semibold text-slate-700 truncate flex-1">
                    {party.name}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right">{pct}%</span>
                  <input
                    type="number"
                    min={0}
                    value={simulatorVotes[partyKey] ?? 0}
                    onChange={(e) =>
                      setSimulatorVotes((prev) => ({
                        ...prev,
                        [partyKey]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Partidos personalizados */}
        {customPartyEntries.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#2D2D2D] mb-3">Partidos personalizados</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {customPartyEntries.map((party) => {
                const pct = totalSimVotes > 0
                  ? (((simulatorVotes[party.key] ?? 0) / totalSimVotes) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div
                    key={party.key}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3"
                  >
                    <span
                      className="h-5 w-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: party.color }}
                    />
                    <span className="min-w-[100px] text-sm font-semibold text-slate-700 truncate flex-1">
                      {party.name}
                    </span>
                    <span className="text-xs text-slate-400 w-12 text-right">{pct}%</span>
                    <input
                      type="number"
                      min={0}
                      value={simulatorVotes[party.key] ?? 0}
                      onChange={(e) =>
                        setSimulatorVotes((prev) => ({
                          ...prev,
                          [party.key]: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                    <button
                      onClick={() => removeCustomParty(party.key)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Añadir partido personalizado */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Crear partido personalizado
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomParty()}
              placeholder="Nombre del partido"
              className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Color</label>
              <input
                type="color"
                value={newPartyColor}
                onChange={(e) => setNewPartyColor(e.target.value)}
                className="h-10 w-14 rounded-md border border-slate-300 bg-white cursor-pointer"
              />
            </div>
            <Button
              onClick={addCustomParty}
              className="bg-[#C41E3A] hover:bg-[#A01830] text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Añadir
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados simulados: tabla rápida */}
      <div className="glass-surface p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Escaños simulados</h3>
        <div className="space-y-3">
          {[...simulatorStats]
            .sort((a, b) => b.escanos - a.escanos)
            .filter((s) => s.escanos > 0 || s.votos > 0)
            .map((party) => (
              <div key={party.id} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: party.color }}
                />
                <span className="text-sm font-semibold text-[#2D2D2D] w-36 truncate">
                  {party.nombre}
                </span>
                <div className="flex-1 h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: party.color,
                      width: `${(party.escanos / 350) * 100}%`,
                    }}
                  />
                </div>
                <span
                  className="text-lg font-bold w-10 text-right"
                  style={{ color: party.color }}
                >
                  {party.escanos}
                </span>
                <span className="text-xs text-[#666666] w-14 text-right">
                  {party.porcentaje.toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Pactómetro simulado */}
      <div className="liquid-glass p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Pactómetro Simulado</h2>
        <PactometerInteractive
          stats={simulatorStats.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            escanos: s.escanos,
            porcentaje: s.porcentaje,
            color: s.color,
          }))}
          totalSeats={350}
          requiredForMajority={176}
        />
      </div>

      {/* Mapa simulado */}
      <div className="liquid-glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias (Simulado)</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setMapView("schematic")}
              variant={mapView === "schematic" ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                mapView === "schematic"
                  ? "bg-[#C41E3A] hover:bg-[#A01830] text-white"
                  : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Esquemática
            </Button>
            <Button
              onClick={() => setMapView("realistic")}
              variant={mapView === "realistic" ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                mapView === "realistic"
                  ? "bg-[#C41E3A] hover:bg-[#A01830] text-white"
                  : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
              }`}
            >
              <Map className="w-4 h-4" />
              Realista
            </Button>
          </div>
        </div>
        {mapView === "schematic" ? (
          <SpainMapProvincial
            votosPorProvincia={simulatorVotesByProvince}
            isYouthAssociations={false}
            partyMeta={simulatorPartyMap}
            onProvinceClick={(province, data, votos, escanos) => {
              setSimProvinciaSeleccionada(province);
              setSimVotosProvincia(votos);
              setSimEscanosProvincia(escanos);
            }}
          />
        ) : (
          <SpainMapRealistic
            votosPorProvincia={simulatorVotesByProvince}
            provinciaMetricsMap={provinciaMetricsMap}
            isYouthAssociations={false}
            partyMeta={simulatorPartyMap}
            onProvinceClick={(province, data, votos, escanos) => {
              setSimProvinciaSeleccionada(province);
              setSimVotosProvincia(votos);
              setSimEscanosProvincia(escanos);
            }}
          />
        )}
      </div>

      {/* Hemiciclo simulado */}
      <div className="liquid-glass p-4 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo Simulado</h2>
        <CongressHemicycle
          escanos={simulatorEscanosByProvince}
          totalEscanos={350}
          provinciaSeleccionada={simProvinciaSeleccionada}
          votosProvincia={simVotosProvincia}
          escanosProvincia={simEscanosProvincia}
          partyMeta={simulatorPartyMap}
        />
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
  const [activeTab, setActiveTab] = useState<
    | "general"
    | "youth"
    | "leaders"
    | "metrics"
    | "tendencias"
    | "lideres-preferidos"
    | "ccaa"
    | "provincias"
    | "comparacion-ccaa"
    | "mapa-hemiciclo"
    | "asoc-juv-mapa-hemiciclo"
    | "encuestadoras-externas"
    | "preguntas-varias"
    | "simulador-electoral"
    | "el-analisis"
    | "lideres-partidos"
  >("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [edadPromedio, setEdadPromedio] = useState<number | null>(null);
  const [ideologiaPromedio, setIdeologiaPromedio] = useState<number | null>(null);
  const [generalMetrics, setGeneralMetrics] = useState<PartyMetrics[]>([]);
  const [youthMetrics, setYouthMetrics] = useState<PartyMetrics[]>([]);
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
  const [provinciaMetricsMapJuveniles, setProvinciaMetricsMapJuveniles] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });

  useEffect(() => {
    document.title = "La Encuesta de BC";
  }, []);

  const normalizePartyKey = (value: string) => value?.trim().toUpperCase();

  const generalPartyMap = useMemo(() => {
    const defaults: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    if (!partyConfigData?.parties?.length) return defaults;
    partyConfigData.parties.forEach((party) => {
      const rawKey = String(party.partyKey || "");
      defaults[rawKey] = {
        key: party.partyKey,
        name: party.displayName,
        color: party.color,
        logo: party.logoUrl,
      };
    });
    return defaults;
  }, [partyConfigData]);

  const youthPartyMap = useMemo(() => {
    const defaults: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    if (!partyConfigData?.youth?.length) return defaults;
    partyConfigData.youth.forEach((party) => {
      const rawKey = String(party.partyKey || "");
      defaults[rawKey] = {
        key: party.partyKey,
        name: party.displayName,
        color: party.color,
        logo: party.logoUrl,
      };
    });
    return defaults;
  }, [partyConfigData]);

  const resolvePartyKey = (
    value: string,
    metaMap: Record<string, { key: string; name: string; color: string; logo: string }>
  ) => {
    if (metaMap[value]) return value;
    const normalized = normalizePartyKey(value);
    if (!normalized) return value;
    const foundKey = Object.keys(metaMap).find((k) => normalizePartyKey(k) === normalized);
    if (foundKey) return foundKey;
    const foundByPartyKey = Object.entries(metaMap).find(
      ([, party]) => normalizePartyKey(String(party?.key || "")) === normalized
    )?.[0];
    if (foundByPartyKey) return foundByPartyKey;
    const foundByDisplayName = Object.entries(metaMap).find(
      ([, party]) => normalizePartyKey(String(party?.name || "")) === normalized
    )?.[0];
    if (foundByDisplayName) return foundByDisplayName;
    return foundKey || value;
  };

  const generalPartyMetaLookup = useMemo(() => {
    const lookup: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    Object.entries(generalPartyMap).forEach(([mapKey, party]) => {
      const aliases = [mapKey, party.key, party.name, normalizePartyKey(mapKey), normalizePartyKey(party.key), normalizePartyKey(party.name)];
      aliases.forEach((alias) => {
        if (alias) lookup[String(alias)] = party;
      });
    });
    return lookup;
  }, [generalPartyMap]);

  const youthPartyMetaLookup = useMemo(() => {
    const lookup: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    Object.entries(youthPartyMap).forEach(([mapKey, party]) => {
      const aliases = [mapKey, party.key, party.name, normalizePartyKey(mapKey), normalizePartyKey(party.key), normalizePartyKey(party.name)];
      aliases.forEach((alias) => {
        if (alias) lookup[String(alias)] = party;
      });
    });
    return lookup;
  }, [youthPartyMap]);

  useEffect(() => {
    if (Object.keys(votosPorProvincia).length > 0 && generalStats.length > 0) {
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      setEscanosGeneralesPorProvincia(escanos);
      const statsActualizados = generalStats.map((stat) => ({
        ...stat,
        escanos: escanos[stat.id] || 0,
      }));
      setGeneralStats(statsActualizados);
    }
  }, [votosPorProvincia]);

  useEffect(() => {
    if (Object.keys(votosPorProvinciaJuveniles).length > 0 && youthStats.length > 0) {
      const escanos = calcularEscanosJuvenilesPorProvincia(votosPorProvinciaJuveniles);
      setEscanosJuvenilesPorProvincia(escanos);
      const statsActualizados = youthStats.map((stat) => ({
        ...stat,
        escanos: escanos[stat.id] || 0,
      }));
      setYouthStats(statsActualizados);
    }
  }, [votosPorProvinciaJuveniles]);

  useEffect(() => {
    const loadPartyConfig = async () => {
      const { data, error } = await supabase
        .from("party_configuration")
        .select("party_key, display_name, color, logo_url, party_type, is_active")
        .eq("is_active", true);
      if (error) {
        console.error("Error loading party configuration:", error);
        return;
      }
      const allRows = data || [];
      setRuntimePartyConfig(
        allRows.map((row: any) => ({
          key: row.party_key,
          displayName: row.display_name,
          color: row.color,
          logoUrl: row.logo_url,
          partyType: row.party_type,
        }))
      );
      setPartyConfigData({
        parties: allRows
          .filter((row: any) => row.party_type === "general")
          .map((row: any) => ({
            partyKey: row.party_key,
            displayName: row.display_name,
            color: row.color,
            logoUrl: row.logo_url,
          })),
        youth: allRows
          .filter(
            (row: any) =>
              row.party_type === "youth" ||
              row.party_type === "asociacion_juvenil" ||
              row.party_type === "juvenile"
          )
          .map((row: any) => ({
            partyKey: row.party_key,
            displayName: row.display_name,
            color: row.color,
            logoUrl: row.logo_url,
          })),
      });
    };

    loadPartyConfig();
    const channel = supabase
      .channel("party-configuration-results")
      .on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, () => {
        loadPartyConfig();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Total respuestas
        try {
          const { data: viewData } = await supabase.from("total_respuestas_view").select("total_respuestas");
          setTotalResponses(viewData?.[0]?.total_respuestas || 0);
        } catch {
          try {
            const { count } = await supabase.from("respuestas").select("*", { count: "exact", head: true });
            setTotalResponses(count || 0);
          } catch {
            setTotalResponses(631);
          }
        }

        // Votos generales
        try {
          const { data: generalData } = await supabase.from("votos_generales_totales").select("*");
          if (generalData && generalData.length > 0) {
            const generalVotos: Record<string, number> = {};
            Object.keys(generalPartyMap).forEach((key) => { generalVotos[key] = 0; });
            generalData.forEach((row: any) => {
              const partyKey = resolvePartyKey(String(row.partido_id || ""), generalPartyMap);
              generalVotos[partyKey] = row.votos;
            });
            let escanos: Record<string, number> = {};
            if (Object.keys(votosPorProvincia).length > 0) {
              escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
            } else {
              escanos = calcularEscanosGenerales(generalVotos);
            }
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([key, party]) => {
              nombres[key] = party.name;
              logos[key] = party.logo;
            });
            const stats = obtenerEstadisticas(generalVotos, escanos, nombres, logos).map((s) => ({
              ...s,
              color: generalPartyMap[resolvePartyKey(s.id, generalPartyMap)]?.color,
            }));
            setGeneralStats(stats);

            // Votos por provincia
            try {
              const { data: provinciaData, error } = await supabase
                .from("votos_por_provincia_view")
                .select("provincia, partido, votos");
              if (!error && provinciaData && provinciaData.length > 0) {
                const votosProv: Record<string, Record<string, number>> = {};
                provinciaData.forEach((row: any) => {
                  if (row.provincia && row.partido) {
                    if (!votosProv[row.provincia]) votosProv[row.provincia] = {};
                    const partyKey = resolvePartyKey(String(row.partido), generalPartyMap);
                    votosProv[row.provincia][partyKey] = row.votos;
                  }
                });
                setVotosPorProvincia(votosProv);

                // Métricas por provincia
                try {
                  const { data: metricsData } = await supabase
                    .from("respuestas")
                    .select("provincia, edad, posicion_ideologica");
                  if (metricsData && metricsData.length > 0) {
                    const provinciaCounts: Record<string, { edad_sum: number; ideologia_sum: number; count: number }> = {};
                    metricsData.forEach((row: any) => {
                      if (row.provincia) {
                        if (!provinciaCounts[row.provincia]) provinciaCounts[row.provincia] = { edad_sum: 0, ideologia_sum: 0, count: 0 };
                        if (row.edad != null) provinciaCounts[row.provincia].edad_sum += row.edad;
                        if (row.posicion_ideologica != null) provinciaCounts[row.provincia].ideologia_sum += row.posicion_ideologica;
                        provinciaCounts[row.provincia].count += 1;
                      }
                    });
                    const metricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }> = {};
                    Object.entries(provinciaCounts).forEach(([provincia, counts]) => {
                      metricsMap[provincia] = {
                        edad_promedio: counts.count > 0 ? counts.edad_sum / counts.count : 0,
                        ideologia_promedio: counts.count > 0 ? counts.ideologia_sum / counts.count : 0,
                      };
                    });
                    setProvinciaMetricsMap(metricsMap);
                  }
                } catch (err) {
                  console.error("Error fetching provincia metrics:", err);
                }
              }
            } catch (err) {
              console.error("Error fetching votos por provincia:", err);
            }
          } else {
            // Datos de ejemplo
            const exampleVotos: Record<string, number> = { PP: 180, PSOE: 120, VOX: 85, SUMAR: 65, PODEMOS: 45, JUNTS: 35, ERC: 30, PNV: 25, ALIANZA: 15, BILDU: 20, SAF: 40, CC: 10, UPN: 8, CIUDADANOS: 12, CAMINANDO: 5, FRENTE: 3, IZQUIERDA: 8, JUNTOS_EXT: 6, PLIB: 4, EB: 2, BNG: 7 };
            const escanos = calcularEscanosGenerales(exampleVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([key, party]) => { nombres[key] = party.name; logos[key] = party.logo; });
            const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos).map((s) => ({ ...s, color: generalPartyMap[resolvePartyKey(s.id, generalPartyMap)]?.color }));
            setGeneralStats(stats);
          }
        } catch (err) {
          console.error("Error fetching general votes:", err);
        }

        // Votos juveniles
        try {
          const { data: youthData } = await supabase.from("votos_juveniles_totales").select("*");
          if (youthData && youthData.length > 0) {
            const youthVotos: Record<string, number> = {};
            youthData.forEach((row: any) => {
              const assocKey = resolvePartyKey(String(row.asociacion_id || ""), youthPartyMap);
              youthVotos[assocKey] = row.votos;
            });
            const escanos = calcularEscanosJuveniles(youthVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([key, assoc]) => { nombres[key] = assoc.name; logos[key] = assoc.logo; });
            const stats = obtenerEstadisticas(youthVotos, escanos, nombres, logos).map((s) => ({ ...s, color: youthPartyMap[resolvePartyKey(s.id, youthPartyMap)]?.color }));
            setYouthStats(stats);
          }
        } catch (err) {
          console.error("Error fetching youth votes:", err);
        }

        // Votos juveniles por provincia
        try {
          const { data: provinciaJuvenilData } = await supabase.from("votos_por_provincia_juveniles_view").select("provincia, asociacion, votos");
          if (provinciaJuvenilData && provinciaJuvenilData.length > 0) {
            const votosProvJuveniles: Record<string, Record<string, number>> = {};
            provinciaJuvenilData.forEach((row: any) => {
              if (row.provincia && row.asociacion) {
                if (!votosProvJuveniles[row.provincia]) votosProvJuveniles[row.provincia] = {};
                const assocKey = resolvePartyKey(String(row.asociacion), youthPartyMap);
                votosProvJuveniles[row.provincia][assocKey] = row.votos;
              }
            });
            setVotosPorProvinciaJuveniles(votosProvJuveniles);
          }
        } catch (err) {
          console.error("Error fetching votos por provincia juveniles:", err);
        }

        // Valoraciones de líderes
        try {
          const { data: viewData } = await supabase.from("valoraciones_lideres_view").select("*");
          if (viewData && viewData.length > 0) {
            const leaderMap: Record<string, { name: string; fieldName: string }> = {
              feijoo: { name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" },
              sanchez: { name: "Pedro Sánchez", fieldName: "val_sanchez" },
              abascal: { name: "Santiago Abascal", fieldName: "val_abascal" },
              alvise: { name: "Alvise Pérez", fieldName: "val_alvise" },
              yolanda_diaz: { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" },
              irene_montero: { name: "Irene Montero", fieldName: "val_irene_montero" },
              ayuso: { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" },
              buxade: { name: "Jorge Buxadé", fieldName: "val_buxade" },
            };
            const ratings: LeaderRating[] = viewData.map((row: any) => {
              const leader = leaderMap[row.lider];
              return { name: leader.name, fieldName: leader.fieldName, average: parseFloat(row.valoracion_media) || 0, count: row.total_valoraciones || 0 };
            });
            setLeaderRatings(ratings);
          }
        } catch {
          try {
            const { data: allResponses } = await supabase.from("respuestas").select("val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade");
            if (allResponses && allResponses.length > 0) {
              const leaders = [
                { name: "Alberto Núñez Feijóo", fieldName: "val_feijoo" },
                { name: "Pedro Sánchez", fieldName: "val_sanchez" },
                { name: "Santiago Abascal", fieldName: "val_abascal" },
                { name: "Alvise Pérez", fieldName: "val_alvise" },
                { name: "Yolanda Díaz", fieldName: "val_yolanda_diaz" },
                { name: "Irene Montero", fieldName: "val_irene_montero" },
                { name: "Isabel Díaz Ayuso", fieldName: "val_ayuso" },
                { name: "Jorge Buxadé", fieldName: "val_buxade" },
              ];
              const ratings: LeaderRating[] = leaders.map((leader) => {
                let sum = 0; let count = 0;
                allResponses.forEach((r: any) => {
                  const value = r[leader.fieldName];
                  if (value != null) { sum += value; count += 1; }
                });
                return { name: leader.name, fieldName: leader.fieldName, average: Math.round(count > 0 ? (sum / count) * 10 : 0) / 10, count };
              });
              setLeaderRatings(ratings);
            }
          } catch (err) {
            console.error("Error fetching leader ratings:", err);
          }
        }

        // Nota ejecutivo
        try {
          const { data: notaData } = await supabase.from("media_nota_ejecutivo").select("nota_media");
          if (notaData && notaData.length > 0) setNotaEjecutivo(notaData[0].nota_media);
        } catch { /* opcional */ }

        // Edad promedio
        try {
          const { data: edadData } = await supabase.from("edad_promedio").select("edad_media");
          if (edadData && edadData.length > 0) setEdadPromedio(edadData[0].edad_media);
        } catch (err) { console.error("Error fetching edad promedio:", err); }

        // Ideología promedio
        try {
          const { data: ideologiaData } = await supabase.from("ideologia_promedio").select("ideologia_media");
          if (ideologiaData && ideologiaData.length > 0) setIdeologiaPromedio(ideologiaData[0].ideologia_media);
        } catch (err) { console.error("Error fetching ideologia promedio:", err); }
      } catch (error) {
        console.error("Error fetching results:", error);
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
    const map: Record<string, string> = {};
    [...Object.values(generalPartyMap), ...Object.values(youthPartyMap)].forEach((party: any) => {
      if (!party) return;
      const key = typeof party.key === "string" ? party.key.toUpperCase() : "";
      const name = typeof party.name === "string" ? party.name.toUpperCase() : "";
      if (key && party.color) map[key] = party.color;
      if (name && party.color) map[name] = party.color;
    });
    return map;
  }, [generalPartyMap, youthPartyMap]);

  const exportToCSV = () => {
    const headers = ["Partido/Asociación", "Votos", "Porcentaje", "Escaños", "Porcentaje de Escaños"];
    const rows = stats.map((party) => [
      party.nombre,
      party.votos,
      party.porcentaje.toFixed(2) + "%",
      party.escanos,
      ((party.escanos / totalEscanos) * 100).toFixed(2) + "%",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `resultados-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const { downloadPDFWithMetrics } = await import("@/lib/pdfExportMetrics");
      const exportTab = activeTab === "simulador-electoral" ? "general" : activeTab;
      await downloadPDFWithMetrics(stats, exportTab, totalResponses, edadPromedio, ideologiaPromedio);
    } catch (err) {
      console.error("Error exporting to PDF:", err);
    }
  };

  // Tabs de navegación
  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "general", label: "Elecciones Generales" },
    { key: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
    { key: "encuestadoras-externas", label: "Encuestadoras" },
    { key: "ccaa", label: "CCAA" },
    { key: "provincias", label: "Provincias" },
    { key: "comparacion-ccaa", label: "Comparar CCAA" },
    { key: "youth", label: "Asociaciones" },
    { key: "asoc-juv-mapa-hemiciclo", label: "Asoc. Juveniles; Mapa y Hemiciclo" },
    { key: "leaders", label: "Líderes Preferidos" },
    { key: "tendencias", label: "Variación de Votaciones por Día" },
    { key: "lideres-preferidos", label: "Líderes de Partidos (Valoración)" },
    { key: "lideres-partidos", label: "Líderes de Partidos" },
    { key: "preguntas-varias", label: "Preguntas Varias" },
    { key: "simulador-electoral", label: "Simulador Electoral" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-foreground">Resultados - Batalla Cultural</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/")} variant="outline" className="btn-secondary text-sm">
              Volver
            </Button>
            <FollowUsMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-10">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="space-y-8">
            {/* Estadísticas globales */}
            <div className="glass-surface p-4 sm:p-6 md:p-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Resultados en Vivo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="stat-box">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total de Respuestas</p>
                  <p className="stat-value text-lg sm:text-2xl md:text-3xl">{totalResponses.toLocaleString()}</p>
                </div>
                <div className="stat-box">
                  <p className="text-xs sm:text-sm text-muted-foreground">Escaños en Juego</p>
                  <p className="stat-value text-lg sm:text-2xl md:text-3xl">{totalEscanos}</p>
                </div>
                <div className="stat-box">
                  <p className="text-xs sm:text-sm text-muted-foreground">Última Actualización</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">Tiempo Real</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {edadPromedio !== null && (
                  <div className="stat-box">
                    <p className="text-sm text-muted-foreground">Edad Media</p>
                    <p className="stat-value">{edadPromedio}</p>
                    <p className="text-xs text-muted-foreground">años</p>
                  </div>
                )}
                {ideologiaPromedio !== null && (
                  <div className="frosted-glass p-4 rounded-lg text-center">
                    <p className="text-sm text-[#666666]">Posición Ideológica Media</p>
                    <p className="text-3xl font-bold text-[#C41E3A]">{ideologiaPromedio}</p>
                    <p className="text-xs text-[#999999]">en escala 1-10</p>
                  </div>
                )}
                {notaEjecutivo !== null && (
                  <div className="frosted-glass p-4 rounded-lg text-center">
                    <p className="text-sm text-[#666666]">Nota Ejecutivo</p>
                    <p className="text-3xl font-bold text-[#C41E3A]">{notaEjecutivo}</p>
                    <p className="text-xs text-[#999999]">sobre 10</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3 mt-6 flex-wrap">
                <Button
                  onClick={() => setShowAIAnalysis(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Análisis de IA</span>
                  <span className="sm:hidden">IA</span>
                </Button>
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  PDF
                </Button>
                <ShareResultsModern
                  stats={generalStats}
                  youthStats={youthStats}
                  totalResponses={totalResponses}
                  cooldownMinutes={15}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="flex gap-2 sm:gap-3 min-w-max glass-surface p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-[#C41E3A] text-white"
                        : "text-[#666666] hover:text-[#2D2D2D] hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white text-sm flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <ShareResultsModern
                    stats={generalStats}
                    youthStats={youthStats}
                    totalResponses={totalResponses}
                    cooldownMinutes={15}
                  />
                </div>
              </div>
            </div>

            {/* Ordenar votos / escaños */}
            {(activeTab === "general" || activeTab === "youth") && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setSortBy("votos")}
                  variant={sortBy === "votos" ? "default" : "outline"}
                  className="text-sm"
                >
                  Ordenar por Votos
                </Button>
                <Button
                  onClick={() => setSortBy("escanos")}
                  variant={sortBy === "escanos" ? "default" : "outline"}
                  className="text-sm"
                >
                  Ordenar por Escaños
                </Button>
              </div>
            )}

            {/* Lista de partidos (tabs general / youth) */}
            {stats.length > 0 && (activeTab === "general" || activeTab === "youth") && (
              <div className="space-y-4">
                {(sortBy === "votos"
                  ? [...stats].sort((a, b) => b.votos - a.votos)
                  : [...stats].sort((a, b) => b.escanos - a.escanos)
                ).map((party) => {
                  const currentPartyMap =
                    activeTab === "general" ? generalPartyMetaLookup : youthPartyMetaLookup;
                  const resolvedPartyKey = resolvePartyKey(party.id, currentPartyMap);
                  const logoUrl = party.logo || currentPartyMap[resolvedPartyKey]?.logo || "";
                  const partyColor = party.color || currentPartyMap[resolvedPartyKey]?.color || "#C41E3A";
                  return (
                    <div
                      key={party.id}
                      className="p-6 rounded-2xl space-y-4 hover:shadow-lg transition-all cursor-pointer border glass-surface"
                      style={{ borderColor: `${partyColor}40` }}
                      onClick={() => setSelectedPartyForStats(party.nombre)}
                    >
                      <div className="flex items-center gap-4">
                        {logoUrl ? (
                          <PartyLogo src={logoUrl} alt={party.nombre} partyName={party.nombre} size={48} strictExternal />
                        ) : (
                          <div className="h-12 w-12 bg-gray-300 rounded-2xl flex items-center justify-center text-xs text-gray-500">N/A</div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2D2D2D]">{party.nombre}</h3>
                          <p className="text-sm text-[#666666]">{party.votos.toLocaleString()} votos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: partyColor }}>{party.escanos}</p>
                          <p className="text-xs text-[#666666]">escaños</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[#666666]">
                          <span>{party.porcentaje.toFixed(1)}%</span>
                          <span>{((party.escanos / totalEscanos) * 100).toFixed(1)}% de escaños</span>
                        </div>
                        <div className="h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{ backgroundColor: partyColor, width: `${party.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Secciones por tab ── */}

            {activeTab === "tendencias" && <TrendenciesChart partyColors={partyColorMap} />}

            {activeTab === "lideres-preferidos" && <LeadersResultsChart partyColors={partyColorMap} />}

            {activeTab === "preguntas-varias" && <PreguntasVariasSection />}

            {activeTab === "ccaa" && <CCAAResltsSection partyMeta={generalPartyMetaLookup} />}

            {activeTab === "provincias" && <ProvincesResultsSection partyMeta={generalPartyMetaLookup} />}

            {activeTab === "comparacion-ccaa" && <CCAAComparisonSection partyMeta={generalPartyMetaLookup} />}

            {/* Líderes de Partidos (nuevo) */}
            {activeTab === "lideres-partidos" && (
              <LideresDePartidosSection generalPartyMap={generalPartyMap} />
            )}

            {/* Simulador Electoral (rehecho) */}
            {activeTab === "simulador-electoral" && (
              <SimuladorElectoral
                generalStats={generalStats}
                generalPartyMap={generalPartyMap}
                votosPorProvincia={votosPorProvincia}
                provinciaMetricsMap={provinciaMetricsMap}
              />
            )}

            {/* Asoc. Juveniles Mapa y Hemiciclo */}
            {activeTab === "asoc-juv-mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias - Asociaciones Juveniles</h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setMapView("schematic")}
                            variant={mapView === "schematic" ? "default" : "outline"}
                            className={`flex items-center gap-2 ${mapView === "schematic" ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}
                          >
                            <Grid3x3 className="w-4 h-4" />
                            Esquemática
                          </Button>
                          <Button
                            onClick={() => setMapView("realistic")}
                            variant={mapView === "realistic" ? "default" : "outline"}
                            className={`flex items-center gap-2 ${mapView === "realistic" ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}
                          >
                            <Map className="w-4 h-4" />
                            Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === "schematic" ? (
                        <SpainMapProvincial
                          votosPorProvincia={votosPorProvinciaJuveniles}
                          isYouthAssociations={true}
                          partyMeta={youthPartyMetaLookup}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionadaJuveniles(province);
                            setVotosPorPartidoProvinciaJuveniles(votos);
                            setEscanosProvinciaJuveniles(escanos);
                          }}
                        />
                      ) : (
                        <SpainMapRealistic
                          votosPorProvincia={votosPorProvinciaJuveniles}
                          provinciaMetricsMap={provinciaMetricsMapJuveniles}
                          isYouthAssociations={true}
                          partyMeta={youthPartyMetaLookup}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionadaJuveniles(province);
                            setVotosPorPartidoProvinciaJuveniles(votos);
                            setEscanosProvinciaJuveniles(escanos);
                          }}
                        />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      {youthStats.length > 0 && (
                        <PactometerInteractive
                          stats={youthStats.map((s) => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))}
                          totalSeats={100}
                          requiredForMajority={51}
                        />
                      )}
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo de Asociaciones Juveniles</h2>
                      <CongressHemicycle
                        escanos={escanosJuvenilesPorProvincia}
                        totalEscanos={100}
                        provinciaSeleccionada={provinciaSeleccionadaJuveniles}
                        votosProvincia={votosPorPartidoProvinciaJuveniles}
                        escanosProvincia={escanosProvinciaJuveniles}
                        partyMeta={youthPartyMetaLookup}
                      />
                    </div>
                  </>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center">
                    <p className="text-[#666666]">Cargando datos de provincias de Asociaciones Juveniles...</p>
                  </div>
                )}
              </div>
            )}

            {/* Mapa y Hemiciclo generales */}
            {activeTab === "mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvincia).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias</h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setMapView("schematic")}
                            variant={mapView === "schematic" ? "default" : "outline"}
                            className={`flex items-center gap-2 ${mapView === "schematic" ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}
                          >
                            <Grid3x3 className="w-4 h-4" />
                            Esquemática
                          </Button>
                          <Button
                            onClick={() => setMapView("realistic")}
                            variant={mapView === "realistic" ? "default" : "outline"}
                            className={`flex items-center gap-2 ${mapView === "realistic" ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"}`}
                          >
                            <Map className="w-4 h-4" />
                            Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === "schematic" ? (
                        <SpainMapProvincial
                          votosPorProvincia={votosPorProvincia}
                          isYouthAssociations={false}
                          partyMeta={generalPartyMetaLookup}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionada(province);
                            setVotosPorPartidoProvincia(votos);
                            setEscanosProvincia(escanos);
                          }}
                        />
                      ) : (
                        <SpainMapRealistic
                          votosPorProvincia={votosPorProvincia}
                          provinciaMetricsMap={provinciaMetricsMap}
                          isYouthAssociations={false}
                          partyMeta={generalPartyMetaLookup}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionada(province);
                            setVotosPorPartidoProvincia(votos);
                            setEscanosProvincia(escanos);
                          }}
                        />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Pactómetro</h2>
                      <PactometerInteractive
                        stats={generalStats.map((s) => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))}
                        totalSeats={350}
                        requiredForMajority={176}
                      />
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo del Congreso de los Diputados</h2>
                      <CongressHemicycle
                        escanos={escanosGeneralesPorProvincia}
                        totalEscanos={350}
                        provinciaSeleccionada={provinciaSeleccionada}
                        votosProvincia={votosPorPartidoProvincia}
                        escanosProvincia={escanosProvincia}
                        partyMeta={generalPartyMetaLookup}
                      />
                    </div>
                  </>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center">
                    <p className="text-[#666666]">Cargando datos de provincias...</p>
                  </div>
                )}
              </div>
            )}

            {/* Valoración de líderes */}
            {activeTab === "leaders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#2D2D2D]">Valoración de Líderes Políticos</h2>
                {leaderRatings.length === 0 ? (
                  <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
                    <p>Aún no hay valoraciones. Sé el primero en responder la encuesta.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {leaderRatings.map((leader) => {
                        const leaderKeyMap: Record<string, keyof typeof LEADERS> = {
                          val_feijoo: "FEIJOO",
                          val_sanchez: "SANCHEZ",
                          val_abascal: "ABASCAL",
                          val_alvise: "ALVISE",
                          val_yolanda_diaz: "YOLANDA",
                          val_irene_montero: "IRENE",
                          val_ayuso: "AYUSO",
                          val_buxade: "BUXADE",
                        };
                        const leaderKey = leaderKeyMap[leader.fieldName];
                        const leaderData = leaderKey ? LEADERS[leaderKey] : null;
                        const leaderImagePath = leaderData?.image;
                        let leaderImage: string | undefined;
                        if (leaderImagePath) {
                          const filename = leaderImagePath.split("/").pop();
                          if (filename) {
                            const embeddedKey = Object.keys(EMBEDDED_LEADERS).find((key) =>
                              key.toLowerCase().includes(filename.toLowerCase().replace(/\.[^/.]+$/, ""))
                            );
                            if (embeddedKey) leaderImage = EMBEDDED_LEADERS[embeddedKey];
                          }
                        }
                        if (!leaderImage && leaderImagePath) leaderImage = leaderImagePath;
                        return (
                          <div key={leader.fieldName} className="glass-card p-6 rounded-xl space-y-3 hover:shadow-lg transition-shadow">
                            {leaderImage ? (
                              <img
                                src={leaderImage}
                                alt={leader.name}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">Sin imagen</div>
                            )}
                            <h4 className="font-semibold text-[#2D2D2D] text-sm">{leader.name}</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-[#666666]">
                                <span>Valoración Media</span>
                                <span className="text-[#C41E3A] font-bold">{leader.average.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                                <div className="h-full bg-[#C41E3A] transition-all duration-500" style={{ width: `${(leader.average / 10) * 100}%` }} />
                              </div>
                              <p className="text-xs text-[#999999]">({leader.count} respuestas)</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="liquid-glass p-8 rounded-2xl">
                      <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">Comparativa de Valoraciones</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={leaderRatings}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
                          <XAxis dataKey="name" stroke="#666666" angle={-45} textAnchor="end" height={100} />
                          <YAxis stroke="#666666" domain={[0, 10]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#F5F1E8", border: "1px solid #E0D5CC", borderRadius: "8px" }}
                            formatter={(value: any) => value.toFixed(1)}
                            labelStyle={{ color: "#2D2D2D" }}
                          />
                          <Bar dataKey="average" fill="#C41E3A" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "encuestadoras-externas" && (
              <EncuestadorasComparativa generalStats={generalStats} totalResponses={totalResponses} />
            )}

            {/* Metodología (excepto en tabs que tienen su propio footer) */}
            {activeTab !== "leaders" && activeTab !== "encuestadoras-externas" && activeTab !== "simulador-electoral" && activeTab !== "lideres-partidos" && (
              <div className="liquid-glass p-8 rounded-2xl space-y-4">
                <h3 className="text-xl font-bold text-[#2D2D2D]">Metodología</h3>
                <div className="space-y-3 text-sm text-[#666666]">
                  <p>
                    <span className="font-semibold text-[#2D2D2D]">Ley d'Hondt:</span> Los escaños se distribuyen
                    utilizando el método d'Hondt, que es el sistema electoral utilizado en España.
                  </p>
                  <p>
                    <span className="font-semibold text-[#2D2D2D]">Umbral Mínimo:</span> En elecciones generales se
                    requiere el 3% de los votos válidos. En asociaciones juveniles, el 4%.
                  </p>
                  <p>
                    <span className="font-semibold text-[#2D2D2D]">Actualización:</span> Los resultados se actualizan
                    en tiempo real conforme se reciben nuevas respuestas.
                  </p>
                </div>
              </div>
            )}

            <CommentsSection activeTab={activeTab === "simulador-electoral" ? "general" : activeTab} />

            <div className="text-center space-y-4">
              <p className="text-[#666666]">¿Aún no has respondido la encuesta?</p>
              <Button
                onClick={() => setLocation("/encuesta")}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-12 rounded-lg font-semibold"
              >
                Responder Encuesta
              </Button>
            </div>
          </div>
        )}
      </main>

      <PartyStatsModal
        isOpen={!!selectedPartyForStats}
        onClose={() => setSelectedPartyForStats(null)}
        partyName={selectedPartyForStats || ""}
        partyType={activeTab === "general" ? "general" : "youth"}
      />

      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos</p>
        </div>
      </footer>

      <AIAnalysisModal
        open={showAIAnalysis}
        onOpenChange={setShowAIAnalysis}
        totalResponses={totalResponses}
        edadPromedio={edadPromedio}
        ideologiaPromedio={ideologiaPromedio}
        topParties={[...stats].sort((a, b) => b.votos - a.votos).slice(0, 5)}
      />
    </div>
  );
}
