import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS, PROVINCES, CCAA } from "@/lib/surveyData";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeProvinceName } from "@/lib/provinceNormalizer";

interface NanoSurveyResponse {
  edad?: string;
  provincia?: string;
  comunidad_autonoma?: string;
  nacionalidad?: string;
  voto_generales?: string;
  voto_generales_otro?: string;
  voto_autonomicas?: string;
  voto_autonomicas_otro?: string;
  voto_municipales?: string;
  voto_municipales_otro?: string;
  voto_europeas?: string;
  voto_europeas_otro?: string;
  nota_ejecutivo?: number;
  valoracion_feijoo?: number;
  valoracion_sanchez?: number;
  valoracion_abascal?: number;
  valoracion_alvise?: number;
  valoracion_yolanda?: number;
  valoracion_irene?: number;
  valoracion_ayuso?: number;
  valoracion_buxade?: number;
  asociacion_juvenil?: string;
  asociacion_juvenil_otro?: string;
  created_at?: string;
}

export default function NanoEncuestaBC() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<NanoSurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showOtroInput, setShowOtroInput] = useState(false);

  const steps = [
    { title: "Edad", key: "edad", type: "text" },
    { title: "Provincia", key: "provincia", type: "select" },
    { title: "Comunidad Autónoma", key: "comunidad_autonoma", type: "select" },
    { title: "Nacionalidad", key: "nacionalidad", type: "text" },
    { title: "Voto Elecciones Generales", key: "voto_generales", type: "select" },
    { title: "Voto Elecciones Autonómicas", key: "voto_autonomicas", type: "select" },
    { title: "Voto Elecciones Municipales", key: "voto_municipales", type: "select" },
    { title: "Voto Elecciones Europeas", key: "voto_europeas", type: "select" },
    { title: "Nota al Ejecutivo", key: "nota_ejecutivo", type: "slider" },
    { title: "Valoración: Alberto Núñez Feijóo", key: "valoracion_feijoo", type: "slider" },
    { title: "Valoración: Pedro Sánchez", key: "valoracion_sanchez", type: "slider" },
    { title: "Valoración: Santiago Abascal", key: "valoracion_abascal", type: "slider" },
    { title: "Valoración: Alvise Pérez", key: "valoracion_alvise", type: "slider" },
    { title: "Valoración: Yolanda Díaz", key: "valoracion_yolanda", type: "slider" },
    { title: "Valoración: Irene Montero", key: "valoracion_irene", type: "slider" },
    { title: "Valoración: Isabel Díaz Ayuso", key: "valoracion_ayuso", type: "slider" },
    { title: "Valoración: Jorge Buxadé", key: "valoracion_buxade", type: "slider" },
    { title: "Asociación Juvenil", key: "asociacion_juvenil", type: "select" },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleAnswer = (value: any) => {
    setResponses(prev => ({ ...prev, [currentStepData.key]: value }));
    setShowOtroInput(value === "OTRO");
  };

  const handleOtroAnswer = (value: string) => {
    const otroKey = `${currentStepData.key}_otro`;
    setResponses(prev => ({ ...prev, [otroKey]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    // Validar que todas las preguntas sean respondidas
    const requiredFields = [
      'edad',
      'provincia',
      'comunidad_autonoma',
      'nacionalidad',
      'voto_generales',
      'voto_autonomicas',
      'voto_municipales',
      'voto_europeas',
      'nota_ejecutivo',
      'valoracion_feijoo',
      'valoracion_sanchez',
      'valoracion_abascal',
      'valoracion_alvise',
      'valoracion_yolanda',
      'valoracion_irene',
      'valoracion_ayuso',
      'valoracion_buxade',
      'asociacion_juvenil'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = responses[field as keyof NanoSurveyResponse];
      return value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value));
    });

    if (missingFields.length > 0) {
      toast.error(`Por favor, responde todas las preguntas. Faltan ${missingFields.length} respuestas.`);
      return;
    }

    // Validar que si se selecciona "Otro", haya texto en el campo
    if (responses.voto_generales === 'OTRO' && !responses.voto_generales_otro) {
      toast.error('Por favor, especifica tu opción en "Otro" para Elecciones Generales.');
      return;
    }
    if (responses.voto_autonomicas === 'OTRO' && !responses.voto_autonomicas_otro) {
      toast.error('Por favor, especifica tu opción en "Otro" para Elecciones Autonómicas.');
      return;
    }
    if (responses.voto_municipales === 'OTRO' && !responses.voto_municipales_otro) {
      toast.error('Por favor, especifica tu opción en "Otro" para Elecciones Municipales.');
      return;
    }
    if (responses.voto_europeas === 'OTRO' && !responses.voto_europeas_otro) {
      toast.error('Por favor, especifica tu opción en "Otro" para Elecciones Europeas.');
      return;
    }
    if (responses.asociacion_juvenil === 'OTRO' && !responses.asociacion_juvenil_otro) {
      toast.error('Por favor, especifica tu opción en "Otro" para Asociación Juvenil.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviar datos tal como están, sin procesar
      // Esto es idéntico a cómo Survey.tsx maneja los datos
      const dataToSubmit = {
        edad: responses.edad ? parseInt(responses.edad) : 18,
        provincia: normalizeProvinceName(responses.provincia) || null,
        ccaa: responses.comunidad_autonoma || null,
        nacionalidad: responses.nacionalidad || null,
        voto_generales: responses.voto_generales || null,
        voto_generales_otro: responses.voto_generales_otro || null,
        voto_autonomicas: responses.voto_autonomicas || null,
        voto_autonomicas_otro: responses.voto_autonomicas_otro || null,
        voto_municipales: responses.voto_municipales || null,
        voto_municipales_otro: responses.voto_municipales_otro || null,
        voto_europeas: responses.voto_europeas || null,
        voto_europeas_otro: responses.voto_europeas_otro || null,
        nota_ejecutivo: responses.nota_ejecutivo || null,
        val_feijoo: responses.valoracion_feijoo || 0,
        val_sanchez: responses.valoracion_sanchez || 0,
        val_abascal: responses.valoracion_abascal || 0,
        val_alvise: responses.valoracion_alvise || 0,
        val_yolanda_diaz: responses.valoracion_yolanda || 0,
        val_irene_montero: responses.valoracion_irene || 0,
        val_ayuso: responses.valoracion_ayuso || 0,
        val_buxade: responses.valoracion_buxade || 0,
        voto_asociacion_juvenil: responses.asociacion_juvenil || null,
        voto_asociacion_juvenil_otro: responses.asociacion_juvenil_otro || null,
      };
      
      const { error } = await supabase.from("respuestas").insert([dataToSubmit]);

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
      <header className="sticky top-0 z-50 header-dark border-b border-[#2D2D2D]">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-white font-bold">NanoEncuestaBC</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-[#999999] hover:text-white"
          >
            Cerrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#999999]">Pregunta {currentStep + 1} de {steps.length}</span>
            <span className="text-sm text-[#C41E3A] font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#2D2D2D] rounded-full h-2">
            <div
              className="bg-[#C41E3A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
          <div className="liquid-glass p-8 rounded-2xl border border-[#2D2D2D]">
            <h2 className="text-2xl font-bold text-white mb-6">{currentStepData.title}</h2>

            {/* Input Fields */}
            <div className="space-y-4">
              {currentStepData.type === "text" && (
                <input
                  type="text"
                  value={responses[currentStepData.key as keyof NanoSurveyResponse] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full bg-[#0F1419] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C41E3A]"
                />
              )}

              {currentStepData.type === "select" && (
                <div className="space-y-3">
                  <select
                    value={responses[currentStepData.key as keyof NanoSurveyResponse] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full bg-[#0F1419] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C41E3A]"
                  >
                    <option value="">Selecciona una opcion...</option>
                    {currentStepData.key === "provincia" && PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    {currentStepData.key === "comunidad_autonoma" && CCAA.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {(currentStepData.key.includes("voto_")) && (
                      <>
                        {Object.entries(PARTIES_GENERAL).map(([key, party]) => (
                          <option key={key} value={party.name}>{party.name}</option>
                        ))}
                        <option value="OTRO">Otro (especificar)</option>
                      </>
                    )}
                    {currentStepData.key === "asociacion_juvenil" && (
                      <>
                        {Object.entries(YOUTH_ASSOCIATIONS).map(([key, assoc]) => (
                          <option key={key} value={assoc.name}>{assoc.name}</option>
                        ))}
                        <option value="OTRO">Otro (especificar)</option>
                      </>
                    )}
                  </select>
                  {showOtroInput && (
                    <input
                      type="text"
                      value={responses[`${currentStepData.key}_otro` as keyof NanoSurveyResponse] || ""}
                      onChange={(e) => handleOtroAnswer(e.target.value)}
                      placeholder="Especifica tu opcion..."
                      className="w-full bg-[#0F1419] border border-[#C41E3A] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C41E3A]"
                    />
                  )}
                </div>
              )}

              {currentStepData.type === "slider" && (
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={responses[currentStepData.key as keyof NanoSurveyResponse] || 0}
                    onChange={(e) => handleAnswer(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#2D2D2D] rounded-lg appearance-none cursor-pointer accent-[#C41E3A]"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#999999]">0 (Muy malo)</span>
                    <span className="text-2xl font-bold text-[#C41E3A]">{responses[currentStepData.key as keyof NanoSurveyResponse] || 0}</span>
                    <span className="text-sm text-[#999999]">10 (Muy bueno)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="border-[#2D2D2D] text-[#999999] hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white flex-1"
              >
                {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white flex-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

