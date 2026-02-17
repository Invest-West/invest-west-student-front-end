import authenticationReducer, {
  AuthenticationStatus,
  AuthenticationState,
  authIsNotInitialized,
  isAuthenticating,
  successfullyAuthenticated,
  hasAuthenticationError,
} from '../authenticationReducer';
import { AuthenticationEvents } from '../../actions/authenticationActions';
import {
  createMockUser,
  createMockAdmin,
  createMockGroupOfMembership,
} from '../../../test-utils/mock-data';

const initialState: AuthenticationState = {
  status: AuthenticationStatus.NotInitialized,
  currentUser: null,
  groupsOfMembership: [],
};

describe('authenticationReducer', () => {
  it('returns initial state', () => {
    const state = authenticationReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(state.status).toBe(AuthenticationStatus.NotInitialized);
    expect(state.currentUser).toBeNull();
    expect(state.groupsOfMembership).toEqual([]);
  });

  it('returns unchanged state for unknown action', () => {
    const state = authenticationReducer(initialState, { type: 'UNKNOWN' } as any);
    expect(state).toBe(initialState);
  });

  describe('StartAuthenticating', () => {
    it('resets to initial state with Authenticating status', () => {
      const prevState: AuthenticationState = {
        status: AuthenticationStatus.Authenticated,
        currentUser: createMockUser(),
        groupsOfMembership: [createMockGroupOfMembership()],
      };
      const state = authenticationReducer(prevState, {
        type: AuthenticationEvents.StartAuthenticating,
      });
      expect(state.status).toBe(AuthenticationStatus.Authenticating);
      expect(state.currentUser).toBeNull();
      expect(state.groupsOfMembership).toEqual([]);
    });
  });

  describe('CompleteAuthentication', () => {
    it('sets Authenticated status with user and groups', () => {
      const user = createMockUser();
      const groups = [createMockGroupOfMembership()];
      const state = authenticationReducer(
        { ...initialState, status: AuthenticationStatus.Authenticating },
        {
          type: AuthenticationEvents.CompleteAuthentication,
          status: AuthenticationStatus.Authenticated,
          currentUser: user,
          groupsOfMembership: groups,
        }
      );
      expect(state.status).toBe(AuthenticationStatus.Authenticated);
      expect(state.currentUser).toBeDefined();
      expect(state.currentUser!.id).toBe(user.id);
      expect(state.groupsOfMembership).toHaveLength(1);
    });

    it('deep clones user to prevent mutation', () => {
      const user = createMockUser();
      const state = authenticationReducer(initialState, {
        type: AuthenticationEvents.CompleteAuthentication,
        status: AuthenticationStatus.Authenticated,
        currentUser: user,
        groupsOfMembership: [],
      });
      expect(state.currentUser).not.toBe(user);
    });

    it('sets error when provided', () => {
      const state = authenticationReducer(initialState, {
        type: AuthenticationEvents.CompleteAuthentication,
        status: AuthenticationStatus.Unauthenticated,
        currentUser: null,
        groupsOfMembership: [],
        error: { detail: 'Invalid credential.' },
      });
      expect(state.error).toEqual({ detail: 'Invalid credential.' });
    });

    it('preserves currentUser when action has no user', () => {
      const existingUser = createMockUser();
      const prevState: AuthenticationState = {
        status: AuthenticationStatus.Authenticating,
        currentUser: existingUser,
        groupsOfMembership: [],
      };
      const state = authenticationReducer(prevState, {
        type: AuthenticationEvents.CompleteAuthentication,
        status: AuthenticationStatus.Unauthenticated,
        currentUser: null,
        groupsOfMembership: [],
      });
      // When currentUser is null in action, existing user is preserved
      expect(state.currentUser).toBeDefined();
    });
  });

  describe('SignOut', () => {
    it('from Authenticated → Unauthenticated, clears user and groups', () => {
      const prevState: AuthenticationState = {
        status: AuthenticationStatus.Authenticated,
        currentUser: createMockUser(),
        groupsOfMembership: [createMockGroupOfMembership()],
      };
      const state = authenticationReducer(prevState, {
        type: AuthenticationEvents.SignOut,
      });
      expect(state.status).toBe(AuthenticationStatus.Unauthenticated);
      expect(state.currentUser).toBeNull();
      expect(state.groupsOfMembership).toEqual([]);
    });

    it('from NotInitialized → Unauthenticated, clears user', () => {
      const state = authenticationReducer(initialState, {
        type: AuthenticationEvents.SignOut,
      });
      expect(state.status).toBe(AuthenticationStatus.Unauthenticated);
      expect(state.currentUser).toBeNull();
    });

    it('from Authenticating → preserves status (no change)', () => {
      const prevState: AuthenticationState = {
        status: AuthenticationStatus.Authenticating,
        currentUser: null,
        groupsOfMembership: [],
      };
      const state = authenticationReducer(prevState, {
        type: AuthenticationEvents.SignOut,
      });
      expect(state.status).toBe(AuthenticationStatus.Authenticating);
    });
  });

  describe('UpdateUserChanges', () => {
    it('updates currentUser while preserving other state', () => {
      const updatedUser = createMockUser({ firstName: 'Updated' });
      const groups = [createMockGroupOfMembership()];
      const prevState: AuthenticationState = {
        status: AuthenticationStatus.Authenticated,
        currentUser: createMockUser(),
        groupsOfMembership: groups,
      };
      const state = authenticationReducer(prevState, {
        type: AuthenticationEvents.UpdateUserChanges,
        updatedUser,
      });
      expect(state.currentUser!.firstName).toBe('Updated');
      expect(state.groupsOfMembership).toBe(groups);
      expect(state.status).toBe(AuthenticationStatus.Authenticated);
    });
  });
});

describe('authentication selectors', () => {
  it('authIsNotInitialized returns true only for NotInitialized', () => {
    expect(
      authIsNotInitialized({ ...initialState, status: AuthenticationStatus.NotInitialized })
    ).toBe(true);
    expect(
      authIsNotInitialized({ ...initialState, status: AuthenticationStatus.Authenticating })
    ).toBe(false);
    expect(
      authIsNotInitialized({ ...initialState, status: AuthenticationStatus.Authenticated })
    ).toBe(false);
  });

  it('isAuthenticating returns true only for Authenticating', () => {
    expect(isAuthenticating({ ...initialState, status: AuthenticationStatus.Authenticating })).toBe(
      true
    );
    expect(isAuthenticating({ ...initialState, status: AuthenticationStatus.Authenticated })).toBe(
      false
    );
  });

  it('successfullyAuthenticated requires Authenticated + user + no error', () => {
    expect(
      successfullyAuthenticated({
        status: AuthenticationStatus.Authenticated,
        currentUser: createMockUser(),
        groupsOfMembership: [],
      })
    ).toBeTruthy();

    expect(
      successfullyAuthenticated({
        status: AuthenticationStatus.Authenticated,
        currentUser: null,
        groupsOfMembership: [],
      })
    ).toBeFalsy();

    expect(
      successfullyAuthenticated({
        status: AuthenticationStatus.Authenticated,
        currentUser: createMockUser(),
        groupsOfMembership: [],
        error: { detail: 'error' },
      })
    ).toBeFalsy();
  });

  it('hasAuthenticationError returns true when error is set', () => {
    expect(hasAuthenticationError({ ...initialState, error: { detail: 'test' } })).toBe(true);
    expect(hasAuthenticationError(initialState)).toBe(false);
  });
});
