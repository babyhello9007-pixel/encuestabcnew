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
import { SpainMapProvincial } from "@/components/results/SpainMapProvincial";
import { CongressHemicycle } from "@/components/results/CongressHemicycle";
import { LeadersResultsChart } from "@/components/LeadersResultsChart";
import PreguntasVariasSection from "@/components/results/PreguntasVariasSection";
import { ShareInfographicsPanel } from "@/components/ShareInfographicsPanel";

type PartyType = "general" | "youth";

import { Map, Grid3x3, ArrowLeft } from "lucide-react";
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

interface CustomSimulatorParty {
  key: string;
  name: string;
  color: string;
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
  { id: "simulador-electoral", label: "Simulador Electoral", icon: Sparkles },
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
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [edadPromedio, setEdadPromedio] = useState<number | null>(null);
  const [ideologiaPromedio, setIdeologiaPromedio] = useState<number | null>(null);
  const [generalMetrics, setGeneralMetrics] = useState<PartyMetrics[]>([]);
  const [youthMetrics, setYouthMetrics] = useState<PartyMetrics[]>([]);
  const [historialVotos, setHistorialVotos] = useState<Array<{fecha: string, votos: number}>>([]);
  const [notaEjecutivo, setNotaEjecutivo] = useState<number | null>(null);
  const [selectedPartyForStats, setSelectedPartyForStats] = useState<string | null>(null);
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [escanosGeneralesPorProvincia, setEscanosGeneralesPorProvincia] = useState<Record<string, number>>({});
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null);
  const [votosPorPartidoProvincia, setVotosPorPartidoProvincia] = useState<Record<string, number>>({});
  const [escanosProvincia, setEscanosProvincia] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'votos' | 'escanos'>('votos');
  const [mapView, setMapView] = useState<'schematic' | 'realistic'>('realistic');
  const [votosPorProvinciaJuveniles, setVotosPorProvinciaJuveniles] = useState<Record<string, Record<string, number>>>({});
  const [escanosJuvenilesPorProvincia, setEscanosJuvenilesPorProvincia] = useState<Record<string, number>>({});
  const [provinciaSeleccionadaJuveniles, setProvinciaSeleccionadaJuveniles] = useState<string | null>(null);
  const [votosPorPartidoProvinciaJuveniles, setVotosPorPartidoProvinciaJuveniles] = useState<Record<string, number>>({});
  const [escanosProvinciaJuveniles, setEscanosProvinciaJuveniles] = useState<Record<string, number>>({});
  const [provinciaMetricsMapJuveniles, setProvinciaMetricsMapJuveniles] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [provinciaMetricsMap, setProvinciaMetricsMap] = useState<Record<string, { edad_promedio: number; ideologia_promedio: number }>>({});
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [partyConfigData, setPartyConfigData] = useState<{ parties: any[]; youth: any[] }>({ parties: [], youth: [] });
  const [simulatorVotes, setSimulatorVotes] = useState<Record<string, number>>({});
  const [simulatorCustomParties, setSimulatorCustomParties] = useState<CustomSimulatorParty[]>([]);
  const [newSimulatorPartyName, setNewSimulatorPartyName] = useState("");
  const [newSimulatorPartyColor, setNewSimulatorPartyColor] = useState("#7c3aed");
  const [simProvinciaSeleccionada, setSimProvinciaSeleccionada] = useState<string | null>(null);
  const [simVotosProvincia, setSimVotosProvincia] = useState<Record<string, number>>({});
  const [simEscanosProvincia, setSimEscanosProvincia] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "La Encuesta de BC";
  }, []);

  const generalPartyMap = useMemo(() => {
    const defaults: Record<string, { key: string; name: string; color: string; logo: string }> = {};
    if (!partyConfigData?.parties?.length) return defaults;
    partyConfigData.parties.forEach((party) => {
      defaults[party.partyKey] = {
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
      defaults[party.partyKey] = {
        key: party.partyKey,
        name: party.displayName,
        color: party.color,
        logo: party.logoUrl,
      };
    });
    return defaults;
  }, [partyConfigData]);

  useEffect(() => {
    if (!generalStats.length) return;

    const nextVotes: Record<string, number> = {};
    generalStats.forEach((party) => {
      nextVotes[party.id] = party.votos;
    });

    setSimulatorVotes((prev) => {
      if (Object.keys(prev).length > 0) {
        const mergedVotes = { ...nextVotes, ...prev };
        return mergedVotes;
      }
      return nextVotes;
    });
  }, [generalStats]);

  const simulatorPartyMap = useMemo(() => {
    const mergedMap: Record<string, { key: string; name: string; color: string; logo: string }> = { ...generalPartyMap };
    simulatorCustomParties.forEach((party) => {
      mergedMap[party.key] = {
        key: party.key,
        name: party.name,
        color: party.color,
        logo: "",
      };
    });
    return mergedMap;
  }, [generalPartyMap, simulatorCustomParties]);

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
    const allVotes = Object.values(simulatorVotes).reduce((acc, v) => acc + Math.max(0, Number(v) || 0), 0);
    if (allVotes === 0) return {};

    const shares = Object.entries(simulatorVotes).reduce<Record<string, number>>((acc, [party, votes]) => {
      acc[party] = Math.max(0, Number(votes) || 0) / allVotes;
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

  const addSimulatorCustomParty = () => {
    const trimmedName = newSimulatorPartyName.trim();
    if (!trimmedName) return;

    const slug = trimmedName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
    const baseKey = slug || `PARTY_${Date.now()}`;
    const key = simulatorPartyMap[baseKey] ? `${baseKey}_${Date.now()}` : baseKey;

    const nextParty: CustomSimulatorParty = {
      key,
      name: trimmedName,
      color: newSimulatorPartyColor,
    };

    setSimulatorCustomParties((prev) => [...prev, nextParty]);
    setSimulatorVotes((prev) => ({ ...prev, [key]: 0 }));
    setNewSimulatorPartyName("");
  };

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
          .filter((row: any) => row.party_type === "youth" || row.party_type === "asociacion_juvenil" || row.party_type === "juvenile")
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Obtener total de respuestas usando el VIEW
        try {
          const { data: viewData } = await supabase
            .from("total_respuestas_view")
            .select("total_respuestas");
          setTotalResponses(viewData?.[0]?.total_respuestas || 0);
        } catch (err) {
          // Fallback si el VIEW no existe
          try {
            const { count } = await supabase
              .from("respuestas")
              .select("*", { count: "exact", head: true });
            setTotalResponses(count || 0);
          } catch (e) {
            setTotalResponses(631);
          }
        }

        // Intentar obtener datos de votos generales
        try {
          const { data: generalData } = await supabase
            .from("votos_generales_totales")
            .select("*");

          if (generalData && generalData.length > 0) {
            const generalVotos: Record<string, number> = {};
            Object.keys(generalPartyMap).forEach((key) => {
              generalVotos[key] = 0;
            });

            generalData.forEach((row: any) => {
              generalVotos[row.partido_id] = row.votos;
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
              color: generalPartyMap[s.id]?.color,
            }));
            setGeneralStats(stats);

            // Cargar votos por provincia para el mapa
            try {
              const { data: provinciaData, error } = await supabase
                .from("votos_por_provincia_view")
                .select("provincia, partido, votos");

              if (error) {
                console.error("Error loading provincia data:", error);
              }

              if (provinciaData && provinciaData.length > 0) {
                const votosProv: Record<string, Record<string, number>> = {};

                provinciaData.forEach((row: any) => {
                  if (row.provincia && row.partido) {
                    if (!votosProv[row.provincia]) {
                      votosProv[row.provincia] = {};
                    }
                    votosProv[row.provincia][row.partido] = row.votos;
                  }
                });

                setVotosPorProvincia(votosProv);

                // Cargar métricas por provincia
                try {
                  const { data: metricsData } = await supabase
                    .from("respuestas")
                    .select("provincia, edad, posicion_ideologica");

                  if (metricsData && metricsData.length > 0) {
                    const metricsMap: Record<string, { edad_promedio: number; ideologia_promedio: number }> = {};
                    const provinciaCounts: Record<string, { edad_sum: number; ideologia_sum: number; count: number }> = {};

                    metricsData.forEach((row: any) => {
                      if (row.provincia) {
                        if (!provinciaCounts[row.provincia]) {
                          provinciaCounts[row.provincia] = { edad_sum: 0, ideologia_sum: 0, count: 0 };
                        }
                        if (row.edad !== null && row.edad !== undefined) {
                          provinciaCounts[row.provincia].edad_sum += row.edad;
                        }
                        if (row.posicion_ideologica !== null && row.posicion_ideologica !== undefined) {
                          provinciaCounts[row.provincia].ideologia_sum += row.posicion_ideologica;
                        }
                        provinciaCounts[row.provincia].count += 1;
                      }
                    });

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
            const exampleVotos: Record<string, number> = {
              PP: 180, PSOE: 120, VOX: 85, SUMAR: 65, PODEMOS: 45,
              JUNTS: 35, ERC: 30, PNV: 25, ALIANZA: 15, BILDU: 20,
              SAF: 40, CC: 10, UPN: 8, CIUDADANOS: 12, CAMINANDO: 5,
              FRENTE: 3, IZQUIERDA: 8, JUNTOS_EXT: 6, PLIB: 4, EB: 2, BNG: 7,
            };
            const escanos = calcularEscanosGenerales(exampleVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(generalPartyMap).forEach(([key, party]) => {
              nombres[key] = party.name;
              logos[key] = party.logo;
            });
            const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos).map((s) => ({
              ...s,
              color: generalPartyMap[s.id]?.color,
            }));
            setGeneralStats(stats);
          }
        } catch (err) {
          console.error("Error fetching general votes:", err);
          const exampleVotos: Record<string, number> = {
            PP: 180, PSOE: 120, VOX: 85, SUMAR: 65, PODEMOS: 45,
            JUNTS: 35, ERC: 30, PNV: 25, ALIANZA: 15, BILDU: 20,
            SAF: 40, CC: 10, UPN: 8, CIUDADANOS: 12, CAMINANDO: 5,
            FRENTE: 3, IZQUIERDA: 8, JUNTOS_EXT: 6, PLIB: 4, EB: 2, BNG: 7,
          };
          const escanos = calcularEscanosGenerales(exampleVotos);
          const nombres: Record<string, string> = {};
          const logos: Record<string, string> = {};
          Object.entries(generalPartyMap).forEach(([key, party]) => {
            nombres[key] = party.name;
            logos[key] = party.logo;
          });
          const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos).map((s) => ({
            ...s,
            color: generalPartyMap[s.id]?.color,
          }));
          setGeneralStats(stats);
        }

        // Intentar obtener datos de votos juveniles
        try {
          const { data: youthData } = await supabase
            .from("votos_juveniles_totales")
            .select("*");

          if (youthData && youthData.length > 0) {
            const youthVotos: Record<string, number> = {};
            youthData.forEach((row: any) => {
              youthVotos[row.asociacion_id] = row.votos;
            });

            const escanos = calcularEscanosJuveniles(youthVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([key, assoc]) => {
              nombres[key] = assoc.name;
              logos[key] = assoc.logo;
            });
            const stats = obtenerEstadisticas(youthVotos, escanos, nombres, logos).map((s) => ({
              ...s,
              color: youthPartyMap[s.id]?.color,
            }));
            setYouthStats(stats);
          } else {
            const exampleYouthVotos: Record<string, number> = {
              SHAACABAT: 95, REVUELTA: 75, NNGG: 120, JVOX: 65, VLE: 45,
              JSE: 85, PATRIOTA: 35, JIU: 40, JCOMUNISTA: 30, JCS: 25,
              EGI: 15, ERNAI: 20, JERC: 35, JNC: 28, GALIZANOVA: 18,
              ARRAN: 22, JNCANA: 12, JPV: 16, ACL: 14, JEC: 10, AGORA: 8,
            };
            const escanos = calcularEscanosJuveniles(exampleYouthVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};
            Object.entries(youthPartyMap).forEach(([key, assoc]) => {
              nombres[key] = assoc.name;
              logos[key] = assoc.logo;
            });
            const stats = obtenerEstadisticas(exampleYouthVotos, escanos, nombres, logos).map((s) => ({
              ...s,
              color: youthPartyMap[s.id]?.color,
            }));
            setYouthStats(stats);
          }
        } catch (err) {
          console.error("Error fetching youth votes:", err);
          const exampleYouthVotos: Record<string, number> = {
            SHAACABAT: 95, REVUELTA: 75, NNGG: 120, JVOX: 65, VLE: 45,
            JSE: 85, PATRIOTA: 35, JIU: 40, JCOMUNISTA: 30, JCS: 25,
            EGI: 15, ERNAI: 20, JERC: 35, JNC: 28, GALIZANOVA: 18,
            ARRAN: 22, JNCANA: 12, JPV: 16, ACL: 14, JEC: 10, AGORA: 8,
          };
          const escanos = calcularEscanosJuveniles(exampleYouthVotos);
          const nombres: Record<string, string> = {};
          const logos: Record<string, string> = {};
          Object.entries(youthPartyMap).forEach(([key, assoc]) => {
            nombres[key] = assoc.name;
            logos[key] = assoc.logo;
          });
          const stats = obtenerEstadisticas(exampleYouthVotos, escanos, nombres, logos).map((s) => ({
            ...s,
            color: youthPartyMap[s.id]?.color,
          }));
          setYouthStats(stats);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
  }, [generalPartyMap, youthPartyMap, votosPorProvincia]);

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
  }, [generalPartyMap, youthPartyMap]);

  const stats = activeTab === "general" ? generalStats : activeTab === "youth" ? youthStats : [];
  const totalEscanos = activeTab === "general" ? 350 : activeTab === "youth" ? 100 : 0;

  const activeStats = activeTab === "youth" ? youthStats : generalStats;
  const activePartyMap = mapMode === "youth" ? partyMapByType.youthMap : partyMapByType.generalMap;
  const activeProvinceVotes = mapMode === "youth" ? votosPorProvinciaYouth : votosPorProvinciaGeneral;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">La Encuesta de BC</h1>
            <p className="text-sm text-slate-500">Resultados en tiempo real</p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>

        {/* Stats */}
        <div className="glass-surface p-4 sm:p-6 md:p-8 space-y-4 mb-6">
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
        <div className="overflow-x-auto mb-6">
          <div className="flex gap-2 sm:gap-3 min-w-max glass-surface p-2">
            {[
              { id: "general", label: "Elecciones Generales" },
              { id: "mapa-hemiciclo", label: "Mapa y Hemiciclo" },
              { id: "encuestadoras-externas", label: "Encuestadoras" },
              { id: "ccaa", label: "CCAA" },
              { id: "provincias", label: "Provincias" },
              { id: "comparacion-ccaa", label: "Comparación CCAA" },
              { id: "youth", label: "Asociaciones" },
              { id: "asoc-juv-mapa-hemiciclo", label: "Asoc. Juveniles: Mapa y Hemiciclo" },
              { id: "leaders", label: "Líderes Preferidos" },
              { id: "tendencias", label: "Variación por Día" },
              { id: "lideres-preferidos", label: "Líderes de Partidos" },
              { id: "preguntas-varias", label: "Preguntas Varias" },
              { id: "simulador-electoral", label: "Simulador Electoral" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  activeTab === tab.id
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

        {/* Main content */}
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="space-y-6">

            {/* Sort buttons */}
            {(activeTab === "general" || activeTab === "youth") && (
              <div className="flex gap-2">
                <Button onClick={() => setSortBy('votos')} variant={sortBy === 'votos' ? 'default' : 'outline'} className="text-sm">
                  Ordenar por Votos
                </Button>
                <Button onClick={() => setSortBy('escanos')} variant={sortBy === 'escanos' ? 'default' : 'outline'} className="text-sm">
                  Ordenar por Escaños
                </Button>
              </div>
            )}

            {/* Party list */}
            {(activeTab === "general" || activeTab === "youth") && stats.length > 0 && (
              <div className="space-y-4">
                {(sortBy === 'votos'
                  ? [...stats].sort((a, b) => b.votos - a.votos)
                  : [...stats].sort((a, b) => b.escanos - a.escanos)
                ).map((party) => {
                  const currentPartyMap = activeTab === "general" ? generalPartyMap : youthPartyMap;
                  const logoUrl = party.logo || currentPartyMap[party.id]?.logo || "";
                  const partyColor = party.color || currentPartyMap[party.id]?.color || "#C41E3A";
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
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{party.id}</span>
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

            {/* Tab panels */}
            {activeTab === "tendencias" && <TrendenciesChart partyColors={partyColorMap} />}
            {activeTab === "lideres-preferidos" && <LeadersResultsChart partyColors={partyColorMap} />}
            {activeTab === "preguntas-varias" && <PreguntasVariasSection />}
            {activeTab === "ccaa" && <CCAAResltsSection partyMeta={generalPartyMap} />}
            {activeTab === "provincias" && <ProvincesResultsSection partyMeta={generalPartyMap} />}
            {activeTab === "comparacion-ccaa" && <CCAAComparisonSection partyMeta={generalPartyMap} />}
            {activeTab === "leaders" && <LeadersResultsChart partyColors={partyColorMap} />}
            {activeTab === "trends" && <TrendenciesChart partyColors={partyColorMap} />}
            {activeTab === "share" && (
              <ShareInfographicsPanel
                generalStats={generalStats}
                youthStats={youthStats}
                totalResponses={totalResponses}
                cooldownMinutes={15}
              />
            )}

            {/* Mapa y Hemiciclo - Generales */}
            {activeTab === "mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvincia).length > 0 ? (
                  <div className="space-y-4">
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias</h2>
                        <div className="flex gap-2">
                          <Button onClick={() => setMapView('schematic')} variant={mapView === 'schematic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'schematic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                            <Grid3x3 className="w-4 h-4" /> Esquemática
                          </Button>
                          <Button onClick={() => setMapView('realistic')} variant={mapView === 'realistic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'realistic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                            <Map className="w-4 h-4" /> Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === 'schematic' ? (
                        <SpainMapProvincial votosPorProvincia={votosPorProvincia} isYouthAssociations={false} partyMeta={generalPartyMap} onProvinceClick={(province, data, votos, escanos) => { setProvinciaSeleccionada(province); setVotosPorPartidoProvincia(votos); setEscanosProvincia(escanos); }} />
                      ) : (
                        <SpainMapRealistic votosPorProvincia={votosPorProvincia} provinciaMetricsMap={provinciaMetricsMap} isYouthAssociations={false} partyMeta={generalPartyMap} onProvinceClick={(province, data, votos, escanos) => { setProvinciaSeleccionada(province); setVotosPorPartidoProvincia(votos); setEscanosProvincia(escanos); }} />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Pactómetro</h2>
                      <PactometerInteractive stats={generalStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={350} requiredForMajority={176} />
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo del Congreso de los Diputados</h2>
                      <CongressHemicycle escanos={escanosGeneralesPorProvincia} totalEscanos={350} provinciaSeleccionada={provinciaSeleccionada} votosProvincia={votosPorPartidoProvincia} escanosProvincia={escanosProvincia} partyMeta={generalPartyMap} />
                    </div>
                  </div>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center">
                    <p className="text-[#666666]">Cargando datos de provincias...</p>
                  </div>
                )}
              </div>
            )}

            {/* Mapa y Hemiciclo - Juveniles */}
            {activeTab === "asoc-juv-mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                  <div className="space-y-4">
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias - Asociaciones Juveniles</h2>
                        <div className="flex gap-2">
                          <Button onClick={() => setMapView('schematic')} variant={mapView === 'schematic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'schematic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                            <Grid3x3 className="w-4 h-4" /> Esquemática
                          </Button>
                          <Button onClick={() => setMapView('realistic')} variant={mapView === 'realistic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'realistic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                            <Map className="w-4 h-4" /> Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === 'schematic' ? (
                        <SpainMapProvincial votosPorProvincia={votosPorProvinciaJuveniles} isYouthAssociations={true} partyMeta={youthPartyMap} onProvinceClick={(province, data, votos, escanos) => { setProvinciaSeleccionadaJuveniles(province); setVotosPorPartidoProvinciaJuveniles(votos); setEscanosProvinciaJuveniles(escanos); }} />
                      ) : (
                        <SpainMapRealistic votosPorProvincia={votosPorProvinciaJuveniles} provinciaMetricsMap={provinciaMetricsMapJuveniles} isYouthAssociations={true} partyMeta={youthPartyMap} onProvinceClick={(province, data, votos, escanos) => { setProvinciaSeleccionadaJuveniles(province); setVotosPorPartidoProvinciaJuveniles(votos); setEscanosProvinciaJuveniles(escanos); }} />
                      )}
                    </div>
                    <div className="liquid-glass p-6 rounded-2xl">
                      {youthStats.length > 0 && (
                        <PactometerInteractive stats={youthStats.map(s => ({ id: s.id, nombre: s.nombre, escanos: s.escanos, porcentaje: s.porcentaje, color: s.color }))} totalSeats={100} requiredForMajority={51} />
                      )}
                    </div>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo de Asociaciones Juveniles</h2>
                      <CongressHemicycle escanos={escanosJuvenilesPorProvincia} totalEscanos={100} provinciaSeleccionada={provinciaSeleccionadaJuveniles} votosProvincia={votosPorPartidoProvinciaJuveniles} escanosProvincia={escanosProvinciaJuveniles} partyMeta={youthPartyMap} />
                    </div>
                  </div>
                ) : (
                  <div className="liquid-glass p-8 rounded-2xl text-center">
                    <p className="text-[#666666]">Cargando datos de provincias de Asociaciones Juveniles...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "simulador-electoral" && (
              <div className="space-y-6">
                <div className="glass-surface p-4 rounded-2xl space-y-4">
                  <h2 className="text-2xl font-bold text-[#2D2D2D]">Simulador Electoral</h2>
                  <p className="text-sm text-[#666666]">
                    Ajusta votos para todos los partidos de administración y añade partidos nuevos para simular escenarios.
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(simulatorPartyMap).map(([partyKey, party]) => (
                      <label key={partyKey} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: party.color }} />
                        <span className="min-w-[120px] text-sm font-semibold text-slate-700">{party.name}</span>
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
                          className="ml-auto w-32 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Crear partido personalizado</p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={newSimulatorPartyName}
                        onChange={(e) => setNewSimulatorPartyName(e.target.value)}
                        placeholder="Nombre del partido"
                        className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="color"
                        value={newSimulatorPartyColor}
                        onChange={(e) => setNewSimulatorPartyColor(e.target.value)}
                        className="h-10 w-14 rounded-md border border-slate-300 bg-white"
                      />
                      <Button onClick={addSimulatorCustomParty} className="bg-[#C41E3A] hover:bg-[#A01830] text-white">
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>

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

                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias (Simulado)</h2>
                    <div className="flex gap-2">
                      <Button onClick={() => setMapView('schematic')} variant={mapView === 'schematic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'schematic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                        <Grid3x3 className="w-4 h-4" /> Esquemática
                      </Button>
                      <Button onClick={() => setMapView('realistic')} variant={mapView === 'realistic' ? 'default' : 'outline'} className={`flex items-center gap-2 ${mapView === 'realistic' ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white' : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'}`}>
                        <Map className="w-4 h-4" /> Realista
                      </Button>
                    </div>
                  </div>
                  {mapView === 'schematic' ? (
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
            )}

            {activeTab === "map" && (
              <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex gap-2">
                  <button onClick={() => setMapMode("general")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "general" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Mapa Generales</button>
                  <button onClick={() => setMapMode("youth")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "youth" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Mapa Juveniles</button>
                </div>
                <SpainMapProvincial votosPorProvincia={activeProvinceVotes} isYouthAssociations={mapMode === "youth"} partyMeta={Object.fromEntries(Object.entries(activePartyMap).map(([k, v]) => [k, { color: v.color }]))} />
              </section>
            )}

            {activeTab === "hemicycle" && (
              <section className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setMapMode("general")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "general" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Hemiciclo Generales</button>
                  <button onClick={() => setMapMode("youth")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mapMode === "youth" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Hemiciclo Juveniles</button>
                </div>
                <CongressHemicycle
                  escanos={Object.fromEntries((mapMode === "youth" ? youthStats : generalStats).map((s) => [s.id, s.escanos]))}
                  totalEscanos={mapMode === "youth" ? 100 : 350}
                  partyMeta={Object.fromEntries(Object.entries(activePartyMap).map(([k, v]) => [k, { name: v.name, color: v.color, logo: v.logo }]))}
                />
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
