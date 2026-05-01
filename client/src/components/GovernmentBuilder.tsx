'use client';

import { useState, useRef } from 'react';
import { X, Plus, Download, Eye, Trash2, Edit2 } from 'lucide-react';
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

export default function GovernmentBuilder({ partyName, partyColor, presidentName, onClose }: GovernmentBuilderProps) {
  const [ministers, setMinisters] = useState<Minister[]>(
    DEFAULT_MINISTRIES.map((m, i) => ({
      id: `min-${i}`,
      ministry: m,
      name: '',
      party: partyName,
    }))
  );
  const [governmentName, setGovernmentName] = useState(`Gobierno de ${presidentName}`);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateMinister = (id: string, field: 'name' | 'party', value: string) => {
    setMinisters(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMinistry = () => {
    const newId = `min-${Date.now()}`;
    setMinisters(prev => [...prev, {
      id: newId,
      ministry: '',
      name: '',
      party: partyName,
    }]);
  };

  const removeMinistry = (id: string) => {
    setMinisters(prev => prev.filter(m => m.id !== id));
  };

  const downloadAsImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Fondo gradiente
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      ctx.fillStyle = partyColor;
      ctx.fillRect(0, 0, canvas.width, 120);

      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(governmentName, canvas.width / 2, 70);

      // Presidente
      ctx.font = '32px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Presidente: ${presidentName}`, canvas.width / 2, 150);

      // Ministerios
      const cols = 3;
      const rows = Math.ceil(ministers.length / cols);
      const cellWidth = canvas.width / cols;
      const cellHeight = (canvas.height - 200) / rows;

      ministers.forEach((m, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * cellWidth;
        const y = 200 + row * cellHeight;

        // Card background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x + 10, y + 10, cellWidth - 20, cellHeight - 20);

        // Card border
        ctx.strokeStyle = partyColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, y + 10, cellWidth - 20, cellHeight - 20);

        // Ministry name
        ctx.fillStyle = partyColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(m.ministry, x + 20, y + 40);

        // Minister name
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(m.name || '(Vacante)', x + 20, y + 70);

        // Party
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.fillText(m.party || partyName, x + 20, y + 95);
      });

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${governmentName}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Gobierno descargado como imagen');
        }
      });
    } catch (err) {
      toast.error('Error al descargar imagen');
      console.error(err);
    }
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-white/10">
          {/* Preview Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{governmentName}</h2>
            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-8">
            <div className="mb-8 pb-8 border-b border-white/10">
              <p className="text-lg text-white/80">
                <span className="font-semibold text-white">Presidente:</span> {presidentName}
              </p>
              <p className="text-lg text-white/80">
                <span className="font-semibold text-white">Partido:</span> {partyName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ministers.map(m => (
                <div key={m.id} className="frosted-glass p-6 rounded-xl border border-white/10">
                  <div className="text-sm font-semibold text-white/60 uppercase mb-2">{m.ministry}</div>
                  <div className="text-lg font-bold text-white mb-1">{m.name || '(Vacante)'}</div>
                  <div className="text-sm text-white/50">{m.party || partyName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Actions */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 p-6 flex gap-3">
            <button
              onClick={downloadAsImage}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download size={20} />
              Descargar como imagen
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Constructor de Gobierno</h2>
            <p className="text-sm text-white/60 mt-1">Diseña tu gabinete ministerial ideal</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Government Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Nombre del Gobierno</label>
            <input
              type="text"
              value={governmentName}
              onChange={(e) => setGovernmentName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              placeholder="Ej: Gobierno de..."
            />
          </div>

          {/* Ministers List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-white">Ministerios ({ministers.length})</label>
              <button
                onClick={addMinistry}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {ministers.map(m => (
                <div key={m.id} className="flex gap-3 items-start p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={m.ministry}
                      onChange={(e) => updateMinister(m.id, 'ministry', e.target.value)}
                      placeholder="Nombre del ministerio"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMinister(m.id, 'name', e.target.value)}
                      placeholder="Nombre del ministro (opcional)"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      value={m.party}
                      onChange={(e) => updateMinister(m.id, 'party', e.target.value)}
                      placeholder="Partido (opcional)"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    onClick={() => removeMinistry(m.id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Eye size={20} />
            Vista previa
          </button>
          <button
            onClick={downloadAsImage}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Download size={20} />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
