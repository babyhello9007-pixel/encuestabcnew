import { useState, useEffect } from 'react';

interface PartyLogoProps {
  src: string;
  alt: string;
  partyName: string;
  size?: number;
}

export default function PartyLogo({ src, alt, partyName, size = 48 }: PartyLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (hasError) return; // Evitar loops infinitos
    
    // Generar variantes del nombre para intentar cargar
    const variants = [
      src,
      src.replace(/NEW\./, 'new.'),
      src.replace(/NEW\./, '.'),
      src.replace(/ó/g, 'o').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ú/g, 'u').replace(/ñ/g, 'n'),
    ];

    // Intentar la siguiente variante
    for (let i = 0; i < variants.length; i++) {
      if (variants[i] !== currentSrc) {
        setCurrentSrc(variants[i]);
        return;
      }
    }

    // Si todas las variantes fallaron, mostrar fallback
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#E8E8E8',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#999',
          fontWeight: 'bold',
          border: '1px solid #d0d0d0',
          flexShrink: 0,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
        }}
        title={partyName}
      >
        {partyName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
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
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onError={handleError}
      loading="eager"
      decoding="async"
    />
  );
}

