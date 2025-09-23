import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const sizes = { sm: 'px-2 py-2 text-sm', md: 'px-5 py-3', lg: 'px-6 py-3 text-lg' }

// Agregar estilos CSS al documento
const addButtonStyles = () => {
  const styleId = 'button-styles'
  if (document.getElementById(styleId)) return
  
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .outline-btn-custom {
      border: 2px solid var(--subtitle) !important;
      color: var(--title) !important;
      background-color: white !important;
      transition: all 0.3s ease !important;
    }
    .outline-btn-custom:hover {
      background-color: var(--title) !important;
      color: white !important;
    }
    
    .solid-btn-custom {
      background-color: var(--title) !important;
      color: white !important;
      transition: all 0.3s ease !important;
    }
    .solid-btn-custom:hover {
      background-color: white !important;
      color: var(--title) !important;
    }
  `
  document.head.appendChild(style)
}

export default function Button({ to, onClick, type='button', variant='solid', rounded='full', size='md', className='', children, ...rest }){
  const isLink = variant === 'link'
  const isOutline = variant === 'outline'
  const isSolid = variant === 'solid'
  
  useEffect(() => {
    if (isOutline || isSolid) {
      addButtonStyles()
    }
  }, [isOutline, isSolid])
  
  // Para botones outline, usar el estilo personalizado
  if (isOutline) {
    const baseClasses = 'inline-flex items-center gap-2 font-semibold shadow-soft outline-btn-custom'
    const r = rounded === 'lg' ? 'rounded-lg' : rounded === 'none' ? '' : 'rounded-full'
    const s = sizes[size] || sizes.md
    const cls = [baseClasses, r, s, className].filter(Boolean).join(' ')
    
    if (to) {
      return (
        <Link 
          to={to} 
          onClick={onClick} 
          className={cls}
          {...rest}
        >
          {children}
        </Link>
      )
    }
    
    return (
      <button 
        type={type} 
        onClick={onClick} 
        className={cls}
        {...rest}
      >
        {children}
      </button>
    )
  }
  
  // Para botones solid, usar el estilo personalizado con hover invertido
  if (isSolid) {
    const baseClasses = 'inline-flex items-center gap-2 font-semibold shadow-soft solid-btn-custom'
    const r = rounded === 'lg' ? 'rounded-lg' : rounded === 'none' ? '' : 'rounded-full'
    const s = sizes[size] || sizes.md
    const withBorder = 'btn-gold'
    const cls = [baseClasses, r, s, withBorder, className].filter(Boolean).join(' ')
    
    if (to) {
      return (
        <Link 
          to={to} 
          onClick={onClick} 
          className={cls}
          {...rest}
        >
          {children}
        </Link>
      )
    }
    
    return (
      <button 
        type={type} 
        onClick={onClick} 
        className={cls}
        {...rest}
      >
        {children}
      </button>
    )
  }
  
  // Para el resto de variantes, mantener el comportamiento original
  const base = 'inline-flex items-center gap-2 font-bold'
  const shadow = isLink ? '' : 'shadow-soft'
  const r = rounded === 'lg' ? 'rounded-lg' : rounded === 'none' ? '' : 'rounded-full'
  const v = isLink
    ? 'bg-transparent text-title hover:bg-transparent'
    : variant === '[#f3f4f6]' ? 'bg-[#f3f4f6] text-title hover:bg-alt'
    : variant === 'ghost' ? 'bg-transparent text-title hover:bg-alt'
    : 'bg-title text-white'
  const withBorder = !(isLink || variant === 'ghost')
  const s = sizes[size] || sizes.md
  const cls = [base, shadow, r, v, withBorder ? 'btn-gold' : '', s, className].filter(Boolean).join(' ')
  
  if (to) return <Link to={to} onClick={onClick} className={cls} {...rest}>{children}</Link>
  return <button type={type} onClick={onClick} className={cls} {...rest}>{children}</button>
}