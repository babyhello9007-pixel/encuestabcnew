import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Loader2, AlertCircle } from "lucide-react";
import PartyLogo from "@/components/PartyLogo";
import {
  createCanonicalPartyIndex,
  resolveCanonicalPartyFromReferences,
  type CanonicalPartyConfigRow,
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

export interface CCAAResults {
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

export function CCAAResltsSection() {
  const [ccaaResults, setCCAAResults] = useState<CCAAResults[]>([]);
  const [ccaaSummary, setCCAASummary] = useState<CCAASummary[]>([]);
  const [partyConfigs, setPartyConfigs] = useState<CanonicalPartyConfigRow[]>([]);
  
  const [selectedCCAA, setSelectedCCAA] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"summary" | "detail">("summary");
  const [analysisType, setAnalysisType] = useState<"generales" | "autonomicas">("generales");

  // 1. Cargar la configuración de partidos de party_configuration
  useEffect(() => {
    const fetchPartyConfigurations = async () => {
      try {
        const { data, error } = await supabase
          .from("party_configuration")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;

        if (data) setPartyConfigs(data as CanonicalPartyConfigRow[]);
      } catch (err) {
        console.error("Error fetching party configuration:", err);
      }
    };

    fetchPartyConfigurations();
  }, []);

  // 2. Cargar datos según el tipo de análisis (Generales o Autonómicas)
  useEffect(() => {
    const fetchCCAAResults = async () => {
      try {
        setLoading(true);
        setError(null);

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

        if (summaryRes.error) throw summaryRes.error;
        if (detailRes.error) throw detailRes.error;

        if (summaryRes.data) {
          setCCAASummary(summaryRes.data);
          // Si la CCAA seleccionada no está en los nuevos datos, seleccionar la primera
          if (summaryRes.data.length > 0) {
            const exists = summaryRes.data.some(item => item.ccaa === selectedCCAA);
            if (!selectedCCAA || !exists) {
              setSelectedCCAA(summaryRes.data[0].ccaa);
            }
          } else {
            setSelectedCCAA(null);
          }
        }

        if (detailRes.data) {
          setCCAAResults(detailRes.data);
        }
      } catch (err: any) {
        console.error("Error fetching CCAA results:", err);
        setError("No se pudieron cargar los datos electorales.");
      } finally {
        setLoading(false);
      }
    };

    fetchCCAAResults();
  }, [analysisType]);

  const partyIndex = useMemo(() => createCanonicalPartyIndex(partyConfigs), [partyConfigs]);

  // party_configuration es la fuente canónica de identidad visual.
  const getPartyMeta = (result: CCAAResults) => {
    const dbParty = resolveCanonicalPartyFromReferences([result.party_key, result.partido], partyIndex);

    return {
      color: dbParty?.color || "#64748B",
      logo: dbParty?.logo_url || "",
      displayName: dbParty?.display_name || result.partido,
    };
  };

  const selectedCCAAResults = useMemo(() => {
    return selectedCCAA ? ccaaResults.filter(r => r.ccaa === selectedCCAA) : [];
  }, [selectedCCAA, ccaaResults]);

  const chartData = useMemo(() => {
    return selectedCCAAResults.map(r => {
      const meta = getPartyMeta(r);
      return {
        name: meta.displayName,
        votos: r.votos,
        porcentaje: r.porcentaje,
        color: meta.color,
        logo: meta.logo
      };
    });
  }, [selectedCCAAResults, partyConfigs]);

  const formatNumber = (num: number) => new Intl.NumberFormat("es-ES").format(num);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 space-y-4">
        <Loader2 className="animate-spin w-10 h-10 text-red-600" />
        <p className="text-slate-500 font-medium text-sm">Cargando datos electorales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold tracking-tight mb-1">📊 Resultados por Comunidades Autónomas</h2>
        <p className="text-slate-300 text-sm">
          {analysisType === "generales" 
            ? "Análisis detallado de Elecciones Generales"
            : "Análisis detallado de Elecciones Autonómicas"}
        </p>
      </div>

      {/* Controles y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setAnalysisType("generales");
              setViewMode("summary");
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              analysisType === "generales"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            📋 Generales
          </button>
          <button
            onClick={() => {
              setAnalysisType("autonomicas");
              setViewMode("summary");
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              analysisType === "autonomicas"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            🏛️ Autonómicas
          </button>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode("summary")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              viewMode === "summary"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Resumen CCAA
          </button>
          <button
            onClick={() => setViewMode("detail")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              viewMode === "detail"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Detalle por Partido
          </button>
        </div>
      </div>

      {/* VISTA RESUMEN */}
      {viewMode === "summary" ? (
        ccaaSummary.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ccaaSummary.map((ccaa) => (
              <div
                key={ccaa.ccaa}
                onClick={() => {
                  setSelectedCCAA(ccaa.ccaa);
                  setViewMode("detail");
                }}
                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-red-500 hover:shadow-md cursor-pointer transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition-colors">
                    {ccaa.ccaa}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {ccaa.num_partidos} Partidos
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total votos</p>
                    <p className="font-bold text-slate-900 text-base">{formatNumber(ccaa.total_votos)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Edad Promedio</p>
                    <p className="font-semibold text-slate-700">{ccaa.edad_promedio} años</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-medium">Ideología Promedio</p>
                    <p className="font-semibold text-slate-700">{ccaa.ideologia_promedio} / 10</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">No se encontraron datos registrados para este tipo de elección.</p>
          </div>
        )
      ) : (
        /* VISTA DETALLE */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <label htmlFor="ccaa-select" className="text-sm font-semibold text-slate-700">Comunidad Autónoma:</label>
            <select
              id="ccaa-select"
              value={selectedCCAA || ""}
              onChange={(e) => setSelectedCCAA(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {ccaaSummary.map((item) => (
                <option key={item.ccaa} value={item.ccaa}>
                  {item.ccaa}
                </option>
              ))}
            </select>
          </div>

          {selectedCCAA && (
            <>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedCCAA} - Distribución de Votos</h3>
                
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => formatNumber(val)} tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {data.logo && (
                                    <PartyLogo src={data.logo} partyName={data.name} size={20} strictExternal />
                                  )}
                                  <p className="font-bold text-slate-900">{data.name}</p>
                                </div>
                                <p className="text-sm text-slate-700">Votos: <span className="font-semibold">{formatNumber(data.votos)}</span></p>
                                <p className="text-sm text-slate-700">Porcentaje: <span className="font-semibold">{data.porcentaje}%</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="votos" name="Votos totales" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-center py-12">No hay datos disponibles para esta CCAA</p>
                )}
              </div>

              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Partido</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Votos</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Porcentaje</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Edad Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCCAAResults.map((result, idx) => {
                      const meta = getPartyMeta(result);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            <span className="inline-flex items-center gap-3">
                              <PartyLogo src={meta.logo} partyName={meta.displayName} size={28} strictExternal />
                              <span style={{ borderLeft: `4px solid ${meta.color}`, paddingLeft: "8px" }}>
                                {meta.displayName}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                            {formatNumber(result.votos)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-600">
                            {result.porcentaje}%
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600">
                            {result.edad_promedio} años
                          </td>
                        </tr>
                      );
                    })}
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
