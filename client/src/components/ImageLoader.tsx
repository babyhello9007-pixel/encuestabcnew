import { useState, useEffect } from 'react';

interface ImageLoaderProps {
  src: string;
  alt: string;
  fallbackText?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageLoader({ 
  src, 
  alt, 
  fallbackText = '?',
  size = 48,
  className = '',
  style = {}
}: ImageLoaderProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const generateFallbacks = (originalSrc: string): string[] => {
    const fallbacks = [originalSrc];
    
    // Variante 1: Cambiar acentos
    const noAccents = originalSrc
      .replace(/ó/g, 'o')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n');
    if (noAccents !== originalSrc) fallbacks.push(noAccents);
    
    // Variante 2: Cambiar mayúsculas/minúsculas
    const lowerCase = originalSrc.toLowerCase();
    if (lowerCase !== originalSrc) fallbacks.push(lowerCase);
    
    // Variante 3: Cambiar NEW a new
    const newToLower = originalSrc.replace(/NEW\./g, 'new.');
    if (newToLower !== originalSrc) fallbacks.push(newToLower);
    
    // Variante 4: Remover NEW
    const noNew = originalSrc.replace(/NEW\./g, '.');
    if (noNew !== originalSrc) fallbacks.push(noNew);
    
    // Variante 5: Cambiar extensión
    const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    for (const ext of extensions) {
      const withExt = originalSrc.replace(/\.[^.]+$/, ext);
      if (!fallbacks.includes(withExt)) fallbacks.push(withExt);
    }
    
    return fallbacks;
  };

  const handleError = () => {
    const fallbacks = generateFallbacks(currentSrc);
    const currentIndex = fallbacks.indexOf(currentSrc);
    
    if (currentIndex < fallbacks.length - 1) {
      setCurrentSrc(fallbacks[currentIndex + 1]);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#f0f0f0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#999',
          border: '1px solid #ddd',
          flexShrink: 0,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          ...style,
        }}
        title={alt}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        backgroundColor: '#ffffff',
        padding: '2px',
        borderRadius: '12px',
        display: 'block',
        border: '1px solid #e0e0e0',
        opacity: isLoading ? '0.6' : '1',
        transition: 'opacity 0.3s ease-in-out',
        flexShrink: 0,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        ...style,
      }}
      loading="eager"
      decoding="async"
      className={className}
    />
  );
}

