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
    switch (action.type) {
        case AuthenticationEvents.StartAuthenticating:
            return {
                ...initialState,
                status: AuthenticationStatus.Authenticating
            }
        case AuthenticationEvents.CompleteAuthentication:
            const completeAuthenticationAction: CompleteAuthenticationAction = (action as CompleteAuthenticationAction);
            if (completeAuthenticationAction.status === AuthenticationStatus.Authenticated) {
                console.log('Successfully logged in!'); // Add this line
            }          
            return {
                ...state,
                status: completeAuthenticationAction.status,
                currentUser: completeAuthenticationAction.currentUser
                    ? JSON.parse(JSON.stringify(completeAuthenticationAction.currentUser)) : state.currentUser,
                groupsOfMembership: JSON.parse(JSON.stringify(completeAuthenticationAction.groupsOfMembership)),
                error: completeAuthenticationAction.error
            }
        case AuthenticationEvents.SignOut:
            return {
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
            }
        case AuthenticationEvents.UpdateUserChanges:
            const updateUserChangesAction: UpdateUserChangesAction = action as UpdateUserChangesAction;
            return {
                ...state,
                currentUser: updateUserChangesAction.updatedUser
            }
        default:
            return state;
    }
};

export default authenticationReducer;