import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import {trackActivity} from "../../firebase/realtimeDBUtils";
import firebase from "../../firebase/firebaseApp";
import {
    ADD_NEW_GROUP_ADMIN_STATUS_CHECKING,
    ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED,
    ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL
} from "../../pages/admin/components/GroupAdminsTable";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";
import Api, {ApiRoutes} from "../../api/Api.tsx";

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
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const tableGroup = getState().manageGroupAdminsTable.tableGroup;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: []
            });
            return;
        }

        if (!currentUser.superAdmin) {
            if (currentUser.anid !== tableGroup.anid) {
                dispatch({
                    type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                    groupAdmins: []
                });
                return;
            }
        }

        dispatch({
            type: GROUP_ADMINS_TABLE_LOADING_GROUP_ADMINS
        });

        realtimeDBUtils
        .loadGroupAdminsBasedOnGroupID(tableGroup.anid)
        .then(groupAdmins => {
            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: [...groupAdmins]
            });
        })
        .catch(error => {
            console.error('Error loading group admins:', error);
            dispatch({
                type: GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS,
                groupAdmins: []
            });
        });
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
export const handleInputChanged = event => {
    return {
        type: GROUP_ADMINS_TABLE_HANDLE_INPUT_CHANGED,
        event
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
        const newGroupAdminEmail = getState().manageGroupAdminsTable.newGroupAdminEmail;
        const currentUser = getState().auth.user;
        const groupProperties = getState().manageGroupFromParams.groupProperties;

        if (!currentUser) {
            return;
        }

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (!currentUser.superGroupAdmin) {
            return;
        }

        if (newGroupAdminEmail.trim().length === 0) {
            dispatch({
                type: GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED,
                status: ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL
            });
            return;
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
                            groupProperties: groupProperties,
                            newGroupAdminEmail: newGroupAdminEmail
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

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Group admin added successfully.",
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
                message: "Error happened. Couldn't add this group admin.",
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
        const tableGroup = getState().manageGroupAdminsTable.tableGroup;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (!currentUser.superAdmin && currentUser.anid !== tableGroup.anid) {
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

                    if (groupAdmin.anid === tableGroup.anid) {
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
                    groupAdmins[index] = groupAdmin;
                    dispatch({
                        type: GROUP_ADMINS_TABLE_CHANGED,
                        groupAdmins: [...groupAdmins]
                    });
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