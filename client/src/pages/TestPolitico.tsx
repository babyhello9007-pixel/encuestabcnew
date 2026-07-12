import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";

interface Question {
  id: number;
  bloque: string;
  pregunta: string;
  opciones: {
    label: string;
    value: "A" | "B" | "C" | "D";
    afinidad: Record<string, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    bloque: "ECONOMÍA Y ESTADO",
    pregunta: "¿Cómo debería ser la presión fiscal en España?",
    opciones: [
      {
        label: "A) Altamente progresiva: justicia fiscal donde las grandes rentas y empresas aporten mucho más",
        value: "A",
        afinidad: { PSOE: 10, SUMAR: 10, PODEMOS: 10, PP: 2, VOX: 1, ERC: 9, JUNTS: 8 },
      },
      {
        label: "B) Moderada y eficiente: reducción selectiva de impuestos a la clase media y pymes",
        value: "B",
        afinidad: { PP: 8, PSOE: 6, Ciudadanos: 9, VOX: 3, SUMAR: 4, ERC: 5, JUNTS: 4 },
      },
      {
        label: "C) Baja y competitiva: simplificación de tramos, reducción drástica del IRPF",
        value: "C",
        afinidad: { PP: 9, VOX: 8, Ciudadanos: 8, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 2, JUNTS: 2 },
      },
      {
        label: "D) Mínima u nula: el Estado no debe confiscar el fruto del trabajo",
        value: "D",
        afinidad: { VOX: 10, PP: 6, Ciudadanos: 5, PSOE: 1, SUMAR: 0, PODEMOS: 0, ERC: 1, JUNTS: 1 },
      },
    ],
  },
  {
    id: 2,
    bloque: "ECONOMÍA Y ESTADO",
    pregunta: "¿Cuál debe ser el papel del Estado en el mercado del alquiler y la vivienda?",
    opciones: [
      {
        label: "A) Intervención directa: topes de precios, prohibición de desahucios, parque de vivienda pública",
        value: "A",
        afinidad: { PSOE: 9, SUMAR: 10, PODEMOS: 10, PP: 2, VOX: 1, ERC: 8, JUNTS: 7 },
      },
      {
        label: "B) Estímulo y seguridad: incentivos fiscales a propietarios, ayudas a jóvenes",
        value: "B",
        afinidad: { PP: 8, PSOE: 7, Ciudadanos: 9, VOX: 3, SUMAR: 4, ERC: 5, JUNTS: 4 },
      },
      {
        label: "C) Liberalización del suelo: eliminación de trabas urbanísticas, endurecimiento penal contra ocupación",
        value: "C",
        afinidad: { PP: 9, VOX: 8, Ciudadanos: 8, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 2, JUNTS: 2 },
      },
      {
        label: "D) Desregulación absoluta: libre acuerdo entre partes sin interferencia del Estado",
        value: "D",
        afinidad: { VOX: 10, PP: 6, Ciudadanos: 5, PSOE: 1, SUMAR: 0, PODEMOS: 0, ERC: 1, JUNTS: 1 },
      },
    ],
  },
  {
    id: 3,
    bloque: "ECONOMÍA Y ESTADO",
    pregunta: "¿Qué modelo defiendes para el sistema de pensiones?",
    opciones: [
      {
        label: "A) Blindaje público: revalorización garantizada por ley según el IPC",
        value: "A",
        afinidad: { PSOE: 10, SUMAR: 10, PODEMOS: 10, PP: 2, VOX: 1, ERC: 9, JUNTS: 8 },
      },
      {
        label: "B) Sostenibilidad mixta: incentivar prolongación de vida laboral con planes colectivos",
        value: "B",
        afinidad: { PP: 8, PSOE: 7, Ciudadanos: 9, VOX: 3, SUMAR: 4, ERC: 5, JUNTS: 4 },
      },
      {
        label: "C) Capitalización individual opcional: planes privados con desgravaciones fiscales",
        value: "C",
        afinidad: { PP: 9, VOX: 8, Ciudadanos: 8, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 2, JUNTS: 2 },
      },
      {
        label: "D) Capitalización privada total: privatización del sistema",
        value: "D",
        afinidad: { VOX: 10, PP: 6, Ciudadanos: 5, PSOE: 1, SUMAR: 0, PODEMOS: 0, ERC: 1, JUNTS: 1 },
      },
    ],
  },
  {
    id: 4,
    bloque: "ECONOMÍA Y ESTADO",
    pregunta: "¿Cómo valoras el Salario Mínimo Interprofesional (SMI)?",
    opciones: [
      {
        label: "A) Debe seguir subiendo de forma decidida para garantizar nivel de vida digno",
        value: "A",
        afinidad: { PSOE: 10, SUMAR: 10, PODEMOS: 10, PP: 2, VOX: 1, ERC: 9, JUNTS: 8 },
      },
      {
        label: "B) Debe actualizarse mediante pactos de diálogo social entre patronal y sindicatos",
        value: "B",
        afinidad: { PP: 8, PSOE: 7, Ciudadanos: 9, VOX: 3, SUMAR: 4, ERC: 5, JUNTS: 4 },
      },
      {
        label: "C) Debe congelarse o moderarse para mantener competitividad de pequeñas empresas",
        value: "C",
        afinidad: { PP: 9, VOX: 8, Ciudadanos: 8, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 2, JUNTS: 2 },
      },
      {
        label: "D) No debería existir un SMI fijado por ley; los salarios deben pactarse libremente",
        value: "D",
        afinidad: { VOX: 10, PP: 6, Ciudadanos: 5, PSOE: 1, SUMAR: 0, PODEMOS: 0, ERC: 1, JUNTS: 1 },
      },
    ],
  },
  {
    id: 5,
    bloque: "ECONOMÍA Y ESTADO",
    pregunta: "Sobre las empresas de sectores estratégicos (energía, telecomunicaciones, transporte):",
    opciones: [
      {
        label: "A) Recuperar el control público o crear empresas estatales en sectores estratégicos",
        value: "A",
        afinidad: { PSOE: 9, SUMAR: 10, PODEMOS: 10, PP: 2, VOX: 1, ERC: 8, JUNTS: 7 },
      },
      {
        label: "B) Mantener el modelo de gestión privada actual bajo supervisión rigurosa",
        value: "B",
        afinidad: { PP: 8, PSOE: 7, Ciudadanos: 9, VOX: 3, SUMAR: 4, ERC: 5, JUNTS: 4 },
      },
      {
        label: "C) Privatizar los últimos reductos de participación estatal y liberalizar los sectores",
        value: "C",
        afinidad: { PP: 9, VOX: 8, Ciudadanos: 8, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 2, JUNTS: 2 },
      },
      {
        label: "D) Liquidar o vender cualquier activo público y suprimir organismos reguladores",
        value: "D",
        afinidad: { VOX: 10, PP: 6, Ciudadanos: 5, PSOE: 1, SUMAR: 0, PODEMOS: 0, ERC: 1, JUNTS: 1 },
      },
    ],
  },
  // Bloques II-V con 25 preguntas más (abreviadas por brevedad)
  {
    id: 6,
    bloque: "MODELO TERRITORIAL",
    pregunta: "¿Cuál es tu postura sobre el encaje territorial y el derecho de autodeterminación?",
    opciones: [
      {
        label: "A) Plurinacionalidad: reconocimiento de las distintas realidades nacionales",
        value: "A",
        afinidad: { ERC: 10, JUNTS: 10, SUMAR: 8, PSOE: 6, PODEMOS: 7, PP: 1, VOX: 0 },
      },
      {
        label: "B) Autonomismo constitucional: defensa de la Constitución de 1978",
        value: "B",
        afinidad: { PP: 9, PSOE: 8, Ciudadanos: 9, VOX: 2, SUMAR: 4, ERC: 2, JUNTS: 2 },
      },
      {
        label: "C) Estado unitario y centralizado: devolución de competencias clave",
        value: "C",
        afinidad: { PP: 10, VOX: 9, Ciudadanos: 7, PSOE: 2, SUMAR: 1, PODEMOS: 1, ERC: 0, JUNTS: 0 },
      },
      {
        label: "D) Ruptura o independencia unilateral: separación definitiva del Estado español",
        value: "D",
        afinidad: { JUNTS: 10, ERC: 9, SUMAR: 3, PODEMOS: 2, PSOE: 1, PP: 0, VOX: 0 },
      },
    ],
  },
];

export default function TestPolitico() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: "A" | "B" | "C" | "D") => {
    setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: value });
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const affinityResults = useMemo(() => {
    const parties = ["PP", "PSOE", "VOX", "SUMAR", "PODEMOS", "Ciudadanos", "ERC", "JUNTS"];
    const scores: Record<string, number> = {};
    parties.forEach(p => (scores[p] = 0));

    Object.entries(answers).forEach(([qId, answer]) => {
      const question = QUESTIONS.find(q => q.id === Number(qId));
      if (question) {
        const option = question.opciones.find(o => o.value === answer);
        if (option) {
          Object.entries(option.afinidad).forEach(([party, score]) => {
            scores[party] += score;
          });
        }
      }
    });

    return Object.entries(scores)
      .map(([party, score]) => ({ party, score }))
      .sort((a, b) => b.score - a.score);
  }, [answers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#C41E3A]">Test Político</h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/resultados")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {!showResults ? (
          <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] backdrop-blur-md p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Pregunta {currentQuestion + 1} de {QUESTIONS.length}</span>
                <span>{Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2">
                <div
                  className="bg-[#C41E3A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{QUESTIONS[currentQuestion].pregunta}</h2>
              <p className="text-sm text-[#999999]">{QUESTIONS[currentQuestion].bloque}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {QUESTIONS[currentQuestion].opciones.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full justify-start text-left h-auto p-4 bg-[rgba(196,30,58,0.1)] hover:bg-[rgba(196,30,58,0.2)] border border-[#C41E3A] text-white"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Results Chart */}
            <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] backdrop-blur-md p-8">
              <h2 className="text-2xl font-bold mb-6">Tu Afinidad Política</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={affinityResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="party" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid #C41E3A" }}
                  />
                  <Bar dataKey="score" fill="#C41E3A" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Match */}
            <Card className="bg-[rgba(196,30,58,0.1)] border border-[#C41E3A] backdrop-blur-md p-8">
              <h3 className="text-xl font-bold mb-4">Tu mejor afinidad es con:</h3>
              <p className="text-3xl font-bold text-[#C41E3A]">
                {affinityResults[0]?.party} ({affinityResults[0]?.score} puntos)
              </p>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                }}
                className="flex-1 bg-[#C41E3A] hover:bg-[#A01830]"
              >
                Repetir Test
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/resultados")}
                className="flex-1"
              >
                Ver Resultados Generales
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
