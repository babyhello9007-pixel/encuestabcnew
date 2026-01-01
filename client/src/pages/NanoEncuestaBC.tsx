import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS, LEADERS, PROVINCES, CCAA } from "@/lib/surveyData";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeProvinceName } from "@/lib/provinceNormalizer";
import { getCCAAFromProvince, isProvinceInCCAA, getProvincesInCCAA } from "@/lib/provinceToCAA";
import { getLeaderOptions } from "@/lib/leadersData";
import ReviewNanoEncuesta from "@/components/ReviewNanoEncuesta";
import Footer from "@/components/Footer";

interface NanoSurveyResponse {
  edad?: string;
  provincia?: string;
  comunidad_autonoma?: string;
  nacionalidad?: string;
  voto_generales?: string;
  voto_autonomicas?: string;
  voto_municipales?: string;
  voto_europeas?: string;
  nota_ejecutivo?: number;
  valoracion_feijoo?: number;
  valoracion_sanchez?: number;
  valoracion_abascal?: number;
  valoracion_alvise?: number;
  valoracion_yolanda?: number;
  valoracion_irene?: number;
  valoracion_ayuso?: number;
  valoracion_buxade?: number;
  posicion_ideologica?: number;
  asociacion_juvenil?: string;
  lider_partido?: string;
  created_at?: string;
}

export default function NanoEncuestaBC() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<NanoSurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showOtroInput, setShowOtroInput] = useState(false);
  const [showCustomLeaderInput, setShowCustomLeaderInput] = useState(false);
  const [ccaaWarning, setCCAAWarning] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { title: "Edad", key: "edad", type: "text" },
    { title: "Comunidad Autónoma", key: "comunidad_autonoma", type: "select" },
    { title: "Provincia", key: "provincia", type: "select" },
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
    { title: "Tu Posición Ideológica", key: "posicion_ideologica", type: "buttons" },
    { title: "Asociación Juvenil", key: "asociacion_juvenil", type: "select" },
    { title: "Líder de tu Partido", key: "lider_partido", type: "leader" },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Obtener provincias filtradas por CCAA seleccionada
  const getFilteredProvinces = () => {
    if (currentStepData.key === 'provincia' && responses.comunidad_autonoma) {
      const filtered = getProvincesInCCAA(responses.comunidad_autonoma as string);
      return filtered.length > 0 ? filtered : PROVINCES;
    }
    return PROVINCES;
  };

  // Validar si el campo actual esta completo
  const isCurrentFieldComplete = () => {
    const currentValue = responses[currentStepData.key as keyof NanoSurveyResponse];
    
    if (currentStepData.type === 'text') {
      return currentValue && String(currentValue).trim().length > 0;
    }
    if (currentStepData.type === 'select') {
      return currentValue && String(currentValue).length > 0;
    }
    if (currentStepData.type === 'slider' || currentStepData.type === 'buttons') {
      return currentValue !== undefined && currentValue !== null && currentValue !== '';
    }
    return false;
  };

  const handleAnswer = (value: any) => {
    setResponses(prev => ({ ...prev, [currentStepData.key]: value }));
    setShowOtroInput(value === "OTRO");
    
    // Autocompletado de CCAA cuando se selecciona provincia
    if (currentStepData.key === 'provincia') {
      const ccaa = getCCAAFromProvince(value);
      if (ccaa) {
        setResponses(prev => ({ ...prev, comunidad_autonoma: ccaa }));
        setCCAAWarning(null);
      }
    }
    
    // Validacion de consistencia CCAA-Provincia
    if (currentStepData.key === 'comunidad_autonoma') {
      const provincia = responses.provincia as string;
      if (provincia && !isProvinceInCCAA(provincia, value)) {
        setCCAAWarning(`Advertencia: ${provincia} no pertenece a ${value}. Por favor, selecciona una provincia valida.`);
      } else {
        setCCAAWarning(null);
      }
    }
    
    if (currentStepData.key === 'provincia') {
      const ccaa = responses.comunidad_autonoma as string;
      if (ccaa && !isProvinceInCCAA(value, ccaa)) {
        setCCAAWarning(`Advertencia: ${value} no pertenece a ${ccaa}. Por favor, selecciona una CCAA valida.`);
      } else {
        setCCAAWarning(null);
      }
    }
  };

  const handleOtroAnswer = (value: string) => {
    // Cuando el usuario selecciona "Otro", guarda solo el texto personalizado
    setResponses(prev => ({ ...prev, [currentStepData.key]: value }));
  };

  // Limpiar el input de "Otro" cuando se deselecciona
  const handleSelectChange = (value: string) => {
    if (value !== "OTRO") {
      // Si se deselecciona "Otro", limpiar el campo
      setShowOtroInput(false);
      setResponses(prev => ({ ...prev, [currentStepData.key]: value }));
    } else {
      // Si se selecciona "Otro", mostrar el input
      setShowOtroInput(true);
      // Limpiar el campo para que el usuario escriba desde cero
      setResponses(prev => ({ ...prev, [currentStepData.key]: "" }));
    }
  };

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Al llegar al final, mostrar pantalla de revisión
        setShowReview(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setIsAnimating(false);
    }, 300);
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
      'posicion_ideologica',
      'asociacion_juvenil',
      'lider_partido'
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
    // Nota: Los campos de voto solo contienen el texto personalizado sin prefijo
    // No hay validación adicional necesaria ya que el campo debe tener contenido para pasar la validación general

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        edad: responses.edad ? parseInt(responses.edad) : 18,
        provincia: normalizeProvinceName(responses.provincia) || null,
        ccaa: responses.comunidad_autonoma || null,
        nacionalidad: responses.nacionalidad || null,
        voto_generales: responses.voto_generales || null,
        voto_autonomicas: responses.voto_autonomicas || null,
        voto_municipales: responses.voto_municipales || null,
        voto_europeas: responses.voto_europeas || null,
        nota_ejecutivo: responses.nota_ejecutivo || null,
        val_feijoo: responses.valoracion_feijoo || 0,
        val_sanchez: responses.valoracion_sanchez || 0,
        val_abascal: responses.valoracion_abascal || 0,
        val_alvise: responses.valoracion_alvise || 0,
        val_yolanda_diaz: responses.valoracion_yolanda || 0,
        val_irene_montero: responses.valoracion_irene || 0,
        val_ayuso: responses.valoracion_ayuso || 0,
        val_buxade: responses.valoracion_buxade || 0,
        posicion_ideologica: responses.posicion_ideologica || null,
        voto_asociacion_juvenil: responses.asociacion_juvenil || null,
      };
      
      const { error } = await supabase.from("respuestas").insert([dataToSubmit]);

      if (error) {
        toast.error("Error al enviar la encuesta. Por favor, intenta de nuevo.");
        console.error(error);
        setIsSubmitting(false);
        return;
      }

      if (responses.lider_partido) {
        const { error: leaderError } = await supabase.from("lideres_preferidos").insert({
          partido: responses.voto_generales || null,
          lider_preferido: responses.lider_partido,
          es_personalizado: !getLeaderOptions(responses.voto_generales || "").some(l => l.name === responses.lider_partido),
        });

        if (leaderError) {
          console.error("Error al guardar preferencia de lider:", leaderError);
        }
      }

      setShowThankYou(true);
      toast.success("¡Gracias por tu participación!");
    } catch (error) {
      toast.error("Error al enviar la encuesta");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showReview) {
    return (
      <ReviewNanoEncuesta
        responses={responses}
        onEdit={() => {
          setShowReview(false);
          setCurrentStep(0);
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
              <h1 className="text-foreground font-semibold">NanoEncuestaBC</h1>
            </div>
            {/* Resumen de progreso */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Completados:</span>
              <span className="text-primary font-semibold">
                {Object.values(responses).filter(v => v !== undefined && v !== null && v !== '').length}/{steps.length}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            Cerrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground font-medium">Pregunta {currentStep + 1} de {steps.length}</span>
            <span className="text-sm text-primary font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Indicador de pasos completados */}
          <div className="flex gap-1 flex-wrap">
            {steps.map((step, index) => {
              const isCompleted = responses[step.key as keyof NanoSurveyResponse] !== undefined && responses[step.key as keyof NanoSurveyResponse] !== null && responses[step.key as keyof NanoSurveyResponse] !== '';
              const isCurrent = index === currentStep;
              return (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${isCurrent ? 'bg-primary' : isCompleted ? 'bg-green-500' : 'bg-border'}`}
                  title={`${step.title}: ${isCompleted ? 'Completado' : 'Pendiente'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
          <div className={`liquid-glass p-8 transition-all duration-300 ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <h2 className="text-3xl font-bold text-foreground mb-6">{currentStepData.title}</h2>

            {/* Advertencia de CCAA */}
            {ccaaWarning && (
              <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 mb-6">
                <p className="font-semibold">{ccaaWarning}</p>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              {currentStepData.type === "text" && (
                <input
                  type="text"
                  value={responses[currentStepData.key as keyof NanoSurveyResponse] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="input-modern w-full"
                />
              )}

              {currentStepData.type === "select" && (
                <div className="space-y-3">
                  <select
                    value={responses[currentStepData.key as keyof NanoSurveyResponse] || ""}
                    onChange={(e) => {
                      // Si es un campo de voto o asociacion juvenil, usar handleSelectChange para manejar "Otro"
                      if ((currentStepData.key.includes("voto_") || currentStepData.key === "asociacion_juvenil")) {
                        handleSelectChange(e.target.value);
                      } else {
                        handleAnswer(e.target.value);
                      }
                    }}
                    className="input-modern w-full"
                  >
                    <option value="">Selecciona una opcion...</option>
                    {currentStepData.key === "provincia" && getFilteredProvinces().map(p => (
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
                      value={responses[currentStepData.key as keyof NanoSurveyResponse]?.toString() || ""}
                      onChange={(e) => handleOtroAnswer(e.target.value)}
                      placeholder="Especifica tu opcion..."
                      className="input-modern w-full border-primary"
                    />
                  )}
                </div>
              )}

              {currentStepData.type === "slider" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-11">
                    {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                      const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === num;
                      return (
                        <button
                          key={num}
                          onClick={() => handleAnswer(num)}
                          className={`py-3 px-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                            isSelected
                              ? "bg-primary text-white shadow-lg scale-105"
                              : "bg-border text-foreground hover:bg-border/80 hover:scale-105"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">0 (Muy malo)</span>
                    <span className="text-2xl font-bold text-primary">{responses[currentStepData.key as keyof NanoSurveyResponse] || 0}</span>
                    <span className="text-sm text-muted-foreground">10 (Muy bueno)</span>
                  </div>
                </div>
              )}

              {currentStepData.type === "buttons" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                      const isSelected = responses[currentStepData.key as keyof NanoSurveyResponse] === num;
                      return (
                        <button
                          key={num}
                          onClick={() => handleAnswer(num)}
                          className={`py-3 px-2 rounded-lg font-semibold transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary text-white shadow-lg scale-105'
                              : 'bg-border text-foreground hover:bg-border/80 hover:scale-105'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
                    <span>Izquierda</span>
                    <span className="text-lg font-bold text-primary">{responses[currentStepData.key as keyof NanoSurveyResponse] || '-'}</span>
                    <span>Derecha</span>
                  </div>
                </div>
              )}

              {currentStepData.type === "leader" && responses.voto_generales && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona el lider que prefieres para <strong>{responses.voto_generales}</strong>
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getLeaderOptions(responses.voto_generales).map((leader) => {
                      const isSelected = responses.lider_partido === leader.name;
                      const partyData = Object.values(PARTIES_GENERAL).find(p => p.name === responses.voto_generales);
                      const partyColor = partyData?.color || '#C41E3A';
                      
                      return (
                        <button
                          key={leader.name}
                          onClick={() => {
                            handleAnswer(leader.name);
                            setShowCustomLeaderInput(false);
                          }}
                          style={{
                            borderColor: isSelected ? partyColor : '#d1d5db',
                            backgroundColor: isSelected ? `${partyColor}15` : '#ffffff',
                            color: isSelected ? partyColor : '#374151',
                          }}
                          className="w-full p-4 rounded-lg border-2 transition-all text-left font-medium hover:shadow-md"
                        >
                          {leader.name}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setShowCustomLeaderInput(!showCustomLeaderInput)}
                      style={{
                        borderColor: showCustomLeaderInput ? '#9333ea' : '#d1d5db',
                        backgroundColor: showCustomLeaderInput ? '#9333ea15' : '#ffffff',
                        color: showCustomLeaderInput ? '#9333ea' : '#374151',
                      }}
                      className="w-full p-4 rounded-lg border-2 transition-all text-left font-medium hover:shadow-md"
                    >
                      + Otro (especificar)
                    </button>
                  </div>
                  {showCustomLeaderInput && (
                    <input
                      type="text"
                      placeholder="Escribe el nombre del lider..."
                      value={responses.lider_partido?.toString() || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="input-modern w-full border-primary"
                    />
                  )}
                </div>
              )}

              {currentStepData.type === "leader" && !responses.voto_generales && (
                <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 font-semibold">
                    Por favor, selecciona primero tu voto en Elecciones Generales para ver los lideres disponibles.
                  </p>
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
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isCurrentFieldComplete()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
