import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Ministry {
  id: string;
  name: string;
  minister: string;
  ministerImageUrl?: string;
  color?: string;
}

interface GovernmentBuilderProps {
  partyName: string;
  partyColor: string;
  candidateName: string;
  onClose?: () => void;
}

const DEFAULT_MINISTRIES = [
  'Presidencia',
  'Vicepresidencia',
  'Hacienda',
  'Defensa',
  'Interior',
  'Asuntos Exteriores',
  'Justicia',
  'Educación',
  'Sanidad',
  'Trabajo',
  'Transportes',
  'Medio Ambiente',
  'Agricultura',
  'Industria',
  'Vivienda',
  'Igualdad',
  'Cultura',
  'Deporte',
];

export default function GovernmentBuilder({ partyName, partyColor, candidateName, onClose }: GovernmentBuilderProps) {
  const [ministries, setMinistries] = useState<Ministry[]>(
    DEFAULT_MINISTRIES.map((m, i) => ({
      id: `min-${i}`,
      name: m,
      minister: '',
      ministerImageUrl: '',
      color: partyColor,
    }))
  );
  const [governmentName, setGovernmentName] = useState(`Gobierno de ${candidateName}`);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateMinister = (id: string, minister: string) => {
    setMinistries(prev => prev.map(m => m.id === id ? { ...m, minister } : m));
  };
  const updateMinisterImage = (id: string, ministerImageUrl: string) => {
    setMinistries(prev => prev.map(m => m.id === id ? { ...m, ministerImageUrl } : m));
  };

  const addMinistry = () => {
    const newId = `min-${Date.now()}`;
    setMinistries(prev => [...prev, {
      id: newId,
      name: '',
      minister: '',
      ministerImageUrl: '',
      color: partyColor,
    }]);
  };

  const removeMinistry = (id: string) => {
    setMinistries(prev => prev.filter(m => m.id !== id));
  };

  const generateInfography = async () => {
    setGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas no disponible');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Contexto de canvas no disponible');

      // Dimensiones
      const width = 1600;
      const height = 900;
      canvas.width = width;
      canvas.height = height;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Franja superior con color del partido
      ctx.fillStyle = partyColor;
      ctx.fillRect(0, 0, width, 80);

      // Cargar logo presidencia
      let logoPresidenciaB64 = '';
      try {
        const logoResponse = await fetch('/logo-presidencia-blanco.png');
        const blob = await logoResponse.blob();
        logoPresidenciaB64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Logo presidencia no disponible');
      }

      // Dibujar logo presidencia
      if (logoPresidenciaB64) {
        const img = new window.Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 40, 15, 60, 50);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logoPresidenciaB64;
        });
      }

      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(governmentName, 120, 55);

      // Subtítulo
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(`Candidato: ${candidateName} | Partido: ${partyName}`, 120, 75);

      // Tabla de ministerios
      const startY = 120;
      const rowHeight = 46;
      const colWidth = width / 2;
      const padding = 20;

      ctx.fillStyle = '#f5f5f5';
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = partyColor;
      ctx.fillText('MINISTERIO', padding, startY + 20);
      ctx.fillText('MINISTRO/A', padding + colWidth, startY + 20);

      let currentY = startY + rowHeight;

      for (const [index, ministry] of ministries.entries()) {
        // Línea separadora
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();

        // Fondo alternado
        if (index % 2 === 0) {
          ctx.fillStyle = '#f9f9f9';
          ctx.fillRect(padding, currentY, width - padding * 2, rowHeight);
        }

        // Texto ministerio
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.fillText(ministry.name, padding + 10, currentY + 25);

        // Avatar ministro por URL (si existe)
        if (ministry.ministerImageUrl) {
          const avatar = new window.Image();
          await new Promise<void>((resolve) => {
            avatar.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(padding + colWidth + 18, currentY + 18, 10, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(avatar, padding + colWidth + 8, currentY + 8, 20, 20);
              ctx.restore();
              resolve();
            };
            avatar.onerror = () => resolve();
            avatar.crossOrigin = "anonymous";
            avatar.src = ministry.ministerImageUrl || "";
          });
        }

        // Texto ministro
        ctx.fillText(ministry.minister || '-', padding + colWidth + 10, currentY + 25);

        currentY += rowHeight;
      }

      // Pie de página
      ctx.fillStyle = '#999999';
      ctx.font = '10px Arial';
      ctx.fillText(`Generado por Batalla Cultural - ${new Date().toLocaleDateString('es-ES')}`, padding, height - 20);

      // Descargar
      canvas.toBlob(blob => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `gobierno-${candidateName.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Infografía descargada correctamente');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generando infografía:', error);
      toast.error('Error al generar la infografía');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Constructor de Gobierno</h3>
          <p className="text-sm text-gray-400 mt-1">
            {partyName} - Candidato: {candidateName}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Nombre del gobierno */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Gobierno</label>
        <Input
          value={governmentName}
          onChange={(e) => setGovernmentName(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
          placeholder="Ej: Gobierno de España"
        />
      </div>

      {/* Tabla de ministerios */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 sticky top-0 bg-gray-950 p-3 rounded-lg border border-gray-700">
          <div className="font-semibold text-gray-300">Ministerio</div>
          <div className="font-semibold text-gray-300">Ministro/a</div>
          <div className="font-semibold text-gray-300">URL imagen</div>
        </div>

        {ministries.map((ministry) => (
          <div key={ministry.id} className="grid grid-cols-3 gap-4 items-center bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: ministry.color }}
              />
              <span className="text-sm text-gray-300">{ministry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={ministry.minister}
                onChange={(e) => updateMinister(ministry.id, e.target.value)}
                placeholder="Nombre del ministro/a"
                className="bg-gray-800 border-gray-600 text-white text-sm"
              />
              <button
                onClick={() => removeMinistry(ministry.id)}
                className="text-red-400 hover:text-red-300 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Input
              value={ministry.ministerImageUrl || ""}
              onChange={(e) => updateMinisterImage(ministry.id, e.target.value)}
              placeholder="https://..."
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
          </div>
        ))}
      </div>

      {/* Botón agregar ministerio */}
      <Button
        onClick={addMinistry}
        variant="outline"
        className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Ministerio
      </Button>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          onClick={generateInfography}
          disabled={generating}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Descargar Infografía PNG
            </>
          )}
        </Button>
      </div>

      {/* Canvas oculto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
