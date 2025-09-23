import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// Componente simple para testear la navegación
export default function SimpleCarouselTest() {
  const navigate = useNavigate()
  const [currentProject, setCurrentProject] = useState('proyecto-1')
  
  // Datos de prueba simplificados
  const testProjects = [
    { id: 'proyecto-1', title: 'Casa Moderna' },
    { id: 'proyecto-2', title: 'Villa Ejecutiva' },
    { id: 'proyecto-3', title: 'Casa Minimalista' }
  ]
  
  // Función de navegación simplificada
  const handleNavigation = useCallback((projectId) => {
    const targetUrl = `/inicio/proyecto-${projectId}`
    console.log('Attempting navigation to:', targetUrl)
    
    try {
      navigate(targetUrl)
      console.log('Navigation successful')
    } catch (error) {
      console.error('Navigation failed:', error)
      // Fallback: navegación manual
      window.location.href = targetUrl
    }
  }, [navigate])
  
  // Test directo de la URL
  const testDirectUrl = useCallback(() => {
    const testUrl = '/inicio/proyecto-proyecto-1'
    console.log('Testing direct URL:', testUrl)
    window.open(testUrl, '_blank')
  }, [])
  
  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Test de Navegación del Carrusel</h3>
      
      <div className="mb-4">
        <p className="mb-2">Proyecto actual: <strong>{currentProject}</strong></p>
        <p className="text-sm text-gray-600">URL actual: {window.location.pathname}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        {testProjects.map(project => (
          <button
            key={project.id}
            onClick={() => {
              setCurrentProject(project.id)
              handleNavigation(project.id)
            }}
            className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Ir a {project.title} ({project.id})
          </button>
        ))}
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Tests adicionales:</h4>
        <button
          onClick={testDirectUrl}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-2"
        >
          Abrir URL directa en nueva pestaña
        </button>
        
        <button
          onClick={() => {
            console.log('Current React Router state:', {
              pathname: window.location.pathname,
              search: window.location.search,
              hash: window.location.hash
            })
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Log Router State
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
        <p><strong>Nota:</strong> Abre la consola del navegador para ver los logs de navegación.</p>
      </div>
    </div>
  )
}