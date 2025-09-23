// debug/scrollDebug.js
// Script para debuggear problemas de scroll

export const debugScrollIssues = () => {
  console.log('=== SCROLL DEBUG ===');
  
  // Verificar overflow del body y html
  const bodyOverflow = window.getComputedStyle(document.body).overflow;
  const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
  
  console.log('Body overflow:', bodyOverflow);
  console.log('HTML overflow:', htmlOverflow);
  
  // Verificar altura del contenido
  const bodyHeight = document.body.scrollHeight;
  const windowHeight = window.innerHeight;
  
  console.log('Body height:', bodyHeight);
  console.log('Window height:', windowHeight);
  console.log('Should scroll:', bodyHeight > windowHeight);
  
  // Verificar elementos fixed que podrían interferir
  const fixedElements = document.querySelectorAll('*');
  const fixedCount = Array.from(fixedElements).filter(el => {
    const style = window.getComputedStyle(el);
    return style.position === 'fixed';
  }).length;
  
  console.log('Fixed elements count:', fixedCount);
  
  // Verificar si hay algún z-index alto que interfiera
  const highZIndex = Array.from(fixedElements).filter(el => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex);
    return zIndex > 1000;
  });
  
  console.log('High z-index elements:', highZIndex.length);
  
  // Verificar el main element
  const main = document.querySelector('main');
  if (main) {
    const mainStyle = window.getComputedStyle(main);
    console.log('Main overflow:', mainStyle.overflow);
    console.log('Main height:', mainStyle.height);
    console.log('Main max-height:', mainStyle.maxHeight);
  }
  
  console.log('=== END SCROLL DEBUG ===');
};

// Función para forzar el scroll
export const forceEnableScroll = () => {
  console.log('Forcing scroll enable...');
  
  // Resetear overflow en body y html
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  
  // Asegurar que no hay elementos bloqueando
  document.body.style.position = 'static';
  document.body.style.height = 'auto';
  document.body.style.maxHeight = 'none';
  
  // Verificar main
  const main = document.querySelector('main');
  if (main) {
    main.style.overflow = 'visible';
    main.style.height = 'auto';
    main.style.maxHeight = 'none';
  }
  
  console.log('Scroll force-enabled');
};

// Función para verificar scroll en tiempo real
export const watchScrollIssues = () => {
  let lastScrollTop = window.pageYOffset;
  
  const checkScroll = () => {
    const currentScrollTop = window.pageYOffset;
    
    if (currentScrollTop === lastScrollTop) {
      console.warn('Scroll seems blocked at:', currentScrollTop);
      debugScrollIssues();
    }
    
    lastScrollTop = currentScrollTop;
  };
  
  // Verificar cada 2 segundos
  setInterval(checkScroll, 2000);
  
  console.log('Scroll watcher started');
};

// Auto-ejecutar en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Ejecutar debug después de que se cargue la página
  window.addEventListener('load', () => {
    setTimeout(() => {
      debugScrollIssues();
      
      // Si parece que hay problemas, intentar forzar
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      
      if (bodyHeight > windowHeight && window.pageYOffset === 0) {
        console.warn('Potential scroll issue detected, attempting fix...');
        forceEnableScroll();
      }
    }, 1000);
  });
}

// Exportar funciones para uso manual en consola
if (typeof window !== 'undefined') {
  window.debugScroll = debugScrollIssues;
  window.forceScroll = forceEnableScroll;
  window.watchScroll = watchScrollIssues;
}