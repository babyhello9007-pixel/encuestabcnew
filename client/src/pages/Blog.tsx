import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BlogPost } from "@shared/types";
import Footer from "@/components/Footer";
import FollowUsMenu from "@/components/FollowUsMenu";


export default function Blog() {
  const [, setLocation] = useLocation();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEncuestaMenu, setShowEncuestaMenu] = useState(false);

  const { data: publishedPosts } = trpc.blog.getPublished.useQuery();

  useEffect(() => {
    if (publishedPosts) {
      setPosts(publishedPosts);
      setLoading(false);
    }
  }, [publishedPosts]);

  if (selectedPost) {
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
                    <button
                      onClick={() => { setLocation("/lideres"); setShowEncuestaMenu(false); }}
                      className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                    >
                      Elige a tus Líderes
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
              onClick={() => setSelectedPost(null)}
              className="mb-6 gap-2 text-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Button>

            <article className="max-w-3xl mx-auto">
              {selectedPost.featuredImage && (
                <img
                  src={selectedPost.featuredImage}
                  alt={selectedPost.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />
              )}

              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-4 text-foreground">{selectedPost.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedPost.author}</span>
                  <span>
                    {selectedPost.publishedAt
                      ? new Date(selectedPost.publishedAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Sin publicar"}
                  </span>
                </div>
              </div>

              {selectedPost.excerpt && (
                <p className="text-lg text-muted-foreground mb-8 italic">
                  {selectedPost.excerpt}
                </p>
              )}

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div
                  className="whitespace-pre-wrap text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>
            </article>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

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
                  <button
                    onClick={() => { setLocation("/lideres"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    Elige a tus Líderes
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

      {/* Main Content */}
      <main className="flex-1">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary -z-10" />

        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 space-y-4">
              <h1 className="text-5xl font-bold text-foreground">El Blog de <span className="text-primary">Batalla Cultural</span></h1>
              <p className="text-xl text-muted-foreground">
                Artículos y análisis sobre la batalla cultural, política y sociedad
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="liquid-glass p-8 rounded-lg text-center">
                <p className="text-muted-foreground text-lg">
                  No hay entradas publicadas aún. ¡Vuelve pronto!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer glass-card"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex gap-6 p-6">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="h-48 w-48 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2 text-foreground">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{post.author}</span>
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "Sin publicar"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
