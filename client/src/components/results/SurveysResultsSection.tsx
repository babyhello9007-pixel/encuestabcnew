import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface SurveyResult {
  question_number: number;
  question_text: string;
  option_o1: string;
  option_o2: string;
  option_oo: string;
  votes_o1: number;
  votes_o2: number;
  votes_oo: number;
  votes_total: number;
  pct_o1: number;
  pct_o2: number;
  pct_oo: number;
}

export default function SurveysResultsSection() {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/surveys/results');
        if (!response.ok) throw new Error('Error al cargar resultados');
        const data = await response.json();
        setResults(data || []);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('No hay encuestas disponibles');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || results.length === 0) {
    return (
      <Card className="p-8 text-center border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <BarChart3 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'No hay encuestas disponibles'}</p>
        <Button
          onClick={() => window.location.href = '/encuestas-varias'}
          className="bg-red-600 hover:bg-red-700"
        >
          Participar en Encuestas
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-slate-900">Encuestas Varias</h2>
      </div>

      {results.map((result) => (
        <Card key={result.question_number} className="p-6 border-0 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {result.question_text}
            </h3>
            <p className="text-sm text-slate-500">
              Pregunta #{result.question_number} • Total de votos: {result.votes_total}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">{result.option_o1}</span>
                <span className="text-sm font-bold text-red-600">
                  {result.pct_o1}%
                </span>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${result.pct_o1}%` }}
                >
                  {result.pct_o1 > 15 && (
                    <span className="text-xs font-bold text-white">
                      {result.votes_o1}
                    </span>
                  )}
                </div>
              </div>
              {result.pct_o1 <= 15 && (
                <p className="text-xs text-slate-600 text-center">{result.votes_o1} votos</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">{result.option_o2}</span>
                <span className="text-sm font-bold text-blue-600">
                  {result.pct_o2}%
                </span>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${result.pct_o2}%` }}
                >
                  {result.pct_o2 > 15 && (
                    <span className="text-xs font-bold text-white">
                      {result.votes_o2}
                    </span>
                  )}
                </div>
              </div>
              {result.pct_o2 <= 15 && (
                <p className="text-xs text-slate-600 text-center">{result.votes_o2} votos</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">{result.option_oo}</span>
                <span className="text-sm font-bold text-green-600">
                  {result.pct_oo}%
                </span>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${result.pct_oo}%` }}
                >
                  {result.pct_oo > 15 && (
                    <span className="text-xs font-bold text-white">
                      {result.votes_oo}
                    </span>
                  )}
                </div>
              </div>
              {result.pct_oo <= 15 && (
                <p className="text-xs text-slate-600 text-center">{result.votes_oo} votos</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => window.location.href = '/encuestas-varias'}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Participar
            </Button>
          </div>
        </Card>
      ))}

      <p className="text-xs text-slate-500 text-center">
        Los resultados se actualizan automáticamente cada 30 segundos
      </p>
    </div>
  );
}
