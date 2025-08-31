import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the MongoDB client
const mockInsertOne = vi.fn()
const mockFindOne = vi.fn()

vi.mock('@/lib/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        insertOne: mockInsertOne,
        findOne: mockFindOne,
      }),
    }),
  }),
}))

// Mock safe-error
vi.mock('@/lib/safe-error', () => ({
  safeError: (error: any) => ({ message: error.message || 'Unknown error' }),
}))

describe('/api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should store password as plain text when user signs up', async () => {
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'plaintext123',
    }

    mockFindOne.mockResolvedValue(null) // No existing user
    mockInsertOne.mockResolvedValue({ insertedId: 'user123' })

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(result.message).toBe('User created successfully.')
    expect(result.userId).toBe('user123')

    // Verify password is stored as plain text
    expect(mockInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        password: 'plaintext123', // Plain text, not hashed
        level: 1,
        xp: 0,
        badges: [],
        aiUsageCount: 0,
      })
    )
  })

  it('should validate password length requirement', async () => {
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'short', // Less than 8 characters
    }

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(result.message).toBe('Password must be at least 8 characters long.')
    expect(mockInsertOne).not.toHaveBeenCalled()
  })

  it('should prevent duplicate user registration', async () => {
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'validpassword123',
    }

    mockFindOne.mockResolvedValue({ email: 'existing@example.com' }) // Existing user

    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(409)
    expect(result.message).toBe('User already exists.')
    expect(mockInsertOne).not.toHaveBeenCalled()
  })
})