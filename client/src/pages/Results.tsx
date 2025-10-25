import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export default function Results() {
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "youth">("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);

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
          const { count } = await supabase
            .from("respuestas")
            .select("*", { count: "exact", head: true });
          setTotalResponses(count || 0);
        }

        const { data: generalData } = await supabase
          .from("votos_generales_totales")
          .select("*");

        if (generalData) {
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
        }

        const { data: youthData } = await supabase
          .from("votos_juveniles_totales")
          .select("*");

        if (youthData) {
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

  const stats = activeTab === "general" ? generalStats : youthStats;
  const totalEscanos = activeTab === "general" ? 350 : 50;

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
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#C41E3A] mx-auto" />
              <p className="text-[#666666]">Cargando resultados...</p>
            </div>
          </div>
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
            </div>

            <div className="space-y-4">
              {stats.length === 0 ? (
                <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
                  <p>No hay datos disponibles aún. Sé el primero en responder la encuesta.</p>
                </div>
              ) : (
                stats.map((party) => (
                  <div
                    key={party.id}
                    className="glass-card p-6 rounded-xl space-y-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {party.logo && (
                        <img
                          src={party.logo}
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
                ))
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#2D2D2D]">Valoración de Líderes Políticos</h2>
              {leaderRatings.length === 0 ? (
                <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
                  <p>Aún no hay valoraciones. Sé el primero en responder la encuesta.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leaderRatings.map((leader) => (
                    <div key={leader.fieldName} className="glass-card p-6 rounded-xl space-y-3 hover:shadow-lg transition-shadow">
                      <h4 className="font-semibold text-[#2D2D2D]">{leader.name}</h4>
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
                  ))}
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
