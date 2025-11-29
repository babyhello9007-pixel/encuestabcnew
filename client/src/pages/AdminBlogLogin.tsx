import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, X, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BlogPost } from "@shared/types";

export default function AdminBlogLogin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Batalla Cultural",
    featuredImage: "",
    published: false,
  });

  const { data: allPosts } = trpc.blog.getAll.useQuery();
  const createMutation = trpc.blog.create.useMutation();
  const updateMutation = trpc.blog.update.useMutation();
  const deleteMutation = trpc.blog.delete.useMutation();

  useEffect(() => {
    if (allPosts) {
      setPosts(allPosts);
      setLoading(false);
    }
  }, [allPosts]);

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/discord/login-url");
      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (error) {
      console.error("Discord login error:", error);
      toast.error("Error al iniciar sesión con Discord");
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminPassword = "batalla2024";
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword("");
      toast.success("Sesión iniciada correctamente");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    toast.success("Sesión cerrada");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("El título y contenido son requeridos");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Entrada actualizada");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Entrada creada");
      }

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "Batalla Cultural",
        featuredImage: "",
        published: false,
      });
      setEditingId(null);
      setShowForm(false);

      const updated = await trpc.blog.getAll.fetch();
      setPosts(updated);
    } catch (error) {
      toast.error("Error al guardar la entrada");
      console.error(error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      author: post.author || "Batalla Cultural",
      featuredImage: post.featuredImage || "",
      published: post.published === 1,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta entrada?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Entrada eliminada");
      const updated = await trpc.blog.getAll.fetch();
      setPosts(updated);
    } catch (error) {
      toast.error("Error al eliminar la entrada");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "Batalla Cultural",
      featuredImage: "",
      published: false,
    });
  };

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
            <CardDescription>Acceso exclusivo para Escritores de Batalla Cultural</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="discord" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="discord">Discord</TabsTrigger>
                <TabsTrigger value="password">Contraseña</TabsTrigger>
              </TabsList>

              <TabsContent value="discord" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Inicia sesión con tu cuenta de Discord. Solo los miembros del servidor de Batalla Cultural con el rol "Escritores" pueden acceder.
                </p>
                <Button
                  onClick={handleDiscordLogin}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.317 4.3671a19.8062 19.8062 0 00-4.8851-1.5152.074.074 0 00-.0787.0371c-.211.3671-.444.8427-.607 1.2177a18.27 18.27 0 00-5.487 0c-.163-.3753-.399-.8506-.61-1.2177a.077.077 0 00-.0787-.037 19.7355 19.7355 0 00-4.8852 1.515.07.07 0 00-.0327.0277C.5934 9.834.298 15.6662 1.9221 21.3195a.08.08 0 00.0313.0553 19.9054 19.9054 0 005.7959 3.0294.073.073 0 00.0842-.0225 14.902 14.902 0 001.224-1.978.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.098.246.198.373.295a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.978a.076.076 0 00.084.028 19.963 19.963 0 005.803-3.029.077.077 0 00.032-.0552c1.625-5.196 1.148-10.697-.639-15.9a.061.061 0 00-.031-.03zM8.02 17.982c-1.182 0-2.157-.969-2.157-2.156 0-1.193.93-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.187-.931 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.969-2.157-2.156 0-1.193.93-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.187-.931 2.156-2.157 2.156z" />
                      </svg>
                      Iniciar sesión con Discord
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Serás redirigido a Discord para confirmar tu identidad
                </p>
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Acceder
                  </Button>
                </form>
                <p className="text-xs text-slate-500 text-center">
                  Usa la contraseña proporcionada por el administrador
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar panel de administración si está autenticado
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Administrar Blog</h1>
            <div className="flex gap-4">
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                  size="lg"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Entrada
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingId ? "Editar Entrada" : "Nueva Entrada"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Título de la entrada"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Extracto
                  </label>
                  <Input
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Breve descripción de la entrada"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contenido
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Contenido de la entrada"
                    rows={10}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Autor
                    </label>
                    <Input
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      placeholder="Nombre del autor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Imagen Destacada
                    </label>
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuredImage: e.target.value,
                        })
                      }
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        published: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <label htmlFor="published" className="text-sm font-medium">
                    Publicar entrada
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Entrada"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">
              Entradas ({posts.length})
            </h2>
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No hay entradas aún. ¡Crea la primera!
                </p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                      <p className="text-muted-foreground mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.author}</span>
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "es-ES"
                              )
                            : "No publicado"}
                        </span>
                        {post.published === 1 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Publicado
                          </span>
                        )}
                        {post.published === 0 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            Borrador
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
