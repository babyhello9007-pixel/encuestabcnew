import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SocialLink {
  name: string;
  url: string;
  logo: string;
  alt: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'X (Twitter)',
    url: 'https://x.com/bcultural_es',
    logo: '/assets/icons/x-logo.png',
    alt: 'X Logo',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/Tc8JabgY3T',
    logo: '/assets/icons/discord-logo.png',
    alt: 'Discord Logo',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/bcultural-es.bsky.social',
    logo: '/assets/icons/bluesky-logo.png',
    alt: 'Bluesky Logo',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/bcultural_es/',
    logo: '/assets/icons/instagram-logo.gif',
    alt: 'Instagram Logo',
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
      <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded text-xs font-bold text-gray-700">
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
      className="w-6 h-6 object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
      onError={() => setHasError(true)}
    />
  );
}

export default function FollowUsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Botón Síguenos */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 border border-white/20"
      >
        <span className="text-sm font-medium">Síguenos</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-50">
          <div className="p-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-black/5 transition-colors duration-150 group"
              >
                {/* Logo con fallback robusto */}
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  <SocialLogo src={link.logo} alt={link.alt} name={link.name} />
                </div>
                {/* Nombre del enlace */}
                <span className="text-sm font-medium text-foreground group-hover:text-[#C41E3A] transition-colors">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
