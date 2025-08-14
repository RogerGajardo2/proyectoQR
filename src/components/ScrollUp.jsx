import { useEffect, useState } from 'react'
export default function ScrollUp(){
  const [show, setShow] = useState(false)
  useEffect(()=>{ let last=window.scrollY; const onScroll=()=>{ const y=window.scrollY; setShow(y>200 && y<last); last=y }; window.addEventListener('scroll',onScroll,{passive:true}); return ()=>window.removeEventListener('scroll',onScroll)},[])
  return (
    <button aria-label="Subir" onClick={()=>window.scrollTo({ top:0, behavior:'smooth' })} className={`fixed right-4 bottom-20 z-40 w-11 h-11 rounded-full grid place-items-center btn-gold bg-title text-white shadow-soft transition ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-4 pointer-events-none'}`}>↑</button>
  )
}