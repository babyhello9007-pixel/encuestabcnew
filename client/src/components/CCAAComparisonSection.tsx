import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, X } from "lucide-react";
import { CCAA } from "@/lib/surveyData";
import PartyLogo from "@/components/PartyLogo";

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

interface CCAAComparisonSectionProps {
  partyMeta?: Record<string, { color?: string; logo?: string }>;
}

export function CCAAComparisonSection({ partyMeta = {} }: CCAAComparisonSectionProps) {
  const [ccaaResults, setCCAAReslts] = useState<CCAAReslts[]>([]);
  const [ccaaSummary, setCCAASummary] = useState<CCAASummary[]>([]);
  const [selectedCCAAs, setSelectedCCAAs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState<"generales" | "autonomicas">("generales");

  useEffect(() => {
    const fetchCCAAReslts = async () => {
      try {
        setLoading(true);
        
        const summaryTable = analysisType === "generales" 
          ? "resumen_votos_generales_por_ccaa"
          : "resumen_votos_autonomicas_por_ccaa";
        
        const detailTable = analysisType === "generales"
          ? "votos_generales_por_ccaa"
          : "votos_autonomicas_por_ccaa";

        const { data: summaryData } = await supabase
          .from(summaryTable)
          .select("*");

        if (summaryData) {
          setCCAASummary(summaryData);
        }

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

  const toggleCCAA = (ccaa: string) => {
    if (selectedCCAAs.includes(ccaa)) {
      setSelectedCCAAs(selectedCCAAs.filter(c => c !== ccaa));
    } else {
      if (selectedCCAAs.length < 3) {
        setSelectedCCAAs([...selectedCCAAs, ccaa]);
      }
    }
  };

  const removeCCAA = (ccaa: string) => {
    setSelectedCCAAs(selectedCCAAs.filter(c => c !== ccaa));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-red-600" />
      </div>
    );
  }

  // Obtener todos los partidos únicos de las CCAA seleccionadas
  const selectedCCAAResults = ccaaResults.filter(r => selectedCCAAs.includes(r.ccaa));
  const uniquePartidos = Array.from(new Set(selectedCCAAResults.map(r => r.partido)));

  // Preparar datos para gráfica de comparación de votos por partido
  const comparisonChartData = uniquePartidos.map(partido => {
    const data: any = { partido };
    selectedCCAAs.forEach(ccaa => {
      const result = selectedCCAAResults.find(r => r.ccaa === ccaa && r.partido === partido);
      data[ccaa] = result?.votos || 0;
    });
    return data;
  });

  // Preparar datos para tabla comparativa
  const summaryComparison = selectedCCAAs.map(ccaa => 
    ccaaSummary.find(s => s.ccaa === ccaa)
  ).filter(Boolean);

  const analysisTitle = analysisType === "generales" 
    ? "Comparación de Elecciones Generales"
    : "Comparación de Elecciones Autonómicas";

  const COLORS = ["#0066CC", "#E81828", "#FF6600"];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">📊 Comparación de Comunidades Autónomas</h2>
        <p className="text-slate-300">{analysisTitle}</p>
      </div>

      {/* Selector de tipo de análisis */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setAnalysisType("generales");
            setSelectedCCAAs([]);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            analysisType === "generales"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          📋 Generales
        </button>
        <button
          onClick={() => {
            setAnalysisType("autonomicas");
            setSelectedCCAAs([]);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            analysisType === "autonomicas"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          🏛️ Autonómicas
        </button>
      </div>

      {/* Selector de CCAA */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Selecciona 2 o 3 Comunidades Autónomas</h3>
        <p className="text-sm text-slate-600 mb-4">
          Seleccionadas: {selectedCCAAs.length}/3
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ccaaSummary.map((ccaa) => (
            <button
              key={ccaa.ccaa}
              onClick={() => toggleCCAA(ccaa.ccaa)}
              disabled={!selectedCCAAs.includes(ccaa.ccaa) && selectedCCAAs.length >= 3}
              className={`p-3 rounded-lg font-medium transition text-sm ${
                selectedCCAAs.includes(ccaa.ccaa)
                  ? "bg-red-600 text-white border-2 border-red-700"
                  : "bg-slate-100 text-slate-900 border-2 border-slate-200 hover:border-red-600"
              } ${!selectedCCAAs.includes(ccaa.ccaa) && selectedCCAAs.length >= 3 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {ccaa.ccaa}
            </button>
          ))}
        </div>
      </div>

      {selectedCCAAs.length > 0 && (
        <>
          {/* Resumen comparativo */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Resumen Comparativo</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">CCAA</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Total Votos</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Partidos</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Edad Prom.</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Ideología Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryComparison.map((ccaa) => (
                    <tr key={ccaa?.ccaa} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{ccaa?.ccaa}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{ccaa?.total_votos}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{ccaa?.num_partidos}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{ccaa?.edad_promedio.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{ccaa?.ideologia_promedio.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfica de comparación de votos */}
          {comparisonChartData.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Comparación de Votos por Partido</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="partido" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedCCAAs.map((ccaa, index) => (
                    <Bar key={ccaa} dataKey={ccaa} fill={COLORS[index % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla detallada de comparación */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detalle por Partido</h3>
            <div className="space-y-6">
              {selectedCCAAs.map((ccaa) => {
                const ccaaData = selectedCCAAResults.filter(r => r.ccaa === ccaa);
                return (
                  <div key={ccaa} className="border-b border-slate-200 pb-6 last:border-b-0">
                    <h4 className="font-bold text-slate-900 mb-3">{ccaa}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-900">Partido</th>
                            <th className="px-3 py-2 text-right font-semibold text-slate-900">Votos</th>
                            <th className="px-3 py-2 text-right font-semibold text-slate-900">%</th>
                            <th className="px-3 py-2 text-right font-semibold text-slate-900">Edad Prom.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ccaaData.map((result, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-900">
                                <span className="inline-flex items-center gap-2">
                                  <PartyLogo src={partyMeta[result.partido]?.logo || ""} partyName={result.partido} size={32} />
                                  {result.partido}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-red-600">{result.votos}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{result.porcentaje}%</td>
                              <td className="px-3 py-2 text-right text-slate-600">{result.edad_promedio.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {selectedCCAAs.length === 0 && (
        <div className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-300">
          <p className="text-slate-600 text-lg">Selecciona 2 o 3 comunidades autónomas para comenzar la comparación</p>
        </div>
      )}
    </div>
  );
}
