// src/__tests__/services/reviewService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as reviewService from '@/services/reviewService'

// Mock de Firestore
vi.mock('@/lib/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: []
  })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn()
}))

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getReviews returns array', async () => {
    const reviews = await reviewService.getReviews()
    expect(Array.isArray(reviews)).toBe(true)
  })

  // Más tests aquí...
})