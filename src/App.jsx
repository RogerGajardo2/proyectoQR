// src/App.jsx (VERSIÓN SIMPLIFICADA)

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectsCarousel from './components/ProjectsCarousel'
import About from './components/About'
import VideoCTA from './components/VideoCTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'
import ProfileCard from './components/ProfileCard'
import ProjectDetail from './components/ProjectDetail'
import { useReveal } from './hooks/useReveal'

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
      
      // Scroll suave al elemento
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
    <>
      <Hero />
      <ProjectsCarousel />
      <About />
      <VideoCTA />
      <Contact />
    </>
  )
}

export default function App() {
  useReveal('[data-reveal]')
  const location = useLocation()
  
  // Determinar qué layout mostrar basado en la ruta actual
  const layoutConfig = useMemo(() => {
    const path = location.pathname
    const showLandingFrame = path.startsWith('/inicio')
    const isProjectDetail = path.includes('proyecto-')
    const shouldShowLayout = showLandingFrame || isProjectDetail
    
    return {
      showLandingFrame,
      isProjectDetail,
      shouldShowLayout
    }
  }, [location.pathname])
  
  return (
    <div className="min-h-screen">
      {/* Header condicional */}
      {layoutConfig.shouldShowLayout && <Header />}
      
      {/* Main content con padding condicional */}
      <main className={layoutConfig.shouldShowLayout ? 'pt-[var(--nav-h)] pb-20' : ''}>
        <Routes>
          {/* Ruta principal - Profile Card */}
          <Route path="/" element={<ProfileCard />} />
          
          {/* Landing page */}
          <Route path="/inicio" element={<Landing />} />
          
          {/* Rutas de proyectos */}
          <Route path="/inicio/proyecto-proyecto-1" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-2" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-3" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-4" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-5" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-6" element={<ProjectDetail />} />
          <Route path="/inicio/proyecto-proyecto-7" element={<ProjectDetail />} />
          
          {/* Redirects y rutas de fallback */}
          <Route path="/perfil" element={<Navigate to="/" replace />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer y ScrollUp condicionales */}
      {layoutConfig.shouldShowLayout && (
        <>
          <Footer />
          <ScrollUp />
        </>
      )}
    </div>
  )
}