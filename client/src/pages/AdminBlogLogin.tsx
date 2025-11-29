import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminBlogLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

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
    
    // Simple password check - in production, use proper authentication
    const adminPassword = "batalla2024"; // TODO: Move to environment variable
    
    if (password === adminPassword) {
      setLocation("/admin/blog");
      toast.success("Sesión iniciada correctamente");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

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
