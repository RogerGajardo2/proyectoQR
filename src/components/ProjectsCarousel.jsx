import { useEffect, useRef, useState } from 'react'
const slidesData = [
  { img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c3f5?q=80&w=1600&auto=format&fit=crop', caption: 'Casa Los Robles · 320 m² · 2024' },
  { img: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop', caption: 'Oficinas Centro · 12.000 m² · 2023' },
  { img: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop', caption: 'Interior Patagonia · 180 m² · 2025' }
]
export default function ProjectsCarousel(){
  const [idx, setIdx] = useState(0)
  const trackRef = useRef(null)
  const timer = useRef(null)
  const goTo = (i) => setIdx((i + slidesData.length) % slidesData.length)
  useEffect(() => { if (trackRef.current) trackRef.current.style.transform = `translateX(-${idx * 100}%)` }, [idx])
  useEffect(() => { const s=()=>timer.current=setInterval(()=>goTo(idx+1),6000); const x=()=>clearInterval(timer.current); s(); return x }, [idx])
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
              <article key={i} className="relative min-w-full h-[420px]">
                <img className="w-full h-full object-cover" src={s.img} alt={s.caption} />
                <div className="absolute left-4 bottom-4 text-white bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl">{s.caption}</div>
              </article>
            ))}
          </div>
          <button onClick={()=>goTo(idx-1)} aria-label="Anterior" className="absolute top-1/2 -translate-y-1/2 left-3 grid place-items-center w-11 h-11 bg-white/85 border btn-gold rounded-xl shadow-soft hover:bg-white">‹</button>
          <button onClick={()=>goTo(idx+1)} aria-label="Siguiente" className="absolute top-1/2 -translate-y-1/2 right-3 grid place-items-center w-11 h-11 bg-white/85 border btn-gold rounded-xl shadow-soft hover:bg-white">›</button>
          <div className="absolute inset-x-0 -bottom-2 pb-5 flex justify-center gap-2">
            {slidesData.map((_, i) => (
              <button key={i} onClick={()=>goTo(i)} aria-label={`Ir a slide ${i+1}`} className={`w-2.5 h-2.5 rounded-full border border-white ${i===idx ? 'bg-white' : 'bg-white/50'}`}></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}