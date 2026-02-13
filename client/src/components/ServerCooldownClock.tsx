import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';

interface ServerCooldownClockProps {
  isOpen: boolean;
  remainingMinutes: number;
  onCooldownComplete?: () => void;
}

export default function ServerCooldownClock({
  isOpen,
  remainingMinutes,
  onCooldownComplete,
}: ServerCooldownClockProps) {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes * 60); // en segundos
  const [serverTime, setServerTime] = useState<number | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);

  // Obtener tiempo del servidor
  const { data: timeData } = trpc.time.getCurrentTime.useQuery(undefined, {
    enabled: isOpen && !serverTime,
    refetchInterval: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    // Obtener tiempo del servidor en la primera carga
    if (timeData && !serverTime) {
      const now = timeData.timestamp;
      setServerTime(now);
      // Calcular cuándo termina el cooldown
      const endTime = now + remainingMinutes * 60 * 1000;
      setCooldownEndTime(endTime);
    }
  }, [timeData, isOpen, serverTime, remainingMinutes]);

  // Actualizar el contador cada segundo
  useEffect(() => {
    if (!isOpen || !serverTime || !cooldownEndTime) return;

    const interval = setInterval(() => {
      // Calcular tiempo restante basado en tiempo del servidor
      const now = Date.now();
      const remaining = Math.max(0, cooldownEndTime - now);
      const secondsLeft = Math.ceil(remaining / 1000);

      setTimeLeft(secondsLeft);

      // Si el cooldown terminó
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (onCooldownComplete) {
          onCooldownComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, serverTime, cooldownEndTime, onCooldownComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isComplete = timeLeft <= 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isComplete ? '✅ ¡Disponible!' : '⏳ Cooldown Activo'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Reloj Digital */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"></div>

            {/* Contador Digital */}
            <div className="relative z-10 text-center">
              <div className="text-6xl font-bold text-white font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Barra de progreso circular */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              {/* Círculo de fondo */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
              />
              {/* Círculo de progreso */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 95}`}
                strokeDashoffset={`${2 * Math.PI * 95 * (1 - timeLeft / (remainingMinutes * 60))}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
                transform="rotate(-90 100 100)"
              />
            </svg>
          </div>

          {/* Texto de estado */}
          <div className="text-center space-y-2">
            {isComplete ? (
              <>
                <p className="text-green-400 text-lg font-semibold">¡Puedes votar ahora!</p>
                <p className="text-gray-300 text-sm">El cooldown ha terminado</p>
              </>
            ) : (
              <>
                <p className="text-white text-lg font-semibold">
                  Debes esperar antes de votar nuevamente
                </p>
                <p className="text-gray-300 text-sm">
                  Vuelve en {minutes} minuto{minutes !== 1 ? 's' : ''} y {seconds} segundo
                  {seconds !== 1 ? 's' : ''} para participar nuevamente
                </p>
              </>
            )}
          </div>

          {/* Información de sincronización */}
          <div className="text-xs text-gray-400 text-center">
            <p>Tiempo sincronizado con servidor</p>
            <p>No se puede manipular el contador</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
