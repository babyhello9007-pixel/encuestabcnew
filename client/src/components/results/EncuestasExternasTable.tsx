import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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

interface Props {
  tipoEncuesta?: string;
  diasAtras?: number;
}

export default function EncuestasExternasTable({ tipoEncuesta, diasAtras = 30 }: Props) {
  const [encuestas, setEncuestas] = useState<EncuestaExterna[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  if (encuestasQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encuestas Externas</CardTitle>
          <CardDescription>Cargando encuestas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Cargando encuestas externas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (encuestasQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Error al cargar encuestas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No se pudieron cargar las encuestas externas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encuestas Externas</CardTitle>
        <CardDescription>
          {encuestas.length} encuestas registradas en los últimos {diasAtras} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        {encuestas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay encuestas disponibles
          </div>
        ) : (
          <div className="space-y-2">
            {encuestas.map((encuesta) => (
              <div key={encuesta.id} className="border border-border rounded-lg overflow-hidden">
                {/* Header de encuesta */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === encuesta.id ? null : encuesta.id)
                  }
                  className="w-full p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Logo encuestadora */}
                    {encuesta.encuestadoras?.logo_url ? (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded flex-shrink-0">
                        <img
                          src={encuesta.encuestadoras.logo_url}
                          alt={encuesta.encuestadoras.nombre}
                          className="max-h-10 max-w-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded flex-shrink-0 text-xs text-gray-400">
                        Logo
                      </div>
                    )}

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {encuesta.encuestadoras?.nombre || "Encuestadora desconocida"}
                        </h3>
                        {encuesta.encuestadoras?.sigla && (
                          <Badge variant="outline" className="text-xs">
                            {encuesta.encuestadoras.sigla}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Contenido expandido */}
                {expandedId === encuesta.id && (
                  <div className="border-t border-border p-4 bg-muted/30 space-y-3">
                    {/* Detalles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {encuesta.tamano_muestra && (
                        <div>
                          <p className="text-muted-foreground text-xs">Tamaño muestra</p>
                          <p className="font-semibold">
                            {encuesta.tamano_muestra.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {encuesta.margen_error && (
                        <div>
                          <p className="text-muted-foreground text-xs">Margen error</p>
                          <p className="font-semibold">±{encuesta.margen_error}%</p>
                        </div>
                      )}
                      {encuesta.ccaa_o_provincia && (
                        <div>
                          <p className="text-muted-foreground text-xs">Territorio</p>
                          <p className="font-semibold">{encuesta.ccaa_o_provincia}</p>
                        </div>
                      )}
                    </div>

                    {/* Resultados */}
                    {resultadosQuery.data && resultadosQuery.data.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Resultados por partido
                        </p>
                        <div className="space-y-1">
                          {(resultadosQuery.data as any[]).slice(0, 5).map((resultado) => (
                            <div
                              key={resultado.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <span>{resultado.partido_id}</span>
                              <span className="font-semibold">{resultado.porcentaje}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
