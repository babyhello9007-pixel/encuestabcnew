import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS } from '@/lib/surveyData';
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { Loader2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ShareResultsAdvanced } from "@/components/ShareResultsAdvanced";
import { CommentsSection } from "@/components/CommentsSection";
import { PartyMetricsDisplay } from "@/components/PartyMetricsDisplay";
import { TrendenciesChart } from "@/components/TrendenciesChart";

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
  const [activeTab, setActiveTab] = useState<"general" | "youth" | "leaders" | "metrics" | "tendencias">("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [edadPromedio, setEdadPromedio] = useState<number | null>(null);
  const [ideologiaPromedio, setIdeologiaPromedio] = useState<number | null>(null);
  const [generalMetrics, setGeneralMetrics] = useState<PartyMetrics[]>([]);
  const [youthMetrics, setYouthMetrics] = useState<PartyMetrics[]>([]);
  const [historialVotos, setHistorialVotos] = useState<Array<{fecha: string, votos: number}>>([]);
  const [notaEjecutivo, setNotaEjecutivo] = useState<number | null>(null);

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
            const generalVotos: Record<string, number> = {};
            generalData.forEach((row: any) => {
              generalVotos[row.partido_id] = row.votos;
            });

            const escanos = calcularEscanosGenerales(generalVotos);
            const nombres: Record<string, string> = {};
            const logos: Record<string, string> = {};

            Object.entries(PARTIES_GENERAL).forEach(([key, party]) => {
              nombres[key] = party.name;
              logos[key] = party.logo;
            });

            const stats = obtenerEstadisticas(generalVotos, escanos, nombres, logos);
            setGeneralStats(stats);
          } else {
            // Datos de ejemplo si no hay datos
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
              OTROS: 5,
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
            OTROS: 5,
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
              OTROS: 5,
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
            OTROS: 5,
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
  const totalEscanos = activeTab === "general" ? 350 : activeTab === "youth" ? 50 : 0;

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      <header className="sticky top-0 z-50 header-dark border-b">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-bold text-[#C41E3A]">Resultados - Batalla Cultural</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-[#C41E3A] text-[#C41E3A] text-sm"
          >
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="space-y-8">
            <div className="liquid-glass p-8 rounded-2xl space-y-4">
              <h2 className="text-3xl font-bold text-[#2D2D2D]">Resultados en Vivo</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="frosted-glass p-4 rounded-lg text-center">
                  <p className="text-sm text-[#666666]">Total de Respuestas</p>
                  <p className="text-3xl font-bold text-[#C41E3A]">
                    {totalResponses.toLocaleString()}
                  </p>
                </div>
                <div className="frosted-glass p-4 rounded-lg text-center">
                  <p className="text-sm text-[#666666]">Escaños en Juego</p>
                  <p className="text-3xl font-bold text-[#C41E3A]">{totalEscanos}</p>
                </div>
                <div className="frosted-glass p-4 rounded-lg text-center">
                  <p className="text-sm text-[#666666]">Última Actualización</p>
                  <p className="text-lg font-semibold text-[#2D2D2D]">Tiempo Real</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {edadPromedio !== null && (
                  <div className="frosted-glass p-4 rounded-lg text-center">
                    <p className="text-sm text-[#666666]">Edad Media</p>
                    <p className="text-3xl font-bold text-[#C41E3A]">{edadPromedio}</p>
                    <p className="text-xs text-[#999999]">años</p>
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
                onClick={() => setActiveTab("youth")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "youth"
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                    : "text-[#666666] hover:text-[#2D2D2D]"
                }`}
              >
                Asociaciones Juveniles
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
                Tendencias
              </button>
              <div className="ml-auto flex gap-2">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white text-sm flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
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
                />
              </div>
            </div>

            <div className="space-y-4">
              {stats.length === 0 ? (
                <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
                  <p>No hay datos disponibles aún. Sé el primero en responder la encuesta.</p>
                </div>
              ) : (
                stats.map((party) => {
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
                    className="glass-card p-6 rounded-xl space-y-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt={party.nombre}
                          className="h-12 w-12 object-contain rounded-lg bg-white p-1"
                        />
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
              <TrendenciesChart activeTab={activeTab === "general" ? "general" : "youth"} />
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
                    const leaderImages: Record<string, string> = {
                      'val_feijoo': '/assets/images/feijoo-nuevo.png',
                      'val_sanchez': '/assets/icons/PedroSanchez.png',
                      'val_abascal': '/assets/icons/SantiagoAbascal.png',
                      'val_alvise': '/assets/icons/AlvisePerez.png',
                      'val_yolanda_diaz': '/assets/icons/YolandaDiaz.png',
                      'val_irene_montero': '/assets/icons/IreneMontero.png',
                      'val_ayuso': '/assets/icons/IsabelDiazAyuso.png',
                      'val_buxade': '/assets/icons/JorgeBuxade.png',
                    };
                    return (
                    <div key={leader.fieldName} className="glass-card p-6 rounded-xl space-y-3 hover:shadow-lg transition-shadow">
                      {leaderImages[leader.fieldName] && (
                        <img
                          src={leaderImages[leader.fieldName]}
                          alt={leader.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
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
                  requiere el 3% de los votos válidos. En asociaciones juveniles, el 7%.
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

      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            III Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}
