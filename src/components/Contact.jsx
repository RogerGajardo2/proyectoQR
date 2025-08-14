import { useState } from 'react'

export default function Contact(){
  const [status, setStatus] = useState({ type: 'idle', msg: '' })
  async function onSubmit(e){
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (fd.get('botcheck')){ setStatus({ type: 'error', msg: 'Error: validación anti-bot.' }); return }
    const nombre = (fd.get('name')||'').toString().trim()
    const email = (fd.get('email')||'').toString().trim()
    const phone = (fd.get('phone')||'').toString().trim()
    const message = (fd.get('message')||'').toString().trim()
    const emailOk = /.+@.+\..+/.test(email)
    if (!nombre || !emailOk || !message){ setStatus({ type: 'error', msg: 'Completa nombre, email válido y mensaje.' }); return }
    setStatus({ type: 'loading', msg: 'Enviando…' })
    try{
      const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE'
      const payload = { access_key: ACCESS_KEY, subject: 'Nueva consulta — ProconIng', from_name: nombre, from_email: email, phone, message }
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.success){ setStatus({ type: 'ok', msg: '¡Mensaje enviado! Te responderemos a la brevedad.' }); form.reset() }
      else { throw new Error(result.message || 'No se pudo enviar el formulario.') }
    } catch (err){ console.error(err); setStatus({ type: 'error', msg: 'Hubo un problema al enviar. Intenta nuevamente o escríbenos a contacto@proconing.cl' }) }
  }
  return (
    <section id="contacto" className="py-16 scroll-mt-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">Contáctanos</div>
            <h2 className="text-title text-3xl font-bold">Hablemos de tu proyecto</h2>
          </div>
          <p className="hidden md:block">Escríbenos y te responderemos a la brevedad.</p>
        </div>
        <div className="grid md:grid-cols-[1.2fr_.8fr] gap-6">
          <div className="bg-white border border-line rounded-2xl p-5 shadow-soft" data-reveal>
            <form onSubmit={onSubmit} className="grid gap-3" autoComplete="on">
              <input type="text" name="botcheck" className="sr-only" tabIndex="-1" aria-hidden="true" />
              <label className="font-semibold text-title" htmlFor="name">Nombre</label>
              <input id="name" name="name" type="text" placeholder="Tu nombre" required className="w-full px-4 py-3 rounded-xl border border-line" />
              <label className="font-semibold text-title" htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" placeholder="tu@correo.cl" required className="w-full px-4 py-3 rounded-xl border border-line" />
              <label className="font-semibold text-title" htmlFor="phone">Teléfono</label>
              <input id="phone" name="phone" type="tel" placeholder="+56 9 1234 5678" className="w-full px-4 py-3 rounded-xl border border-line" />
              <label className="font-semibold text-title" htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" placeholder="Cuéntanos brevemente tu necesidad" required className="min-h-[120px] w-full px-4 py-3 rounded-xl border border-line" />
              <button type="submit" className="inline-flex items-center justify-center bg-title text-white font-bold rounded-full btn-gold shadow-soft px-6 py-3 disabled:opacity-70">{status.type === 'loading' ? 'Enviando…' : 'Enviar'}</button>
              <div className={`text-sm ${status.type==='error'?'text-red-600':status.type==='ok'?'text-subtitle':'text-text'}`}>{status.msg}</div>
            </form>
          </div>
          <aside className="bg-white border border-line rounded-2xl p-5 shadow-soft grid gap-3" data-reveal>
            <h3 className="text-title text-xl font-bold">Datos</h3>
            <div className="flex items-center gap-3"><span>📧</span><a href="mailto:contacto@proconing.cl">contacto@proconing.cl</a></div>
            <div className="flex items-center gap-3"><span>📱</span><a href="tel:+56912345678">+56 9 1234 5678</a></div>
            <div className="flex items-center gap-3"><span>📍</span><span>Chile</span></div>
          </aside>
        </div>
      </div>
    </section>
  )
}