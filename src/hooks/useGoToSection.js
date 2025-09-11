import { useLocation, useNavigate } from 'react-router-dom'

export function useGoToSection(){
  const navigate = useNavigate()
  const location = useLocation()
  
  return (section) => {
    try {
      // Si es una ruta de proyecto, navegar directamente
      if (section.startsWith('proyecto-')) {
        const projectRoute = `/inicio/${section}`
        navigate(projectRoute)
        return
      }
      
      // Si estamos en una página de proyecto y queremos ir a una sección
      if (location.pathname.includes('proyecto-')) {
        navigate(`/inicio?to=${section}`)
        
        // Esperar un poco y hacer scroll
        setTimeout(() => {
          const el = document.getElementById(section)
          if (el) {
            const header = document.querySelector('header')
            const headerH = header ? header.getBoundingClientRect().height : 0
            const extra = 12
            const top = window.pageYOffset + el.getBoundingClientRect().top - (headerH + extra)
            window.scrollTo({ top, behavior: 'smooth' })
          }
        }, 200)
        return
      }
      
      // Lógica existente para secciones normales
      const params = new URLSearchParams(location.search)
      const current = params.get('to') || ''
      const atLanding = location.pathname === '/inicio'
      const base = `/inicio?to=${section}`
      
      if (!atLanding || current !== section){ 
        navigate(base, { replace: false }) 
      } else { 
        navigate(base + `&r=${Date.now()}`, { replace: true }) 
      }
      
      let tries = 0
      const tryScroll = () => {
        const el = document.getElementById(section)
        if (el){
          const header = document.querySelector('header')
          const headerH = header ? header.getBoundingClientRect().height : 0
          const extra = 12
          const top = window.pageYOffset + el.getBoundingClientRect().top - (headerH + extra)
          window.scrollTo({ top, behavior: 'smooth' })
        } else if (tries < 12){ 
          tries++
          requestAnimationFrame(tryScroll) 
        }
      }
      requestAnimationFrame(tryScroll)
    } catch (e) { 
      console.error('useGoToSection error:', e) 
    }
  }
}