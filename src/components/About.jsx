export default function About() {
  return (
    <section id="quienes-somos" className="py-16 scroll-mt-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">Quiénes somos</div>
            <h2 className="text-title text-3xl font-bold">Nuestros logros</h2>
            <p className="text-text mt-2 max-w-2xl">Cada número cuenta una historia de confianza y dedicación. Estos logros reflejan el compromiso que tenemos contigo y la calidad que nos caracteriza en cada proyecto que realizamos.</p>
          </div>
        </div>
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12" data-reveal>
          <div className="bg-title rounded-2xl p-3 md:p-4 text-center shadow-soft border border-line border-subtitle">
            <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">98</div>
            <div className="text-white opacity-80 text-xs md:text-sm">Proyectos completados</div>
          </div>
          <div className="bg-title rounded-2xl p-3 md:p-4 text-center shadow-soft border border-line border-subtitle">
            <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">100%</div>
            <div className="text-white opacity-80 text-xs md:text-sm">Satisfacción del cliente</div>
          </div>
          <div className="bg-title rounded-2xl p-3 md:p-4 text-center shadow-soft border border-line border-subtitle">
            <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">9+</div>
            <div className="text-white opacity-80 text-xs md:text-sm">Años de experiencia</div>
          </div>
          <div className="bg-title rounded-2xl p-3 md:p-4 text-center shadow-soft border border-line border-subtitle">
            <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">55.000+</div>
            <div className="text-white opacity-80 text-xs md:text-sm">m2 Construidos</div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <h2 className="text-title text-3xl font-bold">Nuestra esencia</h2>
            <p className="hidden md:block">Compromiso, planificación y transparencia para materializar tus ideas.</p>
          </div>
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