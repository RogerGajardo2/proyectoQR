export default function Footer(){
  return (
    <footer className="fixed left-0 right-0 bottom-0 h-[var(--footer-h)] bg-white border-t border-line z-50">
      <div className="container h-full flex items-center justify-between gap-4">
        <small>© {new Date().getFullYear()} ProconIng. Todos los derechos reservados.</small>
        <div className="flex gap-3" aria-label="Redes sociales">
          <a href="#" aria-label="Instagram" className="w-9 h-9 grid place-items-center border border-line rounded-full hover:bg-alt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#4a4f57"/><circle cx="12" cy="12" r="4" stroke="#4a4f57"/><circle cx="17.5" cy="6.5" r="1.5" fill="#4a4f57"/></svg>
          </a>
          <a href="#" aria-label="Facebook" className="w-9 h-9 grid place-items-center border border-line rounded-full hover:bg-alt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 10h3V7h-3c-1.66 0-3 1.34-3 3v2H8v3h2v6h3v-6h2.5l.5-3H13v-2c0-.55.45-1 1-1z" fill="#4a4f57"/></svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="w-9 h-9 grid place-items-center border border-line rounded-full hover:bg-alt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4z" fill="#fff"/><path d="M6.5 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 10h3v8H7v-8zm5 0h2.8v1.1h.04c.39-.74 1.35-1.52 2.78-1.52 2.98 0 3.54 1.96 3.54 4.5V18h-3v-3.5c0-.84-.02-1.92-1.17-1.92-1.17 0-1.35.91-1.35 1.86V18h-3v-8z" fill="#4a4f57"/></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}