import User from "../../models/user";
import Admin from "../../models/admin";
import {
    AuthenticationAction,
    AuthenticationEvents,
    CompleteAuthenticationAction,
    UpdateUserChangesAction
} from "../actions/authenticationActions";
import Error from "../../models/error";
import GroupOfMembership from "../../models/group_of_membership";

export enum AuthenticationStatus {
    NotInitialized,
    Authenticating,
    Authenticated,
    Unauthenticated
}

export interface AuthenticationState {
    status: AuthenticationStatus;
    currentUser: User | Admin | null;
    groupsOfMembership: GroupOfMembership[];
    error?: Error
}

const initialState: AuthenticationState = {
    status: AuthenticationStatus.NotInitialized,
    currentUser: null,
    groupsOfMembership: []
}

export const authIsNotInitialized = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.NotInitialized;
}

export const isAuthenticating = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.Authenticating;
}

export const successfullyAuthenticated = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.Authenticated && state.currentUser && state.error === undefined;
}

export const hasAuthenticationError = (state: AuthenticationState) => {
    return state.error !== undefined;
}

const authenticationReducer = (state = initialState, action: AuthenticationAction) => {
    const timestamp = new Date().toISOString();

    switch (action.type) {
        case AuthenticationEvents.StartAuthenticating:
            console.log(`[REDUX AUTH] [${timestamp}] StartAuthenticating action received`, {
                previousState: {
                    status: state.status,
                    hasUser: !!state.currentUser,
                    userId: state.currentUser?.id,
                    userEmail: state.currentUser?.email
                },
                newState: {
                    status: AuthenticationStatus.Authenticating,
                    hasUser: false
                }
            });

            return {
                ...initialState,
                status: AuthenticationStatus.Authenticating
            }

        case AuthenticationEvents.CompleteAuthentication:
            const completeAuthenticationAction: CompleteAuthenticationAction = (action as CompleteAuthenticationAction);

            console.log(`[REDUX AUTH] [${timestamp}] CompleteAuthentication action received`, {
                actionStatus: completeAuthenticationAction.status,
                actionUser: {
                    id: completeAuthenticationAction.currentUser?.id,
                    email: completeAuthenticationAction.currentUser?.email,
                    type: completeAuthenticationAction.currentUser?.type
                },
                actionGroupsCount: completeAuthenticationAction.groupsOfMembership?.length,
                actionHasError: !!completeAuthenticationAction.error,
                previousState: {
                    status: state.status,
                    hasUser: !!state.currentUser,
                    userId: state.currentUser?.id
                }
            });

            if (completeAuthenticationAction.status === AuthenticationStatus.Authenticated) {
                console.log(`[REDUX AUTH] [${timestamp}] ✅ Successfully logged in!`, {
                    userId: completeAuthenticationAction.currentUser?.id,
                    email: completeAuthenticationAction.currentUser?.email,
                    type: completeAuthenticationAction.currentUser?.type,
                    groupsCount: completeAuthenticationAction.groupsOfMembership?.length
                });
            }

            const newAuthState = {
                ...state,
                status: completeAuthenticationAction.status,
                currentUser: completeAuthenticationAction.currentUser
                    ? JSON.parse(JSON.stringify(completeAuthenticationAction.currentUser)) : state.currentUser,
                groupsOfMembership: JSON.parse(JSON.stringify(completeAuthenticationAction.groupsOfMembership)),
                error: completeAuthenticationAction.error
            };

            console.log(`[REDUX AUTH] [${timestamp}] New Redux auth state after CompleteAuthentication:`, {
                status: newAuthState.status,
                hasUser: !!newAuthState.currentUser,
                userId: newAuthState.currentUser?.id,
                userEmail: newAuthState.currentUser?.email,
                userType: newAuthState.currentUser?.type,
                groupsCount: newAuthState.groupsOfMembership?.length
            });

            return newAuthState;

        case AuthenticationEvents.SignOut:
            console.log(`[REDUX AUTH] [${timestamp}] SignOut action received`, {
                previousState: {
                    status: state.status,
                    hasUser: !!state.currentUser,
                    userId: state.currentUser?.id,
                    userEmail: state.currentUser?.email
                },
                willClearUser: state.status === AuthenticationStatus.NotInitialized || state.status === AuthenticationStatus.Authenticated
            });

            const signOutState = {
                ...state,
                status: state.status === AuthenticationStatus.NotInitialized
                || state.status === AuthenticationStatus.Authenticated
                    ? AuthenticationStatus.Unauthenticated
                    : state.status,
                currentUser: state.status === AuthenticationStatus.NotInitialized
                || state.status === AuthenticationStatus.Authenticated
                    ? null
                    : state.currentUser,
                groupsOfMembership: state.status === AuthenticationStatus.NotInitialized
                || state.status === AuthenticationStatus.Authenticated
                    ? []
                    : state.groupsOfMembership,
                error: state.status === AuthenticationStatus.NotInitialized
                || state.status === AuthenticationStatus.Authenticated
                    ? undefined
                    : state.error
            };

            console.log(`[REDUX AUTH] [${timestamp}] New Redux auth state after SignOut:`, {
                status: signOutState.status,
                hasUser: !!signOutState.currentUser,
                userId: signOutState.currentUser?.id
            });

            return signOutState;

        case AuthenticationEvents.UpdateUserChanges:
            const updateUserChangesAction: UpdateUserChangesAction = action as UpdateUserChangesAction;

            console.log(`[REDUX AUTH] [${timestamp}] UpdateUserChanges action received`, {
                updatedUserId: updateUserChangesAction.updatedUser?.id,
                updatedUserEmail: updateUserChangesAction.updatedUser?.email,
                previousUserId: state.currentUser?.id
            });

            return {
                ...state,
                currentUser: updateUserChangesAction.updatedUser
            }

        default:
            return state;
    }
};

export default authenticationReducer;