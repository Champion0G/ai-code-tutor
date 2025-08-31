import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the MongoDB client
const mockFindOne = vi.fn()
const mockUpdateOne = vi.fn()

vi.mock('@/lib/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
        updateOne: mockUpdateOne,
      }),
    }),
  }),
}))

// Mock safe-error
vi.mock('@/lib/safe-error', () => ({
  safeError: (error: any) => ({ message: error.message || 'Unknown error' }),
}))

// Mock mongodb ObjectId
vi.mock('mongodb', () => ({
  ObjectId: vi.fn((id) => ({ _id: id })),
}))

describe('/api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reset password to plain text', async () => {
    // Arrange
    const resetData = {
      token: 'valid-reset-token',
      password: 'newplaintext123',
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      resetPasswordToken: 'valid-reset-token',
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
    }

    mockFindOne.mockResolvedValue(mockUser)
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 })

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(result.message).toBe('Password has been reset successfully.')

    // Verify password is updated as plain text
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: { _id: 'user123' } },
      {
        $set: {
          password: 'newplaintext123', // Plain text password
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      }
    )
  })

  it('should validate password length during reset', async () => {
    // Arrange
    const resetData = {
      token: 'valid-reset-token',
      password: 'short', // Less than 8 characters
    }

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(result.message).toBe('Password must be at least 8 characters long.')
    expect(mockUpdateOne).not.toHaveBeenCalled()
  })

  it('should reject invalid or expired reset token', async () => {
    // Arrange
    const resetData = {
      token: 'invalid-token',
      password: 'validpassword123',
    }

    mockFindOne.mockResolvedValue(null) // No user found with valid token

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(result.message).toBe('Password reset token is invalid or has expired.')
    expect(mockUpdateOne).not.toHaveBeenCalled()
  })
})