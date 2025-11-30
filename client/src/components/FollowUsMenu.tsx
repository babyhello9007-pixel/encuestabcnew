import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

interface LogoProps {
  src: string;
  alt: string;
  name: string;
}

function SocialLogo({ src, alt, name }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#C41E3A] to-[#A01830] rounded-lg text-xs font-bold text-white shadow-md">
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
      className="w-8 h-8 object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
      onError={() => setHasError(true)}
    />
  );
}

export default function FollowUsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Botón Síguenos con liquid glass */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-foreground transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl hover:scale-105"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        <span className="text-sm font-semibold tracking-wide">Síguenos</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menú desplegable con liquid glass */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-3 w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(30px)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header del menú */}
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-[#C41E3A]/5 to-transparent">
            <p className="text-xs font-semibold text-[#C41E3A] uppercase tracking-widest">
              Síguenos en Redes
            </p>
          </div>

          {/* Lista de enlaces */}
          <div className="p-3 space-y-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/40 transition-all duration-200 group"
                style={{
                  background: 'transparent',
                }}
              >
                {/* Logo con fondo coloreado */}
                <div
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200"
                  style={{
                    background: `${link.color}15`,
                    border: `2px solid ${link.color}30`,
                  }}
                >
                  <SocialLogo src={link.logo} alt={link.alt} name={link.name} />
                </div>

                {/* Nombre del enlace */}
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground group-hover:text-[#C41E3A] transition-colors duration-200 block">
                    {link.name}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-[#C41E3A]/70 transition-colors duration-200">
                    Síguenos
                  </span>
                </div>

                {/* Icono de flecha */}
                <div className="text-gray-400 group-hover:text-[#C41E3A] transition-colors duration-200">
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* Footer del menú */}
          <div className="px-6 py-3 border-t border-white/20 bg-gradient-to-r from-transparent to-[#C41E3A]/5">
            <p className="text-xs text-gray-600 text-center">
              Únete a nuestra comunidad
            </p>
          </div>
        </div>
      )}

      {/* Overlay para cerrar menú al hacer click fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
