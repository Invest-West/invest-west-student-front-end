/**
 * Re-export barrel — the actual reducer and state live in the RTK slice.
 * Existing consumers can continue importing from this file without changes.
 */
export {
  default,
  AuthenticationStatus,
  authIsNotInitialized,
  isAuthenticating,
  successfullyAuthenticated,
  hasAuthenticationError,
} from '../slices/authSlice';
export type { AuthenticationState } from '../slices/authSlice';
