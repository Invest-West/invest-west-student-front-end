import React, {Component} from 'react';
import FlexView from 'react-flexview';
import HashLoader from 'react-spinners/HashLoader';
import {Col, Container, Row} from 'react-bootstrap';
import Sidebar from 'react-sidebar';
import {css, StyleSheet} from 'aphrodite';
import {Badge, IconButton, Typography} from '@material-ui/core';
import Menu from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/Notifications';

import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import SidebarContent, {
    CHANGE_PASSWORD_TAB,
    EXPLORE_GROUPS_TAB,
    HOME_TAB,
    PROFILE_TAB,
    RESOURCES_TAB,
} from '../../shared-components/nav-bars/SidebarContent';
import {AUTH_SUCCESS} from '../signin/Signin';
import ProfileTab from '../../shared-components/profile/Profile';
import ChangePasswordPage from '../../shared-components/change-password/ChangePasswordPage';
import NotificationsBox from '../../shared-components/notifications/NotificationsBox';
import UploadingDialog from '../../shared-components/uploading-dialog/UploadingDialog';
import EditImageDialog from '../../shared-components/edit-image/EditImageDialog';
import UploadVideoDialog from '../../shared-components/edit-video/EditVideoDialog';

import queryString from 'query-string';

import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';

import {connect} from 'react-redux';
import * as dashboardSidebarActions from '../../redux-store/actions/dashboardSidebarActions';
import * as editUserActions from '../../redux-store/actions/editUserActions';
import * as notificationsActions from '../../redux-store/actions/notificationsActions';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';
import ExploreOffers from "../../shared-components/explore-offers/ExploreOffers";
import ExploreGroups from "../../shared-components/explore-groups/ExploreGroups";
import Resources from "../resources/Resources";

import {safeGetItem, safeRemoveItem} from "../../utils/browser";

const mapStateToProps = state => {
    return {
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        sidebarDocked: state.dashboardSidebar.sidebarDocked,
        sidebarOpen: state.dashboardSidebar.sidebarOpen,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        user: state.auth.user,
        userLoaded: state.auth.userLoaded,

        notifications: state.manageNotifications.notifications,
        notificationsAnchorEl: state.manageNotifications.notificationsAnchorEl,
        notificationBellRef: state.manageNotifications.notificationBellRef,

        editUserProfile_userEdited: state.editUser.userEdited
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        editUserProfile_setOriginalUserAndEditedUser: (user) => dispatch(editUserActions.setOriginalUserAndEditedUser(user)),

        // projectsTable_setUser: (user) => dispatch(projectsTableActions.setUser(user)),

        toggleNotifications: (event) => dispatch(notificationsActions.toggleNotifications(event)),
        notificationRefUpdated: (ref) => dispatch(notificationsActions.notificationRefUpdated(ref)),
    }
};

class InvestorDashboard extends Component {
    constructor(props) {
        super(props);

        this.notificationBell = React.createRef();
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork,

            notificationRefUpdated,

            history,
            match,
        } = this.props;

        const redirectTo = safeGetItem('redirectToAfterAuth');
        if (redirectTo) {
            safeRemoveItem('redirectToAfterAuth');
            history.push(redirectTo);
        }

        console.log('[InvestorDashboard] match.params:', match.params);
        console.log('[InvestorDashboard] match.path:', match.path);

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        // Determine expected path based on URL structure
        let expectedPath;
        if (match.params.hasOwnProperty('courseUserName')) {
            // Course-based route: /groups/:groupUserName/:courseUserName/dashboard/investor
            expectedPath = '/groups/:groupUserName/:courseUserName/dashboard/investor';
            console.log('[InvestorDashboard] Using course-based path');
        } else if (match.params.hasOwnProperty('groupUserName')) {
            // Group-based route: /groups/:groupUserName/dashboard/investor
            expectedPath = ROUTES.DASHBOARD_INVESTOR;
            console.log('[InvestorDashboard] Using group-based path');
        } else {
            // Super admin route
            expectedPath = ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER;
            console.log('[InvestorDashboard] Using super admin path');
        }
        console.log('[InvestorDashboard] expectedPath:', expectedPath, 'match.path:', match.path);
        setExpectedAndCurrentPathsForChecking(expectedPath, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            loadAngelNetwork,

            notificationRefUpdated
        } = this.props;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);
    }

    /**
     * Set required data for components used within this dashboard
     */
    setDataForComponents = () => {
        const {
            user,
            editUserProfile_userEdited,

            editUserProfile_setOriginalUserAndEditedUser,
            // projectsTable_setUser
        } = this.props;

        if (!user || (user && user.type !== DB_CONST.TYPE_INVESTOR)) {
            return;
        }

        if (!editUserProfile_userEdited) {
            // initialize a copied instance of the user for editing
            editUserProfile_setOriginalUserAndEditedUser(user);
        }

        // // set user so that information can be used in the projects table component
        // projectsTable_setUser(user);
    };

    /**
     * This function gets called to change the main content of the page based on the tab chosen in the sidebar.
     */
    renderPageContent = () => {

        const params = queryString.parse(this.props.location.search);

        /**
         * HOME TAB
         */
        if (params.tab === HOME_TAB) {
            return <ExploreOffers/>;
        }

        /**
         * PROFILE TAB
         */
        if (params.tab === PROFILE_TAB) {
            return (
                <ProfileTab/>
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
         * EXPLORE GROUPS TAB
         */
        if (params.tab === EXPLORE_GROUPS_TAB) {
            // return (
            //     <ExploreGroupsTab/>
            // );
            return <ExploreGroups/>;
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
    };

    render() {
        const {
            shouldLoadOtherData,
            groupProperties,
            groupPropertiesLoaded,

            sidebarDocked,
            sidebarOpen,

            authStatus,
            authenticating,
            user,
            userLoaded,

            notifications,
            notificationsAnchorEl,

            toggleSidebar,
            toggleNotifications
        } = this.props;

        if (!groupPropertiesLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader color={colors.primaryColor}/>
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (authenticating || !userLoaded) {
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

        if (authStatus !== AUTH_SUCCESS || !user || (user && user.type !== DB_CONST.TYPE_INVESTOR)) {
            return <PageNotFoundWhole/>;
        }

        return (
            <Sidebar
                sidebar={
                    <SidebarContent dashboardProps={this.props}/>
                }
                open={sidebarOpen}
                docked={sidebarDocked}
                onSetOpen={() => toggleSidebar(true)}
                transitions
                shadow={false}
                styles={{sidebar: {backgroundColor: colors.blue_gray_50}, content: {backgroundColor: colors.gray_50}}}>

                <Container fluid style={{padding: 0}}>
                    {/** Header */}
                    <Row noGutters>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <FlexView height={55} width="100%" vAlignContent="center"
                                style={{
                                    backgroundColor:
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                }}>
                                <Row noGutters style={{width: "100%"}}>
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
                                        <FlexView vAlignContent="center" hAlignContent="right" width="100%">
                                            <div ref={this.notificationBell}>
                                            <IconButton onClick={toggleNotifications}>
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

                    {
                        this.renderPageContent()
                    }

                    {/** Notifications box */}
                    {notificationsAnchorEl !== null &&
                        <NotificationsBox/>
                    }

                    {/** Uploading dialog */}
                    <UploadingDialog/>

                    {/** Edit image dialog */}
                    <EditImageDialog/>

                    {/** Upload video dialog */}
                    <UploadVideoDialog/>

                </Container>
            </Sidebar>
        );
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
            case PROFILE_TAB:
                title = PROFILE_TAB;
                break;
            // case MY_PLEDGES_TAB:
            //     title = MY_PLEDGES_TAB;
            //     break;
            // case FORUMS_TAB:
            //     title = FORUMS_TAB;
            //     break;
            case RESOURCES_TAB:
                title = RESOURCES_TAB;
                break;
            case CHANGE_PASSWORD_TAB:
                title = CHANGE_PASSWORD_TAB;
                break;
            case EXPLORE_GROUPS_TAB:
                title = EXPLORE_GROUPS_TAB;
                break;
            default:
                return;
        }

        return (
            <Typography variant="h6" className={css(styles.page_title)}>{title}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvestorDashboard);

const styles = StyleSheet.create({
    page_title: {
        fontSize: 19,
        marginLeft: 8,
        color: colors.white
    }
});