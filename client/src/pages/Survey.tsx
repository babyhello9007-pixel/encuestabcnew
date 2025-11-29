import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { surveyQuestions, PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS } from "@/lib/surveyData";
import { SurveyResponse } from "@/lib/types";
import { toast } from "sonner";
import { normalizeProvinceInResponse } from "@/lib/provinceNormalizer";

export default function Survey() {
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;

  const handleAnswer = (value: any) => {
    const fieldName = currentQuestion.fieldName;
    
    if (currentQuestion.type === "checkbox") {
      const currentValues = (responses[fieldName] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setResponses(prev => ({ ...prev, [fieldName]: newValues }));
    } else {
      setResponses(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const normalizedResponses = normalizeProvinceInResponse(responses);
      const { error } = await supabase.from("respuestas").insert([normalizedResponses]);
      
      if (error) {
        toast.error("Error al enviar la encuesta. Por favor, intenta de nuevo.");
        console.error(error);
      } else {
        setShowThankYou(true);
        toast.success("¡Gracias por tu participación!");
      }
    } catch (error) {
      toast.error("Error al enviar la encuesta");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FAFAF8] via-[#F5F1E8] to-[#FAFAF8] p-4">
        <div className="liquid-glass p-8 rounded-2xl text-center max-w-md space-y-6">
          <div className="text-6xl">✨</div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">¡Gracias!</h1>
          <p className="text-[#666666]">
            Tu respuesta ha sido registrada exitosamente. Tu opinión es valiosa para entender el panorama político y cultural de España.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setLocation("/resultados")}
              className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold"
            >
              Ver Resultados
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full border-[#C41E3A] text-[#C41E3A] h-12 rounded-lg font-semibold"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-bold text-[#C41E3A]">Batalla Cultural</h1>
          </div>
          <div className="text-sm text-[#666666]">
            Pregunta {currentQuestionIndex + 1} de {surveyQuestions.length}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-[#E0D5CC]">
          <div
            className="h-full bg-[#C41E3A] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12 max-w-2xl">
        <div className="liquid-glass p-8 rounded-2xl space-y-8">
          {/* Question */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wide">
              {currentQuestion.section}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === "radio" && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => {
                  const isOtrosSelected = option === 'Otros' && (responses[currentQuestion.fieldName] === 'Otros' || (typeof responses[currentQuestion.fieldName] === 'string' && responses[currentQuestion.fieldName].startsWith('Otros:')));
                  return (
                    <div key={option}>
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-50 transition">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={responses[currentQuestion.fieldName] === option || isOtrosSelected}
                          onChange={(e) => handleAnswer(e.target.value)}
                          className="w-4 h-4 accent-[#C41E3A]"
                        />
                        <span className="text-[#2D2D2D]">{option}</span>
                      </label>
                      {isOtrosSelected && (
                        <input
                          type="text"
                          placeholder="Especifica tu opción..."
                          value={typeof responses[currentQuestion.fieldName] === 'string' && responses[currentQuestion.fieldName].startsWith('Otros:') ? responses[currentQuestion.fieldName].substring(6) : ''}
                          onChange={(e) => handleAnswer(e.target.value ? `Otros: ${e.target.value}` : 'Otros')}
                          className="w-full mt-2 ml-7 p-3 rounded-lg border border-[#E0D5CC] bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C41E3A] box-border overflow-hidden"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "checkbox" && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-50 transition"
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={(responses[currentQuestion.fieldName] as string[])?.includes(option) || false}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="w-4 h-4 accent-[#C41E3A]"
                    />
                    <span className="text-[#2D2D2D]">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "scale" && (
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>{currentQuestion.min}</span>
                  <span>{currentQuestion.max}</span>
                </div>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  value={(responses[currentQuestion.fieldName] as number) || currentQuestion.min}
                  onChange={(e) => handleAnswer(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#E0D5CC] rounded-lg appearance-none cursor-pointer accent-[#C41E3A]"
                />
                {currentQuestion.max !== undefined && currentQuestion.min !== undefined && (
                  <div className="flex justify-between text-xs text-[#999999] px-1">
                    {Array.from({ length: (currentQuestion.max - currentQuestion.min) + 1 }, (_, i) => currentQuestion.min! + i).map((num) => (
                      <span key={num} className={num === (responses[currentQuestion.fieldName] as number) ? "text-[#C41E3A] font-semibold" : ""}>
                        {num}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-center text-lg font-semibold text-[#C41E3A]">
                  {responses[currentQuestion.fieldName] !== undefined && responses[currentQuestion.fieldName] !== null ? responses[currentQuestion.fieldName] : "Sin seleccionar"}
                </div>
              </div>
            )}

            {currentQuestion.type === "text" && (
              <textarea
                value={(responses[currentQuestion.fieldName] as string) || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full p-4 rounded-lg border border-[#E0D5CC] bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C41E3A] resize-none"
                rows={4}
              />
            )}

            {currentQuestion.type === "number" && (
              <input
                type="number"
                value={(responses[currentQuestion.fieldName] as number) || ""}
                onChange={(e) => handleAnswer(parseInt(e.target.value) || null)}
                placeholder="Ingresa un número..."
                className="w-full p-4 rounded-lg border border-[#E0D5CC] bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 border-[#C41E3A] text-[#C41E3A] h-12 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </Button>

            {currentQuestionIndex === surveyQuestions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold"
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

