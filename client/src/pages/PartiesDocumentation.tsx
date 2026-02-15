import { useState } from 'react';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from '@/lib/surveyData';
import { getPartyConfig } from '@/lib/partyConfig';
import PartyLogo from '@/components/PartyLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function PartiesDocumentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'parties' | 'youth'>('parties');

  // Obtener partidos con su configuración
  const partiesWithConfig = Object.values(PARTIES_GENERAL).map(party => {
    const config = getPartyConfig(party.name);
    return {
      ...party,
      config: config || { color: party.color, displayName: party.name, logo: party.logo }
    };
  });

  // Filtrar partidos según búsqueda
  const filteredParties = partiesWithConfig.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.config.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar asociaciones según búsqueda
  const filteredYouth = Object.values(YOUTH_ASSOCIATIONS).filter(assoc =>
    assoc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Documentación de Partidos Políticos
          </h1>
          <p className="text-lg text-slate-600">
            Catálogo completo de partidos y asociaciones disponibles en la encuesta
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input
              placeholder="Buscar partido o asociación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('parties')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'parties'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Partidos Políticos ({filteredParties.length})
          </button>
          <button
            onClick={() => setActiveTab('youth')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'youth'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asociaciones Juveniles ({filteredYouth.length})
          </button>
        </div>

        {/* Parties Grid */}
        {activeTab === 'parties' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParties.map((party) => (
              <div
                key={party.name}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <PartyLogo partyName={party.name} size={64} />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{party.config.displayName}</h3>
                    <p className="text-sm text-slate-600">{party.name}</p>
                  </div>
                </div>

                {/* Color Display */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">Color Oficial</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-300"
                      style={{ backgroundColor: party.config.color }}
                    />
                    <code className="text-sm text-slate-700">{party.config.color}</code>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">URL del Logo</p>
                  <p className="text-xs text-slate-700 break-all bg-slate-50 p-2 rounded">
                    {party.config.logo}
                  </p>
                </div>

                {/* Copy Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(party.config.logo);
                    alert('URL copiada al portapapeles');
                  }}
                  className="w-full"
                >
                  Copiar URL
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Youth Associations Grid */}
        {activeTab === 'youth' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredYouth.map((assoc) => (
              <div
                key={assoc.name}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <PartyLogo partyName={assoc.name} size={64} />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{assoc.name}</h3>
                  </div>
                </div>

                {/* Color Display */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">Color Oficial</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-300"
                      style={{ backgroundColor: assoc.color }}
                    />
                    <code className="text-sm text-slate-700">{assoc.color}</code>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">URL del Logo</p>
                  <p className="text-xs text-slate-700 break-all bg-slate-50 p-2 rounded">
                    {assoc.logo}
                  </p>
                </div>

                {/* Copy Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(assoc.logo);
                    alert('URL copiada al portapapeles');
                  }}
                  className="w-full"
                >
                  Copiar URL
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {(activeTab === 'parties' && filteredParties.length === 0) ||
        (activeTab === 'youth' && filteredYouth.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              No se encontraron resultados para "{searchTerm}"
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
