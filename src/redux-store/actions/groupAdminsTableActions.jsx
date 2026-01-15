import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import {trackActivity} from "../../firebase/realtimeDBUtils";
import firebase from "../../firebase/firebaseApp";
import {
    ADD_NEW_GROUP_ADMIN_STATUS_CHECKING,
    ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED,
    ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL
} from "../../pages/admin/components/AngelNetworks";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";
import Api, {ApiRoutes} from "../../api/Api.tsx";
import {getCoursesForUniversity} from "../../models/group_properties";

export const GROUP_ADMINS_TABLE_SET_GROUP = 'GROUP_ADMINS_TABLE_SET_GROUP';
export const setGroup = newGroup => {
    return (dispatch, getState) => {
        const prevTableGroup = getState().manageGroupAdminsTable.tableGroup;

        if (!newGroup || !prevTableGroup) {
            dispatch({
                type: GROUP_ADMINS_TABLE_SET_GROUP,
                group: newGroup
            });
            return;
        }

        if (prevTableGroup.anid === newGroup.anid) {
            return;
        }

        dispatch({
            type: GROUP_ADMINS_TABLE_SET_GROUP,
            group: newGroup
        });
    }
};

export const GROUP_ADMINS_TABLE_LOADING_GROUP_ADMINS = 'GROUP_ADMINS_TABLE_LOADING_GROUP_ADMINS';
export const GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS = 'GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS';
export const loadGroupAdmins = () => {
    return async (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const tableGroup = getState().manageGroupAdminsTable.tableGroup;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: []
            });
            return;
        }

        dispatch({
            type: GROUP_ADMINS_TABLE_LOADING_GROUP_ADMINS
        });

        try {
            let groupAdmins = [];

            // Super admins OR super group admins see ALL admins
            const isSuperUser = currentUser.superAdmin || currentUser.superGroupAdmin;

            if (isSuperUser) {
                // Super users see ALL admins from all universities
                const snapshot = await firebase
                    .database()
                    .ref(DB_CONST.ADMINISTRATORS_CHILD)
                    .once('value');

                if (snapshot.exists()) {
                    const adminsObject = snapshot.val();
                    groupAdmins = Object.keys(adminsObject).map(key => adminsObject[key]);
                }
            } else {
                // Regular group admins only see admins from their university
                groupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(currentUser.anid);
            }

            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: [...groupAdmins]
            });
        } catch (error) {
            console.error('Error loading group admins:', error);
            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: []
            });
        }
    }
};

export const GROUP_ADMINS_TABLE_PAGE_CHANGED = 'GROUP_ADMINS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: GROUP_ADMINS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const GROUP_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED = 'GROUP_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: GROUP_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const GROUP_ADMINS_TABLE_TOGGLE_SEARCH_MODE = 'GROUP_ADMINS_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return {
        type: GROUP_ADMINS_TABLE_TOGGLE_SEARCH_MODE
    }
};

export const GROUP_ADMINS_TABLE_HANDLE_INPUT_CHANGED = 'GROUP_ADMINS_TABLE_HANDLE_INPUT_CHANGED';
export const GROUP_ADMINS_TABLE_UNIVERSITY_CHANGED = 'GROUP_ADMINS_TABLE_UNIVERSITY_CHANGED';

export const handleInputChanged = event => {
    return (dispatch, getState) => {
        const {name, value} = event.target;

        // If university is changed, load available courses
        if (name === 'selectedUniversity') {
            const systemGroups = getState().manageSystemGroups?.systemGroups || [];
            const availableCourses = value ? getCoursesForUniversity(systemGroups, value) : [];

            dispatch({
                type: GROUP_ADMINS_TABLE_UNIVERSITY_CHANGED,
                universityId: value,
                availableCourses
            });
        } else {
            // For other inputs, use the standard handler
            dispatch({
                type: GROUP_ADMINS_TABLE_HANDLE_INPUT_CHANGED,
                event
            });
        }
    }
};

export const GROUP_ADMINS_TABLE_TOGGLE_ADD_NEW_GROUP_ADMIN_DIALOG = 'GROUP_ADMINS_TABLE_TOGGLE_ADD_NEW_GROUP_ADMIN_DIALOG';
export const toggleAddNewGroupAdminDialog = () => {
    return {
        type: GROUP_ADMINS_TABLE_TOGGLE_ADD_NEW_GROUP_ADMIN_DIALOG
    }
};

export const GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED = 'GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED';
export const handleAddNewGroupAdmin = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const newGroupAdminEmail = state.manageGroupAdminsTable.newGroupAdminEmail;
        const selectedUniversity = state.manageGroupAdminsTable.selectedUniversity;
        const selectedCourse = state.manageGroupAdminsTable.selectedCourse;
        const currentUser = state.auth.user;
        const systemGroups = state.manageSystemGroups?.systemGroups || [];

        if (!currentUser) {
            return;
        }

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (!currentUser.superGroupAdmin) {
            return;
        }

        // Validate email and university
        if (newGroupAdminEmail.trim().length === 0 || !selectedUniversity) {
            dispatch({
                type: GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED,
                status: ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL
            });
            return;
        }

        // Get the selected university's groupProperties
        const universityGroupProperties = systemGroups.find(g => g.anid === selectedUniversity);
        if (!universityGroupProperties) {
            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: "Could not find selected university. Please try again.",
                color: "error",
                position: "bottom"
            });
            return;
        }

        // Get course properties if a specific course is selected
        let courseGroupProperties = null;
        if (selectedCourse) {
            courseGroupProperties = systemGroups.find(g => g.anid === selectedCourse);
        }

        dispatch({
            type: GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED,
            status: ADD_NEW_GROUP_ADMIN_STATUS_CHECKING
        });

        try {
            const checkResult = await realtimeDBUtils.doesUserExist(newGroupAdminEmail.toLowerCase());

            // this email has already been used
            if (checkResult.userExists) {
                dispatch({
                    type: GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED,
                    status: ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED
                });
            } else {
                const response = await new Api().request(
                    "post",
                    ApiRoutes.addGroupAdminRoute,
                    {
                        queryParameters: null,
                        requestBody: {
                            adder: currentUser,
                            groupProperties: universityGroupProperties,
                            newGroupAdminEmail: newGroupAdminEmail,
                            selectedUniversity: selectedUniversity,
                            selectedCourse: selectedCourse || null,
                            courseGroupProperties: courseGroupProperties
                        }
                    }
                );

                // obtain the newly created group admin profile from the server
                const newGroupAdmin = response.data;

                // track super group admin's activity
                trackActivity({
                    userID: currentUser.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.ADMINISTRATORS_CHILD,
                    interactedObjectID: newGroupAdmin.id,
                    activitySummary:
                        realtimeDBUtils
                            .ACTIVITY_SUMMARY_TEMPLATE_ADDED_A_NEW_GROUP_ADMIN
                            .replace("%groupAdminEmail%", newGroupAdminEmail)
                    ,
                    value: newGroupAdmin
                });

                const successMessage = courseGroupProperties
                    ? `Course admin added successfully for ${courseGroupProperties.displayName} (${universityGroupProperties.displayName}).`
                    : `Course admin added successfully for ${universityGroupProperties.displayName}.`;

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: successMessage,
                    color: "primary",
                    position: "bottom"
                });

                dispatch({
                    type: GROUP_ADMINS_TABLE_TOGGLE_ADD_NEW_GROUP_ADMIN_DIALOG
                });
            }
        } catch (error) {
            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: "Error happened. Couldn't add this course admin.",
                color: "error",
                position: "bottom"
            });
        }
    }
};
//----------------------------------------------------------------------------------------------------------------------

let groupAdminsListener = null;

export const GROUP_ADMINS_TABLE_CHANGED = 'GROUP_ADMINS_TABLE_CHANGED';
export const startListeningForGroupAdminsChanged = () => {
    return (dispatch, getState) => {
        if (groupAdminsListener) {
            return;
        }

        const currentUser = getState().auth.user;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        groupAdminsListener = firebase
            .database()
            .ref(DB_CONST.ADMINISTRATORS_CHILD);

        groupAdminsListener
            .on('child_added', snapshot => {
                const groupAdmin = snapshot.val();
                let groupAdmins = [...getState().manageGroupAdminsTable.groupAdmins];

                const index = groupAdmins.findIndex(existingGroupAdmin => existingGroupAdmin.id === groupAdmin.id);
                if (index === -1) {
                    // Super users (superAdmin OR superGroupAdmin) see all admins, regular group admins only see their own university's admins
                    const isSuperUser = currentUser.superAdmin || currentUser.superGroupAdmin;
                    if (isSuperUser || groupAdmin.anid === currentUser.anid) {
                        dispatch({
                            type: GROUP_ADMINS_TABLE_CHANGED,
                            groupAdmins: [...groupAdmins, groupAdmin]
                        });
                    }
                }
            });

        groupAdminsListener
            .on('child_changed', snapshot => {
                const groupAdmin = snapshot.val();
                let groupAdmins = [...getState().manageGroupAdminsTable.groupAdmins];

                const index = groupAdmins.findIndex(existingGroupAdmin => existingGroupAdmin.id === groupAdmin.id);
                if (index !== -1) {
                    // Only update if visible to this admin
                    const isSuperUser = currentUser.superAdmin || currentUser.superGroupAdmin;
                    if (isSuperUser || groupAdmin.anid === currentUser.anid) {
                        groupAdmins[index] = groupAdmin;
                        dispatch({
                            type: GROUP_ADMINS_TABLE_CHANGED,
                            groupAdmins: [...groupAdmins]
                        });
                    }
                }
            });

        groupAdminsListener
            .on('child_removed', snapshot => {
                const groupAdmin = snapshot.val();
                let groupAdmins = [...getState().manageGroupAdminsTable.groupAdmins];

                const index = groupAdmins.findIndex(existingGroupAdmin => existingGroupAdmin.id === groupAdmin.id);
                if (index !== -1) {
                    groupAdmins.splice(index, 1);
                    dispatch({
                        type: GROUP_ADMINS_TABLE_CHANGED,
                        groupAdmins: [...groupAdmins]
                    });
                }
            });
    }
};

export const stopListeningForGroupAdminsChanged = () => {
    return (dispatch, getState) => {
        if (groupAdminsListener) {
            groupAdminsListener.off('child_added');
            groupAdminsListener.off('child_changed');
            groupAdminsListener.off('child_removed');
            groupAdminsListener = null;
        }
    }
};