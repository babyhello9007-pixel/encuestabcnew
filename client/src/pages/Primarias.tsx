import { useEffect, useState } from "react";
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

  // Cargar primarias activas
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
          fetchCandidatos(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching primarias:", error);
        toast.error("Error al cargar las primarias");
      } finally {
        setLoading(false);
      }
    };

    fetchPrimarias();
  }, []);

  // Cargar candidatos de una primaria
  const fetchCandidatos = async (primariaId: number) => {
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
  };

  // Cambiar primaria seleccionada
  const handleSelectPrimaria = (primaria: Primaria) => {
    setSelectedPrimaria(primaria);
    fetchCandidatos(primaria.id);
  };

  // Registrar voto
  const handleVotar = async (candidatoId: number) => {
    if (!selectedPrimaria || !userIP) {
      toast.error("No se pudo registrar el voto");
      return;
    }

    // Verificar si ya votó
    if (votosRegistrados[selectedPrimaria.id]) {
      toast.error("Ya has votado en esta primaria");
      return;
    }

    setVotando(true);
    try {
      const { data, error } = await supabase
        .rpc("registrar_voto_primaria", {
          p_primaria_id: selectedPrimaria.id,
          p_candidato_id: candidatoId,
          p_usuario_ip: userIP,
        });

      if (error) throw error;

      if (data.success) {
        toast.success("¡Voto registrado correctamente!");
        setVotosRegistrados({
          ...votosRegistrados,
          [selectedPrimaria.id]: true,
        });
      } else {
        toast.error(data.message || "Error al registrar el voto");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C41E3A] mx-auto mb-4"></div>
          <p className="text-[#2D2D2D]">Cargando primarias...</p>
        </div>
      </div>
    );
  }

  if (!selectedPrimaria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
        <div className="text-center">
          <p className="text-[#2D2D2D] mb-4">No hay primarias activas en este momento</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#C41E3A] hover:bg-[#A01830] text-white"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = selectedPrimaria.color_primario || "#C41E3A";
  const secondaryColor = selectedPrimaria.color_secundario || "#A01830";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {selectedPrimaria.logo_url && (
              <img src={selectedPrimaria.logo_url} alt="Party Logo" className="h-8 w-8" />
            )}
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
              Primarias BC
            </h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="text-[#2D2D2D]"
          >
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12">
        {/* Selector de primarias */}
        {primarias.length > 1 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Selecciona una primaria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primarias.map((primaria) => (
                <button
                  key={primaria.id}
                  onClick={() => handleSelectPrimaria(primaria)}
                  className="p-4 rounded-lg transition-all glass-card border-2"
                  style={{
                    borderColor: primaria.color_primario || "#C41E3A",
                    backgroundColor: selectedPrimaria.id === primaria.id 
                      ? `${primaria.color_primario || "#C41E3A"}20` 
                      : "transparent"
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {primaria.logo_url && (
                      <img src={primaria.logo_url} alt="Party Logo" className="h-6 w-6" />
                    )}
                    <h3 className="font-semibold text-[#2D2D2D]">{primaria.nombre}</h3>
                  </div>
                  <p className="text-sm text-[#666666]">{primaria.partido}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Información de la primaria */}
        <div className="mb-12">
          <div className="glass-card p-8 rounded-xl mb-8" style={{ borderColor: primaryColor, borderWidth: "2px" }}>
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">
              {selectedPrimaria.nombre}
            </h2>
            <p className="text-[#666666] mb-4">{selectedPrimaria.descripcion}</p>
            <div className="flex items-center gap-4">
              <span 
                className="inline-block px-4 py-2 text-white rounded-lg text-sm font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {selectedPrimaria.partido}
              </span>
              <span className="inline-block px-4 py-2 bg-green-500 bg-opacity-10 text-green-600 rounded-lg text-sm font-semibold">
                Activa
              </span>
            </div>
          </div>

          {/* Candidatos */}
          <div>
            <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6">Candidatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatos.map((candidato) => (
                <div
                  key={candidato.id}
                  className="glass-card rounded-xl hover:shadow-lg transition-all overflow-hidden"
                  style={{ borderColor: primaryColor, borderWidth: "2px" }}
                >
                  {/* Imagen del candidato */}
                  {(candidato.imagen_url || candidato.foto_url) && (
                    <img
                      src={candidato.imagen_url || candidato.foto_url}
                      alt={candidato.nombre}
                      className="w-full h-56 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-[#2D2D2D] mb-2">
                      {candidato.nombre}
                    </h4>
                    <p className="text-sm text-[#666666] mb-4">
                      {candidato.descripcion}
                    </p>
                    <Button
                      onClick={() => handleVotar(candidato.id)}
                      disabled={votando || votosRegistrados[selectedPrimaria.id]}
                      className="w-full text-white font-semibold"
                      style={{
                        backgroundColor: votosRegistrados[selectedPrimaria.id] 
                          ? "#999999" 
                          : primaryColor,
                        opacity: votosRegistrados[selectedPrimaria.id] ? 0.6 : 1,
                        cursor: votosRegistrados[selectedPrimaria.id] ? "not-allowed" : "pointer"
                      }}
                      onMouseEnter={(e) => {
                        if (!votosRegistrados[selectedPrimaria.id]) {
                          (e.target as HTMLElement).style.backgroundColor = secondaryColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!votosRegistrados[selectedPrimaria.id]) {
                          (e.target as HTMLElement).style.backgroundColor = primaryColor;
                        }
                      }}
                    >
                      {votosRegistrados[selectedPrimaria.id]
                        ? "Ya has votado"
                        : "Votar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>Primarias Batalla Cultural © 2025 | Voto anónimo y seguro</p>
        </div>
      </footer>
    </div>
  );
}
