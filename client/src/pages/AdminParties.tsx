import { useState } from 'react';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from '@/lib/surveyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import PartyLogo from '@/components/PartyLogo';

interface PartyEdit {
  id: string;
  name: string;
  displayName: string;
  color: string;
  logo: string;
}

export default function AdminParties() {
  const [activeTab, setActiveTab] = useState<'parties' | 'youth'>('parties');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<PartyEdit | null>(null);
  const [parties, setParties] = useState(
    Object.entries(PARTIES_GENERAL).map(([key, party]) => ({
      id: key,
      name: party.name,
      displayName: party.name,
      color: party.color,
      logo: party.logo,
    }))
  );
  const [youth, setYouth] = useState(
    Object.entries(YOUTH_ASSOCIATIONS).map(([key, assoc]) => ({
      id: key,
      name: assoc.name,
      displayName: assoc.name,
      color: assoc.color,
      logo: assoc.logo,
    }))
  );

  const handleEdit = (item: PartyEdit) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = () => {
    if (!editData) return;

    if (activeTab === 'parties') {
      setParties(parties.map(p => p.id === editData.id ? editData : p));
    } else {
      setYouth(youth.map(y => y.id === editData.id ? editData : y));
    }

    setEditingId(null);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      if (activeTab === 'parties') {
        setParties(parties.filter(p => p.id !== id));
      } else {
        setYouth(youth.filter(y => y.id !== id));
      }
    }
  };

  const handleAddNew = () => {
    const newId = `NEW_${Date.now()}`;
    const newItem: PartyEdit = {
      id: newId,
      name: 'Nuevo Partido',
      displayName: 'Nuevo Partido',
      color: '#0066FF',
      logo: 'https://files.manuscdn.com/placeholder.png',
    };

    if (activeTab === 'parties') {
      setParties([...parties, newItem]);
    } else {
      setYouth([...youth, newItem]);
    }

    handleEdit(newItem);
  };

  const currentData = activeTab === 'parties' ? parties : youth;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Administración de Partidos
          </h1>
          <p className="text-lg text-slate-600">
            Gestiona nombres, siglas, colores y URLs de logos
          </p>
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
            Partidos Políticos ({parties.length})
          </button>
          <button
            onClick={() => setActiveTab('youth')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'youth'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asociaciones Juveniles ({youth.length})
          </button>
        </div>

        {/* Add New Button */}
        <div className="mb-6">
          <Button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus size={20} />
            Agregar Nuevo
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Logo</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Nombre Mostrado</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Color</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">URL Logo</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                  {editingId === item.id && editData ? (
                    <>
                      <td className="px-6 py-4">
                        <PartyLogo partyName={editData.displayName} size={48} />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={editData.displayName}
                          onChange={(e) =>
                            setEditData({ ...editData, displayName: e.target.value })
                          }
                          className="text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editData.color}
                            onChange={(e) =>
                              setEditData({ ...editData, color: e.target.value })
                            }
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={editData.color}
                            onChange={(e) =>
                              setEditData({ ...editData, color: e.target.value })
                            }
                            className="text-sm flex-1"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={editData.logo}
                          onChange={(e) =>
                            setEditData({ ...editData, logo: e.target.value })
                          }
                          className="text-sm"
                          placeholder="https://..."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <PartyLogo partyName={item.displayName} size={48} />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-slate-700">{item.displayName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-slate-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <code className="text-sm text-slate-700">{item.color}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 truncate max-w-xs">
                          {item.logo}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export/Import Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Exportar/Importar</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                const data = {
                  parties,
                  youth,
                  exportedAt: new Date().toISOString(),
                };
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `parties-backup-${Date.now()}.json`;
                a.click();
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Descargar Backup
            </Button>
            <p className="text-sm text-slate-600 flex items-center">
              Descarga un backup de todos los partidos y asociaciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
