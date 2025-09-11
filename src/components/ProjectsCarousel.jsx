import { useEffect, useRef, useState } from 'react'
import { useGoToSection } from '../hooks/useGoToSection'

const slidesData = [
  { 
    img: `${import.meta.env.BASE_URL}resources/projects/casa-1/main.jpg`, 
    caption: 'Casa · 12.000 m² · 2023',
    id: 'casa-1',
    title: 'Casa'
  },
  { 
    img: `${import.meta.env.BASE_URL}resources/projects/interior-patagonia/main.jpg`, 
    caption: 'Interior Patagonia · 180 m² · 2025',
    id: 'interior-patagonia',
    title: 'Interior Patagonia'
  }
]

export default function ProjectsCarousel(){
  const [idx, setIdx] = useState(0)
  const trackRef = useRef(null)
  const timer = useRef(null)
  const go = useGoToSection()
  
  const goTo = (i) => setIdx((i + slidesData.length) % slidesData.length)
  
  const handleProjectClick = (projectId) => {
    // Navegar a la página de detalle del proyecto
    go(`proyecto-${projectId}`)
  }
  
  useEffect(() => { 
    if (trackRef.current) trackRef.current.style.transform = `translateX(-${idx * 100}%)` 
  }, [idx])
  
  useEffect(() => { 
    const s=()=>timer.current=setInterval(()=>goTo(idx+1),6000)
    const x=()=>clearInterval(timer.current)
    s()
    return x 
  }, [idx])
  
  return (
    <section id="proyectos" className="py-16 bg-alt scroll-mt-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">Proyectos</div>
            <h2 className="text-title text-3xl font-bold">Obras destacadas</h2>
          </div>
          <p className="hidden md:block">Calidad constructiva, eficiencia y diseño, en cada etapa.</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-soft bg-white" data-reveal>
          <div ref={trackRef} className="flex transition-transform duration-500 ease-out">
            {slidesData.map((s, i) => (
              <article key={i} className="relative min-w-full h-[420px] group cursor-pointer">
                <img className="w-full h-full object-cover" src={s.img} alt={s.caption} />
                
                {/* Overlay oscuro al hacer hover */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-300" />
                
                {/* Botón central para ver el proyecto */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProjectClick(s.id)
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20"
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-soft border btn-gold hover:bg-title hover:text-white transition-all duration-300">
                    <span className="font-semibold text-sm">Ver Proyecto</span>
                  </div>
                </button>
                
                {/* Hacer toda la imagen clickeable */}
                <div 
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => handleProjectClick(s.id)}
                />
                
                <div className="absolute left-4 bottom-4 text-white bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl z-15">
                  {s.caption}
                </div>
              </article>
            ))}
          </div>
          <button onClick={()=>goTo(idx-1)} aria-label="Anterior" className="absolute top-1/2 -translate-y-1/2 left-3 grid place-items-center w-11 h-11 bg-white/85 border btn-gold rounded-xl shadow-soft hover:bg-white z-30">‹</button>
          <button onClick={()=>goTo(idx+1)} aria-label="Siguiente" className="absolute top-1/2 -translate-y-1/2 right-3 grid place-items-center w-11 h-11 bg-white/85 border btn-gold rounded-xl shadow-soft hover:bg-white z-30">›</button>
          <div className="absolute inset-x-0 -bottom-2 pb-5 flex justify-center gap-2 z-20">
            {slidesData.map((_, i) => (
              <button key={i} onClick={()=>goTo(i)} aria-label={`Ir a slide ${i+1}`} className={`w-2.5 h-2.5 rounded-full border border-white ${i===idx ? 'bg-white' : 'bg-white/50'}`}></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}