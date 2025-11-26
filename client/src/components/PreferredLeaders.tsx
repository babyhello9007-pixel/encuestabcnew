import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

interface LeaderVote {
  partido: string;
  lider: string;
  votos: number;
  porcentaje: number;
}

interface PartyLeaders {
  [key: string]: string[];
}

const PARTY_LEADERS: PartyLeaders = {
  "PP": ["Alberto Núñez Feijóo", "Isabel Díaz Ayuso", "Juanma Moreno", "Alfonso Fernández Mañueco"],
  "PSOE": ["Pedro Sánchez", "Salvador Illa", "Juan Espadas", "Javier Castillo"],
  "VOX": ["Santiago Abascal", "Jorge Buxadé", "Macarena Olona"],
  "PODEMOS": ["Yolanda Díaz", "Irene Montero", "Ione Belarra"],
  "Ciudadanos": ["Inés Arrimadas", "Albert Rivera"],
  "SUMAR": ["Yolanda Díaz", "Jaume Asens"],
  "Aliança Catalana": ["Carles Puigdemont"],
  "ERC": ["Oriol Junqueras", "Gabriel Rufián"],
  "JUNTS": ["Carles Puigdemont"],
};

const COLORS = ["#C41E3A", "#E74C3C", "#F39C12", "#27AE60", "#3498DB", "#9B59B6", "#1ABC9C", "#34495E"];

export function PreferredLeaders() {
  const [leaderData, setLeaderData] = useState<LeaderVote[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>("PP");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderData();
  }, []);

  const fetchLeaderData = async () => {
    try {
      const { data } = await supabase
        .from("ranking_lideres_por_partido")
        .select("*");

      if (data) {
        const formatted = data.map((row: any) => ({
          partido: row.partido,
          lider: row.lider_preferido,
          votos: row.total_votos,
          porcentaje: row.porcentaje,
        }));
        setLeaderData(formatted);
      }
    } catch (err) {
      console.error("Error fetching leader data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPartyLeaders = (party: string) => {
    return PARTY_LEADERS[party] || [];
  };

  const getLeaderStats = (party: string) => {
    return leaderData.filter((d) => d.partido === party);
  };

  const chartData = getLeaderStats(selectedParty).map((item, idx) => ({
    name: item.lider,
    votos: item.votos,
    porcentaje: item.porcentaje,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-[#2D2D2D] mb-6">Líderes Preferidos por Partido</h2>

        {/* Selector de Partido */}
        <div className="mb-6">
          <p className="text-sm text-[#666666] mb-3">Selecciona un partido:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(PARTY_LEADERS).map((party) => (
              <Button
                key={party}
                onClick={() => setSelectedParty(party)}
                variant={selectedParty === party ? "default" : "outline"}
                className={`${
                  selectedParty === party
                    ? "bg-[#C41E3A] text-white"
                    : "border-[#C41E3A] text-[#C41E3A]"
                }`}
              >
                {party}
              </Button>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-lg p-4 mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`${value} votos`, "Votos"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                />
                <Bar dataKey="votos" fill="#C41E3A" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-[#999999]">
            No hay datos disponibles para {selectedParty}
          </div>
        )}

        {/* Tabla de Resultados */}
        {chartData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#C41E3A]">
                  <th className="text-left py-2 px-4 font-bold text-[#C41E3A]">Líder</th>
                  <th className="text-right py-2 px-4 font-bold text-[#C41E3A]">Votos</th>
                  <th className="text-right py-2 px-4 font-bold text-[#C41E3A]">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#E0D5CC] hover:bg-[#F5F5F5]">
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="text-right py-2 px-4 font-semibold">{item.votos}</td>
                    <td className="text-right py-2 px-4 font-semibold text-[#C41E3A]">{item.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="frosted-glass p-6 rounded-lg">
        <h3 className="font-bold text-[#2D2D2D] mb-3">Sobre este módulo</h3>
        <p className="text-sm text-[#666666]">
          Este módulo muestra la preferencia de líderes por cada partido político. Los datos se actualizan en tiempo real
          conforme se reciben nuevas respuestas de la encuesta.
        </p>
      </div>
    </div>
  );
}

