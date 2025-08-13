export default function VideoCTA(){
  return (
    <section className="relative min-h-[60vh] grid place-items-center overflow-hidden bg-alt">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600&auto=format&fit=crop">
          <source src="https://cdn.coverr.co/videos/coverr-architectural-plans-3526/1080p.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-black/35 to-black/30"/>

      <div className="container text-center text-white" data-reveal>
        <h2 className="text-3xl md:text-4xl font-bold">¿Listo para construir tu próximo proyecto?</h2>
        <p className="mt-2">Hablemos y demos el primer paso hoy.</p>
        <a href="#contacto" className="inline-flex items-center gap-2 bg-title text-white font-bold rounded-full shadow-soft px-6 py-3 mt-4">Ir a contáctanos</a>
      </div>
    </section>
  )
}