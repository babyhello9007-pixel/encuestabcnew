import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PartyLogo from '@/components/PartyLogo';
import { Copy, Download, FileText, Share2 } from 'lucide-react';

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

interface ShareResultsModernProps {
  stats: PartyStats[];
  youthStats: PartyStats[];
  totalResponses: number;
  cooldownMinutes?: number;
}

const STORAGE_KEY = 'bc_results_share_cooldown';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function ShareResultsModern({
  stats,
  youthStats,
  totalResponses,
  cooldownMinutes = 15,
}: ShareResultsModernProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState<null | 'png' | 'pdf'>(null);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const topGeneral = useMemo(() => [...stats].sort((a, b) => b.votos - a.votos).slice(0, 5), [stats]);
  const topYouth = useMemo(() => [...youthStats].sort((a, b) => b.votos - a.votos).slice(0, 5), [youthStats]);
  const canShare = secondsLeft <= 0;

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (!last) return;

    const update = () => {
      const remaining = cooldownMinutes * 60 - Math.floor((Date.now() - last) / 1000);
      setSecondsLeft(Math.max(0, remaining));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [cooldownMinutes]);

  const registerShare = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setSecondsLeft(cooldownMinutes * 60);
  };

  const waitForImages = async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  };

  const createCanvas = async () => {
    if (!captureRef.current) return null;
    await waitForImages(captureRef.current);
    return html2canvas(captureRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
  };

  const exportPNG = async () => {
    if (!canShare) return;
    setBusy('png');
    const canvas = await createCanvas();
    if (!canvas) {
      setBusy(null);
      return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1);
    link.download = `la-encuesta-bc-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    registerShare();
    setMessage('PNG generado correctamente.');
    setBusy(null);
  };

  const exportPDF = async () => {
    if (!canShare) return;
    setBusy('pdf');
    const canvas = await createCanvas();
    if (!canvas) {
      setBusy(null);
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    doc.addImage(canvas.toDataURL('image/png', 1), 'PNG', 0, 0, pageWidth, imgHeight);
    doc.save(`la-encuesta-bc-${new Date().toISOString().slice(0, 10)}.pdf`);
    registerShare();
    setMessage('PDF generado correctamente.');
    setBusy(null);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setMessage('Enlace copiado al portapapeles.');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white">
          <Share2 className="h-4 w-4" /> Generar Infografía para Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compartir resultados</DialogTitle>
          <DialogDescription>
            Genera PNG, PDF o copia el enlace con cooldown de 15 minutos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">PNG / PDF / Link</h3>
                <p className="text-xs text-slate-500">Cooldown 15 minutos · diseño para redes</p>
              </div>
              <p className="text-sm font-medium text-slate-600">
                {canShare ? 'Disponible ahora' : `Puedes volver a compartir en ${formatTime(secondsLeft)}`}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={exportPNG} disabled={!canShare || busy !== null} className="gap-2">
                <Download className="h-4 w-4" /> {busy === 'png' ? 'Generando…' : 'PNG'}
              </Button>
              <Button onClick={exportPDF} disabled={!canShare || busy !== null} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" /> {busy === 'pdf' ? 'Generando…' : 'PDF'}
              </Button>
              <Button onClick={copyLink} variant="secondary" className="gap-2">
                <Copy className="h-4 w-4" /> Copiar link
              </Button>
            </div>

            {message && <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}
          </div>

          <div ref={captureRef} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">La Encuesta de BC</p>
                <h4 className="text-2xl font-extrabold text-slate-900">Resumen de resultados</h4>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{new Date().toLocaleDateString('es-ES')}</div>
                <div>{totalResponses} respuestas</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <h5 className="mb-2 font-semibold">Top Generales</h5>
                {topGeneral.map((p) => (
                  <div key={`g-${p.id}`} className="mb-2 flex items-center justify-between rounded-lg bg-white p-2" style={{ borderLeft: `4px solid ${p.color || '#9CA3AF'}` }}>
                    <div className="flex items-center gap-2">
                      <PartyLogo src={p.logo} partyName={p.nombre} size={18} strictExternal />
                      <span className="text-sm font-semibold">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-slate-600">{p.porcentaje.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <h5 className="mb-2 font-semibold">Top Asociaciones Juveniles</h5>
                {topYouth.map((p) => (
                  <div key={`y-${p.id}`} className="mb-2 flex items-center justify-between rounded-lg bg-white p-2" style={{ borderLeft: `4px solid ${p.color || '#9CA3AF'}` }}>
                    <div className="flex items-center gap-2">
                      <PartyLogo src={p.logo} partyName={p.nombre} size={18} strictExternal />
                      <span className="text-sm font-semibold">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-slate-600">{p.porcentaje.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
