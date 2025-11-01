import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, X, Plus, Trash2, FileText } from "lucide-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CodeFile {
  id: number;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  s3Key: string;
  s3Url: string | null;
  uploadedAt: Date;
  updatedAt: Date;
  userId: number;
}

export default function CodeEditor() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"uploaded" | "project">("uploaded");
  const [projectFiles, setProjectFiles] = useState<{ path: string; content: string }[]>([]);
  const [activeProjectFile, setActiveProjectFile] = useState<string | null>(null);

  const listFiles = trpc.files.list.useQuery();
  const uploadFile = trpc.files.upload.useMutation();
  const deleteFile = trpc.files.delete.useMutation();
  const getProjectFiles = trpc.files.getProjectFiles.useQuery();

  useEffect(() => {
    if (listFiles.data) {
      const codeFiles = listFiles.data.filter((f) =>
        ["text/plain", "application/json", "text/html", "text/css", "text/javascript", "application/typescript"].includes(
          f.fileType || ""
        )
      );
      setFiles(codeFiles as unknown as CodeFile[]);
      if (codeFiles.length > 0 && !activeFileId) {
        setActiveFileId(codeFiles[0].id);
        setEditorValue("");
      }
    }
  }, [listFiles.data]);

  useEffect(() => {
    if (getProjectFiles.data) {
      setProjectFiles(getProjectFiles.data);
      if (getProjectFiles.data.length > 0 && !activeProjectFile) {
        setActiveProjectFile(getProjectFiles.data[0].path);
        setEditorValue(getProjectFiles.data[0].content);
      }
    }
  }, [getProjectFiles.data]);

  const activeFile = files.find((f) => f.id === activeFileId);
  const currentProjectFile = projectFiles.find((f) => f.path === activeProjectFile);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  };

  const handleSave = async () => {
    if (!activeFile) return;

    setSaving(true);
    try {
      const base64Data = btoa(editorValue);
      await uploadFile.mutateAsync({
        fileName: activeFile.fileName,
        fileData: base64Data,
        fileType: activeFile.fileType || "text/plain",
      });

      toast.success("Archivo guardado correctamente");
      listFiles.refetch();
    } catch (error) {
      toast.error("Error al guardar archivo");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) {
      toast.error("El nombre del archivo no puede estar vacío");
      return;
    }

    setSaving(true);
    try {
      const base64Data = btoa("");
      const fileType = getFileType(newFileName);
      await uploadFile.mutateAsync({
        fileName: newFileName,
        fileData: base64Data,
        fileType,
      });

      toast.success("Archivo creado correctamente");
      setNewFileName("");
      setShowNewFileDialog(false);
      listFiles.refetch();
    } catch (error) {
      toast.error("Error al crear archivo");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) return;

    try {
      await deleteFile.mutateAsync({ id });
      toast.success("Archivo eliminado");
      if (activeFileId === id) {
        setActiveFileId(null);
        setEditorValue("");
      }
      listFiles.refetch();
    } catch (error) {
      toast.error("Error al eliminar archivo");
      console.error(error);
    }
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
      json: "application/json",
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      ts: "application/typescript",
      tsx: "application/typescript",
      txt: "text/plain",
    };
    return types[ext || ""] || "text/plain";
  };

  const getLanguage = (fileType: string | null): string => {
    const languages: Record<string, string> = {
      "application/json": "json",
      "text/html": "html",
      "text/css": "css",
      "text/javascript": "javascript",
      "application/typescript": "typescript",
      "text/plain": "plaintext",
    };
    return (fileType && languages[fileType]) || "plaintext";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Editor de Código</h1>
          <p className="text-gray-400">Edita archivos de código y del proyecto</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar - File List */}
          <div className="col-span-1">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 backdrop-blur-md bg-opacity-50 h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Archivos</h2>
                  {viewMode === "uploaded" && (
                    <button
                      onClick={() => setShowNewFileDialog(true)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                      title="Nuevo archivo"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* View Mode Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-700">
                  <button
                    onClick={() => { setViewMode("uploaded"); setActiveFileId(null); }}
                    className={`pb-2 px-2 text-sm transition-colors ${
                      viewMode === "uploaded"
                        ? "text-red-500 border-b-2 border-red-500"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Subidos
                  </button>
                  <button
                    onClick={() => { setViewMode("project"); setActiveProjectFile(null); getProjectFiles.refetch(); }}
                    className={`pb-2 px-2 text-sm transition-colors ${
                      viewMode === "project"
                        ? "text-red-500 border-b-2 border-red-500"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Proyecto
                  </button>
                </div>

                {showNewFileDialog && (
                  <div className="mb-4 p-3 bg-gray-800 rounded">
                    <input
                      type="text"
                      placeholder="nombre.js"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm mb-2"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleCreateNewFile();
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateNewFile}
                        disabled={saving}
                        className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm transition disabled:opacity-50"
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => setShowNewFileDialog(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {viewMode === "uploaded" ? (
                    files.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay archivos</p>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className={`p-2 rounded cursor-pointer transition flex items-center justify-between group ${
                            activeFileId === file.id
                              ? "bg-red-600 text-white"
                              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          }`}
                          onClick={() => {
                            setActiveFileId(file.id);
                            setEditorValue("");
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate">{file.fileName}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.id);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-700 rounded transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )
                  ) : projectFiles.length === 0 ? (
                    <p className="text-gray-500 text-sm">Cargando archivos...</p>
                  ) : (
                    projectFiles.map((file) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition flex items-center justify-between group ${
                          activeProjectFile === file.path
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => {
                          setActiveProjectFile(file.path);
                          setEditorValue(file.content);
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{file.path}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="col-span-3">
            {(viewMode === "uploaded" ? activeFile : currentProjectFile) ? (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 backdrop-blur-md bg-opacity-50 h-full overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Editor Toolbar */}
                  <div className="border-b border-gray-700 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {viewMode === "uploaded" ? activeFile?.fileName : currentProjectFile?.path}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {viewMode === "uploaded" ? activeFile?.fileType || "text/plain" : "Archivo del proyecto"}
                      </p>
                    </div>
                    {viewMode === "uploaded" && (
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Guardando..." : "Guardar"}
                      </Button>
                    )}
                  </div>

                  {/* Editor */}
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      language={getLanguage(
                        viewMode === "uploaded" ? (activeFile?.fileType || null) : null
                      )}
                      value={editorValue}
                      onChange={viewMode === "uploaded" ? handleEditorChange : undefined}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: viewMode === "project",
                      }}
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 backdrop-blur-md bg-opacity-50 h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">Selecciona un archivo para editar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

