import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LeaderByParty {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

// Datos de fallback fuera del componente para evitar recreaciones en memoria
const FALLBACK_DATA: Record<string, LeaderByParty[]> = {
  PP: [
    { partido: "PP", lider_preferido: "Feijóo", total_votos: 85, porcentaje: 60.7 },
    { partido: "PP", lider_preferido: "Ayuso", total_votos: 40, porcentaje: 28.6 },
    { partido: "PP", lider_preferido: "Juanma Moreno", total_votos: 15, porcentaje: 10.7 },
  ],
  PSOE: [
    { partido: "PSOE", lider_preferido: "Sánchez", total_votos: 95, porcentaje: 79.2 },
    { partido: "PSOE", lider_preferido: "Otro", total_votos: 25, porcentaje: 20.8 },
  ],
  VOX: [
    { partido: "VOX", lider_preferido: "Abascal", total_votos: 72, porcentaje: 80.9 },
    { partido: "VOX", lider_preferido: "Buxadé", total_votos: 17, porcentaje: 19.1 },
  ],
};

export function LeadersByParty() {
  const [selectedParty, setSelectedParty] = useState<string>("PP");
  const [leadersByParty, setLeadersByParty] = useState<LeaderByParty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLeadersByParty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ranking_lideres_por_partido")
          .select("*")
          .eq("partido", selectedParty);

        if (error) throw error;

        if (isMounted) {
          setLeadersByParty(data && data.length > 0 ? data : FALLBACK_DATA[selectedParty] || []);
        }
      } catch (err) {
        console.error("Error fetching leaders by party:", err);
        if (isMounted) {
          setLeadersByParty(FALLBACK_DATA[selectedParty] || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeadersByParty();

    return () => {
      isMounted = false;
    };
  }, [selectedParty]);

  const totalVotes = useMemo(
    () => leadersByParty.reduce((sum, leader) => sum + leader.total_votos, 0),
    [leadersByParty]
  );

  const topLeader = leadersByParty[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* Encabezado y Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Líderes Preferidos
          </h3>
          <p className="text-sm text-slate-500 font-medium">Estadísticas y ranking de votación por partido</p>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-slate-800 font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:bg-white/80"
          >
            {Object.entries(PARTIES_GENERAL).map(([key, party]) => (
              <option key={key} value={key}>
                {party.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/50 text-center text-slate-500 shadow-xl">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mb-3" />
          <p className="font-medium text-sm">Cargando datos...</p>
        </div>
      ) : leadersByParty.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/50 text-center text-slate-500 shadow-xl">
          <p className="font-medium">No hay datos disponibles para este partido.</p>
        </div>
      ) : (
        <>
          {/* Paneles de Información */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ranking */}
            <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5 space-y-5">
              <h4 className="text-lg font-semibold text-slate-900">Ranking de Líderes</h4>
              <div className="space-y-4">
                {leadersByParty.map((leader, index) => (
                  <div key={`${leader.partido}-${leader.lider_preferido}-${index}`} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{leader.lider_preferido}</span>
                      <span className="font-bold text-rose-600">{leader.porcentaje.toFixed(1)}%</span>
                    </div>
                    {/* Barra de progreso de cristal */}
                    <div className="h-3 w-full bg-slate-200/50 rounded-full p-0.5 backdrop-blur-sm inset-shadow">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${leader.porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-right font-medium">{leader.total_votos} votos</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas destacadas */}
            <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5 space-y-5">
              <h4 className="text-lg font-semibold text-slate-900">Estadísticas Clave</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/50 border border-white/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Total de votos</span>
                  <span className="text-2xl font-black text-slate-800">{totalVotes}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/50 border border-white/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Candidatos</span>
                  <span className="text-2xl font-black text-slate-800">{leadersByParty.length}</span>
                </div>
                <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 border border-white shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Líder preferido</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-slate-900">{topLeader?.lider_preferido || "N/A"}</span>
                    <span className="text-lg font-bold text-rose-600">{topLeader ? `${topLeader.porcentaje.toFixed(1)}%` : "0%"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico Estilo iOS Frosted */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5">
            <h4 className="text-lg font-semibold text-slate-900 mb-6">Comparativa Visual</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadersByParty} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="lider_preferido"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.4)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.9)",
                      borderRadius: "16px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                    }}
                    formatter={(value: number | string) => [`${value}%`, "Preferencia"]}
                    labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                  />
                  <Bar dataKey="porcentaje" fill="#e11d48" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
