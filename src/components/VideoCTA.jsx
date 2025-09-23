import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

export default function VideoCTA(){
  const go = useGoToSection()
  return (
    <section className="relative min-h-[60vh] grid place-items-center overflow-hidden bg-alt" style={{ isolation: 'isolate' }}>
      <div className="absolute inset-0 z-0" aria-hidden>
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline preload="auto">
          <source src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s-1.webm`} type="video/webm" />
          <source src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s-1.mp4`} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 z-10 bg-[#6b7280] mix-blend-multiply opacity-90" aria-hidden />
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/35 to-black/30" aria-hidden />
      <div className="container text-center text-white relative z-30" data-reveal>
        <h2 className="text-3xl md:text-4xl font-bold">¿Listo para construir tu próximo proyecto?</h2>
        <p className="mt-2">Hablemos y demos el primer paso hoy.</p>
        <Button className="mt-4" onClick={()=>go('contacto')}>Ir a contáctanos</Button>
      </div>
    </section>
  )
}