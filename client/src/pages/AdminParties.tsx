import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, Plus, Trash2, Upload, Search, UserCircle2 } from 'lucide-react';
import PartyLogo from '@/components/PartyLogo';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { setRuntimePartyConfig } from '@/lib/partyRuntimeConfig';

interface PartyEdit {
  id: string;
  displayName: string;
  color: string;
  logo: string;
  type: 'general' | 'youth';
  isActive: boolean;
}

interface PartyLeader {
  id: number;
  partyKey: string;
  leaderName: string;
  photoUrl: string;
  isActive: boolean;
}

export default function AdminParties() {
  const logoBucket = import.meta.env.VITE_SUPABASE_LOGO_BUCKET || 'party-logos';
  const [activeTab, setActiveTab] = useState<'parties' | 'youth'>('parties');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<PartyEdit | null>(null);
  const [parties, setParties] = useState<PartyEdit[]>([]);
  const [youth, setYouth] = useState<PartyEdit[]>([]);
  const [leaders, setLeaders] = useState<PartyLeader[]>([]);
  const [editingLeaderId, setEditingLeaderId] = useState<number | null>(null);
  const [leaderEditData, setLeaderEditData] = useState<PartyLeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leaderFileInputRef = useRef<HTMLInputElement>(null);

  const loadPartyConfiguration = async () => {
    const { data, error } = await supabase
      .from('party_configuration')
      .select('party_key, display_name, color, logo_url, party_type, is_active')
      .order('party_type', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      toast.error('No se pudo cargar la configuración de partidos');
      return;
    }

    const mapped: PartyEdit[] = (data || []).map((row: any) => ({
      id: row.party_key,
      displayName: row.display_name,
      color: row.color,
      logo: row.logo_url,
      type: (row.party_type === 'youth' ? 'youth' : 'general') as 'general' | 'youth',
      isActive: row.is_active ?? true,
    }));

    setRuntimePartyConfig(
      mapped.map((row) => ({
        key: row.id,
        displayName: row.displayName,
        color: row.color,
        logoUrl: row.logo,
        partyType: row.type as 'general' | 'youth',
      }))
    );

    setParties(mapped.filter((item) => item.type === 'general'));
    setYouth(mapped.filter((item) => item.type === 'youth'));
  };

  const loadLeaders = async () => {
    const { data, error } = await supabase
      .from('party_leaders')
      .select('id, party_key, leader_name, photo_url, is_active')
      .order('party_key', { ascending: true });

    if (error) {
      console.error('Error loading leaders:', error);
      return;
    }

    setLeaders((data || []).map((row: any) => ({
      id: row.id,
      partyKey: row.party_key,
      leaderName: row.leader_name,
      photoUrl: row.photo_url,
      isActive: row.is_active ?? true,
    })));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadPartyConfiguration(), loadLeaders()]);
      setLoading(false);
    })();

    const channel = supabase
      .channel('party-configuration-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_configuration' }, loadPartyConfiguration)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_leaders' }, loadLeaders)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSyncStatus('connected');
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') setSyncStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEdit = (item: PartyEdit) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleUploadLogo = async (file: File) => {
    if (!editData) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop() || 'png';
      const safeFileName = `${editData.id.toLowerCase()}-${Date.now()}.${ext}`;
      const filePath = `logos/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(logoBucket)
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from(logoBucket).getPublicUrl(filePath);
      setEditData({ ...editData, logo: publicData.publicUrl });
      toast.success('Logo subido correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir el logo';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    const normalizedColor = editData.color.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
      toast.error('Color inválido. Usa formato hexadecimal #RRGGBB');
      return;
    }

    const { error } = await supabase
      .from('party_configuration')
      .upsert(
        {
          party_key: editData.id,
          display_name: editData.displayName.trim(),
          color: normalizedColor,
          logo_url: editData.logo,
          party_type: editData.type,
          is_active: editData.isActive,
        },
        { onConflict: 'party_key' }
      );

    if (error) {
      toast.error(`Error al guardar: ${error.message}`);
      return;
    }

    toast.success(`${editData.displayName} actualizado correctamente`);
    setEditingId(null);
    setEditData(null);
    await loadPartyConfiguration();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este elemento?')) return;
    const { error } = await supabase.from('party_configuration').delete().eq('party_key', id);
    if (error) {
      toast.error('Error al eliminar el elemento');
      return;
    }
    toast.success('Elemento eliminado correctamente');
    await loadPartyConfiguration();
  };

  const handleAddNew = async () => {
    const newId = `NEW_${Date.now()}`;
    const newItem: PartyEdit = {
      id: newId,
      displayName: 'Nuevo Partido',
      color: '#0066FF',
      logo: 'https://files.manuscdn.com/placeholder.png',
      type: activeTab === 'parties' ? 'general' : 'youth',
      isActive: true,
    };

    const { error } = await supabase.from('party_configuration').insert({
      party_key: newItem.id,
      display_name: newItem.displayName,
      color: newItem.color,
      logo_url: newItem.logo,
      party_type: newItem.type,
      is_active: true,
    });

    if (error) {
      toast.error(`Error al crear el nuevo elemento: ${error.message}`);
      return;
    }

    toast.success('Nuevo elemento creado');
    await loadPartyConfiguration();
    handleEdit(newItem);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleLeaderEdit = (item: PartyLeader) => {
    setEditingLeaderId(item.id);
    setLeaderEditData({ ...item });
  };

  const handleLeaderCancel = () => {
    setEditingLeaderId(null);
    setLeaderEditData(null);
  };

  const handleLeaderUpload = async (file: File) => {
    if (!leaderEditData) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop() || 'png';
      const safeFileName = `${leaderEditData.partyKey.toLowerCase()}-leader-${Date.now()}.${ext}`;
      const filePath = `leaders/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(logoBucket)
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from(logoBucket).getPublicUrl(filePath);
      setLeaderEditData({ ...leaderEditData, photoUrl: publicData.publicUrl });
      toast.success('Foto de líder subida');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir foto';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleLeaderSave = async () => {
    if (!leaderEditData) return;
    const { error } = await supabase
      .from('party_leaders')
      .upsert(
        {
          id: leaderEditData.id,
          party_key: leaderEditData.partyKey.trim(),
          leader_name: leaderEditData.leaderName.trim(),
          photo_url: leaderEditData.photoUrl,
          is_active: leaderEditData.isActive,
        },
        { onConflict: 'id' }
      );

    if (error) {
      toast.error(`Error guardando líder: ${error.message}`);
      return;
    }
    toast.success('Líder actualizado');
    handleLeaderCancel();
    await loadLeaders();
  };

  const handleLeaderDelete = async (id: number) => {
    if (!confirm('¿Eliminar este líder?')) return;
    const { error } = await supabase.from('party_leaders').delete().eq('id', id);
    if (error) {
      toast.error(`Error eliminando líder: ${error.message}`);
      return;
    }
    toast.success('Líder eliminado');
    await loadLeaders();
  };

  const handleLeaderAdd = async () => {
    const fallbackParty = parties[0]?.id || youth[0]?.id || 'PP';
    const { error } = await supabase.from('party_leaders').insert({
      party_key: fallbackParty,
      leader_name: 'Nuevo líder',
      photo_url: 'https://files.manuscdn.com/placeholder.png',
      is_active: true,
    });

    if (error) {
      toast.error(`Error creando líder: ${error.message}`);
      return;
    }
    toast.success('Líder creado');
    await loadLeaders();
  };

  const currentData = activeTab === 'parties' ? parties : youth;
  const filteredData = useMemo(
    () => currentData.filter((item) => item.id.toLowerCase().includes(searchTerm.toLowerCase()) || item.displayName.toLowerCase().includes(searchTerm.toLowerCase())),
    [currentData, searchTerm]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Administración de Partidos</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${syncStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : syncStatus === 'connecting' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {syncStatus === 'connected' ? 'Sincronizado con Supabase' : syncStatus === 'connecting' ? 'Conectando Supabase…' : 'Error de sincronización'}
            </span>
          </div>
          <p className="text-slate-600">Gestión directa con Supabase: cambios de partidos y líderes se reflejan en Resultados.</p>
        </div>

        <div className="glass-surface p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 border border-slate-200 rounded-xl p-1">
              <button onClick={() => setActiveTab('parties')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'parties' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Partidos ({parties.length})
              </button>
              <button onClick={() => setActiveTab('youth')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'youth' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Asociaciones ({youth.length})
              </button>
            </div>
            <Button onClick={handleAddNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700"><Plus size={18} /> Agregar Nuevo</Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" placeholder="Buscar por clave o nombre" />
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadLogo(e.target.files[0])} />

        <div className="glass-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Logo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Clave</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Nombre mostrado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Color</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">URL Logo</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70 align-top">
                  {editingId === item.id && editData ? (
                    <>
                      <td className="px-4 py-3"><div className="flex flex-col gap-2"><PartyLogo src={editData.logo} alt={editData.displayName} partyName={editData.displayName} size={42} /><Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Upload size={14} className="mr-1" />{uploading ? 'Subiendo...' : 'Subir'}</Button></div></td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.id}</td>
                      <td className="px-4 py-3"><Input value={editData.displayName} onChange={(e) => setEditData({ ...editData, displayName: e.target.value })} /></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><input type="color" value={editData.color} onChange={(e) => setEditData({ ...editData, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><Input value={editData.color} onChange={(e) => setEditData({ ...editData, color: e.target.value })} className="w-32" /></div></td>
                      <td className="px-4 py-3"><Input value={editData.logo} onChange={(e) => setEditData({ ...editData, logo: e.target.value })} placeholder="https://..." /></td>
                      <td className="px-4 py-3"><div className="flex justify-center gap-2"><Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save size={16} /></Button><Button size="sm" variant="outline" onClick={handleCancel}><X size={16} /></Button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3"><PartyLogo src={item.logo} alt={item.displayName} partyName={item.displayName} size={42} /></td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
                      <td className="px-4 py-3 text-slate-700">{item.displayName}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded border border-slate-300" style={{ backgroundColor: item.color }} /><code className="text-xs text-slate-700">{item.color}</code></div></td>
                      <td className="px-4 py-3 max-w-xs"><p className="text-sm text-slate-600 truncate">{item.logo}</p></td>
                      <td className="px-4 py-3"><div className="flex justify-center gap-2"><Button size="sm" onClick={() => handleEdit(item)} className="bg-blue-600 hover:bg-blue-700"><Edit2 size={16} /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></Button></div></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <input ref={leaderFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLeaderUpload(e.target.files[0])} />
        <div className="glass-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserCircle2 className="h-6 w-6" />Líderes de Partidos</h2>
            <Button onClick={handleLeaderAdd} className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-1" />Añadir líder</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {leaders.map((leader) => {
              const isEditing = editingLeaderId === leader.id && leaderEditData;
              const current = isEditing ? leaderEditData : leader;
              if (!current) return null;
              return (
                <div key={leader.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <PartyLogo src={current.photoUrl} alt={current.leaderName} partyName={current.leaderName} size={48} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">{current.partyKey}</p>
                      {isEditing ? <Input value={current.leaderName} onChange={(e) => setLeaderEditData({ ...current, leaderName: e.target.value })} /> : <h3 className="font-semibold text-slate-900">{current.leaderName}</h3>}
                    </div>
                  </div>
                  {isEditing ? (
                    <>
                      <Input value={current.partyKey} onChange={(e) => setLeaderEditData({ ...current, partyKey: e.target.value })} placeholder="Clave del partido" />
                      <Input value={current.photoUrl} onChange={(e) => setLeaderEditData({ ...current, photoUrl: e.target.value })} placeholder="URL foto" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => leaderFileInputRef.current?.click()} disabled={uploading}><Upload size={14} className="mr-1" />Subir</Button>
                        <Button size="sm" onClick={handleLeaderSave} className="bg-green-600 hover:bg-green-700"><Save size={14} /></Button>
                        <Button size="sm" variant="outline" onClick={handleLeaderCancel}><X size={14} /></Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleLeaderEdit(leader)} className="bg-blue-600 hover:bg-blue-700"><Edit2 size={14} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleLeaderDelete(leader.id)}><Trash2 size={14} /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
