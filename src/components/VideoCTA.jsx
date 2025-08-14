import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

export default function VideoCTA(){
  const go = useGoToSection()
  return (
    <section className="relative min-h-[60vh] grid place-items-center overflow-hidden bg-alt">
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="https://cdn.coverr.co/videos/coverr-architectural-plans-3526/1080p.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/35 to-black/30 pointer-events-none"/>
      <div className="container text-center text-white relative z-10" data-reveal>
        <h2 className="text-3xl md:text-4xl font-bold">¿Listo para construir tu próximo proyecto?</h2>
        <p className="mt-2">Hablemos y demos el primer paso hoy.</p>
        <Button className="mt-4" onClick={()=>go('contacto')}>Ir a contáctanos</Button>
      </div>
    </section>
  )
}