import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PARTY_COLORS } from "@/lib/partyColors";
import { Button } from "@/components/ui/button";
import { ShareLeadersModalSimple } from "@/components/ShareLeadersModalSimple";
import { exportLeadersToPDFV4 } from "@/lib/pdfExportLeadersV4";
import { Download } from "lucide-react";

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

interface PartyLeaders {
  [key: string]: LeaderResult[];
}

export function LeadersResultsChart() {
  const [leadersByParty, setLeadersByParty] = useState<PartyLeaders>({});
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runtimePartyColors, setRuntimePartyColors] = useState<Record<string, string>>({});
  
  // Función para obtener el color del partido, forzando naranja para CIUDADANOS
  const getPartyColor = (party: string | null) => {
    if (!party) return '#FF9900';
    const normalized = party.trim().toUpperCase();
    return runtimePartyColors[normalized] || PARTY_COLORS[normalized] || '#FF9900';
  };

  useEffect(() => {
    const fetchLeadersResults = async () => {
      try {
        const { data, error } = await supabase
          .from("ranking_lideres_por_partido")
          .select("*");

        if (error) {
          console.error("Error fetching leaders results:", error);
          setLoading(false);
          return;
        }

        // Agrupar por partido
        const grouped: PartyLeaders = {};
        data?.forEach((item: LeaderResult) => {
          if (!grouped[item.partido]) {
            grouped[item.partido] = [];
          }
          grouped[item.partido].push(item);
        });

        setLeadersByParty(grouped);
        // Solo establecer partido inicial si no hay uno seleccionado
        setSelectedParty((prev) => prev || Object.keys(grouped)[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };

    fetchLeadersResults();

    // Actualizar cada 5 segundos
    const interval = setInterval(fetchLeadersResults, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadPartyColors = async () => {
      const { data, error } = await supabase
        .from("party_configuration")
        .select("party_key, display_name, color")
        .eq("is_active", true);

      if (error) {
        console.error("Error loading party colors for leaders:", error);
        return;
      }

      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        const hex = typeof row.color === "string" ? row.color.trim() : "";
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

        const key = typeof row.party_key === "string" ? row.party_key.trim().toUpperCase() : "";
        const display = typeof row.display_name === "string" ? row.display_name.trim().toUpperCase() : "";
        if (key) map[key] = hex;
        if (display) map[display] = hex;
      });

      setRuntimePartyColors(map);
    };

    loadPartyColors();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-[#666666]">Cargando resultados de líderes...</div>;
  }

  const parties = Object.keys(leadersByParty);
  const selectedLeaders = selectedParty ? leadersByParty[selectedParty] : [];
  const totalVotes = selectedLeaders.reduce((sum, leader) => sum + leader.total_votos, 0);

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Estos resultados son independientes a los de "La Encuesta de Batalla Cultural". Esta es una encuesta complementaria sobre preferencias de líderes.
        </p>
      </div>

      {/* Party Selection Buttons */}
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto items-start">
        {parties.map((party) => (
          <button
            key={party}
            onClick={() => setSelectedParty(party)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedParty === party
                ? "bg-[#C41E3A] text-white"
                : "bg-[#F5F1E8] text-[#2D2D2D] hover:bg-[#E0D5CC]"
            }`}
            style={
              selectedParty === party
                ? { backgroundColor: getPartyColor(party) }
                : {}
            }
          >
            {party}
          </button>
        ))}
      </div>

      {/* Charts */}
      {selectedLeaders.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-[#2D2D2D] mb-4">
              Votos por Líder - {selectedParty}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedLeaders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lider_preferido" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="total_votos"
                  fill={getPartyColor(selectedParty)}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-[#2D2D2D] mb-4">
              Distribución - {selectedParty}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={selectedLeaders}
                  dataKey="total_votos"
                  nameKey="lider_preferido"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {selectedLeaders.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPartyColor(selectedParty)}
                      opacity={0.6 + (index * 0.15)}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} votos`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Leaders Table */}
      {selectedLeaders.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
          <h4 className="text-lg font-semibold text-[#2D2D2D] mb-4">
            Ranking de Líderes - {selectedParty}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#E0D5CC]">
                <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Posición</th>
                <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Líder</th>
                <th className="text-center py-3 px-4 font-semibold text-[#2D2D2D]">Votos</th>
                <th className="text-center py-3 px-4 font-semibold text-[#2D2D2D]">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {selectedLeaders.map((leader, index) => (
                <tr key={index} className="border-b border-[#F5F1E8] hover:bg-[#F5F1E8]">
                  <td className="py-3 px-4 font-semibold text-[#C41E3A]">{index + 1}</td>
                  <td className="py-3 px-4 text-[#2D2D2D]">{leader.lider_preferido}</td>
                  <td className="py-3 px-4 text-center text-[#2D2D2D]">{leader.total_votos}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${leader.porcentaje}%`,
                            backgroundColor: getPartyColor(selectedParty),
                          }}
                        />
                      </div>
                      <span className="text-[#666666] font-medium">{leader.porcentaje}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-[#666666]">
            <strong>Total de votos:</strong> {totalVotes}
          </div>
        </div>
      )}

      {selectedLeaders.length === 0 && selectedParty && (
        <div className="text-center py-8 text-[#666666]">
          No hay resultados disponibles para {selectedParty}
        </div>
      )}

      {/* Action Buttons Row - Top Level */}
      {selectedLeaders.length > 0 && (
        <div className="flex gap-2 bg-white p-4 rounded-xl shadow-sm">
          <Button
            onClick={() => exportLeadersToPDFV4(selectedParty)}
            className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white font-semibold flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <ShareLeadersModalSimple leadersByParty={leadersByParty} selectedParty={selectedParty} />
        </div>
      )}
    </div>
  );
}
