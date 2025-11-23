import { useState, useEffect } from "react";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  nombre: string;
  texto: string;
  likes: number;
  created_at: string;
  tab: "general" | "youth";
}

interface CommentsSectionProps {
  activeTab: "general" | "youth";
}

export function CommentsSection({ activeTab }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cargar comentarios
  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comentarios_resultados")
        .select("*")
        .eq("tab", activeTab)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setComments(data);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
      // Usar comentarios de ejemplo si hay error
      setComments([
        {
          id: "1",
          nombre: "Usuario Anónimo",
          texto: "Excelente encuesta, muy completa y bien organizada.",
          likes: 5,
          created_at: new Date().toISOString(),
          tab: activeTab,
        },
        {
          id: "2",
          nombre: "Ciudadano Interesado",
          texto: "Los resultados son muy interesantes. ¿Cuándo se actualizan?",
          likes: 3,
          created_at: new Date().toISOString(),
          tab: activeTab,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from("comentarios_resultados")
        .insert([
          {
            nombre: userName,
            texto: newComment,
            tab: activeTab,
            likes: 0,
          },
        ])
        .select();

      if (!error && data) {
        setComments([data[0], ...comments]);
        setNewComment("");
        setUserName("");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      // Agregar comentario localmente si hay error
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        nombre: userName,
        texto: newComment,
        likes: 0,
        created_at: new Date().toISOString(),
        tab: activeTab,
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setUserName("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, currentLikes: number) => {
    try {
      await supabase
        .from("comentarios_resultados")
        .update({ likes: currentLikes + 1 })
        .eq("id", commentId);

      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const formatDate = (dateString: string) => {
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
    <section className="mb-12 space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-[#C41E3A]" />
        <h2 className="text-3xl font-bold text-white">Comentarios de Usuarios</h2>
      </div>

      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmitComment} className="glass-card p-6 rounded-xl space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-[#999999]">Tu nombre (opcional)</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nombre o apodo"
            className="w-full bg-[#0F1419] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder-[#666666] focus:outline-none focus:border-[#C41E3A]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#999999]">Tu comentario</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comparte tu opinión sobre los resultados..."
            rows={3}
            className="w-full bg-[#0F1419] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder-[#666666] focus:outline-none focus:border-[#C41E3A] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="w-full bg-[#C41E3A] hover:bg-[#A01830] disabled:bg-[#666666] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Enviando..." : "Publicar Comentario"}
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-[#999999]">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center">
            <p className="text-[#999999]">Sé el primero en comentar sobre estos resultados</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="glass-card p-6 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{comment.nombre || "Usuario Anónimo"}</p>
                  <p className="text-xs text-[#666666]">{formatDate(comment.created_at)}</p>
                </div>
              </div>

              <p className="text-[#E8E8E8] leading-relaxed">{comment.texto}</p>

              <button
                onClick={() => handleLike(comment.id, comment.likes)}
                className="flex items-center gap-2 text-[#999999] hover:text-[#C41E3A] transition text-sm"
              >
                <ThumbsUp className="h-4 w-4" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

