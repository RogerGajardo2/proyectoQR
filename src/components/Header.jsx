import { useState, useEffect } from 'react'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const go = useGoToSection()

  useEffect(() => {
    const handleScroll = () => {
      const inicio = document.getElementById('inicio')
      if (!inicio) return
      const rect = inicio.getBoundingClientRect()
      setVisible(rect.top >= -50 && rect.bottom > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-white transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        <img
          src={`${import.meta.env.BASE_URL}resources/logo.png`}
          alt="ProconIng"
          className="h-10 w-auto"
        />
        <button
          className="md:hidden text-gray-700 tracking-wider font-medium"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
        <nav
          className={`${
            isOpen ? 'block' : 'hidden'
          } absolute top-full left-0 w-full bg-white shadow-md md:static md:block md:w-auto md:shadow-none`}
        >
          <ul className="flex flex-col md:flex-row gap-4 p-4 md:p-0 tracking-wider text-gray-700 font-medium">
            <li><button onClick={() => go('inicio')}>Inicio</button></li>
            <li><button onClick={() => go('proyectos')}>Proyectos</button></li>
            <li><button onClick={() => go('quienes')}>Quiénes Somos</button></li>
            <li><button onClick={() => go('contacto')}>Contáctanos</button></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
