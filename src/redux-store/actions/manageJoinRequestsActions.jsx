import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';

export const MANAGE_JOIN_REQUESTS_LOADING_JOIN_REQUESTS = 'MANAGE_JOIN_REQUESTS_LOADING_JOIN_REQUESTS';
export const MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS = 'MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS';
export const loadJoinRequests = () => {
    return (dispatch, getState) => {

        const groupProperties = getState().manageGroupFromParams.groupProperties;

        if (!groupProperties) {
            return;
        }

        dispatch({
            type: MANAGE_JOIN_REQUESTS_LOADING_JOIN_REQUESTS
        });

        realtimeDBUtils
            .loadRequestsToJoin({anid: groupProperties.anid})
            .then(joinRequests => {
                dispatch({
                    type: MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS,
                    joinRequests
                });
            })
            .catch(error => {
                dispatch({
                    type: MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS,
                    joinRequests: [],
                    error
                });
            });
    }
};

export const MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE = 'MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return (dispatch, getState) => {
        const inSearchMode = getState().manageJoinRequests.inSearchMode;
        const searchText = getState().manageJoinRequests.searchText;
        const joinRequests = getState().manageJoinRequests.joinRequests;

        if (inSearchMode) {
            dispatch({
                type: MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE,
                enter: false,
                matchedJoinRequests: []
            });
        } else {
            let matchedJoinRequests = joinRequests.filter(joinRequest => joinRequest.userProfile.email.toLowerCase().includes(searchText.trim().toLowerCase()));
            dispatch({
                type: MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE,
                enter: true,
                matchedJoinRequests
            });
        }
    }
};

export const MANAGE_JOIN_REQUESTS_TABLE_PAGE_CHANGED = 'MANAGE_JOIN_REQUESTS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: MANAGE_JOIN_REQUESTS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const MANAGE_JOIN_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED = 'MANAGE_JOIN_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: MANAGE_JOIN_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const MANAGE_JOIN_REQUESTS_TABLE_INPUT_CHANGED = 'MANAGE_JOIN_REQUESTS_TABLE_INPUT_CHANGED';
export const handleJoinRequestsTableInputChanged = event => {
    return (dispatch, getState) => {
        const joinRequests = getState().manageJoinRequests.joinRequests;

        const searchText = event.target.value;
        let matchedJoinRequests = joinRequests.filter(
            joinRequest => joinRequest.userProfile.email.toLowerCase().includes(searchText.trim().toLowerCase())
        );

        dispatch({
            type: MANAGE_JOIN_REQUESTS_TABLE_INPUT_CHANGED,
            searchText,
            matchedJoinRequests
        });
    }
};

export const acceptJoinRequest = (request) => {
    return (dispatch, getState) => {
        // remove the join request
        firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
            .child(request.id)
            .remove()
            .then(() => {
                const pushKey = firebase.database().ref(DB_CONST.INVITED_USERS_CHILD).push().key;
                const currentDate = utils.getCurrentDate();
                // add a node in InvitedUsers
                firebase
                    .database()
                    .ref(DB_CONST.INVITED_USERS_CHILD)
                    .child(pushKey)
                    .set({
                        id: pushKey,
                        email: request.userProfile.email,
                        firstName: request.userProfile.firstName,
                        lastName: request.userProfile.lastName,
                        title: request.userProfile.title,
                        type: request.userProfile.type,
                        status: DB_CONST.INVITED_USER_STATUS_ACTIVE,
                        officialUserID: request.userID,
                        invitedBy: request.groupToJoin,
                        invitedDate: "none",
                        requestedToJoin: true,
                        requestedToJoinDate: currentDate,
                        joinedDate: currentDate
                    })
                    .then(() => {
                        realtimeDBUtils
                            .sendNotification({
                                title: `${request.group.displayName} has accepted your join request`,
                                message: `Congratulations. You are now a member of ${request.group.displayName}. You can see and interact with all offers from ${request.group.displayName}.`,
                                userID: request.userID,
                                action: `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Explore groups`
                            })
                            .then(() => {
                                // do something
                            })
                            .catch(error => {
                                // handle error
                            });
                    });
            });
    }
};

export const rejectJoinRequest = (request) => {
    return (dispatch, getState) => {
        // remove the join request
        firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
            .child(request.id)
            .remove()
            .then(() => {
                realtimeDBUtils
                    .sendNotification({
                        title: `${request.group.displayName} has rejected your join request`,
                        message: `We are so sorry that ${request.group.displayName} has rejected your join request. However, there are other groups that you can take part in.`,
                        userID: request.userID,
                        action: `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Explore groups`
                    })
                    .then(() => {
                        // do something
                    })
                    .catch(error => {
                        // handle error
                    });
            });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let joinRequestsListener = null;

export const MANAGE_JOIN_REQUESTS_CHANGED = 'MANAGE_JOIN_REQUESTS_CHANGED';
export const startListeningForJoinRequestsChanged = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;
        const groupProperties = getState().manageGroupFromParams.groupProperties;

        if (!user || !groupProperties) {
            return;
        }

        if (!joinRequestsListener) {
            joinRequestsListener = firebase
                .database()
                .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
                .orderByChild('groupToJoin')
                .equalTo(groupProperties.anid);

            joinRequestsListener
                .on('child_added', snapshot => {
                    let joinRequest = snapshot.val();

                    let joinRequests = [...getState().manageJoinRequests.joinRequests];
                    const index = joinRequests.findIndex(existingJoinRequest => existingJoinRequest.id === joinRequest.id);
                    if (index === -1) {
                        realtimeDBUtils
                            .getUserBasedOnID(joinRequest.userID)
                            .then(userProfile => {
                                joinRequest.userProfile = userProfile;

                                realtimeDBUtils
                                    .loadAngelNetworkBasedOnANID(joinRequest.groupToJoin)
                                    .then(angelNetwork => {
                                        joinRequest.group = angelNetwork;

                                        dispatch({
                                            type: MANAGE_JOIN_REQUESTS_CHANGED,
                                            joinRequests: [...joinRequests, joinRequest]
                                        });
                                    });
                            })
                    }
                });

            joinRequestsListener
                .on('child_removed', snapshot => {
                    let joinRequest = snapshot.val();

                    let joinRequests = [...getState().manageJoinRequests.joinRequests];
                    const index = joinRequests.findIndex(existingJoinRequest => existingJoinRequest.id === joinRequest.id);

                    if (index !== -1) {
                        joinRequests.splice(index, 1);
                        dispatch({
                            type: MANAGE_JOIN_REQUESTS_CHANGED,
                            joinRequests
                        });
                    }
                });
        }
    }
};

export const stopListeningForJoinRequestsChanged = () => {
    return (dispatch, getState) => {
        if (joinRequestsListener) {
            joinRequestsListener.off('child_added');
            joinRequestsListener.off('child_removed');
            joinRequestsListener = null;
        }
    }
};
