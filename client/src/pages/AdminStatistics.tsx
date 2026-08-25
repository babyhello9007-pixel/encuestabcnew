import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Loader2, RefreshCw, Users, MapPin, CalendarDays } from "lucide-react";

interface PartyStatistic {
  partyKey: string;
  totalVotes: number;
  totalMentions: number;
}

interface ParticipationRow {
  created_at?: string | null;
  edad?: number | string | null;
  provincia?: string | null;
  ccaa?: string | null;
  voto_generales?: string | null;
}

interface PartyHistoryEntry {
  partyKey: string;
  changeType: string;
  timestamp: string | Date;
  changedByName?: string | null;
  changeReason?: string | null;
}

export default function AdminStatistics() {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  
  // Obtener estadísticas de partidos
  const { data: stats, isLoading: statsLoading } = trpc.parties.getStatistics.useQuery();
  
  // Obtener historial de cambios
  const { data: history, isLoading: historyLoading } = trpc.parties.getHistory.useQuery({
    partyKey: selectedParty || undefined,
    limit: 100,
  });
  const typedStats = (stats ?? []) as PartyStatistic[];
  const typedHistory = (history ?? []) as PartyHistoryEntry[];
  const [participationRows, setParticipationRows] = useState<ParticipationRow[]>([]);
  const [participationLoading, setParticipationLoading] = useState(true);
  const [participationError, setParticipationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadParticipation = async () => {
      setParticipationLoading(true);
      const { data, error } = await supabase
        .from("respuestas")
        .select("created_at, edad, provincia, ccaa, voto_generales")
        .order("created_at", { ascending: true })
        .limit(10_000);
      if (!mounted) return;
      if (error) {
        console.warn("No se pudieron cargar las métricas de participación:", error);
        setParticipationError("No se pudieron cargar las respuestas de Supabase.");
        setParticipationRows([]);
      } else {
        setParticipationError(null);
        setParticipationRows((data || []) as ParticipationRow[]);
      }
      setParticipationLoading(false);
    };
    loadParticipation();
    const channel = supabase
      .channel("admin-statistics-responses")
      .on("postgres_changes", { event: "*", schema: "public", table: "respuestas" }, loadParticipation)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Colores para gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"];

  // Preparar datos para gráfico de votos por partido
  const votesByPartyData = typedStats.map((stat) => ({
    name: stat.partyKey,
    votes: stat.totalVotes,
    mentions: stat.totalMentions,
  }));

  // Preparar datos para gráfico de cambios por día
  const changesByDayData = typedHistory.reduce((acc: Array<{ date: string; changes: number }>, change: PartyHistoryEntry) => {
    const date = new Date(change.timestamp).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.changes += 1;
    } else {
      acc.push({ date, changes: 1 });
    }
    return acc;
  }, []);

  // Preparar datos para gráfico de tipos de cambios
  const changeTypeData = typedHistory.reduce((acc: Array<{ name: string; value: number }>, change: PartyHistoryEntry) => {
    const existing = acc.find((d) => d.name === change.changeType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: change.changeType, value: 1 });
    }
    return acc;
  }, []);

  const participationMetrics = useMemo(() => {
    const byDay = new Map<string, number>();
    const byAge = new Map<string, number>();
    const byCcaa = new Map<string, number>();
    const byParty = new Map<string, number>();
    let ageSum = 0;
    let ageCount = 0;
    participationRows.forEach(row => {
      if (row.created_at) {
        const date = new Date(row.created_at);
        if (!Number.isNaN(date.getTime())) {
          const key = date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
          byDay.set(key, (byDay.get(key) || 0) + 1);
        }
      }
      const age = Number(row.edad);
      if (Number.isFinite(age) && age > 0) {
        ageSum += age;
        ageCount += 1;
        const band = age <= 30 ? "18–30" : age <= 45 ? "31–45" : age <= 60 ? "46–60" : "60+";
        byAge.set(band, (byAge.get(band) || 0) + 1);
      }
      const ccaa = String(row.ccaa || "Sin CCAA").trim() || "Sin CCAA";
      byCcaa.set(ccaa, (byCcaa.get(ccaa) || 0) + 1);
      const party = String(row.voto_generales || "Sin respuesta").trim() || "Sin respuesta";
      byParty.set(party, (byParty.get(party) || 0) + 1);
    });
    return {
      total: participationRows.length,
      averageAge: ageCount ? ageSum / ageCount : null,
      byDay: Array.from(byDay, ([date, responses]) => ({ date, responses })),
      byAge: ["18–30", "31–45", "46–60", "60+"].map(name => ({ name, value: byAge.get(name) || 0 })).filter(item => item.value > 0),
      topCcaa: Array.from(byCcaa, ([name, responses]) => ({ name, responses })).sort((a, b) => b.responses - a.responses).slice(0, 10),
      topParties: Array.from(byParty, ([name, responses]) => ({ name, responses })).sort((a, b) => b.responses - a.responses).slice(0, 10),
    };
  }, [participationRows]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Panel de Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de participación, votos, cambios y auditoría de partidos</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-100 px-3 py-2 text-base font-semibold text-emerald-800" aria-live="polite">
            <Activity className="h-4 w-4" />
            {participationLoading ? "Actualizando…" : "Supabase en tiempo real"}
          </div>
        </div>

        {participationError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="status">
            {participationError} El resto del panel sigue mostrando la auditoría disponible.
          </div>
        )}

        {/* Participación real */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-cyan-600/25 bg-cyan-50/80 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="h-4 w-4 text-cyan-700" />Respuestas Supabase</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-cyan-800">{participationMetrics.total.toLocaleString("es-ES")}</div><CardDescription>Muestra disponible para análisis</CardDescription></CardContent>
          </Card>
          <Card className="border-violet-600/25 bg-violet-50/80 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CalendarDays className="h-4 w-4 text-violet-700" />Edad media</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-violet-800">{participationMetrics.averageAge === null ? "—" : participationMetrics.averageAge.toFixed(1)}</div><CardDescription>Entre respuestas con edad</CardDescription></CardContent>
          </Card>
          <Card className="border-amber-600/25 bg-amber-50/80 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><MapPin className="h-4 w-4 text-amber-700" />CCAA representadas</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-amber-800">{new Set(participationRows.map(row => row.ccaa).filter(Boolean)).size}</div><CardDescription>Con al menos una respuesta</CardDescription></CardContent>
          </Card>
          <Card className="border-emerald-600/25 bg-emerald-50/80 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><RefreshCw className="h-4 w-4 text-emerald-700" />Última actualización</CardTitle></CardHeader>
            <CardContent><div className="text-lg font-bold text-emerald-800">{participationRows.at(-1)?.created_at ? new Date(participationRows.at(-1)?.created_at || "").toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "—"}</div><CardDescription>Canal de respuestas activo</CardDescription></CardContent>
          </Card>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Votos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typedStats.reduce((sum, stat) => sum + stat.totalVotes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Menciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typedStats.reduce((sum, stat) => sum + stat.totalMentions, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typedStats.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cambios Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typedHistory.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Participación y segmentación */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Tendencia de respuestas</CardTitle><CardDescription>Respuestas registradas por día en Supabase</CardDescription></CardHeader>
            <CardContent>
              {participationMetrics.byDay.length === 0 ? <p className="py-10 text-center text-muted-foreground">No hay fechas disponibles para mostrar la tendencia.</p> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={participationMetrics.byDay}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="responses" name="Respuestas" stroke="#22d3ee" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Distribución por edad</CardTitle><CardDescription>Tramos sobre respuestas con edad válida</CardDescription></CardHeader>
            <CardContent>
              {participationMetrics.byAge.length === 0 ? <p className="py-10 text-center text-muted-foreground">Sin edades disponibles.</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={participationMetrics.byAge}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Respuestas" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>CCAA con más participación</CardTitle><CardDescription>Top 10 de la muestra disponible</CardDescription></CardHeader>
            <CardContent>
              {participationMetrics.topCcaa.length === 0 ? <p className="py-10 text-center text-muted-foreground">Sin comunidades disponibles.</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={participationMetrics.topCcaa} layout="vertical" margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="responses" name="Respuestas" fill="#fbbf24" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Votos por partido */}
          <Card>
            <CardHeader>
              <CardTitle>Votos por Partido</CardTitle>
              <CardDescription>Distribución de votos totales</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={votesByPartyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tipos de cambios */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Cambios</CardTitle>
              <CardDescription>Distribución de cambios realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={changeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {changeTypeData.map((_entry: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cambios por día */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cambios por Día</CardTitle>
              <CardDescription>Historial de cambios realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={changesByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="changes" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Historial de cambios */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cambios</CardTitle>
            <CardDescription>Últimos cambios realizados en partidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6" />
                </div>
              ) : typedHistory.length > 0 ? (
                typedHistory.map((change: PartyHistoryEntry, idx: number) => (
                  <div key={idx} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{change.partyKey}</p>
                        <p className="text-sm text-muted-foreground">
                          {change.changeType}: {change.changedByName || "Sistema"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(change.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {change.changeReason && (
                      <p className="text-sm text-muted-foreground mt-1">{change.changeReason}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay cambios registrados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
