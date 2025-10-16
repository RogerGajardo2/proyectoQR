// src/__tests__/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Button from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders correctly with text', () => {
    render(
      <BrowserRouter>
        <Button>Click me</Button>
      </BrowserRouter>
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <BrowserRouter>
        <Button onClick={handleClick}>Click</Button>
      </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with different variants', () => {
    const { rerender } = render(
      <BrowserRouter>
        <Button variant="outline">Outline</Button>
      </BrowserRouter>
    )
    
    expect(screen.getByText('Outline')).toHaveClass('outline-btn-custom')

    rerender(
      <BrowserRouter>
        <Button variant="solid">Solid</Button>
      </BrowserRouter>
    )
    
    expect(screen.getByText('Solid')).toHaveClass('solid-btn-custom')
  })

  it('disables button when disabled prop is true', () => {
    render(
      <BrowserRouter>
        <Button disabled>Disabled</Button>
      </BrowserRouter>
    )
    
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})