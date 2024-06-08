import React, {Component} from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Paper,
    Tab,
    Tabs,
    Typography
} from '@material-ui/core';
import PublicIcon from '@material-ui/icons/Public';
import RestrictedIcon from '@material-ui/icons/VpnLock';
import PrivateIcon from '@material-ui/icons/LockOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import {Col, Container, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import HashLoader from 'react-spinners/HashLoader';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';

import './SystemPublicPagesSharedCSS.scss';

import * as ROUTES from '../../router/routes';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as colors from '../../values/colors';
import {AUTH_SUCCESS} from '../signin/Signin';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        user: state.auth.user,
        userLoaded: state.auth.userLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork())
    }
};

class HelpPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            helpType: DB_CONST.TYPE_INVESTOR,
            autoSwitching: true,
            expandedPanel: false
        }
    }

    componentDidMount() {
        const {
            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,

            loadAngelNetwork
        } = this.props;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.HELP : ROUTES.HELP_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        this.autoSwitchToAppropriateHelpTab();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,
            loadAngelNetwork
        } = this.props;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.autoSwitchToAppropriateHelpTab();
        }
    }

    /**
     * Switch to the appropriate Help tab based on user's type
     */
    autoSwitchToAppropriateHelpTab = () => {
        const {
            user
        } = this.props;

        const {
            helpType,
            autoSwitching
        } = this.state;

        if (!user) {
            return;
        }

        if (user.type !== DB_CONST.TYPE_ADMIN) {
            // when the user just opened this Help page
            // detect if the type of the user to automatically switch the Help tab
            // this should only happen once
            if (user.type !== helpType) {
                if (autoSwitching) {
                    this.setState({
                        helpType: user.type,
                        autoSwitching: false
                    });
                }
            } else {
                if (autoSwitching) {
                    this.setState({
                        autoSwitching: false
                    });
                }
            }
        }
    };

    /**
     * Handle tab changed
     *
     * @param event
     * @param newValue
     */
    handleTabChanged = (event, newValue) => {
        this.setState({
            helpType: newValue,
            expandedPanel: false
        });
    };

    /**
     * Handle panel changed
     *
     * @param panel
     * @returns {function(...[*]=)}
     */
    handleExpandPanel = panel => (event, isExpanded) => {
        this.setState({
            expandedPanel: isExpanded ? panel : false
        });
    };

    render() {

        const {
            helpType
        } = this.state;

        const {
            groupProperties,
            shouldLoadOtherData,
            groupPropertiesLoaded,

            authStatus,
            authenticating,
            user,
            userLoaded
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

        if (authStatus !== AUTH_SUCCESS
            || !user
        ) {
            return <PageNotFoundWhole/>;
        }

        return (
            <Container fluid style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 50}}>
                <Row noGutters style={{marginTop: 40, marginBottom: 60}}>
                    <Col xs={12} sm={12} md={{span: 6, offset: 3}} lg={{span: 4, offset: 4}}>
                        <FlexView width="100%" hAlignContent="center" marginBottom={20}>
                            <ContactSupportIcon
                                style={{
                                    fontSize: "7em",
                                    color:
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                }}
                            />
                        </FlexView>
                        <Typography variant="h4" align="center" color="primary">
                            How can we help you?
                        </Typography>
                        {
                            user.type === DB_CONST.TYPE_ADMIN
                                ?
                                null
                                :
                                <FlexView width="100%" hAlignContent="center" marginTop={40}>
                                    <Paper elevation={2} style={{width: "100%"}}>
                                        <Tabs indicatorColor="primary" textColor="primary" variant="fullWidth" value={helpType} onChange={this.handleTabChanged}>
                                            <Tab value={DB_CONST.TYPE_INVESTOR} label="Investor" className={css(sharedStyles.no_text_transform)}/>
                                            <Tab value={DB_CONST.TYPE_ISSUER} label="Issuer" className={css(sharedStyles.no_text_transform)}/>
                                        </Tabs>
                                    </Paper>
                                </FlexView>
                        }
                    </Col>
                </Row>

                {
                    user.type === DB_CONST.TYPE_ADMIN
                        ?
                        this.renderGroupAdminHelp()
                        :
                        helpType === DB_CONST.TYPE_INVESTOR
                            ?
                            this.renderInvestorHelp()
                            :
                            this.renderIssuerHelp()
                }
            </Container>
        );
    }

    /**
     * Render group admin help
     */
    renderGroupAdminHelp = () => {
        const {
            expandedPanel
        } = this.state;
        /** Group admin guide  */
        return (
            <Container>
            <Row noGutters style={{marginBottom: 50}}>
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                    {/** 1. Navigating Invest West */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_navigating_invest_west'} onChange={this.handleExpandPanel('group_admin_help_navigating_invest_west')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    1. Navigating Invest West
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>
                                    Welcome to Invest West, we are excited to work with you. Here is a basic
                                    tutorial showing the key functions of the site.
                                </Typography>

                                {/** My dashboard */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.1. My dashboard</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Once you have logged in you can view your dashboard by clicking the “My dashboard” button at the top right of the page. This will take you to your unique dashboard where you can access all the site’s functions.</Typography>
                                    <img alt="group_admin_help_my_dashboard" src={require("../../img/group_admin_help_my_dashboard.png").default} className={css(styles.image_style)}
                                    />
                                </FlexView>

                                {/** Navigation bar */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.2. Navigation bar</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Once logged on you can navigate the site using the navigation bar. The navigation bar is always on the left side and can be hidden by pressing the three consecutive white lines. On the navigation bar there are nine main buttons; home, settings, change password, audit log, explore offers, explore groups, forums, help and logout</Typography>
                                    <img alt="investor_help_navigation_bar" src={require("../../img/group_admin_help_navigation_bar.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Notifications */}
                                <FlexView
                                    column
                                >
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.3. Notifications</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">The bell Icon will notify you of any updates or changes to your group. This can be accessed at the top right of the dashboard.</Typography>
                                    <img alt="group_admin_help_notifications" src={require("../../img/group_admin_help_notifications.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Home page */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.4. Home page</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">The home page will display all the group management functions, from this page you can manage group members, manage access requests to your group, manage the group’s offers and manage group admins.</Typography>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 2. Manage group users */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_user_management'} onChange={this.handleExpandPanel('group_admin_help_user_management')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    2. User management
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">The manage group members tab is used to manage exiting members, invite new users and view details of the group’s users. To access this function, click on the ‘manage group members’ tab from the home page. From this section you can view all user's names, emails, user types, the date invited/requested to join, registration status and the date they registered.</Typography>
                                <img alt="group_admin_help_user_management" src={require("../../img/group_admin_help_user_management.png").default} className={css(styles.image_style)}/>

                                {/** Inviting a new user */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.1. Inviting a new user</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">From the manage group members tab you can invite a new user. You will need the users title, first name, last name, email and user type. To invite a new user, click on the ‘Invite new user’ button.</Typography>
                                    <img alt="group_admin_help_inviting_a_new_user_01" src={require("../../img/group_admin_help_inviting_a_new_user_01.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left" component="legend">After clicking the button, enter the user’s details and select Issuer or Investor. An Issuer is a business owner or entrepreneur who will create their own offer. An Investor is someone who is looking to invest in offers and will view offers. Click the ‘send’ button to send the invite to the user’s email. If the user does not receive the invitation, you can resend the invite (see resending invites in section 2.2). You may need to ask users to check their junk or spam folder.</Typography>
                                    <img alt="group_admin_help_inviting_a_new_user_02" src={require("../../img/group_admin_help_inviting_a_new_user_02.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Resending invites */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.2. Resending invites</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">From the manage group members tab you can resend invites to users who have previously been invited but have not yet registered.  Once in the invitation and registrations tab select the user who has already been invited and click on the ‘resend’ button. Please remind any user who has not received their invites to check their junk or spam folders in their email account.</Typography>
                                    <img alt="group_admin_help_inviting_a_new_user_03" src={require("../../img/group_admin_help_inviting_a_new_user_03.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 3. Manage access requests */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_manage_access_requests'} onChange={this.handleExpandPanel('group_admin_help_manage_access_requests')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    3. Manage access requests
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>The access request tab is used to accept or reject investors from joining your group. Other users on the platform can request to join your group to gain access to your group’s offers. Click on the ‘access requests’ tab and this will show any pending requests, from there you can accept or reject individual requests.</Typography>
                                <img alt="group_admin_help_manage_access_requests" src={require("../../img/group_admin_help_manage_access_requests.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 4. Manage group members */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_manage_group_requests'} onChange={this.handleExpandPanel('group_admin_help_manage_group_requests')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    4. Manage group members
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>To manage all members in your group, click ‘manage group members’ from the home page. The user management page allows you to view and modify group members information; be aware you can only edit the information for invited group members and not external group members who joined the group through an access request.  To view a user’s information/activity or edit their details click on their name in the list or alternatively you can search by email address.</Typography>
                                <img alt="group_admin_help_manage_group_requests" src={require("../../img/group_admin_help_manage_group_members.png").default} className={css(styles.image_style)}/>
                                <Typography variant="body1" align="left" paragraph>If a user needs to be blocked or removed from the platform, please contact us support@investwest.online for assistance.</Typography>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 5. Manage offers */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_manage_offers'} onChange={this.handleExpandPanel('group_admin_help_manage_offers')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    5. Manage offers
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>From the manage offers tab, you can view and edit all your group’s offers. The dropdown will show the offers title, its creator, its fundraising goal, and status.</Typography>

                                {/** Viewing an offer */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>5.1. Viewing an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">To view an offer, open the manage offers tab and click on the title of the offer or you can also search for an offer by name.</Typography>
                                    <img alt="group_admin_help_viewing_an_offer" src={require("../../img/group_admin_help_viewing_an_offer.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Accepting and rejecting an offer */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>5.2. Accepting and rejecting an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" paragraph>The Invest West process starts with an issuer creating an offer. The new offer will appear in your manage offers table, the bell icon will also notify you that an offer requires your attention. Newly submitted offers show a status of ‘Submitted. Awaiting group admin review’. From this section you can view each offer by clicking on its title.</Typography>
                                    <img alt="group_admin_help_accept_reject_offer" src={require("../../img/group_admin_help_accept_reject_offer.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left" paragraph>To accept or reject the offer scroll down to the bottom of the page and click on the control phases tab. From here you can change the offers default visibility (see what the different levels of visibility mean in section 10.1) as well as accept or reject the offer.</Typography>
                                    <img alt="group_admin_help_accept_reject_offer_2" src={require("../../img/group_admin_help_accept_reject_2_offer.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Editing an offer */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>5.3. Editing an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">As a group admin you can edit an offer’s details if necessary. This can be done in the manage offers tab. To edit an offer, you first need to view it by clicking on its title.</Typography>
                                    <img alt="group_admin_help_edit_offer_01" src={require("../../img/group_admin_help_edit_offer_01.png").default} className={css(styles.image_style)}
                                    />
                                    <Typography variant="body1" align="left">
                                        Then you can click on the edit button on the "Edit offer" button.
                                    </Typography>
                                    <img alt="group_admin_help_edit_offer_02" src={require("../../img/group_admin_help_edit_offer_02.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Temporarily closing an offer */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>5.4. Temporarily closing an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">As a group admin you can temporarily close any offer (stop it being visible to any users). This can be done in the manage offers tab. Select the title of the offer (see viewing an offer in section 5.1), scroll down the bottom of the page, then click on control phases tab and press the ‘Close temporally’ button.</Typography>
                                    <img alt="group_admin_help_temporarily_closing_an_offer" src={require("../../img/group_admin_help_temporarily_closing_an_offer.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Reopening a temporarily closed offer */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>5.5. Reopening a temporarily closed offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">
                                        If an offer has been temporally closed (see temporarily closing an offer in
                                        section 5.4), it can be re-opened. This can be done in the manage investment
                                        opportunities tab. Select the title of the offer (see viewing an offer in
                                        section 5.1), from here scroll down the bottom of the page, then click on
                                        control phases tab and press the "Open again" button. Please note, an offer can
                                        only be re-opened if it is temporarily closed.
                                    </Typography>
                                    <img alt="group_admin_help_reopening_a_temporarily_closed_offer" src={require("../../img/group_admin_help_reopening_a_temporarily_closed_offer.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 6. Manage group admins */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_manage_group_admins'} onChange={this.handleExpandPanel('group_admin_help_manage_group_admins')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    6. Manage group admins
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Exploring groups */}
                            <FlexView column>
                                <Typography variant="body1" align="left">This page allows you to add another Group Admin to the Group. Please be advised, only add group admins if essential as each new admin will have full administer rights to the group. To add a group admin, click on the ‘mange group admins’ tab, then click on the ‘Add new group admin’ button and enter their email address and click the ‘Add’ button.</Typography>
                                <img alt="group_admin_help_manage_group_admins" src={require("../../img/group_admin_help_manage_group_admins.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 7. Explore offers */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_explore_offers'} onChange={this.handleExpandPanel('group_admin_help_explore_offers')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    7. Exploring offers
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore offers made by other issuers click on the “Explore offers” button in the navigation bar. This page provides a view how Investors view offers. This page can also be used to give issuers and group admins an idea of how offers are structured.</Typography>
                                <img alt="group_admin_help_explore_offers" src={require("../../img/group_admin_help_explore_offers.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 8. Explore groups */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_explore_groups'} onChange={this.handleExpandPanel('group_admin_help_explore_groups')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    8. Exploring groups
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore other groups, click on the “Explore groups” button in the navigation bar. </Typography>
                                <img alt="group_admin_help_explore_groups" src={require("../../img/group_admin_help_explore_groups.png").default} className={css(styles.image_style)}
                                />
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 9. Resources */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_resources'} onChange={this.handleExpandPanel('group_admin_help_resources')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    9. Resources
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore resource on Invest West, click on the “Resources” button in the navigation bar. From this page you can view a range of information and services applicable to you and your users.</Typography>
                                <img alt="group_admin_help_resources" src={require("../../img/group_admin_help_resources.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                     {/** 10. Settings */}
                     <ExpansionPanel expanded={expandedPanel === 'group_admin_help_settings'} onChange={this.handleExpandPanel('group_admin_help_settings')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    10. Settings
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">The settings page allows you to configure the groups settings. This page allows you to add a group description, change the group’s website, alter the colour scheme, manage the default visibility of the group, configure issuer settings and edit the groups FAQ’s. This page can be accessed by clicking on the ‘settings’ button in the navigation bar. To view the groups details from the perspective of an external user not in your group click on the ‘View groups public page’ button.</Typography>
                                <img alt="group_admin_help_settings" src={require("../../img/group_admin_help_settings.png").default} className={css(styles.image_style)}/>

                                {/** Visibility level */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>10.1. Visibility level</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" paragraph>As the group admin you can set the visibility level for offers created by your Group. With Invest west having multiple groups the level of visibility is used to define which of the group’s investment opportunities are visible to other users.</Typography>

                                    {/** Public */}
                                    <FlexView column>
                                        <Typography variant="subtitle1" align="left" paragraph>
                                            <b>10.1.1. Public</b>
                                        </Typography>
                                        <Typography variant="body1" align="left">Selecting “Public” allows all Invest West users (including users who are not a member of your group) to see an offer’s full details and also interact with the offer. Here is an example of a public offer, where all information on the offer is visible.</Typography>
                                        <img alt="group_admin_help_public_offer" src={require("../../img/group_admin_help_public_offer.png").default} className={css(styles.image_style)}/>
                                        <Typography variant="body1" align="left" paragraph>When an offer is public all investors can also see the offers campaign, pitch deck, documents, comments and extra information.</Typography>
                                    </FlexView>

                                    {/** Restricted */}
                                    <FlexView column>
                                        <Typography variant="subtitle1" align="left" paragraph>
                                            <b>10.1.2. Restricted</b>
                                        </Typography>
                                        <Typography variant="body1" align="left">Selecting “Restricted” allows all Invest West users (including users who are not a member of your group) to see the offer’s basic information only. Only member of your group will be able to see the offer’s full details. Here is an example of the same offer as above but restricted. Investors who are not members of your group will not be able to see the offers campaign, pitch deck, documents, comments or extra information. If they want to see this, they will be prompted to join your group.</Typography>
                                        <img alt="group_admin_help_restricted_offer" src={require("../../img/group_admin_help_restricted_offer.png").default} className={css(styles.image_style)}/>
                                    </FlexView>

                                    {/** Private */}
                                    <FlexView column>
                                        <Typography variant="subtitle1" align="left" paragraph>
                                            <b>10.1.3. Private</b>
                                        </Typography>
                                        <Typography variant="body1" align="left" paragraph>
                                            Private allows only members of your group to see the offer's information. No
                                            external user will be able to view the offer.
                                        </Typography>
                                    </FlexView>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 11. Audit log */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_audit_log'} onChange={this.handleExpandPanel('group_admin_help_audit_log')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    11. Audit log
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">The Audit Log is used to monitor all the activities made by the admins of the group.</Typography>
                                <img alt="group_admin_help_audit_log" src={require("../../img/group_admin_help_audit_log.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>


                    {/** 12. Password */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_password'} onChange={this.handleExpandPanel('group_admin_help_password')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    12. Password
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left">If you have forgotten your password or cannot login you can reset your password from the login portal, from there you can click the “Forgot your password?” button. Once clicked enter your email address and you will be sent a link to reset your password.</Typography>
                                <img alt="group_admin_help_password" src={require("../../img/group_admin_help_password.png").default} className={css(styles.image_style)}/>

                                {/** Changing password */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left">
                                        <b>12.1. Changing your password</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">
                                        To change your password, click on the "Change password" button in the navigation
                                        bar. You will need to enter your old password then your new password twice.
                                    </Typography>
                                    <img alt="group_admin_help_change_password" src={require("../../img/group_admin_help_change_password.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 13. Logging out */}
                    <ExpansionPanel expanded={expandedPanel === 'group_admin_help_logging_out'} onChange={this.handleExpandPanel('group_admin_help_logging_out')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    13. Logging out
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Logging out */}
                            <FlexView column>
                                <Typography variant="body1" align="left">
                                    To logout press the "Logout" button at the bottom of the navigation bar.
                                </Typography>
                                <img alt="group_admin_help_logging_out" src={require("../../img/group_admin_help_logging_out.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Typography variant="body1" align="center" paragraph>Version 1.2.4</Typography>
                </Col>
            </Row>
            </Container>

        );
    };

    /**
     * Render investor help
     */
    renderInvestorHelp = () => {

        const {
            expandedPanel
        } = this.state;

        return (
            <Row noGutters style={{marginBottom: 50}}>
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                    {/** 1. Navigating Invest West */}
                    <ExpansionPanel expanded={expandedPanel === 'investor_help_navigating_invest_west'} onChange={this.handleExpandPanel('investor_help_navigating_invest_west')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    1. Navigating Invest West
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>Welcome to Invest West, we are excited to work with you. Here is a basic tutorial showing the key functionalities of the site. </Typography>

                                {/** My dashboard */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.1. My dashboard</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">When you have logged in you can view your dashboard by clicking the “My dashboard” button at the top right of the page. This will take you to your unique dashboard where you can access all the site’s functionality.</Typography>
                                    <img alt="investor_help_my_dashboard" src={require("../../img/investor_help_my_dashboard.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Navigation bar */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.2. Navigation bar</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Once logged on you can navigate the site using the navigation bar. The navigation bar is always on the left side and can be hidden by pressing the three consecutive white lines. On the navigation bar there are nine main buttons home, profile button, my pledges, change password, explore groups, forums button, the contact us button, help and the logout button.</Typography>
                                    <img alt="investor_help_navigation_bar" src={require("../../img/investor_help_navigation_bar.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Notifications */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.3. Notifications</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">The bell Icon will notify you of any updates or changes to your account. This can be accessed at the top right of the dashboard.</Typography>
                                    <img alt="investor_help_notifications" src={require("../../img/investor_help_notifications.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 2. Offers */}
                    <ExpansionPanel expanded={expandedPanel === 'investor_help_offers'} onChange={this.handleExpandPanel('investor_help_offers')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    2. Offers
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                <Typography variant="body1" align="left" paragraph>The home page will display all the offers available to you, and their relevant information.</Typography>

                                {/** Viewing offers */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.1. Viewing offers</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">To view and interact with an offer, you need to click on that offer. The Icon at the bottom right of each tile shows the visibility of the offer. There are three visibility settings
                                        <br/><br/>
                                        <ul>
                                            <li>
                                                <PublicIcon style={{marginRight: 8}}/>
                                                Public offers are viewable to all investors on the system,
                                            </li>
                                            <br/>
                                            <li>
                                                <RestrictedIcon style={{marginRight: 8}}/>
                                                Restricted offers are publicly viewable but with limited information
                                                and
                                            </li>
                                            <br/>
                                            <li>
                                                <PrivateIcon style={{marginRight: 8}}/>
                                                Private offers are only viewable to investors that belong to the
                                                same group as the offer.
                                            </li>
                                        </ul>
                                    </Typography>
                                    <img alt="investor_help_viewing_offers" src={require("../../img/investor_help_viewing_offers.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                 {/** Viewing the campaign */}
                                 <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.2. Viewing the campaign</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">Once viewing an offer (see viewing offers in section 2.1), the information about the offer can be found down the page. You can see the campaign, attached documents, comments and see any extra information. To see the campaign, scroll down to the bottom of the page and click on “campaign” tab, this will contain the campaign information in the form of text or a document; click on the document to download it.</Typography>
                                    <img alt="investor_help_viewing_offers" src={require("../../img/investor_help_viewing_offers_campaign.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Commenting on an offer */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.3. Commenting on an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">Once viewing an offer (see viewing offers in section 2.1) you can comment on that offer. Comments are public and all users can view them. To make a comment navigate to the comments section at the bottom of the offer page and click on the “investor comments” button.</Typography>
                                    <img alt="investor_help_viewing_offers" src={require("../../img/investor_help_pitch_phase_02.png").default} className={css(styles.image_style)}/>
                                    <Typography><b>Note: You cannot interact with an offer until you have completed your self-certification form. See 5.3.</b></Typography>
                                </FlexView>

                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.4. Contacting the fundraiser</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" component="legend">Once viewing an offer (see viewing offers in section 2.1) you can contact the fundraiser by clicking the “Contact us” button on the right hand side of the page.</Typography>
                                    <img alt="investor_help_viewing_offers" src={require("../../img/investor_contacting_fundraiser.png").default} className={css(styles.image_style)}/>
                                    <Typography><b>Note: You cannot interact with an offer until you have completed your self-certification form. See 5.3.</b></Typography>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                     {/** 3. Exploring groups */}
                     <ExpansionPanel expanded={expandedPanel === 'investor_help_exploring_groups'} onChange={this.handleExpandPanel('investor_help_exploring_groups')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    3. Exploring groups
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Exploring groups */}
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore other groups and request to join them by clicking on the “Explore groups” button in the navigation bar.</Typography>
                                <img alt="investor_help_exploring_groups" src={require("../../img/investor_help_exploring_groups.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                       {/** 4. Resources */}
                       <ExpansionPanel expanded={expandedPanel === 'investor_help_resources'} onChange={this.handleExpandPanel('investor_help_resources')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    4. Resources
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Resources */}
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore useful resources on Invest West, click on the “Resources” button in the navigation bar. From this page you can view a range of content for investors, business owners and entrepreneurs.</Typography>
                                <img alt="investor_help_resources" src={require("../../img/investor_help_resources.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 5. Your profile */}
                    <ExpansionPanel expanded={expandedPanel === 'investor_help_your_profile'} onChange={this.handleExpandPanel('investor_help_your_profile')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    5. Your profile
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** Editing your profile */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>Your profile page is used to view or edit information about yourself, add or update your business profile and complete your self-certification form. To access your profile page, click on the “Profile” button in the navigation bar. You need to complete your self-certification form to interact with any offer.</Typography>
                                    <img alt="investor_help_profile" src={require("../../img/investor_help_profile.png").default} className={css(styles.image_style)}/>

                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>5.1. Editing your profile</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">In the profile section you can add your LinkedIn account by inserting a URL to your LinkedIn profile in, don’t forget to click the save button after you make any changes. You can also update your profile picture by clicking on the “update profile picture” button and attaching a photo. To view how users will see your profile click on the “view my public profile” button in the top right-hand side of the profile page.</Typography>
                                    <img alt="investor_help_editing_your_profile" src={require("../../img/investor_help_editing_your_profile.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Setting up your business profile */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>5.2. Setting up your business profile</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Setting up a business profile is optional, to do this you need to click on the “I want to upload my business profile” button.</Typography>
                                    <img alt="investor_help_setting_up_business_profile" src={require("../../img/investor_help_setting_up_business_profile.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Self-certification */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>5.3. Self-certification</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">All Invest West users must complete a self-certification form. You can do this in the bottom of the “Profile” page. Select the appropriate statement for your circumstances from the drop-down box and read the full statement carefully. You will be prompted to recertify every 12 months.</Typography>
                                    <img alt="investor_help_self_certification" src={require("../../img/investor_help_self_certification.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 6. Password */}
                    <ExpansionPanel expanded={expandedPanel === 'investor_help_password'} onChange={this.handleExpandPanel('investor_help_password')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    6. Password
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** Reset password */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph
                                    >
                                        <b>6.1. Resetting your password</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">If you have forgotten your password or cannot login you can reset your password from the login portal, from there you can click the “Forgot your password?” button. Once clicked enter your email address and you will be sent a link to reset your password.</Typography>
                                    <img alt="investor_help_reset_password" src={require("../../img/investor_help_reset_password.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Change password */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>6.2. Changing your password</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">To change your password click on the “Change password” button in the navigation bar. You will need to enter your old password then your new password twice. If you don’t know your password, contact us at (see support in section 7).</Typography>
                                    <img alt="investor_help_change_password" src={require("../../img/investor_help_change_password.png").default}  className={css(styles.image_style)}
                                    />
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                   {/** 7. Support */}
                   <ExpansionPanel expanded={expandedPanel === 'investor_help_support'} onChange={this.handleExpandPanel('investor_help_support')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    7. Support
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Support */}
                            <FlexView column>
                                <Typography variant="body1" align="left">If you have any further questions or problems, you can get in touch with us by clicking on the “contact us” button in the navigation bar.</Typography>
                                <img alt="investor_help_support_01" src={require("../../img/investor_help_support_01.png").default} className={css(styles.image_style)}/>
                                <Typography variant="body1" align="left">Additionally, you can also contact us from the login page by clicking on the “contact us” button at the top right of the page.</Typography>
                                <img alt="investor_help_support_02" src={require("../../img/investor_help_support_02.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    {/** 8. Logging out */}
                    <ExpansionPanel expanded={expandedPanel === 'investor_help_logging_out'} onChange={this.handleExpandPanel('investor_help_logging_out')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    8. Logging out
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Logging out */}
                            <FlexView column>
                                <Typography variant="body1" align="left">
                                    To logout press the "Logout" button at the bottom of the navigation bar.
                                </Typography>
                                <img alt="investor_help_log_out" src={require("../../img/investor_help_log_out.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Col>
                <Typography variant="h2" align="left">
                                    13. Logging out
                                </Typography>
            </Row>
            
        );
    };

    /**
     * Render issuer help
     */
    renderIssuerHelp = () => {

        const {
            expandedPanel
        } = this.state;

        return (
            <Row
                noGutters
                style={{
                    marginBottom: 50
                }}
            >
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                    {/** 1. Navigating Invest West */}
                    <ExpansionPanel expanded={expandedPanel === 'issuer_help_navigating_invest_west'} onChange={this.handleExpandPanel('issuer_help_navigating_invest_west')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    1. Navigating Invest West
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** My dashboard */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        Welcome to Invest West, we are excited to work with you. Here is a basic
                                        tutorial showing the key functions of the site.
                                    </Typography>

                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.1. My dashboard</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Once you have logged in you can view your dashboard by clicking the “My dashboard” button at the top right of the page. This will take you to your unique dashboard where you can access all the site’s functionality. The home page will display all the offers on Invest West.</Typography>
                                    <img alt="issuer_help_my_dashboard" src={require("../../img/issuer_help_my_dashboard.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Navigation bar */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.2. Navigation bar</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">Once logged on you can get around using the navigation bar. The navigation bar is always on the left side and can be hidden by pressing the three white lines. On the navigation bar there are nine main buttons; home, profile, change password, explore offers, explore groups, forums, contact us, help and the logout.</Typography>
                                    <img alt="issuer_help_navigation_bar" src={require("../../img/issuer_help_navigation_bar.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Notifications */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>1.3. Notifications</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">The bell Icon will notify you of any updates or changes to your account. This can be accessed at the top right of the dashboard.</Typography>
                                    <img alt="issuer_help_notifications" src={require("../../img/issuer_help_notifications.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                         {/** 2. My offers */}
                         <ExpansionPanel expanded={expandedPanel === 'issuer_help_my_offers'} onChange={this.handleExpandPanel('issuer_help_my_offers')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    2. My offers
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** Creating a new offer */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.1. Creating a new offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left" paragraph>
                                        You need to set up a business profile before you can create your first offer (see setting up your business profile in section 5.2). 
                                        <br/><br/>
                                        To create a new offer, click on the “start a new offer” button located at the top left of the home page.
                                    </Typography>
                                    <img alt="issuer_help_create_new_offer_01" src={require("../../img/issuer_help_create_new_offer_01.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left" paragraph>Once you have clicked this button you will be taken to the five-step process for creating your offer, the sections marked with an Asterix are mandatory and must be filled out. You can save your funding round at any point and return to edit it later by clicking the “save” button located at the bottom right of the page.</Typography>
                                    <img alt="issuer_help_create_new_offer_02" src={require("../../img/issuer_help_create_new_offer_02.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left" paragraph>Once you submit your offer you will be notified that it has been successfully uploaded. It will not be published until it has been checked and approved by your Group Administrator. You will be notified once your offer is approved (or rejected). If your offer is rejected, you will get an email with feedback from your Group Administrator.</Typography>
                                </FlexView>

                                <br/>

                                {/** Managing an offer */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.2. Managing an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">You can manage your offers from the My offers page, to view and edit an offer click on the offers title.</Typography>
                                    <img alt="issuer_help_manage_offer" src={require("../../img/issuer_help_manage_offer.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                                    <br/>
                                {/** Editing an offer */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>2.3. Editing an offer</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">
                                        To edit your offer, click on the "Edit offer" button on the offer’s main page.
                                    </Typography>
                                    <img alt="issuer_help_edit_offer" src={require("../../img/issuer_help_edit_offer.png").default} className={css(styles.image_style)}/>

                                    {/** Replying to comments */}
                                    <FlexView column>
                                        <Typography variant="body1" align="left" paragraph>
                                            <b>2.3.1. Replying to comments</b>
                                        </Typography>
                                        <Typography variant="body1" align="left">If an investor comments on your offer you will be notified via the bell icon.</Typography>
                                        <img alt="issuer_help_replying_to_comments_in_offer_01" src={require("../../img/issuer_help_replying_to_comments_in_offer_01.png").default} className={css(styles.image_style)}/>
                                        <Typography variant="body1" align="left">From the offer’s main page scroll down and click on the “Investor comments” tab, then click on the “reply” button to reply to the selected comment.</Typography>
                                        <img alt="issuer_help_replying_to_comments_in_offer_02" src={require("../../img/issuer_help_replying_to_comments_in_offer_02.png").default} className={css(styles.image_style)}/>
                                    </FlexView>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                     {/** 3. Exploring groups */}
                     <ExpansionPanel expanded={expandedPanel === 'issuer_help_exploring_groups'} onChange={this.handleExpandPanel('issuer_help_exploring_groups')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    3. Exploring groups
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Exploring groups */}
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore other groups, click on the “Explore offers” button in the navigation bar. From this page you can click on specific groups to see the groups details.</Typography>
                                <img alt="issuer_help_exploring_groups" src={require("../../img/issuer_help_exploring_groups.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                      {/** 4. Resources */}
                      <ExpansionPanel expanded={expandedPanel === 'issuer_help_resources'} onChange={this.handleExpandPanel('issuer_help_resources')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    4. Resources
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Resources */}
                            <FlexView column>
                                <Typography variant="body1" align="left">To explore useful resource on Invest West, click on the “Resources” button in the navigation bar. From this page you can view a range of content for business owners and entrepreneurs.</Typography>
                                <img alt="issuer_help_resources" src={require("../../img/issuer_help_resources.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                      {/** 5. Your profile */}
                      <ExpansionPanel expanded={expandedPanel === 'issuer_help_your_profile'} onChange={this.handleExpandPanel('issuer_help_your_profile')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    5. Your profile
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** Editing your profile */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>Your profile page is used to view or edit information about yourself, add or update your business profile and upload formal documents. To access your profile page, click on the “Profile” button in the navigation bar. You need to set up a business profile before you can create your first offer.</Typography>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>5.1. Editing your profile</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">In the profile section you can add in your LinkedIn account by inserting a URL to your LinkedIn profile, don’t forget to click the save button after you make any changes. You can also update your profile picture by clicking on the “update profile picture” button and attaching a photo.</Typography>
                                    <img alt="issuer_help_edit_profile_01" src={require("../../img/issuer_help_edit_profile_01.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left">To view how investors will see your profile click on the “view my public profile” button in the top right-hand side of the profile page</Typography>
                                    <img alt="issuer_help_edit_profile_02" src={require("../../img/issuer_help_edit_profile_02.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Setting up your business profile */}
                                <FlexView column>
                                    <Typography variant="subtitle1" align="left" paragraph>
                                        <b>5.2. Setting up your business profile</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">To take part in invest west activities you will need to set up your business profile. To set this up go to the profile page and scroll down to the “business profile” section. You will need to fill out all fields with a *.
                                        <br/><br/>
                                        You can enter your registered office manually or search for your address by entering the postcode. The trading address is automatically set to the same as the registered address, if this is not the case for your business uncheck the box and enter in your trading address.
                                    </Typography>
                                    <img alt="issuer_help_setting_business_profile_01" src={require("../../img/issuer_help_setting_business_profile_01.png").default} className={css(styles.image_style)}/>
                                    <Typography variant="body1" align="left">When adding a director click the “add director” button, type their full name in the box provide and then click the “add” button. You must have multiple directors, but you need a minimum of one. Once all the mandatory fields have been completed the “Save” button will become available and you can click this button to finish setting up your business profile.</Typography>
                                    <img alt="issuer_help_setting_business_profile_02" src={require("../../img/issuer_help_setting_business_profile_02.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>


                    {/** 6. Password */}
                    <ExpansionPanel expanded={expandedPanel === 'issuer_help_password'} onChange={this.handleExpandPanel('issuer_help_password')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    6. Password
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <FlexView column>
                                {/** Reset password */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>6.1. Resetting your password</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">If you have forgotten your password or cannot login you can reset your password from the login portal, from there you can click the “Forgot your password?” button. Once clicked enter your email address and you will be sent a link to reset your password.</Typography>
                                    <img alt="issuer_help_reset_password" src={require("../../img/issuer_help_reset_password.png").default} className={css(styles.image_style)}/>
                                </FlexView>

                                {/** Change password */}
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        <b>6.2. Changing your password</b>
                                    </Typography>
                                    <Typography variant="body1" align="left">To change your password, click on the “Change password” button in the navigation bar. You will need to enter your old password then your new password twice. If you don’t know your password, contact us at (see support in section 7).</Typography>
                                    <img alt="issuer_help_change_password" src={require("../../img/issuer_help_change_password.png").default} className={css(styles.image_style)}/>
                                </FlexView>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>


                    {/** 7. Support */}
                    <ExpansionPanel expanded={expandedPanel === 'issuer_help_support'} onChange={this.handleExpandPanel('issuer_help_support')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    7. Support
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Support */}
                            <FlexView column>
                                <Typography variant="body1" align="left">If you have any further questions or problems, you can get in touch with us by clicking on the “contact us” button in the navigation bar.</Typography>
                                <img alt="issuer_help_support_01" src={require("../../img/issuer_help_support_01.png").default} className={css(styles.image_style)}/>
                                <Typography variant="body1" align="left">Additionally, you can also contact us from the login page by clicking on the “contact us” button at the top right of the page.</Typography>
                                <img alt="issuer_help_support_02" src={require("../../img/issuer_help_support_02.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    

                    {/** 8. Logging out */}
                    <ExpansionPanel expanded={expandedPanel === 'issuer_help_logging_out'} onChange={this.handleExpandPanel('issuer_help_logging_out')}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <FlexView column>
                                <Typography variant="h6" align="left">
                                    8. Logging out
                                </Typography>
                            </FlexView>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {/** Logging out */}
                            <FlexView column>
                                <Typography variant="body1" align="left">To logout press the “logout” button at the bottom of the navigation bar.</Typography>
                                <img alt="issuer_help_log_out" src={require("../../img/issuer_help_log_out.png").default} className={css(styles.image_style)}/>
                            </FlexView>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Col>
            </Row>
            
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HelpPage);

const styles = StyleSheet.create({
    image_style: {
        objectFit: "contain"
    }
});