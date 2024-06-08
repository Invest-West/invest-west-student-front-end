import React, {Component} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import HashLoader from 'react-spinners/HashLoader';
import FlexView from "react-flexview";

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';
import * as editUserActions from '../../redux-store/actions/editUserActions';
import * as activitiesTableActions from '../../redux-store/actions/activitiesTableActions';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';

import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as ROUTES from '../../router/routes';
import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';

import {AUTH_SUCCESS} from '../signin/Signin';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import Profile from '../../shared-components/profile/Profile';

const mapStateToProps = state => {
    return {
        AuthenticationState: state.AuthenticationState,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,
        authStatus: state.auth ? state.auth.authStatus : null,
        authenticating: state.auth ? state.auth.authenticating : false,
        admin: state.auth ? state.auth.user : null,
        adminLoaded: state.auth ? state.auth.userLoaded : false,
        editUserProfile_userEdited: state.editUser.userEdited,
        projectsTable_user: state.projectsTable ? state.projectsTable.user : null
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        editUserProfile_setOriginalUserAndEditedUser: (user) => dispatch(editUserActions.setOriginalUserAndEditedUser(user)),
        editUserProfile_startOriginalUserChangedListener: () => dispatch(editUserActions.startOriginalUserChangedListener()),
        editUserProfile_stopOriginalUserChangedListener: () => dispatch(editUserActions.stopOriginalUserChangedListener()),

        // projectsTable_setUser: (user) => dispatch(projectsTableActions.setUser(user)),
        // projectsTable_stopListeningForProjectsChanged: () => dispatch(projectsTableActions.stopListeningForProjectsChanged()),
        // projectsTable_stopListeningForPledgesChanged: () => dispatch(projectsTableActions.stopListeningForPledgesChanged()),
        // projectsTable_stopListeningForPledgesMadeByTableInvestor: () => dispatch(projectsTableActions.stopListeningForPledgesMadeByTableInvestor()),

        activitiesTable_setUser: (user) => dispatch(activitiesTableActions.setTableUser(user)),
        activitiesTable_stopListeningForActivitiesChanged: () => dispatch(activitiesTableActions.stopListeningForActivitiesChanged()),

        setFeedbackSnackbarContent: (message, color, position) => dispatch(feedbackSnackbarActions.setFeedbackSnackbarContent(message, color, position))
    }
};

class ProfilePageEditable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userToBeEdited: null,
            userToBeEditedLoaded: false,
            loadingUserToBeEdited: false
        }
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork
        } = this.props;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.EDIT_USER_PROFILE : ROUTES.EDIT_USER_PROFILE_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            admin,

            loadAngelNetwork,
            editUserProfile_setOriginalUserAndEditedUser,
            // projectsTable_setUser,
            activitiesTable_setUser
        } = this.props;

        const {
            userToBeEdited
        } = this.state;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadData();

            if (admin && userToBeEdited) {
                editUserProfile_setOriginalUserAndEditedUser(userToBeEdited);

                // projectsTable_setUser(userToBeEdited);

                activitiesTable_setUser(userToBeEdited);
            }
        }
    }

    componentWillUnmount() {
        const {
            editUserProfile_setOriginalUserAndEditedUser,

            // projectsTable_setUser,
            // projectsTable_stopListeningForProjectsChanged,
            // projectsTable_stopListeningForPledgesChanged,
            // projectsTable_stopListeningForPledgesMadeByTableInvestor,

            activitiesTable_setUser,
            activitiesTable_stopListeningForActivitiesChanged,

            editUserProfile_stopOriginalUserChangedListener
        } = this.props;

        // when click to go back,
        // reset the user referenced in edit user profile
        editUserProfile_setOriginalUserAndEditedUser(null);

        // stop listening for user's profile changes if added
        editUserProfile_stopOriginalUserChangedListener();

        // reset the user references in projects table
        // ---> avoid caches
        // projectsTable_setUser(null);
        // projectsTable_stopListeningForProjectsChanged();
        // projectsTable_stopListeningForPledgesChanged();
        // projectsTable_stopListeningForPledgesMadeByTableInvestor();

        // reset the user references in activities table
        // ---> avoid caches
        activitiesTable_setUser(null);
        activitiesTable_stopListeningForActivitiesChanged();
    }

    /**
     * Load data
     */
    loadData = () => {
        // get user's id from the URL
        const userToBeEditedID = this.props.match.params.userID;

        const {
            editUserProfile_startOriginalUserChangedListener
        } = this.props;

        const {
            userToBeEdited,
            userToBeEditedLoaded,
            loadingUserToBeEdited
        } = this.state;

        if (!userToBeEdited && !userToBeEditedLoaded && !loadingUserToBeEdited) {
            this.setState({
                userToBeEditedLoaded: false,
                loadingUserToBeEdited: true
            });

            realtimeDBUtils
                .getUserBasedOnID(userToBeEditedID)
                .then(user => {

                    realtimeDBUtils
                        .loadGroupsUserIsIn(userToBeEditedID)
                        .then(groupsUserIsIn => {

                            user.groupsUserIsIn = groupsUserIsIn;

                            this.setState({
                                userToBeEdited: JSON.parse(JSON.stringify(user)),
                                userToBeEditedLoaded: true,
                                loadingUserToBeEdited: false
                            });

                            // start listening for user's profile changes
                            editUserProfile_startOriginalUserChangedListener();
                        })
                        .catch(error => {
                            this.setState({
                                userToBeEdited: null,
                                userToBeEditedLoaded: true,
                                loadingUserToBeEdited: false
                            });
                        });
                })
                .catch(error => {
                    this.setState({
                        userToBeEdited: null,
                        userToBeEditedLoaded: true,
                        loadingUserToBeEdited: false
                    });
                });
        }
    }

    render() {
        const {
            groupProperties,
            shouldLoadOtherData,
            groupPropertiesLoaded,

            authStatus,
            authenticating,
            admin,
            adminLoaded
        } = this.props;

        const {
            userToBeEdited,
            userToBeEditedLoaded
        } = this.state;

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

        if (authenticating
            || !adminLoaded
            || !userToBeEditedLoaded
        ) {
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
            || !admin
            || (admin && admin.type !== DB_CONST.TYPE_ADMIN)
            || !userToBeEdited
        ) {
            return (
                <PageNotFoundWhole/>
            );
        }

        // the group admins are trying to open this page
        // to edit profile of a user that is NOT a member of their group
        if (!admin.superAdmin
            && userToBeEdited.hasOwnProperty('groupsUserIsIn')
            && userToBeEdited.groupsUserIsIn.findIndex(group => group.anid === admin.anid) === -1
        ) {
            return (
                <PageNotFoundWhole/>
            );
        }

        return (
            <Container fluid style={{padding: 0}}>
                {/** Body */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 8, offset: 2}} style={{marginTop: 30, marginBottom: 30}}>
                        {
                            !userToBeEdited
                                ?
                                null
                                :
                                <Profile/>
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePageEditable);