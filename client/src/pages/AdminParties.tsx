import { useState, useEffect, useRef } from 'react';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from '@/lib/surveyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import PartyLogo from '@/components/PartyLogo';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
  const [parties, setParties] = useState<PartyEdit[]>([]);
  const [youth, setYouth] = useState<PartyEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener datos de partidos desde tRPC
  const { data: partiesData, isLoading: isLoadingParties } = trpc.parties.getAll.useQuery();
  const updatePartyMutation = trpc.parties.update.useMutation();
  const createPartyMutation = trpc.parties.create.useMutation();
  const deletePartyMutation = trpc.parties.delete.useMutation();

  // Cargar datos cuando estén disponibles
  useEffect(() => {
    if (partiesData) {
      setParties(
        partiesData.parties.map((p) => ({
          id: p.partyKey,
          name: p.partyKey,
          displayName: p.displayName,
          color: p.color,
          logo: p.logoUrl,
        }))
      );
      setYouth(
        partiesData.youth.map((y) => ({
          id: y.partyKey,
          name: y.partyKey,
          displayName: y.displayName,
          color: y.color,
          logo: y.logoUrl,
        }))
      );
      setLoading(false);
    }
  }, [partiesData]);

  const handleEdit = (item: PartyEdit) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleUploadLogo = async (file: File) => {
    if (!editData) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const logoUrl = data.url;

      setEditData({ ...editData, logo: logoUrl });
      toast.success('Logo subido correctamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      await updatePartyMutation.mutateAsync({
        partyKey: editData.id,
        displayName: editData.displayName,
        color: editData.color,
        logoUrl: editData.logo,
        isActive: true,
      });

      if (activeTab === 'parties') {
        setParties(parties.map(p => p.id === editData.id ? editData : p));
      } else {
        setYouth(youth.map(y => y.id === editData.id ? editData : y));
      }

      toast.success(`${editData.displayName} actualizado correctamente`);
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error('Error saving party:', error);
      toast.error('Error al guardar los cambios');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        await deletePartyMutation.mutateAsync({ partyKey: id });

        if (activeTab === 'parties') {
          setParties(parties.filter(p => p.id !== id));
        } else {
          setYouth(youth.filter(y => y.id !== id));
        }

        toast.success('Elemento eliminado correctamente');
      } catch (error) {
        console.error('Error deleting party:', error);
        toast.error('Error al eliminar el elemento');
      }
    }
  };

  const handleAddNew = async () => {
    const newId = `NEW_${Date.now()}`;
    const newItem: PartyEdit = {
      id: newId,
      name: 'Nuevo Partido',
      displayName: 'Nuevo Partido',
      color: '#0066FF',
      logo: 'https://files.manuscdn.com/placeholder.png',
    };

    try {
      await createPartyMutation.mutateAsync({
        partyKey: newId,
        displayName: newItem.displayName,
        color: newItem.color,
        logoUrl: newItem.logo,
        type: activeTab === 'parties' ? 'general' : 'youth',
      });

      if (activeTab === 'parties') {
        setParties([...parties, newItem]);
      } else {
        setYouth([...youth, newItem]);
      }

      handleEdit(newItem);
      toast.success('Nuevo elemento creado');
    } catch (error) {
      console.error('Error creating party:', error);
      toast.error('Error al crear el nuevo elemento');
    }
  };

  const currentData = activeTab === 'parties' ? parties : youth;

  if (loading || isLoadingParties) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUploadLogo(e.target.files[0]);
            }
          }}
        />

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
                        <div className="flex flex-col gap-2">
                          <PartyLogo partyName={editData.displayName} size={48} />
                          <Button
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Upload size={14} />
                            {uploading ? 'Subiendo...' : 'Subir'}
                          </Button>
                        </div>
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
