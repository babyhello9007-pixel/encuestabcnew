import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Primaria {
  id: number;
  nombre: string;
  descripcion: string;
  partido: string;
  estado: string;
  activa: boolean;
  color_primario?: string;
  color_secundario?: string;
  logo_url?: string;
}

interface Candidato {
  id: number;
  primaria_id: number;
  nombre: string;
  descripcion: string;
  foto_url: string;
  imagen_url?: string;
}

export default function Primarias() {
  const [, setLocation] = useLocation();
  const [primarias, setPrimarias] = useState<Primaria[]>([]);
  const [selectedPrimaria, setSelectedPrimaria] = useState<Primaria | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);
  const [userIP, setUserIP] = useState<string>("");
  const [votosRegistrados, setVotosRegistrados] = useState<Record<number, boolean>>({});

  // Cargar candidatos de una primaria optimizado con useCallback
  const fetchCandidatos = useCallback(async (primariaId: number) => {
    try {
      const { data, error } = await supabase
        .from("candidatos_primaria")
        .select("*")
        .eq("primaria_id", primariaId)
        .order("orden", { ascending: true });

      if (error) throw error;
      setCandidatos(data || []);
    } catch (error) {
      console.error("Error fetching candidatos:", error);
      toast.error("Error al cargar los candidatos");
    }
  }, []);

  // Obtener IP del usuario
  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        console.error("Error getting IP:", error);
        setUserIP("unknown");
      }
    };
    getIP();
  }, []);

  // Cargar primarias activas al montar el componente
  useEffect(() => {
    const fetchPrimarias = async () => {
      try {
        const { data, error } = await supabase
          .from("primarias_activas")
          .select("*");

        if (error) throw error;
        setPrimarias(data || []);

        if (data && data.length > 0) {
          setSelectedPrimaria(data[0]);
          await fetchCandidatos(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching primarias:", error);
        toast.error("Error al cargar las primarias");
      } finally {
        setLoading(false);
      }
    };

    fetchPrimarias();
  }, [fetchCandidatos]);

  // Cambiar primaria seleccionada
  const handleSelectPrimaria = async (primaria: Primaria) => {
    setSelectedPrimaria(primaria);
    await fetchCandidatos(primaria.id);
  };

  // Registrar voto
  const handleVotar = async (candidatoId: number) => {
    if (!selectedPrimaria || !userIP) {
      toast.error("No se pudo registrar el voto");
      return;
    }

    if (votosRegistrados[selectedPrimaria.id]) {
      toast.error("Ya has votado en esta primaria");
      return;
    }

    setVotando(true);
    try {
      const { data, error } = await supabase.rpc("registrar_voto_primaria", {
        p_primaria_id: selectedPrimaria.id,
        p_candidato_id: candidatoId,
        p_usuario_ip: userIP,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("¡Voto registrado correctamente!");
        setVotosRegistrados((prev) => ({
          ...prev,
          [selectedPrimaria.id]: true,
        }));
      } else {
        toast.error(data?.message || "Error al registrar el voto");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error al registrar el voto");
    } finally {
      setVotando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C41E3A] mx-auto mb-4" />
          <p className="text-[#A3A3A3]">Cargando primarias...</p>
        </div>
      </div>
    );
  }

  if (!selectedPrimaria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
        <div className="text-center">
          <p className="text-[#A3A3A3] mb-4">No hay primarias activas en este momento</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#C41E3A] hover:bg-[#A01830] text-white transition-colors"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = selectedPrimaria.color_primario || "#C41E3A";
  const secondaryColor = selectedPrimaria.color_secundario || "#A01830";
  const yaVoto = votosRegistrados[selectedPrimaria.id];

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]"
      style={{ 
        "--primary": primaryColor, 
        "--secondary": secondaryColor 
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E0D5CC]/20 bg-black/50 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-3">
            {selectedPrimaria.logo_url && (
              <img src={selectedPrimaria.logo_url} alt="Party Logo" className="h-8 w-8 object-contain" />
            )}
            <img src="/manus-storage/batalla-cultural-logo-20260830_df309405.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>
              Primarias BC
            </h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12 px-4 mx-auto">
        {/* Selector de primarias */}
        {primarias.length > 1 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Selecciona una primaria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primarias.map((primaria) => {
                const isCurrent = selectedPrimaria.id === primaria.id;
                const pColor = primaria.color_primario || "#C41E3A";
                return (
                  <button
                    key={primaria.id}
                    onClick={() => handleSelectPrimaria(primaria)}
                    className="p-4 rounded-lg transition-all border-2 text-left bg-white/5 backdrop-blur-sm hover:bg-white/10"
                    style={{
                      borderColor: pColor,
                      backgroundColor: isCurrent ? `${pColor}20` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {primaria.logo_url && (
                        <img src={primaria.logo_url} alt="Party Logo" className="h-6 w-6 object-contain" />
                      )}
                      <h3 className="font-semibold text-white">{primaria.nombre}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{primaria.partido}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Información de la primaria */}
        <div className="mb-12">
          <div 
            className="p-8 rounded-xl mb-8 bg-white/5 backdrop-blur-sm border-2" 
            style={{ borderColor: "var(--primary)" }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedPrimaria.nombre}
            </h2>
            <p className="text-gray-300 mb-4">{selectedPrimaria.descripcion}</p>
            <div className="flex items-center gap-4">
              <span 
                className="inline-block px-4 py-2 text-white rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {selectedPrimaria.partido}
              </span>
              <span className="inline-block px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-semibold border border-green-500/20">
                Activa
              </span>
            </div>
          </div>

          {/* Candidatos */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Candidatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatos.map((candidato) => (
                <div
                  key={candidato.id}
                  className="rounded-xl hover:shadow-2xl transition-all overflow-hidden bg-white/5 backdrop-blur-sm border-2 flex flex-col justify-between"
                  style={{ borderColor: "var(--primary)" }}
                >
                  <div>
                    {(candidato.imagen_url || candidato.foto_url) && (
                      <img
                        src={candidato.imagen_url || candidato.foto_url}
                        alt={candidato.nombre}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                    )}
                    
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {candidato.nombre}
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        {candidato.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      onClick={() => handleVotar(candidato.id)}
                      disabled={votando || yaVoto}
                      className="w-full text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: yaVoto ? "#4B5563" : "var(--primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!yaVoto) e.currentTarget.style.backgroundColor = "var(--secondary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!yaVoto) e.currentTarget.style.backgroundColor = "var(--primary)";
                      }}
                    >
                      {votando ? "Procesando..." : yaVoto ? "Ya has votado" : "Votar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md mt-auto">
        <div className="container py-6 text-center text-sm text-gray-500 mx-auto px-4">
          <p>Primarias Batalla Cultural © {new Date().getFullYear()} | Voto anónimo y seguro</p>
        </div>
      </footer>
    </div>
  );
}
