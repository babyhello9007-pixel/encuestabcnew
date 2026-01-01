import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface Survey {
  question_number: number;
  question_text: string;
  option_o1: string;
  option_o2: string;
  option_oo: string;
}

interface SurveyResponse {
  question_number: number;
  selected_option: 'O1' | 'O2' | 'OO';
  other_text?: string;
}

export default function SurveysVarias() {
  const [, setLocation] = useLocation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, SurveyResponse>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys');
        if (!response.ok) throw new Error('Error al cargar encuestas');
        const data = await response.json();
        setSurveys(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar las encuestas');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleOptionSelect = (questionNumber: number, option: 'O1' | 'O2' | 'OO') => {
    setResponses(prev => ({
      ...prev,
      [questionNumber]: {
        question_number: questionNumber,
        selected_option: option,
        other_text: option === 'OO' ? prev[questionNumber]?.other_text : undefined
      }
    }));
  };

  const handleOtherTextChange = (questionNumber: number, text: string) => {
    setResponses(prev => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        question_number: questionNumber,
        selected_option: 'OO',
        other_text: text
      }
    }));
  };

  const handleSubmitSurvey = async () => {
    const currentSurvey = surveys[currentSurveyIndex];
    const response = responses[currentSurvey.question_number];

    if (!response) {
      toast.error('Por favor selecciona una opción');
      return;
    }

    if (response.selected_option === 'OO' && !response.other_text?.trim()) {
      toast.error('Por favor especifica tu respuesta en "Otros"');
      return;
    }

    setSubmitting(true);
    try {
      const submitResponse = await fetch('/api/surveys/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });

      if (!submitResponse.ok) throw new Error('Error al enviar respuesta');

      toast.success('¡Respuesta registrada!');

      if (currentSurveyIndex < surveys.length - 1) {
        setCurrentSurveyIndex(prev => prev + 1);
      } else {
        toast.success('¡Gracias por participar en todas las encuestas!');
        setTimeout(() => setLocation('/respuestas'), 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-700" />
          <p className="text-slate-600">Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Encuestas Varias</h1>
          <p className="text-slate-600 mb-6">No hay encuestas disponibles en este momento.</p>
          <Button onClick={() => setLocation('/respuestas')} className="w-full">
            Volver a Resultados
          </Button>
        </Card>
      </div>
    );
  }

  const currentSurvey = surveys[currentSurveyIndex];
  const currentResponse = responses[currentSurvey.question_number];
  const progress = ((currentSurveyIndex + 1) / surveys.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <button
            onClick={() => setLocation('/respuestas')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Encuestas Varias</h1>
          <div className="w-20 text-right">
            <span className="text-sm font-semibold text-slate-600">
              {currentSurveyIndex + 1} / {surveys.length}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="p-8 mb-8 border-0 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {currentSurvey.question_text}
            </h2>
            <p className="text-sm text-slate-500">
              Pregunta {currentSurvey.question_number}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleOptionSelect(currentSurvey.question_number, 'O1')}
              className={`w-full p-4 rounded-lg border-2 transition ${
                currentResponse?.selected_option === 'O1'
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    currentResponse?.selected_option === 'O1'
                      ? 'border-red-600 bg-red-600'
                      : 'border-slate-300'
                  }`}
                >
                  {currentResponse?.selected_option === 'O1' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-left font-semibold text-slate-900">
                  {currentSurvey.option_o1}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleOptionSelect(currentSurvey.question_number, 'O2')}
              className={`w-full p-4 rounded-lg border-2 transition ${
                currentResponse?.selected_option === 'O2'
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    currentResponse?.selected_option === 'O2'
                      ? 'border-red-600 bg-red-600'
                      : 'border-slate-300'
                  }`}
                >
                  {currentResponse?.selected_option === 'O2' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-left font-semibold text-slate-900">
                  {currentSurvey.option_o2}
                </span>
              </div>
            </button>

            <div
              className={`p-4 rounded-lg border-2 transition ${
                currentResponse?.selected_option === 'OO'
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <button
                onClick={() => handleOptionSelect(currentSurvey.question_number, 'OO')}
                className="w-full flex items-center gap-3 mb-3"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    currentResponse?.selected_option === 'OO'
                      ? 'border-red-600 bg-red-600'
                      : 'border-slate-300'
                  }`}
                >
                  {currentResponse?.selected_option === 'OO' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-semibold text-slate-900">
                  {currentSurvey.option_oo}
                </span>
              </button>

              {currentResponse?.selected_option === 'OO' && (
                <input
                  type="text"
                  placeholder="Especifica tu respuesta..."
                  value={currentResponse.other_text || ''}
                  onChange={(e) =>
                    handleOtherTextChange(currentSurvey.question_number, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentSurveyIndex(prev => Math.max(0, prev - 1))}
              variant="outline"
              disabled={currentSurveyIndex === 0}
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              onClick={handleSubmitSurvey}
              disabled={submitting || !currentResponse}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : currentSurveyIndex === surveys.length - 1 ? (
                'Finalizar'
              ) : (
                'Siguiente'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
