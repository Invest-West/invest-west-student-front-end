/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Thunks and Firebase listeners remain here; sync actions use the slice.
 */
import {
  toggleNotifications as _toggleNotifications,
  setNotificationBellRef as _setNotificationBellRef,
  setLoadingNotifications,
  setNotificationsLoaded,
  setNotificationsChanged,
} from '../slices/notificationsSlice';

import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';

// Re-export action type strings for any consumers that match on them
export const TOGGLE_NOTIFICATIONS = _toggleNotifications.type;
export const NOTIFICATIONBELL_REF = _setNotificationBellRef.type;
export const LOADING_NOTIFICATIONS = setLoadingNotifications.type;
export const FINISHED_LOADING_NOTIFICATIONS = setNotificationsLoaded.type;
export const NOTIFICATIONS_LIST_CHANGED = setNotificationsChanged.type;

export const toggleNotifications = (event) => {
  return (dispatch, getState) => {
    const notificationsAnchorEl = getState().manageNotifications.notificationsAnchorEl;
    const notificationBellRef = getState().manageNotifications.notificationBellRef;

    if (!notificationsAnchorEl) {
      dispatch(_toggleNotifications({ notificationsAnchorEl: notificationBellRef }));
    } else {
      dispatch(_toggleNotifications({ notificationsAnchorEl: null }));
    }
  };
};

export const notificationRefUpdated = (ref) => {
  return (dispatch) => {
    dispatch(_setNotificationBellRef({ notificationBellRef: ref }));
  };
};

export const loadNotifications = () => {
  return (dispatch, getState) => {
    const user = getState().auth.user;

    if (!user) {
      return;
    }

    const userId = user.hasOwnProperty('anid') ? user.anid : user.id;

    dispatch(setLoadingNotifications());

    realtimeDBUtils
      .loadNotifications(userId)
      .then((notifications) => {
        dispatch(setNotificationsLoaded({ notifications }));
      })
      .catch(() => {
        dispatch(setNotificationsLoaded({ notifications: [] }));
      });
  };
};

export const deleteANotification = (notification) => {
  return () => {
    firebase
      .database()
      .ref(DB_CONST.NOTIFICATIONS_CHILD)
      .child(notification.id)
      .remove()
      .then(() => {})
      .catch(() => {});
  };
};

export const deleteAllNotifications = () => {
  return (dispatch, getState) => {
    const user = getState().auth.user;

    if (!user) {
      return;
    }

    const userId = user.hasOwnProperty('anid') ? user.anid : user.id;

    realtimeDBUtils
      .deleteAllNotifications(userId)
      .then(() => {})
      .catch(() => {});
  };
};

// Listener ---------------------------------------------------------------
let notificationsListener = null;

export const startListeningForNotificationsChanged = () => {
  return (dispatch, getState) => {
    if (!notificationsListener) {
      const user = getState().auth.user;

      if (!user) {
        return;
      }

      const userId = user.hasOwnProperty('anid') ? user.anid : user.id;

      notificationsListener = firebase
        .database()
        .ref(DB_CONST.NOTIFICATIONS_CHILD)
        .orderByChild('userID')
        .equalTo(userId);

      notificationsListener.on('child_added', (snapshot) => {
        const notification = snapshot.val();

        const notifications = [...getState().manageNotifications.notifications];
        const notificationIndex = notifications.findIndex(
          (existingNotification) => existingNotification.id === notification.id
        );

        if (notificationIndex === -1) {
          dispatch(setNotificationsChanged({ notifications: [...notifications, notification] }));
        }
      });

      notificationsListener.on('child_removed', (snapshot) => {
        const notification = snapshot.val();

        const notifications = [...getState().manageNotifications.notifications];
        const notificationIndex = notifications.findIndex(
          (existingNotification) => existingNotification.id === notification.id
        );

        if (notificationIndex !== -1) {
          notifications.splice(notificationIndex, 1);
          dispatch(setNotificationsChanged({ notifications }));
        }
      });
    }
  };
};

export const stopListeningForNotificationsChanged = () => {
  return () => {
    if (notificationsListener) {
      notificationsListener.off('child_added');
      notificationsListener.off('child_removed');
      notificationsListener = null;
    }
  };
};
