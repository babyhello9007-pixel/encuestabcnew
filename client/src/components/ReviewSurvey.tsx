import { Button } from "@/components/ui/button";
import { SurveyResponse } from "@/lib/types";
import { surveyQuestions } from "@/lib/surveyData";

interface ReviewSurveyProps {
  responses: SurveyResponse;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function ReviewSurvey({ responses, onEdit, onConfirm, isSubmitting }: ReviewSurveyProps) {
  const getQuestionLabel = (fieldName: string): string => {
    const question = surveyQuestions.find(q => q.fieldName === fieldName);
    return question?.question || fieldName;
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value === null || value === undefined) {
      return 'No respondido';
    }
    return String(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b border-[#2D2D2D]">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-white font-bold">Revisa tus respuestas</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12 max-w-2xl">
        <div className="liquid-glass p-8 rounded-2xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wide">
              Resumen de respuestas
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
              Verifica tus datos antes de enviar
            </h2>
          </div>

          {/* Responses List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(responses).map(([key, value]) => (
              <div key={key} className="p-4 rounded-lg bg-white bg-opacity-50 border border-[#E0D5CC]">
                <p className="text-sm font-semibold text-[#C41E3A] mb-2">
                  {getQuestionLabel(key)}
                </p>
                <p className="text-[#2D2D2D] break-words">
                  {formatValue(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onEdit}
              variant="outline"
              className="flex-1 border-[#C41E3A] text-[#C41E3A] h-12 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10"
            >
              Editar respuestas
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar y enviar'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
