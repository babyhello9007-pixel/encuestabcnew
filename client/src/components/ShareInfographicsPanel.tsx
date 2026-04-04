import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import PartyLogo from "@/components/PartyLogo";
import { Download, FileText, Link2, Sparkles } from "lucide-react";

interface PartyStat {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

interface ShareInfographicsPanelProps {
  generalStats: PartyStat[];
  youthStats: PartyStat[];
  totalResponses: number;
  cooldownMinutes?: number;
}

const COOLDOWN_STORAGE_KEY = "bc_infographic_last_generated_at";

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function ShareInfographicsPanel({
  generalStats,
  youthStats,
  totalResponses,
  cooldownMinutes = 15,
}: ShareInfographicsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const cooldownMs = cooldownMinutes * 60 * 1000;
  const canGenerate = remainingSeconds <= 0;

  useEffect(() => {
    const stored = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    const last = stored ? Number(stored) : 0;
    if (!last) return;

    const update = () => {
      const diff = cooldownMs - (Date.now() - last);
      setRemainingSeconds(Math.max(0, Math.ceil(diff / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  const topGeneral = useMemo(() => generalStats.slice(0, 5), [generalStats]);
  const topYouth = useMemo(() => youthStats.slice(0, 5), [youthStats]);

  const markGenerated = () => {
    const now = Date.now();
    localStorage.setItem(COOLDOWN_STORAGE_KEY, String(now));
    setRemainingSeconds(cooldownMinutes * 60);
  };

  const waitForImages = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll("img"));
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

  const makeCanvas = async () => {
    if (!containerRef.current) return null;
    await waitForImages(containerRef.current);
    return html2canvas(containerRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
  };

  const generatePNG = async () => {
    if (!canGenerate) return;
    const canvas = await makeCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png", 1.0);
    link.download = `encuesta-bc-infografia-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    markGenerated();
    setSuccessMessage("Infografía PNG generada correctamente.");
  };

  const generatePDF = async () => {
    if (!canGenerate) return;
    const canvas = await makeCanvas();
    if (!canvas) return;

    const imgData = canvas.toDataURL("image/png", 1.0);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    doc.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    doc.save(`encuesta-bc-infografia-${new Date().toISOString().slice(0, 10)}.pdf`);
    markGenerated();
    setSuccessMessage("PDF generado correctamente.");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setSuccessMessage("Enlace copiado al portapapeles.");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Generar Infografía para Compartir</h3>
            <p className="text-sm text-slate-500">PNG y PDF de alta calidad con logos y colores oficiales.</p>
          </div>
          <div className="text-sm font-medium text-slate-600">
            {canGenerate
              ? "Listo para generar"
              : `Puedes generar otra en ${formatCountdown(remainingSeconds)}`}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={generatePNG} disabled={!canGenerate} className="gap-2">
            <Download className="h-4 w-4" /> PNG
          </Button>
          <Button onClick={generatePDF} disabled={!canGenerate} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button onClick={copyLink} variant="secondary" className="gap-2">
            <Link2 className="h-4 w-4" /> Copiar enlace
          </Button>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">La Encuesta de BC</p>
            <h4 className="text-2xl font-extrabold text-slate-900">Resumen para compartir</h4>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>{new Date().toLocaleDateString("es-ES")}</div>
            <div>{totalResponses} respuestas</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl bg-slate-50 p-4">
            <h5 className="mb-3 font-semibold text-slate-900">Top Elecciones Generales</h5>
            <div className="space-y-2">
              {topGeneral.map((p) => (
                <div key={`g-${p.id}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2" style={{ borderLeft: `4px solid ${p.color || "#9CA3AF"}` }}>
                  <div className="flex items-center gap-2">
                    <PartyLogo src={p.logo} partyName={p.nombre} size={20} strictExternal />
                    <span className="text-sm font-semibold text-slate-800">{p.nombre}</span>
                  </div>
                  <div className="text-xs text-slate-600">{p.porcentaje.toFixed(1)}% · {p.escanos} esc.</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 p-4">
            <h5 className="mb-3 font-semibold text-slate-900">Top Asociaciones Juveniles</h5>
            <div className="space-y-2">
              {topYouth.map((p) => (
                <div key={`y-${p.id}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2" style={{ borderLeft: `4px solid ${p.color || "#9CA3AF"}` }}>
                  <div className="flex items-center gap-2">
                    <PartyLogo src={p.logo} partyName={p.nombre} size={20} strictExternal />
                    <span className="text-sm font-semibold text-slate-800">{p.nombre}</span>
                  </div>
                  <div className="text-xs text-slate-600">{p.porcentaje.toFixed(1)}% · {p.escanos} esc.</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-4 text-slate-100">
          <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> Mapa + Hemiciclo incluidos en la vista principal de resultados</div>
        </div>
      </div>
    </div>
  );
}
