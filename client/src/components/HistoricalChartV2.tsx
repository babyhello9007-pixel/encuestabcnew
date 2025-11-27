import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface HistoricalData {
  fecha: string;
  [key: string]: string | number;
}

const COLORS = [
  "#C41E3A", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE"
];

export function HistoricalChartV2({ activeTab }: { activeTab: "general" | "youth" }) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);

  const parties = activeTab === "general" ? PARTIES_GENERAL : YOUTH_ASSOCIATIONS;

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);

        // Intentar obtener datos históricos de Supabase
        try {
          const { data, error } = await supabase
            .from("votos_historicos")
            .select("*")
            .order("fecha", { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            // Agrupar datos por fecha
            const grouped: Record<string, any> = {};
            data.forEach((row: any) => {
              const fecha = new Date(row.fecha).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric"
              });
              if (!grouped[fecha]) {
                grouped[fecha] = { fecha };
              }
              grouped[fecha][row.partido_id] = row.votos;
            });

            const chartData = Object.values(grouped);
            setHistoricalData(chartData);

            // Seleccionar los primeros 5 partidos por defecto
            const partyIds = Object.keys(parties).slice(0, 5);
            setSelectedParties(partyIds);
          } else {
            throw new Error("No data");
          }
        } catch (err) {
          console.error("Error fetching historical data:", err);
          // Usar datos de ejemplo si no hay datos en Supabase
          const exampleData = generateExampleData();
          setHistoricalData(exampleData);
          const partyIds = Object.keys(parties).slice(0, 5);
          setSelectedParties(partyIds);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [activeTab]);

  const generateExampleData = (): HistoricalData[] => {
    const data: HistoricalData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const fechaStr = date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
      
      const entry: HistoricalData = { fecha: fechaStr };
      
      if (activeTab === "general") {
        entry.PP = Math.floor(Math.random() * 50) + 150;
        entry.PSOE = Math.floor(Math.random() * 40) + 100;
        entry.VOX = Math.floor(Math.random() * 30) + 60;
        entry.SUMAR = Math.floor(Math.random() * 25) + 50;
        entry.PODEMOS = Math.floor(Math.random() * 20) + 30;
      } else {
        entry.NNGG = Math.floor(Math.random() * 30) + 100;
        entry.SHAACABAT = Math.floor(Math.random() * 25) + 80;
        entry.REVUELTA = Math.floor(Math.random() * 20) + 60;
        entry.JVOX = Math.floor(Math.random() * 15) + 50;
        entry.JSE = Math.floor(Math.random() * 15) + 70;
      }
      
      data.push(entry);
    }
    
    return data;
  };

  const toggleParty = (partyId: string) => {
    setSelectedParties(prev =>
      prev.includes(partyId)
        ? prev.filter(p => p !== partyId)
        : [...prev, partyId]
    );
  };

  if (loading) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>Cargando datos históricos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-8 rounded-2xl space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-[#2D2D2D] mb-4">Evolución de Votos - Últimos 30 Días</h3>
          <p className="text-sm text-[#666666] mb-6">
            Selecciona los partidos/asociaciones que deseas visualizar en el gráfico
          </p>

          {/* Selector de partidos */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(parties).map(([key, party]) => (
              <button
                key={key}
                onClick={() => toggleParty(key)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedParties.includes(key)
                    ? "bg-[#C41E3A] text-white"
                    : "bg-[#E0D5CC] text-[#2D2D2D] hover:bg-[#D0C5BC]"
                }`}
              >
                {party.name}
              </button>
            ))}
          </div>

          {/* Gráfico de líneas */}
          {historicalData.length > 0 && selectedParties.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
                <XAxis dataKey="fecha" stroke="#666666" />
                <YAxis stroke="#666666" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F5F1E8", border: "1px solid #E0D5CC", borderRadius: "8px" }}
                  labelStyle={{ color: "#2D2D2D" }}
                />
                <Legend />
                {selectedParties.map((partyId, index) => (
                  <Line
                    key={partyId}
                    type="monotone"
                    dataKey={partyId}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                    activeDot={{ r: 6 }}
                    name={parties[partyId as keyof typeof parties]?.name || partyId}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-[#666666] py-8">
              <p>Selecciona al menos un partido para ver el gráfico</p>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {historicalData.length > 0 && selectedParties.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {selectedParties.map((partyId) => {
              const party = parties[partyId as keyof typeof parties];
              const values = historicalData
                .map(d => d[partyId] as number)
                .filter(v => typeof v === "number");
              
              if (values.length === 0) return null;

              const current = values[values.length - 1];
              const initial = values[0];
              const change = current - initial;
              const percentChange = ((change / initial) * 100).toFixed(1);

              return (
                <div key={partyId} className="frosted-glass p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-[#666666]">{party?.name}</p>
                  <p className="text-2xl font-bold text-[#C41E3A]">{current}</p>
                  <p className={`text-xs font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(percentChange))}%
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

