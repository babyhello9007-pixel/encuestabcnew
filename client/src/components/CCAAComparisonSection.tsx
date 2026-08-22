import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import PartyLogo from "@/components/PartyLogo";
import {
  resolveCanonicalPartyFromReferences,
  type CanonicalPartyIndex,
} from "@/lib/canonicalPartyConfig";

export interface PartyConfig {
  id: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active: boolean;
  party_type: string;
}

export interface CCAAReslts {
  ccaa: string;
  partido: string;
  party_key?: string;
  votos: number;
  porcentaje: number;
  edad_promedio: number;
  ideologia_promedio: number;
  logo_url?: string;
  color?: string;
}

export interface CCAASummary {
  ccaa: string;
  total_votos: number;
  num_partidos: number;
  edad_promedio: number;
  ideologia_promedio: number;
}

interface CCAAComparisonSectionProps {
  partyIndex: CanonicalPartyIndex;
}

export function CCAAComparisonSection({ partyIndex }: CCAAComparisonSectionProps) {
  const [ccaaResults, setCCAAReslts] = useState<CCAAReslts[]>([]);
  const [ccaaSummary, setCCAASummary] = useState<CCAASummary[]>([]);
  const [selectedCCAAs, setSelectedCCAAs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analysisType, setAnalysisType] = useState<"generales" | "autonomicas">("generales");

  // Los votos proceden de vistas; la identidad visual llega desde Results.tsx.
  useEffect(() => {
    const fetchCCAAResults = async () => {
      try {
        setLoading(true);
        
        const summaryTable = analysisType === "generales" 
          ? "resumen_votos_generales_por_ccaa"
          : "resumen_votos_autonomicas_por_ccaa";
        
        const detailTable = analysisType === "generales"
          ? "votos_generales_por_ccaa"
          : "votos_autonomicas_por_ccaa";

        const [summaryRes, detailRes] = await Promise.all([
          supabase.from(summaryTable).select("*"),
          supabase.from(detailTable).select("*")
        ]);

        if (summaryRes.data) {
          setCCAASummary(summaryRes.data);
        }

        if (detailRes.data) {
          setCCAAReslts(detailRes.data);
        }
      } catch (error) {
        console.error("Error fetching CCAA results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCCAAResults();
  }, [analysisType]);

  // party_configuration es la fuente canónica de identidad visual.
  const getPartyMeta = (result: CCAAReslts) => {
    const dbParty = resolveCanonicalPartyFromReferences([result.party_key, result.partido], partyIndex);

    return {
      color: dbParty?.color || "#64748B",
      logo: dbParty?.logo_url || "",
      displayName: dbParty?.display_name || result.partido,
    };
  };

  const toggleCCAA = (ccaa: string) => {
    if (selectedCCAAs.includes(ccaa)) {
      setSelectedCCAAs(selectedCCAAs.filter(c => c !== ccaa));
    } else {
      if (selectedCCAAs.length < 3) {
        setSelectedCCAAs([...selectedCCAAs, ccaa]);
      }
    }
  };

  const formatNumber = (num?: number) => 
    num !== undefined && num !== null ? new Intl.NumberFormat("es-ES").format(num) : "-";

  const formatDecimal = (num?: number) => 
    num !== undefined && num !== null ? num.toFixed(1) : "-";

  // Partidos únicos presentes en las CCAA seleccionadas
  const selectedCCAAResults = useMemo(() => {
    return ccaaResults.filter(r => selectedCCAAs.includes(r.ccaa));
  }, [ccaaResults, selectedCCAAs]);

  const uniquePartidos = useMemo(() => {
    return Array.from(new Set(selectedCCAAResults.map(r => r.partido)));
  }, [selectedCCAAResults]);

  // Datos estructurados para el gráfico de barras comparativo
  const comparisonChartData = useMemo(() => {
    return uniquePartidos.map(partido => {
      const sampleResult = selectedCCAAResults.find(r => r.partido === partido);
      const meta = sampleResult ? getPartyMeta(sampleResult) : { displayName: partido };

      const data: Record<string, any> = { partido: meta.displayName };
      selectedCCAAs.forEach(ccaa => {
        const result = selectedCCAAResults.find(r => r.ccaa === ccaa && r.partido === partido);
        data[ccaa] = result?.votos || 0;
      });
      return data;
    });
  }, [uniquePartidos, selectedCCAAResults, selectedCCAAs, partyIndex]);

  const summaryComparison = useMemo(() => {
    return selectedCCAAs
      .map(ccaa => ccaaSummary.find(s => s.ccaa === ccaa))
      .filter((s): s is CCAASummary => Boolean(s));
  }, [selectedCCAAs, ccaaSummary]);

  const analysisTitle = analysisType === "generales" 
    ? "Comparación de Elecciones Generales"
    : "Comparación de Elecciones Autonómicas";

  const COLORS = ["#0066CC", "#E81828", "#FF6600"];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-3">
        <Loader2 className="animate-spin w-8 h-8 text-red-600" />
        <p className="text-slate-500 font-medium text-sm">Cargando datos comparativos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold mb-1 tracking-tight">📊 Comparación de Comunidades Autónomas</h2>
        <p className="text-slate-300 text-sm">{analysisTitle}</p>
      </div>

      {/* Selector de tipo de análisis */}
      <div className="flex gap-3 pb-2 border-b border-slate-200">
        <button
          onClick={() => {
            setAnalysisType("generales");
            setSelectedCCAAs([]);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            analysisType === "generales"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          📋 Generales
        </button>
        <button
          onClick={() => {
            setAnalysisType("autonomicas");
            setSelectedCCAAs([]);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            analysisType === "autonomicas"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          🏛️ Autonómicas
        </button>
      </div>

      {/* Selector de CCAA */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Selecciona de 2 a 3 Comunidades Autónomas</h3>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Seleccionadas: <span className="text-red-600">{selectedCCAAs.length}</span>/3
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ccaaSummary.map((ccaa) => {
            const isSelected = selectedCCAAs.includes(ccaa.ccaa);
            const isDisabled = !isSelected && selectedCCAAs.length >= 3;

            return (
              <button
                key={ccaa.ccaa}
                onClick={() => toggleCCAA(ccaa.ccaa)}
                disabled={isDisabled}
                className={`p-3 rounded-lg font-medium transition text-sm flex justify-between items-center ${
                  isSelected
                    ? "bg-red-600 text-white border-2 border-red-700 shadow-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200 hover:border-red-500 hover:bg-white"
                } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span>{ccaa.ccaa}</span>
                {isSelected && <span className="text-xs bg-red-700 px-2 py-0.5 rounded-full font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCCAAs.length > 0 && (
        <>
          {/* Resumen comparativo */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Resumen Comparativo</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600">CCAA</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Total Votos</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Partidos</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Edad Prom.</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Ideología Prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryComparison.map((ccaa) => (
                    <tr key={ccaa.ccaa} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{ccaa.ccaa}</td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold text-red-600">{formatNumber(ccaa.total_votos)}</td>
                      <td className="px-4 py-3.5 text-right text-sm text-slate-600">{ccaa.num_partidos}</td>
                      <td className="px-4 py-3.5 text-right text-sm text-slate-600">{formatDecimal(ccaa.edad_promedio)} años</td>
                      <td className="px-4 py-3.5 text-right text-sm text-slate-600">{formatDecimal(ccaa.ideologia_promedio)} / 10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfica de comparación de votos */}
          {comparisonChartData.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Comparación de Votos por Partido</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="partido" angle={-35} textAnchor="end" height={60} tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Votos"]} />
                  <Legend />
                  {selectedCCAAs.map((ccaa, index) => (
                    <Bar key={ccaa} dataKey={ccaa} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla detallada de comparación */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detalle por Partido</h3>
            <div className="space-y-6">
              {selectedCCAAs.map((ccaa) => {
                const ccaaData = selectedCCAAResults.filter(r => r.ccaa === ccaa);
                return (
                  <div key={ccaa} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                    <h4 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      {ccaa}
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-700">Partido</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Votos</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-700">% Porcentaje</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Edad Prom.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ccaaData.map((result, idx) => {
                            const meta = getPartyMeta(result);
                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-900 font-medium">
                                  <span className="inline-flex items-center gap-2.5">
                                    <PartyLogo src={meta.logo} partyName={meta.displayName} size={28} strictExternal />
                                    <span style={{ borderLeft: `3px solid ${meta.color}`, paddingLeft: "8px" }}>
                                      {meta.displayName}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">{formatNumber(result.votos)}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-600">{result.porcentaje}%</td>
                                <td className="px-4 py-3 text-right text-slate-600">{formatDecimal(result.edad_promedio)} años</td>
                              </tr>
                            );
                          })}
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
        <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
          <p className="text-slate-600 font-medium">Selecciona de 2 a 3 comunidades autónomas para comenzar la comparación</p>
        </div>
      )}
    </div>
  );
}
