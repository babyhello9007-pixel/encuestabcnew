import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import PartyLogo from '@/components/PartyLogo';
import { Filter, RefreshCw } from 'lucide-react';

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

interface ResponseRow {
  monarquia_republica: string | null;
  division_territorial: string | null;
  sistema_pensiones: string | null;
  edad_media: number | null;
  ideologia_media: number | null;
  edad?: number | null;
  ccaa?: string | null;
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

  // Filtros interactivos
  const [selectedEdad, setSelectedEdad] = useState<string>("todos");
  const [selectedCCAA, setSelectedCCAA] = useState<string>("todas");

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

      if (selectedCCAA !== "todas") {
        query = query.eq('ccaa', selectedCCAA);
      }

      const { data, error } = await query;

      if (error) {
        // Fallback a vista si la tabla directa no está accesible
        const { data: viewData, error: viewError } = await supabase
          .from('preguntas_varias_view')
          .select('monarquia_republica, division_territorial, sistema_pensiones, edad_media, ideologia_media');
        
        if (viewError) throw viewError;
        processRawData(viewData || []);
        return;
      }

      // Filtrar por edad en memoria si es necesario
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
  }, [selectedEdad, selectedCCAA]);

  useEffect(() => {
    const loadBreakdown = async () => {
      try {
        setBreakdownLoading(true);
        const { data, error } = await supabase
          .from('preguntas_varias_party_breakdown')
          .select('question_key, option_value, party_vote, votes_count')
          .order('votes_count', { ascending: false });

        if (error) {
          setBreakdownLoading(false);
          return;
        }

        const grouped: Record<string, OptionPartyBreakdown[]> = {};
        (data || []).forEach((row: any) => {
          const key = `${row.question_key}::${row.option_value}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(row as OptionPartyBreakdown);
        });

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
  }, []);

  const getBreakdownKey = (questionKey: string, label: string) => `${questionKey}::${label}`;
  const getPartyStyle = (party: string) => {
    const key = party.trim().toUpperCase();
    const fromMeta = partyMeta[key];
    if (fromMeta?.color || fromMeta?.logo) return { color: fromMeta.color || "#9CA3AF", logo: fromMeta.logo || "" };
    return partyBranding[key] || { color: "#9CA3AF", logo: "" };
  };

  return (
    <div className="space-y-6">
      {/* Barra de filtros interactivos */}
      <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#C41E3A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Segmentar Preguntas Varias:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Edad */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Edad:</span>
            <select
              value={selectedEdad}
              onChange={(e) => setSelectedEdad(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41E3A]"
            >
              <option value="todos">Todas las edades</option>
              <option value="18-30">18 - 30 años</option>
              <option value="31-45">31 - 45 años</option>
              <option value="46-60">46 - 60 años</option>
              <option value="60+">Más de 60 años</option>
            </select>
          </div>

          {/* Filtro CCAA */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">CCAA:</span>
            <select
              value={selectedCCAA}
              onChange={(e) => setSelectedCCAA(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41E3A]"
            >
              <option value="todas">Todas las CCAA</option>
              {ccaaList.map((ccaa) => (
                <option key={ccaa} value={ccaa}>{ccaa}</option>
              ))}
            </select>
          </div>

          {(selectedEdad !== "todos" || selectedCCAA !== "todas") && (
            <button
              onClick={() => { setSelectedEdad("todos"); setSelectedCCAA("todas"); }}
              className="text-xs text-[#C41E3A] hover:underline font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
          <p className="text-xs text-slate-400">Calculando respuestas segmentadas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pregunta 21 */}
          {monarquia.length > 0 && (
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Forma del Estado (Monarquía vs República)</span>
                <span className="text-xs font-normal text-slate-400">Total respuestas filtradas</span>
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

                    {/* Desglose por partido con estado de carga claro */}
                    {breakdownLoading ? (
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 italic">
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                        Sincronizando desglose político por opción...
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
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Modelo de División Territorial</span>
                <span className="text-xs font-normal text-slate-400">Total respuestas filtradas</span>
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
            <Card className="p-6 bg-slate-900/40 border-slate-800 text-white">
              <h3 className="text-base font-bold mb-4 flex items-center justify-between">
                <span>Sistema de Pensiones</span>
                <span className="text-xs font-normal text-slate-400">Total respuestas filtradas</span>
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
