import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import {
    INVALID_AUTH_USER_NOT_EXIST,
    INVALID_AUTH_USER_DECLINED_TO_REGISTER,
    INVALID_AUTH_USER_LEFT,
    INVALID_AUTH_USER_KICKED_OUT,
    AUTH_SUCCESS
} from '../../pages/signin/Signin';

export const INITIALIZE_AUTH_STATE = 'INITIALIZE_AUTH_STATE';
export const initializeAuthState = () => {
    return {
        type: INITIALIZE_AUTH_STATE
    }
};

export const RESET_AUTH_STATUS = 'RESET_AUTH_STATUS';
export const resetAuthStatus = () => {
    return {
        type: RESET_AUTH_STATUS
    }
};

export const SIGNING_IN = 'SIGNING_IN';
export const AUTHENTICATING = 'AUTHENTICATING';
export const FINISHED_AUTHENTICATING = 'FINISHED_AUTHENTICATING';
export const signin = (email, password) => {
    return (dispatch, getState) => {
        // if the user is already logged in and they still press signin again
        // log them out first before starting the sign in process
        logOutWithIndirectDispatch(dispatch);

        dispatch({
            type: SIGNING_IN
        });

        dispatch({
            type: AUTHENTICATING
        });

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .catch(error => {
                dispatch({
                    type: FINISHED_AUTHENTICATING,
                    authStatus: INVALID_AUTH_USER_NOT_EXIST,
                    error
                });
            });
    }
};

export const TOGGLE_PREVENT_VALIDATING_USER_WHEN_SIGNING_UP = 'TOGGLE_PREVENT_VALIDATING_USER_WHEN_SIGNING_UP';
export const togglePreventValidatingUserWhenSigningUp = (shouldPrevent) => {
    return {
        type: TOGGLE_PREVENT_VALIDATING_USER_WHEN_SIGNING_UP,
        shouldPrevent
    }
};

export const USER_PROFILE_LOADED = 'USER_PROFILE_LOADED';
export const AUTH_LOADING_GROUPS_USER_IS_IN = 'AUTH_LOADING_GROUPS_USER_IS_IN';
export const AUTH_GROUPS_USER_IS_IN_LOADED = 'AUTH_GROUPS_USER_IS_IN_LOADED';
/**
 * This function is used to load user's profile and check if the user belongs to the angel network specified in the URL
 *
 * @param uid
 * @returns {function(...[*]=)}
 */
export const getUserProfileAndValidateUser = uid => {
    return (dispatch, getState) => {

        if (!uid) {
            dispatch({
                type: USER_PROFILE_LOADED,
                user: null
            });
            return;
        }

        const {
            groupUserName,
            groupProperties
        } = getState().manageGroupFromParams;

        const {
            signingIn,
            user,
            userLoaded,
            preventValidatingUserWhenSigningUp
        } = getState().auth;

        // if in signup process, do not proceed loading the user's profile as it will cause a lot of conflicts
        // due to the lack of user's data on the database
        if (preventValidatingUserWhenSigningUp) {
            return;
        }

        if (user && userLoaded) {
            return;
        }

        // if the page is reloaded (not from the Sign in button), this process will become the signin process
        if (!signingIn) {
            dispatch({
                type: AUTHENTICATING
            });
        }

        realtimeDBUtils
            .getUserBasedOnID(uid)
            .then(user => {
                dispatch({
                    type: USER_PROFILE_LOADED,
                    user
                });

                // if the user is an admin, do not need to check for groups they are in
                if (user.type === DB_CONST.TYPE_ADMIN) {
                    // groupUserName is specified in the URL --> angel network login
                    if (groupUserName) {
                        // check if the angel network specified in the URL is valid
                        if (groupProperties) {
                            // check if the admin is from an angel network and if the admin's anid is equal to the anid specified in the URL
                            if (!user.isInvestWest && !user.superAdmin && user.anid === groupProperties.anid) {
                                dispatch({
                                    type: FINISHED_AUTHENTICATING,
                                    authStatus: AUTH_SUCCESS
                                });
                            } else {
                                dispatch({
                                    type: FINISHED_AUTHENTICATING,
                                    authStatus: INVALID_AUTH_USER_NOT_EXIST
                                });

                                logOutWithIndirectDispatch(dispatch);
                            }
                        } else {
                            // do nothing
                        }
                    }
                    // angel network is not specified in the URL --> Invest West login
                    else {
                        // admins are from Invest West
                        if (user.isInvestWest || user.superAdmin) {
                            dispatch({
                                type: FINISHED_AUTHENTICATING,
                                authStatus: AUTH_SUCCESS
                            });
                        } else {
                            dispatch({
                                type: FINISHED_AUTHENTICATING,
                                authStatus: INVALID_AUTH_USER_NOT_EXIST
                            });

                            logOutWithIndirectDispatch(dispatch);
                        }
                    }
                }
                // the user is not an admin (issuer or investor), load the groups they are in to check for login with each angel network
                else {
                    dispatch({
                        type: AUTH_LOADING_GROUPS_USER_IS_IN
                    });

                    realtimeDBUtils
                        .loadGroupsUserIsIn(user.id)
                        .then(groupsUserIsIn => {
                            dispatch({
                                type: AUTH_GROUPS_USER_IS_IN_LOADED,
                                groups: groupsUserIsIn
                            });

                            // user is not in any groups --> this is impractical but worth checking just in case
                            if (!groupsUserIsIn || (groupsUserIsIn && groupsUserIsIn.length === 0)) {
                                dispatch({
                                    type: FINISHED_AUTHENTICATING,
                                    authStatus: INVALID_AUTH_USER_NOT_EXIST
                                });

                                logOutWithIndirectDispatch(dispatch);
                                return;
                            }

                            let groupFound = null;

                            // groupUserName is specified in the URL --> angel network login
                            if (groupUserName) {
                                // check if the angel network specified in the URL is valid
                                if (groupProperties) {
                                    groupsUserIsIn.forEach(group => {
                                        if (group.anid === groupProperties.anid) {
                                            groupFound = group;
                                        }
                                    });
                                } else {
                                    // do nothing
                                }
                            }
                            // angel network is not specified in the URL --> Invest West login
                            else {
                                groupsUserIsIn.forEach(group => {
                                    if (group.isInvestWest) {
                                        groupFound = group;
                                    }
                                });
                            }

                            // check if the angel network specified in the URL is valid
                            if (groupProperties) {
                                if (groupFound) {
                                    if (groupFound.userInGroupStatus === DB_CONST.INVITED_USER_STATUS_ACTIVE) {
                                        dispatch({
                                            type: FINISHED_AUTHENTICATING,
                                            authStatus: AUTH_SUCCESS
                                        });
                                    } else {
                                        dispatch({
                                            type: FINISHED_AUTHENTICATING,
                                            authStatus:
                                                groupFound.userInGroupStatus === DB_CONST.INVITED_USER_DECLINED_TO_REGISTER
                                                    ?
                                                    INVALID_AUTH_USER_DECLINED_TO_REGISTER
                                                    :
                                                    groupFound.userInGroupStatus === DB_CONST.INVITED_USER_STATUS_LEFT
                                                        ?
                                                        INVALID_AUTH_USER_LEFT
                                                        :
                                                        groupFound.userInGroupStatus === DB_CONST.INVITED_USER_STATUS_KICKED_OUT
                                                            ?
                                                            INVALID_AUTH_USER_KICKED_OUT
                                                            :
                                                            INVALID_AUTH_USER_NOT_EXIST
                                        });

                                        logOutWithIndirectDispatch(dispatch);
                                    }
                                } else {
                                    dispatch({
                                        type: FINISHED_AUTHENTICATING,
                                        authStatus: INVALID_AUTH_USER_NOT_EXIST
                                    });

                                    logOutWithIndirectDispatch(dispatch);
                                }
                            }
                            // the angel network is set to null --> super page
                            else {
                                dispatch({
                                    type: FINISHED_AUTHENTICATING,
                                    authStatus: INVALID_AUTH_USER_NOT_EXIST
                                });

                                logOutWithIndirectDispatch(dispatch);
                            }
                        })
                        .catch(error => {
                            dispatch({
                                type: AUTH_LOADING_GROUPS_USER_IS_IN,
                                groups: null,
                                error
                            });

                            logOutWithIndirectDispatch(dispatch);
                        });
                }
            })
            .catch(error => {
                dispatch({
                    type: USER_PROFILE_LOADED,
                    user: null
                });

                dispatch({
                    type: FINISHED_AUTHENTICATING,
                    authStatus: INVALID_AUTH_USER_NOT_EXIST
                });

                logOutWithIndirectDispatch(dispatch);
            });
    }
};

/**
 * Logout function to be used within this file
 *
 * @param dispatch
 */
export const logOutWithIndirectDispatch = (dispatch) => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            dispatch({
                type: LOG_OUT
            });
        });
};

export const LOG_OUT = 'LOG_OUT';
/**
 * Logout function --> called outside this file
 *
 * For some reasons (don't now), this function won't get called when called inside this file
 *
 * @returns {function(...[*]=)}
 */
export const logout = () => {
    return (dispatch, getState) => {
        // firebase
        //     .auth()
        //     .signOut()
        //     .then(() => {
        //
        //     });
        return dispatch({
            type: LOG_OUT
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let userListener = null;
let groupsUserIsInListener = null;

export const CURRENT_USER_PROFILE_HAS_CHANGED = 'CURRENT_USER_PROFILE_HAS_CHANGED';
export const startListeningForUserProfileChanges = () => {
    return (dispatch, getState) => {
        if (!userListener) {
            const {
                user
            } = getState().auth;

            userListener = firebase
                .database()
                .ref(DB_CONST.USERS_CHILD)
                .child(user.id);

            userListener
                .on('value', snapshot => {
                    const userChanged = snapshot.val();
                    // this on changed function will be invoked as soon as the user profile is downloaded
                    // however, the snapshot.val() returns null as there are no changes
                    // thus, we need to check if snapshot.val() is not null before assigning its value
                    // to the user variable. Otherwise, the user variable will be set to null which causes
                    // PageNotFound to be returned.
                    if (userChanged) {
                        dispatch({
                            type: CURRENT_USER_PROFILE_HAS_CHANGED,
                            userChanged
                        });
                    }
                });
        }
    }
};

export const stopListeningForUserProfileChanges = () => {
    return (dispatch, getState) => {
        if (userListener) {
            userListener.off('value');
            userListener = null;
        }
    }
};

export const GROUPS_USER_IS_IN_HAVE_CHANGED = 'GROUPS_USER_IS_IN_HAVE_CHANGED';
export const startListeningForGroupsUserIsIn = () => {
    return (dispatch, getState) => {

        const user = getState().auth.user;

        if (!groupsUserIsInListener) {
            groupsUserIsInListener = firebase
                .database()
                .ref(DB_CONST.INVITED_USERS_CHILD)
                .orderByChild('email')
                .equalTo(user.email);

            groupsUserIsInListener
                .on('child_added', snapshot => {
                    let invitedUser = snapshot.val();
                    const groupsUserIsIn = getState().auth.groupsUserIsIn;

                    let groupUserIsIn = {
                        invitedUser: invitedUser,
                        anid: invitedUser.invitedBy,
                        userInGroupStatus: invitedUser.status
                    };

                    const index = groupsUserIsIn.findIndex(group => group.invitedUser.id === groupUserIsIn.invitedUser.id);
                    if (index === -1) {
                        realtimeDBUtils
                            .loadAngelNetworkBasedOnANID(groupUserIsIn.anid)
                            .then(angelNetwork => {
                                groupUserIsIn.isInvestWest = angelNetwork.isInvestWest;
                                groupUserIsIn.groupDetails = angelNetwork;

                                dispatch({
                                    type: GROUPS_USER_IS_IN_HAVE_CHANGED,
                                    groups: [...groupsUserIsIn, groupUserIsIn]
                                });
                            });
                    }
                });

            groupsUserIsInListener
                .on('child_changed', snapshot => {
                    let invitedUser = snapshot.val();
                    let groupsUserIsIn = getState().auth.groupsUserIsIn;

                    let groupUserIsIn = {
                        invitedUser: invitedUser,
                        anid: invitedUser.invitedBy,
                        userInGroupStatus: invitedUser.status
                    };

                    const index = groupsUserIsIn.findIndex(group => group.invitedUser.id === groupUserIsIn.invitedUser.id);
                    if (index !== -1) {
                        realtimeDBUtils
                            .loadAngelNetworkBasedOnANID(groupsUserIsIn.anid)
                            .then(angelNetwork => {
                                groupUserIsIn.isInvestWest = angelNetwork.isInvestWest;
                                groupUserIsIn.groupDetails = angelNetwork;

                                groupsUserIsIn[index] = groupsUserIsIn;

                                dispatch({
                                    type: GROUPS_USER_IS_IN_HAVE_CHANGED,
                                    groups: [...groupsUserIsIn]
                                });
                            });
                    }
                });
        }
    }
};

export const stopListeningForGroupsUserIsIn = () => {
    return (dispatch, getState) => {
        if (groupsUserIsInListener) {
            groupsUserIsInListener.off('child_added');
            groupsUserIsInListener.off('child_changed');
            groupsUserIsInListener = null;
        }
    }
};

