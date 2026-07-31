import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronDown, Calendar, CheckSquare, Square, TrendingUp, Award, Zap } from "lucide-react";
import { PARTY_COLORS } from "@/lib/partyColors";
import { Card } from "@/components/ui/card";

interface VotoData {
  fecha: string;
  partido?: string;
  asociacion?: string;
  votos_diarios: number;
}

interface TrendenciesChartProps {
  partyColors?: Record<string, string>;
}

export function TrendenciesChart({ partyColors = {} }: TrendenciesChartProps) {
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteType, setVoteType] = useState<"generales" | "juveniles">("generales");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [showAllParties, setShowAllParties] = useState(false);
  const [expandedParties, setExpandedParties] = useState(false);
  const [runtimePartyColors, setRuntimePartyColors] = useState<Record<string, string>>({});
  
  // --- MEJORA AÑADIDA: ESTADO PARA RANGO DE TIEMPO ---
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const viewName = voteType === "generales" 
          ? "historial_votos_por_fecha"
          : "historial_votos_asociaciones_por_fecha";

        const { data, error } = await supabase
          .from(viewName)
          .select("*")
          .order("fecha", { ascending: true });

        if (error) {
          console.error("Error fetching trends:", error);
          return;
        }

        if (!data || data.length === 0) {
          setTrendData([]);
          setParties([]);
          setSelectedParties([]);
          return;
        }

        // Agrupar datos por fecha
        const groupedByDate: Record<string, any> = {};
        const partiesSet = new Set<string>();

        (data as VotoData[]).forEach((item) => {
          const fecha = item.fecha;
          const key = voteType === "generales" ? item.partido : item.asociacion;
          
          if (key) {
            partiesSet.add(key);

            if (!groupedByDate[fecha]) {
              groupedByDate[fecha] = { fecha };
            }
            groupedByDate[fecha][key] = item.votos_diarios;
          }
        });

        const sortedData = Object.values(groupedByDate).sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });

        const partiesArray = Array.from(partiesSet).sort();
        setTrendData(sortedData);
        setParties(partiesArray);
        setSelectedParties([]);
      } catch (err) {
        console.error("Error:", err);
      } fontal {
        setLoading(false);
      }
    };

    fetchData();
  }, [voteType]);

  useEffect(() => {
    const loadPartyColors = async () => {
      const { data, error } = await supabase
        .from("party_configuration")
        .select("party_key, display_name, color")
        .eq("is_active", true);

      if (error) {
        console.error("Error loading party colors for trends:", error);
        return;
      }

      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        const hex = typeof row.color === "string" ? row.color.trim() : "";
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

        const key = typeof row.party_key === "string" ? row.party_key.trim().toUpperCase() : "";
        const display = typeof row.display_name === "string" ? row.display_name.trim().toUpperCase() : "";
        if (key) map[key] = hex;
        if (display) map[display] = hex;
      });

      setRuntimePartyColors(map);
    };

    loadPartyColors();
  }, []);

  const fallbackColors = [
    "#C41E3A", "#0066CC", "#FFC400", "#00AA00", 
    "#FF6600", "#9933FF", "#00CCCC", "#FF0099",
    "#33CC33", "#FF3333", "#3333FF", "#FFCC00",
    "#FF9900", "#00FF99", "#9900FF", "#FF00CC"
  ];

  const getColorWithFallback = (party: string, index: number): string => {
    const normalized = party.trim().toUpperCase();
    const color = partyColors[normalized] || runtimePartyColors[normalized] || PARTY_COLORS[normalized];
    return color || fallbackColors[index % fallbackColors.length];
  };

  const toggleParty = (party: string) => {
    setSelectedParties(prev => 
      prev.includes(party) 
        ? prev.filter(p => p !== party)
        : [...prev, party]
    );
  };

  // --- MEJORA AÑADIDA: DATOS FILTRADOS POR FECHA ---
  const filteredTrendData = useMemo(() => {
    if (dateRange === "all" || trendData.length === 0) return trendData;
    const days = dateRange === "7d" ? 7 : 30;
    return trendData.slice(-days);
  }, [trendData, dateRange]);

  // Si no hay partidos seleccionados, mostrar los top 8 por defecto
  const visibleParties = useMemo(() => {
    if (selectedParties.length > 0) {
      return selectedParties;
    }
    
    if (showAllParties) {
      return parties;
    }

    // Calcular votos totales por partido
    const partyTotals: Record<string, number> = {};
    parties.forEach(p => {
      partyTotals[p] = trendData.reduce((sum, d) => sum + (d[p] || 0), 0);
    });

    // Ordenar por votos totales y tomar top 8
    return parties
      .sort((a, b) => (partyTotals[b] || 0) - (partyTotals[a] || 0))
      .slice(0, 8);
  }, [selectedParties, parties, trendData, showAllParties]);

  // --- MEJORA AÑADIDA: CÁLCULO DE PARTIDO LÍDER ---
  const topParty = useMemo(() => {
    if (parties.length === 0 || trendData.length === 0) return null;
    const totals: Record<string, number> = {};
    visibleParties.forEach(p => {
      totals[p] = filteredTrendData.reduce((sum, d) => sum + (d[p] || 0), 0);
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [visibleParties, filteredTrendData, parties, trendData]);

  if (loading) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#C41E3A]" />
        <p className="text-[#666666] mt-4">Cargando datos de tendencias...</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center text-[#666666]">
        <p>No hay datos de tendencias disponibles aún.</p>
      </div>
    );
  }

  const totalVotes = trendData.reduce((sum, d) => {
    return sum + visibleParties.reduce((partSum, p) => partSum + (d[p] || 0), 0);
  }, 0);

  const avgVotesPerDay = totalVotes / trendData.length;

  return (
    <div className="space-y-6">
      <Card className="p-8 space-y-4">
        {/* --- MEJORA AÑADIDA: ENCABEZADO CON BADGE DE LÍDER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-bold text-foreground">Variación de Votaciones por Día</h3>
          {topParty && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Líder en periodo: <strong>{topParty[0]}</strong> ({topParty[1]} votos)
              </span>
            </div>
          )}
        </div>
        
        {/* Selector Generales/Juveniles */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={() => setVoteType("generales")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              voteType === "generales"
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Elecciones Generales
          </button>
          <button
            onClick={() => setVoteType("juveniles")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              voteType === "juveniles"
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Asociaciones Juveniles
          </button>

          {/* --- MEJORA AÑADIDA: FILTRO DE RANGO DE DÍAS --- */}
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg">
            <Calendar className="w-4 h-4 ml-2 text-muted-foreground" />
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                dateRange === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setDateRange("30d")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                dateRange === "30d" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              30 días
            </button>
            <button
              onClick={() => setDateRange("7d")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                dateRange === "7d" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              7 días
            </button>
          </div>

          {/* Selector de tipo de gráfico */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setChartType("bar")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                chartType === "bar"
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                chartType === "line"
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Líneas
            </button>
          </div>
        </div>

        {/* Selector de partidos/asociaciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Partidos: {selectedParties.length > 0 ? selectedParties.length : visibleParties.length} / {parties.length}
            </p>
            
            {/* --- MEJORA AÑADIDA: CONTROLES DE SELECCIÓN RÁPIDA --- */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedParties(selectedParties.length === parties.length ? [] : [...parties])}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {selectedParties.length === parties.length ? <Square size={12} /> : <CheckSquare size={12} />}
                {selectedParties.length === parties.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
              
              <button
                onClick={() => setExpandedParties(!expandedParties)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {expandedParties ? "Ocultar" : "Ver todos"}
                <ChevronDown size={16} className={`transition-transform ${expandedParties ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className={`flex flex-wrap gap-2 ${expandedParties ? '' : 'max-h-24 overflow-y-auto'}`}>
            {parties.map((party, idx) => (
              <button
                key={party}
                onClick={() => toggleParty(party)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all text-xs whitespace-nowrap shadow-xs hover:scale-105 active:scale-95 ${
                  selectedParties.length === 0 || selectedParties.includes(party)
                    ? "text-white ring-1 ring-black/10"
                    : "text-muted-foreground opacity-50 hover:opacity-80"
                }`}
                style={{
                  backgroundColor: selectedParties.length === 0 || selectedParties.includes(party) 
                    ? getColorWithFallback(party, idx)
                    : "#E0D5CC"
                }}
              >
                {party}
              </button>
            ))}
          </div>

          {/* Botón para mostrar todos los partidos */}
          {selectedParties.length === 0 && !showAllParties && parties.length > 8 && (
            <button
              onClick={() => setShowAllParties(true)}
              className="text-xs text-primary hover:underline"
            >
              Mostrar todos los {parties.length} partidos
            </button>
          )}
          {showAllParties && (
            <button
              onClick={() => setShowAllParties(false)}
              className="text-xs text-primary hover:underline"
            >
              Mostrar solo top 8
            </button>
          )}
        </div>

        {/* Gráfico */}
        <div className="w-full h-96 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={filteredTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#666666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666666"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#FAFAF8",
                    border: "1px solid #E0D5CC",
                    borderRadius: "8px",
                    color: "#2D2D2D"
                  }}
                  formatter={(value) => Math.round(value as number)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {visibleParties.map((party, idx) => (
                  <Bar
                    key={party}
                    dataKey={party}
                    stackId="votes"
                    fill={getColorWithFallback(party, parties.indexOf(party))}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={filteredTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#666666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666666"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#FAFAF8",
                    border: "1px solid #E0D5CC",
                    borderRadius: "8px",
                    color: "#2D2D2D"
                  }}
                  formatter={(value) => Math.round(value as number)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {visibleParties.map((party, idx) => (
                  <Line
                    key={party}
                    type="monotone"
                    dataKey={party}
                    stroke={getColorWithFallback(party, parties.indexOf(party))}
                    dot={false}
                    isAnimationActive={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-secondary/50 text-center relative overflow-hidden group hover:border-primary/40 transition-all">
            {/* --- MEJORA AÑADIDA: ICONO VISUAL DE KPIS --- */}
            <Zap className="absolute top-2 right-2 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
            <p className="text-sm text-muted-foreground">Máximo Votos en un Día</p>
            <p className="text-2xl font-bold text-primary">
              {Math.max(...filteredTrendData.map(d => 
                visibleParties.reduce((sum, p) => sum + (d[p] || 0), 0)
              ))}
            </p>
          </Card>
          <Card className="p-4 bg-secondary/50 text-center relative overflow-hidden group hover:border-primary/40 transition-all">
            <TrendingUp className="absolute top-2 right-2 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
            <p className="text-sm text-muted-foreground">Promedio Votos por Día</p>
            <p className="text-2xl font-bold text-primary">
              {Math.round(avgVotesPerDay)}
            </p>
          </Card>
          <Card className="p-4 bg-secondary/50 text-center relative overflow-hidden group hover:border-primary/40 transition-all">
            <Award className="absolute top-2 right-2 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
            <p className="text-sm text-muted-foreground">Total de Votos</p>
            <p className="text-2xl font-bold text-primary">
              {totalVotes}
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}
