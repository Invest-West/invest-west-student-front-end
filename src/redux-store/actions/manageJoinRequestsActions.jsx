/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Thunks and Firebase listeners remain here; sync actions use the slice.
 */
import {
  setLoadingJoinRequests,
  setJoinRequestsLoaded,
  toggleSearchMode as _toggleSearchMode,
  changePage as _changePage,
  changeRowsPerPage as _changeRowsPerPage,
  setSearchInput,
  setJoinRequestsChanged,
} from '../slices/joinRequestsSlice';

import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';

// Re-export action type strings for any consumers that match on them
export const MANAGE_JOIN_REQUESTS_LOADING_JOIN_REQUESTS = setLoadingJoinRequests.type;
export const MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS = setJoinRequestsLoaded.type;
export const MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE = _toggleSearchMode.type;
export const MANAGE_JOIN_REQUESTS_TABLE_PAGE_CHANGED = _changePage.type;
export const MANAGE_JOIN_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED = _changeRowsPerPage.type;
export const MANAGE_JOIN_REQUESTS_TABLE_INPUT_CHANGED = setSearchInput.type;
export const MANAGE_JOIN_REQUESTS_CHANGED = setJoinRequestsChanged.type;

export const loadJoinRequests = () => {
  return (dispatch, getState) => {
    const groupProperties = getState().manageGroupFromParams.groupProperties;

    if (!groupProperties) {
      return;
    }

    dispatch(setLoadingJoinRequests());

    realtimeDBUtils
      .loadRequestsToJoin({ anid: groupProperties.anid })
      .then((joinRequests) => {
        dispatch(setJoinRequestsLoaded({ joinRequests }));
      })
      .catch(() => {
        dispatch(setJoinRequestsLoaded({ joinRequests: [] }));
      });
  };
};

export const toggleSearchMode = () => {
  return (dispatch, getState) => {
    const inSearchMode = getState().manageJoinRequests.inSearchMode;
    const searchText = getState().manageJoinRequests.searchText;
    const joinRequests = getState().manageJoinRequests.joinRequests;

    if (inSearchMode) {
      dispatch(_toggleSearchMode({ enter: false, matchedJoinRequests: [] }));
    } else {
      const matchedJoinRequests = joinRequests.filter((joinRequest) =>
        joinRequest.userProfile.email.toLowerCase().includes(searchText.trim().toLowerCase())
      );
      dispatch(_toggleSearchMode({ enter: true, matchedJoinRequests }));
    }
  };
};

export const changePage = (event, newPage) => _changePage(newPage);

export const changeRowsPerPage = (event) => _changeRowsPerPage(parseInt(event.target.value, 10));

export const handleJoinRequestsTableInputChanged = (event) => {
  return (dispatch, getState) => {
    const joinRequests = getState().manageJoinRequests.joinRequests;

    const searchText = event.target.value;
    const matchedJoinRequests = joinRequests.filter((joinRequest) =>
      joinRequest.userProfile.email.toLowerCase().includes(searchText.trim().toLowerCase())
    );

    dispatch(setSearchInput({ searchText, matchedJoinRequests }));
  };
};

export const acceptJoinRequest = (request) => {
  return (dispatch, getState) => {
    firebase
      .database()
      .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
      .child(request.id)
      .remove()
      .then(() => {
        const pushKey = firebase.database().ref(DB_CONST.INVITED_USERS_CHILD).push().key;
        const currentDate = utils.getCurrentDate();
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
            invitedDate: 'none',
            requestedToJoin: true,
            requestedToJoinDate: currentDate,
            joinedDate: currentDate,
          })
          .then(() => {
            realtimeDBUtils
              .sendNotification({
                title: `${request.group.displayName} has accepted your join request`,
                message: `Congratulations. You are now a member of ${request.group.displayName}. You can see and interact with all projects from ${request.group.displayName}.`,
                userID: request.userID,
                action: `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Explore groups`,
              })
              .then(() => {})
              .catch(() => {});
          });
      });
  };
};

export const rejectJoinRequest = (request) => {
  return (dispatch, getState) => {
    firebase
      .database()
      .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
      .child(request.id)
      .remove()
      .then(() => {
        realtimeDBUtils
          .sendNotification({
            title: `${request.group.displayName} has rejected your join request`,
            message: `We are so sorry that ${request.group.displayName} has rejected your join request. However, there are other courses that you can take part in.`,
            userID: request.userID,
            action: `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Explore groups`,
          })
          .then(() => {})
          .catch(() => {});
      });
  };
};

// Listener ---------------------------------------------------------------
let joinRequestsListener = null;

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

      joinRequestsListener.on('child_added', (snapshot) => {
        const joinRequest = snapshot.val();

        const joinRequests = [...getState().manageJoinRequests.joinRequests];
        const index = joinRequests.findIndex(
          (existingJoinRequest) => existingJoinRequest.id === joinRequest.id
        );
        if (index === -1) {
          realtimeDBUtils.getUserBasedOnID(joinRequest.userID).then((userProfile) => {
            joinRequest.userProfile = userProfile;

            realtimeDBUtils
              .loadAngelNetworkBasedOnANID(joinRequest.groupToJoin)
              .then((angelNetwork) => {
                joinRequest.group = angelNetwork;

                dispatch(setJoinRequestsChanged({ joinRequests: [...joinRequests, joinRequest] }));
              });
          });
        }
      });

      joinRequestsListener.on('child_removed', (snapshot) => {
        const joinRequest = snapshot.val();

        const joinRequests = [...getState().manageJoinRequests.joinRequests];
        const index = joinRequests.findIndex(
          (existingJoinRequest) => existingJoinRequest.id === joinRequest.id
        );

        if (index !== -1) {
          joinRequests.splice(index, 1);
          dispatch(setJoinRequestsChanged({ joinRequests }));
        }
      });
    }
  };
};

export const stopListeningForJoinRequestsChanged = () => {
  return (dispatch, getState) => {
    if (joinRequestsListener) {
      joinRequestsListener.off('child_added');
      joinRequestsListener.off('child_removed');
      joinRequestsListener = null;
    }
  };
};
