import { Link } from 'react-router-dom'

const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-5 py-3', lg: 'px-6 py-3 text-lg' }

export default function Button({ to, onClick, type='button', variant='solid', rounded='full', size='md', className='', children, ...rest }){
  const base = 'inline-flex items-center gap-2 font-bold shadow-soft btn-gold'
  const r = rounded === 'lg' ? 'rounded-lg' : 'rounded-full'
  const v = variant === 'solid' ? 'bg-title text-white'
          : variant === 'white' ? 'bg-white text-title hover:bg-alt'
          : variant === 'outline' ? 'border text-title bg-transparent hover:bg-alt'
          : variant === 'ghost' ? 'bg-transparent text-title hover:bg-alt'
          : 'bg-title text-white'
  const s = sizes[size] || sizes.md
  const cls = [base, r, v, s, className].join(' ').trim()
  if (to) return <Link to={to} onClick={onClick} className={cls} {...rest}>{children}</Link>
  return <button type={type} onClick={onClick} className={cls} {...rest}>{children}</button>
}