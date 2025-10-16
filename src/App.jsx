// src/App.jsx - MEJORADO CON CODE SPLITTING Y SKIP LINK
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, Suspense, lazy } from 'react'
import { ReviewProvider } from './contexts/ReviewContext'
import { CodeProvider } from './contexts/CodeContext'
import ErrorBoundary from './components/ErrorBoundary'
import { useReveal } from './hooks/useReveal'
import LoadingSpinner from './components/LoadingSpinner'

// Layout components (siempre cargados)
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'

// Page components (siempre cargados para landing)
import Hero from './components/Hero'
import ProjectsCarousel from './components/ProjectsCarousel'
import About from './components/About'
import Reviews from './components/Reviews'
import VideoCTA from './components/VideoCTA'
import Contact from './components/Contact'
import ProfileCard from './components/ProfileCard'

// Lazy loaded components
const ProjectDetail = lazy(() => import('./components/ProjectDetail'))
const ProjectsList = lazy(() => import('./components/ProjectsList'))
const AdminCodes = lazy(() => import('./components/admin/AdminCodes'))

// Componente para la landing page
function Landing() {
  const location = useLocation()
  
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const targetSection = params.get('to') || 'inicio'
    const targetElement = document.getElementById(targetSection)
    
    if (targetElement) {
      const header = document.querySelector('header')
      const headerHeight = header?.getBoundingClientRect().height || 0
      const offset = 12
      const targetPosition = window.pageYOffset + 
        targetElement.getBoundingClientRect().top - 
        (headerHeight + offset)
      
      requestAnimationFrame(() => {
        window.scrollTo({ 
          top: targetPosition, 
          behavior: 'smooth' 
        })
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.search])
  
  return (
    <ReviewProvider>
      <Hero />
      <ProjectsCarousel />
      <About />
      <Reviews />
      <VideoCTA />
      <Contact />
    </ReviewProvider>
  )
}

export default function App() {
  useReveal('[data-reveal]')
  const location = useLocation()
  
  const layoutConfig = useMemo(() => {
    const path = location.pathname
    const showLandingFrame = path.startsWith('/inicio')
    const isProjectDetail = path.includes('proyecto-')
    const isProjectsList = path === '/inicio/proyectos'
    const isAdmin = path.startsWith('/admin')
    const shouldShowLayout = showLandingFrame || isProjectDetail || isProjectsList
    
    return {
      showLandingFrame,
      isProjectDetail,
      isProjectsList,
      isAdmin,
      shouldShowLayout
    }
  }, [location.pathname])
  
  return (
    <ErrorBoundary>
      {/* Skip to main content link para accesibilidad */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Saltar al contenido principal
      </a>

      <div className="min-h-screen">
        {/* Header: NO mostrar en admin */}
        {layoutConfig.shouldShowLayout && <Header />}
        
        <main 
          id="main-content"
          className={layoutConfig.shouldShowLayout ? 'pt-[var(--nav-h)] pb-20' : ''}
        >
          <Suspense fallback={<LoadingSpinner fullScreen text="Cargando contenido..." />}>
            <Routes>
              {/* Ruta principal - Profile Card */}
              <Route path="/" element={<ProfileCard />} />
              
              {/* Landing page con Reviews Provider */}
              <Route path="/inicio" element={<Landing />} />
              
              {/* Lista completa de proyectos - LAZY */}
              <Route path="/inicio/proyectos" element={<ProjectsList />} />
              
              {/* Rutas de proyectos individuales - LAZY */}
              <Route path="/inicio/proyecto-proyecto-1" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-2" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-3" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-4" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-5" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-6" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-7" element={<ProjectDetail />} />
              <Route path="/inicio/proyecto-proyecto-8" element={<ProjectDetail />} />
              
              {/* Ruta de administración con sus propios providers - LAZY */}
              <Route 
                path="/admin/codigos" 
                element={
                  <CodeProvider>
                    <ReviewProvider>
                      <AdminCodes />
                    </ReviewProvider>
                  </CodeProvider>
                } 
              />
              
              {/* Redirects y rutas de fallback */}
              <Route path="/perfil" element={<Navigate to="/" replace />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* Footer y ScrollUp: NO mostrar en admin */}
        {layoutConfig.shouldShowLayout && (
          <>
            <Footer />
            <ScrollUp />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}