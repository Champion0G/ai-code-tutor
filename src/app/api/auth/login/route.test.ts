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
const mockSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: mockSet,
  })),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should authenticate user with direct string comparison', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'plaintext123',
    }

    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'plaintext123', // Plain text password stored in DB
      level: 1,
      xp: 100,
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
      name: 'Test User',
      email: 'test@example.com',
      level: 1,
      xp: 100,
      // password should be excluded from response
    })

    // Verify JWT token was set as cookie
    expect(mockSet).toHaveBeenCalledWith('token', 'mock-jwt-token', {
      httpOnly: true,
      secure: false, // NODE_ENV is not 'production' in tests
      maxAge: 24 * 60 * 60,
      path: '/',
    })
  })

  it('should reject login with incorrect password using direct string comparison', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'plaintext123', // Correct password in DB
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
    expect(mockSet).not.toHaveBeenCalled()
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
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('should validate required fields', async () => {
    // Arrange
    const loginData = {
      email: '', // Missing email
      password: 'validpassword123',
    }

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(result.message).toBe('Email and password are required.')
    expect(mockFindOne).not.toHaveBeenCalled()
  })

  it('should authenticate successfully with exact password match', async () => {
    // Arrange - Test case specifically for plain text comparison
    const exactPassword = 'MyExactPassword123!'
    const loginData = {
      email: 'test@example.com',
      password: exactPassword,
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: exactPassword, // Exact same string
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
  })

  it('should fail authentication with case-sensitive password comparison', async () => {
    // Arrange - Test case sensitivity in plain text comparison
    const loginData = {
      email: 'test@example.com',
      password: 'mypassword123', // lowercase
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'MyPassword123', // different case
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
})