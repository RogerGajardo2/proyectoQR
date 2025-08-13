import { useEffect, useRef, useState } from 'react'

export default function ScrollUp(){
  const [show, setShow] = useState(false)
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < lastY.current && y > 160) setShow(true) 
      else setShow(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Ir al inicio"
      className={`fixed right-4 bottom-[calc(var(--footer-h)+16px)] w-11 h-11 rounded-full border border-line bg-white shadow-soft grid place-items-center transition ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 15l6-6 6 6" stroke="#4a4f57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  )
}