import React, {Component} from 'react';
import {createMuiTheme, MuiThemeProvider, responsiveFontSizes} from '@material-ui/core/styles';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import AppRouter from "./router/router.tsx";

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from './redux-store/actions/manageGroupFromParamsActions';

import 'bootstrap/dist/css/bootstrap.min.css';
import {AUTH_SUCCESS} from './pages/signin/Signin';

import FeedbackSnackbar from './shared-components/feedback-snackbar/FeedbackSnackbar';

import {defaultTheme} from './values/defaultThemes';
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
import {signIn} from "./redux-store/actions/authenticationActions";
import {getGroupRouteTheme} from "./redux-store/reducers/manageGroupUrlReducer";
import IdleTimer from "react-idle-timer";
import {activeTimeOut} from "./redux-store/reducers/manageSystemIdleTimeReducer";
import {onIdle} from "./redux-store/actions/manageSystemIdleTimeActions";
import {CacheMonitor} from "./utils/CacheMonitor";
import {CacheManager} from "./utils/CacheInvalidation";

// map redux states to props of this component
const mapStateToProps = state => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,

        /**
         * Old state --------------------------------------------------------------------------------------------------
         */
        // angel network loaded from anid from URL params
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,
        //--------------------------------------------------------------------------------------------------------------

        // user --------------------------------------------------------------------------------------------------------
        user: state.auth.user,
        userLoaded: state.auth.userLoaded,
        authStatus: state.auth.authStatus,
        //--------------------------------------------------------------------------------------------------------------

        forums: state.manageForums.forums,

        // club attributes ---------------------------------------------------------------------------------------------
        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,
        //--------------------------------------------------------------------------------------------------------------

        // system groups -----------------------------------------------------------------------------------------------
        systemGroups: state.manageSystemGroups.systemGroups,
        groupsLoaded: state.manageSystemGroups.groupsLoaded,
        loadingGroups: state.manageSystemGroups.loadingGroups
        //--------------------------------------------------------------------------------------------------------------
    }
};

// map redux dispatch (actions) to props of this component
const mapDispatchToProps = dispatch => {
    return {
        signIn: () => dispatch(signIn()),
        onIdle: (event) => dispatch(onIdle(event)),

        /**
         * Old dispatch ------------------------------------------------------------------------------------------------
         */
        startListeningForAngelNetworkChanged: () => dispatch(manageGroupFromParamsActions.startListeningForAngelNetworkChanged()),
        stopListeningForAngelNetworkChanged: () => dispatch(manageGroupFromParamsActions.stopListeningForAngelNetworkChanged()),

        // auth functions  ---------------------------------------------------------------------------------------------
        initializeAuthState: () => dispatch(authActions.initializeAuthState()),
        getUserProfileAndValidateUser: (uid) => dispatch(authActions.getUserProfileAndValidateUser(uid)),
        startListeningForUserProfileChanges: () => dispatch(authActions.startListeningForUserProfileChanges()),
        stopListeningForUserProfileChanges: () => dispatch(authActions.stopListeningForUserProfileChanges()),
        startListeningForGroupsUserIsIn: () => dispatch(authActions.startListeningForGroupsUserIsIn()),
        stopListeningForGroupsUserIsIn: () => dispatch(authActions.stopListeningForGroupsUserIsIn()),
        //--------------------------------------------------------------------------------------------------------------

        // club attributes functions  ----------------------------------------------------------------------------------
        loadClubAttributes: () => dispatch(clubAttributesActions.loadClubAttributes()),
        startListeningForClubAttributesChanged: () => dispatch(clubAttributesActions.startListeningForClubAttributesChanged()),
        stopListeningForClubAttributesChanged: () => dispatch(clubAttributesActions.stopListeningForClubAttributesChanged()),
        //--------------------------------------------------------------------------------------------------------------

        // media query functions  --------------------------------------------------------------------------------------
        addMediaQueryListeners: () => dispatch(mediaQueryActions.addMediaQueryListeners()),
        removeMediaQueryListeners: () => dispatch(mediaQueryActions.removeMediaQueryListeners()),
        //--------------------------------------------------------------------------------------------------------------

        adminDashboard_stopListeningForInvitedUsersChanged: () => dispatch(invitedUsersActions.stopListeningForInvitedUsersChanged()),

        joinRequestsTable_stopListeningForJoinRequestsChanged: () => dispatch(manageJoinRequestsActions.stopListeningForJoinRequestsChanged()),

        activitiesTable_stopListeningForActivitiesChanged: () => dispatch(activitiesTableActions.stopListeningForActivitiesChanged()),

        groupAdminsTable_stopListeningForGroupAdminsChanged: () => dispatch(groupAdminsTableActions.stopListeningForGroupAdminsChanged()),

        stopListeningForForumsChanged: () => dispatch(forumsActions.stopListeningForForumsChanged()),
        stopListeningForThreadsChanged: () => dispatch(forumsActions.stopListeningForThreadsChanged()),
        stopListeningForThreadRepliesChanged: () => dispatch(forumsActions.stopListeningForThreadRepliesChanged()),

        editUserProfile_stopOriginalUserChangedListener: () => dispatch(editUserActions.stopOriginalUserChangedListener()),

        loadSystemGroups: () => dispatch(manageSystemGroupsActions.loadGroups()),
        startListeningForSystemGroupsChanged: () => dispatch(manageSystemGroupsActions.startListeningForSystemGroupsChanged()),
        stopListeningForSystemGroupsChanged: () => dispatch(manageSystemGroupsActions.stopListeningForSystemGroupsChanged())
    }
};

class App extends Component {

    constructor(props) {
        super(props);

        this.firebaseAuth = firebase.auth();
        this.authListener = null;
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            addMediaQueryListeners
        } = this.props;

        // Initialize cache monitoring
        if (process.env.NODE_ENV === 'development') {
            CacheMonitor.getInstance().startPeriodicReporting(5); // Log every 5 minutes in dev
        }

        // Preload common data
        CacheManager.preload();

        // add media query listeners
        addMediaQueryListeners();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadClubAttributesIfNotLoaded();
            this.attachListeners();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData
        } = this.props;

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadClubAttributesIfNotLoaded();
            this.attachListeners();
        }
    }

    componentWillUnmount() {
        const {
            removeMediaQueryListeners,
            stopListeningForAngelNetworkChanged,
            stopListeningForClubAttributesChanged
        } = this.props;

        /**
         * These listeners are global for whole system.
         * Therefore, they should only be cancelled when the page is destroyed.
         */
        // cancel listening for auth state changed
        this.authListener();
        this.authListener = null;
        // remove media query listeners
        removeMediaQueryListeners();
        // stop listening for angel network's changes
        stopListeningForAngelNetworkChanged();
        // stop listening for club attributes' changes
        stopListeningForClubAttributesChanged();
        /**
         * ////---------------------------------------------------------------------------------------------------------
         */

        // cancel all other listeners when the page is destroyed
        this.cancelAllListeners();
    }

    /**
     * Cancel all listeners used in the components within the system
     */
    cancelAllListeners = () => {
        const {
            stopListeningForUserProfileChanges,

            stopListeningForGroupsUserIsIn,

            joinRequestsTable_stopListeningForJoinRequestsChanged,

            adminDashboard_stopListeningForInvitedUsersChanged,

            activitiesTable_stopListeningForActivitiesChanged,

            groupAdminsTable_stopListeningForGroupAdminsChanged,

            stopListeningForForumsChanged,
            stopListeningForThreadsChanged,
            stopListeningForThreadRepliesChanged,

            editUserProfile_stopOriginalUserChangedListener,

            stopListeningForSystemGroupsChanged
        } = this.props;
        // stop listening for user's profile changes
        stopListeningForUserProfileChanges();
        // stop listening for groups user is in changes
        stopListeningForGroupsUserIsIn();

        // stop listening for join requests changes in the JoinRequests table component
        joinRequestsTable_stopListeningForJoinRequestsChanged();

        // stop listening for invited users changes in the InvitedUsers component
        adminDashboard_stopListeningForInvitedUsersChanged();

        // stop listening for activities changes in the ActivitiesTable component
        activitiesTable_stopListeningForActivitiesChanged();

        // stop listening for group admins changes in the GroupAdminsTable component
        groupAdminsTable_stopListeningForGroupAdminsChanged();

        // stop listening for forums changes
        stopListeningForForumsChanged();
        // stop listening for threads changes
        stopListeningForThreadsChanged();
        // stop listening for thread replies changes
        stopListeningForThreadRepliesChanged();

        // stop listening for edited user's changes
        // this should get called if the current user and the user being edited are different
        editUserProfile_stopOriginalUserChangedListener();

        // stop listening for system groups changes
        stopListeningForSystemGroupsChanged();
    };

    /**
     * Load club attributes
     */
    loadClubAttributesIfNotLoaded = () => {
        const {
            clubAttributesLoaded,
            clubAttributesBeingLoaded,

            loadClubAttributes
        } = this.props;

        if (!clubAttributesLoaded && !clubAttributesBeingLoaded) {
            // load club attributes
            loadClubAttributes();
        }
    };

    /**
     * Load all the groups in the system
     * --> This should be done as soon as the user is logged in
     */
    loadSystemGroups = () => {
        const {
            groupsLoaded,
            loadingGroups,

            loadSystemGroups
        } = this.props;

        if (!groupsLoaded && !loadingGroups) {
            // load system groups
            loadSystemGroups();
        }
    }

    /**
     * Attach listeners
     */

    
    attachListeners = () => {
        const {
            authStatus,

            user,
            userLoaded,
            clubAttributesLoaded,
            groupsLoaded,

            initializeAuthState,
            getUserProfileAndValidateUser,
            startListeningForClubAttributesChanged,
            startListeningForUserProfileChanges,
            startListeningForAngelNetworkChanged,
            startListeningForGroupsUserIsIn,
            startListeningForSystemGroupsChanged
        } = this.props;

        startListeningForAngelNetworkChanged();

        if (user && userLoaded && authStatus === AUTH_SUCCESS) {
            // start listening for user's profile changes
            startListeningForUserProfileChanges();
            // start listening for groups user is in changes
            startListeningForGroupsUserIsIn();

            if (groupsLoaded) {
                // start listening for system groups changed
                startListeningForSystemGroupsChanged();
            }
        }

        if (clubAttributesLoaded) {
            // start listening for club attributes' changes
            startListeningForClubAttributesChanged();
        }

        if (!this.authListener) {
            // listen for auth state changed
            this.authListener = this.firebaseAuth
                .onAuthStateChanged(firebaseUser => {
                    // call this function to always set userLoaded to false when user is signed out
                    initializeAuthState();
                    // if user is authenticated
                    if (firebaseUser) {
                        getUserProfileAndValidateUser(firebaseUser.uid);

                        // load system groups
                        this.loadSystemGroups();
                    }
                    // user is not authenticated
                    else {
                        getUserProfileAndValidateUser(null);
                        // the listeners used in components within the system must be cancelled
                        // when the logged in user logs out
                        this.cancelAllListeners();
                    }
                });
        }
    };
    

    getTheme = () => {
        const {
            ManageGroupUrlState,

            groupPropertiesLoaded,
            groupProperties,
            shouldLoadOtherData
        } = this.props;

        if (ManageGroupUrlState.group) {
            return getGroupRouteTheme(ManageGroupUrlState);
        }

        if (!groupPropertiesLoaded || !shouldLoadOtherData || !groupProperties) {
            return defaultTheme;
        }

        return responsiveFontSizes(
            createMuiTheme({
                palette: {
                    primary: {
                        main: groupProperties.settings.primaryColor
                    },

                    secondary: {
                        main: groupProperties.settings.secondaryColor
                    },

                    text: {
                        secondary: colors.blue_gray_700,
                    }
                },
                typography: {
                    fontFamily: "Muli, sans-serif"
                }
            })
        );
    }

    render() {
        return (
            <div>
                <IdleTimer
                    timeout={activeTimeOut}
                    onIdle={this.props.onIdle}
                />

                <MuiThemeProvider
                    theme={this.getTheme()}
                >
                    <MuiPickersUtilsProvider
                        utils={DateFnsUtils}
                    >
                        <AppRouter/>

                        {/** Feedback snackbar */}
                        <FeedbackSnackbar/>
                    </MuiPickersUtilsProvider>
                </MuiThemeProvider>
            </div>
        );
    }
}

// export the App component using redux connect to hook up states and actions
export default connect(mapStateToProps, mapDispatchToProps)(App);
