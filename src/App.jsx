import React, { useEffect, useRef, useCallback } from 'react';
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  responsiveFontSizes,
  adaptV4Theme,
} from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AppRouter from './router/router.tsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import { AUTH_SUCCESS } from './pages/signin/Signin';

import FeedbackSnackbar from './shared-components/feedback-snackbar/FeedbackSnackbar';

import { defaultTheme } from './values/defaultThemes';
import firebase from './firebase/firebaseApp';
import * as colors from './values/colors';
import * as authActions from './redux-store/actions/authActions';
import * as clubAttributesActions from './redux-store/actions/clubAttributesActions';
import * as mediaQueryActions from './redux-store/actions/mediaQueryActions';
import * as invitedUsersActions from './redux-store/actions/invitedUsersActions';
import * as manageJoinRequestsActions from './redux-store/actions/manageJoinRequestsActions';
import * as activitiesTableActions from './redux-store/actions/activitiesTableActions';
import * as groupAdminsTableActions from './redux-store/actions/groupAdminsTableActions';
import * as forumsActions from './redux-store/actions/forumsActions';
import * as editUserActions from './redux-store/actions/editUserActions';
import * as manageSystemGroupsActions from './redux-store/actions/manageSystemGroupsActions';
import * as manageGroupFromParamsActions from './redux-store/actions/manageGroupFromParamsActions';
import { signIn } from './redux-store/actions/authenticationActions';
import { getGroupRouteTheme } from './redux-store/reducers/manageGroupUrlReducer';
import IdleTimer from 'react-idle-timer';
import { activeTimeOut } from './redux-store/reducers/manageSystemIdleTimeReducer';
import { onIdle } from './redux-store/actions/manageSystemIdleTimeActions';
import { CacheMonitor } from './utils/CacheMonitor';
import { CacheManager } from './utils/CacheInvalidation';
import { useAppSelector, useAppDispatch } from './redux-store/hooks';

function App() {
  const dispatch = useAppDispatch();

  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const groupPropertiesLoaded = useAppSelector(
    (state) => state.manageGroupFromParams.groupPropertiesLoaded
  );
  const groupProperties = useAppSelector((state) => state.manageGroupFromParams.groupProperties);
  const shouldLoadOtherData = useAppSelector(
    (state) => state.manageGroupFromParams.shouldLoadOtherData
  );
  const user = useAppSelector((state) => state.auth.user);
  const userLoaded = useAppSelector((state) => state.auth.userLoaded);
  const authStatus = useAppSelector((state) => state.auth.authStatus);
  const forums = useAppSelector((state) => state.manageForums.forums);
  const clubAttributes = useAppSelector((state) => state.manageClubAttributes.clubAttributes);
  const clubAttributesLoaded = useAppSelector(
    (state) => state.manageClubAttributes.clubAttributesLoaded
  );
  const clubAttributesBeingLoaded = useAppSelector(
    (state) => state.manageClubAttributes.clubAttributesBeingLoaded
  );
  const systemGroups = useAppSelector((state) => state.manageSystemGroups.systemGroups);
  const groupsLoaded = useAppSelector((state) => state.manageSystemGroups.groupsLoaded);
  const loadingGroups = useAppSelector((state) => state.manageSystemGroups.loadingGroups);

  const authListenerRef = useRef(null);
  const firebaseAuthRef = useRef(firebase.auth());

  const cancelAllListeners = useCallback(() => {
    dispatch(authActions.stopListeningForUserProfileChanges());
    dispatch(authActions.stopListeningForGroupsUserIsIn());
    dispatch(manageJoinRequestsActions.stopListeningForJoinRequestsChanged());
    dispatch(invitedUsersActions.stopListeningForInvitedUsersChanged());
    dispatch(activitiesTableActions.stopListeningForActivitiesChanged());
    dispatch(groupAdminsTableActions.stopListeningForGroupAdminsChanged());
    dispatch(forumsActions.stopListeningForForumsChanged());
    dispatch(forumsActions.stopListeningForThreadsChanged());
    dispatch(forumsActions.stopListeningForThreadRepliesChanged());
    dispatch(editUserActions.stopOriginalUserChangedListener());
    dispatch(manageSystemGroupsActions.stopListeningForSystemGroupsChanged());
  }, [dispatch]);

  const loadClubAttributesIfNotLoaded = useCallback(() => {
    if (!clubAttributesLoaded && !clubAttributesBeingLoaded) {
      dispatch(clubAttributesActions.loadClubAttributes());
    }
  }, [clubAttributesLoaded, clubAttributesBeingLoaded, dispatch]);

  const loadSystemGroupsIfNeeded = useCallback(() => {
    if (!groupsLoaded && !loadingGroups) {
      dispatch(manageSystemGroupsActions.loadGroups());
    }
  }, [groupsLoaded, loadingGroups, dispatch]);

  const attachListeners = useCallback(() => {
    dispatch(manageGroupFromParamsActions.startListeningForAngelNetworkChanged());

    if (user && userLoaded && authStatus === AUTH_SUCCESS) {
      dispatch(authActions.startListeningForUserProfileChanges());
      dispatch(authActions.startListeningForGroupsUserIsIn());

      if (groupsLoaded) {
        dispatch(manageSystemGroupsActions.startListeningForSystemGroupsChanged());
      }
    }

    if (clubAttributesLoaded) {
      dispatch(clubAttributesActions.startListeningForClubAttributesChanged());
    }

    if (!authListenerRef.current) {
      authListenerRef.current = firebaseAuthRef.current.onAuthStateChanged((firebaseUser) => {
        dispatch(authActions.initializeAuthState());
        if (firebaseUser) {
          dispatch(authActions.getUserProfileAndValidateUser(firebaseUser.uid));
          loadSystemGroupsIfNeeded();
        } else {
          dispatch(authActions.getUserProfileAndValidateUser(null));
          cancelAllListeners();
        }
      });
    }
  }, [
    user,
    userLoaded,
    authStatus,
    clubAttributesLoaded,
    groupsLoaded,
    dispatch,
    cancelAllListeners,
    loadSystemGroupsIfNeeded,
  ]);

  // componentDidMount
  useEffect(() => {
    // Initialize cache monitoring
    if (process.env.NODE_ENV === 'development') {
      CacheMonitor.getInstance().startPeriodicReporting(5);
    }

    // Preload common data
    CacheManager.preload();

    // Add media query listeners
    dispatch(mediaQueryActions.addMediaQueryListeners());

    if (groupPropertiesLoaded && shouldLoadOtherData) {
      loadClubAttributesIfNotLoaded();
      attachListeners();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentDidUpdate: re-attach listeners when group properties load
  useEffect(() => {
    if (groupPropertiesLoaded && shouldLoadOtherData) {
      loadClubAttributesIfNotLoaded();
      attachListeners();
    }
  }, [groupPropertiesLoaded, shouldLoadOtherData, loadClubAttributesIfNotLoaded, attachListeners]);

  // componentWillUnmount
  useEffect(() => {
    return () => {
      // Cancel auth listener
      if (authListenerRef.current) {
        authListenerRef.current();
        authListenerRef.current = null;
      }
      // Remove media query listeners
      dispatch(mediaQueryActions.removeMediaQueryListeners());
      // Stop listening for angel network's changes
      dispatch(manageGroupFromParamsActions.stopListeningForAngelNetworkChanged());
      // Stop listening for club attributes' changes
      dispatch(clubAttributesActions.stopListeningForClubAttributesChanged());
      // Cancel all other listeners
      cancelAllListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getTheme = () => {
    if (ManageGroupUrlState.group) {
      return getGroupRouteTheme(ManageGroupUrlState);
    }

    if (!groupPropertiesLoaded || !shouldLoadOtherData || !groupProperties) {
      return defaultTheme;
    }

    return responsiveFontSizes(
      createTheme(
        adaptV4Theme({
          palette: {
            primary: {
              main: groupProperties.settings.primaryColor,
            },
            secondary: {
              main: groupProperties.settings.secondaryColor,
            },
            text: {
              secondary: colors.blue_gray_700,
            },
          },
          typography: {
            fontFamily: 'Muli, sans-serif',
          },
        })
      )
    );
  };

  return (
    <div>
      <IdleTimer timeout={activeTimeOut} onIdle={(event) => dispatch(onIdle(event))} />
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={getTheme()}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppRouter />

            {/** Feedback snackbar */}
            <FeedbackSnackbar />
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  );
}

export default App;
