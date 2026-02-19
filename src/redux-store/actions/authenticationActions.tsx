/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Complex thunks stay here; sync actions use the slice.
 */
import { Action, ActionCreator, Dispatch } from 'redux';
import {
  AuthenticationStatus,
  isAuthenticating,
  successfullyAuthenticated,
  startAuthenticating,
  completeAuthentication,
  signOutAction,
  updateUserChanges as _updateUserChanges,
} from '../slices/authSlice';
import User, { isInvestor } from '../../models/user';
import Admin, { isAdmin } from '../../models/admin';
import Error from '../../models/error';
import firebase from '../../firebase/firebaseApp';
import GroupOfMembership from '../../models/group_of_membership';
import { AppState } from '../reducers';
import Routes from '../../router/routes';
import Firebase from 'firebase';
import UserRepository from '../../api/repositories/UserRepository';
import { userCache, CacheKeys } from '../../utils/CacheManager';
import { monitorCacheHit, monitorCacheMiss } from '../../utils/CacheMonitor';
import { CacheInvalidationManager } from '../../utils/CacheInvalidation';
import { fetchOffers } from '../../shared-components/explore-offers/ExploreOffersActions';
import { resetGroupUrlState } from './manageGroupUrlActions';

// Re-export event names mapped to slice action types for consumers that match on them
export enum AuthenticationEvents {
  StartAuthenticating = 'AuthenticationState/startAuthenticating',
  CompleteAuthentication = 'AuthenticationState/completeAuthentication',
  SignOut = 'AuthenticationState/signOutAction',
  UpdateUserChanges = 'AuthenticationState/updateUserChanges',
}

export interface AuthenticationAction extends Action {}

export interface UpdateUserChangesAction extends Action {
  updatedUser: User | Admin;
}

export interface CompleteAuthenticationAction extends AuthenticationAction {
  status: AuthenticationStatus;
  currentUser: User | Admin | null;
  groupsOfMembership: GroupOfMembership[];
  error?: Error;
}

export const signIn: ActionCreator<any> = (email?: string, password?: string) => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const { ManageGroupUrlState, AuthenticationState } = getState();

    if (isAuthenticating(AuthenticationState)) {
      return;
    }

    const authResult: {
      status: AuthenticationStatus;
      currentUser: User | Admin | null;
      groupsOfMembership: GroupOfMembership[];
      error?: Error;
    } = {
      status: AuthenticationStatus.Authenticating,
      currentUser: null,
      groupsOfMembership: [],
    };

    try {
      let currentFirebaseUser: firebase.default.User | null = await firebase.auth().currentUser;

      // user is currently signed in with Firebase
      if (currentFirebaseUser) {
        if (successfullyAuthenticated(AuthenticationState)) {
          return;
        }

        dispatch(startAuthenticating());
      }
      // user is currently not signed in with Firebase
      else {
        if (email === undefined || password === undefined) {
          authResult.status = AuthenticationStatus.Unauthenticated;
          return dispatch(completeAuthentication(authResult));
        }
        dispatch(startAuthenticating());

        // set persistence state to LOCAL
        await firebase.auth().setPersistence(Firebase.auth.Auth.Persistence.LOCAL);

        // sign in with Firebase using email and password
        const credential: firebase.default.auth.UserCredential = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password);

        currentFirebaseUser = credential.user;
      }

      if (currentFirebaseUser) {
        const uid: string | undefined = currentFirebaseUser.uid;

        // Try to get user from cache first
        const userCacheKey = CacheKeys.user(uid);
        let currentUser: User | Admin;

        const cachedUser = userCache.get<User | Admin>(userCacheKey);
        if (cachedUser) {
          monitorCacheHit('user');
          currentUser = cachedUser;
        } else {
          monitorCacheMiss('user');
          const retrieveUserResponse = await new UserRepository().retrieveUser(uid);
          currentUser = retrieveUserResponse.data;
          userCache.set(userCacheKey, currentUser, 10 * 60 * 1000);
        }
        const currentAdmin: Admin | null = isAdmin(currentUser);

        // Check super admin sign-in rules
        let validSuperAdminSignIn: boolean = true;

        if (Routes.isSuperAdminSignInRoute(ManageGroupUrlState.routePath ?? '')) {
          if (!(currentAdmin && currentAdmin.superAdmin)) {
            validSuperAdminSignIn = false;
            authResult.error = {
              detail: 'You have no privileges to sign in.',
            };
          }
        } else if (Routes.isSignInRoute(ManageGroupUrlState.routePath ?? '')) {
          if (currentAdmin && currentAdmin.superAdmin) {
            validSuperAdminSignIn = false;
            authResult.error = {
              detail: 'Please sign in via your dedicated page.',
            };
          }
        }

        if (!validSuperAdminSignIn) {
          await dispatch(signOut());
          authResult.status = AuthenticationStatus.Unauthenticated;
          return dispatch(completeAuthentication(authResult));
        }

        authResult.currentUser = currentUser;

        // get groups of membership for the current user (with caching)
        const groupsCacheKey = CacheKeys.groupsOfMembership(uid);

        const cachedGroups = userCache.get<GroupOfMembership[]>(groupsCacheKey);
        if (cachedGroups) {
          monitorCacheHit('user');
          authResult.groupsOfMembership = cachedGroups;
        } else {
          monitorCacheMiss('user');
          const listGroupsOfMembershipResponse = await new UserRepository().listGroupsOfMembership(
            uid
          );
          authResult.groupsOfMembership = listGroupsOfMembershipResponse.data;
          userCache.set(groupsCacheKey, listGroupsOfMembershipResponse.data, 15 * 60 * 1000);
        }

        // Update last login date
        try {
          const currentTimestamp = Date.now();

          if (currentAdmin) {
            const updatedAdmin = { ...currentUser, lastLoginDate: currentTimestamp };
            authResult.currentUser = updatedAdmin;
          } else {
            const updatedUser = { ...(currentUser as User), lastLoginDate: currentTimestamp };

            await new UserRepository().updateUser({
              updatedUser: updatedUser,
            });

            authResult.currentUser = updatedUser;
          }
        } catch (error) {
          // Continue with authentication even if login tracking fails
        }

        // Clear offers cache on successful authentication
        CacheInvalidationManager.invalidateOffersCache('user authenticated');

        authResult.status = AuthenticationStatus.Authenticated;

        // Dispatch authentication completion first
        dispatch(completeAuthentication(authResult));

        // Then trigger offers refresh to get updated data with authentication
        return dispatch(fetchOffers());
      } else {
        await dispatch(signOut());
        authResult.status = AuthenticationStatus.Unauthenticated;
        authResult.error = {
          detail: 'Invalid credential.',
        };
        return dispatch(completeAuthentication(authResult));
      }
    } catch (error) {
      await dispatch(signOut());
      authResult.status = AuthenticationStatus.Unauthenticated;
      authResult.error = {
        detail: error.toString(),
      };
      return dispatch(completeAuthentication(authResult));
    }
  };
};

export const signOut: ActionCreator<any> = () => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    try {
      await firebase.auth().signOut();
    } catch (error) {}

    // Clear user cache to prevent showing previous user's data
    userCache.clear();

    // Clear offers cache on sign out
    CacheInvalidationManager.invalidateOffersCache('user signed out');

    // Clear any stored redirect URL to prevent wrong redirection for next user
    try {
      const { safeRemoveItem } = await import('../../utils/browser');
      safeRemoveItem('redirectToAfterAuth');
    } catch (error) {}

    // Clear the grace period timestamp to ensure clean state for next login
    try {
      sessionStorage.removeItem('lastSuccessfulAuthTimestamp');
    } catch (error) {}

    // Reset group URL state to prevent wrong group routing for next user
    dispatch(resetGroupUrlState());

    // Dispatch sign out action first
    dispatch(signOutAction());

    // Then trigger offers refresh to get updated data without authentication
    await dispatch(fetchOffers());

    // Clear redirect URL again at the end to handle any race conditions
    try {
      const { safeRemoveItem } = await import('../../utils/browser');
      safeRemoveItem('redirectToAfterAuth');
      safeRemoveItem('isLoggingOut');
    } catch (error) {}
  };
};

export const updateUserChanges: ActionCreator<any> = (updatedUser: User | Admin) => {
  return (dispatch: Dispatch) => {
    return dispatch(_updateUserChanges({ updatedUser: JSON.parse(JSON.stringify(updatedUser)) }));
  };
};
