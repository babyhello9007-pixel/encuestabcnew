import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Map, Users, Vote, BarChart3, Share2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import PartyLogo from "@/components/PartyLogo";
import { SpainMapProvincial } from "@/components/results/SpainMapProvincial";
import { CongressHemicycle } from "@/components/results/CongressHemicycle";
import { TrendenciesChart } from "@/components/TrendenciesChart";
import { LeadersResultsChart } from "@/components/LeadersResultsChart";
import PreguntasVariasSection from "@/components/results/PreguntasVariasSection";
import { ShareInfographicsPanel } from "@/components/ShareInfographicsPanel";
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";

type PartyType = "general" | "youth";

interface PartyConfigRow {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  party_type: string;
  is_active: boolean;
}

interface PartyMeta {
  key: string;
  name: string;
  color: string;
  logo: string;
  type: PartyType;
}

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

const tabs = [
  { id: "general", label: "Generales", icon: Vote },
  { id: "youth", label: "Juveniles", icon: Users },
  { id: "map", label: "Mapa", icon: Map },
  { id: "hemicycle", label: "Hemiciclo", icon: Sparkles },
  { id: "trends", label: "Variación", icon: BarChart3 },
  { id: "leaders", label: "Líderes", icon: Users },
  { id: "preguntas-varias", label: "Preguntas varias", icon: BarChart3 },
  { id: "share", label: "Compartir", icon: Share2 },
] as const;

type ActiveTab = (typeof tabs)[number]["id"];

export default function Results() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");
  const [partyConfig, setPartyConfig] = useState<PartyMeta[]>([]);
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<PartyType>("general");
  const [votosPorProvinciaGeneral, setVotosPorProvinciaGeneral] = useState<Record<string, Record<string, number>>>({});
  const [votosPorProvinciaYouth, setVotosPorProvinciaYouth] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    document.title = "La Encuesta de BC";
  }, []);

  useEffect(() => {
    const loadPartyConfiguration = async () => {
      const { data, error } = await supabase
        .from("party_configuration")
        .select("party_key, display_name, color, logo_url, party_type, is_active")
        .eq("is_active", true);

      if (error) {
        console.error("Error loading party_configuration:", error);
        return;
      }

      const mapped = (data || [])
        .filter((row: PartyConfigRow) => row.party_type === "general" || row.party_type === "youth" || row.party_type === "juvenile")
        .map((row: PartyConfigRow) => ({
          key: row.party_key,
          name: row.display_name,
          color: row.color,
          logo: row.logo_url,
          type: (row.party_type === "general" ? "general" : "youth") as PartyType,
        }));

      setPartyConfig(mapped);
    };

    loadPartyConfiguration();

    const channel = supabase
      .channel("results-party-configuration")
      .on("postgres_changes", { event: "*", schema: "public", table: "party_configuration" }, () => {
        loadPartyConfiguration();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const partyMapByType = useMemo(() => {
    const generalMap: Record<string, PartyMeta> = {};
    const youthMap: Record<string, PartyMeta> = {};

    partyConfig.forEach((party) => {
      if (party.type === "general") generalMap[party.key] = party;
      if (party.type === "youth") youthMap[party.key] = party;
    });

    return { generalMap, youthMap };
  }, [partyConfig]);

  const partyColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    partyConfig.forEach((p) => {
      m[p.key.toUpperCase()] = p.color;
      m[p.name.toUpperCase()] = p.color;
    });
    return m;
  }, [partyConfig]);

  useEffect(() => {
    if (!partyConfig.length) return;

    const loadResults = async () => {
      setLoading(true);
      try {
        const { count } = await supabase.from("respuestas").select("*", { head: true, count: "exact" });
        setTotalResponses(count || 0);

        const { data: generalVotes } = await supabase.from("votos_generales_totales").select("partido_id, votos");
        const generalVotosMap: Record<string, number> = {};
        Object.values(partyMapByType.generalMap).forEach((party) => {
          generalVotosMap[party.key] = 0;
        });
        (generalVotes || []).forEach((row: any) => {
          generalVotosMap[row.partido_id] = Number(row.votos || 0);
        });

        const generalEscanos = calcularEscanosGenerales(generalVotosMap);
        const generalNames: Record<string, string> = {};
        const generalLogos: Record<string, string> = {};
        Object.values(partyMapByType.generalMap).forEach((party) => {
          generalNames[party.key] = party.name;
          generalLogos[party.key] = party.logo;
        });

        const generalStatsCalculated = obtenerEstadisticas(generalVotosMap, generalEscanos, generalNames, generalLogos).map((s) => ({
          ...s,
          color: partyMapByType.generalMap[s.id]?.color,
        }));
        setGeneralStats(generalStatsCalculated);

        const { data: youthVotes } = await supabase.from("votos_juveniles_totales").select("asociacion_id, votos");
        const youthVotosMap: Record<string, number> = {};
        Object.values(partyMapByType.youthMap).forEach((party) => {
          youthVotosMap[party.key] = 0;
        });
        (youthVotes || []).forEach((row: any) => {
          youthVotosMap[row.asociacion_id] = Number(row.votos || 0);
        });

        const youthEscanos = calcularEscanosJuveniles(youthVotosMap);
        const youthNames: Record<string, string> = {};
        const youthLogos: Record<string, string> = {};
        Object.values(partyMapByType.youthMap).forEach((party) => {
          youthNames[party.key] = party.name;
          youthLogos[party.key] = party.logo;
        });

        const youthStatsCalculated = obtenerEstadisticas(youthVotosMap, youthEscanos, youthNames, youthLogos).map((s) => ({
          ...s,
          color: partyMapByType.youthMap[s.id]?.color,
        }));
        setYouthStats(youthStatsCalculated);

        const { data: mapGeneral } = await supabase
          .from("votos_por_provincia_view")
          .select("provincia, partido, votos");

        const groupedGeneral: Record<string, Record<string, number>> = {};
        (mapGeneral || []).forEach((row: any) => {
          if (!groupedGeneral[row.provincia]) groupedGeneral[row.provincia] = {};
          groupedGeneral[row.provincia][row.partido] = Number(row.votos || 0);
        });
        setVotosPorProvinciaGeneral(groupedGeneral);

        const { data: mapYouth } = await supabase
          .from("votos_por_provincia_juveniles_view")
          .select("provincia, asociacion, votos");

        const groupedYouth: Record<string, Record<string, number>> = {};
        (mapYouth || []).forEach((row: any) => {
          if (!groupedYouth[row.provincia]) groupedYouth[row.provincia] = {};
          groupedYouth[row.provincia][row.asociacion] = Number(row.votos || 0);
        });
        setVotosPorProvinciaYouth(groupedYouth);
      } catch (error) {
        console.error("Error loading results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, [partyConfig, partyMapByType.generalMap, partyMapByType.youthMap]);

  const activeStats = activeTab === "youth" ? youthStats : generalStats;
  const activePartyMap = mapMode === "youth" ? partyMapByType.youthMap : partyMapByType.generalMap;
  const activeProvinceVotes = mapMode === "youth" ? votosPorProvinciaYouth : votosPorProvinciaGeneral;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">La Encuesta de BC</h1>
            <p className="text-sm text-slate-500">Resultados en tiempo real con branding 100% dinámico desde Supabase</p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs uppercase text-slate-500">Respuestas totales</p>
            <p className="text-3xl font-bold text-slate-900">{totalResponses}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs uppercase text-slate-500">Partidos generales activos</p>
            <p className="text-3xl font-bold text-slate-900">{Object.keys(partyMapByType.generalMap).length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs uppercase text-slate-500">Asociaciones juveniles activas</p>
            <p className="text-3xl font-bold text-slate-900">{Object.keys(partyMapByType.youthMap).length}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Cargando resultados…</div>
        ) : (
          <>
            {(activeTab === "general" || activeTab === "youth") && (
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeStats.map((party) => (
                  <article
                    key={party.id}
                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                    style={{ borderLeft: `6px solid ${party.color || "#9CA3AF"}` }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PartyLogo src={party.logo} partyName={party.nombre} size={34} strictExternal />
                        <div>
                          <h3 className="font-bold text-slate-900">{party.nombre}</h3>
                          <p className="text-xs font-mono text-slate-500">{party.color || "#9CA3AF"}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{party.id}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">Votos</p>
                        <p className="font-bold text-slate-900">{party.votos}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">%</p>
                        <p className="font-bold text-slate-900">{party.porcentaje.toFixed(1)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">Escaños</p>
                        <p className="font-bold text-slate-900">{party.escanos}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {activeTab === "map" && (
              <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMapMode("general")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "general" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Mapa Generales
                  </button>
                  <button
                    onClick={() => setMapMode("youth")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "youth" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Mapa Juveniles
                  </button>
                </div>
                <SpainMapProvincial
                  votosPorProvincia={activeProvinceVotes}
                  isYouthAssociations={mapMode === "youth"}
                  partyMeta={Object.fromEntries(Object.entries(activePartyMap).map(([k, v]) => [k, { color: v.color }]))}
                />
              </section>
            )}

            {activeTab === "hemicycle" && (
              <section className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMapMode("general")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "general" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Hemiciclo Generales
                  </button>
                  <button
                    onClick={() => setMapMode("youth")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "youth" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Hemiciclo Juveniles
                  </button>
                </div>
                <CongressHemicycle
                  escanos={Object.fromEntries((mapMode === "youth" ? youthStats : generalStats).map((s) => [s.id, s.escanos]))}
                  totalEscanos={mapMode === "youth" ? 100 : 350}
                  partyMeta={Object.fromEntries(
                    Object.entries(activePartyMap).map(([k, v]) => [k, { name: v.name, color: v.color, logo: v.logo }])
                  )}
                />
              </section>
            )}

            {activeTab === "trends" && (
              <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <TrendenciesChart partyColors={partyColorMap} />
              </section>
            )}

            {activeTab === "leaders" && (
              <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <LeadersResultsChart partyColors={partyColorMap} />
              </section>
            )}

            {activeTab === "preguntas-varias" && (
              <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <PreguntasVariasSection />
              </section>
            )}

            {activeTab === "share" && (
              <ShareInfographicsPanel
                generalStats={generalStats}
                youthStats={youthStats}
                totalResponses={totalResponses}
                cooldownMinutes={15}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
