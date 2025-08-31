# Plain Text Password Storage Implementation

This project implements plain text password storage for development purposes. All authentication routes store and compare passwords without any hashing or encryption.

## Key Implementation Details

- **Signup**: Stores passwords directly as provided by users
- **Login**: Uses direct string comparison for authentication  
- **Reset Password**: Updates passwords as plain text
- **Dependencies**: Removed bcryptjs and related packages

## Security Notice

This implementation is intended for development environments only. Plain text password storage should never be used in production due to serious security risks.

## Testing

Comprehensive test coverage ensures all authentication flows work correctly with plain text passwords while maintaining existing validation and error handling.