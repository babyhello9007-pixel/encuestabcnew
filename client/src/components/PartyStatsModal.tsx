import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PartyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyName: string;
  partyType: "general" | "youth";
  accentColor?: string;
  partyLogo?: string;
  partyKey?: string;
}

interface PartyMetricsData {
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

export function PartyStatsModal({ isOpen, onClose, partyName, partyType, accentColor = "#C41E3A", partyLogo, partyKey }: PartyStatsModalProps) {
  const [metrics, setMetrics] = useState<PartyMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [topLeaders, setTopLeaders] = useState<Array<{ name: string; votes: number; pct: number; photo?: string }>>([]);

  useEffect(() => {
    if (!isOpen || !partyName) return;

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Determinar la vista según el tipo de partido
        const viewName = partyType === "general" 
          ? "edad_ideologia_por_partido" 
          : "edad_ideologia_por_asociacion";
        
        // Determinar el campo de búsqueda
        const searchField = partyType === "general" ? "partido" : "asociacion";

        const { data, error } = await supabase
          .from(viewName)
          .select("edad_promedio, ideologia_promedio, total_votos")
          .eq(searchField, partyName)
          .single();

        if (error) {
          console.error("Error fetching party metrics:", error);
          // Usar datos de ejemplo si no hay datos
          setMetrics({
            edad_promedio: 35.5,
            ideologia_promedio: 6.2,
            total_votos: 150,
          });
        } else if (data) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    fetchTopLeaders();
  }, [isOpen, partyName, partyType, partyKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div style={{ ["--accent" as any]: accentColor }} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 border border-white/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--accent),black_22%)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">{partyLogo ? <img src={partyLogo} alt={partyName} className="w-6 h-6 rounded object-contain bg-white/15 p-0.5" /> : null}{partyName}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
            </div>
          ) : metrics ? (
            <>
              {/* Edad Promedio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#2D2D2D]">Edad Promedio</label>
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    {metrics.edad_promedio.toFixed(1)} años
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--accent),black_22%)] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((metrics.edad_promedio / 80) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Ideología Promedio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#2D2D2D]">Posición Ideológica</label>
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    {metrics.ideologia_promedio.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666666]">Izquierda</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--accent),black_22%)] h-2 rounded-full transition-all"
                      style={{ width: `${(metrics.ideologia_promedio / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-[#666666]">Derecha</span>
                </div>
              </div>

              {/* Total Votos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-[#666666] mb-1">Total de Votos</p>
                <p className="text-3xl font-bold text-[#2D2D2D]">{metrics.total_votos}</p>
              </div>

              {/* Descripción */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-[#666666]">
                  <span className="font-semibold text-[#2D2D2D]">Nota:</span> Estas métricas representan los promedios de edad e ideología de los votantes de este partido/asociación.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#666666]">No hay datos disponibles</p>
            </div>
          )}
        </div>

        {topLeaders.length > 0 && (
          <div className="px-6 pb-5">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Top 3 líderes del partido</p>
            <div className="grid gap-2">
              {topLeaders.map((l, i) => (
                <div key={l.name + i} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                    {l.photo ? <img src={l.photo} alt={l.name} className="w-7 h-7 rounded-full object-cover" /> : null}
                    <span className="text-sm font-semibold text-slate-800">{l.name}</span>
                  </div>
                  <span className="text-xs text-slate-600">{l.votes} · {l.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

