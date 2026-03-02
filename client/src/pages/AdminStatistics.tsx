import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

export default function AdminStatistics() {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  
  // Obtener estadísticas de partidos
  const { data: stats, isLoading: statsLoading } = trpc.parties.getStatistics.useQuery();
  
  // Obtener historial de cambios
  const { data: history, isLoading: historyLoading } = trpc.parties.getHistory.useQuery({
    partyKey: selectedParty || undefined,
    limit: 100,
  });

  // Colores para gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"];

  // Preparar datos para gráfico de votos por partido
  const votesByPartyData = stats?.map((stat) => ({
    name: stat.partyKey,
    votes: stat.totalVotes,
    mentions: stat.totalMentions,
  })) || [];

  // Preparar datos para gráfico de cambios por día
  const changesByDayData = history?.reduce((acc: any[], change) => {
    const date = new Date(change.timestamp).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.changes += 1;
    } else {
      acc.push({ date, changes: 1 });
    }
    return acc;
  }, []) || [];

  // Preparar datos para gráfico de tipos de cambios
  const changeTypeData = history?.reduce((acc: any[], change) => {
    const existing = acc.find((d) => d.name === change.changeType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: change.changeType, value: 1 });
    }
    return acc;
  }, []) || [];

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
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Panel de Estadísticas</h1>
          <p className="text-muted-foreground">Análisis de votos, cambios y auditoría de partidos</p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Votos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.reduce((sum, s) => sum + s.totalVotes, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Menciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.reduce((sum, s) => sum + s.totalMentions, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cambios Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history?.length || 0}</div>
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
                    {changeTypeData.map((entry, index) => (
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
              ) : history && history.length > 0 ? (
                history.map((change, idx) => (
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
