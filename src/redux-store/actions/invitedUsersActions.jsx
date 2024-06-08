import firebase from "../../firebase/firebaseApp";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import {getUserBasedOnID} from "../../firebase/realtimeDBUtils";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as emailUtils from "../../utils/emailUtils";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";
import * as ROUTES from "../../router/routes";
import * as utils from "../../utils/utils";
import {
    FILTER_GROUP_MEMBERS_ALL,
    FILTER_HOME_MEMBERS,
    FILTER_PLATFORM_MEMBERS,
    FILTER_REGISTRATION_STATUS_ALL
} from '../../pages/admin/components/InvitedUsers';
import Api, {ApiRoutes} from "../../api/Api.tsx";

export const LOADING_INVITED_USERS = 'LOADING_INVITED_USERS';
export const FINISHED_LOADING_INVITED_USERS = 'FINISHED_LOADING_INVITED_USERS';
export const loadInvitedUsers = () => {
    return (dispatch, getState) => {
        dispatch({
            type: LOADING_INVITED_USERS
        });

        const admin = getState().auth.user;

        realtimeDBUtils
            .loadInvitedUsers(admin.superAdmin ? null : admin.anid)
            .then(invitedUsers => {
                //console.log("Invited users loaded successfully:", invitedUsers);
                dispatch({
                    type: FINISHED_LOADING_INVITED_USERS,
                    invitedUsers,
                    error: null
                });
            })
            .catch(error => {
                console.error("Error loading invited users:", error);
                dispatch({
                    type: FINISHED_LOADING_INVITED_USERS,
                    invitedUsers: [],
                    error
                });
            });
    }
};

export const INVITED_USERS_TOGGLE_SEARCH_MODE = 'INVITED_USERS_TOGGLE_SEARCH_MODE';
export const toggleInvitedUsersSearchMode = () => {
    return (dispatch, getState) => {
        const invitedUsers = [...getState().invitedUsers.invitedUsers];
        const prevMatchedInvitedUsers = [...getState().invitedUsers.matchedInvitedUsers];

        const {
            invitedUserSearchText,
            invitedUsersInSearchMode,
            filterRegistrationStatus,
            filterUserType,
            filterMembers,
            filterGroup
        } = getState().invitedUsers;

        const currentGroupProperties = getState().manageGroupFromParams.groupProperties;

        let matchedInvitedUsers;

        // exit search mode
        if (invitedUsersInSearchMode) {
            matchedInvitedUsers = getUpdatedInvitedUsers({
                sourceInvitedUsers: invitedUsers,
                searchText: null,
                filterRegistrationStatus,
                filterUserType,
                filterMembers,
                filterGroup,
                currentGroupProperties
            });
        }
        // enter search mode
        else {
            if (invitedUserSearchText.trim().length > 0) {
                matchedInvitedUsers = prevMatchedInvitedUsers.filter(
                    invitedUser => invitedUser.email.toLowerCase() === invitedUserSearchText.trim().toLowerCase()
                );
            } else {
                matchedInvitedUsers = prevMatchedInvitedUsers;
            }
        }

        dispatch({
            type: INVITED_USERS_TOGGLE_SEARCH_MODE,
            matchedInvitedUsers
        });
    }
};

export const INVITED_USERS_SEARCH_VARIABLE_CHANGED = 'INVITED_USERS_SEARCH_VARIABLE_CHANGED';
export const handleInputChanged = event => {
    return (dispatch, getState) => {
        const invitedUsers = [...getState().invitedUsers.invitedUsers];
        const prevMatchedInvitedUsers = [...getState().invitedUsers.matchedInvitedUsers];
        let matchedInvitedUsers = [];

        const {
            invitedUserSearchText,
            invitedUsersInSearchMode,
            filterRegistrationStatus,
            filterUserType,
            filterMembers,
            filterGroup
        } = getState().invitedUsers;

        const currentGroupProperties = getState().manageGroupFromParams.groupProperties;

        const name = event.target.name;
        let value = null;

        switch (name) {
            case 'invitedUserSearchText':
                const newSearchText = event.target.value;
                value = newSearchText;

                // search mode is off
                if (!invitedUsersInSearchMode) {
                    // return the previous matchedProjects
                    matchedInvitedUsers = prevMatchedInvitedUsers;
                    break;
                }

                matchedInvitedUsers = getUpdatedInvitedUsers({
                    sourceInvitedUsers: invitedUsers,
                    searchText: newSearchText,
                    filterRegistrationStatus,
                    filterUserType,
                    filterMembers,
                    filterGroup,
                    currentGroupProperties
                });
                break;
            case 'filterRegistrationStatus':
                const newRegistrationStatusFilter = event.target.value;
                value = newRegistrationStatusFilter;

                matchedInvitedUsers = getUpdatedInvitedUsers({
                    sourceInvitedUsers: invitedUsers,
                    searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                    filterRegistrationStatus: newRegistrationStatusFilter,
                    filterUserType,
                    filterMembers,
                    filterGroup,
                    currentGroupProperties
                });
                break;
            case 'filterUserType':
                const newUserTypeFilter = event.target.value;
                value = newUserTypeFilter;

                matchedInvitedUsers = getUpdatedInvitedUsers({
                    sourceInvitedUsers: invitedUsers,
                    searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                    filterRegistrationStatus,
                    filterUserType: newUserTypeFilter,
                    filterMembers,
                    filterGroup,
                    currentGroupProperties
                });
                break;
            case 'filterGroup':
                const newGroupFilter = event.target.value;
                value = newGroupFilter;

                matchedInvitedUsers = getUpdatedInvitedUsers({
                    sourceInvitedUsers: invitedUsers,
                    searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                    filterRegistrationStatus,
                    filterUserType,
                    filterMembers,
                    filterGroup: newGroupFilter,
                    currentGroupProperties
                });
                break;
            case 'filterMembers':
                const newMembersFilter = event.target.value;
                value = newMembersFilter;

                matchedInvitedUsers = getUpdatedInvitedUsers({
                    sourceInvitedUsers: invitedUsers,
                    searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                    filterRegistrationStatus,
                    filterUserType,
                    filterMembers: newMembersFilter,
                    filterGroup,
                    currentGroupProperties
                });
                break;
            default:
                break;
        }

        dispatch({
            type: INVITED_USERS_SEARCH_VARIABLE_CHANGED,
            name,
            value,
            matchedInvitedUsers
        });
    }
};

/**
 * Get updated invitedUsers when a search criteria is changed
 *
 * @param sourceInvitedUsers
 * @param searchText
 * @param filterRegistrationStatus
 * @param filterUserType
 * @param filterMembers
 * @param filterGroup
 * @param currentGroupProperties
 * @returns {[]}
 */
const getUpdatedInvitedUsers = (
    {
        sourceInvitedUsers,
        searchText,
        filterRegistrationStatus,
        filterUserType,
        filterMembers,
        filterGroup,
        currentGroupProperties
    }
) => {
    let matchedInvitedUsers = [];

    sourceInvitedUsers.forEach(invitedUser => {
        let satisfiedRegistrationStatusFilter = false;
        let satisfiedUserTypeFilter = false;
        let satisfiedGroupMembersFilter = false;
        let satisfiedGroupFilter = false;

        // filter by registration status
        switch (filterRegistrationStatus) {
            case FILTER_REGISTRATION_STATUS_ALL:
                satisfiedRegistrationStatusFilter = true;
                break;
            case DB_CONST.INVITED_USER_STATUS_ACTIVE:
                if (invitedUser.status === DB_CONST.INVITED_USER_STATUS_ACTIVE) {
                    satisfiedRegistrationStatusFilter = true;
                }
                break;
            case DB_CONST.INVITED_USER_NOT_REGISTERED:
                if (invitedUser.status === DB_CONST.INVITED_USER_NOT_REGISTERED) {
                    satisfiedRegistrationStatusFilter = true;
                }
                break;
            default:
                break;
        }

        // filter by user type
        switch (filterUserType) {
            case DB_CONST.TYPE_INVESTOR:
                if (invitedUser.type === DB_CONST.TYPE_INVESTOR) {
                    satisfiedUserTypeFilter = true;
                }
                break;
            case DB_CONST.TYPE_ISSUER:
                if (invitedUser.type === DB_CONST.TYPE_ISSUER) {
                    satisfiedUserTypeFilter = true;
                }
                break;
            case 0: // all user type
                satisfiedUserTypeFilter = true;
                break;
            default:
                break;
        }

        // filter by group members (all, home or foreign)
        switch (filterMembers) {
            case FILTER_GROUP_MEMBERS_ALL:
                satisfiedGroupMembersFilter = true;
                break;
            case FILTER_HOME_MEMBERS:
                if (currentGroupProperties) {
                    if (currentGroupProperties.anid === invitedUser.invitedBy
                        && invitedUser.requestedToJoin === false
                    ) {
                        satisfiedGroupMembersFilter = true;
                    }
                } else {
                    satisfiedGroupMembersFilter = true;
                }
                break;
            case FILTER_PLATFORM_MEMBERS:
                if (currentGroupProperties) {
                    if (currentGroupProperties.anid === invitedUser.invitedBy
                        && invitedUser.requestedToJoin === true
                    ) {
                        satisfiedGroupMembersFilter = true;
                    }
                } else {
                    satisfiedGroupMembersFilter = true;
                }
                break;
            default:
                break;
        }

        // filter by a specific group
        if (filterGroup !== "null") {
            if (invitedUser.invitedBy === filterGroup) {
                satisfiedGroupFilter = true;
            }
        }
        // all groups
        else {
            satisfiedGroupFilter = true;
        }

        if (satisfiedRegistrationStatusFilter
            && satisfiedUserTypeFilter
            && satisfiedGroupMembersFilter
            && satisfiedGroupFilter
        ) {
            matchedInvitedUsers.push(invitedUser);
        }
    });

    if (searchText !== null) {
        matchedInvitedUsers = matchedInvitedUsers.filter(
            invitedUser => invitedUser.email.toLowerCase().includes(searchText.trim().toLowerCase())
        );
    }

    return matchedInvitedUsers;
}

export const INVITED_USERS_CHANGE_PAGE = 'INVITED_USERS_CHANGE_PAGE';
export const handleChangeTablePage = (event, newPage) => {
    return {
        type: INVITED_USERS_CHANGE_PAGE,
        newPage
    }
};

export const INVITED_USERS_CHANGE_ROWS_PER_PAGE = 'INVITED_USERS_CHANGE_ROWS_PER_PAGE';
export const handleChangeTableRowsPerPage = event => {
    return {
        type: INVITED_USERS_CHANGE_ROWS_PER_PAGE,
        rows: event.target.value
    }
};

export const resendInvite = invitedUser => {
    return (dispatch, getState) => {
        const clubAttributes = getState().manageClubAttributes.clubAttributes;
        const groupUserName = getState().manageGroupFromParams.groupUserName;
        const groupProperties = getState().manageGroupFromParams.groupProperties;
        const currentGroupAdmin = getState().auth.user;

        emailUtils
            .sendEmail({
                serverURL: clubAttributes.serverURL,
                emailType: emailUtils.EMAIL_INVITATION,
                data: {
                    groupName: groupProperties.displayName,
                    groupLogo: utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, groupProperties),
                    groupWebsite: groupProperties.website,
                    groupContactUs: `${clubAttributes.websiteURL}/groups/${groupProperties.groupUserName}/contact-us`,
                    sender: currentGroupAdmin.email,
                    receiver: invitedUser.email,
                    receiverName: `${invitedUser.title} ${invitedUser.firstName} ${invitedUser.lastName}`,
                    userType:
                        invitedUser.type === DB_CONST.TYPE_ISSUER
                            ?
                            "Issuer"
                            :
                            "Investor"
                    ,
                    signupURL:
                        groupUserName
                            ?
                            `${clubAttributes.websiteURL}/groups/${groupUserName}/signup/${invitedUser.id}`
                            :
                            `${clubAttributes.websiteURL}/signup/${invitedUser.id}`
                }
            })
            .then(() => {
                // track activity
                realtimeDBUtils
                    .trackActivity({
                        userID: currentGroupAdmin.id,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.INVITED_USERS_CHILD,
                        interactedObjectID: invitedUser.id,
                        activitySummary:
                            realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_RESENT_A_USER_INVITATION
                                .replace("%userName%", `${invitedUser.firstName} ${invitedUser.lastName}`)
                                .replace("%group%", groupProperties.displayName)
                                .replace("%userType%", invitedUser.type === DB_CONST.TYPE_ISSUER ? "Issuer" : "Investor")
                        ,
                        action: ROUTES.USER_PROFILE_INVEST_WEST_SUPER
                            .replace(":userID", invitedUser.id)
                        ,
                        value: {
                            ...invitedUser,
                            Invitor: null
                        }
                    });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Invitation resent.",
                    color: "primary",
                    position: "bottom"
                });
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
}

export const INVITED_USERS_ADDING_MEMBERS_FROM_ONE_GROUP_TO_ANOTHER_GROUP_STATE_CHANGED = "INVITED_USERS_ADDING_MEMBERS_FROM_ONE_GROUP_TO_ANOTHER_GROUP_STATE_CHANGED";
export const addMembersFromOneGroupToAnotherGroup = (fromGroup, toGroup) => {
    return async (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const addingMembersFromOneGroupToAnotherGroup = getState().invitedUsers.addingMembersFromOneGroupToAnotherGroup;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (addingMembersFromOneGroupToAnotherGroup) {
            return;
        }

        try {
            dispatch({
                type: INVITED_USERS_ADDING_MEMBERS_FROM_ONE_GROUP_TO_ANOTHER_GROUP_STATE_CHANGED,
                value: true
            });

            await new Api()
                .request(
                    "put",
                    ApiRoutes.addMembersToGroup.replace(":group", toGroup),
                    {
                        queryParameters: null,
                        requestBody: {
                            fromGroup,
                            addUserType: "all"
                        }
                    }
                );

            dispatch({
                type: INVITED_USERS_ADDING_MEMBERS_FROM_ONE_GROUP_TO_ANOTHER_GROUP_STATE_CHANGED,
                value: false
            });

            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: "Members added.",
                color: "primary",
                position: "bottom"
            });
        } catch (error) {
            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: error.toString(),
                color: "error",
                position: "bottom"
            });
        }
    }
}

export const INVITED_USERS_REQUESTING_CSV_STATE_CHANGED = "INVITED_USERS_REQUESTING_CSV_STATE_CHANGED";
export const exportToCsv = () => {
    return async (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const requestingCsv = getState().invitedUsers.requestingCsv;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (requestingCsv) {
            return;
        }

        try {
            dispatch({
                type: INVITED_USERS_REQUESTING_CSV_STATE_CHANGED,
                value: true
            });

            let response = await new Api().request("get", ApiRoutes.exportUsersCsvRoute);

            // create a file from the csv returned by the server
            const blob = new Blob([response.data], {type: "text/csv;charset=utf-8;"});
            const link = document.createElement("a");
            if (link.download !== undefined) {
                // create a download url
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "data.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            dispatch({
                type: INVITED_USERS_REQUESTING_CSV_STATE_CHANGED,
                value: false
            });
        } catch (error) {
            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: error.toString(),
                color: "error",
                position: "bottom"
            });

            dispatch({
                type: INVITED_USERS_REQUESTING_CSV_STATE_CHANGED,
                value: false
            });
        }
    }
};

// Listeners -----------------------------------------------------------------------------------------------------------

let invitedUsersListener = null;

export const INVITED_USERS_CHANGED = "INVITED_USERS_CHANGED";

export const startListeningForInvitedUsersChanged = () => {
    return (dispatch, getState) => {
        if (!invitedUsersListener) {
            const admin = getState().auth.user;

            invitedUsersListener = firebase
                .database()
                .ref(DB_CONST.INVITED_USERS_CHILD);

            invitedUsersListener
                .on("child_added", async (snapshot) => {
                        let invitedUser = snapshot.val();

                        let shouldAddInvitedUser = false;

                        if (admin.superAdmin) {
                            shouldAddInvitedUser = true;
                        } else {
                            if (invitedUser.invitedBy === admin.anid) {
                                shouldAddInvitedUser = true;
                            }
                        }

                        if (!shouldAddInvitedUser) {
                            return;
                        }

                        let invitedUsers = [...getState().invitedUsers.invitedUsers];
                        let invitedUserIndex = invitedUsers.findIndex(existingInvitedUser => existingInvitedUser.id === invitedUser.id);
                        if (invitedUserIndex === -1) {
                            const {
                                invitedUserSearchText,
                                invitedUsersInSearchMode,
                                filterRegistrationStatus,
                                filterUserType,
                                filterMembers,
                                filterGroup
                            } = getState().invitedUsers;

                            const currentGroupProperties = getState().manageGroupFromParams.groupProperties;

                            const group = await realtimeDBUtils.loadAngelNetworkBasedOnANID(invitedUser.invitedBy)

                            invitedUser.Invitor = {
                                anid: group.anid,
                                displayName: group.displayName,
                                logo: group.logo
                            };

                            if (invitedUser.hasOwnProperty("officialUserID")) {
                                invitedUser.officialUser = await getUserBasedOnID(invitedUser.officialUserID);
                            }

                            let matchedInvitedUsers = getUpdatedInvitedUsers({
                                sourceInvitedUsers: [...invitedUsers, invitedUser],
                                searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                                filterRegistrationStatus,
                                filterUserType,
                                filterMembers,
                                filterGroup,
                                currentGroupProperties
                            });

                            return dispatch({
                                type: INVITED_USERS_CHANGED,
                                invitedUsers: [...getState().invitedUsers.invitedUsers, invitedUser],
                                matchedInvitedUsers
                            });
                        }
                    }
                );

            invitedUsersListener
                .on("child_changed", async (snapshot) => {
                    let invitedUser = snapshot.val();

                    let shouldChangeInvitedUser = false;

                    if (admin.superAdmin) {
                        shouldChangeInvitedUser = true;
                    } else {
                        if (invitedUser.invitedBy === admin.anid) {
                            shouldChangeInvitedUser = true;
                        }
                    }

                    if (!shouldChangeInvitedUser) {
                        return;
                    }

                    let invitedUsers = [...getState().invitedUsers.invitedUsers];
                    let invitedUserIndex = invitedUsers.findIndex(
                        existingInvitedUser => existingInvitedUser.id === invitedUser.id
                    );
                    if (invitedUserIndex !== -1) {
                        invitedUser.Invitor = invitedUsers[invitedUserIndex].Invitor;
                        invitedUser.officialUser = invitedUsers[invitedUserIndex].officialUser;
                        invitedUsers[invitedUserIndex] = invitedUser;
                        const {
                            invitedUserSearchText,
                            invitedUsersInSearchMode,
                            filterRegistrationStatus,
                            filterUserType,
                            filterMembers,
                            filterGroup
                        } = getState().invitedUsers;

                        const currentGroupProperties = getState().manageGroupFromParams.groupProperties;

                        let matchedInvitedUsers = getUpdatedInvitedUsers({
                            sourceInvitedUsers: [...invitedUsers],
                            searchText: invitedUsersInSearchMode ? invitedUserSearchText : null,
                            filterRegistrationStatus,
                            filterUserType,
                            filterMembers,
                            filterGroup,
                            currentGroupProperties
                        });

                        return dispatch({
                            type: INVITED_USERS_CHANGED,
                            invitedUsers: [...invitedUsers],
                            matchedInvitedUsers
                        });
                    }
                });
        }
    }
};

export const stopListeningForInvitedUsersChanged = () => {
    return (dispatch, getState) => {
        if (invitedUsersListener) {
            invitedUsersListener.off('child_added');
            invitedUsersListener.off('child_changed');
            invitedUsersListener = null;
        }
    }
};