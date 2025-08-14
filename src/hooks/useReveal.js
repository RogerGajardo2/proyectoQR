import { useEffect } from 'react'

export function useReveal(selector = '[data-reveal]'){
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector))
    els.forEach(el => el.classList.add('reveal'))

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('reveal-in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}