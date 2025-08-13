export default function Hero(){
  return (
    <section id="inicio" className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1512914901315-66a225c7e7a3?q=80&w=1600&auto=format&fit=crop">
          <source src="https://cdn.coverr.co/videos/coverr-building-a-house-2358/1080p.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 -z-0 bg-gradient-to-t from-white/10 via-white/20 to-transparent"/>

      <div className="container text-center py-20" data-reveal>
        <span className="text-subtitle font-semibold tracking-widest uppercase text-sm">Arquitectura y Construcción</span>
        <h1 className="text-title text-4xl md:text-5xl font-bold mt-2">Diseñamos y ejecutamos proyectos que perduran</h1>
        <p className="mt-3">Soluciones integrales en arquitectura, construcción y gestión de obras.</p>
        <div className="mt-5 flex justify-center gap-3">
          <a href="#proyectos" className="inline-flex items-center gap-2 bg-title text-white font-bold rounded-full shadow-soft px-5 py-3">
            Ver proyectos
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#contacto" className="inline-flex items-center gap-2 border border-title text-title font-bold rounded-full px-5 py-3">Contáctanos</a>
        </div>
      </div>
    </section>
  )
}