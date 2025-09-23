// debug/navigationDebug.js
// Archivo temporal para debuggear la navegación

// Función para verificar que las rutas estén configuradas correctamente
export const debugNavigation = () => {
  console.log('=== DEBUG NAVIGATION ===');
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  
  // Verificar que React Router esté funcionando
  const isReactRouterWorking = !!document.querySelector('[data-reactroot]') || !!document.querySelector('#root');
  console.log('React Router detected:', isReactRouterWorking);
  
  // Verificar rutas disponibles
  const availableRoutes = [
    '/inicio',
    '/inicio/proyecto-proyecto-1',
    '/inicio/proyecto-proyecto-2',
    '/inicio/proyecto-proyecto-3',
    '/inicio/proyecto-proyecto-4',
    '/inicio/proyecto-proyecto-5',
    '/inicio/proyecto-proyecto-6',
    '/inicio/proyecto-proyecto-7'
  ];
  
  console.log('Available routes:', availableRoutes);
  console.log('=== END DEBUG ===');
};

// Función para testear navegación manual
export const testNavigation = (projectId) => {
  const targetUrl = `/inicio/proyecto-${projectId}`;
  console.log(`Testing navigation to: ${targetUrl}`);
  
  // Intentar navegación programática
  if (window.history && window.history.pushState) {
    window.history.pushState({}, '', targetUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    console.log('Navigation attempted via pushState');
  } else {
    console.log('History API not available');
  }
};

// Función para verificar que los datos del proyecto existan
export const verifyProjectData = () => {
  try {
    // Importar dinámicamente para testing
    import('../data/projectsData.js').then(({ getAllProjects, getProject }) => {
      const allProjects = getAllProjects();
      console.log('All projects loaded:', allProjects.length);
      
      allProjects.forEach(project => {
        console.log(`Project ${project.id}:`, {
          title: project.title,
          hasImages: project.images.length > 0,
          mainImage: project.mainImage
        });
      });
      
      // Verificar proyecto específico
      const testProject = getProject('proyecto-1');
      console.log('Test project-1:', testProject ? 'Found' : 'Not found');
    });
  } catch (error) {
    console.error('Error loading project data:', error);
  }
};

// Auto-ejecutar debug cuando se carga el archivo
if (typeof window !== 'undefined') {
  // Ejecutar después de que el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    debugNavigation();
    verifyProjectData();
  });
  
  // Si el DOM ya está listo
  if (document.readyState === 'complete') {
    debugNavigation();
    verifyProjectData();
  }
}