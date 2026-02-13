import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CooldownModalProps {
  isOpen: boolean;
  remainingMinutes: number;
}

export default function CooldownModal({ isOpen, remainingMinutes }: CooldownModalProps) {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(remainingMinutes);
    setRotation(0);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      // Rotar el reloj 6 grados por segundo (360 / 60 = 6)
      setRotation((prev) => (prev + 6) % 360);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingMinutes]);

  const totalSeconds = timeLeft * 60;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">⏳ Cooldown Activo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Reloj Interactivo */}
          <div className="relative w-48 h-48">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"></div>

            {/* Marcas del reloj */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 100 + 85 * Math.cos(angle);
                const y1 = 100 + 85 * Math.sin(angle);
                const x2 = 100 + 95 * Math.cos(angle);
                const y2 = 100 + 95 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Manecilla de minutos */}
            <div
              className="absolute w-1 h-20 bg-white rounded-full left-1/2 top-1/4 origin-bottom transform -translate-x-1/2 transition-transform"
              style={{
                transform: `translateX(-50%) rotate(${(minutes * 6) % 360}deg)`,
              }}
            ></div>

            {/* Manecilla de segundos */}
            <div
              className="absolute w-0.5 h-24 bg-red-400 rounded-full left-1/2 top-1/3 origin-bottom transform -translate-x-1/2 transition-transform"
              style={{
                transform: `translateX(-50%) rotate(${(seconds * 6) % 360}deg)`,
              }}
            ></div>

            {/* Centro del reloj */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Texto de tiempo */}
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="text-gray-300 text-sm">
              Debes esperar antes de votar nuevamente
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                style={{
                  width: `${((remainingMinutes * 60 - totalSeconds) / (remainingMinutes * 60)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Mensaje */}
          <p className="text-center text-gray-400 text-sm max-w-xs">
            Vuelve en {minutes} minuto{minutes !== 1 ? 's' : ''} y {seconds} segundo{seconds !== 1 ? 's' : ''} para participar nuevamente
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
