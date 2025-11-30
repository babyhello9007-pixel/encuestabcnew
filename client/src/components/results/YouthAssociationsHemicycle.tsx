import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calcularEscanosAsociacionesPorProvincia } from '@/lib/dhondtYouthAssociations';
import { getPartyColor } from '@/lib/partyColors';

interface YouthAssociationsHemicycleProps {
  activeTab: string;
}

export default function YouthAssociationsHemicycle({ activeTab }: YouthAssociationsHemicycleProps) {
  const [escanos, setEscanos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [hoveredAssociation, setHoveredAssociation] = useState<string | null>(null);

  // Cargar datos y calcular escaños
  useEffect(() => {
    const loadAndCalculate = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('respuestas')
          .select('provincia, voto_asociacion_juvenil');

        if (error) throw error;

        // Agrupar votos por provincia
        const votos: Record<string, Record<string, number>> = {};
        
        data?.forEach((row: any) => {
          const provincia = row.provincia;
          const voto = row.voto_asociacion_juvenil;

          if (provincia && voto) {
            if (!votos[provincia]) {
              votos[provincia] = {};
            }
            votos[provincia][voto] = (votos[provincia][voto] || 0) + 1;
          }
        });

        // Calcular escaños con Ley d'Hondt
        const escanosCalculados = calcularEscanosAsociacionesPorProvincia(votos);
        setEscanos(escanosCalculados);
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'youth') {
      loadAndCalculate();
    }
  }, [activeTab]);

  if (loading) {
    return <div className="text-center py-8">Cargando hemiciclo...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Leyenda */}
      <div className="liquid-glass p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6">Distribución de Escaños (100 total)</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(escanos)
            .sort(([, a], [, b]) => b - a)
            .map(([asociacion, numEscanos]) => (
              <div
                key={asociacion}
                className="p-3 rounded-lg border border-border cursor-pointer transition-all hover:shadow-md"
                onMouseEnter={() => setHoveredAssociation(asociacion)}
                onMouseLeave={() => setHoveredAssociation(null)}
                style={{
                  borderColor: getPartyColor(asociacion),
                  backgroundColor:
                    hoveredAssociation === asociacion
                      ? getPartyColor(asociacion) + '20'
                      : 'transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getPartyColor(asociacion) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{asociacion}</p>
                    <p className="text-xs text-muted-foreground">{numEscanos} escaños</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Resumen en tabla */}
      <div className="liquid-glass p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-4">Resumen de Escaños</h3>
        <div className="space-y-2">
          {Object.entries(escanos)
            .sort(([, a], [, b]) => b - a)
            .map(([asociacion, numEscanos]) => (
              <div key={asociacion} className="flex justify-between items-center p-2 hover:bg-[#F5F5F5] rounded">
                <span className="font-semibold text-[#2D2D2D]">{asociacion}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-[#E0D5CC] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(numEscanos / 100) * 100}%`,
                        backgroundColor: getPartyColor(asociacion),
                      }}
                    />
                  </div>
                  <span className="font-bold text-[#C41E3A] w-12 text-right">{numEscanos}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
