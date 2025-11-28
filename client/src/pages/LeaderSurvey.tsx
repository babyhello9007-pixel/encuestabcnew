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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      <header className="sticky top-0 z-50 header-dark border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-[#C41E3A]">Batalla Cultural</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-[#999999] text-[#999999] hover:bg-[#F5F1E8]"
          >
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] leading-tight mb-4">
              Quien quieres que sea el <span className="text-[#C41E3A]">lider de tu partido</span>?
            </h2>
            <p className="text-lg text-[#666666]">
              Selecciona tu partido politico y elige quien crees que deberia liderarlo.
            </p>
          </div>

          {submitted && (
            <div className="mb-8 p-6 bg-green-100 border-2 border-green-500 rounded-xl text-center">
              <p className="text-green-800 font-semibold text-lg">
                Gracias por tu participacion! Redirigiendo a resultados...
              </p>
            </div>
          )}

          {!submitted && (
            <div className="liquid-glass p-8 rounded-2xl">
              <LeaderSelection onLeaderSelected={handleLeaderSelected} loading={loading} />
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl space-y-3">
              <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
                <span className="text-2xl">X</span>
              </div>
              <h3 className="font-semibold text-[#2D2D2D]">Tu voz importa</h3>
              <p className="text-sm text-[#666666]">
                Participa en esta encuesta y ayuda a definir quien deberia liderar los partidos politicos.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-3">
              <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
                <span className="text-2xl">O</span>
              </div>
              <h3 className="font-semibold text-[#2D2D2D]">Resultados en vivo</h3>
              <p className="text-sm text-[#666666]">
                Visualiza los resultados en tiempo real y ve que lideres prefieren los españoles.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            III Encuesta de Batalla Cultural 2025 | Todos los datos son anonimos y publicos
          </p>
        </div>
      </footer>
    </div>
  );
}

