import { useState } from 'react';
import ImageLoader from './ImageLoader';

interface PartyLogoProps {
  src: string;
  alt: string;
  partyName: string;
  size?: number;
}

export default function PartyLogo({ src, alt, partyName, size = 48 }: PartyLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        src={src} 
        alt={alt} 
        fallbackText={partyName.substring(0, 2).toUpperCase()}
        size={size}
      />
    </div>
  );
}

