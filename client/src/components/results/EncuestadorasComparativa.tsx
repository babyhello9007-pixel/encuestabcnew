import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import PartyLogo from "@/components/PartyLogo";

interface EncuestaExterna {
  id: string;
  encuestadora_id: string;
  tipo_encuesta: string;
  ambito: string;
  ccaa_o_provincia?: string;
  fecha_publicacion: string;
  tamano_muestra?: number;
  margen_error?: number;
  encuestadoras?: {
    id: string;
    nombre: string;
    sigla?: string;
    logo_url?: string;
  };
}

interface ResultadoEncuesta {
  id: string;
  partido_id: string;
  porcentaje: number;
  escanos?: number;
}

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

interface Props {
  tipoEncuesta?: string;
  diasAtras?: number;
  generalStats?: PartyStats[];
  totalResponses?: number;
}

export default function EncuestadorasComparativa({ tipoEncuesta, diasAtras = 30, generalStats = [], totalResponses = 0 }: Props) {
  const [encuestas, setEncuestas] = useState<EncuestaExterna[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resultadosPorEncuesta, setResultadosPorEncuesta] = useState<Record<string, ResultadoEncuesta[]>>({});
  const [mostrarAnalisisIA, setMostrarAnalisisIA] = useState(false);

  // Query tRPC para obtener encuestas externas
  const encuestasQuery = trpc.elAnalisis.obtenerEncuestasExternas.useQuery({
    tipoEncuesta: tipoEncuesta as any,
    diasAtras,
  });

  // Query para obtener resultados de encuesta específica
  const resultadosQuery = trpc.elAnalisis.obtenerResultadosEncuesta.useQuery(
    { encuestaId: expandedId || "" },
    { enabled: !!expandedId }
  );

  useEffect(() => {
    if (encuestasQuery.data) {
      setEncuestas(encuestasQuery.data as any);
    }
  }, [encuestasQuery.data]);

  useEffect(() => {
    if (expandedId && resultadosQuery.data) {
      setResultadosPorEncuesta(prev => ({
        ...prev,
        [expandedId]: resultadosQuery.data as ResultadoEncuesta[]
      }));
    }
  }, [expandedId, resultadosQuery.data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTipoEncuestaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      generales: "Generales",
      autonomicas: "Autonómicas",
      municipales: "Municipales",
      europeas: "Europeas",
    };
    return labels[tipo] || tipo;
  };

  const getAmbitoLabel = (ambito: string) => {
    const labels: Record<string, string> = {
      nacional: "Nacional",
      autonomico: "Autonómico",
      provincial: "Provincial",
    };
    return labels[ambito] || ambito;
  };

  const getPartyColor = (partyId: string): string => {
    const party = Object.values(PARTIES_GENERAL).find(p => p.id === partyId);
    return party?.color || "#999999";
  };

  const getPartyName = (partyId: string): string => {
    const party = Object.values(PARTIES_GENERAL).find(p => p.id === partyId);
    return party?.name || partyId;
  };

  const calcularMargenError = (muestra: number): string => {
    if (muestra <= 0) return "N/A";
    return (100 / Math.sqrt(muestra)).toFixed(1);
  };

  if (encuestasQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="liquid-glass p-6 rounded-2xl">
          <div className="text-center py-8 text-[#999999]">
            Cargando encuestadoras...
          </div>
        </div>
      </div>
    );
  }

  if (encuestasQuery.isError) {
    return (
      <div className="space-y-4">
        <div className="liquid-glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Error al cargar encuestadoras</span>
          </div>
          <p className="text-[#999999]">No se pudieron cargar los datos de las encuestadoras</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="liquid-glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D]">Comparativa de Encuestadoras</h2>
            <p className="text-[#999999] text-sm mt-1">
              {encuestas.length} encuestas registradas en los últimos {diasAtras} días
            </p>
          </div>
          <Button
            onClick={() => setMostrarAnalisisIA(!mostrarAnalisisIA)}
            className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1626] text-white flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Análisis de IA
          </Button>
        </div>

        {mostrarAnalisisIA && (
          <div className="mt-4 p-4 bg-[#F5F0EB] rounded-lg border border-[#E0D5CC]">
            <p className="text-sm text-[#2D2D2D] leading-relaxed">
              <strong>Análisis de IA:</strong> Basado en los datos de las encuestadoras más recientes, 
              se observa una tendencia de polarización entre los principales bloques políticos. 
              Las encuestadoras muestran variaciones en la estimación de escaños debido a diferentes 
              metodologías de muestreo y ponderación. La fiabilidad de cada encuesta depende de su 
              tamaño de muestra y margen de error. Se recomienda analizar múltiples encuestadoras 
              para obtener una visión más completa del panorama electoral.
            </p>
          </div>
        )}
      </div>

      {encuestas.length === 0 ? (
        <div className="liquid-glass p-6 rounded-2xl text-center py-12">
          <p className="text-[#999999]">No hay encuestas disponibles en este momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {encuestas.map((encuesta) => (
            <div key={encuesta.id} className="liquid-glass rounded-2xl overflow-hidden">
              {/* Header de encuesta */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === encuesta.id ? null : encuesta.id)
                }
                className="w-full p-4 hover:bg-white/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  {/* Logo encuestadora */}
                  {encuesta.encuestadoras?.logo_url ? (
                    <div className="w-14 h-14 flex items-center justify-center bg-white rounded-lg flex-shrink-0 shadow-sm">
                      <img
                        src={encuesta.encuestadoras.logo_url}
                        alt={encuesta.encuestadoras.nombre}
                        className="max-h-12 max-w-full object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-white rounded-lg flex-shrink-0 text-xs text-[#999999] font-semibold">
                      {encuesta.encuestadoras?.sigla || "ENC"}
                    </div>
                  )}

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#2D2D2D]">
                        {encuesta.encuestadoras?.nombre || "Encuestadora desconocida"}
                      </h3>
                      {encuesta.encuestadoras?.sigla && (
                        <Badge className="bg-[#C41E3A] text-white text-xs">
                          {encuesta.encuestadoras.sigla}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#999999]">
                      <span>{getTipoEncuestaLabel(encuesta.tipo_encuesta)}</span>
                      <span>•</span>
                      <span>{getAmbitoLabel(encuesta.ambito)}</span>
                      <span>•</span>
                      <span>{formatDate(encuesta.fecha_publicacion)}</span>
                    </div>
                  </div>
                </div>

                {/* Botón expandir */}
                <div className="flex items-center gap-2 ml-4">
                  {expandedId === encuesta.id ? (
                    <ChevronUp className="w-5 h-5 text-[#C41E3A]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#999999]" />
                  )}
                </div>
              </button>

              {/* Contenido expandido */}
              {expandedId === encuesta.id && (
                <div className="border-t border-[#E0D5CC] p-6 bg-white/50 space-y-6">
                  {/* Detalles de la encuesta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {encuesta.tamano_muestra && (
                      <div className="p-3 bg-[#F5F0EB] rounded-lg">
                        <p className="text-[#999999] text-xs font-semibold">Tamaño muestra</p>
                        <p className="font-bold text-[#2D2D2D] mt-1">
                          {encuesta.tamano_muestra.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {encuesta.margen_error && (
                      <div className="p-3 bg-[#F5F0EB] rounded-lg">
                        <p className="text-[#999999] text-xs font-semibold">Margen error</p>
                        <p className="font-bold text-[#2D2D2D] mt-1">±{encuesta.margen_error}%</p>
                      </div>
                    )}
                    {encuesta.ccaa_o_provincia && (
                      <div className="p-3 bg-[#F5F0EB] rounded-lg">
                        <p className="text-[#999999] text-xs font-semibold">Territorio</p>
                        <p className="font-bold text-[#2D2D2D] mt-1">{encuesta.ccaa_o_provincia}</p>
                      </div>
                    )}
                  </div>

                  {/* Resultados por partido */}
                  {resultadosPorEncuesta[encuesta.id] && resultadosPorEncuesta[encuesta.id].length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#2D2D2D] mb-4">Resultados por partido</h4>
                      <div className="space-y-3">
                        {resultadosPorEncuesta[encuesta.id]
                          .sort((a, b) => (b.porcentaje || 0) - (a.porcentaje || 0))
                          .map((resultado) => (
                            <div key={resultado.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <PartyLogo partyId={resultado.partido_id} size={32} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-[#2D2D2D] text-sm">
                                    {getPartyName(resultado.partido_id)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#C41E3A]">
                                      {resultado.porcentaje?.toFixed(1) || 0}%
                                    </span>
                                    {resultado.escanos && (
                                      <span className="text-xs bg-[#C41E3A] text-white px-2 py-1 rounded">
                                        {resultado.escanos} escaños
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#C41E3A] transition-all duration-500"
                                    style={{ width: `${Math.min(resultado.porcentaje || 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {(!resultadosPorEncuesta[encuesta.id] || resultadosPorEncuesta[encuesta.id].length === 0) && (
                    <div className="text-center py-6 text-[#999999]">
                      <p className="text-sm">No hay resultados disponibles para esta encuesta</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sección de #LaEncuestaBC */}
      <div className="liquid-glass p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Resultados de #LaEncuestaBC</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#F5F0EB] rounded-lg">
            <p className="text-[#999999] text-sm font-semibold">Total de respuestas</p>
            <p className="text-3xl font-bold text-[#C41E3A] mt-2">{totalResponses.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#F5F0EB] rounded-lg">
            <p className="text-[#999999] text-sm font-semibold">Período de encuesta</p>
            <p className="text-lg font-bold text-[#2D2D2D] mt-2">En tiempo real</p>
          </div>
          <div className="p-4 bg-[#F5F0EB] rounded-lg">
            <p className="text-[#999999] text-sm font-semibold">Margen de error</p>
            <p className="text-lg font-bold text-[#2D2D2D] mt-2">±{calcularMargenError(totalResponses)}%</p>
          </div>
        </div>

        {/* Resultados por partido */}
        {generalStats && generalStats.length > 0 && (
          <div>
            <h4 className="font-bold text-[#2D2D2D] mb-4">Distribución de Votos y Escaños</h4>
            <div className="space-y-3">
              {generalStats
                .sort((a, b) => (b.porcentaje || 0) - (a.porcentaje || 0))
                .map((party) => (
                  <div key={party.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <PartyLogo partyId={party.id} size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#2D2D2D] text-sm">
                          {party.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#C41E3A]">
                            {party.porcentaje?.toFixed(1) || 0}%
                          </span>
                          {party.escanos > 0 && (
                            <span className="text-xs bg-[#C41E3A] text-white px-2 py-1 rounded">
                              {party.escanos} escaños
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C41E3A] transition-all duration-500"
                          style={{ width: `${Math.min(party.porcentaje || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="text-sm text-[#999999] mt-4">
          Los resultados de #LaEncuestaBC se basan en respuestas voluntarias de usuarios de redes sociales 
          y no representan una muestra estadísticamente representativa de la población española.
        </p>
      </div>
    </div>
  );
}
