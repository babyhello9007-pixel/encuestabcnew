import { useState, useEffect } from "react";
import { calculateMetricsByParty, PartyMetrics } from "@/lib/metricsCalculator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#C41E3A", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];

export function PartyMetricsDisplay({ activeTab }: { activeTab: "general" | "youth" }) {
  const [metrics, setMetrics] = useState<PartyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await calculateMetricsByParty(activeTab);
        setMetrics(data);
        if (data.length > 0) {
          setSelectedParty(data[0].partyId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>Calculando métricas por partido...</p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>No hay datos disponibles para calcular métricas.</p>
      </div>
    );
  }

  const selectedMetrics = metrics.find(m => m.partyId === selectedParty);

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-8 rounded-2xl space-y-6">
        <h3 className="text-2xl font-bold text-[#2D2D2D]">Métricas por Partido/Asociación</h3>

        {/* Selector de partido */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">Selecciona un partido:</label>
          <select
            value={selectedParty || ""}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-[#E0D5CC] bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
          >
            {metrics.map((m) => (
              <option key={m.partyId} value={m.partyId}>
                {m.partyName} ({m.totalVotes} votos)
              </option>
            ))}
          </select>
        </div>

        {selectedMetrics && (
          <>
            {/* Métricas generales */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="frosted-glass p-4 rounded-lg text-center">
                <p className="text-sm text-[#666666]">Total de Votos</p>
                <p className="text-3xl font-bold text-[#C41E3A]">{selectedMetrics.totalVotes}</p>
              </div>
              <div className="frosted-glass p-4 rounded-lg text-center">
                <p className="text-sm text-[#666666]">Edad Media</p>
                <p className="text-3xl font-bold text-[#C41E3A]">{selectedMetrics.averageAge}</p>
                <p className="text-xs text-[#999999]">años</p>
              </div>
              <div className="frosted-glass p-4 rounded-lg text-center">
                <p className="text-sm text-[#666666]">Ideología Media</p>
                <p className="text-3xl font-bold text-[#C41E3A]">{selectedMetrics.averageIdeology}</p>
                <p className="text-xs text-[#999999]">escala 1-10</p>
              </div>
            </div>

            {/* Distribución de edades */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h4 className="font-semibold text-[#2D2D2D]">Distribución de Edades</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedMetrics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
                  <XAxis dataKey="range" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#F5F1E8", border: "1px solid #E0D5CC", borderRadius: "8px" }}
                    labelStyle={{ color: "#2D2D2D" }}
                  />
                  <Bar dataKey="count" fill="#C41E3A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución de ideología */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h4 className="font-semibold text-[#2D2D2D]">Distribución Ideológica</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={selectedMetrics.ideologyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {selectedMetrics.ideologyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#F5F1E8", border: "1px solid #E0D5CC", borderRadius: "8px" }}
                    labelStyle={{ color: "#2D2D2D" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla comparativa */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h4 className="font-semibold text-[#2D2D2D]">Comparativa de Partidos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0D5CC]">
                      <th className="text-left py-2 px-4 text-[#666666]">Partido</th>
                      <th className="text-right py-2 px-4 text-[#666666]">Votos</th>
                      <th className="text-right py-2 px-4 text-[#666666]">Edad Media</th>
                      <th className="text-right py-2 px-4 text-[#666666]">Ideología</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr
                        key={m.partyId}
                        className={`border-b border-[#E0D5CC] ${
                          selectedParty === m.partyId ? "bg-[#C41E3A] bg-opacity-10" : ""
                        }`}
                      >
                        <td className="py-2 px-4 font-semibold text-[#2D2D2D]">{m.partyName}</td>
                        <td className="py-2 px-4 text-right text-[#C41E3A] font-bold">{m.totalVotes}</td>
                        <td className="py-2 px-4 text-right text-[#666666]">{m.averageAge}</td>
                        <td className="py-2 px-4 text-right text-[#666666]">{m.averageIdeology}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

