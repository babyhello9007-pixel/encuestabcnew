import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, AlertCircle, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { trpc } from "@/lib/trpc";
import { PARTY_CONFIG, getPartyColor } from "@/lib/partyConfig";

// ============================================================================
// TIPOS
// ============================================================================

interface ResultadoBruto {
  id: string;
  encuesta_nombre: string;
  encuestadora: string;
  encuestadora_tipo: "externa" | "propia";
  partido_id: string;
  votos?: number;
  porcentaje?: number;
  escanos?: number;
  intencion_voto?: number;
  tipo_encuesta: string;
  ambito: string;
  ccaa_o_provincia?: string;
  fecha_realizacion: string;
  fecha_publicacion: string;
  muestra?: number;
  margen_error?: number;
  url_fuente?: string;
}

interface MediaEncuesta {
  fecha: string;
  partido_id: string;
  tipo_encuesta: string;
  ambito: string;
  num_encuestas: number;
  media_porcentaje?: number;
  media_intencion_voto?: number;
  min_porcentaje?: number;
  max_porcentaje?: number;
}

interface TendenciaPartido {
  partido_id: string;
  tipo_encuesta: string;
  ambito: string;
  media_actual?: number;
  media_anterior?: number;
  tendencia?: number;
}

interface AlertaPolitica {
  partido_id: string;
  tipo_encuesta: string;
  ambito: string;
  media_semana_actual?: number;
  media_semana_anterior?: number;
  cambio?: number;
  tipo_alerta: "CAMBIO_SIGNIFICATIVO" | "CAMBIO_MODERADO" | "CAMBIO_LEVE" | "SIN_CAMBIO";
  direccion: "SUBIDA" | "BAJADA" | "ESTABLE";
  num_encuestas: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ElAnalisis() {
  const [activeTab, setActiveTab] = useState("capa1");
  const [tipoEncuesta, setTipoEncuesta] = useState("generales");
  const [ambito, setAmbito] = useState("nacional");
  const [ccaaOProvincia, setCcaaOProvincia] = useState("");

  const [resultadosBrutos, setResultadosBrutos] = useState<ResultadoBruto[]>([]);
  const [mediaEncuestas, setMediaEncuestas] = useState<MediaEncuesta[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaPartido[]>([]);
  const [alertas, setAlertas] = useState<AlertaPolitica[]>([]);

  // Queries tRPC
  const resultadosBrutosQuery = trpc.elAnalisis.obtenerResultadosBrutos.useQuery({
    tipoEncuesta: tipoEncuesta as any,
    ambito: ambito as any,
    ccaaOProvincia: ccaaOProvincia || undefined,
  });

  const mediaEncuestasQuery = trpc.elAnalisis.obtenerMediaEncuestas.useQuery({
    tipoEncuesta: tipoEncuesta as any,
    ambito: ambito as any,
    ccaaOProvincia: ccaaOProvincia || undefined,
  });

  const tendenciasQuery = trpc.elAnalisis.obtenerTendencias30Dias.useQuery({
    tipoEncuesta: tipoEncuesta as any,
    ambito: ambito as any,
    ccaaOProvincia: ccaaOProvincia || undefined,
  });

  const alertasQuery = trpc.elAnalisis.obtenerAlertasPoliticas.useQuery({
    tipoEncuesta: tipoEncuesta as any,
    ambito: ambito as any,
    ccaaOProvincia: ccaaOProvincia || undefined,
  });

  // Actualizar estado cuando cambian los datos
  useEffect(() => {
    if (resultadosBrutosQuery.data) {
      setResultadosBrutos(resultadosBrutosQuery.data as any);
    }
  }, [resultadosBrutosQuery.data]);

  useEffect(() => {
    if (mediaEncuestasQuery.data) {
      setMediaEncuestas(mediaEncuestasQuery.data as any);
    }
  }, [mediaEncuestasQuery.data]);

  useEffect(() => {
    if (tendenciasQuery.data) {
      setTendencias(tendenciasQuery.data as any);
    }
  }, [tendenciasQuery.data]);

  useEffect(() => {
    if (alertasQuery.data) {
      setAlertas(alertasQuery.data as any);
    }
  }, [alertasQuery.data]);

  const isLoading = resultadosBrutosQuery.isLoading || mediaEncuestasQuery.isLoading || tendenciasQuery.isLoading || alertasQuery.isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">El Análisis</h2>
        <p className="text-muted-foreground">
          El cerebro político del proyecto: datos de múltiples encuestadoras, tendencias y análisis político
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Encuesta</label>
              <Select value={tipoEncuesta} onValueChange={setTipoEncuesta}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generales">Elecciones Generales</SelectItem>
                  <SelectItem value="autonomicas">Elecciones Autonómicas</SelectItem>
                  <SelectItem value="municipales">Elecciones Municipales</SelectItem>
                  <SelectItem value="europeas">Elecciones Europeas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ámbito</label>
              <Select value={ambito} onValueChange={setAmbito}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="autonomico">Autonómico</SelectItem>
                  <SelectItem value="provincial">Provincial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">CCAA o Provincia</label>
              <input
                type="text"
                placeholder="Opcional"
                value={ccaaOProvincia}
                onChange={(e) => setCcaaOProvincia(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de las tres capas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capa1">Capa 1: Resultados Brutos</TabsTrigger>
          <TabsTrigger value="capa2">Capa 2: Agregación & Tendencia</TabsTrigger>
          <TabsTrigger value="capa3">Capa 3: Lectura Política</TabsTrigger>
        </TabsList>

        {/* CAPA 1: RESULTADOS BRUTOS */}
        <TabsContent value="capa1" className="space-y-4">
          <Capa1ResultadosBrutos
            resultados={resultadosBrutos}
            loading={isLoading}
            tipoEncuesta={tipoEncuesta}
            ambito={ambito}
          />
        </TabsContent>

        {/* CAPA 2: AGREGACIÓN Y TENDENCIA */}
        <TabsContent value="capa2" className="space-y-4">
          <Capa2AgregacionTendencia
            mediaEncuestas={mediaEncuestas}
            tendencias={tendencias}
            loading={isLoading}
            tipoEncuesta={tipoEncuesta}
          />
        </TabsContent>

        {/* CAPA 3: LECTURA POLÍTICA */}
        <TabsContent value="capa3" className="space-y-4">
          <Capa3LecturaPolitica
            alertas={alertas}
            tendencias={tendencias}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// CAPA 1: RESULTADOS BRUTOS
// ============================================================================

interface Capa1Props {
  resultados: ResultadoBruto[];
  loading: boolean;
  tipoEncuesta: string;
  ambito: string;
}

function Capa1ResultadosBrutos({ resultados, loading, tipoEncuesta, ambito }: Capa1Props) {
  const [filtroPartido, setFiltroPartido] = useState("");
  const [filtroEncuestadora, setFiltroEncuestadora] = useState("");

  const resultadosFiltrados = resultados.filter((r) => {
    if (filtroPartido && r.partido_id !== filtroPartido) return false;
    if (filtroEncuestadora && r.encuestadora !== filtroEncuestadora) return false;
    return true;
  });

  // Agrupar por encuesta
  const encuestasAgrupadas = resultadosFiltrados.reduce(
    (acc, r) => {
      const key = r.encuesta_nombre;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, ResultadoBruto[]>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resultados Brutos por Encuesta</CardTitle>
          <CardDescription>
            Datos crudos de {tipoEncuesta} a nivel {ambito}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por Partido</label>
              <input
                type="text"
                placeholder="Ej: PP, PSOE, VOX..."
                value={filtroPartido}
                onChange={(e) => setFiltroPartido(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por Encuestadora</label>
              <input
                type="text"
                placeholder="Ej: CIS, GAD3..."
                value={filtroEncuestadora}
                onChange={(e) => setFiltroEncuestadora(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
          ) : Object.keys(encuestasAgrupadas).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos disponibles para los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(encuestasAgrupadas).map(([encuesta, resultados]) => (
                <div key={encuesta} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{encuesta}</h4>
                      <p className="text-sm text-muted-foreground">
                        {resultados[0]?.encuestadora} • {resultados[0]?.fecha_publicacion}
                      </p>
                    </div>
                    {resultados[0]?.url_fuente && (
                      <a
                        href={resultados[0].url_fuente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Ver fuente
                      </a>
                    )}
                  </div>

                  {/* Tabla de resultados */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-2">Partido</th>
                          <th className="text-right py-2 px-2">Votos</th>
                          <th className="text-right py-2 px-2">%</th>
                          <th className="text-right py-2 px-2">Escaños</th>
                          <th className="text-right py-2 px-2">Intención</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((r) => (
                          <tr key={r.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 font-medium">{r.partido_id}</td>
                            <td className="text-right py-2 px-2">{r.votos || "-"}</td>
                            <td className="text-right py-2 px-2">{r.porcentaje ? `${r.porcentaje}%` : "-"}</td>
                            <td className="text-right py-2 px-2">{r.escanos || "-"}</td>
                            <td className="text-right py-2 px-2">{r.intencion_voto ? `${r.intencion_voto}%` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Metadatos */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {resultados[0]?.muestra && <p>Muestra: {resultados[0].muestra} encuestados</p>}
                    {resultados[0]?.margen_error && <p>Margen de error: ±{resultados[0].margen_error}%</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CAPA 2: AGREGACIÓN Y TENDENCIA
// ============================================================================

interface Capa2Props {
  mediaEncuestas: MediaEncuesta[];
  tendencias: TendenciaPartido[];
  loading: boolean;
  tipoEncuesta: string;
}

function Capa2AgregacionTendencia({ mediaEncuestas, tendencias, loading, tipoEncuesta }: Capa2Props) {
  const [periodoTendencia, setPeriodoTendencia] = useState("7");

  // Preparar datos para gráficas
  const datosGrafica = mediaEncuestas.map((m) => ({
    fecha: m.fecha,
    ...mediaEncuestas
      .filter((x) => x.fecha === m.fecha)
      .reduce(
        (acc, x) => {
          acc[x.partido_id] = x.media_porcentaje || 0;
          return acc;
        },
        {} as Record<string, number>
      ),
  }));

  return (
    <div className="space-y-4">
      {/* Gráfica de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Tendencias</CardTitle>
          <CardDescription>Media de encuestas por partido en los últimos {periodoTendencia} días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <div className="flex gap-2">
                <Button
                  variant={periodoTendencia === "7" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriodoTendencia("7")}
                >
                  7 días
                </Button>
                <Button
                  variant={periodoTendencia === "14" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriodoTendencia("14")}
                >
                  14 días
                </Button>
                <Button
                  variant={periodoTendencia === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriodoTendencia("30")}
                >
                  30 días
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando gráfica...</div>
            ) : datosGrafica.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(PARTY_CONFIG).map((party) => (
                    <Line
                      key={party}
                      type="monotone"
                      dataKey={party}
                      stroke={getPartyColor(party)}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Tendencias</CardTitle>
          <CardDescription>Media actual vs anterior, con cambio porcentual</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
          ) : tendencias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Partido</th>
                    <th className="text-right py-2 px-2">Media Actual</th>
                    <th className="text-right py-2 px-2">Media Anterior</th>
                    <th className="text-right py-2 px-2">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {tendencias.map((t) => (
                    <tr key={`${t.partido_id}-${t.tipo_encuesta}`} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{t.partido_id}</td>
                      <td className="text-right py-2 px-2">{t.media_actual?.toFixed(2) || "-"}%</td>
                      <td className="text-right py-2 px-2">{t.media_anterior?.toFixed(2) || "-"}%</td>
                      <td className="text-right py-2 px-2">
                        {t.tendencia ? (
                          <div className="flex items-center justify-end gap-1">
                            {t.tendencia > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : t.tendencia < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={t.tendencia > 0 ? "text-green-600" : t.tendencia < 0 ? "text-red-600" : ""}>
                              {t.tendencia > 0 ? "+" : ""}{t.tendencia.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CAPA 3: LECTURA POLÍTICA
// ============================================================================

interface Capa3Props {
  alertas: AlertaPolitica[];
  tendencias: TendenciaPartido[];
  loading: boolean;
}

function Capa3LecturaPolitica({ alertas, tendencias, loading }: Capa3Props) {
  const alertasOrdenadas = [...alertas].sort((a, b) => {
    const prioridad: Record<string, number> = {
      CAMBIO_SIGNIFICATIVO: 1,
      CAMBIO_MODERADO: 2,
      CAMBIO_LEVE: 3,
      SIN_CAMBIO: 4,
    };
    return prioridad[a.tipo_alerta] - prioridad[b.tipo_alerta];
  });

  return (
    <div className="space-y-4">
      {/* Alertas políticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas Políticas
          </CardTitle>
          <CardDescription>Cambios significativos en los últimos 14 días</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando alertas...</div>
          ) : alertasOrdenadas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay alertas en este momento</div>
          ) : (
            <div className="space-y-3">
              {alertasOrdenadas.map((alerta, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    alerta.tipo_alerta === "CAMBIO_SIGNIFICATIVO"
                      ? "bg-red-50 border-red-200"
                      : alerta.tipo_alerta === "CAMBIO_MODERADO"
                        ? "bg-orange-50 border-orange-200"
                        : alerta.tipo_alerta === "CAMBIO_LEVE"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alerta.partido_id}</span>
                        <span className="text-xs px-2 py-1 rounded bg-white">
                          {alerta.tipo_alerta.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alerta.media_semana_actual?.toFixed(2)}% (esta semana) vs{" "}
                        {alerta.media_semana_anterior?.toFixed(2)}% (semana anterior)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Basado en {alerta.num_encuestas} encuestas
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {alerta.direccion === "SUBIDA" ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : alerta.direccion === "BAJADA" ? (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-500" />
                        )}
                        <span
                          className={`text-lg font-bold ${
                            alerta.direccion === "SUBIDA"
                              ? "text-green-600"
                              : alerta.direccion === "BAJADA"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {alerta.cambio && alerta.cambio > 0 ? "+" : ""}{alerta.cambio?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis de bloques políticos (futuro) */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Bloques Políticos</CardTitle>
          <CardDescription>Comparativa entre bloques políticos (próximamente)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Esta sección se completará con análisis de bloques políticos
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
