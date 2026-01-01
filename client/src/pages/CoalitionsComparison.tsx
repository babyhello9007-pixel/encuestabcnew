import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import Footer from '@/components/Footer';

interface SavedCoalition {
  id: string;
  name: string;
  parties: string[];
  totalSeats: number;
  createdAt: string;
}

// Colores de partidos
const PARTY_COLORS: Record<string, string> = {
  'PP': '#0066FF',
  'PSOE': '#E81B23',
  'VOX': '#2ECC71',
  'SUMAR': '#9B2D96',
  'PODEMOS': '#7B3FF2',
  'JUNTS': '#003F9F',
  'ERC': '#FFD700',
  'PNV': '#00B050',
  'ALIANZA': '#003D99',
  'BILDU': '#00AA44',
  'SAF': '#FF6600',
  'CC': '#FFCC00',
  'UPN': '#0066FF',
  'CIUDADANOS': '#FF9900',
  'PLIB': '#FFD700',
  'EB': '#999999',
  'BNG': '#003D99',
  'FO': '#CC0000',
  'CJ': '#0066FF',
  'FALANGE': '#FF0000',
  'IE': '#CC0000',
  'COMPROMIS': '#FF9900',
  'DO': '#FFD700',
  'AA': '#FF0000',
  'CUP': '#FFC400',
  'PACMA': '#00AA44',
  'PCTE': '#CC0000',
  'UPL': '#0066FF',
};

const getPartyColor = (partyId: string): string => {
  return PARTY_COLORS[partyId] || '#999999';
};

export default function CoalitionsComparison() {
  const [, setLocation] = useLocation();
  const [selectedCoalitions, setSelectedCoalitions] = useState<string[]>([]);
  const [coalitions, setCoalitions] = useState<SavedCoalition[]>([]);

  // Cargar coaliciones guardadas
  useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedCoalitions') || '[]');
      setCoalitions(saved);
    } catch (err) {
      console.error('Error loading coalitions:', err);
    }
  }, []);

  const toggleCoalitionSelection = (id: string) => {
    setSelectedCoalitions(prev => {
      if (prev.includes(id)) {
        return prev.filter(cid => cid !== id);
      } else if (prev.length < 3) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const selectedCoalitionsData = useMemo(() => {
    return coalitions.filter(c => selectedCoalitions.includes(c.id));
  }, [coalitions, selectedCoalitions]);

  // Obtener todos los partidos únicos de las coaliciones seleccionadas
  const allPartiesInComparison = useMemo(() => {
    const parties = new Set<string>();
    selectedCoalitionsData.forEach(c => {
      c.parties.forEach(p => parties.add(p));
    });
    return Array.from(parties).sort();
  }, [selectedCoalitionsData]);

  // Calcular composición de cada coalición
  const coalitionComposition = useMemo(() => {
    return selectedCoalitionsData.map(coalition => {
      const composition: Record<string, number> = {};
      allPartiesInComparison.forEach(party => {
        composition[party] = coalition.parties.includes(party) ? 1 : 0;
      });
      return {
        ...coalition,
        composition,
      };
    });
  }, [selectedCoalitionsData, allPartiesInComparison]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/resultados')}
              className="text-foreground hover:text-primary transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-primary">Comparar Coaliciones</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-12">
          {/* Selector de coaliciones */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Selecciona coaliciones para comparar</h2>
            <p className="text-muted-foreground mb-6">Puedes seleccionar hasta 3 coaliciones para comparar lado a lado</p>

            {coalitions.length === 0 ? (
              <Card className="p-8 text-center bg-secondary/50">
                <p className="text-muted-foreground mb-4">No tienes coaliciones guardadas aún</p>
                <Button
                  onClick={() => setLocation('/resultados')}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Ir a crear coaliciones
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coalitions.map(coalition => (
                  <button
                    key={coalition.id}
                    onClick={() => toggleCoalitionSelection(coalition.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCoalitions.includes(coalition.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{coalition.name}</h3>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedCoalitions.includes(coalition.id)
                          ? 'border-primary bg-primary'
                          : 'border-slate-300'
                      }`}>
                        {selectedCoalitions.includes(coalition.id) && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatDate(coalition.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {coalition.parties.slice(0, 3).map(party => (
                        <span
                          key={party}
                          className="text-xs font-semibold text-white px-2 py-1 rounded-full"
                          style={{ backgroundColor: getPartyColor(party) }}
                        >
                          {party}
                        </span>
                      ))}
                      {coalition.parties.length > 3 && (
                        <span className="text-xs font-semibold text-slate-600 px-2 py-1">
                          +{coalition.parties.length - 3}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary">{coalition.totalSeats} escaños</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Comparación */}
          {selectedCoalitionsData.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-foreground">Comparación de Coaliciones</h2>
              </div>

              {/* Tabla comparativa */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Coalición
                        </th>
                        {selectedCoalitionsData.map(coalition => (
                          <th
                            key={coalition.id}
                            className="px-6 py-4 text-center text-sm font-semibold text-foreground"
                          >
                            <div className="font-bold">{coalition.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {coalition.totalSeats} escaños
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          Partidos
                        </td>
                        {selectedCoalitionsData.map(coalition => (
                          <td key={coalition.id} className="px-6 py-4 text-center">
                            <span className="text-sm font-bold text-foreground">
                              {coalition.parties.length}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          Mayoría (176)
                        </td>
                        {selectedCoalitionsData.map(coalition => (
                          <td key={coalition.id} className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                              coalition.totalSeats >= 176
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              {coalition.totalSeats >= 176 ? '✓ Sí' : '✗ No'}
                              <TrendingUp size={16} />
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Gráfico de barras de escaños */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Distribución de Escaños</h3>
                <div className="space-y-6">
                  {selectedCoalitionsData.map(coalition => (
                    <div key={coalition.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{coalition.name}</span>
                        <span className="text-sm font-bold text-primary">{coalition.totalSeats}/350</span>
                      </div>
                      <div className="relative h-8 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                        {/* Línea de mayoría */}
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                          style={{ left: `${(176 / 350) * 100}%` }}
                        />
                        
                        {/* Barra de progreso */}
                        <div
                          className={`h-full transition-all duration-300 flex items-center justify-center font-bold text-white text-sm ${
                            coalition.totalSeats >= 176
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          }`}
                          style={{ width: `${(coalition.totalSeats / 350) * 100}%` }}
                        >
                          {(coalition.totalSeats / 350) * 100 > 15 && (
                            <span>{((coalition.totalSeats / 350) * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Composición de partidos */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Composición de Partidos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Partido
                        </th>
                        {selectedCoalitionsData.map(coalition => (
                          <th
                            key={coalition.id}
                            className="px-4 py-3 text-center text-sm font-semibold text-foreground"
                          >
                            {coalition.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allPartiesInComparison.map(party => (
                        <tr key={party} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: getPartyColor(party) }}
                              />
                              <span className="text-sm font-semibold text-foreground">{party}</span>
                            </div>
                          </td>
                          {selectedCoalitionsData.map(coalition => (
                            <td key={coalition.id} className="px-4 py-3 text-center">
                              {coalition.parties.includes(party) ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Botones de acción */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setSelectedCoalitions([])}
                  variant="outline"
                  className="text-foreground border-slate-300"
                >
                  Limpiar Selección
                </Button>
                <Button
                  onClick={() => setLocation('/resultados')}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Volver a Resultados
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
