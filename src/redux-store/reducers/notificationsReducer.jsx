import * as notificationsActions from '../actions/notificationsActions';
import * as authActions from '../actions/authActions';

const initState = {
    notificationsAnchorEl: null,
    notificationBellRef: undefined,

    notifications: [],
    loadingNotifications: false,
    notificationsLoaded: false
};

const notificationsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case notificationsActions.TOGGLE_NOTIFICATIONS:
            return {
                ...state,
                notificationsAnchorEl: action.notificationsAnchorEl,
            };
        case notificationsActions.NOTIFICATIONBELL_REF:
            return {
                ...state,
                notificationBellRef: action.notificationBellRef
            };
        case notificationsActions.LOADING_NOTIFICATIONS:
            return {
                ...state,
                loadingNotifications: true,
                notificationsLoaded: false
            };
        case notificationsActions.FINISHED_LOADING_NOTIFICATIONS:
            return {
                ...state,
                loadingNotifications: false,
                notificationsLoaded: true,
                notifications: [...action.notifications]
            };
        case notificationsActions.NOTIFICATIONS_LIST_CHANGED:
            return {
                ...state,
                notifications: [...action.notifications]
            };
        default:
            return state;
    }
};

export default notificationsReducer;