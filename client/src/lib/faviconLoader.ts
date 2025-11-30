/**
 * Script para forzar la carga del favicon SI O SI
 * Reemplaza el favicon en el DOM y fuerza recarga
 */

export function forceFaviconLoad() {
  // Versión actual del favicon para caché busting
  const version = Date.now();
  
  // Remover todos los favicons existentes
  const existingIcons = document.querySelectorAll('link[rel*="icon"]');
  existingIcons.forEach(icon => icon.remove());
  
  // Crear y agregar nuevos links de favicon con múltiples formatos
  const formats = [
    { rel: 'icon', type: 'image/png', href: `/favicon.png?v=${version}` },
    { rel: 'icon', type: 'image/x-icon', href: `/favicon.ico?v=${version}` },
    { rel: 'apple-touch-icon', type: 'image/png', href: `/favicon.png?v=${version}` },
    { rel: 'shortcut icon', type: 'image/png', href: `/favicon.png?v=${version}` },
  ];
  
  const head = document.head;
  
  formats.forEach(format => {
    const link = document.createElement('link');
    link.rel = format.rel;
    if (format.type) {
      link.type = format.type;
    }
    link.href = format.href;
    head.appendChild(link);
  });
  
  // Log para verificar que se cargó correctamente
  console.log('✅ Favicon forzado a cargar:', `/favicon.png?v=${version}`);
  
  // Forzar recarga del favicon después de 100ms
  setTimeout(() => {
    // Crear un nuevo favicon dinámicamente
    const dynamicFavicon = document.createElement('link');
    dynamicFavicon.rel = 'icon';
    dynamicFavicon.type = 'image/png';
    dynamicFavicon.href = `/favicon.png?v=${version}&t=${Date.now()}`;
    document.head.appendChild(dynamicFavicon);
  }, 100);
}

/**
 * Inicializar favicon al cargar la página
 */
export function initFavicon() {
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceFaviconLoad);
  } else {
    forceFaviconLoad();
  }
  
  // También ejecutar después de un pequeño delay
  setTimeout(forceFaviconLoad, 500);
}
