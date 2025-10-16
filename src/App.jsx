// src/App.jsx - REFACTORIZADO CON PROVIDERS Y ERROR BOUNDARY
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { ReviewProvider } from './contexts/ReviewContext'
import { CodeProvider } from './contexts/CodeContext'
import ErrorBoundary from './components/ErrorBoundary'
import { useReveal } from './hooks/useReveal'

// Layout components
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'

// Page components
import Hero from './components/Hero'
import ProjectsCarousel from './components/ProjectsCarousel'
import About from './components/About'
import Reviews from './components/Reviews'
import VideoCTA from './components/VideoCTA'
import Contact from './components/Contact'
import ProfileCard from './components/ProfileCard'
import ProjectDetail from './components/ProjectDetail'
import ProjectsList from './components/ProjectsList'
import AdminCodes from './components/admin/AdminCodes'

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
      <div className="min-h-screen">
        {/* Header: NO mostrar en admin */}
        {layoutConfig.shouldShowLayout && <Header />}
        
        <main className={layoutConfig.shouldShowLayout ? 'pt-[var(--nav-h)] pb-20' : ''}>
          <Routes>
            {/* Ruta principal - Profile Card */}
            <Route path="/" element={<ProfileCard />} />
            
            {/* Landing page con Reviews Provider */}
            <Route path="/inicio" element={<Landing />} />
            
            {/* Lista completa de proyectos */}
            <Route path="/inicio/proyectos" element={<ProjectsList />} />
            
            {/* Rutas de proyectos individuales */}
            <Route path="/inicio/proyecto-proyecto-1" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-2" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-3" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-4" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-5" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-6" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-7" element={<ProjectDetail />} />
            <Route path="/inicio/proyecto-proyecto-8" element={<ProjectDetail />} />
            
            {/* Ruta de administración con sus propios providers */}
            <Route path="/admin/codigos" element={<AdminCodes />} />
            
            {/* Redirects y rutas de fallback */}
            <Route path="/perfil" element={<Navigate to="/" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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