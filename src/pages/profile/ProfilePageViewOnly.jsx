import React, {Component} from 'react';
import {css, StyleSheet} from 'aphrodite';
import HashLoader from 'react-spinners/HashLoader';
import {Col, Container, Image, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {Divider, Paper, Typography} from '@material-ui/core';
import ReactPlayer from 'react-player';

import {AUTH_SUCCESS} from '../signin/Signin';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import LetterAvatar from '../../shared-components/profile/LetterAvatar';

import firebase from '../../firebase/firebaseApp';
import * as colors from '../../values/colors';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as ROUTES from '../../router/routes';
import * as utils from '../../utils/utils';

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';

const mapStateToProps = state => {
    return {
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        currentUser: state.auth.user,
        currentUserLoaded: state.auth.userLoaded,

    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

    }
};

class ProfilePageViewOnly extends Component {

    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database();

        this.state = {
            userToBeViewed: null,
            userToBeViewedLoaded: false,

            userToBeViewedInvited: null,
            userToBeViewedInvitedLoaded: false,

            loadingUserToBeViewed: false
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
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.USER_PROFILE : ROUTES.USER_PROFILE_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            loadAngelNetwork
        } = this.props;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            currentUser,
            currentUserLoaded

        } = this.props;

        const {
            userToBeViewed,
            userToBeViewedLoaded,
            userToBeViewedInvitedLoaded,
            loadingUserToBeViewed
        } = this.state;

        if (!currentUserLoaded) {
            return;
        }

        if (!currentUser) {
            if (!userToBeViewedLoaded && !userToBeViewedInvitedLoaded && !loadingUserToBeViewed) {
                this.setState({
                    userToBeViewedLoaded: true,
                    userToBeViewedInvitedLoaded: true,
                    loadingUserToBeViewed: false
                });
            }
            return;
        }

        this.loadUserToBeViewedProfile();

    };

    /**
     * Load profile of the user to be viewed
     */
    loadUserToBeViewedProfile = () => {

        const {
            userToBeViewed,
            loadingUserToBeViewed,
            userToBeViewedLoaded,
            userToBeViewedInvitedLoaded
        } = this.state;

        if (!userToBeViewed && !loadingUserToBeViewed && !userToBeViewedLoaded && !userToBeViewedInvitedLoaded) {
            this.setState({
                loadingUserToBeViewed: true,
                userToBeViewedLoaded: false,
                userToBeViewedInvitedLoaded: false
            });

            // this id can be wither official user id or invited id (pass invited id if the user has not registered)
            // Note: this id can be official id or invited id
            // if the user has registered, this id is an official id. Otherwise, it is the invited id
            const userToBeViewedID = this.props.match.params.userID;

            // get profile of the user to be viewed
            realtimeDBUtils
                .getUserBasedOnID(userToBeViewedID)
                .then(user => {
                    this.setState({
                        userToBeViewed: user,
                        loadingUserToBeViewed: false,
                        userToBeViewedLoaded: true
                    });
                })
                .catch(error => {
                    this.setState({
                        loadingUserToBeViewed: false,
                        userToBeViewedLoaded: true
                    });
                });

            // get the invited profile of this user
            // first call --> assume this id is an official id
            realtimeDBUtils
                .getInvitedUserBasedOnIDOrEmail(userToBeViewedID, realtimeDBUtils.GET_INVITED_USER_BASED_ON_OFFICIAL_ID)
                .then(invitedUser => {
                    this.setState({
                        userToBeViewedInvited: invitedUser[0],
                        loadingUserToBeViewed: false,
                        userToBeViewedInvitedLoaded: true
                    });
                })
                .catch(error => {
                    // no invited user with the official id found
                    // second call --> this id is an invited id
                    realtimeDBUtils
                        .getInvitedUserBasedOnIDOrEmail(userToBeViewedID, realtimeDBUtils.GET_INVITED_USER_BASED_ON_INVITED_ID)
                        .then(invitedUser => {
                            this.setState({
                                userToBeViewedInvited: invitedUser[0],
                                loadingUserToBeViewed: false,
                                userToBeViewedInvitedLoaded: true
                            });
                        })
                        .catch(error => {
                            // if this error happens --> this id is non-sense
                            this.setState({
                                loadingUserToBeViewed: false,
                                userToBeViewedInvitedLoaded: true
                            });
                        });
                });
        }
    };

    render() {
        const {
            userToBeViewed,
            userToBeViewedLoaded,

            userToBeViewedInvited,
            userToBeViewedInvitedLoaded,

            loadingUserToBeViewed
        } = this.state;

        const {
            groupProperties,
            groupPropertiesLoaded,
            shouldLoadOtherData,

            authStatus,
            authenticating,
            currentUser,
            currentUserLoaded
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

        if (authenticating
            || !currentUserLoaded
            || !userToBeViewedLoaded
            || !userToBeViewedInvitedLoaded
            || loadingUserToBeViewed
        ) {
            return (
                <FlexView width="100%" marginTop={30} hAlignContent="center">
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

        if (authStatus !== AUTH_SUCCESS || !currentUser) {
            return <PageNotFoundWhole/>;
        }

        if (!userToBeViewed) {
            // user was invited but not yet registered
            if (userToBeViewedInvited) {
                return (
                    <Container fluid style={{padding: 0}}>
                        <Row noGutters>
                            <Col xs={12} sm={12} md={12} lg={12}>
                                <Typography align="center" variant="h5" style={{marginTop: 35}}>
                                    {`${userToBeViewedInvited.title} ${userToBeViewedInvited.firstName} ${userToBeViewedInvited.lastName} has been invited by ${userToBeViewedInvited.Invitor.displayName} but not yet registered.`}
                                </Typography>
                            </Col>
                        </Row>
                    </Container>
                );
            } else {
                return (
                    <PageNotFoundWhole/>
                );
            }
        }

        return (
            <Container fluid style={{padding: 0, backgroundColor: colors.gray_100, height: "100%", minHeight: "100vh", paddingTop: 50, paddingBottom: 100, paddingLeft: 12, paddingRight: 12}}>
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                        <Paper elevation={1} style={{padding: 15}}>
                            <Row noGutters>
                                <Col xs={{span: 12, order: 1}} md={{span: 12, order: 1}} lg={{span: 3, order: 1}}>
                                    <FlexView width="100%" hAlignContent="center" vAlignContent="center">
                                        {
                                            !userToBeViewed.profilePicture
                                            || (
                                                userToBeViewed.profilePicture
                                                && userToBeViewed.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed')) === -1
                                            )
                                                ?
                                                <LetterAvatar firstName={userToBeViewed.firstName} lastName={userToBeViewed.lastName} width={150} height={150} textVariant="h4"/>
                                                :
                                                <FlexView width={156} height={156}>
                                                    <Image roundedCircle thumbnail src={ userToBeViewed.profilePicture[userToBeViewed.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed'))].url} style={{width: "100%", maxHeight: 156, objectFit: "contain"}}/>
                                                </FlexView>
                                        }
                                    </FlexView>
                                </Col>
                                <Col xs={{span: 12, order: 2}} md={{span: 12, order: 2}} lg={{span: 9, order: 2}}>
                                    <FlexView column vAlignContent="center" hAlignContent="center" height="100%" marginTop={10} marginBottom={10}>
                                        <Typography align="center" variant="h6">
                                            {`${userToBeViewed.title} ${userToBeViewed.firstName} ${userToBeViewed.lastName}`}
                                        </Typography>
                                        {
                                            this.renderUserStatus(userToBeViewedInvited)
                                        }
                                        <FlexView column marginTop={18} hAlignContent="center">
                                            <Typography align="center" variant="body1">{`Email: ${userToBeViewed.email}`}</Typography>
                                            {
                                                userToBeViewed.hasOwnProperty('linkedin') && userToBeViewed.linkedin.trim().length > 0
                                                    ?
                                                    <a href={userToBeViewed.linkedin} target="_blank" rel="noopener noreferrer">
                                                        <img alt="linkedin_logo" src={require("../../img/linkedin_logo.png").default} style={{width: 64, height: 64}}/>
                                                    </a>
                                                    :
                                                    null
                                            }
                                        </FlexView>
                                    </FlexView>
                                </Col>
                            </Row>
                        </Paper>

                        <Paper elevation={1} style={{padding: 20, marginTop: 15}}>
                            {
                                !userToBeViewed.BusinessProfile
                                    ?
                                    <FlexView column>
                                        <Typography variant="h6" color="primary">Uni profile</Typography>
                                        <FlexView column marginTop={15} marginLeft={15} marginRight={15} hAlignContent="center" vAlignContent="center">
                                            <Typography align="center" variant="body1">Uni profile has not been uploaded.</Typography>
                                        </FlexView>
                                    </FlexView>
                                    :
                                    <FlexView column>
                                        <Typography variant="h6" color="primary">Uni profile</Typography>
                                        <FlexView column marginTop={15} marginLeft={15} marginRight={15}>
                                            <Typography variant="subtitle1" align="left"> Company name:&nbsp;&nbsp;
                                                <b>{userToBeViewed.BusinessProfile.companyName}</b>
                                            </Typography>
                                            <Divider className={css(styles.divider_style)}/>
                                            <Divider className={css(styles.divider_style)}/>
                                            <Typography variant="subtitle1" align="left">Course sector:&nbsp;&nbsp;
                                                <b>{userToBeViewed.BusinessProfile.sector}</b>
                                            </Typography>
                                            <Divider className={css(styles.divider_style)}/>
                                            <Typography variant="subtitle1" align="left">Course Registered office:&nbsp;&nbsp;
                                                <br/>
                                                <br/>
                                                {userToBeViewed.BusinessProfile.registeredOffice.address1.toUpperCase()}
                                                <br/>
                                                {
                                                    userToBeViewed.BusinessProfile.registeredOffice.address2 === ""
                                                        ?
                                                        null
                                                        :
                                                        <div>
                                                            {userToBeViewed.BusinessProfile.registeredOffice.address2.toUpperCase()}
                                                            <br/>
                                                        </div>
                                                }
                                                {
                                                    userToBeViewed.BusinessProfile.registeredOffice.address3 === ""
                                                        ?
                                                        null
                                                        :
                                                        <div>
                                                            {userToBeViewed.BusinessProfile.registeredOffice.address3.toUpperCase()}
                                                            <br/>
                                                        </div>
                                                }
                                                {userToBeViewed.BusinessProfile.registeredOffice.townCity.toUpperCase()}, {userToBeViewed.BusinessProfile.registeredOffice.postcode.toUpperCase()}
                                                <br/>
                                            </Typography>
                                            <Divider className={css(styles.divider_style)}/>
                                            <Divider className={css(styles.divider_style)}/>
                                            <Typography variant="subtitle1" align="left">Course Website:&nbsp;&nbsp;
                                                <a href={userToBeViewed.BusinessProfile.companyWebsite} rel="noopener noreferrer" target="_blank">
                                                    <b>{userToBeViewed.BusinessProfile.companyWebsite}</b>
                                                </a>
                                            </Typography>
                                            <Divider className={css(styles.divider_style)}/>
                                            <FlexView column>
                                                <Typography variant="subtitle1" align="left">Introduction video
                                                </Typography>
                                                <FlexView marginTop={20} marginBottom={20} hAlignContent="center" vAlignContent="center">
                                                    {
                                                        !userToBeViewed.BusinessProfile.video
                                                        || (
                                                            userToBeViewed.BusinessProfile.video
                                                            && userToBeViewed.BusinessProfile.video.findIndex(video => !video.hasOwnProperty('removed')) === -1
                                                        )
                                                            ?
                                                            <Typography align="center" variant="subtitle1" color="textSecondary">No introduction video available.</Typography>
                                                            :
                                                            <ReactPlayer
                                                                url={
                                                                    userToBeViewed.BusinessProfile.video[userToBeViewed.BusinessProfile.video.findIndex(video => !video.hasOwnProperty('removed'))].url
                                                                }
                                                                playsinline
                                                                width="100%"
                                                                height={userToBeViewed.BusinessProfile.video[userToBeViewed.BusinessProfile.video.findIndex(video => !video.hasOwnProperty('removed'))].storageID === "" ? 360 : "auto"}
                                                                playing={false}
                                                                controls={true}/>
                                                    }
                                                </FlexView>
                                                <Divider className={css(styles.divider_style)}/>
                                            </FlexView>
                                        </FlexView>
                                    </FlexView>
                            }
                        </Paper>

                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Render the current status of the to-be-viewed user's profile
     * @param invitedUser
     * @returns {null|*}
     */
    renderUserStatus = invitedUser => {
        let statusMessage = {
            msg: '',
            color: ''
        };

        if (invitedUser.status) {
            if (invitedUser.type === DB_CONST.TYPE_ISSUER) {
                statusMessage.msg = "Teacher of Student";
                statusMessage.color = "primary";
            } else {
                statusMessage.msg = "Student";
                statusMessage.color = "primary";
            }
        } else {
            return null;
        }

        return (
            <Typography align="center" variant="subtitle1" color={statusMessage.color}>{statusMessage.msg}</Typography>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePageViewOnly);

const styles = StyleSheet.create({
    divider_style: {
        marginTop: 12,
        marginBottom: 12
    }
});