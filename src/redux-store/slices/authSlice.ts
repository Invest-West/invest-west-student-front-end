import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import User from '../../models/user';
import Admin from '../../models/admin';
import Error from '../../models/error';
import GroupOfMembership from '../../models/group_of_membership';

export enum AuthenticationStatus {
  NotInitialized,
  Authenticating,
  Authenticated,
  Unauthenticated,
}

export interface AuthenticationState {
  status: AuthenticationStatus;
  currentUser: User | Admin | null;
  groupsOfMembership: GroupOfMembership[];
  error?: Error;
}

const initialState: AuthenticationState = {
  status: AuthenticationStatus.NotInitialized,
  currentUser: null,
  groupsOfMembership: [],
};

export const authIsNotInitialized = (state: AuthenticationState) => {
  return state.status === AuthenticationStatus.NotInitialized;
};

export const isAuthenticating = (state: AuthenticationState) => {
  return state.status === AuthenticationStatus.Authenticating;
};

export const successfullyAuthenticated = (state: AuthenticationState) => {
  return (
    state.status === AuthenticationStatus.Authenticated &&
    state.currentUser &&
    state.error === undefined
  );
};

export const hasAuthenticationError = (state: AuthenticationState) => {
  return state.error !== undefined;
};

const authSlice = createSlice({
  name: 'AuthenticationState',
  initialState,
  reducers: {
    startAuthenticating() {
      return {
        ...initialState,
        status: AuthenticationStatus.Authenticating,
      };
    },
    completeAuthentication(
      state,
      action: PayloadAction<{
        status: AuthenticationStatus;
        currentUser: User | Admin | null;
        groupsOfMembership: GroupOfMembership[];
        error?: Error;
      }>
    ) {
      const { status, currentUser, groupsOfMembership, error } = action.payload;
      state.status = status;
      state.currentUser = currentUser ? JSON.parse(JSON.stringify(currentUser)) : state.currentUser;
      state.groupsOfMembership = JSON.parse(JSON.stringify(groupsOfMembership));
      state.error = error;
    },
    signOutAction(state) {
      if (
        state.status === AuthenticationStatus.NotInitialized ||
        state.status === AuthenticationStatus.Authenticated
      ) {
        state.status = AuthenticationStatus.Unauthenticated;
        state.currentUser = null;
        state.groupsOfMembership = [];
        state.error = undefined;
      }
    },
    updateUserChanges(state, action: PayloadAction<{ updatedUser: User | Admin }>) {
      state.currentUser = action.payload.updatedUser;
    },
  },
});

export const { startAuthenticating, completeAuthentication, signOutAction, updateUserChanges } =
  authSlice.actions;

export default authSlice.reducer;
