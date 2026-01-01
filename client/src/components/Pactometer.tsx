import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface PartyStats {
  id: string;
  nombre: string;
  escanos: number;
  porcentaje: number;
  color?: string;
}

interface PactometerProps {
  stats: PartyStats[];
  totalSeats?: number;
  requiredForMajority?: number;
  showCoalitions?: boolean;
}

// Definir coaliciones políticas españolas
const COALITIONS = {
  'Derecha': ['PP', 'VOX', 'UPN'],
  'Centro-Derecha': ['PP', 'Ciudadanos'],
  'Izquierda': ['PSOE', 'PODEMOS', 'Unidas Podemos', 'UP', 'SUMAR'],
  'Nacionalistas': ['ERC', 'JUNTS', 'PNV', 'BILDU', 'BNG', 'Coalición Canaria', 'CC'],
  'Otros': ['Se Acabó La Fiesta', 'SALF', 'Izquierda Española', 'Falange', 'CUP', 'PACMA']
};

export default function Pactometer({ 
  stats, 
  totalSeats = 350, 
  requiredForMajority = 176,
  showCoalitions = true 
}: PactometerProps) {
  
  const coalitionStats = useMemo(() => {
    const coalitions: Record<string, { seats: number; percentage: number; parties: PartyStats[] }> = {};
    
    Object.entries(COALITIONS).forEach(([coalitionName, partyIds]) => {
      const coalitionParties = stats.filter(party => 
        partyIds.some(id => 
          party.id === id || party.nombre.includes(id) || id.includes(party.nombre)
        )
      );
      
      const totalSeatsInCoalition = coalitionParties.reduce((sum, p) => sum + p.escanos, 0);
      const totalPercentage = coalitionParties.reduce((sum, p) => sum + p.porcentaje, 0);
      
      if (totalSeatsInCoalition > 0) {
        coalitions[coalitionName] = {
          seats: totalSeatsInCoalition,
          percentage: totalPercentage,
          parties: coalitionParties
        };
      }
    });
    
    return coalitions;
  }, [stats]);

  const coalitionsList = Object.entries(coalitionStats)
    .sort(([, a], [, b]) => b.seats - a.seats);

  const getCoalitionColor = (coalitionName: string): string => {
    const colors: Record<string, string> = {
      'Derecha': '#0066FF',
      'Centro-Derecha': '#0066FF',
      'Izquierda': '#E81B23',
      'Nacionalistas': '#FFD700',
      'Otros': '#999999'
    };
    return colors[coalitionName] || '#CCCCCC';
  };

  const hasMajority = (seats: number): boolean => seats >= requiredForMajority;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Pactómetro</h3>
        <p className="text-sm text-slate-600">
          Mayoría requerida: <span className="font-bold">{requiredForMajority} escaños</span>
        </p>
      </div>

      {/* Barra de progreso general */}
      <div className="space-y-3">
        {coalitionsList.map(([coalitionName, data]) => (
          <div key={coalitionName} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">{coalitionName}</span>
              <span className="text-sm font-bold">
                {data.seats} escaños ({data.percentage.toFixed(1)}%)
                {hasMajority(data.seats) && (
                  <span className="ml-2 text-green-600 font-bold">✓ Mayoría</span>
                )}
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="h-8 bg-slate-200 rounded-lg overflow-hidden flex">
              <div
                className="transition-all duration-300 flex items-center justify-center"
                style={{
                  width: `${(data.seats / totalSeats) * 100}%`,
                  backgroundColor: getCoalitionColor(coalitionName),
                  opacity: 0.8
                }}
              >
                {(data.seats / totalSeats) * 100 > 5 && (
                  <span className="text-white font-bold text-xs">{data.seats}</span>
                )}
              </div>
            </div>

            {/* Partidos en la coalición */}
            {data.parties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.parties.map(party => (
                  <div
                    key={party.id}
                    className="px-2 py-1 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: getCoalitionColor(coalitionName) }}
                    title={`${party.nombre}: ${party.escanos} escaños`}
                  >
                    {party.nombre.substring(0, 3)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Línea de mayoría */}
      <div className="relative h-12 bg-slate-100 rounded-lg border-2 border-slate-300">
        <div
          className="absolute top-0 bottom-0 border-l-4 border-red-600 flex items-center"
          style={{ left: `${(requiredForMajority / totalSeats) * 100}%` }}
        >
          <span className="text-xs font-bold text-red-600 ml-2 whitespace-nowrap">
            Mayoría ({requiredForMajority})
          </span>
        </div>
        
        {/* Barras de coaliciones */}
        <div className="flex h-full">
          {coalitionsList.map(([coalitionName, data]) => (
            <div
              key={coalitionName}
              className="transition-all duration-300 flex items-center justify-center"
              style={{
                width: `${(data.seats / totalSeats) * 100}%`,
                backgroundColor: getCoalitionColor(coalitionName),
                opacity: 0.7
              }}
              title={`${coalitionName}: ${data.seats} escaños`}
            >
              {(data.seats / totalSeats) * 100 > 8 && (
                <span className="text-white font-bold text-xs">{data.seats}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Información de mayorías posibles */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-slate-900 mb-2">Posibles Coaliciones para Mayoría</h4>
        <div className="space-y-2 text-sm">
          {coalitionsList.length > 0 && (
            <>
              {coalitionsList.map(([coalitionName, data]) => {
                if (hasMajority(data.seats)) {
                  return (
                    <p key={coalitionName} className="text-green-700 font-semibold">
                      ✓ {coalitionName} tiene mayoría con {data.seats} escaños
                    </p>
                  );
                }
                
                // Buscar coaliciones posibles
                const needed = requiredForMajority - data.seats;
                const possiblePartners = coalitionsList
                  .filter(([name]) => name !== coalitionName)
                  .filter(([, partnerData]) => partnerData.seats >= needed);
                
                if (possiblePartners.length > 0) {
                  return (
                    <p key={coalitionName} className="text-slate-700">
                      {coalitionName} + {possiblePartners.map(([name]) => name).join(' o ')} = Mayoría
                    </p>
                  );
                }
                
                return null;
              })}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
