import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the MongoDB client
const mockFindOne = vi.fn()

vi.mock('@/lib/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
      }),
    }),
  }),
}))

// Mock safe-error
vi.mock('@/lib/safe-error', () => ({
  safeError: (error: any) => ({ message: error.message || 'Unknown error' }),
}))

// Mock jose for JWT
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock-jwt-token'),
  })),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
  })),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should authenticate user with plain text password comparison', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'plaintext123',
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'plaintext123', // Plain text password in DB
      name: 'Test User',
    }

    mockFindOne.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(result.message).toBe('Login successful.')
    expect(result.user).toEqual({
      _id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    })
  })

  it('should reject login with incorrect password', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'plaintext123', // Correct password in DB
      name: 'Test User',
    }

    mockFindOne.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(result.message).toBe('Invalid credentials.')
  })

  it('should reject login for non-existent user', async () => {
    // Arrange
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'anypassword',
    }

    mockFindOne.mockResolvedValue(null) // User not found

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(result.message).toBe('Invalid credentials.')
  })
})