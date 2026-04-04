import { useState, useEffect } from 'react';
import { EMBEDDED_LOGOS } from '@/lib/embeddedLogos';

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
  const isValidImageSource = (value: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.startsWith('/')) return true;
    if (trimmed.startsWith('data:image/')) return true;
    if (/^https?:\/\//i.test(trimmed)) return true;
    return false;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!isValidImageSource(src)) return '';
    // Primero intenta obtener desde logos embebidos
    const filename = src.split('/').pop() || '';
    if (filename && EMBEDDED_LOGOS[filename]) {
      return EMBEDDED_LOGOS[filename];
    }
    // Buscar variantes (ej: arran-new.png si busca arran.png)
    const basename = filename.replace(/\.[^.]+$/, '').toLowerCase();
    const embeddedKey = Object.keys(EMBEDDED_LOGOS).find(key => 
      key.toLowerCase().includes(basename) || basename.includes(key.toLowerCase().replace(/\.[^.]+$/, ''))
    );
    if (embeddedKey) {
      return EMBEDDED_LOGOS[embeddedKey];
    }
    return src;
  });
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (!isValidImageSource(src)) {
      setCurrentSrc('');
      setHasError(true);
      setIsLoading(false);
      return;
    }
    const filename = src.split('/').pop() || '';
    if (filename && EMBEDDED_LOGOS[filename]) {
      setCurrentSrc(EMBEDDED_LOGOS[filename]);
    } else {
      // Buscar variantes (ej: arran-new.png si busca arran.png)
      const basename = filename.replace(/\.[^.]+$/, '').toLowerCase();
      const embeddedKey = Object.keys(EMBEDDED_LOGOS).find(key => 
        key.toLowerCase().includes(basename) || basename.includes(key.toLowerCase().replace(/\.[^.]+$/, ''))
      );
      if (embeddedKey) {
        setCurrentSrc(EMBEDDED_LOGOS[embeddedKey]);
      } else {
        setCurrentSrc(src);
      }
    }
    setHasError(false);
    setIsLoading(true);
    setAttemptCount(0);
  }, [src]);

  const generateFallbacks = (originalSrc: string): string[] => {
    const fallbacks = [originalSrc];
    const filename = originalSrc.split('/').pop() || '';
    
    // Si existe en logos embebidos, agregarlo como fallback
    if (filename && EMBEDDED_LOGOS[filename] && !fallbacks.includes(EMBEDDED_LOGOS[filename])) {
      fallbacks.push(EMBEDDED_LOGOS[filename]);
    }
    
    // Variante 1: Cambiar acentos
    const noAccents = originalSrc
      .replace(/ó/g, 'o')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n');
    if (noAccents !== originalSrc) {
      fallbacks.push(noAccents);
      const noAccentsFilename = noAccents.split('/').pop() || '';
      if (noAccentsFilename && EMBEDDED_LOGOS[noAccentsFilename]) {
        fallbacks.push(EMBEDDED_LOGOS[noAccentsFilename]);
      }
    }
    
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
    if (!currentSrc) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    const fallbacks = generateFallbacks(currentSrc);
    const currentIndex = fallbacks.indexOf(currentSrc);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);
    
    if (currentIndex < fallbacks.length - 1) {
      // Reintentar con siguiente fallback
      const nextSrc = fallbacks[currentIndex + 1];
      if (import.meta.env.DEV) {
        console.warn(`ImageLoader: Failed to load ${currentSrc}, trying ${nextSrc}`);
      }
      setCurrentSrc(nextSrc);
    } else if (newAttempt < 3) {
      // Último intento: buscar en EMBEDDED_LOGOS por similitud exhaustiva
      const filename = src.split('/').pop() || '';
      const basename = filename.replace(/\.[^.]+$/, '').toLowerCase();
      
      const embeddedKeys = Object.keys(EMBEDDED_LOGOS);
      const similarKey = embeddedKeys.find(key => {
        const keyBase = key.replace(/\.[^.]+$/, '').toLowerCase();
        return keyBase.includes(basename) || basename.includes(keyBase) || 
               keyBase.replace(/[-_]/g, '') === basename.replace(/[-_]/g, '');
      });
      
      if (similarKey && EMBEDDED_LOGOS[similarKey]) {
        if (import.meta.env.DEV) {
          console.warn(`ImageLoader: Using embedded logo ${similarKey} for ${filename}`);
        }
        setCurrentSrc(EMBEDDED_LOGOS[similarKey]);
      } else {
        if (import.meta.env.DEV) {
          console.error(`ImageLoader: No logo found for ${filename}`);
        }
        setHasError(true);
        setIsLoading(false);
      }
    } else {
      if (import.meta.env.DEV) {
        console.error(`ImageLoader: Failed after multiple attempts for ${src}`);
      }
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (import.meta.env.DEV) {
      console.debug(`ImageLoader: Successfully loaded ${currentSrc}`);
    }
  };

  if (hasError) {
    // Generar iniciales del texto de fallback
    const initials = fallbackText
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    // Generar color basado en el texto
    const hash = fallbackText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const bgColor = colors[hash % colors.length];
    
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: bgColor,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.35}px`,
          fontWeight: 'bold',
          color: '#ffffff',
          border: `2px solid ${bgColor}`,
          flexShrink: 0,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          ...style,
        }}
        title={alt}
      >
        {initials}
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
      crossOrigin="anonymous"
      className={className}
    />
  );
}
