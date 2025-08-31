import '@testing-library/jest-dom'

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db'