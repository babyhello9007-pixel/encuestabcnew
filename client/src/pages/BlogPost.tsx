import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronDown, Share2, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BlogPost } from "@shared/types";
import Footer from "@/components/Footer";
import FollowUsMenu from "@/components/FollowUsMenu";
import { toast } from "sonner";

export default function BlogPostPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/blog/:id");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEncuestaMenu, setShowEncuestaMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: allPosts } = trpc.blog.getPublished.useQuery();
  const post_data = allPosts?.find(p => p.slug === params?.id || p.id.toString() === params?.id);

  useEffect(() => {
    if (allPosts && params?.id) {
      const foundPost = allPosts.find(p => p.slug === params.id || p.id.toString() === params.id);
      if (foundPost) {
        setPost(foundPost);
        document.title = `${foundPost.title} - Batalla Cultural`;
      }
      setLoading(false);
    }
  }, [allPosts, params?.id]);

  if (!match) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
              <h1 className="text-lg font-semibold text-primary">Batalla Cultural</h1>
            </div>
            <nav className="hidden md:flex gap-8 text-sm items-center">
              <a href="/blog" className="text-foreground hover:text-primary transition font-medium">
                Volver al Blog
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Artículo no encontrado</h2>
            <Button onClick={() => setLocation("/blog")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    const url = `${window.location.origin}/blog/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareSocial = (platform: string) => {
    const url = `${window.location.origin}/blog/${post.id}`;
    const text = `${post.title} - Batalla Cultural`;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-primary">Batalla Cultural</h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm items-center">
            <div className="relative group">
              <button
                onClick={() => setShowEncuestaMenu(!showEncuestaMenu)}
                className="text-foreground hover:text-primary transition font-medium flex items-center gap-1"
              >
                Encuesta
                <ChevronDown size={16} />
              </button>
              {showEncuestaMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 frosted-glass rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => { setLocation("/nano-encuesta"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    NanoEncuestaBC (5 min)
                  </button>
                  <button
                    onClick={() => { setLocation("/encuesta"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    Encuesta Completa (20 min)
                  </button>
                </div>
              )}
            </div>
            <a href="/resultados" className="text-foreground hover:text-primary transition font-medium">
              Resultados
            </a>
            <a href="/acerca-de" className="text-foreground hover:text-primary transition font-medium">
              Acerca de
            </a>
            <a href="/blog" className="text-foreground hover:text-primary transition font-medium">
              Blog
            </a>
            <FollowUsMenu />
          </nav>
        </div>
      </header>

      {/* Article Content */}
      <main className="flex-1">
        <div className="container py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blog")}
            className="mb-6 gap-2 text-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Button>

          <article className="max-w-3xl mx-auto">
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg mb-8 shadow-lg"
              />
            )}

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(post.createdAt).toLocaleDateString("es-ES")}</span>
                  {post.author && <span>Por {post.author}</span>}

                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button
                    onClick={() => handleShareSocial("twitter")}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShareSocial("facebook")}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </div>
            </div>

            {post.content && (
              <div
                className="prose prose-slate max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}


          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Importar Check icon
import { Check } from "lucide-react";
