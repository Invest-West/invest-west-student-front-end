import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOG_OUT } from '../actions/authActions';

interface NotificationsState {
  notificationsAnchorEl: any;
  notificationBellRef: any;
  notifications: any[];
  loadingNotifications: boolean;
  notificationsLoaded: boolean;
}

const initialState: NotificationsState = {
  notificationsAnchorEl: null,
  notificationBellRef: undefined,
  notifications: [],
  loadingNotifications: false,
  notificationsLoaded: false,
};

const notificationsSlice = createSlice({
  name: 'manageNotifications',
  initialState,
  reducers: {
    toggleNotifications(state, action: PayloadAction<{ notificationsAnchorEl: any }>) {
      state.notificationsAnchorEl = action.payload.notificationsAnchorEl;
    },
    setNotificationBellRef(state, action: PayloadAction<{ notificationBellRef: any }>) {
      state.notificationBellRef = action.payload.notificationBellRef;
    },
    setLoadingNotifications(state) {
      state.loadingNotifications = true;
      state.notificationsLoaded = false;
    },
    setNotificationsLoaded(state, action: PayloadAction<{ notifications: any[] }>) {
      state.loadingNotifications = false;
      state.notificationsLoaded = true;
      state.notifications = action.payload.notifications;
    },
    setNotificationsChanged(state, action: PayloadAction<{ notifications: any[] }>) {
      state.notifications = action.payload.notifications;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LOG_OUT, () => initialState);
  },
});

export const {
  toggleNotifications,
  setNotificationBellRef,
  setLoadingNotifications,
  setNotificationsLoaded,
  setNotificationsChanged,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
