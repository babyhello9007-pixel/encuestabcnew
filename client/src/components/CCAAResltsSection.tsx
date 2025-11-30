import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Loader2 } from "lucide-react";
import { getPartyColor, getPartyLogo } from "@/lib/partyConfig";

interface CCAAReslts {
  ccaa: string;
  partido: string;
  votos: number;
  porcentaje: number;
  edad_promedio: number;
  ideologia_promedio: number;
}

interface CCAASummary {
  ccaa: string;
  total_votos: number;
  num_partidos: number;
  edad_promedio: number;
  ideologia_promedio: number;
}

export function CCAAResltsSection() {
  const [ccaaResults, setCCAAReslts] = useState<CCAAReslts[]>([]);
  const [ccaaSummary, setCCAASummary] = useState<CCAASummary[]>([]);
  const [selectedCCAA, setSelectedCCAA] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"summary" | "detail">("summary");
  const [analysisType, setAnalysisType] = useState<"generales" | "autonomicas">("generales");

  useEffect(() => {
    const fetchCCAAReslts = async () => {
      try {
        setLoading(true);
        
        // Determinar qué vista SQL usar según el tipo de análisis
        const summaryTable = analysisType === "generales" 
          ? "resumen_votos_generales_por_ccaa"
          : "resumen_votos_autonomicas_por_ccaa";
        
        const detailTable = analysisType === "generales"
          ? "votos_generales_por_ccaa"
          : "votos_autonomicas_por_ccaa";

        // Obtener resumen por CCAA
        const { data: summaryData } = await supabase
          .from(summaryTable)
          .select("*");

        if (summaryData) {
          setCCAASummary(summaryData);
          if (summaryData.length > 0) {
            setSelectedCCAA(summaryData[0].ccaa);
          }
        }

        // Obtener detalles por CCAA y partido
        const { data: detailData } = await supabase
          .from(detailTable)
          .select("*");

        if (detailData) {
          setCCAAReslts(detailData);
        }
      } catch (error) {
        console.error("Error fetching CCAA results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCCAAReslts();
  }, [analysisType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-red-600" />
      </div>
    );
  }

  const selectedCCAAReslts = selectedCCAA
    ? ccaaResults.filter(r => r.ccaa === selectedCCAA)
    : [];

  const chartData = selectedCCAAReslts.map(r => ({
    name: r.partido,
    votos: r.votos,
    porcentaje: r.porcentaje,
    color: getPartyColor(r.partido),
    logo: getPartyLogo(r.partido)
  }));

  const analysisTitle = analysisType === "generales" 
    ? "Análisis de Elecciones Generales por CCAA"
    : "Análisis de Elecciones Autonómicas por CCAA";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">📊 Resultados por Comunidades Autónomas</h2>
        <p className="text-slate-300">{analysisTitle}</p>
      </div>

      {/* Selector de tipo de análisis */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setAnalysisType("generales");
            setViewMode("summary");
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            analysisType === "generales"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          📋 Análisis de Generales
        </button>
        <button
          onClick={() => {
            setAnalysisType("autonomicas");
            setViewMode("summary");
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            analysisType === "autonomicas"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          🏛️ Análisis Autonómico
        </button>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("summary")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "summary"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          Resumen por CCAA
        </button>
        <button
          onClick={() => setViewMode("detail")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "detail"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          Detalle por Partido
        </button>
      </div>

      {viewMode === "summary" ? (
        // Vista de resumen
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ccaaSummary.map((ccaa) => (
            <div
              key={ccaa.ccaa}
              onClick={() => {
                setSelectedCCAA(ccaa.ccaa);
                setViewMode("detail");
              }}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-red-600 hover:shadow-lg cursor-pointer transition"
            >
              <h3 className="font-bold text-lg text-slate-900 mb-2">{ccaa.ccaa}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-600">Total de votos</p>
                  <p className="font-bold text-red-600">{ccaa.total_votos}</p>
                </div>
                <div>
                  <p className="text-slate-600">Partidos</p>
                  <p className="font-bold text-slate-900">{ccaa.num_partidos}</p>
                </div>
                <div>
                  <p className="text-slate-600">Edad promedio</p>
                  <p className="font-bold text-slate-900">{ccaa.edad_promedio}</p>
                </div>
                <div>
                  <p className="text-slate-600">Ideología</p>
                  <p className="font-bold text-slate-900">{ccaa.ideologia_promedio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista de detalle
        <div className="space-y-6">
          {selectedCCAA && (
            <>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedCCAA}</h3>
                
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
                  <p className="text-slate-600 text-center py-8">No hay datos disponibles para esta CCAA</p>
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
                    {selectedCCAAReslts.map((result, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          <span className="inline-flex items-center gap-2">
                            <span style={{ color: getPartyColor(result.partido) }} className="text-lg">
                              {getPartyLogo(result.partido)}
                            </span>
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
