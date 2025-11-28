import { useState } from 'react';

interface PartyLogoProps {
  src: string;
  alt: string;
  partyName: string;
  size?: number;
}

export default function PartyLogo({ src, alt, partyName, size = 48 }: PartyLogoProps) {
  const [loadError, setLoadError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Si no hay src, mostrar fallback
  if (!src || src.trim() === '') {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#cccccc',
          border: '1px solid #999999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          fontSize: '10px',
          color: '#666666',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '2px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        title={`Sin logo: ${partyName}`}
      >
        N/A
      </div>
    );
  }

  // Si hay error de carga, mostrar fallback
  if (loadError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          fontSize: '10px',
          color: '#999',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '2px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        title={`Error cargando logo: ${partyName}`}
      >
        {partyName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        backgroundColor: '#ffffff',
        padding: '2px',
        borderRadius: '12px',
        display: 'block',
        border: '1px solid #e0e0e0',
        opacity: '1',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        flexShrink: 0,
        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        cursor: 'pointer',
      }}
      onLoad={() => setLoadError(false)}
      onError={() => setLoadError(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}

