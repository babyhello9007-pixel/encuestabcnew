import { useState } from 'react';
import ImageLoader from './ImageLoader';
import { getPartyLogo, getPartyConfig } from '@/lib/partyConfig';

interface PartyLogoProps {
  src?: string;
  alt?: string;
  partyName?: string;
  partyId?: string;
  size?: number;
}

export default function PartyLogo({ src, alt, partyName, partyId, size = 48 }: PartyLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determinar el nombre del partido y el logo
  let finalPartyName = partyName || '';
  let finalSrc = src;
  let finalAlt = alt || '';

  // Si se proporciona partyId, usar configuración dinámica por clave
  if (partyId && !partyName) {
    const party = getPartyConfig(partyId);
    finalPartyName = party.displayName || partyId;
    finalSrc = party.logo;
    finalAlt = party.displayName || partyId;
  }

  // Si no hay src, obtener del config de partidos
  if (!finalSrc && finalPartyName) {
    finalSrc = getPartyLogo(finalPartyName);
    if (!finalAlt) {
      finalAlt = finalPartyName;
    }
  }

  // Fallback si no hay información
  if (!finalSrc) {
    finalSrc = '/assets/icons/Otros.png';
    finalAlt = 'Partido desconocido';
  }

  if (!finalPartyName) {
    finalPartyName = 'Partido';
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.3s ease-in-out',
        cursor: 'pointer',
      }}
    >
      <ImageLoader 
        src={finalSrc} 
        alt={finalAlt} 
        fallbackText={finalPartyName.substring(0, 2).toUpperCase()}
        size={size}
      />
    </div>
  );
}
