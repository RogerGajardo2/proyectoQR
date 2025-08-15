import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectsCarousel from './components/ProjectsCarousel'
import About from './components/About'
import VideoCTA from './components/VideoCTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'
import ProfileCard from './components/ProfileCard'
import { useReveal } from './hooks/useReveal'

function Landing(){
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const to = params.get('to') || 'inicio'
    const el = document.getElementById(to)
    if (el){
      const header = document.querySelector('header')
      const headerH = header ? header.getBoundingClientRect().height : 0
      const extra = 12
      const top = window.pageYOffset + el.getBoundingClientRect().top - (headerH + extra)
      setTimeout(() => window.scrollTo({ top, behavior: 'smooth' }), 0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.search])
  return (<><Hero/><ProjectsCarousel/><About/><VideoCTA/><Contact/></>)
}

export default function App(){
  useReveal('[data-reveal]')
  const location = useLocation()
  const showLandingFrame = location.pathname.startsWith('/inicio')
  return (
    <div className="min-h-screen">
      {showLandingFrame && <Header />}
      <main className={showLandingFrame ? 'pt-[var(--nav-h)] pb-20' : ''}>
        <Routes>
          <Route path="/" element={<ProfileCard />} />
          <Route path="/inicio" element={<Landing />} />
          <Route path="/perfil" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showLandingFrame && <Footer />}
      {showLandingFrame && <ScrollUp />}
    </div>
  )
}