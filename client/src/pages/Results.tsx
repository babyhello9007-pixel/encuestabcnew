import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS } from '@/lib/surveyData';
import { EMBEDDED_LEADERS } from '@/lib/embeddedLeaders';
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { calcularEscanosGeneralesPorProvincia, calcularEscanosJuvenilesPorProvincia } from "@/lib/dhondtByProvince";
import { Loader2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ShareResultsAdvanced } from "@/components/ShareResultsAdvanced";
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
import Footer from "@/components/Footer";
import FollowUsMenu from "@/components/FollowUsMenu";

import { Map, Grid3x3, ArrowLeft } from "lucide-react";

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
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

export default function Results() {
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo">("general");
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

  useEffect(() => {
    if (Object.keys(votosPorProvincia).length > 0 && generalStats.length > 0) {
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      setEscanosGeneralesPorProvincia(escanos);
      
      // Actualizar generalStats con los escaños calculados por provincia
      // Esto asegura que Elecciones Generales y Hemiciclo muestren los mismos números
      const statsActualizados = generalStats.map(stat => ({
        ...stat,
        escanos: escanos[stat.id] || 0
      }));
      setGeneralStats(statsActualizados);
    }
  }, [votosPorProvincia]);

  useEffect(() => {
    if (Object.keys(votosPorProvinciaJuveniles).length > 0 && youthStats.length > 0) {
      const escanos = calcularEscanosJuvenilesPorProvincia(votosPorProvinciaJuveniles);
      setEscanosJuvenilesPorProvincia(escanos);
      
      // Actualizar youthStats con los escaños calculados por provincia
      const statsActualizados = youthStats.map(stat => ({
        ...stat,
        escanos: escanos[stat.id] || 0
      }));
      setYouthStats(statsActualizados);
    }
  }, [votosPorProvinciaJuveniles]);

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
            // Si tampoco existe la tabla, usar datos de ejemplo
            setTotalResponses(631);
          }
        }

        // Intentar obtener datos de votos generales
        try {
          const { data: generalData } = await supabase
            .from("votos_generales_totales")
            .select("*");

          if (generalData && generalData.length > 0) {
            // Inicializar con todos los partidos de PARTIES_GENERAL con 0 votos
            const generalVotos: Record<string, number> = {};
            Object.keys(PARTIES_GENERAL).forEach((key) => {
              generalVotos[key] = 0;
            });
            
            // Actualizar con datos reales de la base de datos
            generalData.forEach((row: any) => {
              generalVotos[row.partido_id] = row.votos;
            });

            // Usar cálculo por provincias si hay datos disponibles, si no usar cálculo nacional
            let escanos: Record<string, number> = {};
            if (Object.keys(votosPorProvincia).length > 0) {
              escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
            } else {
              escanos = calcularEscanosGenerales(generalVotos);
            }
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};

            Object.entries(PARTIES_GENERAL).forEach(([key, party]) => {
              nombres[key] = party.name;
              logos[key] = party.logo;
            });

            const stats = obtenerEstadisticas(generalVotos, escanos, nombres, logos);
            setGeneralStats(stats);
            // Los escaños se actualizarán en el useEffect cuando votosPorProvincia esté disponible
            // (este useEffect se ejecutará después de que votosPorProvincia se haya cargado)
            
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
                    .select("provincia, edad, ideologia");
                  
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
                        if (row.ideologia !== null && row.ideologia !== undefined) {
                          provinciaCounts[row.provincia].ideologia_sum += row.ideologia;
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
            // Datos de ejemplo si no hay datos
            const exampleVotos: Record<string, number> = { PP: 180,
              PSOE: 120,
              VOX: 85,
              SUMAR: 65,
              PODEMOS: 45,
              JUNTS: 35,
              ERC: 30,
              PNV: 25,
              ALIANZA: 15,
              BILDU: 20,
              SAF: 40,
              CC: 10,
              UPN: 8,
              CIUDADANOS: 12,
              CAMINANDO: 5,
              FRENTE: 3,
              IZQUIERDA: 8,
              JUNTOS_EXT: 6,
              PLIB: 4,
              EB: 2,
              BNG: 7,
            };
            const escanos = calcularEscanosGenerales(exampleVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};

            Object.entries(PARTIES_GENERAL).forEach(([key, party]) => {
              nombres[key] = party.name;
              logos[key] = party.logo;
            });

            console.log('exampleVotos keys:', Object.keys(exampleVotos));
            console.log('PARTIES_GENERAL keys:', Object.keys(PARTIES_GENERAL));
            console.log('logos keys:', Object.keys(logos));
            const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos);
            console.log('Stats generales:', stats);
            console.log('Logos disponibles:', logos);
            setGeneralStats(stats);
          }
        } catch (err) {
          console.error("Error fetching general votes:", err);
          // Usar datos de ejemplo
          const exampleVotos: Record<string, number> = {
            PP: 180,
            PSOE: 120,
            VOX: 85,
            SUMAR: 65,
            PODEMOS: 45,
            JUNTS: 35,
            ERC: 30,
            PNV: 25,
            ALIANZA: 15,
            BILDU: 20,
            SAF: 40,
            CC: 10,
            UPN: 8,
            CIUDADANOS: 12,
            CAMINANDO: 5,
            FRENTE: 3,
            IZQUIERDA: 8,
            JUNTOS_EXT: 6,
            PLIB: 4,
            EB: 2,
            BNG: 7,
          };
          const escanos = calcularEscanosGenerales(exampleVotos);
          const nombres: Record<string, string> = {};
          const logos: Record<string, string> = {};

          Object.entries(PARTIES_GENERAL).forEach(([key, party]) => {
            nombres[key] = party.name;
            logos[key] = party.logo;
          });

          const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos);
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

            Object.entries(YOUTH_ASSOCIATIONS).forEach(([key, assoc]) => {
              nombres[key] = assoc.name;
              logos[key] = assoc.logo;
            });

            const stats = obtenerEstadisticas(youthVotos, escanos, nombres, logos);
            setYouthStats(stats);
          } else {
            // Datos de ejemplo si no hay datos
            const exampleYouthVotos: Record<string, number> = {
              SHAACABAT: 95,
              REVUELTA: 75,
              NNGG: 120,
              JVOX: 65,
              VLE: 45,
              JSE: 85,
              PATRIOTA: 35,
              JIU: 40,
              JCOMUNISTA: 30,
              JCS: 25,
              EGI: 15,
              ERNAI: 20,
              JERC: 35,
              JNC: 28,
              GALIZANOVA: 18,
              ARRAN: 22,
              JNCANA: 12,
              JPV: 16,
              ACL: 14,
              JEC: 10,
              AGORA: 8,
            };
            const escanos = calcularEscanosJuveniles(exampleYouthVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};

            Object.entries(YOUTH_ASSOCIATIONS).forEach(([key, assoc]) => {
              nombres[key] = assoc.name;
              logos[key] = assoc.logo;
            });

            const stats = obtenerEstadisticas(exampleYouthVotos, escanos, nombres, logos);
            setYouthStats(stats);
          }
        } catch (err) {
          console.error("Error fetching youth votes:", err);
          // Usar datos de ejemplo
          const exampleYouthVotos: Record<string, number> = {
            SHAACABAT: 95,
            REVUELTA: 75,
            NNGG: 120,
            JVOX: 65,
            VLE: 45,
            JSE: 85,
            PATRIOTA: 35,
            JIU: 40,
            JCOMUNISTA: 30,
            JCS: 25,
            EGI: 15,
            ERNAI: 20,
            JERC: 35,
            JNC: 28,
            GALIZANOVA: 18,
            ARRAN: 22,
            JNCANA: 12,
            JPV: 16,
            ACL: 14,
            JEC: 10,
            AGORA: 8,
          };
          const escanos = calcularEscanosJuveniles(exampleYouthVotos);
          const nombres: Record<string, string> = {};
          const logos: Record<string, string> = {};

          Object.entries(YOUTH_ASSOCIATIONS).forEach(([key, assoc]) => {
            nombres[key] = assoc.name;
            logos[key] = assoc.logo;
          });

          const stats = obtenerEstadisticas(exampleYouthVotos, escanos, nombres, logos);
          setYouthStats(stats);
        }

        // Cargar votos por provincia para asociaciones juveniles
        try {
          const { data: provinciaJuvenilData } = await supabase
            .from("votos_por_provincia_juveniles_view")
            .select("provincia, asociacion, votos");
          
          if (provinciaJuvenilData && provinciaJuvenilData.length > 0) {
            const votosProvJuveniles: Record<string, Record<string, number>> = {};
            
            provinciaJuvenilData.forEach((row: any) => {
              if (row.provincia && row.asociacion) {
                if (!votosProvJuveniles[row.provincia]) {
                  votosProvJuveniles[row.provincia] = {};
                }
                votosProvJuveniles[row.provincia][row.asociacion] = row.votos;
              }
            });
            
            setVotosPorProvinciaJuveniles(votosProvJuveniles);
          }
        } catch (err) {
          console.error("Error fetching votos por provincia juveniles:", err);
        }

        // Intentar usar el VIEW de valoraciones
        try {
          const { data: viewData } = await supabase
            .from("valoraciones_lideres_view")
            .select("*");
          
          if (viewData && viewData.length > 0) {
            const leaderMap: Record<string, { name: string; fieldName: string }> = {
              'feijoo': { name: 'Alberto Núñez Feijóo', fieldName: 'val_feijoo' },
              'sanchez': { name: 'Pedro Sánchez', fieldName: 'val_sanchez' },
              'abascal': { name: 'Santiago Abascal', fieldName: 'val_abascal' },
              'alvise': { name: 'Alvise Pérez', fieldName: 'val_alvise' },
              'yolanda_diaz': { name: 'Yolanda Díaz', fieldName: 'val_yolanda_diaz' },
              'irene_montero': { name: 'Irene Montero', fieldName: 'val_irene_montero' },
              'ayuso': { name: 'Isabel Díaz Ayuso', fieldName: 'val_ayuso' },
              'buxade': { name: 'Jorge Buxadé', fieldName: 'val_buxade' },
            };
            
            const ratings: LeaderRating[] = viewData.map((row: any) => {
              const leader = leaderMap[row.lider];
              return {
                name: leader.name,
                fieldName: leader.fieldName,
                average: parseFloat(row.valoracion_media) || 0,
                count: row.total_valoraciones || 0,
              };
            });
            setLeaderRatings(ratings);
          }
        } catch (err) {
          // Fallback: calcular manualmente si el VIEW no existe
          const { data: allResponses } = await supabase
            .from("respuestas")
            .select("val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade");

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
              let sum = 0;
              let count = 0;
              allResponses.forEach((r: any) => {
                const value = r[leader.fieldName];
                if (value !== null && value !== undefined) {
                  sum += value;
                  count += 1;
                }
              });
              const average = count > 0 ? sum / count : 0;
              return {
                name: leader.name,
                fieldName: leader.fieldName,
                average: Math.round(average * 10) / 10,
                count: count,
              };
            });

            setLeaderRatings(ratings);
          }
        }

        // Obtener nota ejecutivo
        try {
          const { data: notaData } = await supabase
            .from("media_nota_ejecutivo")
            .select("nota_media");
          if (notaData && notaData.length > 0) {
            setNotaEjecutivo(notaData[0].nota_media);
          }
        } catch (err) {
          console.log('Nota ejecutivo no disponible');
        }

        // Obtener edad promedio
        try {
          const { data: edadData } = await supabase.from("edad_promedio").select("edad_media");
          if (edadData && edadData.length > 0) {
            setEdadPromedio(edadData[0].edad_media);
          }
        } catch (err) {
          console.error("Error fetching edad promedio:", err);
        }

        // Obtener ideología promedio
        try {
          const { data: ideologiaData } = await supabase.from("ideologia_promedio").select("ideologia_media");
          if (ideologiaData && ideologiaData.length > 0) {
            setIdeologiaPromedio(ideologiaData[0].ideologia_media);
          }
        } catch (err) {
          console.error("Error fetching ideologia promedio:", err);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = activeTab === "general" ? generalStats : activeTab === "youth" ? youthStats : [];
  const totalEscanos = activeTab === "general" ? 350 : activeTab === "youth" ? 100 : 0;

  const exportToCSV = () => {
    const headers = ['Partido/Asociación', 'Votos', 'Porcentaje', 'Escaños', 'Porcentaje de Escaños'];
    const rows = stats.map(party => [
      party.nombre,
      party.votos,
      party.porcentaje.toFixed(2) + '%',
      party.escanos,
      ((party.escanos / totalEscanos) * 100).toFixed(2) + '%'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const { downloadPDFWithMetrics } = await import("@/lib/pdfExportMetrics");
      await downloadPDFWithMetrics(stats, activeTab, totalResponses, edadPromedio, ideologiaPromedio);
    } catch (err) {
      console.error("Error exporting to PDF:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-foreground">Resultados - Batalla Cultural</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="btn-secondary text-sm"
            >
              Volver
            </Button>
            <FollowUsMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="space-y-8">
            <div className="liquid-glass p-8 space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Resultados en Vivo</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="stat-box">
                  <p className="text-sm text-muted-foreground">Total de Respuestas</p>
                  <p className="stat-value">
                    {totalResponses.toLocaleString()}
                  </p>
                </div>
                <div className="stat-box">
                  <p className="text-sm text-muted-foreground">Escaños en Juego</p>
                  <p className="stat-value">{totalEscanos}</p>
                </div>
                <div className="stat-box">
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="text-lg font-semibold text-foreground">Tiempo Real</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
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
            </div>

            <div className="flex gap-4 border-b border-[#E0D5CC]">
              <button
                onClick={() => setActiveTab("general")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "general"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Elecciones Generales
              </button>
              <button
                onClick={() => setActiveTab("mapa-hemiciclo")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "mapa-hemiciclo"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Mapa y Hemiciclo
              </button>
              <button
                onClick={() => setActiveTab("ccaa")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "ccaa"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                CCAA
              </button>
              <button
                onClick={() => setActiveTab("provincias")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "provincias"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Provincias
              </button>
              <button
                onClick={() => setActiveTab("comparacion-ccaa")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "comparacion-ccaa"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Comparar CCAA
              </button>
              <button
                onClick={() => setActiveTab("youth")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "youth"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Asociaciones
              </button>
              <button
                onClick={() => setActiveTab("asoc-juv-mapa-hemiciclo")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "asoc-juv-mapa-hemiciclo"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Asoc. Juveniles; Mapa y Hemiciclo
              </button>
              <button
                onClick={() => setActiveTab("leaders")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "leaders"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Líderes Preferidos
              </button>
              <button
                onClick={() => setActiveTab("tendencias")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "tendencias"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Variación de Votaciones por Día
              </button>
              <button
                onClick={() => setActiveTab("lideres-preferidos")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "lideres-preferidos"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Líderes de Partidos
              </button>
              <div className="ml-auto flex gap-2">
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white text-sm flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <ShareResultsAdvanced 
                  activeTab={activeTab} 
                  stats={stats}
                  totalVotes={stats.reduce((sum, s) => sum + s.votos, 0)}
                  edadPromedio={edadPromedio}
                />
              </div>
            </div>



            {(activeTab === "general" || activeTab === "youth") && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setSortBy('votos')}
                  variant={sortBy === 'votos' ? 'default' : 'outline'}
                  className="text-sm"
                >
                  Ordenar por Votos
                </Button>
                <Button
                  onClick={() => setSortBy('escanos')}
                  variant={sortBy === 'escanos' ? 'default' : 'outline'}
                  className="text-sm"
                >
                  Ordenar por Escaños
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {stats.length > 0 && (
                (sortBy === 'votos' ? [...stats].sort((a, b) => b.votos - a.votos) : [...stats].sort((a, b) => b.escanos - a.escanos)).map((party) => {
                  // Buscar el logo en PARTIES_GENERAL o YOUTH_ASSOCIATIONS basándose en el nombre
                  let logoUrl = party.logo;
                  
                  // Si no hay logo, buscar en PARTIES_GENERAL por nombre
                  if (!logoUrl) {
                    for (const [key, partyData] of Object.entries(PARTIES_GENERAL)) {
                      if (partyData.name === party.nombre) {
                        logoUrl = partyData.logo;
                        break;
                      }
                    }
                  }
                  
                  // Si aún no hay logo, buscar en YOUTH_ASSOCIATIONS por nombre
                  if (!logoUrl) {
                    for (const [key, assocData] of Object.entries(YOUTH_ASSOCIATIONS)) {
                      if (assocData.name === party.nombre) {
                        logoUrl = assocData.logo;
                        break;
                      }
                    }
                  }
                  
                  // Si aún no hay logo, intentar con el ID en PARTIES_GENERAL
                  if (!logoUrl) {
                    const partyData = PARTIES_GENERAL[party.id as keyof typeof PARTIES_GENERAL];
                    if (partyData) {
                      logoUrl = partyData.logo;
                    }
                  }
                  
                  // Si aún no hay logo, intentar con el ID en YOUTH_ASSOCIATIONS
                  if (!logoUrl) {
                    const assocData = YOUTH_ASSOCIATIONS[party.id as keyof typeof YOUTH_ASSOCIATIONS];
                    if (assocData) {
                      logoUrl = assocData.logo;
                    }
                  }
                  
                  return (
                  <div
                    key={party.id}
                    className="glass-card p-6 rounded-xl space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPartyForStats(party.nombre)}
                  >
                    <div className="flex items-center gap-4">
                      {logoUrl ? (
                        <PartyLogo src={logoUrl} alt={party.nombre} partyName={party.nombre} size={48} />
                      ) : (
                        <div className="h-12 w-12 bg-gray-300 rounded-2xl flex items-center justify-center text-xs text-gray-500">N/A</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-[#2D2D2D]">{party.nombre}</h3>
                        <p className="text-sm text-[#666666]">
                          {party.votos.toLocaleString()} votos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#C41E3A]">{party.escanos}</p>
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
                          className="h-full bg-[#C41E3A] transition-all duration-500"
                          style={{ width: `${party.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>

            <>
            {activeTab === "tendencias" && (
              <TrendenciesChart />
            )}
            {activeTab === "lideres-preferidos" && (
              <LeadersResultsChart />
            )}
            {activeTab === "ccaa" && (
              <CCAAResltsSection />
            )}
            {activeTab === "provincias" && (
              <ProvincesResultsSection />
            )}
            {activeTab === "comparacion-ccaa" && (
              <CCAAComparisonSection />
            )}
            {activeTab === "asoc-juv-mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvinciaJuveniles).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias - Asociaciones Juveniles</h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setMapView('schematic')}
                            variant={mapView === 'schematic' ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${
                              mapView === 'schematic'
                                ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white'
                                : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                            }`}
                          >
                            <Grid3x3 className="w-4 h-4" />
                            Esquemática
                          </Button>
                          <Button
                            onClick={() => setMapView('realistic')}
                            variant={mapView === 'realistic' ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${
                              mapView === 'realistic'
                                ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white'
                                : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                            }`}
                          >
                            <Map className="w-4 h-4" />
                            Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === 'schematic' ? (
                        <SpainMapProvincial 
                          votosPorProvincia={votosPorProvinciaJuveniles}
                          isYouthAssociations={true}
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
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionadaJuveniles(province);
                            setVotosPorPartidoProvinciaJuveniles(votos);
                            setEscanosProvinciaJuveniles(escanos);
                          }}
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
            {activeTab === "mapa-hemiciclo" && (
              <div className="space-y-4">
                {Object.keys(votosPorProvincia).length > 0 ? (
                  <>
                    <div className="liquid-glass p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Mapa de Provincias</h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setMapView('schematic')}
                            variant={mapView === 'schematic' ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${
                              mapView === 'schematic'
                                ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white'
                                : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                            }`}
                          >
                            <Grid3x3 className="w-4 h-4" />
                            Esquemática
                          </Button>
                          <Button
                            onClick={() => setMapView('realistic')}
                            variant={mapView === 'realistic' ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${
                              mapView === 'realistic'
                                ? 'bg-[#C41E3A] hover:bg-[#A01830] text-white'
                                : 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white'
                            }`}
                          >
                            <Map className="w-4 h-4" />
                            Realista
                          </Button>
                        </div>
                      </div>
                      {mapView === 'schematic' ? (
                        <SpainMapProvincial 
                          votosPorProvincia={votosPorProvinciaJuveniles}
                          isYouthAssociations={true}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionadaJuveniles(province);
                            setVotosPorPartidoProvinciaJuveniles(votos);
                            setEscanosProvinciaJuveniles(escanos);
                          }}
                        />
                      ) : (
                        <SpainMapRealistic 
                          votosPorProvincia={votosPorProvincia}
                          provinciaMetricsMap={provinciaMetricsMap}
                          isYouthAssociations={false}
                          onProvinceClick={(province, data, votos, escanos) => {
                            setProvinciaSeleccionada(province);
                            setVotosPorPartidoProvincia(votos);
                            setEscanosProvincia(escanos);
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="liquid-glass p-4 rounded-2xl">
                      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Hemiciclo del Congreso de los Diputados</h2>
                      <CongressHemicycle 
                        escanos={escanosGeneralesPorProvincia}
                        totalEscanos={350}
                        provinciaSeleccionada={provinciaSeleccionada}
                        votosProvincia={votosPorPartidoProvincia}
                        escanosProvincia={escanosProvincia}
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
                    // Mapeo de fieldName a clave de LEADERS
                    const leaderKeyMap: Record<string, keyof typeof LEADERS> = {
                      'val_feijoo': 'FEIJOO',
                      'val_sanchez': 'SANCHEZ',
                      'val_abascal': 'ABASCAL',
                      'val_alvise': 'ALVISE',
                      'val_yolanda_diaz': 'YOLANDA',
                      'val_irene_montero': 'IRENE',
                      'val_ayuso': 'AYUSO',
                      'val_buxade': 'BUXADE',
                    };
                    const leaderKey = leaderKeyMap[leader.fieldName];
                    const leaderData = leaderKey ? LEADERS[leaderKey] : null;
                    const leaderImagePath = leaderData?.image;
                    let leaderImage: string | undefined;
                    if (leaderImagePath) {
                      const filename = leaderImagePath.split('/').pop();
                      if (filename) {
                        const embeddedKey = Object.keys(EMBEDDED_LEADERS).find(key => key.toLowerCase().includes(filename.toLowerCase().replace(/\.[^/.]+$/, '')));
                        if (embeddedKey) leaderImage = EMBEDDED_LEADERS[embeddedKey];
                      }
                    }
                    if (!leaderImage && leaderImagePath) leaderImage = leaderImagePath;
                    
                    // Debug logging para Feijóo
                    if (leader.fieldName === 'FEIJOO') {
                      console.log('Feijóo image:', leaderImage, 'Leader data:', leaderData);
                    }
                    
                    return (
                    <div key={leader.fieldName} className="glass-card p-6 rounded-xl space-y-3 hover:shadow-lg transition-shadow">
                      {leaderImage ? (
                        <img
                          src={leaderImage}
                          alt={leader.name}
                          className="w-full h-32 object-cover rounded-lg"
                          style={{ display: 'block', width: '100%', height: '128px' }}
                          onError={(e) => {
                            console.error('Error loading image for', leader.name, ':', e);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            if (leader.fieldName === 'FEIJOO') console.log('Feijóo image loaded successfully');
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                          Sin imagen
                        </div>
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

            {activeTab !== "leaders" && (
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

            <CommentsSection activeTab={activeTab} />
            </>

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
          <p>
            La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}
