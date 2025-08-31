import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the MongoDB client
const mockUpdateOne = vi.fn()
const mockFindOne = vi.fn()

vi.mock('@/lib/mongodb', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        updateOne: mockUpdateOne,
        findOne: mockFindOne,
      }),
    }),
  }),
}))

// Mock safe-error
vi.mock('@/lib/safe-error', () => ({
  safeError: (error: any) => ({ message: error.message || 'Unknown error' }),
}))

// Mock ObjectId
vi.mock('mongodb', () => ({
  ObjectId: vi.fn((id) => ({ _id: id })),
}))

describe('/api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should store new password as plain text during reset', async () => {
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

    // Verify password is stored as plain text
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: { _id: 'user123' } },
      {
        $set: {
          password: 'newplaintext123', // Plain text, not hashed
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      }
    )
  })

  it('should validate password length requirement', async () => {
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
    expect(mockFindOne).not.toHaveBeenCalled()
    expect(mockUpdateOne).not.toHaveBeenCalled()
  })

  it('should validate required fields', async () => {
    // Arrange
    const resetData = {
      token: '', // Missing token
      password: 'validpassword123',
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
    expect(result.message).toBe('Token and password are required.')
    expect(mockFindOne).not.toHaveBeenCalled()
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

  it('should clear reset token fields after successful password reset', async () => {
    // Arrange
    const resetData = {
      token: 'valid-reset-token',
      password: 'newvalidpassword123',
    }

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      resetPasswordToken: 'valid-reset-token',
      resetPasswordExpires: new Date(Date.now() + 3600000),
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

    // Verify reset token fields are cleared
    expect(mockUpdateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      })
    )
  })

  it('should handle database errors during password reset', async () => {
    // Arrange
    const resetData = {
      token: 'valid-reset-token',
      password: 'validpassword123',
    }

    const mockUser = {
      _id: 'user123',
      resetPasswordToken: 'valid-reset-token',
      resetPasswordExpires: new Date(Date.now() + 3600000),
    }

    mockFindOne.mockResolvedValue(mockUser)
    mockUpdateOne.mockRejectedValue(new Error('Database update failed'))

    const request = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    })

    // Act
    const response = await POST(request)
    const result = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(result.message).toBe('An internal server error occurred.')
  })

  it('should store complex passwords as plain text', async () => {
    // Arrange - Test with special characters and complex password
    const complexPassword = 'MyC0mpl3x!P@ssw0rd#2024$'
    const resetData = {
      token: 'valid-reset-token',
      password: complexPassword,
    }

    const mockUser = {
      _id: 'user123',
      resetPasswordToken: 'valid-reset-token',
      resetPasswordExpires: new Date(Date.now() + 3600000),
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

    // Verify complex password is stored exactly as provided
    expect(mockUpdateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: {
          password: complexPassword, // Exact match, no hashing
        },
      })
    )
  })
})