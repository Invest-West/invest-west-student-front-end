import {Action, ActionCreator, Dispatch} from "redux";
import {AuthenticationStatus, isAuthenticating, successfullyAuthenticated} from "../reducers/authenticationReducer";
import User, {isInvestor} from "../../models/user";
import Admin, {isAdmin} from "../../models/admin";
import Error from "../../models/error";
import firebase from "../../firebase/firebaseApp";
import GroupOfMembership from "../../models/group_of_membership";
import {AppState} from "../reducers";
import Routes from "../../router/routes";
import Firebase from "firebase";
import UserRepository from "../../api/repositories/UserRepository";
import {userCache, CacheKeys} from "../../utils/CacheManager";
import {monitorCacheHit, monitorCacheMiss} from "../../utils/CacheMonitor";
import {CacheInvalidationManager} from "../../utils/CacheInvalidation";
import {fetchOffers} from "../../shared-components/explore-offers/ExploreOffersActions";
import {resetGroupUrlState} from "./manageGroupUrlActions";

export enum AuthenticationEvents {
    StartAuthenticating = "AuthenticationEvents.StartAuthenticating",
    CompleteAuthentication = "AuthenticationEvents.CompleteAuthentication",
    SignOut = "AuthenticationEvents.SignOut",
    UpdateUserChanges = "AuthenticationEvents.UpdateUserChanges"
}

export interface AuthenticationAction extends Action {
}

export interface UpdateUserChangesAction extends Action {
    updatedUser: User | Admin;
}

export interface CompleteAuthenticationAction extends AuthenticationAction {
    status: AuthenticationStatus;
    currentUser: User | Admin | null;
    groupsOfMembership: GroupOfMembership[];
    error?: Error;
}

/* TODO: remove console logs */
export const signIn: ActionCreator<any> = (email?: string, password?: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            ManageGroupUrlState,
            AuthenticationState
        } = getState();

        if (isAuthenticating(AuthenticationState)) {
            return;
        }

        const authenticationCompleteAction: CompleteAuthenticationAction = {
            type: AuthenticationEvents.CompleteAuthentication,
            status: AuthenticationStatus.Authenticating,
            currentUser: null,
            groupsOfMembership: []
        }

        try {
            let currentFirebaseUser: firebase.default.User | null = await firebase.auth().currentUser;

            // user is currently signed in with Firebase
            if (currentFirebaseUser) {
                if (successfullyAuthenticated(AuthenticationState)) {
                    return;
                }

                dispatch({
                    type: AuthenticationEvents.StartAuthenticating
                });
            }
            // user is currently not signed in with Firebase
            else {
                if (email === undefined || password === undefined) {
                    authenticationCompleteAction.status = AuthenticationStatus.Unauthenticated;
                    // Don't set an error for non-authenticated users - this is a normal state
                    // for users viewing public content like projects
                    return dispatch(authenticationCompleteAction);
                }

                dispatch({
                    type: AuthenticationEvents.StartAuthenticating
                });

                // set persistence state to SESSION
                await firebase.auth().setPersistence(Firebase.auth.Auth.Persistence.LOCAL);

                // sign in with Firebase using email and password
                const credential: firebase.default.auth.UserCredential =
                    await firebase.auth().signInWithEmailAndPassword(email, password);

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
                    // Fetch from API and cache
                    monitorCacheMiss('user');
                    const retrieveUserResponse = await new UserRepository().retrieveUser(uid);
                    currentUser = retrieveUserResponse.data;
                    userCache.set(userCacheKey, currentUser, 10 * 60 * 1000); // Cache for 10 minutes
                }
                const currentAdmin: Admin | null = isAdmin(currentUser);

                // Check:
                // 1. Super admin must sign in via the dedicated URL.
                // 2. Only super admin can sign in via the dedicated URL.
                let validSuperAdminSignIn: boolean = true;

                if (Routes.isSuperAdminSignInRoute(ManageGroupUrlState.routePath ?? "")) {
                    if (!(currentAdmin && currentAdmin.superAdmin)) {
                        validSuperAdminSignIn = false;
                        authenticationCompleteAction.error = {
                            detail: "You have no privileges to sign in."
                        }
                    }
                } else if (Routes.isSignInRoute(ManageGroupUrlState.routePath ?? "")) {
                    if (currentAdmin && currentAdmin.superAdmin) {
                        validSuperAdminSignIn = false;
                        authenticationCompleteAction.error = {
                            detail: "Please sign in via your dedicated page."
                        }
                    }
                }

                if (!validSuperAdminSignIn) {
                    await dispatch(signOut());
                    authenticationCompleteAction.status = AuthenticationStatus.Unauthenticated;
                    return dispatch(authenticationCompleteAction);
                }

                authenticationCompleteAction.currentUser = currentUser;


                // get groups of membership for the current user (with caching)
                const groupsCacheKey = CacheKeys.groupsOfMembership(uid);
                
                const cachedGroups = userCache.get<GroupOfMembership[]>(groupsCacheKey);
                if (cachedGroups) {
                    monitorCacheHit('user');
                    authenticationCompleteAction.groupsOfMembership = cachedGroups;
                } else {
                    monitorCacheMiss('user');
                    const listGroupsOfMembershipResponse = await new UserRepository().listGroupsOfMembership(uid);
                    authenticationCompleteAction.groupsOfMembership = listGroupsOfMembershipResponse.data;
                    userCache.set(groupsCacheKey, listGroupsOfMembershipResponse.data, 15 * 60 * 1000); // Cache for 15 minutes
                }

                // Update last login date
                try {
                    const currentTimestamp = Date.now();
                    
                    if (currentAdmin) {
                        // For Admin users, we'll update the admin object in the future if needed
                        
                        // For now, just update the local state
                        const updatedAdmin = { ...currentUser, lastLoginDate: currentTimestamp };
                        authenticationCompleteAction.currentUser = updatedAdmin;
                    } else {
                        // For regular User objects, update via UserRepository
                        const updatedUser = { ...currentUser as User, lastLoginDate: currentTimestamp };
                        
                        
                        const updateResponse = await new UserRepository().updateUser({
                            updatedUser: updatedUser
                        });
                        
                        
                        // Update the user in the authentication state with the new last login date
                        authenticationCompleteAction.currentUser = updatedUser;
                    }
                } catch (error) {
                    console.error("LOGIN TRACKING: Failed to update last login date:", error);
                    console.error("LOGIN TRACKING: Error details:", error.message || error);
                    // Continue with authentication even if login tracking fails
                }

                // Clear offers cache on successful authentication
                // This ensures that private projects become visible immediately
                CacheInvalidationManager.invalidateOffersCache('user authenticated');

                authenticationCompleteAction.status = AuthenticationStatus.Authenticated;

                // Dispatch authentication completion first
                dispatch(authenticationCompleteAction);

                // Then trigger offers refresh to get updated data with authentication
                return dispatch(fetchOffers());
            } else {
                await dispatch(signOut());
                authenticationCompleteAction.status = AuthenticationStatus.Unauthenticated;
                authenticationCompleteAction.error = {
                    detail: "Invalid credential."
                }
                return dispatch(authenticationCompleteAction);
            }
        } catch (error) {
            await dispatch(signOut());
            authenticationCompleteAction.status = AuthenticationStatus.Unauthenticated;
            authenticationCompleteAction.error = {
                detail: error.toString()
            }
            return dispatch(authenticationCompleteAction);
        }
    }
}

export const signOut: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        try {
            await firebase.auth().signOut();
        } catch (error) {
        }
        
        // Clear user cache to prevent showing previous user's data
        userCache.clear();

        // Clear offers cache on sign out
        // This ensures that private projects are hidden immediately when user logs out
        CacheInvalidationManager.invalidateOffersCache('user signed out');

        // Clear any stored redirect URL to prevent wrong redirection for next user
        try {
            localStorage.removeItem('redirectToAfterAuth');
        } catch (error) {
        }

        // Reset group URL state to prevent wrong group routing for next user
        dispatch(resetGroupUrlState());

        // Dispatch sign out action first
        dispatch({
            type: AuthenticationEvents.SignOut
        });

        // Then trigger offers refresh to get updated data without authentication
        return dispatch(fetchOffers());
    }
}

export const updateUserChanges: ActionCreator<any> = (updatedUser: User | Admin) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: UpdateUserChangesAction = {
            type: AuthenticationEvents.UpdateUserChanges,
            updatedUser: JSON.parse(JSON.stringify(updatedUser))
        };
        return dispatch(action);
    }
}