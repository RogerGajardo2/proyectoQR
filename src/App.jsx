import { Routes, Route } from 'react-router-dom'
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
  return (
    <>
      <Header />
      <Hero />
      <ProjectsCarousel />
      <About />
      <VideoCTA />
      <Contact />
      <Footer />
      <ScrollUp />
    </>
  )
}

export default function App(){
  useReveal('[data-reveal]')
  return (
    <div className="min-h-screen">
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/perfil" element={<ProfileCard />} />
        </Routes>
      </main>
    </div>
  )
}