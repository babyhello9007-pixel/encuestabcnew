import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LeaderSelection } from "@/components/LeaderSelection";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LeaderSurvey() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLeaderSelected = async (party: string, leader: string, isCustom: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("lideres_preferidos").insert({
        partido: party,
        lider_preferido: leader,
        es_personalizado: isCustom,
      });

      if (error) {
        console.error("Error saving leader preference:", error);
        toast.error("Error al guardar tu preferencia");
        setLoading(false);
        return;
      }

      toast.success("Tu preferencia de lider ha sido registrada!");
      setSubmitted(true);

      setTimeout(() => {
        setLocation("/resultados");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al procesar tu respuesta");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-[#D5D5D7] bg-white/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-[#1D1D1F]">Batalla Cultural</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-[#D5D5D7] text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-[#1D1D1F] leading-tight tracking-tight">
              ¿Quién quieres que sea el <span className="text-[#C41E3A]">líder de tu partido?</span>
            </h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto">
              Selecciona tu partido político y elige quién crees que debería liderarlo.
            </p>
          </div>

          {submitted && (
            <div className="mb-8 p-8 bg-[#F5F5F7] border-2 border-[#C41E3A] rounded-2xl text-center space-y-6">
              <div className="space-y-2">
                <p className="text-[#1D1D1F] font-semibold text-lg">
                  ✓ Gracias por tu participación
                </p>
                <p className="text-[#555555]">
                  Tu voto ha sido registrado correctamente.
                </p>
              </div>
              <Button
                onClick={() => setLocation("/resultados")}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white font-semibold px-8 py-3 rounded-lg"
              >
                Ver Resultados de Líderes
              </Button>
            </div>
          )}

          {!submitted && (
            <div className="frosted-glass p-10 rounded-2xl mb-12">
              <LeaderSelection onLeaderSelected={handleLeaderSelected} loading={loading} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="frosted-glass p-8 rounded-2xl space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
                <span className="text-2xl">🗳️</span>
              </div>
              <h3 className="font-semibold text-[#1D1D1F] text-lg">Tu voz importa</h3>
              <p className="text-sm text-[#555555]">
                Participa en esta encuesta y ayuda a definir quién debería liderar los partidos políticos españoles.
              </p>
            </div>

            <div className="frosted-glass p-8 rounded-2xl space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-[#1D1D1F] text-lg">Resultados en vivo</h3>
              <p className="text-sm text-[#555555]">
                Visualiza los resultados en tiempo real y ve qué líderes prefieren los españoles.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#D5D5D7] bg-[#F5F5F7]">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}
