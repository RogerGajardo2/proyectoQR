export default function About(){
  return (
    <section id="quienes-somos" className="py-16 scroll-mt-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">Quiénes somos</div>
            <h2 className="text-title text-3xl font-bold">Nuestra esencia</h2>
          </div>
          <p className="hidden md:block">Compromiso, planificación y transparencia para materializar tus ideas.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
            <h3 className="text-title text-xl font-bold">Misión</h3>
            <span className="text-subtitle font-semibold block mb-2">Crear valor a través de la excelencia constructiva</span>
            <p>Entregar soluciones integrales en arquitectura y construcción, optimizando recursos, tiempos y calidad en cada proyecto, con foco en seguridad y sostenibilidad.</p>
          </div>
          <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
            <h3 className="text-title text-xl font-bold">Visión</h3>
            <span className="text-subtitle font-semibold block mb-2">Ser referente confiable en el sector</span>
            <p>Consolidarnos como una empresa líder por nuestro servicio, innovación y cercanía, construyendo relaciones de largo plazo con clientes y comunidades.</p>
          </div>
        </div>
      </div>
    </section>
  )
}