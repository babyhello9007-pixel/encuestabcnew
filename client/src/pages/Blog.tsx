import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BlogPost } from "@shared/types";

export default function Blog() {
  const [, setLocation] = useLocation();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: publishedPosts } = trpc.blog.getPublished.useQuery();

  useEffect(() => {
    if (publishedPosts) {
      setPosts(publishedPosts);
      setLoading(false);
    }
  }, [publishedPosts]);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-6 gap-2"
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
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">El Blog de BC</h1>
            <p className="text-lg text-muted-foreground">
              Artículos y análisis sobre la batalla cultural, política y
              sociedad
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay entradas publicadas aún. ¡Vuelve pronto!
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                        <h2 className="text-2xl font-bold mb-2">
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
    </div>
  );
}
