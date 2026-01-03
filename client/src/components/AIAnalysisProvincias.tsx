import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AIAnalysisProvinciasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinciaName: string;
  provinciaData: Array<{nombre: string; votos: number; porcentaje: number; escanos: number}>;
  totalResponses: number;
}

export function AIAnalysisProvincias({
  open,
  onOpenChange,
  provinciaName,
  provinciaData,
  totalResponses
}: AIAnalysisProvinciasProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const topPartiesText = provinciaData.slice(0, 5)
        .map(p => `${p.nombre}: ${p.votos} votos (${p.porcentaje.toFixed(1)}%), ${p.escanos} escanos`)
        .join("; ");

      const prompt = `Analiza los siguientes resultados de la Encuesta de Batalla Cultural para la provincia de ${provinciaName} de forma concisa y profesional:

Total de respuestas en ${provinciaName}: ${totalResponses}

Top partidos en ${provinciaName}:
${topPartiesText}

Proporciona un análisis que incluya:
1. Principales tendencias políticas en ${provinciaName}
2. Particularidades provinciales comparadas con la media nacional
3. Implicaciones de la distribución de escaños en la provincia
4. Posibles coaliciones provinciales

Responde en máximo 300 palabras.`;

      const response = await fetch("https://api.manus.im/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_MANUS_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "No se pudo generar el análisis";
        setAnalysis(content);
      } else {
        setAnalysis("Error al conectar con Manus AI. Intenta de nuevo más tarde.");
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      setAnalysis("Error al generar el análisis. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
      setHasGenerated(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Análisis de IA - {provinciaName}
          </DialogTitle>
          <DialogDescription>
            Análisis inteligente de los resultados en {provinciaName} con Manus AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!hasGenerated ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Haz clic para generar un análisis inteligente de los resultados en {provinciaName}
              </p>
              <Button
                onClick={generateAnalysis}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando análisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Análisis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm whitespace-pre-wrap text-foreground">
                  {analysis}
                </p>
              </div>
              <Button
                onClick={generateAnalysis}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerar Análisis
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
