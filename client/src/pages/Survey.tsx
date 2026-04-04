import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { surveyQuestions, PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS } from "@/lib/surveyData";
import { SurveyResponse } from "@/lib/types";
import { toast } from "sonner";
import { normalizeProvinceInResponse } from "@/lib/provinceNormalizer";
import { getCCAAFromProvince, isProvinceInCCAA, getProvincesInCCAA } from "@/lib/provinceToCAA";
import ReviewSurvey from "@/components/ReviewSurvey";
import Footer from "@/components/Footer";
import { checkVotingCooldown, recordVote, getUserIP } from "@/lib/votingCooldown";

export default function Survey() {
  const [, setLocation] = useLocation();
  
  // Mostrar página de mantenimiento
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] p-4">
      <div className="liquid-glass p-12 rounded-2xl text-center max-w-md space-y-8">
        <div className="text-6xl">🔧</div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">En Mantenimiento</h1>
          <p className="text-[#999999] text-lg">
            La Encuesta de Batalla Cultural está siendo mejorada. Por ahora, puedes participar en la NanoEncuestaBC.
          </p>
        </div>
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => setLocation("/nano-encuesta")}
            className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold text-lg"
          >
            Ir a NanoEncuestaBC
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full border-[#2D2D2D] text-[#999999] h-12 rounded-lg font-semibold hover:text-white"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}

function SurveyOld() {
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [ccaaWarning, setCCAAWarning] = useState<string | null>(null);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;
  
  // Obtener provincias filtradas por CCAA seleccionada
  const getFilteredProvinces = () => {
    if (currentQuestion.fieldName === 'provincia' && responses.ccaa) {
      const filtered = getProvincesInCCAA(responses.ccaa as string);
      return filtered.length > 0 ? filtered : (currentQuestion.options || []);
    }
    return currentQuestion.options || [];
  };

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
      
      // Autocompletado de CCAA cuando se selecciona provincia
      if (fieldName === 'provincia') {
        const ccaa = getCCAAFromProvince(value);
        if (ccaa) {
          setResponses(prev => ({ ...prev, ccaa: ccaa }));
          setCCAAWarning(null);
        }
      }
      
      // Validación de consistencia CCAA-Provincia
      if (fieldName === 'ccaa') {
        const provincia = responses.provincia as string;
        if (provincia && !isProvinceInCCAA(provincia, value)) {
          setCCAAWarning(`⚠️ Advertencia: ${provincia} no pertenece a ${value}. Por favor, selecciona una provincia válida.`);
        } else {
          setCCAAWarning(null);
        }
      }
      
      if (fieldName === 'provincia') {
        const ccaa = responses.ccaa as string;
        if (ccaa && !isProvinceInCCAA(value, ccaa)) {
          setCCAAWarning(`⚠️ Advertencia: ${value} no pertenece a ${ccaa}. Por favor, selecciona una CCAA válida.`);
        } else {
          setCCAAWarning(null);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Al llegar al final, mostrar pantalla de revisión
      setShowReview(true);
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
    // Verificar cooldown por IP
    try {
      const userIP = await getUserIP();
      const { canVote, remainingMinutes } = await checkVotingCooldown(userIP);
      
      if (!canVote) {
        toast.error(`Debes esperar ${remainingMinutes} minutos antes de votar de nuevo.`);
        return;
      }
    } catch (error) {
      console.error('Error checking cooldown:', error);
      // Continuar aunque falle la verificación del cooldown
    }

    setIsSubmitting(true);
    try {
      const normalizedResponses = normalizeProvinceInResponse(responses);
      const { error } = await supabase.from("respuestas").insert([normalizedResponses]);
      
      if (error) {
        if (error.message?.includes("DELETE requires a WHERE clause")) {
          toast.error("Error de trigger en Supabase (respuestas). Hay que corregir check_and_delete_respuesta en la base de datos.");
        } else {
          toast.error("Error al enviar la encuesta. Por favor, intenta de nuevo.");
        }
        console.error(error);
      } else {
        // Registrar el voto en el cooldown
        try {
          const userIP = await getUserIP();
          await recordVote(userIP);
        } catch (error) {
          console.error('Error recording vote cooldown:', error);
        }
        
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

  if (showReview) {
    return (
      <ReviewSurvey
        responses={responses}
        onEdit={() => {
          setShowReview(false);
          setCurrentQuestionIndex(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

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

          {/* Advertencia de CCAA */}
          {ccaaWarning && (
            <div className="p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
              <p className="font-semibold">{ccaaWarning}</p>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === "radio" && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => {
                  const isOtrosSelected = option === 'Otros' && (responses[currentQuestion.fieldName] === 'Otros' || (typeof responses[currentQuestion.fieldName] === 'string' && (responses[currentQuestion.fieldName] as string).startsWith('Otros:')));
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
                          value={(() => {
                            const val = responses[currentQuestion.fieldName];
                            if (typeof val === 'string' && val.startsWith('Otros:')) {
                              return val.substring(6);
                            }
                            return '';
                          })()}
                          onChange={(e) => handleAnswer(e.target.value ? `Otros: ${e.target.value}` : 'Otros:')}
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
