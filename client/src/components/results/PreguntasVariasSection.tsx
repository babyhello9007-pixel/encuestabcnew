import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import PartyLogo from '@/components/PartyLogo';
import { Filter, RefreshCw, X, Loader2 } from 'lucide-react';

interface QuestionData {
  label: string;
  count: number;
  percentage: number;
  edad_media?: number;
  ideologia_media?: number;
}

interface OptionPartyBreakdown {
  question_key: string;
  option_value: string;
  party_vote: string;
  votes_count: number;
}

export default function PreguntasVariasSection({
  partyMeta = {}
}: {
  partyMeta?: Record<string, { color?: string; logo?: string }>
}) {
  const [monarquia, setMonarquia] = useState<QuestionData[]>([]);
  const [division, setDivision] = useState<QuestionData[]>([]);
  const [pensiones, setPensiones] = useState<QuestionData[]>([]);
  const [partyBreakdownMap, setPartyBreakdownMap] = useState<Record<string, OptionPartyBreakdown[]>>({});
  const [partyBranding, setPartyBranding] = useState<Record<string, { color: string; logo: string }>>({});
  const [loading, setLoading] = useState(true);
  const [breakdownLoading, setBreakdownLoading] = useState(true);

  // Filtros interactivos avanzados
  const [selectedEdad, setSelectedEdad] = useState<string>("todos");
  const [selectedCCAAs, setSelectedCCAAs] = useState<string[]>([]);

  const ccaaList = [
    "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
    "Castilla-La Mancha", "Castilla y León", "Cataluña", "Extremadura",
    "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja",
    "Ceuta", "Melilla", "Exterior"
  ];

  const loadDataFiltered = async () => {
    try {
      setLoading(true);
      let query = supabase.from('respuestas').select('monarquia_republica, division_territorial, sistema_pensiones, edad, ccaa');

      if (selectedCCAAs.length > 0) {
        query = query.in('ccaa', selectedCCAAs);
      }

      const { data, error } = await query;

      if (error) {
        const { data: viewData, error: viewError } = await supabase
          .from('preguntas_varias_view')
          .select('monarquia_republica, division_territorial, sistema_pensiones, edad_media, ideologia_media');
        
        if (viewError) throw viewError;
        processRawData(viewData || []);
        return;
      }

      let filtered = data || [];
      if (selectedEdad !== "todos") {
        filtered = filtered.filter((row: any) => {
          const edad = Number(row.edad);
          if (isNaN(edad)) return false;
          if (selectedEdad === "18-30") return edad >= 18 && edad <= 30;
          if (selectedEdad === "31-45") return edad >= 31 && edad <= 45;
          if (selectedEdad === "46-60") return edad >= 46 && edad <= 60;
          if (selectedEdad === "60+") return edad > 60;
          return true;
        });
      }

      processRawData(filtered);
    } catch (err) {
      console.error('Error loading filtered data:', err);
      setLoading(false);
    }
  };

  const processRawData = (rows: any[]) => {
    const monarquiaMap: Record<string, number> = {};
    const divisionMap: Record<string, number> = {};
    const pensionesMap: Record<string, number> = {};

    rows.forEach((row) => {
      if (row.monarquia_republica) {
        const normalized = row.monarquia_republica.trim();
        monarquiaMap[normalized] = (monarquiaMap[normalized] || 0) + 1;
      }
      if (row.division_territorial) {
        const normalized = row.division_territorial.trim();
        divisionMap[normalized] = (divisionMap[normalized] || 0) + 1;
      }
      if (row.sistema_pensiones) {
        const normalized = row.sistema_pensiones.trim();
        pensionesMap[normalized] = (pensionesMap[normalized] || 0) + 1;
      }
    });

    const totalMonarquia = Object.values(monarquiaMap).reduce((a, b) => a + b, 0);
    const totalDivision = Object.values(divisionMap).reduce((a, b) => a + b, 0);
    const totalPensiones = Object.values(pensionesMap).reduce((a, b) => a + b, 0);

    setMonarquia(
      Object.entries(monarquiaMap).map(([label, count]) => ({
        label,
        count,
        percentage: totalMonarquia > 0 ? Math.round((count / totalMonarquia) * 1000) / 10 : 0,
      }))
    );

    setDivision(
      Object.entries(divisionMap).map(([label, count]) => ({
        label,
        count,
        percentage: totalDivision > 0 ? Math.round((count / totalDivision) * 1000) / 10 : 0,
      }))
    );

    setPensiones(
      Object.entries(pensionesMap).map(([label, count]) => ({
        label,
        count,
        percentage: totalPensiones > 0 ? Math.round((count / totalPensiones) * 1000) / 10 : 0,
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    loadDataFiltered();
  }, [selectedEdad, selectedCCAAs]);

  useEffect(() => {
    const loadBreakdown = async () => {
      try {
        setBreakdownLoading(true);
        const { data, error } = await supabase
          .from('preguntas_varias_party_breakdown')
          .select('question_key, option_value, party_vote, votes_count')
          .order('votes_count', { ascending: false });

        const grouped: Record<string, OptionPartyBreakdown[]> = {};
        if (!error && data?.length) {
          data.forEach((row: any) => {
            const key = `${row.question_key}::${row.option_value}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row as OptionPartyBreakdown);
          });
        } else {
          let rawQuery = supabase.from('respuestas').select('voto_generales, monarquia_republica, division_territorial, sistema_pensiones, edad, ccaa');
          if (selectedCCAAs.length > 0) rawQuery = rawQuery.in('ccaa', selectedCCAAs);
          const { data: rawRows, error: rawError } = await rawQuery;
          if (rawError) throw rawError;
          const ageMatches = (row: any) => {
            if (selectedEdad === 'todos') return true;
            const age = Number(row.edad);
            if (!Number.isFinite(age)) return false;
            if (selectedEdad === '18-30') return age >= 18 && age <= 30;
            if (selectedEdad === '31-45') return age >= 31 && age <= 45;
            if (selectedEdad === '46-60') return age >= 46 && age <= 60;
            return age > 60;
          };
          const accumulator: Record<string, Record<string, number>> = {};
          const fields = ['monarquia_republica', 'division_territorial', 'sistema_pensiones'] as const;
          (rawRows || []).filter(ageMatches).forEach((row: any) => {
            const party = String(row.voto_generales || '').trim();
            if (!party) return;
            fields.forEach((field) => {
              const option = String(row[field] || '').trim();
              if (!option) return;
              const key = `${field}::${option}`;
              if (!accumulator[key]) accumulator[key] = {};
              accumulator[key][party] = (accumulator[key][party] || 0) + 1;
            });
          });
          Object.entries(accumulator).forEach(([key, parties]) => {
            const [question_key, option_value] = key.split('::');
            grouped[key] = Object.entries(parties).map(([party_vote, votes_count]) => ({ question_key, option_value, party_vote, votes_count })).sort((a, b) => b.votes_count - a.votes_count);
          });
        }

        setPartyBreakdownMap(grouped);
      } catch (err) {
        // Ignorar
      } finally {
        setBreakdownLoading(false);
      }
    };

    const loadBranding = async () => {
      const { data, error } = await supabase
        .from('party_configuration')
        .select('party_key, display_name, color, logo_url')
        .eq('is_active', true);

      if (error) return;

      const map: Record<string, { color: string; logo: string }> = {};
      (data || []).forEach((row: any) => {
        const color = typeof row.color === 'string' ? row.color.trim() : '#9CA3AF';
        const logo = typeof row.logo_url === 'string' ? row.logo_url : '';
        const key = typeof row.party_key === 'string' ? row.party_key.trim().toUpperCase() : '';
        const display = typeof row.display_name === 'string' ? row.display_name.trim().toUpperCase() : '';
        if (key) map[key] = { color, logo };
        if (display) map[display] = { color, logo };
      });
      setPartyBranding(map);
    };

    loadBreakdown();
    loadBranding();
  }, [selectedEdad, selectedCCAAs]);

  const getBreakdownKey = (questionKey: string, label: string) => `${questionKey}::${label}`;
  const getPartyStyle = (party: string) => {
    const key = party.trim().toUpperCase();
    const fromMeta = partyMeta[key];
    if (fromMeta?.color || fromMeta?.logo) return { color: fromMeta.color || "#9CA3AF", logo: fromMeta.logo || "" };
    return partyBranding[key] || { color: "#9CA3AF", logo: "" };
  };

  const toggleCCAA = (ccaa: string) => {
    setSelectedCCAAs(prev =>
      prev.includes(ccaa) ? prev.filter(c => c !== ccaa) : [...prev, ccaa]
    );
  };

  const removeCCAA = (ccaa: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCCAAs(prev => prev.filter(c => c !== ccaa));
  };

  const resetAllFilters = () => {
    setSelectedEdad("todos");
    setSelectedCCAAs([]);
  };

  return (
    <div className="space-y-6">
      {/* Barra de filtros avanzados con selección múltiple, chips eliminables y restablecimiento */}
      <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#C41E3A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Segmentación Avanzada de Preguntas Varias</span>
          </div>

          {(selectedEdad !== "todos" || selectedCCAAs.length > 0) && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-lg transition font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Restablecer todos los filtros
            </button>
          )}
        </div>

        {/* Etiquetas visuales de CCAA seleccionadas para eliminar individualmente */}
        {selectedCCAAs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">CCAA Activas:</span>
            {selectedCCAAs.map((ccaa) => (
              <span
                key={ccaa}
                className="inline-flex items-center gap-1 text-xs bg-[#C41E3A]/20 text-rose-200 border border-[#C41E3A]/40 px-2.5 py-1 rounded-md font-medium"
              >
                {ccaa}
                <button
                  type="button"
                  onClick={(e) => removeCCAA(ccaa, e)}
                  className="hover:text-white transition p-0.5 rounded-full"
                  title={`Eliminar filtro ${ccaa}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          {/* Edad */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Rango de Edad:</label>
            <select
              value={selectedEdad}
              onChange={(e) => setSelectedEdad(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#C41E3A]"
            >
              <option value="todos">Todas las edades</option>
              <option value="18-30">18 - 30 años</option>
              <option value="31-45">31 - 45 años</option>
              <option value="46-60">46 - 60 años</option>
              <option value="60+">Más de 60 años</option>
            </select>
          </div>

          {/* Comunidades Autónomas Múltiples */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-400">
                Seleccionar Comunidades Autónomas:
              </label>
              {selectedCCAAs.length > 0 && (
                <button
                  onClick={() => setSelectedCCAAs([])}
                  className="text-[10px] text-sky-400 hover:underline"
                >
                  Limpiar CCAA
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-950/50 rounded-lg border border-slate-800">
              {ccaaList.map((ccaa) => {
                const isSelected = selectedCCAAs.includes(ccaa);
                return (
                  <button
                    key={ccaa}
                    type="button"
                    onClick={() => toggleCCAA(ccaa)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition font-medium border ${
                      isSelected
                        ? "bg-[#C41E3A] text-white border-[#C41E3A] shadow"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {ccaa} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
          <p className="text-xs text-slate-400">Aplicando filtros y calculando resultados...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pregunta 21 */}
          {monarquia.length > 0 && (
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Forma del Estado (Monarquía vs República)</span>
                <span className="text-xs font-normal text-slate-400">Desglose filtrado en tiempo real</span>
              </h3>
              <div className="space-y-4">
                {monarquia.map((item) => (
                  <div key={`monarquia-${item.label}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <span className="text-slate-400">{item.count} votos ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-6 flex items-center justify-center text-white font-bold text-xs transition-all"
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      >
                        {item.percentage > 8 && `${item.percentage.toFixed(1)}%`}
                      </div>
                    </div>

                    {breakdownLoading ? (
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 italic">
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                        Sincronizando desglose político...
                      </div>
                    ) : partyBreakdownMap[getBreakdownKey('monarquia_republica', item.label)]?.length > 0 ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {partyBreakdownMap[getBreakdownKey('monarquia_republica', item.label)].slice(0, 6).map((entry) => {
                          const style = getPartyStyle(entry.party_vote);
                          return (
                            <div
                              key={`monarquia-party-${item.label}-${entry.party_vote}`}
                              className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/60 border border-slate-700"
                              style={{ borderLeftColor: style.color, borderLeftWidth: '4px' }}
                            >
                              <div className="flex items-center gap-2">
                                <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                                <span className="text-xs font-semibold text-slate-200">{entry.party_vote}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{entry.votes_count} votos</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-400/90 italic flex items-center gap-1.5 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Desglose por partidos disponible próximamente para esta opción específica.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pregunta 22 */}
          {division.length > 0 && (
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Modelo de División Territorial</span>
                <span className="text-xs font-normal text-slate-400">Desglose filtrado en tiempo real</span>
              </h3>
              <div className="space-y-4">
                {division.map((item) => (
                  <div key={`division-${item.label}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <span className="text-slate-400">{item.count} votos ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 h-6 flex items-center justify-center text-white font-bold text-xs transition-all"
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      >
                        {item.percentage > 8 && `${item.percentage.toFixed(1)}%`}
                      </div>
                    </div>

                    {breakdownLoading ? (
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 italic">
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                        Sincronizando desglose político...
                      </div>
                    ) : partyBreakdownMap[getBreakdownKey('division_territorial', item.label)]?.length > 0 ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {partyBreakdownMap[getBreakdownKey('division_territorial', item.label)].slice(0, 6).map((entry) => {
                          const style = getPartyStyle(entry.party_vote);
                          return (
                            <div
                              key={`division-party-${item.label}-${entry.party_vote}`}
                              className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/60 border border-slate-700"
                              style={{ borderLeftColor: style.color, borderLeftWidth: '4px' }}
                            >
                              <div className="flex items-center gap-2">
                                <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                                <span className="text-xs font-semibold text-slate-200">{entry.party_vote}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{entry.votes_count} votos</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-400/90 italic flex items-center gap-1.5 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Desglose por partidos disponible próximamente para esta opción específica.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pregunta 23 */}
          {pensiones.length > 0 && (
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Sistema de Pensiones</span>
                <span className="text-xs font-normal text-slate-400">Desglose filtrado en tiempo real</span>
              </h3>
              <div className="space-y-4">
                {pensiones.map((item) => (
                  <div key={`pensiones-${item.label}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <span className="text-slate-400">{item.count} votos ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-600 to-orange-600 h-6 flex items-center justify-center text-white font-bold text-xs transition-all"
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      >
                        {item.percentage > 8 && `${item.percentage.toFixed(1)}%`}
                      </div>
                    </div>

                    {breakdownLoading ? (
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 italic">
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                        Sincronizando desglose político...
                      </div>
                    ) : partyBreakdownMap[getBreakdownKey('sistema_pensiones', item.label)]?.length > 0 ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {partyBreakdownMap[getBreakdownKey('sistema_pensiones', item.label)].slice(0, 6).map((entry) => {
                          const style = getPartyStyle(entry.party_vote);
                          return (
                            <div
                              key={`pensiones-party-${item.label}-${entry.party_vote}`}
                              className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/60 border border-slate-700"
                              style={{ borderLeftColor: style.color, borderLeftWidth: '4px' }}
                            >
                              <div className="flex items-center gap-2">
                                <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                                <span className="text-xs font-semibold text-slate-200">{entry.party_vote}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{entry.votes_count} votos</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-400/90 italic flex items-center gap-1.5 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Desglose por partidos disponible próximamente para esta opción específica.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
