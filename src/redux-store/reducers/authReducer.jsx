import * as authActions from '../actions/authActions';
import {
    INVALID_AUTH_NONE,
    AUTH_SUCCESS
} from '../../pages/signin/Signin';

// auth initial state
const initState = {
    signingIn: false,
    authenticating: false,
    authStatus: INVALID_AUTH_NONE,

    preventValidatingUserWhenSigningUp: false,

    user: null,
    userLoaded: false,
    userBeingLoaded: false,

    groupsUserIsIn: null,
    loadingGroupsUserIsIn: false,
    groupsUserIsInLoaded: false
};

const authReducer = (state = initState, action) => {

    switch (action.type) {
        case authActions.LOG_OUT:
            return {
                ...initState,
                authenticating: state.authenticating,
                authStatus: state.authStatus
            };
        case authActions.INITIALIZE_AUTH_STATE:
            return {
                ...initState,
                authenticating: state.authenticating,
                authStatus: state.authStatus
            };
        case authActions.TOGGLE_PREVENT_VALIDATING_USER_WHEN_SIGNING_UP:
            return {
                ...state,
                preventValidatingUserWhenSigningUp: action.shouldPrevent
            };
        case authActions.RESET_AUTH_STATUS:
            return {
                ...state,
                authStatus: INVALID_AUTH_NONE
            };
        case authActions.SIGNING_IN:
            return {
                ...state,
                singingIn: true
            };
        case authActions.AUTHENTICATING:
            return {
                ...state,
                singingIn: false,
                authenticating: true,
                authStatus: INVALID_AUTH_NONE,
                preventValidatingUserWhenSigningUp: false,

                user: null,
                userLoaded: false,
                userBeingLoaded: true,

                groupsUserIsIn: null,
                loadingGroupsUserIsIn: false,
                groupsUserIsInLoaded: false
            };
        case authActions.AUTH_LOADING_GROUPS_USER_IS_IN:
            return {
                ...state,
                groupsUserIsIn: [],
                loadingGroupsUserIsIn: true,
                groupsUserIsInLoaded: false
            };
        case authActions.AUTH_GROUPS_USER_IS_IN_LOADED:
            return {
                ...state,
                groupsUserIsIn: [...action.groups],
                loadingGroupsUserIsIn: false,
                groupsUserIsInLoaded: true
            };
        case authActions.FINISHED_AUTHENTICATING:
            return {
                ...state,
                signingIn: false,
                authenticating: false,
                authStatus: action.authStatus,
                preventValidatingUserWhenSigningUp: false,

                user: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? null : state.user,
                userLoaded: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? true : state.userLoaded,
                userBeingLoaded: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? false : state.userBeingLoaded,

                groupsUserIsIn: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? null : state.groupsUserIsIn,
                loadingGroupsUserIsIn: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? false : state.loadingGroupsUserIsIn,
                groupsUserIsInLoaded: (action.authStatus !== AUTH_SUCCESS && action.authStatus !== INVALID_AUTH_NONE) ? false : state.groupsUserIsInLoaded
            };
        // set state when finished loading user's profile
        case authActions.USER_PROFILE_LOADED:
            return {
                ...state,
                user: JSON.parse(JSON.stringify(action.user)),
                userLoaded: true,
                userBeingLoaded: false
            };
        // when user's profile has changed
        case authActions.CURRENT_USER_PROFILE_HAS_CHANGED:
            return {
                ...state,
                user: JSON.parse(JSON.stringify(action.userChanged))
            };
        case authActions.GROUPS_USER_IS_IN_HAVE_CHANGED:
            return {
                ...state,
                groupsUserIsIn: [...action.groups]
            };
        default:
            return state;
    }
};

export default authReducer;


