import { useState } from 'react';
import { useLocation } from "wouter";
import { ExternalLink } from "lucide-react";
import { APP_LOGO } from "@/const";

interface SocialLink {
  name: string;
  url: string;
  logo: string;
  alt: string;
  color: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'X',
    url: 'https://x.com/bcultural_es',
    logo: '/assets/icons/x-logo.png',
    alt: 'X Logo',
    color: '#000000',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/Tc8JabgY3T',
    logo: '/assets/icons/discord-logo.png',
    alt: 'Discord Logo',
    color: '#5865F2',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/bcultural-es.bsky.social',
    logo: '/assets/icons/bluesky-logo.png',
    alt: 'Bluesky Logo',
    color: '#1185FE',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/bcultural_es/',
    logo: '/assets/icons/instagram-logo.gif',
    alt: 'Instagram Logo',
    color: '#E4405F',
  },
];

function SocialLogo({ src, alt, name }: { src: string; alt: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#C41E3A] to-[#A01830] rounded-lg text-xs font-bold text-white shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="sync"
      className="w-10 h-10 object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
      onError={() => setHasError(true)}
    />
  );
}

export default function Bio() {
  const [, setLocation] = useLocation();

  const links = [
    {
      title: "Versión Rápida",
      description: "Encuesta de 5 minutos",
      action: () => setLocation("/nano-encuesta"),
      icon: "⚡",
      color: "from-orange-400 to-red-500",
    },
    {
      title: "Resultados En Vivo",
      description: "Visualiza los datos en tiempo real",
      action: () => setLocation("/resultados"),
      icon: "📊",
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "El Blog de BC",
      description: "Artículos y análisis",
      action: () => setLocation("/blog"),
      icon: "📝",
      color: "from-purple-400 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col items-center justify-center px-4 py-8">
      {/* Header con Logo */}
      <div className="text-center mb-12 max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={APP_LOGO}
            alt="Batalla Cultural"
            className="h-20 w-20 rounded-full shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Batalla Cultural
        </h1>
        <p className="text-lg text-muted-foreground">
          Participa en la encuesta más importante sobre el futuro político y
          cultural de España
        </p>
      </div>

      {/* Enlaces Principales */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {links.map((link) => (
          <button
            key={link.title}
            onClick={link.action}
            className={`w-full p-6 rounded-2xl bg-gradient-to-r ${link.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-1">{link.icon}</div>
                <h2 className="text-xl font-bold">{link.title}</h2>
                <p className="text-sm opacity-90">{link.description}</p>
              </div>
              <ExternalLink className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Redes Sociales */}
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Síguenos en Redes Sociales
          </h3>
          <p className="text-sm text-muted-foreground">
            Mantente actualizado con las últimas noticias
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-110 group"
              style={{
                background: `${social.color}15`,
                border: `2px solid ${social.color}30`,
              }}
              title={social.name}
            >
              <div className="mb-2 group-hover:drop-shadow-lg transition-all duration-300">
                <SocialLogo src={social.logo} alt={social.alt} name={social.name} />
              </div>
              <span className="text-xs font-medium text-center text-foreground group-hover:text-[#C41E3A] transition-colors duration-300">
                {social.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md text-center text-sm text-muted-foreground border-t border-border pt-6 mt-8">
        <p>
          III Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos
          y públicos
        </p>
      </div>
    </div>
  );
}
