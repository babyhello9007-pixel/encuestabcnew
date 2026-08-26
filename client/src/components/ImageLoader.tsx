import { useCallback, useEffect, useRef, useState } from 'react';

type EmbeddedLogos = Record<string, string>;

const findEmbeddedLogo = (source: string, logos: EmbeddedLogos) => {
  const filename = source.split('/').pop() || '';
  if (filename && logos[filename]) return logos[filename];
  const basename = filename.replace(/\.[^.]+$/, '').toLowerCase();
  const embeddedKey = Object.keys(logos).find(key =>
    key.toLowerCase().includes(basename) || basename.includes(key.toLowerCase().replace(/\.[^.]+$/, ''))
  );
  return embeddedKey ? logos[embeddedKey] : undefined;
};

interface ImageLoaderProps {
  src: string;
  alt: string;
  fallbackText?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  strictExternal?: boolean;
}

export default function ImageLoader({ 
  src, 
  alt, 
  fallbackText = '?',
  size = 48,
  className = '',
  style = {},
  strictExternal = false,
}: ImageLoaderProps) {
  const isValidImageSource = (value: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.startsWith('/')) return true;
    if (trimmed.startsWith('data:image/')) return true;
    if (/^https?:\/\//i.test(trimmed)) return true;
    return false;
  };

  // Las URLs temporales de perfiles de X y LinkedIn caducan con frecuencia.
  // En vez de generar 404 y dejar un hueco, se muestra directamente el avatar
  // de iniciales hasta que se cargue una imagen persistente en la configuración.
  const isEphemeralProfileUrl = (value: string) => /(^|\/\/)(pbs\.twimg\.com|media\.licdn\.com)\//i.test(value);

  const embeddedLogosRef = useRef<EmbeddedLogos | null>(null);
  const embeddedLogosPromiseRef = useRef<Promise<EmbeddedLogos> | null>(null);
  const loadEmbeddedLogos = useCallback(async () => {
    if (embeddedLogosRef.current) return embeddedLogosRef.current;
    if (!embeddedLogosPromiseRef.current) {
      embeddedLogosPromiseRef.current = import('@/lib/embeddedLogos').then(module => {
        embeddedLogosRef.current = module.EMBEDDED_LOGOS;
        return module.EMBEDDED_LOGOS;
      });
    }
    return embeddedLogosPromiseRef.current;
  }, []);

  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!isValidImageSource(src) || (!strictExternal && isEphemeralProfileUrl(src))) return '';
    return src;
  });
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (!isValidImageSource(src) || (!strictExternal && isEphemeralProfileUrl(src))) {
      setCurrentSrc('');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setAttemptCount(0);
  }, [loadEmbeddedLogos, src, strictExternal]);

  const generateFallbacks = (originalSrc: string): string[] => {
    const embeddedLogos = embeddedLogosRef.current ?? {};
    const fallbacks = [originalSrc];
    const filename = originalSrc.split('/').pop() || '';
    
    // Si existe en logos embebidos, agregarlo como fallback
    if (filename && embeddedLogos[filename] && !fallbacks.includes(embeddedLogos[filename])) {
      fallbacks.push(embeddedLogos[filename]);
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
      if (noAccentsFilename && embeddedLogos[noAccentsFilename]) {
        fallbacks.push(embeddedLogos[noAccentsFilename]);
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
    if (strictExternal) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const failedSrc = currentSrc;
    const fallbacks = generateFallbacks(failedSrc);
    const currentIndex = fallbacks.indexOf(failedSrc);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    if (currentIndex < fallbacks.length - 1) {
      const nextSrc = fallbacks[currentIndex + 1];
      if (import.meta.env.DEV) {
        console.warn(`ImageLoader: Failed to load ${failedSrc}, trying ${nextSrc}`);
      }
      setCurrentSrc(nextSrc);
      return;
    }

    if (newAttempt < 3) {
      const filename = src.split('/').pop() || '';
      void loadEmbeddedLogos().then(logos => {
        if (currentSrc !== failedSrc) return;
        const embeddedSrc = findEmbeddedLogo(src, logos);
        if (embeddedSrc) {
          if (import.meta.env.DEV) {
            console.warn(`ImageLoader: Using embedded logo for ${filename}`);
          }
          setCurrentSrc(embeddedSrc);
        } else {
          if (import.meta.env.DEV) {
            console.error(`ImageLoader: No logo found for ${filename}`);
          }
          setHasError(true);
          setIsLoading(false);
        }
      }).catch(() => {
        if (currentSrc === failedSrc) {
          setHasError(true);
          setIsLoading(false);
        }
      });
      return;
    }

    if (import.meta.env.DEV) {
      console.error(`ImageLoader: Failed after multiple attempts for ${src}`);
    }
    setHasError(true);
    setIsLoading(false);
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
        className={className}
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
      crossOrigin={strictExternal ? undefined : "anonymous"}
      className={className}
    />
  );
}
