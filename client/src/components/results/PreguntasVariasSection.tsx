import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PreguntaResult {
  question: string;
  fieldName: string;
  options: { label: string; color: string }[];
  data: { label: string; votes: number; percentage: number }[];
  totalVotes: number;
}

export default function PreguntasVariasSection() {
  const [results, setResults] = useState<PreguntaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de las tres preguntas
        const { data, error: queryError } = await supabase
          .from('respuestas')
          .select('monarquia_republica, division_territorial, sistema_pensiones');

        if (queryError) throw queryError;

        if (!data || data.length === 0) {
          setResults([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Procesar pregunta 21: Monarquía/República
        const monarquiaData = procesarRespuestas(
          data.map(r => r.monarquia_republica).filter(Boolean) as string[],
          ['Monarquía Parlamentaria', 'República', 'Otro']
        );

        // Procesar pregunta 22: División Territorial
        const divisionData = procesarRespuestas(
          data.map(r => r.division_territorial).filter(Boolean) as string[],
          ['Sistema actual de Autonomías', 'Sistema Federal', 'Sistema Provincial (Sin Autonomías)', 'Otro']
        );

        // Procesar pregunta 23: Sistema de Pensiones
        const pensionesData = procesarRespuestas(
          data.map(r => r.sistema_pensiones).filter(Boolean) as string[],
          ['Público (Actual)', 'Privado', 'Mixto', 'Otro']
        );

        const preguntasResults: PreguntaResult[] = [
          {
            question: '¿Qué forma de gobierno del Estado Español prefieres?',
            fieldName: 'monarquia_republica',
            options: [
              { label: 'Monarquía Parlamentaria', color: '#0066FF' },
              { label: 'República', color: '#FF6600' },
              { label: 'Otro', color: '#999999' }
            ],
            data: monarquiaData,
            totalVotes: data.filter(r => r.monarquia_republica).length
          },
          {
            question: '¿Qué división territorial del Estado Español prefieres?',
            fieldName: 'division_territorial',
            options: [
              { label: 'Sistema actual de Autonomías', color: '#2ECC71' },
              { label: 'Sistema Federal', color: '#9B2D96' },
              { label: 'Sistema Provincial (Sin Autonomías)', color: '#E81B23' },
              { label: 'Otro', color: '#999999' }
            ],
            data: divisionData,
            totalVotes: data.filter(r => r.division_territorial).length
          },
          {
            question: '¿Qué sistema de pensiones prefieres?',
            fieldName: 'sistema_pensiones',
            options: [
              { label: 'Público (Actual)', color: '#FF0000' },
              { label: 'Privado', color: '#0066FF' },
              { label: 'Mixto', color: '#FFC400' },
              { label: 'Otro', color: '#999999' }
            ],
            data: pensionesData,
            totalVotes: data.filter(r => r.sistema_pensiones).length
          }
        ];

        setResults(preguntasResults);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los resultados');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const procesarRespuestas = (respuestas: string[], opcionesEsperadas: string[]) => {
    const conteo: { [key: string]: number } = {};
    
    opcionesEsperadas.forEach(opcion => {
      conteo[opcion] = 0;
    });

    respuestas.forEach(respuesta => {
      if (conteo.hasOwnProperty(respuesta)) {
        conteo[respuesta]++;
      } else {
        // Si no está en las opciones esperadas, contar como "Otro"
        if (conteo['Otro'] !== undefined) {
          conteo['Otro']++;
        }
      }
    });

    const total = respuestas.length;
    return Object.entries(conteo).map(([label, votes]) => ({
      label,
      votes,
      percentage: total > 0 ? Math.round((votes / total) * 100) : 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <HelpCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600">{error}</p>
      </Card>
    );
  }

  if (results.length === 0 || results.every(r => r.totalVotes === 0)) {
    return (
      <Card className="p-8 text-center border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <HelpCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600">No hay datos disponibles para las Preguntas Varias</p>
      </Card>
    );
  }

  const colorMap: { [key: string]: string } = {
    'Monarquía Parlamentaria': '#0066FF',
    'República': '#FF6600',
    'Sistema actual de Autonomías': '#2ECC71',
    'Sistema Federal': '#9B2D96',
    'Sistema Provincial (Sin Autonomías)': '#E81B23',
    'Público (Actual)': '#FF0000',
    'Privado': '#0066FF',
    'Mixto': '#FFC400',
    'Otro': '#999999'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Preguntas Varias</h2>
      </div>

      {results.map((pregunta, index) => (
        <Card key={index} className="p-6 border-0 shadow-lg liquid-glass">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Pregunta {21 + index}
            </h3>
            <p className="text-base text-foreground mb-2">
              {pregunta.question}
            </p>
            <p className="text-sm text-muted-foreground">
              Total de respuestas: {pregunta.totalVotes}
            </p>
          </div>

          <div className="space-y-4">
            {pregunta.data.map((opcion, optionIndex) => (
              <div key={optionIndex} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    {opcion.label}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {opcion.percentage}%
                  </span>
                </div>
                <div className="h-8 bg-border rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-center"
                    style={{
                      width: `${opcion.percentage}%`,
                      backgroundColor: colorMap[opcion.label] || '#999999'
                    }}
                  >
                    {opcion.percentage > 15 && (
                      <span className="text-xs font-bold text-white">
                        {opcion.votes}
                      </span>
                    )}
                  </div>
                </div>
                {opcion.percentage <= 15 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {opcion.votes} {opcion.votes === 1 ? 'voto' : 'votos'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground text-center">
        Los resultados se actualizan automáticamente cada 30 segundos
      </p>
    </div>
  );
}
