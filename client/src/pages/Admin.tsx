import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Download, FileIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Admin() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const listFiles = trpc.files.list.useQuery();
  const uploadFile = trpc.files.upload.useMutation();
  const deleteFile = trpc.files.delete.useMutation();
  const downloadFile = trpc.files.download.useQuery(
    { id: 0 },
    { enabled: false }
  );

  useEffect(() => {
    if (listFiles.data) {
      setFiles(listFiles.data);
      setLoading(false);
    }
  }, [listFiles.data]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];

        await uploadFile.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          fileType: file.type,
        });

        toast.success("Archivo subido correctamente");
        listFiles.refetch();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error al subir archivo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) return;

    try {
      await deleteFile.mutateAsync({ id });
      toast.success("Archivo eliminado");
      listFiles.refetch();
    } catch (error) {
      toast.error("Error al eliminar archivo");
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Administrador</h1>
          <p className="text-gray-400">Gestiona los archivos de la encuesta</p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6 mb-8 backdrop-blur-md bg-opacity-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Archivo
            </h2>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-red-500 transition">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">
                {uploading ? "Subiendo..." : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-sm text-gray-500">Máximo 100MB</p>
            </label>
          </div>
        </Card>

        {/* Files List */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 backdrop-blur-md bg-opacity-50">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Archivos Subidos</h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Cargando archivos...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No hay archivos subidos aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold">Tamaño</th>
                      <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      <th className="text-right py-3 px-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr
                        key={file.id}
                        className="border-b border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4 text-gray-300">{file.fileName}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {formatFileSize(file.fileSize)}
                        </td>
                        <td className="py-3 px-4 text-gray-400">{file.fileType}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {formatDate(file.uploadedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={file.s3Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-700 rounded transition"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="p-2 hover:bg-red-900 rounded transition text-red-400"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

