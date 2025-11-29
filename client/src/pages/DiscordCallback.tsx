import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DiscordCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL params
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          toast.error(`Discord authentication failed: ${error}`);
          setLocation("/admin/blog/login");
          return;
        }

        if (!code) {
          toast.error("No authorization code received from Discord");
          setLocation("/admin/blog/login");
          return;
        }

        // The server has already handled the OAuth exchange and set the session cookie
        // Just redirect to the admin blog panel
        toast.success("Sesión iniciada correctamente con Discord");
        setLocation("/admin/blog/login");
      } catch (error) {
        console.error("Discord callback error:", error);
        toast.error("Error al procesar autenticación de Discord");
        setLocation("/admin/blog/login");
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Procesando autenticación...</h1>
        <p className="text-muted-foreground">
          Por favor espera mientras verificamos tu identidad con Discord
        </p>
      </div>
    </div>
  );
}
