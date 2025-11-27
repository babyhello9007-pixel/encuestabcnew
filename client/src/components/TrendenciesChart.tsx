import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";

interface TrendenciesChartProps {
  activeTab: "general" | "youth";
}

export function TrendenciesChart({ activeTab }: TrendenciesChartProps) {
  const [selectedParties, setSelectedParties] = useState<string[]>([]);

  // Generar datos de ejemplo para los últimos 30 días
  const trendData = useMemo(() => {
    const data = [];
    const parties = activeTab === "general" 
      ? Object.values(PARTIES_GENERAL).slice(0, 8).map(p => p.name)
      : Object.values(YOUTH_ASSOCIATIONS).slice(0, 8).map(a => a.name);

    for (let i = 0; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      
      const dayData: any = { fecha: dateStr };
      
      parties.forEach((party) => {
        // Simular datos con tendencia
        const baseVotes = Math.random() * 100 + 50;
        const trend = (i / 30) * 20;
        const noise = (Math.random() - 0.5) * 30;
        dayData[party] = Math.max(10, baseVotes + trend + noise);
      });
      
      data.push(dayData);
    }
    
    return data;
  }, [activeTab]);

  const parties = activeTab === "general" 
    ? Object.values(PARTIES_GENERAL).slice(0, 8).map(p => p.name)
    : Object.values(YOUTH_ASSOCIATIONS).slice(0, 8).map(a => a.name);

  const colors = [
    "#C41E3A", "#0066CC", "#FFC400", "#00AA00", 
    "#FF6600", "#9933FF", "#00CCCC", "#FF0099"
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

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-8 rounded-2xl space-y-4">
        <h3 className="text-2xl font-bold text-[#2D2D2D]">Evolución de Votos - Últimos 30 Días</h3>
        
        {/* Selector de partidos */}
        <div className="flex flex-wrap gap-2">
          {parties.map((party, idx) => (
            <button
              key={party}
              onClick={() => toggleParty(party)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
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

        {/* Gráfico */}
        <div className="w-full h-96 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                formatter={(value) => value.toFixed(1)}
              />
              <Legend />
              {visibleParties.map((party, idx) => (
                <Line
                  key={party}
                  type="monotone"
                  dataKey={party}
                  stroke={colors[parties.indexOf(party) % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Máximo de Votos</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {Math.max(...trendData.flatMap(d => visibleParties.map(p => d[p]))).toFixed(0)}
            </p>
          </div>
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Mínimo de Votos</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {Math.min(...trendData.flatMap(d => visibleParties.map(p => d[p]))).toFixed(0)}
            </p>
          </div>
          <div className="frosted-glass p-4 rounded-lg text-center">
            <p className="text-sm text-[#666666]">Promedio</p>
            <p className="text-2xl font-bold text-[#C41E3A]">
              {(trendData.flatMap(d => visibleParties.map(p => d[p])).reduce((a, b) => a + b, 0) / (trendData.length * visibleParties.length)).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

