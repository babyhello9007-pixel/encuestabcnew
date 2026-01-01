import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ExternalLink, Star } from "lucide-react";

interface Encuestadora {
  id: string;
  nombre: string;
  sigla?: string;
  pais?: string;
  sitio_web?: string;
  logo_url?: string;
  credibilidad?: number;
}

export default function EncuestadorasGrid() {
  const [encuestadoras, setEncuestadoras] = useState<Encuestadora[]>([]);

  // Query tRPC para obtener encuestadoras
  const encuestadorasQuery = trpc.elAnalisis.obtenerEncuestadoras.useQuery();

  useEffect(() => {
    if (encuestadorasQuery.data) {
      setEncuestadoras(encuestadorasQuery.data as any);
    }
  }, [encuestadorasQuery.data]);

  const getCredibilidadColor = (credibilidad?: number) => {
    if (!credibilidad) return "bg-gray-100 text-gray-700";
    if (credibilidad >= 80) return "bg-green-100 text-green-700";
    if (credibilidad >= 60) return "bg-blue-100 text-blue-700";
    if (credibilidad >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getCredibilidadLabel = (credibilidad?: number) => {
    if (!credibilidad) return "Sin calificar";
    if (credibilidad >= 80) return "Muy confiable";
    if (credibilidad >= 60) return "Confiable";
    if (credibilidad >= 40) return "Moderada";
    return "Baja confiabilidad";
  };

  if (encuestadorasQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encuestadoras</CardTitle>
          <CardDescription>Cargando lista de encuestadoras...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Cargando encuestadoras...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (encuestadorasQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Error al cargar encuestadoras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No se pudieron cargar las encuestadoras
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encuestadoras Activas</CardTitle>
        <CardDescription>
          {encuestadoras.length} encuestadoras registradas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {encuestadoras.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay encuestadoras disponibles
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {encuestadoras.map((encuestadora) => (
              <div
                key={encuestadora.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Logo */}
                {encuestadora.logo_url ? (
                  <div className="mb-3 h-16 flex items-center justify-center bg-gray-50 rounded">
                    <img
                      src={encuestadora.logo_url}
                      alt={encuestadora.nombre}
                      className="max-h-14 max-w-full object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-3 h-16 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                    <span className="text-sm">Sin logo</span>
                  </div>
                )}

                {/* Nombre y Sigla */}
                <div className="mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {encuestadora.nombre}
                  </h3>
                  {encuestadora.sigla && (
                    <p className="text-xs text-muted-foreground">
                      {encuestadora.sigla}
                    </p>
                  )}
                </div>

                {/* Credibilidad */}
                {encuestadora.credibilidad !== undefined && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${encuestadora.credibilidad}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {encuestadora.credibilidad}%
                    </span>
                  </div>
                )}

                {/* Badge de confiabilidad */}
                {encuestadora.credibilidad !== undefined && (
                  <Badge className={`mb-3 ${getCredibilidadColor(encuestadora.credibilidad)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    {getCredibilidadLabel(encuestadora.credibilidad)}
                  </Badge>
                )}

                {/* País */}
                {encuestadora.pais && (
                  <p className="text-xs text-muted-foreground mb-2">
                    📍 {encuestadora.pais}
                  </p>
                )}

                {/* Sitio web */}
                {encuestadora.sitio_web && (
                  <a
                    href={encuestadora.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Sitio web
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
