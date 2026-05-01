import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import PartyLogo from '@/components/PartyLogo';

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
}

const loadData = async (
  setMonarquia: (data: QuestionData[]) => void,
  setDivision: (data: QuestionData[]) => void,
  setPensiones: (data: QuestionData[]) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    const { data, error } = await supabase
      .from('preguntas_varias_view')
      .select('monarquia_republica, division_territorial, sistema_pensiones, edad_media, ideologia_media');

    if (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    const monarquiaMap: Record<string, number> = {};
    const divisionMap: Record<string, number> = {};
    const pensionesMap: Record<string, number> = {};

    data.forEach((row: ResponseRow) => {
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
      Object.entries(monarquiaMap).map(([label, count]) => {
        const item = data.find((row: ResponseRow) => row.monarquia_republica === label);
        return {
          label,
          count,
          percentage: totalMonarquia > 0 ? Math.round((count / totalMonarquia) * 1000) / 10 : 0,
          edad_media: item?.edad_media || 0,
          ideologia_media: item?.ideologia_media || 0,
        };
      })
    );

    setDivision(
      Object.entries(divisionMap).map(([label, count]) => {
        const item = data.find((row: ResponseRow) => row.division_territorial === label);
        return {
          label,
          count,
          percentage: totalDivision > 0 ? Math.round((count / totalDivision) * 1000) / 10 : 0,
          edad_media: item?.edad_media || 0,
          ideologia_media: item?.ideologia_media || 0,
        };
      })
    );

    setPensiones(
      Object.entries(pensionesMap).map(([label, count]) => {
        const item = data.find((row: ResponseRow) => row.sistema_pensiones === label);
        return {
          label,
          count,
          percentage: totalPensiones > 0 ? Math.round((count / totalPensiones) * 1000) / 10 : 0,
          edad_media: item?.edad_media || 0,
          ideologia_media: item?.ideologia_media || 0,
        };
      })
    );

    setLoading(false);
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
};

export default function PreguntasVariasSection({ partyMeta = {} }: { partyMeta?: Record<string, { color?: string; logo?: string }> }) {
  const [monarquia, setMonarquia] = useState<QuestionData[]>([]);
  const [division, setDivision] = useState<QuestionData[]>([]);
  const [pensiones, setPensiones] = useState<QuestionData[]>([]);
  const [partyBreakdownMap, setPartyBreakdownMap] = useState<Record<string, OptionPartyBreakdown[]>>({});
  const [partyBranding, setPartyBranding] = useState<Record<string, { color: string; logo: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(setMonarquia, setDivision, setPensiones, setLoading);
  }, []);

  useEffect(() => {
    const loadBreakdown = async () => {
      const { data, error } = await supabase
        .from('preguntas_varias_party_breakdown')
        .select('question_key, option_value, party_vote, votes_count')
        .order('votes_count', { ascending: false });

      if (error) {
        console.error('Error loading preguntas varias party breakdown:', error);
        return;
      }

      const grouped: Record<string, OptionPartyBreakdown[]> = {};
      (data || []).forEach((row: any) => {
        const key = `${row.question_key}::${row.option_value}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row as OptionPartyBreakdown);
      });

      setPartyBreakdownMap(grouped);
    };

    const loadBranding = async () => {
      const { data, error } = await supabase
        .from('party_configuration')
        .select('party_key, display_name, color, logo_url')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading branding for preguntas varias:', error);
        return;
      }

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

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Pregunta 21 */}
      {monarquia.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">Pregunta 21: Forma del Estado</h3>
          <div className="space-y-4">
            {monarquia.map((item) => (
              <div key={`monarquia-${item.label}`}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.count} votos ({item.percentage.toFixed(1)}%) | Edad: {item.edad_media?.toFixed(1)} | Ideología: {item.ideologia_media?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 flex items-center justify-center text-white font-bold text-sm transition-all"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage > 10 && `${item.percentage.toFixed(1)}%`}
                  </div>
                </div>
                {partyBreakdownMap[getBreakdownKey('monarquia_republica', item.label)]?.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {partyBreakdownMap[getBreakdownKey('monarquia_republica', item.label)].slice(0, 6).map((entry) => {
                      const style = getPartyStyle(entry.party_vote);
                      return (
                        <div
                          key={`monarquia-party-${item.label}-${entry.party_vote}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 border"
                          style={{ borderColor: style.color }}
                        >
                          <div className="flex items-center gap-2">
                            <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                            <span className="text-xs font-semibold">{entry.party_vote}</span>
                          </div>
                          <span className="text-xs text-gray-600">{entry.votes_count} votos</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pregunta 22 */}
      {division.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">Pregunta 22: División Territorial</h3>
          <div className="space-y-4">
            {division.map((item) => (
              <div key={`division-${item.label}`}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.count} votos ({item.percentage.toFixed(1)}%) | Edad: {item.edad_media?.toFixed(1)} | Ideología: {item.ideologia_media?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-8 flex items-center justify-center text-white font-bold text-sm transition-all"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage > 10 && `${item.percentage.toFixed(1)}%`}
                  </div>
                </div>
                {partyBreakdownMap[getBreakdownKey('division_territorial', item.label)]?.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {partyBreakdownMap[getBreakdownKey('division_territorial', item.label)].slice(0, 6).map((entry) => {
                      const style = getPartyStyle(entry.party_vote);
                      return (
                        <div
                          key={`division-party-${item.label}-${entry.party_vote}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 border"
                          style={{ borderColor: style.color }}
                        >
                          <div className="flex items-center gap-2">
                            <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                            <span className="text-xs font-semibold">{entry.party_vote}</span>
                          </div>
                          <span className="text-xs text-gray-600">{entry.votes_count} votos</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pregunta 23 */}
      {pensiones.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">Pregunta 23: Sistema de Pensiones</h3>
          <div className="space-y-4">
            {pensiones.map((item) => (
              <div key={`pensiones-${item.label}`}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.count} votos ({item.percentage.toFixed(1)}%) | Edad: {item.edad_media?.toFixed(1)} | Ideología: {item.ideologia_media?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-8 flex items-center justify-center text-white font-bold text-sm transition-all"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage > 10 && `${item.percentage.toFixed(1)}%`}
                  </div>
                </div>
                {partyBreakdownMap[getBreakdownKey('sistema_pensiones', item.label)]?.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {partyBreakdownMap[getBreakdownKey('sistema_pensiones', item.label)].slice(0, 6).map((entry) => {
                      const style = getPartyStyle(entry.party_vote);
                      return (
                        <div
                          key={`pensiones-party-${item.label}-${entry.party_vote}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 border"
                          style={{ borderColor: style.color }}
                        >
                          <div className="flex items-center gap-2">
                            <PartyLogo src={style.logo} partyName={entry.party_vote} size={18} strictExternal />
                            <span className="text-xs font-semibold">{entry.party_vote}</span>
                          </div>
                          <span className="text-xs text-gray-600">{entry.votes_count} votos</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {monarquia.length === 0 && division.length === 0 && pensiones.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          No hay datos disponibles para las Preguntas Varias
        </Card>
      )}
    </div>
  );
}
