import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';

export const TOGGLE_NOTIFICATIONS = 'TOGGLE_NOTIFICATIONS';
export const CALLED_LAST = 'CALLED_LAST';
export const CALLED_BEFORE_LAST = 'CALLED_BEFORE_LAST';
export const toggleNotifications = (event) => {
    return (dispatch, getState) => {
        const notificationsAnchorEl = getState().manageNotifications.notificationsAnchorEl;
        const notificationBellRef = getState().manageNotifications.notificationBellRef;

        const openPanel = () => {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: notificationBellRef
            });
        }

        const closePanel = () => {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: null
            });
        }

        if (!notificationsAnchorEl) {
            openPanel();
        }
        else {
            closePanel();
        }
    }
};

export const NOTIFICATIONBELL_REF = 'NOTIFICATIONBELL_REF';
export const notificationRefUpdated = ref => {
    return (dispatch, getState) => {
        dispatch({
            type: NOTIFICATIONBELL_REF,
            notificationBellRef: ref
        });
    }
};

export const LOADING_NOTIFICATIONS = 'LOADING_NOTIFICATIONS';
export const FINISHED_LOADING_NOTIFICATIONS = 'FINISHED_LOADING_NOTIFICATIONS';
export const loadNotifications = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;

        if (!user) {
            return;
        }

        dispatch({
            type: LOADING_NOTIFICATIONS
        });

        realtimeDBUtils
            .loadNotifications(user.hasOwnProperty('anid') ? user.anid : user.id)
            .then(notifications => {
                dispatch({
                    type: FINISHED_LOADING_NOTIFICATIONS,
                    notifications
                });
            })
            .catch(error => {
                dispatch({
                    type: FINISHED_LOADING_NOTIFICATIONS,
                    notifications: []
                });
            });
    }
};

export const deleteANotification = notification => {
    return (dispatch, getState) => {
        firebase
            .database()
            .ref(DB_CONST.NOTIFICATIONS_CHILD)
            .child(notification.id)
            .remove()
            .then(() => {
                dispatch({
                    type: TOGGLE_NOTIFICATIONS,
                    notificationsAnchorEl: null
                });
            });
    }
};

export const deleteAllNotifications = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;

        if (!user) {
            return;
        }

        realtimeDBUtils
            .deleteAllNotifications(user.hasOwnProperty('anid') ? user.anid : user.id);
    }
};

// Listener ------------------------------------------------------------------------------------------------------------

let notificationsListener = null;

export const NOTIFICATIONS_LIST_CHANGED = 'NOTIFICATIONS_LIST_CHANGED';
export const startListeningForNotificationsChanged = () => {
    return (dispatch, getState) => {
        if (!notificationsListener) {

            const user = getState().auth.user;

            if (!user) {
                return;
            }

            notificationsListener = firebase
                .database()
                .ref(DB_CONST.NOTIFICATIONS_CHILD)
                .orderByChild('userID')
                .equalTo(user.hasOwnProperty('anid') ? user.anid : user.id);

            notificationsListener
                .on('child_added', snapshot => {
                    let notification = snapshot.val();

                    let notifications = [...getState().manageNotifications.notifications];
                    let notificationIndex = notifications.findIndex(existingNotification => existingNotification.id === notification.id);
                    if (notificationIndex === -1) {
                        dispatch({
                            type: NOTIFICATIONS_LIST_CHANGED,
                            notifications: [...notifications, notification]
                        });
                    }
                });

            notificationsListener
                .on('child_removed', snapshot => {
                    let notification = snapshot.val();

                    let notifications = [...getState().manageNotifications.notifications];
                    let notificationIndex = notifications.findIndex(existingNotification => existingNotification.id === notification.id);

                    if (notificationIndex !== -1) {
                        notifications.splice(notificationIndex, 1);
                        dispatch({
                            type: NOTIFICATIONS_LIST_CHANGED,
                            notifications
                        });
                    }
                });
        }
    }
};

export const stopListeningForNotificationsChanged = () => {
    return (dispatch, getState) => {
        if (notificationsListener) {
            notificationsListener.off('child_added');
            notificationsListener.off('child_removed');
            notificationsListener = null;
        }
    }
};