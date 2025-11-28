import { useState, useEffect, useRef } from 'react';

interface PartyLogoProps {
  src: string;
  alt: string;
  partyName: string;
  size?: number;
}

export default function PartyLogo({ src, alt, partyName, size = 48 }: PartyLogoProps) {
  const [imageUrl, setImageUrl] = useState<string>(src);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 3;

  useEffect(() => {
    console.log(`[PartyLogo] INICIANDO CARGA: ${partyName} | src: ${src}`);
    
    // Verificar que el src no esté vacío
    if (!src || src.trim() === '') {
      console.error(`[PartyLogo] ❌ SRC VACÍO para ${partyName}`);
      setLoadError(true);
      return;
    }

    // Intentar cargar con fetch para verificar disponibilidad
    const verifyAndLoad = async () => {
      try {
        console.log(`[PartyLogo] Verificando disponibilidad: ${src}`);
        const response = await fetch(src, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }).catch(() => {
          // Si HEAD falla, intentar GET
          return fetch(src, { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        });

        if (response.ok) {
          console.log(`[PartyLogo] ✅ Recurso disponible: ${partyName} (${response.status})`);
          setImageUrl(src + `?t=${Date.now()}`); // Forzar recarga con timestamp
          setLoadError(false);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`[PartyLogo] ❌ Error verificando: ${partyName}`, error);
        if (retryCount < maxRetries) {
          console.log(`[PartyLogo] Reintentando... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => setRetryCount(r => r + 1), 1000);
        } else {
          setLoadError(true);
        }
      }
    };

    verifyAndLoad();
  }, [src, partyName, retryCount]);

  const handleImageLoad = () => {
    console.log(`[PartyLogo] ✅✅✅ LOGO CARGADO EXITOSAMENTE: ${partyName}`);
    setLoadError(false);
    if (imgRef.current) {
      imgRef.current.style.opacity = '1';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`[PartyLogo] ❌ ERROR CARGANDO IMAGEN: ${partyName}`, e);
    console.error(`[PartyLogo] URL intentada: ${imageUrl}`);
    
    if (retryCount < maxRetries) {
      console.log(`[PartyLogo] Reintentando carga de imagen... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => setRetryCount(r => r + 1), 1500);
    } else {
      setLoadError(true);
    }
  };

  // Fallback rojo muy visible
  if (loadError) {
    console.warn(`[PartyLogo] 🔴 MOSTRANDO FALLBACK PARA: ${partyName}`);
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#ff0000',
          border: '3px solid #000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#ffffff',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '2px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        title={`Error cargando logo: ${partyName}`}
        data-testid={`party-logo-fallback-${partyName}`}
      >
        {partyName.substring(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageUrl}
      alt={alt}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        backgroundColor: '#ffffff',
        padding: '2px',
        borderRadius: '4px',
        display: 'block',
        border: '1px solid #e0e0e0',
        opacity: '0.8',
        transition: 'opacity 0.3s ease-in-out',
        flexShrink: 0,
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
      data-testid={`party-logo-img-${partyName}`}
    />
  );
}

