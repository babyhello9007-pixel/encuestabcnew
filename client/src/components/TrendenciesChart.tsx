import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface TrendenciesChartProps {
  activeTab: "general" | "youth";
}

interface VotoData {
  fecha: string;
  partido: string;
  votos_diarios: number;
}

export function TrendenciesChart({ activeTab }: TrendenciesChartProps) {
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const viewName = activeTab === "general" 
          ? "historial_votos_por_fecha"
          : "historial_votos_asociaciones_por_fecha";

        const { data, error } = await supabase
          .from(viewName)
          .select("*")
          .order("fecha", { ascending: true });

        if (error) {
          console.error("Error fetching trends:", error);
          return;
        }

        if (!data || data.length === 0) {
          setTrendData([]);
          setParties([]);
          return;
        }

        // Agrupar datos por fecha
        const groupedByDate: Record<string, any> = {};
        const partiesSet = new Set<string>();

        (data as VotoData[]).forEach((item) => {
          const fecha = item.fecha;
          const partido = item.partido;
          
          partiesSet.add(partido);

          if (!groupedByDate[fecha]) {
            groupedByDate[fecha] = { fecha };
          }
          groupedByDate[fecha][partido] = item.votos_diarios;
        });

        const sortedData = Object.values(groupedByDate).sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });

        const partiesArray = Array.from(partiesSet).sort();
        setTrendData(sortedData);
        setParties(partiesArray);
        setSelectedParties([]);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const colors = [
    "#C41E3A", "#0066CC", "#FFC400", "#00AA00", 
    "#FF6600", "#9933FF", "#00CCCC", "#FF0099",
    "#33CC33", "#FF3333", "#3333FF", "#FFCC00"
  ];

  const toggleParty = (party: string) => {
    setSelectedParties(prev => 
      prev.includes(party) 
        ? prev.filter(p => p !== party)
        : [...prev, party]
    );
  };

  // Si no hay partidos seleccionados, mostrar todos
  const visibleParties = selectedParties.length === 0 ? parties : selectedParties;

  if (loading) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#C41E3A]" />
        <p className="text-[#666666] mt-4">Cargando datos de tendencias...</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>No hay datos de tendencias disponibles aún.</p>
      </div>
    );
  }

  const maxVotes = Math.max(
    ...trendData.flatMap(d => visibleParties.map(p => d[p] || 0))
  );

  const totalVotes = trendData.reduce((sum, d) => {
    return sum + visibleParties.reduce((partSum, p) => partSum + (d[p] || 0), 0);
  }, 0);

  const avgVotesPerDay = totalVotes / trendData.length;

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-8 rounded-2xl space-y-4">
        <h3 className="text-2xl font-bold text-[#2D2D2D]">Variación de Votaciones por Día</h3>
        
        {/* Selector de partidos */}
        <div className="flex flex-wrap gap-2">
          {parties.map((party, idx) => (
            <button
              key={party}
              onClick={() => toggleParty(party)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                selectedParties.length === 0 || selectedParties.includes(party)
                  ? "text-white"
                  : "text-[#999999] opacity-50"
              }`}
              style={{
                backgroundColor: selectedParties.length === 0 || selectedParties.includes(party) 
                  ? colors[idx % colors.length]
                  : "#E0D5CC"
              }}
            >
              {party}
            </button>
          ))}
        </div>

        {/* Gráfico de barras apiladas */}
        <div className="w-full h-96 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
              <XAxis 
                dataKey="fecha" 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#FAFAF8",
                  border: "1px solid #E0D5CC",
                  borderRadius: "8px",
                  color: "#2D2D2D"
                }}
                formatter={(value) => Math.round(value as number)}
              />
              <Legend />
              {visibleParties.map((party, idx) => (
                <Bar
                  key={party}
                  dataKey={party}
                  stackId="votes"
                  fill={colors[parties.indexOf(party) % colors.length]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Máximo Votos en un Día</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {Math.max(...trendData.map(d => 
                visibleParties.reduce((sum, p) => sum + (d[p] || 0), 0)
              ))}
            </p>
          </div>
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Promedio Votos por Día</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {Math.round(avgVotesPerDay)}
            </p>
          </div>
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Total de Votos</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {totalVotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

