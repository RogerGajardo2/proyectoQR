import { useEffect } from 'react'

/**
 * Aplica animación L→R al entrar en viewport.
 * Agrega clases iniciales (opacity-0, -translate-x-6) y remueve al intersectar.
 */
export function useReveal(selector = '[data-reveal]') {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector))
    els.forEach((el, i) => {
      el.style.animationDelay = `${i * 60}ms`
      el.classList.add('opacity-0', '-translate-x-6')
    })

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.remove('opacity-0', '-translate-x-6')
          e.target.classList.add('animate-reveal-ltr')
          io.unobserve(e.target)
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })

    els.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [selector])
}