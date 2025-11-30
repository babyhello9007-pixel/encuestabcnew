import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface YouthAssociationsMapProps {
  activeTab: string;
}

export default function YouthAssociationsMap({ activeTab }: YouthAssociationsMapProps) {
  const [votosPorProvincia, setVotosPorProvincia] = useState<Record<string, Record<string, number>>>({});
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar votos por provincia desde Supabase
  useEffect(() => {
    const loadVotes = async () => {
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

        setVotosPorProvincia(votos);
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'youth') {
      loadVotes();
    }
  }, [activeTab]);

  // Obtener ganador por provincia
  const getWinnerByProvince = (provincia: string): string | null => {
    const votos = votosPorProvincia[provincia];
    if (!votos || Object.keys(votos).length === 0) return null;

    let maxVotos = 0;
    let winner = null;

    for (const [asociacion, votos_count] of Object.entries(votos)) {
      if (votos_count > maxVotos) {
        maxVotos = votos_count;
        winner = asociacion;
      }
    }

    return winner;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando datos del mapa...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="liquid-glass p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6">Mapa de Provincias - Asociaciones Juveniles</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(votosPorProvincia)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([provincia, votos]) => {
              const winner = getWinnerByProvince(provincia);
              const totalVotos = Object.values(votos).reduce((a: number, b: number) => a + b, 0);
              
              return (
                <button
                  key={provincia}
                  onClick={() => setSelectedProvince(selectedProvince === provincia ? null : provincia)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                    selectedProvince === provincia
                      ? 'border-[#C41E3A] bg-[#C41E3A]/10'
                      : 'border-[#E0D5CC] hover:border-[#C41E3A]'
                  }`}
                >
                  <p className="font-semibold text-[#2D2D2D]">{provincia}</p>
                  <p className="text-sm text-[#666666]">{totalVotos} votos</p>
                  {winner && (
                    <p className="text-xs text-[#C41E3A] font-semibold mt-1">Ganador: {winner}</p>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {selectedProvince && (
        <div className="liquid-glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">{selectedProvince}</h3>
          <div className="space-y-3">
            {Object.entries(votosPorProvincia[selectedProvince] || {})
              .sort(([, a], [, b]) => b - a)
              .map(([asociacion, votos]) => (
                <div key={asociacion} className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
                  <span className="font-semibold text-[#2D2D2D]">{asociacion}</span>
                  <span className="text-[#C41E3A] font-bold">{votos} votos</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
