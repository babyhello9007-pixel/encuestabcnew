import { Loader2 } from "lucide-react";

export function LoadingAnimation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5F7] via-[#FFFFFF] to-[#F5F5F7]">
      <div className="text-center space-y-8">
        {/* Logo animado */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-[#D5D5D7] border-t-[#C41E3A] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-[#C41E3A] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
            <img 
              src="/favicon.png" 
              alt="BC Logo" 
              className="absolute inset-0 w-full h-full p-4 object-contain"
            />
          </div>
        </div>

        {/* Texto principal */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Cargando Resultados</h2>
          <p className="text-[#666666]">Obteniendo datos de la encuesta...</p>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-64 h-1 bg-[#D5D5D7] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#C41E3A] to-[#E85C5C] rounded-full animate-pulse"
            style={{
              animation: "progress 2s ease-in-out infinite"
            }}
          ></div>
        </div>

        {/* Puntos animados */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C41E3A] animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#C41E3A] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#C41E3A] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>

        {/* Mensaje de estado */}
        <div className="text-sm text-[#999999]">
          <p>Por favor espera mientras procesamos los datos...</p>
        </div>

        <style>{`
          @keyframes progress {
            0% {
              width: 0%;
            }
            50% {
              width: 100%;
            }
            100% {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
