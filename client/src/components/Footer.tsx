import { Mail, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'X (Twitter)',
      url: 'https://x.com/bcultural_es',
      icon: '𝕏',
      color: 'hover:text-black dark:hover:text-white',
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/Tc8JabgY3T',
      icon: '💬',
      color: 'hover:text-blue-600',
    },
    {
      name: 'Bluesky',
      url: 'https://bsky.app/profile/bcultural-es.bsky.social',
      icon: '🦋',
      color: 'hover:text-blue-400',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/bcultural_es/',
      icon: '📷',
      color: 'hover:text-pink-500',
    },
  ];

  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
              <h3 className="font-bold text-lg text-foreground">Batalla Cultural</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              La Encuesta de Batalla Cultural: Análisis político, juventud y futuro de España.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Enlaces Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
                Inicio
              </a>
              <a href="/encuesta" className="text-sm text-muted-foreground hover:text-foreground transition">
                Encuesta Completa
              </a>
              <a href="/nano-encuesta" className="text-sm text-muted-foreground hover:text-foreground transition">
                Versión Rápida (5 min)
              </a>
              <a href="/resultados" className="text-sm text-muted-foreground hover:text-foreground transition">
                Resultados en Vivo
              </a>
              <a href="/acerca-de" className="text-sm text-muted-foreground hover:text-foreground transition">
                Acerca de
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <p className="text-sm text-muted-foreground">
              Síguenos en nuestras redes sociales para estar al día de los resultados.
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-border pt-8 mb-8">
          <h4 className="font-semibold text-foreground mb-4">Síguenos</h4>
          <div className="flex gap-6 flex-wrap">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-muted-foreground transition ${link.color}`}
                title={link.name}
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-sm">{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Batalla Cultural. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Encuesta anónima y pública sobre política, cultura y futuro de España.
          </p>
        </div>
      </div>
    </footer>
  );
}
