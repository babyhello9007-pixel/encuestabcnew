import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS } from '@/lib/surveyData';
import { calcularEscanosGenerales, calcularEscanosJuveniles, obtenerEstadisticas } from "@/lib/dhondt";
import { Loader2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";

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
  const [activeTab, setActiveTab] = useState<"general" | "youth">("general");
  const [leaderRatings, setLeaderRatings] = useState<LeaderRating[]>([]);
  const [edadPromedio, setEdadPromedio] = useState<number | null>(null);
  const [ideologiaPromedio, setIdeologiaPromedio] = useState<number | null>(null);

  // Usar tRPC para obtener datos
  const { data: totalResponsesData } = trpc.survey.getTotalResponses.useQuery();
  const { data: generalVotesData } = trpc.survey.getGeneralVotes.useQuery();
  const { data: youthVotesData } = trpc.survey.getYouthVotes.useQuery();
  const { data: leaderRatingsData } = trpc.survey.getLeaderRatings.useQuery();
  const { data: averageAgeData } = trpc.survey.getAverageAge.useQuery();
  const { data: averageIdeologyData } = trpc.survey.getAverageIdeology.useQuery();

  // Actualizar estados cuando los datos de tRPC lleguen
  useEffect(() => {
    if (totalResponsesData !== undefined) {
      setTotalResponses(totalResponsesData || 0);
    }
  }, [totalResponsesData]);

  useEffect(() => {
    if (averageAgeData !== undefined) {
      setEdadPromedio(averageAgeData);
    }
  }, [averageAgeData]);

  useEffect(() => {
    if (averageIdeologyData !== undefined) {
      setIdeologiaPromedio(averageIdeologyData);
    }
  }, [averageIdeologyData]);

  // Procesar votos generales
  useEffect(() => {
    if (generalVotesData && generalVotesData.length > 0) {
      const generalVotos: Record<string, number> = {};
      generalVotesData.forEach((row: any) => {
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
      setLoading(false);
    } else if (generalVotesData === null) {
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

      const stats = obtenerEstadisticas(exampleVotos, escanos, nombres, logos);
      setGeneralStats(stats);
      setLoading(false);
    }
  }, [generalVotesData]);

  // Procesar votos juveniles
  useEffect(() => {
    if (youthVotesData && youthVotesData.length > 0) {
      const youthVotos: Record<string, number> = {};
      youthVotesData.forEach((row: any) => {
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
    } else if (youthVotesData === null) {
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
  }, [youthVotesData]);

  // Procesar valoraciones de líderes
  useEffect(() => {
    if (leaderRatingsData && leaderRatingsData.length > 0) {
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

      const ratings: LeaderRating[] = [];

      for (const [key, info] of Object.entries(leaderMap)) {
        const leaderData = leaderRatingsData.find((d: any) => d.lider === key);
        if (leaderData) {
          ratings.push({
            name: info.name,
            fieldName: info.fieldName,
            average: leaderData.promedio_valoracion || 0,
            count: leaderData.total_valoraciones || 0,
          });
        }
      }

      setLeaderRatings(ratings);
    }
  }, [leaderRatingsData]);

  const handleExportCSV = () => {
    const stats = activeTab === "general" ? generalStats : youthStats;
    const headers = ["Partido/Asociación", "Votos", "Porcentaje", "Escaños"];
    const rows = stats.map(s => [s.nombre, s.votos, s.porcentaje.toFixed(2) + "%", s.escanos]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F1419] to-[#1A1A1A]">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-[#C41E3A] mx-auto" />
          <p className="text-white text-lg">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#0F1419] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b border-[#2D2D2D]">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-[#C41E3A]">Batalla Cultural - Resultados</h1>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="text-[#999999] hover:text-[#C41E3A] transition text-sm"
          >
            Volver
          </button>
        </div>
      </header>

      <main className="container py-12">
        {/* Estadísticas en Vivo */}
        <section className="mb-12 space-y-6">
          <h2 className="text-3xl font-bold text-white">Resultados en Vivo</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-xl space-y-2">
              <p className="text-sm text-[#999999]">Total de Respuestas</p>
              <p className="text-3xl font-bold text-[#C41E3A]">+{totalResponses.toLocaleString()}</p>
            </div>

            {edadPromedio !== null && (
              <div className="glass-card p-6 rounded-xl space-y-2">
                <p className="text-sm text-[#999999]">Edad Promedio</p>
                <p className="text-3xl font-bold text-[#C41E3A]">{edadPromedio.toFixed(1)} años</p>
              </div>
            )}

            {ideologiaPromedio !== null && (
              <div className="glass-card p-6 rounded-xl space-y-2">
                <p className="text-sm text-[#999999]">Ideología Promedio</p>
                <p className="text-3xl font-bold text-[#C41E3A]">{ideologiaPromedio.toFixed(1)}</p>
              </div>
            )}

            <div className="glass-card p-6 rounded-xl space-y-2">
              <p className="text-sm text-[#999999]">Actualización</p>
              <p className="text-sm text-[#999999]">Tiempo Real</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-12">
          <div className="flex gap-4 mb-8 border-b border-[#2D2D2D]">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "general"
                  ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              Elecciones Generales
            </button>
            <button
              onClick={() => setActiveTab("youth")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "youth"
                  ? "text-[#C41E3A] border-b-2 border-[#C41E3A]"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              Asociaciones Juveniles
            </button>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {(activeTab === "general" ? generalStats : youthStats).map((party) => (
              <div key={party.id} className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-6">
                  {party.logo && (
                    <img
                      src={party.logo}
                      alt={party.nombre}
                      className="h-16 w-16 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{party.nombre}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-[#999999]">Votos</p>
                        <p className="text-lg font-semibold text-white">{party.votos}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#999999]">Porcentaje</p>
                        <p className="text-lg font-semibold text-white">{party.porcentaje.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#999999]">Escaños</p>
                        <p className="text-lg font-semibold text-[#C41E3A]">{party.escanos}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Valoración de Líderes */}
        {leaderRatings.length > 0 && (
          <section className="mb-12 space-y-6">
            <h2 className="text-3xl font-bold text-white">Valoración de Líderes Políticos</h2>

            {/* Gráfico de Barras */}
            <div className="glass-card p-6 rounded-xl">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={leaderRatings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: "#999999", fontSize: 12 }}
                  />
                  <YAxis domain={[0, 10]} tick={{ fill: "#999999" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2D2D2D",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#C41E3A" }}
                  />
                  <Bar dataKey="average" fill="#C41E3A" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tarjetas de Líderes */}
            <div className="grid md:grid-cols-2 gap-6">
              {leaderRatings.map((leader) => (
                <div key={leader.fieldName} className="glass-card p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-bold text-white">{leader.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#999999]">Valoración Promedio</span>
                      <span className="text-[#C41E3A] font-semibold">{leader.average.toFixed(2)}/10</span>
                    </div>
                    <div className="w-full bg-[#2D2D2D] rounded-full h-2">
                      <div
                        className="bg-[#C41E3A] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(leader.average / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#666666]">{leader.count} valoraciones</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Export Button */}
        <section className="flex gap-4 justify-center mb-12">
          <Button
            onClick={handleExportCSV}
            className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </section>
      </main>
    </div>
  );
}

