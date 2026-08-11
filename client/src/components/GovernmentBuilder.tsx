'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  X,
  Plus,
  Download,
  Trash2,
  Search,
  RotateCcw,
  Upload,
  GripVertical,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface Minister {
  id: string;
  ministry: string;
  name: string;
  party?: string;
}

interface GovernmentBuilderProps {
  partyName: string;
  partyColor: string;
  presidentName: string;
  onClose?: () => void;
}

const DEFAULT_MINISTRIES = [
  'Presidencia',
  'Vicepresidencia Primera',
  'Vicepresidencia Segunda',
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
];

// Helper para truncar texto en Canvas
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

// 12. Componente memorizado para cada ministerio en la lista de edición
const MinisterItem = memo(function MinisterItem({
  minister,
  index,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  minister: Minister;
  index: number;
  onUpdate: (id: string, field: 'ministry' | 'name' | 'party', value: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="flex gap-3 items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition group"
    >
      {/* Handle Drag and Drop */}
      <div className="cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-white transition">
        <GripVertical size={18} />
      </div>

      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={minister.ministry}
          onChange={(e) => onUpdate(minister.id, 'ministry', e.target.value)}
          placeholder="Nombre del ministerio"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
        />
        <input
          type="text"
          value={minister.name}
          onChange={(e) => onUpdate(minister.id, 'name', e.target.value)}
          placeholder="Nombre del ministro (opcional)"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
        />
        <input
          type="text"
          value={minister.party}
          onChange={(e) => onUpdate(minister.id, 'party', e.target.value)}
          placeholder="Partido (opcional)"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
        />
      </div>

      <button
        onClick={() => onRemove(minister.id)}
        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
        title="Eliminar ministerio"
        aria-label="Eliminar ministerio"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
});

export default function GovernmentBuilder({
  partyName,
  partyColor,
  presidentName,
  onClose,
}: GovernmentBuilderProps) {
  // 13. Uso de crypto.randomUUID() para IDs estables
  const createDefaultMinisters = useCallback(
    () =>
      DEFAULT_MINISTRIES.map((m) => ({
        id: crypto.randomUUID(),
        ministry: m,
        name: '',
        party: partyName,
      })),
    [partyName]
  );

  const [ministers, setMinisters] = useState<Minister[]>(createDefaultMinisters);
  const [governmentName, setGovernmentName] = useState(`Gobierno de ${presidentName}`);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 10. Búsqueda
  const [partyLogo, setPartyLogo] = useState<HTMLImageElement | null>(null); // 11. Logo del partido
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 15. Bloqueo de scroll en body e Intercepción de tecla Escape para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) setShowPreview(false);
        else if (onClose) onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPreview, onClose]);

  // 1. Corrección de tipos en updateMinister
  const updateMinister = useCallback(
    (id: string, field: 'ministry' | 'name' | 'party', value: string) => {
      setMinisters((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  // 13. Generación de IDs con randomUUID
  const addMinistry = useCallback(() => {
    const newMinister: Minister = {
      id: crypto.randomUUID(),
      ministry: '',
      name: '',
      party: partyName,
    };
    setMinisters((prev) => [...prev, newMinister]);
  }, [partyName]);

  // 8. Confirmación al eliminar con Toast y opción de "Deshacer"
  const removeMinistry = useCallback(
    (id: string) => {
      const removedIndex = ministers.findIndex((m) => m.id === id);
      const removedItem = ministers[removedIndex];

      setMinisters((prev) => prev.filter((m) => m.id !== id));

      toast('Ministerio eliminado', {
        action: {
          label: 'Deshacer',
          onClick: () => {
            setMinisters((prev) => {
              const updated = [...prev];
              updated.splice(removedIndex, 0, removedItem);
              return updated;
            });
          },
        },
      });
    },
    [ministers]
  );

  // 9. Restaurar gabinetes predeterminados
  const resetToDefault = useCallback(() => {
    setMinisters(createDefaultMinisters());
    toast.success('Gabinete restaurado a los ministerios por defecto');
  }, [createDefaultMinisters]);

  // 11. Subir logo del partido
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => setPartyLogo(img);
      };
      reader.readAsDataURL(file);
    }
  };

  // 7. Lógica Drag & Drop
  const handleDragStart = useCallback((_: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (_: React.DragEvent, dropIndex: number) => {
      if (draggedIndex === null || draggedIndex === dropIndex) return;
      setMinisters((prev) => {
        const updated = [...prev];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, movedItem);
        return updated;
      });
      setDraggedIndex(null);
    },
    [draggedIndex]
  );

  // 2, 3, 5 y 6. Generación mejorada en Canvas
  const downloadAsImage = useCallback(async () => {
    try {
      // 3. Garantizar carga de tipografías del sistema
      await document.fonts.ready;

      // 5. Soporte Retina Display / High DPI (Scale x2)
      const scale = 2;
      const baseWidth = 1920;
      const baseHeight = 1080;

      const canvas = document.createElement('canvas');
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.scale(scale, scale);

      // Fondo Gradiente
      const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Header Banner
      ctx.fillStyle = partyColor;
      ctx.fillRect(0, 0, baseWidth, 120);

      // Logo opcional
      if (partyLogo) {
        ctx.drawImage(partyLogo, 40, 20, 80, 80);
      }

      // Título del Gobierno
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(governmentName, baseWidth / 2, 70);

      // Presidente
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Presidente: ${presidentName}`, baseWidth / 2, 160);

      // Grid de Ministerios
      const cols = 3;
      const rows = Math.ceil(ministers.length / cols);
      const cellWidth = baseWidth / cols;
      const cellHeight = (baseHeight - 200) / (rows || 1);

      ministers.forEach((m, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * cellWidth;
        const y = 200 + row * cellHeight;

        // Card background & Border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x + 10, y + 10, cellWidth - 20, cellHeight - 20);
        ctx.strokeStyle = partyColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, y + 10, cellWidth - 20, cellHeight - 20);

        ctx.textAlign = 'left';
        const maxTextWidth = cellWidth - 40;

        // 2. Control de desbordamiento (Text Overflow) mediante truncateText
        ctx.fillStyle = partyColor;
        ctx.font = 'bold 16px sans-serif';
        const ministryText = truncateText(ctx, m.ministry || 'Sin nombre', maxTextWidth);
        ctx.fillText(ministryText, x + 20, y + 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        const nameText = truncateText(ctx, m.name || '(Vacante)', maxTextWidth);
        ctx.fillText(nameText, x + 20, y + 75);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        const partyText = truncateText(ctx, m.party || partyName, maxTextWidth);
        ctx.fillText(partyText, x + 20, y + 100);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${governmentName.toLowerCase().replace(/\s+/g, '-')}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Gobierno descargado en alta resolución');
        }
      }, 'image/png');
    } catch (err) {
      toast.error('Error al generar la imagen');
      console.error(err);
    }
  }, [governmentName, ministers, partyColor, partyLogo, partyName, presidentName]);

  // 10. Filtrado por búsqueda
  const filteredMinisters = useMemo(() => {
    if (!searchQuery.trim()) return ministers;
    const query = searchQuery.toLowerCase();
    return ministers.filter(
      (m) =>
        m.ministry.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query) ||
        (m.party && m.party.toLowerCase().includes(query))
    );
  }, [ministers, searchQuery]);

  // Modal de Previsualización
  if (showPreview) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      >
        <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-white/10 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{governmentName}</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 flex-1">
            <div className="mb-8 pb-8 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-lg text-white/80">
                  <span className="font-semibold text-white">Presidente:</span>{' '}
                  {presidentName}
                </p>
                <p className="text-lg text-white/80">
                  <span className="font-semibold text-white">Partido:</span> {partyName}
                </p>
              </div>
              {partyLogo && (
                <img
                  src={partyLogo.src}
                  alt="Logo"
                  className="w-16 h-16 object-contain rounded-lg bg-white/5 p-2"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ministers.map((m) => (
                <div
                  key={m.id}
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                >
                  <div
                    className="text-sm font-semibold uppercase mb-2 truncate"
                    style={{ color: partyColor }}
                  >
                    {m.ministry || 'Sin especificar'}
                  </div>
                  <div className="text-lg font-bold text-white mb-1 truncate">
                    {m.name || '(Vacante)'}
                  </div>
                  <div className="text-sm text-white/50 truncate">
                    {m.party || partyName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 p-6 flex gap-3">
            <button
              onClick={downloadAsImage}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download size={20} />
              Descargar como imagen (HD)
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition"
            >
              Volver a editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista Principal de Edición
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto border border-white/10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Constructor de Gobierno</h2>
            <p className="text-sm text-white/60 mt-1">
              Diseña tu gabinete ministerial ideal
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Nombre & Logo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Nombre del Gobierno
              </label>
              <input
                type="text"
                value={governmentName}
                onChange={(e) => setGovernmentName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                placeholder="Ej: Gobierno de..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Logo / Escudo
              </label>
              <label className="flex items-center gap-2 justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer hover:bg-white/10 transition text-sm">
                <Upload size={16} />
                <span>{partyLogo ? 'Cambiar' : 'Subir'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Ministerios Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <label className="text-sm font-semibold text-white">
                Ministerios ({ministers.length})
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs transition"
                  title="Restaurar ministerios por defecto"
                >
                  <RotateCcw size={14} />
                  Restaurar
                </button>
                <button
                  onClick={addMinistry}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ministerio, ministro o partido..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Lista con Drag & Drop */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredMinisters.map((m, index) => (
                <MinisterItem
                  key={m.id}
                  minister={m}
                  index={index}
                  onUpdate={updateMinister}
                  onRemove={removeMinistry}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
              {filteredMinisters.length === 0 && (
                <p className="text-center py-8 text-white/40 text-sm">
                  No se encontraron ministerios.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
          >
            <Eye size={18} />
            Previsualizar
          </button>
          <button
            onClick={downloadAsImage}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
          >
            <Download size={18} />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
