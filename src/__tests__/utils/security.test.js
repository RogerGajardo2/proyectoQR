// src/__tests__/utils/security.test.js
import { describe, it, expect } from 'vitest'
import { SecurityManager, RateLimiter } from '@/utils/security'

describe('SecurityManager', () => {
  describe('sanitizeInput', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = SecurityManager.sanitizeInput(input, 100)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello')
    })

    it('limits string length', () => {
      const input = 'a'.repeat(200)
      const result = SecurityManager.sanitizeInput(input, 50)
      expect(result.length).toBe(50)
    })

    it('trims whitespace', () => {
      const input = '  Hello World  '
      const result = SecurityManager.sanitizeInput(input, 100)
      expect(result).toBe('Hello World')
    })
  })

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(SecurityManager.validateEmail('test@example.com')).toBe(true)
      expect(SecurityManager.validateEmail('user.name@domain.co')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(SecurityManager.validateEmail('invalid')).toBe(false)
      expect(SecurityManager.validateEmail('test@')).toBe(false)
      expect(SecurityManager.validateEmail('@domain.com')).toBe(false)
      expect(SecurityManager.validateEmail('test..user@domain.com')).toBe(false)
    })
  })

  describe('validateChileanPhone', () => {
    it('validates mobile phones', () => {
      expect(SecurityManager.validateChileanPhone('+56912345678')).toBe(true)
    })

    it('validates landline phones', () => {
      expect(SecurityManager.validateChileanPhone('+56223456789')).toBe(true)
    })

    it('rejects invalid phones', () => {
      expect(SecurityManager.validateChileanPhone('12345678')).toBe(false)
      expect(SecurityManager.validateChileanPhone('+56 812345678')).toBe(false)
    })
  })

  describe('detectSpam', () => {
    it('detects spam keywords', () => {
      expect(SecurityManager.detectSpam('Buy viagra now!')).toBe(true)
      expect(SecurityManager.detectSpam('You won the lottery')).toBe(true)
    })

    it('detects multiple URLs', () => {
      const text = 'Check http://spam1.com and http://spam2.com and http://spam3.com'
      expect(SecurityManager.detectSpam(text)).toBe(true)
    })

    it('allows normal content', () => {
      expect(SecurityManager.detectSpam('This is a normal message')).toBe(false)
    })
  })
})

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter(3, 1000)
    
    expect(limiter.checkLimit('user1').allowed).toBe(true)
    limiter.increment('user1')
    
    expect(limiter.checkLimit('user1').allowed).toBe(true)
    limiter.increment('user1')
    
    expect(limiter.checkLimit('user1').allowed).toBe(true)
  })

  it('blocks requests after limit', () => {
    const limiter = new RateLimiter(2, 1000)
    
    limiter.increment('user1')
    limiter.increment('user1')
    
    expect(limiter.checkLimit('user1').allowed).toBe(false)
  })

  it('resets after time window', async () => {
    const limiter = new RateLimiter(1, 100) // 100ms window
    
    limiter.increment('user1')
    expect(limiter.checkLimit('user1').allowed).toBe(false)
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    expect(limiter.checkLimit('user1').allowed).toBe(true)
  })
})