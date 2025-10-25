import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { Loader2 } from "lucide-react";

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [generalStats, setGeneralStats] = useState<PartyStats[]>([]);
  const [youthStats, setYouthStats] = useState<PartyStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "youth">("general");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Obtener total de respuestas
        const { count } = await supabase
          .from("respuestas")
          .select("*", { count: "exact", head: true });
        setTotalResponses(count || 0);

        // Obtener votos para elecciones generales
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

        // Obtener votos para asociaciones juveniles
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
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Actualizar cada 10 segundos
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = activeTab === "general" ? generalStats : youthStats;
  const totalEscanos = activeTab === "general" ? 350 : 50;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-[#E0D5CC]">
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

      {/* Main Content */}
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
            {/* Stats Header */}
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

            {/* Tabs */}
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

            {/* Results Grid */}
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
                    {/* Party Header */}
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

                    {/* Progress Bar */}
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

            {/* Methodology */}
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

            {/* CTA */}
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

      {/* Footer */}
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

