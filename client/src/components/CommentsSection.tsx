import { useState, useEffect } from "react";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  nombre: string;
  texto: string;
  likes: number;
  created_at: string;
  tab: "general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo";
}

interface CommentsSectionProps {
  activeTab: "general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo";
}

export function CommentsSection({ activeTab }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar comentarios cuando cambia el tab
  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("comentarios_resultados")
        .select("*")
        .eq("tab", activeTab)
        .eq("estado", "aprobado")
        .order("created_at", { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error("Error loading comments:", fetchError);
        setError("Error al cargar comentarios");
        setComments([]);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Error al conectar con el servidor");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError("Por favor escribe un comentario");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { error: insertError } = await supabase
        .from("comentarios_resultados")
        .insert([
          {
            nombre: userName.trim() || "Anónimo",
            texto: newComment.trim(),
            tab: activeTab,
            likes: 0,
            estado: "aprobado",
          },
        ]);

      if (insertError) {
        console.error("Error inserting comment:", insertError);
        setError("Error al publicar comentario. Intenta de nuevo.");
      } else {
        setNewComment("");
        setUserName("");
        // Recargar comentarios
        await loadComments();
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Error al publicar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, currentLikes: number) => {
    try {
      const { error: updateError } = await supabase
        .from("comentarios_resultados")
        .update({ likes: currentLikes + 1 })
        .eq("id", commentId);

      if (!updateError) {
        // Actualizar localmente
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
          )
        );
      }
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace unos segundos";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="space-y-6 bg-black rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-[#C41E3A]" />
        <h3 className="text-xl font-bold text-white">Comentarios de Usuarios</h3>
      </div>

      {/* Formulario de comentario */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-[#888888] focus:outline-none focus:border-[#C41E3A]"
          />
          <textarea
            placeholder="Tu comentario"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-[#888888] focus:outline-none focus:border-[#C41E3A] md:col-span-2"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto bg-[#C41E3A] hover:bg-[#A01830] disabled:bg-[#666666] text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Publicando..." : "Publicar Comentario"}
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-[#888888]">Cargando comentarios...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-[#888888]">
            Sé el primero en comentar sobre estos resultados
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 space-y-2 hover:border-[#C41E3A] transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{comment.nombre}</p>
                  <p className="text-xs text-[#888888]">{formatTime(comment.created_at)}</p>
                </div>
              </div>

              <p className="text-[#DDDDDD] text-sm">{comment.texto}</p>

              <button
                onClick={() => handleLike(comment.id, comment.likes)}
                className="flex items-center gap-2 text-[#888888] hover:text-[#C41E3A] transition text-sm"
              >
                <ThumbsUp className="h-4 w-4" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
