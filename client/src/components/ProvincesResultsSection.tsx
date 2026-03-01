import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Search } from "lucide-react";
import { PROVINCES } from "@/lib/surveyData";
import { getPartyColor } from "@/lib/partyConfig";
import PartyLogo from "@/components/PartyLogo";

interface ProvinceResults {
  provincia: string;
  partido: string;
  votos: number;
  porcentaje: number;
  edad_promedio: number;
  ideologia_promedio: number;
}

interface ProvinceSummary {
  provincia: string;
  total_votos: number;
  num_partidos: number;
  edad_promedio: number;
  ideologia_promedio: number;
}

export function ProvincesResultsSection() {
  const [provinceResults, setProvinceResults] = useState<ProvinceResults[]>([]);
  const [provinceSummary, setProvinceSummary] = useState<ProvinceSummary[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"summary" | "detail">("summary");

  useEffect(() => {
    const fetchProvinceResults = async () => {
      try {
        // Obtener resumen por provincia
        const { data: summaryData } = await supabase
          .from("resumen_votos_municipales_por_provincia")
          .select("*");

        if (summaryData) {
          setProvinceSummary(summaryData);
          if (summaryData.length > 0) {
            setSelectedProvince(summaryData[0].provincia);
          }
        }

        // Obtener detalles por provincia y partido
        const { data: detailData } = await supabase
          .from("votos_municipales_por_provincia")
          .select("*");

        if (detailData) {
          setProvinceResults(detailData);
        }
      } catch (error) {
        console.error("Error fetching province results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceResults();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-red-600" />
      </div>
    );
  }

  const filteredProvinces = provinceSummary.filter(p =>
    p.provincia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProvinceResults = selectedProvince
    ? provinceResults.filter(r => r.provincia === selectedProvince)
    : [];

  const chartData = selectedProvinceResults.map(r => ({
    name: r.partido,
    votos: r.votos,
    porcentaje: r.porcentaje,
    color: getPartyColor(r.partido),
    logo: getPartyLogo(r.partido)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">🗺️ Resultados por Provincias</h2>
        <p className="text-slate-300">Análisis detallado de votos municipales por provincia</p>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("summary")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "summary"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          Resumen por Provincia
        </button>
        <button
          onClick={() => setViewMode("detail")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "detail"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          Detalle por Partido
        </button>
      </div>

      {viewMode === "summary" ? (
        // Vista de resumen
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar provincia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Grid de provincias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProvinces.map((province) => (
              <div
                key={province.provincia}
                onClick={() => {
                  setSelectedProvince(province.provincia);
                  setViewMode("detail");
                }}
                className="bg-white rounded-lg p-4 border border-slate-200 hover:border-red-600 hover:shadow-lg cursor-pointer transition"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-2">{province.provincia}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-600">Total de votos</p>
                    <p className="font-bold text-red-600">{province.total_votos}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Partidos</p>
                    <p className="font-bold text-slate-900">{province.num_partidos}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Edad promedio</p>
                    <p className="font-bold text-slate-900">{province.edad_promedio}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Ideología</p>
                    <p className="font-bold text-slate-900">{province.ideologia_promedio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Vista de detalle
        <div className="space-y-6">
          {selectedProvince && (
            <>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedProvince}</h3>
                
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border border-slate-200 rounded shadow-lg">
                                <p className="font-bold text-sm">{data.logo} {data.name}</p>
                                <p className="text-sm text-red-600">Votos: {data.votos}</p>
                                <p className="text-sm text-slate-600">Porcentaje: {data.porcentaje}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="votos" name="Votos" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-600 text-center py-8">No hay datos disponibles para esta provincia</p>
                )}
              </div>

              {/* Tabla de detalles */}
              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Partido</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Votos</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">%</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Edad Prom.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProvinceResults.map((result, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          <span className="inline-flex items-center gap-2">
                            <PartyLogo partyName={result.partido} size={32} />
                            {result.partido}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{result.votos}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">{result.porcentaje}%</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">{result.edad_promedio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
