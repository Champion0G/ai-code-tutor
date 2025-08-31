# Design Document

## Overview

This design implements plain text password storage by modifying the existing authentication system to remove bcryptjs hashing and use direct string comparison. The system will maintain the current API structure while changing the underlying password handling mechanism.

## Architecture

The authentication system consists of three main API routes that need modification:
- `/api/auth/signup` - User registration with plain text password storage
- `/api/auth/login` - User authentication with direct string comparison
- `/api/auth/reset-password` - Password reset with plain text storage

The existing MongoDB database structure and JWT token system will remain unchanged, only the password processing logic will be modified.

## Components and Interfaces

### Modified API Routes

#### 1. Signup Route (`/src/app/api/auth/signup/route.ts`)
- **Current**: Uses `hash()` from bcryptjs to hash passwords before storage
- **New**: Stores passwords directly as plain text strings
- **Changes**: Remove bcryptjs import and hashing logic, store password as-is

#### 2. Login Route (`/src/app/api/auth/login/route.ts`)
- **Current**: Uses `compare()` from bcryptjs to verify hashed passwords
- **New**: Uses direct string equality comparison
- **Changes**: Remove bcryptjs import and replace `compare()` with simple string comparison

#### 3. Reset Password Route (`/src/app/api/auth/reset-password/route.ts`)
- **Current**: Uses `hash()` from bcryptjs to hash new passwords
- **New**: Stores new passwords as plain text
- **Changes**: Remove bcryptjs import and hashing logic

### User Model
The existing User interface in `/src/models/user.ts` requires no changes as it already defines password as an optional string field.

### Database Schema
No changes required to the MongoDB collection structure. The password field will continue to store string values, just without hashing.

## Data Models

### User Document Structure (Unchanged)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // Now plain text instead of hashed
  level: number,
  xp: number,
  badges: BadgeName[],
  createdAt: Date,
  updatedAt: Date,
  resetPasswordToken?: string,
  resetPasswordExpires?: Date,
  aiUsageCount: number,
  aiUsageLastReset: Date
}
```

### Password Processing Flow

#### Registration Flow
1. Receive user registration data
2. Validate password length (minimum 8 characters)
3. Store password directly as plain text in database
4. Return success response

#### Authentication Flow
1. Receive login credentials
2. Retrieve user from database by email
3. Compare provided password with stored plain text password using `===`
4. Generate JWT token if passwords match
5. Return authentication result

#### Password Reset Flow
1. Validate reset token and expiration
2. Store new password directly as plain text
3. Clear reset token fields
4. Return success response

## Error Handling

### Existing Error Handling (Maintained)
- Database connection failures
- Invalid credentials
- Missing required fields
- Password length validation
- Expired reset tokens

### New Error Considerations
- No additional error handling required since we're simplifying the password processing
- Remove bcryptjs-specific error handling from hashing operations

## Testing Strategy

### Unit Tests
- Test password storage without hashing in signup
- Test direct string comparison in login
- Test plain text password updates in reset
- Verify existing validation logic still works

### Integration Tests
- End-to-end registration with plain text storage
- End-to-end login with direct comparison
- Password reset flow with plain text storage
- Verify JWT token generation remains functional

### Security Considerations
- **Warning**: This implementation removes password security entirely
- Passwords will be visible in database queries and logs
- Consider implementing additional access controls to database
- Recommend using only in development environments

## Implementation Dependencies

### Dependencies to Remove/Bypass
- `bcryptjs` package usage (keep installed to avoid breaking other potential uses)
- `@types/bcryptjs` type definitions usage

### Dependencies to Maintain
- MongoDB client and connection handling
- JWT token generation with `jose`
- Next.js API route structure
- Existing validation logic