import { Button } from "@/components/ui/button";

interface ReviewNanoEncuestaProps {
  responses: Record<string, any>;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function ReviewNanoEncuesta({ responses, onEdit, onConfirm, isSubmitting }: ReviewNanoEncuestaProps) {
  const formatLabel = (key: string): string => {
    const labels: Record<string, string> = {
      edad: 'Edad',
      provincia: 'Provincia',
      comunidad_autonoma: 'Comunidad Autónoma',
      nacionalidad: 'Nacionalidad',
      voto_generales: 'Voto Elecciones Generales',
      voto_autonomicas: 'Voto Elecciones Autonómicas',
      voto_municipales: 'Voto Elecciones Municipales',
      voto_europeas: 'Voto Elecciones Europeas',
      nota_ejecutivo: 'Nota al Ejecutivo',
      valoracion_feijoo: 'Valoración: Alberto Núñez Feijóo',
      valoracion_sanchez: 'Valoración: Pedro Sánchez',
      valoracion_abascal: 'Valoración: Santiago Abascal',
      valoracion_alvise: 'Valoración: Alvise Pérez',
      valoracion_yolanda: 'Valoración: Yolanda Díaz',
      valoracion_irene: 'Valoración: Irene Montero',
      valoracion_ayuso: 'Valoración: Isabel Díaz Ayuso',
      valoracion_buxade: 'Valoración: Jorge Buxadé',
      asociacion_juvenil: 'Asociación Juvenil',
    };
    return labels[key] || key;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'No respondido';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return String(value);
  };

  const requiredFields = [
    'edad',
    'provincia',
    'comunidad_autonoma',
    'nacionalidad',
    'voto_generales',
    'voto_autonomicas',
    'voto_municipales',
    'voto_europeas',
    'nota_ejecutivo',
    'valoracion_feijoo',
    'valoracion_sanchez',
    'valoracion_abascal',
    'valoracion_alvise',
    'valoracion_yolanda',
    'valoracion_irene',
    'valoracion_ayuso',
    'valoracion_buxade',
    'asociacion_juvenil'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b border-[#2D2D2D]">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-white font-bold">Revisa tus respuestas</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="liquid-glass p-8 rounded-2xl border border-[#2D2D2D] space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wide mb-2">
                Resumen de respuestas
              </p>
              <h2 className="text-2xl font-bold text-white">
                Verifica tus datos antes de enviar
              </h2>
            </div>

            {/* Responses List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requiredFields.map((key) => {
                const value = responses[key];
                return (
                  <div key={key} className="p-4 rounded-lg bg-[#0F1419] border border-[#2D2D2D]">
                    <p className="text-sm font-semibold text-[#C41E3A] mb-2">
                      {formatLabel(key)}
                    </p>
                    <p className="text-white break-words">
                      {formatValue(value)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={onEdit}
                variant="outline"
                className="flex-1 border-[#C41E3A] text-[#C41E3A] h-12 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10"
              >
                Editar respuestas
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar y enviar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
