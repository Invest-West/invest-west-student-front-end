import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as feedbackSnackbarActions from '../actions/feedbackSnackbarActions';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as ROUTES from '../../router/routes';
import * as utils from '../../utils/utils';

export const SET_ORIGINAL_USER_AND_EDITED_USER = 'SET_ORIGINAL_USER_AND_EDITED_USER';
export const setOriginalUserAndEditedUser = user => {
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const previouslySetUser = getState().editUser.originalUser;

        let allowEditing = true;

        // user is set to null
        if (!user) {
            dispatch({
                type: SET_ORIGINAL_USER_AND_EDITED_USER,
                user,
                allowEditing
            });
            return;
        }

        if (previouslySetUser && previouslySetUser.id === user.id) {
            return;
        }

        if (user.hasOwnProperty('groupsUserIsIn')
            && currentUser.type === DB_CONST.TYPE_ADMIN
            && !currentUser.superAdmin
        ) {
            let userHomeGroup = utils.getUserHomeGroup(user.groupsUserIsIn);
            // userHomeGroup is null --> failed to find user's home group
            // do not let any group admins to edit this user's profile
            if (!userHomeGroup) {
                allowEditing = false;
            }
            // userHomeGroup is not null
            else {
                // this current group admin does not belong to the userHomeGroup
                if (currentUser.anid !== userHomeGroup.anid) {
                    allowEditing = false;
                }
            }
        }

        dispatch({
            type: SET_ORIGINAL_USER_AND_EDITED_USER,
            user,
            allowEditing
        });
    }
};

export const EDIT_PERSONAL_INFORMATION = 'EDIT_PERSONAL_INFORMATION';
export const EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION = 'EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION';
export const EDIT_TRADING_ADDRESS_BUSINESS_PROFILE = 'EDIT_TRADING_ADDRESS_BUSINESS_PROFILE';
export const EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE = 'EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE';
export const ADDING_NEW_DIRECTOR = 'ADDING_NEW_DIRECTOR';
export const editUserLocally = (type, edit) => {
    return (dispatch, getState) => {
        dispatch({
            type,
            edit: {
                property: edit.property,
                value: edit.value
            }
        });
    }
};

export const TOGGLE_ADD_NEW_DIRECTOR = 'TOGGLE_ADD_NEW_DIRECTOR';
export const toggleAddNewDirector = () => {
    return {
        type: TOGGLE_ADD_NEW_DIRECTOR
    }
};

export const ADD_NEW_DIRECTOR_TEMPORARILY = 'ADD_NEW_DIRECTOR_TEMPORARILY';
export const addNewDirectorTemporarily = isEditingExistingBusinessProfile => {
    return (dispatch, getState) => {
        dispatch({
            type: ADD_NEW_DIRECTOR_TEMPORARILY,
            isEditingExistingBusinessProfile,
            director: getState().editUser.newDirectorText
        });
    }
};

export const DELETE_DIRECTOR_TEMPORARILY = 'DELETE_DIRECTOR_TEMPORARILY';
export const deleteDirectorTemporarily = (index, isEditingExistingBusinessProfile) => {
    return {
        type: DELETE_DIRECTOR_TEMPORARILY,
        index,
        isEditingExistingBusinessProfile
    }
};

export const RESET_PERSONAL_INFORMATION = 'RESET_PERSONAL_INFORMATION';
export const RESET_BUSINESS_PROFILE = 'RESET_BUSINESS_PROFILE';
export const cancelEditingUser = type => {
    return {
        type
    }
};

export const COMMIT_PERSONAL_INFORMATION_CHANGES = 'COMMIT_PERSONAL_INFORMATION_CHANGES';
export const COMMIT_BUSINESS_PROFILE_CHANGES = 'COMMIT_BUSINESS_PROFILE_CHANGES';
export const commitUserProfileChanges = type => {
    return (dispatch, getState) => {

        const currentUser = getState().auth.user;
        const originalUser = JSON.parse(JSON.stringify(getState().editUser.originalUser));
        const userEdited = JSON.parse(JSON.stringify(getState().editUser.userEdited));

        const userRef = firebase
            .database()
            .ref(DB_CONST.USERS_CHILD)
            .child(userEdited.id);

        if (type === COMMIT_PERSONAL_INFORMATION_CHANGES) {
            userRef
                .update({
                    title: userEdited.title,
                    firstName: userEdited.firstName,
                    lastName: userEdited.lastName,
                    email: userEdited.email,
                    linkedin:
                        userEdited.linkedin && userEdited.linkedin.trim().length > 0
                            ?
                            userEdited.linkedin
                            :
                            null
                })
                .then(() => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentUser.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the user's profile
                                "User's personal details have been updated."
                                :
                                // the user is editing their own profile
                                "Your personal details have been updated."
                        ,
                        color: "primary",
                        position: "bottom"
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.USERS_CHILD,
                            interactedObjectID: userEdited.id,
                            activitySummary:
                                currentUser.id === userEdited.id
                                    ?
                                    // user is editing their own details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_UPDATED_PERSONAL_DETAILS
                                    :
                                    // admin is editing user's details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_PERSONAL_DETAILS
                                        .replace("%user%", userEdited.firstName + " " + userEdited.lastName)
                            ,
                            action:
                                currentUser.id === userEdited.id
                                    ?
                                    // user is editing their own details
                                    null
                                    :
                                    // admin is editing user's details
                                    ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(":userID", userEdited.id)
                            ,
                            value: {
                                before: originalUser,
                                after: userEdited
                            }
                        });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentUser.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the user's profile
                                "Error happened. Couldn't update this user's personal details."
                                :
                                // the user is editing their own profile
                                "Error happened. We couldn't update your personal details."
                        ,
                        color: "error",
                        position: "bottom"
                    });
                });
        } else if (type === COMMIT_BUSINESS_PROFILE_CHANGES) {

            let businessProfile = JSON.parse(JSON.stringify(userEdited.BusinessProfile));

            userRef
                .update({
                    BusinessProfile: businessProfile
                })
                .then(() => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentUser.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the user's profile
                                "User's business profile has been updated."
                                :
                                // the user is editing their own profile
                                "Your business profile has been updated."
                        ,
                        color: "primary",
                        position: "bottom"
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.USERS_CHILD,
                            interactedObjectID: userEdited.id,
                            activitySummary:
                                currentUser.id === userEdited.id
                                    ?
                                    // user is editing their own details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_UPDATED_BUSINESS_PROFILE
                                    :
                                    // admin is editing user's details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_BUSINESS_PROFILE
                                        .replace("%user%", userEdited.firstName + " " + userEdited.lastName)
                            ,
                            action:
                                currentUser.id === userEdited.id
                                    ?
                                    // user is editing their own details
                                    null
                                    :
                                    // admin is editing user's details
                                    ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(":userID", userEdited.id)
                            ,
                            value: {
                                before: originalUser,
                                after: userEdited
                            }
                        });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentUser.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the user's profile
                                "Error happened. Couldn't update this user's business profile."
                                :
                                // the user is editing their own profile
                                "Error happened. We couldn't update your business profile."
                        ,
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    };
};

let originalUserListener = null;

export const EDIT_USER_ORIGINAL_USER_CHANGED = 'EDIT_USER_ORIGINAL_USER_CHANGED';
export const startOriginalUserChangedListener = () => {
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const originalUser = getState().editUser.originalUser;

        if (!currentUser || !originalUser) {
            return;
        }

        // if the current user is the same as the user being edited
        // then we don't need this listener since the current user changes
        // are taken care by the auth actions.
        if (currentUser.id === originalUser.id) {
            return;
        }

        if (!originalUserListener) {
            originalUserListener = firebase
                .database()
                .ref(DB_CONST.USERS_CHILD)
                .child(originalUser.id);

            originalUserListener
                .on('value', snapshot => {
                    let userChanged = snapshot.val();

                    if (userChanged) {
                        userChanged.groupsUserIsIn = originalUser.groupsUserIsIn;

                        dispatch({
                            type: EDIT_USER_ORIGINAL_USER_CHANGED,
                            userChanged
                        });
                    }
                });
        }
    }
};

export const stopOriginalUserChangedListener = () => {
    return (dispatch, getState) => {
        if (originalUserListener) {
            originalUserListener.off('value');
            originalUserListener = null;
        }
    }
}