import React, {Component} from 'react';
import {css, StyleSheet} from 'aphrodite';
import Sidebar from 'react-sidebar';
import FlexView from 'react-flexview';
import {Col, Container, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {Accordion, AccordionDetails, AccordionSummary, Badge, Divider, IconButton, Typography} from '@material-ui/core';
import Menu from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HashLoader from 'react-spinners/HashLoader';
import queryString from 'query-string';

import firebase from '../../firebase/firebaseApp';

import SidebarContent, {
    CHANGE_PASSWORD_TAB,
    EXPLORE_GROUPS_TAB,
    EXPLORE_COURSES_TAB,
    EXPLORE_OFFERS_TAB,
    RESOURCES_TAB,
    GROUP_ACTIVITIES_TAB,
    HOME_TAB,
    MY_ACTIVITIES_TAB,
    SETTINGS_TAB
} from '../../shared-components/nav-bars/SidebarContent';
import {AUTH_SUCCESS} from '../signin/Signin';
import InvitationDialog from './components/InvitationDialog';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import SuperAdminSettings from './components/SuperAdminSettings';
import GroupAdminSettings from './components/GroupAdminSettings';
import InvitedUsers from './components/InvitedUsers';
import AngelNetWorks from './components/AngelNetworks';
import AddAngelNetWorkDialog from './components/AddAngelNetWorkDialog';
import NotificationsBox from '../../shared-components/notifications/NotificationsBox';
import ChangePasswordPage from '../../shared-components/change-password/ChangePasswordPage';
import JoinRequests from './components/JoinRequests';
import ActivitiesTable from '../../shared-components/activities-components/ActivitiesTable';
import GroupAdminsTable from './components/GroupAdminsTable';
import ManageAccessRequests from './ManageAccessRequests';

import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import { isAdmin } from '../../models/admin';

import {connect} from 'react-redux';
import * as dashboardSidebarActions from '../../redux-store/actions/dashboardSidebarActions';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';
import * as notificationsActions from '../../redux-store/actions/notificationsActions';
import * as activitiesTableActions from '../../redux-store/actions/activitiesTableActions';
import * as groupAdminsTableActions from '../../redux-store/actions/groupAdminsTableActions';
import ExploreOffers from "../../shared-components/explore-offers/ExploreOffers";
import OffersTable from "../../shared-components/offers-table/OffersTable";
import {successfullyFetchedOffers} from "../../shared-components/offers-table/OffersTableReducer";
import {isProjectWaitingToGoLive} from "../../models/project";
import ExploreGroups from "../../shared-components/explore-groups/ExploreGroups";
import Resources from "../resources/Resources";

import { safeGetItem, safeRemoveItem } from "../../utils/browser";

export const MAX_CARD_DETAILS_HEIGHT = 2000;

const mapStateToProps = state => {
    return {
        AuthenticationState: state.AuthenticationState,
        OffersTableLocalState: state.OffersTableLocalState,

        // --- old states ----------------------------------------------------------------------------------------------
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        sidebarDocked: state.dashboardSidebar.sidebarDocked,
        sidebarOpen: state.dashboardSidebar.sidebarOpen,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        currentUser: state.auth.user,
        currentUserLoaded: state.auth.userLoaded,

        notifications: state.manageNotifications.notifications,
        notificationsAnchorEl: state.manageNotifications.notificationsAnchorEl,
        notificationBellRef: state.manageNotifications.notificationBellRef,

        joinRequests: state.manageJoinRequests.joinRequests,
        joinRequestsLoaded: state.manageJoinRequests.joinRequestsLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        activitiesTable_setUser: (user) => dispatch(activitiesTableActions.setTableUser(user)),

        groupAdminsTable_setGroup: (group) => dispatch(groupAdminsTableActions.setGroup(group)),

        toggleNotifications: (event) => dispatch(notificationsActions.toggleNotifications(event)),
        notificationRefUpdated: (ref) => dispatch(notificationsActions.notificationRefUpdated(ref)),
        loadNotifications: () => dispatch(notificationsActions.loadNotifications()),
        startListeningForNotificationsChanged: () => dispatch(notificationsActions.startListeningForNotificationsChanged()),
        stopListeningForNotificationsChanged: () => dispatch(notificationsActions.stopListeningForNotificationsChanged()),
    }
};

class AdminDashboard extends Component {

    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database();
        this.notificationBell = React.createRef();
    }

    /**
     * Set required data for components used within this dashboard
     */
    setDataForComponents = () => {
        const {
            currentUser,
            groupProperties,

            // projectsTable_setUser,
            activitiesTable_setUser,
            groupAdminsTable_setGroup
        } = this.props;

        if (!currentUser
            || (currentUser && currentUser.type !== DB_CONST.TYPE_ADMIN)
        ) {
            return;
        }

        const currentAdmin = isAdmin(currentUser);

        // // set user so that information can be used in the projects table component
        // projectsTable_setUser(currentUser);

        // set user so that information can be used in the activities table component
        activitiesTable_setUser(
            currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                ?
                currentUser
                :
                groupProperties
        );

        // set group so that information can be used in the group admins table component
        groupAdminsTable_setGroup(groupProperties);
    };

    /**
     * Component will mount
     */
    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork,

            notificationRefUpdated,
            loadNotifications,
            startListeningForNotificationsChanged,

            history,
            match,
        } = this.props;

        const redirectTo = safeGetItem('redirectToAfterAuth');
        if (redirectTo) {
            safeRemoveItem('redirectToAfterAuth');
            history.push(redirectTo);
        }

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        // Determine expected route based on whether this is a course-based route
        const hasCourseParam = match.params.hasOwnProperty('courseUserName');
        const hasGroupParam = match.params.hasOwnProperty('groupUserName');

        let expectedPath;
        if (hasCourseParam && hasGroupParam) {
            // Course-based admin route: /groups/:groupUserName/:courseUserName/admin
            expectedPath = '/groups/:groupUserName/:courseUserName/admin';
        } else if (hasGroupParam) {
            // Group-based admin route: /groups/:groupUserName/admin
            expectedPath = ROUTES.ADMIN;
        } else {
            // Super admin route
            expectedPath = ROUTES.ADMIN_INVEST_WEST_SUPER;
        }

        setExpectedAndCurrentPathsForChecking(expectedPath, match.path);

        loadAngelNetwork()
        .catch(error => {
            console.error('Error loading angel network:', error);
        });

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);

        // Load notifications immediately on mount
        loadNotifications();
        startListeningForNotificationsChanged();
    }

    componentWillUnmount() {
        const {
            stopListeningForNotificationsChanged
        } = this.props;

        // Stop listening for notification changes when component unmounts
        stopListeningForNotificationsChanged();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            loadAngelNetwork,

            notificationRefUpdated
        } = this.props;

        loadAngelNetwork()
        .catch(error => {
            console.error('Error loading angel network:', error);
        });

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);
    };

    /**
     * Render page content
     */
    renderPageContent = () => {
        const {
            AuthenticationState,
            OffersTableLocalState,

            currentUser,

            joinRequests,
            joinRequestsLoaded
        } = this.props;

        const params = queryString.parse(this.props.location.search);
        const currentAdmin = isAdmin(currentUser);

        let projectsAwaitingDecision = 0;
        // only do this if the table user is also set to the current admin
        if (OffersTableLocalState.tableUser && OffersTableLocalState.tableUser.id === AuthenticationState.currentUser.id) {
            if (successfullyFetchedOffers(OffersTableLocalState)) {
                OffersTableLocalState.offerInstances.forEach(offerInstance => {
                    if (isProjectWaitingToGoLive(offerInstance.projectDetail)) {
                        projectsAwaitingDecision += 1;
                    }
                });
            }
        }

        /**
         * HOME TAB
         */
        if (params.tab === HOME_TAB) {
            return (
                <Row noGutters style={{marginBottom: 30}}>
                    {/* Manage universities - Super admins only */}
                    {
                        !(currentAdmin && currentAdmin.superAdmin)
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <Typography paragraph variant="h6" color="primary" align="left">Manage universities</Typography>
                                            <Typography paragraph variant="body1" align="left">Manage universities that have joined the system.</Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FlexView column width="100%">
                                            <AngelNetWorks/>
                                        </FlexView>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                    {/* Manage course members (course admins) / system users (super admins) */}
                    <Col xs={12} md={12} lg={12}>
                        <Accordion className={css(styles.card_style)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <FlexView column>
                                    <Typography paragraph variant="h6" color="primary" align="left">
                                        {
                                            currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                                                ?
                                                "Manage students"
                                                :
                                                "Manage university students"
                                        }
                                    </Typography>
                                    <Typography paragraph variant="body1" align="left">
                                        {
                                            currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                                                ?
                                                "Manage all the system students including those who have been invited but not yet registered."
                                                :
                                                "Manage all the university students including those who have been invited but not yet registered and those who joined this university from another university."
                                        }
                                    </Typography>
                                </FlexView>
                            </AccordionSummary>
                            <AccordionDetails className={css(styles.card_details_expansion)}>
                                <InvitedUsers/>
                            </AccordionDetails>
                        </Accordion>
                    </Col>

                    {/* Manage access requests */}
                    {
                        currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <FlexView width="100%">
                                                <Typography paragraph variant="h6" color="primary" align="left">Manage access requests</Typography>
                                                <FlexView marginLeft={28} marginTop={8}>
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="top-start" flip
                                                        overlay={
                                                            <Tooltip id={`tooltip-top`}>
                                                                {joinRequests.length} access requests
                                                                are awaiting your review.
                                                            </Tooltip>
                                                        }>
                                                        <Badge badgeContent={!joinRequestsLoaded ? 0 : joinRequests.length} color="error"
                                                            invisible={
                                                                !joinRequestsLoaded
                                                                    ?
                                                                    true
                                                                    :
                                                                    joinRequests.length === 0
                                                            }/>
                                                    </OverlayTrigger>
                                                </FlexView>
                                            </FlexView>
                                            <Typography paragraph variant="body1" align="left">
                                                Manage access requests from other universities' students who would like
                                                to
                                                join this university.
                                            </Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails className={css(styles.card_details_expansion)}>
                                        <JoinRequests/>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                    {/* Manage offers */}
                    <Col xs={12} md={12} lg={12}>
                        <Accordion className={css(styles.card_style)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <FlexView column>
                                    <FlexView width="100%">
                                        <Typography paragraph variant="h6" color="primary" align="left">Manage projects</Typography>
                                        <FlexView marginLeft={28} marginTop={8}>
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="top-start" flip
                                                overlay={
                                                    <Tooltip
                                                        id={`tooltip-top`}
                                                    >
                                                        {
                                                            currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                                                                ?
                                                                `${projectsAwaitingDecision} projects are awaiting university admins' review. Select "Awaiting review" from the "Phase" dropdown to see details.`
                                                                :
                                                                `${projectsAwaitingDecision} projects are awaiting your review. Select "Awaiting review" from the "Phase" dropdown to see details.`
                                                        }
                                                    </Tooltip>
                                                }>
                                                <Badge badgeContent={projectsAwaitingDecision} color="error"
                                                    invisible={projectsAwaitingDecision === 0}/>
                                            </OverlayTrigger>
                                        </FlexView>
                                    </FlexView>
                                    <Typography paragraph variant="body1" align="left">
                                        {
                                            currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                                                ?
                                                "Manage all the projects created by all the students and university students in the system."
                                                :
                                                "Manage all the projects created by the students and university students of this university."
                                        }
                                    </Typography>
                                </FlexView>
                            </AccordionSummary>
                            <AccordionDetails className={css(styles.card_details_expansion)}>
                                <FlexView column width="100%">
                                    <Divider style={{marginBottom: 15}}/>
                                    <OffersTable/>
                                </FlexView>
                            </AccordionDetails>
                        </Accordion>
                    </Col>

                    {/* Manage courses */}
                    {
                        currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <Typography paragraph variant="h6" color="primary" align="left">Manage courses</Typography>
                                            <Typography paragraph variant="body1" align="left">View your university and request new courses to be added by the super admin.</Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FlexView column width="100%">
                                            <AngelNetWorks/>
                                        </FlexView>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                    {/* Manage group admins */}
                    <Col xs={12} md={12} lg={12}>
                        <Accordion className={css(styles.card_style)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <FlexView column>
                                    <Typography paragraph variant="h6" color="primary" align="left">Manage university admins</Typography>
                                    <Typography paragraph variant="body1" align="left">Manage university admins. Only super university admin can add a new university
                                        admin.</Typography>
                                </FlexView>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FlexView column width="100%">
                                    <GroupAdminsTable/>
                                </FlexView>
                            </AccordionDetails>
                        </Accordion>
                    </Col>

                    {/* Manage admin access requests - Super admins only */}
                    {
                        currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                            ?
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <Typography paragraph variant="h6" color="primary" align="left">Admin Access Requests</Typography>
                                            <Typography paragraph variant="body1" align="left">
                                                Review and action requests from group admins to add new admins to their courses.
                                            </Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails className={css(styles.card_details_expansion)}>
                                        <FlexView column width="100%">
                                            <ManageAccessRequests currentUser={currentUser}/>
                                        </FlexView>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                            :
                            null
                    }

                </Row>
            )
        }

        /**
         * SETTINGS TAB
         */
        if (params.tab === SETTINGS_TAB) {
            return (
                currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                    ?
                    <SuperAdminSettings/>
                    :
                    <GroupAdminSettings/>
            );
        }

        /**
         * CHANGE PASSWORD TAB
         */
        if (params.tab === CHANGE_PASSWORD_TAB) {
            return (
                <ChangePasswordPage/>
            );
        }

        /**
         * FORUMS TAB
         */
        // if (params.tab === FORUMS_TAB) {
        //     return (
        //         <Forums/>
        //     );
        // }

        /**
         * RESOURCES TAB
         */
        if (params.tab === RESOURCES_TAB) {
            return (
                <Resources/>
            );
        }

        /**
         * GROUP ACTIVITIES TAB
         */
        if (params.tab === GROUP_ACTIVITIES_TAB || params.tab === MY_ACTIVITIES_TAB) {
            return (
                <div
                    style={{
                        margin: 30
                    }}
                >
                    <ActivitiesTable/>
                </div>
            );
        }

        /**
         * EXPLORE OFFERS TAB
         */
        if (params.tab === EXPLORE_OFFERS_TAB) {
            return <ExploreOffers/>;
        }

        /**
         * EXPLORE GROUPS TAB (for super admins - shows all universities)
         */
        if (params.tab === EXPLORE_GROUPS_TAB) {
            return <ExploreGroups/>;
        }

        /**
         * EXPLORE COURSES TAB (for non-super admins - shows only their university's courses)
         */
        if (params.tab === EXPLORE_COURSES_TAB) {
            return <ExploreGroups coursesOnlyMode={true} />;
        }
    };

    render() {
        const {
            shouldLoadOtherData,
            groupPropertiesLoaded,
            groupProperties,

            sidebarDocked,
            sidebarOpen,

            authStatus,
            authenticating,
            currentUser,
            currentUserLoaded,

            notifications,
            notificationsAnchorEl,

            toggleSidebar,
            toggleNotifications
        } = this.props;

        const currentAdmin = isAdmin(currentUser);

        if (!groupPropertiesLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader color={colors.primaryColor}/>
                </FlexView>
            )
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (authenticating || !currentUserLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader
                        color={
                            !groupProperties
                                ?
                                colors.primaryColor
                                :
                                groupProperties.settings.primaryColor
                        }
                    />
                </FlexView>
            );
        }

        if (authStatus !== AUTH_SUCCESS
            || !currentUser
            || (currentUser && currentUser.type !== DB_CONST.TYPE_ADMIN)
        ) {
            return <PageNotFoundWhole/>;
        }

        return <Sidebar
            sidebar={
                <SidebarContent
                    dashboardProps={this.props}
                />
            }
            shadow={false}
            open={sidebarOpen}
            docked={sidebarDocked}
            onSetOpen={() => toggleSidebar(true)}
            transitions
            styles={{
                sidebar: {backgroundColor: colors.blue_gray_50},
                content: {backgroundColor: colors.gray_100}
            }}
        >
            <Container
                fluid
                style={{ padding: 0}}>
                {/** Header */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView height={55} width="100%" vAlignContent="center"
                         style={{backgroundColor:
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                            }}>
                            <Row style={{width: "100%"}} noGutters>
                                {/** Page title */}
                                <Col xs={10} sm={10} md={11} lg={11}>
                                    <FlexView vAlignContent="center" width="100%">
                                        {
                                            <IconButton className={css(sharedStyles.hamburger_button)} onClick={() => toggleSidebar(true)}>
                                                <Menu/>
                                            </IconButton>
                                        }
                                        {
                                            this.renderPageTitle()
                                        }
                                    </FlexView>
                                </Col>

                                {/** Notification icon */}
                                <Col xs={2} sm={2} md={1} lg={1} style={{paddingRight: 13}}>
                                    <FlexView vAlignContent="center" hAlignContent="right" width="100%" >
                                        <div ref={this.notificationBell}>
                                        <IconButton onMouseDown={ (e) => {toggleNotifications(e)} } id="notification-button">
                                            <Badge badgeContent={notifications.length} color="secondary" invisible={notifications.length === 0}>
                                                <NotificationsIcon className={css(sharedStyles.white_text)}/>
                                            </Badge>
                                        </IconButton>
                                        </div>
                                    </FlexView>
                                </Col>
                            </Row>
                        </FlexView>
                    </Col>
                </Row>

                <Row noGutters style={{backgroundColor: colors.white}}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="body1" align="center" style={{paddingTop: 16,paddingBottom: 16}}>
                            {
                                currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin)
                                    ?
                                    "System admin"
                                    :
                                    "University admin"
                            }
                            : <b>{currentUser.email}</b>
                        </Typography>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{backgroundColor: colors.kick_starter_gray_box_border}}/>
                    </Col>
                </Row>

                {
                    this.renderPageContent()
                }
            </Container>

            {/** Notifications box */}
            {notificationsAnchorEl !== null &&
                <NotificationsBox/>
            }

            {/** User invitation dialog */}
            <InvitationDialog/>

            {/** Add angel network dialog */}
            <AddAngelNetWorkDialog/>
        </Sidebar>;
    }

    /**
     * Render page's title
     *
     * @returns {*}
     */
    renderPageTitle = () => {
        const params = queryString.parse(this.props.location.search);

        let title = '';

        switch (params.tab) {
            case HOME_TAB:
                title = HOME_TAB;
                break;
            case SETTINGS_TAB:
                title = SETTINGS_TAB;
                break;
            case CHANGE_PASSWORD_TAB:
                title = CHANGE_PASSWORD_TAB;
                break;
            // case FORUMS_TAB:
            //     title = FORUMS_TAB;
            //     break;
            case RESOURCES_TAB:
                title = RESOURCES_TAB;
                break;
            case GROUP_ACTIVITIES_TAB:
                title = GROUP_ACTIVITIES_TAB;
                break;
            case EXPLORE_GROUPS_TAB:
                title = EXPLORE_GROUPS_TAB;
                break;
            case EXPLORE_COURSES_TAB:
                title = EXPLORE_COURSES_TAB;
                break;
            case EXPLORE_OFFERS_TAB:
                title = EXPLORE_OFFERS_TAB;
                break;
            default:
                return;
        }

        return (
            <Typography variant="h6" className={css(styles.page_title)}>
                {title}
            </Typography>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboard);

const styles = StyleSheet.create({
    page_title: {
        fontSize: 19,
        marginLeft: 8,
        color: colors.white
    },

    card_style: {
        marginTop: 25,
        marginLeft: 30,
        marginRight: 30
    },

    card_details_expansion: {
        maxHeight: MAX_CARD_DETAILS_HEIGHT,
        overflowY: "auto"
    }
});