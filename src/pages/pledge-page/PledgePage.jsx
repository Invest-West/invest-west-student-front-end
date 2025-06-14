import React, {Component} from 'react';
import {Col, Container, Image, Row} from 'react-bootstrap';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HashLoader from 'react-spinners/HashLoader';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import {NavLink} from 'react-router-dom';

import HeaderWithoutDesc from '../../shared-components/nav-bars/HeaderWithoutDesc';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import LetterAvatar from '../../shared-components/profile/LetterAvatar';
import RiskWarning from '../../shared-components/risk-warning-footer/RiskWarning';

import queryString from 'query-string';

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';

import firebase from '../../firebase/firebaseApp';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import * as colors from '../../values/colors';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';
import {AUTH_SUCCESS} from '../signin/Signin';

const mapStateToProps = state => {
    return {
        MediaQueryState: state.MediaQueryState,

        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        user: state.auth.user,
        userLoaded: state.auth.userLoaded,
        groupsUserIsIn: state.auth.groupsUserIsIn,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,

    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        //--------------------------------------------------------------------------------------------------------------
    }
};

class PledgePage extends Component {

    constructor(props) {
        super(props);

        this.firebaseAuth = firebase.auth();
        this.firebaseDB = firebase.database();

        this.state = {
            loadingData: false,
            dataLoaded: false,

            project: null,
            projectLoaded: false,

            pledges: [],
            pledgesLoaded: false,

            currentPledge: null,
            currentPledgeLoaded: false,

            pledgeAmount: '',
            pledgeButtonClick: false,

            pledgeConfirmationDialogOpen: false,

            displayThankYou: false
        }
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            user,
            userLoaded,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork,
        } = this.props;

        const {
            loadingData,
            dataLoaded
        } = this.state;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.PLEDGE : ROUTES.PLEDGE_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (userLoaded) {
                if (!user) {
                    this.setState({
                        projectLoaded: true,
                        pledgesLoaded: true,
                        currentPledgeLoaded: true,
                        loadingData: false,
                        dataLoaded: true
                    });
                    return;
                }


                if (!loadingData && !dataLoaded) {
                    this.loadData();
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            user,
            userLoaded,

            loadAngelNetwork,
        } = this.props;

        const {
            loadingData,
            dataLoaded
        } = this.state;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (userLoaded) {
                if (!user) {
                    this.setState({
                        projectLoaded: true,
                        pledgesLoaded: true,
                        currentPledgeLoaded: true,
                        loadingData: false,
                        dataLoaded: true
                    });
                    return;
                }

                if (!loadingData && !dataLoaded) {
                    this.loadData();
                }
            }
        }
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            user
        } = this.props;

        // load params from query string
        const params = queryString.parse(this.props.location.search);

        this.setState({
            loadingData: true,
            dataLoaded: false
        });

        // load the project
        realtimeDBUtils
            .loadAParticularProject(params.project)
            .then(project => {
                this.setState({
                    project: project,
                    projectLoaded: true
                });

                // load pledges
                realtimeDBUtils
                    .loadPledges(project.id, user.id, realtimeDBUtils.LOAD_PLEDGES_ORDER_BY_INVESTOR)
                    .then(pledges => {

                        this.setState({
                            pledges: pledges,
                            pledgesLoaded: true,
                            loadingData: false
                        });

                        let userPledgeIndex = pledges.findIndex(pledge => pledge.investorID === user.id && project.id === pledge.projectID && pledge.amount !== '');
                        if (userPledgeIndex !== -1) {
                            this.setState({
                                pledgeAmount: pledges[userPledgeIndex].amount,
                                currentPledge: pledges[userPledgeIndex],
                                currentPledgeLoaded: true
                            });
                        } else {
                            this.setState({
                                currentPledgeLoaded: true
                            });
                        }
                        this.setState({
                            loadingData: false,
                            dataLoaded: true
                        });
                    })
                    .catch(error => {
                        this.setState({
                            pledgesLoaded: true,
                            currentPledgeLoaded: true,
                            loadingData: false,
                            dataLoaded: true
                        });
                    });
            })
            .catch(error => {
                this.setState({
                    projectLoaded: true,
                    pledgesLoaded: true,
                    currentPledgeLoaded: true,
                    loadingData: false,
                    dataLoaded: true
                });
            });
    };

    /**
     * Handle text changed
     */
    handleTextChanged = event => {
        const name = event.target.name;
        const value = event.target.value;

        if (name === "pledgeAmount") {
            if (value.trim().length > 0) {
                this.setState({
                    [name]: parseFloat(value),
                    pledgeButtonClick: false
                });
                return;
            }
        }

        this.setState({
            [name]: value
        });
    };

    /**
     * When the user clicks on the Pledge button
     */
    handlePledgeClick = () => {
        const {
            pledgeAmount
        } = this.state;

        this.setState({
            pledgeButtonClick: true
        });

        if (pledgeAmount.length === 0 || parseFloat(pledgeAmount) < 0) {
            return;
        }

        this.setState({
            pledgeConfirmationDialogOpen: true
        });
    };

    /**
     * When the user clicks on the Cancel pledge button
     */
    handleCancelPledge = () => {
        const {
            groupUserName
        } = this.props;

        const {
            project
        } = this.state;

        let currentPledgeObject = JSON.parse(JSON.stringify(this.state.currentPledge));

        if (!currentPledgeObject) {
            return;
        }

        currentPledgeObject.investor = null;

        let newPledgeObject = JSON.parse(JSON.stringify(currentPledgeObject));
        newPledgeObject.amount = '';
        newPledgeObject.status = DB_CONST.EDIT_A_PLEDGE;
        newPledgeObject.date = utils.getCurrentDate();

        this.firebaseDB
            .ref(DB_CONST.PLEDGES_CHILD)
            .child(newPledgeObject.id)
            .update(newPledgeObject)
            .then(() => {
                // track investor'activity
                realtimeDBUtils
                    .trackActivity({
                        userID: newPledgeObject.investorID,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.PLEDGES_CHILD,
                        interactedObjectID: newPledgeObject.id,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CANCELLED_PLEDGE.replace("%project%", project.projectName),
                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                        value: {
                            before: currentPledgeObject,
                            after: newPledgeObject
                        }
                    });

                this.props.history.push({
                    pathname:
                        groupUserName
                            ?
                            ROUTES.PROJECT_DETAILS.replace(":groupUserName", groupUserName).replace(":projectID", project.id)
                            :
                            ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                });
            });
    };

    /**
     * Handle close pledge confirmation dialog
     */
    handleClosePledgeConfirmationDialog = () => {
        this.setState({
            pledgeConfirmationDialogOpen: false
        });
    };

    /**
     * When the Confirm button is clicked to confirm the pledge
     */
    handlePledgeConfirmClick = () => {
        const {
            groupProperties,
            user
        } = this.props;

        const {
            project,
            pledgeAmount
        } = this.state;

        let currentPledgeObject = JSON.parse(JSON.stringify(this.state.currentPledge));
        if (currentPledgeObject) {
            currentPledgeObject.investor = null;
        }

        this.handleClosePledgeConfirmationDialog();

        let newPledgeObject = {
            anid: groupProperties.anid,
            projectID: project.id,
            investorID: user.id,
            amount: parseFloat(pledgeAmount),
            date: utils.getCurrentDate()
        };

        // investor hasn't pledged before
        if (!currentPledgeObject) {

            let existingPledgeWithBlankAmount = null;

            // if the currentPledge is null
            // it doesn't mean that the investor has not pledged this project
            // because it is possible that the investor did pledge this project before
            // they cancelled their pledge. Once they did that, the pledge amount was set to ""
            // as a result, the currentPledge object is still null since the loadPledges function
            // will ignore all the pledges with blank amount.
            // DUE TO THIS SITUATION, WE NEED TO DOUBLE CHECK ALL THE PLEDGES MADE BY THIS INVESTOR
            // TO ENSURE WE UPDATE THE CORRECT NODE.
            this.firebaseDB
                .ref(DB_CONST.PLEDGES_CHILD)
                .orderByChild('investorID')
                .equalTo(user.id)
                .once('value', snapshots => {

                    let addNewPledge = false;

                    // no pledges for this investor in the database
                    if (!snapshots
                        || !snapshots.exists()
                        || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                    ) {
                        // there are no pledges made by this investor
                        // so this pledges is a new one
                        addNewPledge = true;
                    }
                    // pledge does exist with amount = ""
                    else {
                        snapshots.forEach(snapshot => {
                            let pledgeObj = snapshot.val();
                            // check if the pledge is for this project
                            if (pledgeObj.projectID === project.id) {
                                // we don't need to check blank amount here
                                // because if the amount is not blank, it has already been assigned to
                                // the currentPledge object, which made it not null
                                existingPledgeWithBlankAmount = pledgeObj;
                            }
                        });

                        // after checking all the pledges made by this investor,
                        // no pledges are for this project
                        if (existingPledgeWithBlankAmount === null) {
                            // so this pledge for this project is a new one
                            addNewPledge = true;
                        }
                        // there exists a pledge with blank amount form this investor for this project
                        else {
                            newPledgeObject.id = existingPledgeWithBlankAmount.id;
                        }
                    }

                    // add a new pledge
                    if (addNewPledge) {
                        const newPledgeID = this.firebaseDB
                            .ref(DB_CONST.PLEDGES_CHILD)
                            .push()
                            .key;

                        newPledgeObject.id = newPledgeID;
                        newPledgeObject.status = DB_CONST.MAKE_A_NEW_PLEDGE;

                        this.firebaseDB
                            .ref(DB_CONST.PLEDGES_CHILD)
                            .child(newPledgeID)
                            .set(newPledgeObject)
                            .then(() => {
                                // track investor'activity
                                realtimeDBUtils
                                    .trackActivity({
                                        userID: user.id,
                                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                        interactedObjectLocation: DB_CONST.PLEDGES_CHILD,
                                        interactedObjectID: newPledgeID,
                                        activitySummary:
                                            existingPledgeWithBlankAmount !== null
                                                ?
                                                realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_PLEDGE.replace("%project%", project.projectName)
                                                :
                                                realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_MADE_NEW_PLEDGE.replace("%project%", project.projectName)
                                        ,
                                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                                        value:
                                            existingPledgeWithBlankAmount !== null
                                                ?
                                                {
                                                    before: existingPledgeWithBlankAmount,
                                                    after: newPledgeObject
                                                }
                                                :
                                                newPledgeObject
                                    });

                                // send a notification to notify the issuer
                                realtimeDBUtils
                                    .sendNotification({
                                        title: "An investor has pledged your investment opportunity",
                                        message: "Congratulations! Your investment opportunity has been pledged by an investor. Go and check your progress.",
                                        userID: project.issuerID,
                                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                                    })
                                    .then(() => {
                                        this.setState({
                                            currentPledge: newPledgeObject,
                                            displayThankYou: true
                                        });
                                    })
                                    .catch(error => {
                                        // handle error
                                    });
                            });
                    }
                    // update an existing pledge
                    else {
                        newPledgeObject.status = DB_CONST.EDIT_A_PLEDGE;

                        this.firebaseDB
                            .ref(DB_CONST.PLEDGES_CHILD)
                            .child(newPledgeObject.id)
                            .update(newPledgeObject)
                            .then(() => {
                                // track investor'activity
                                realtimeDBUtils
                                    .trackActivity({
                                        userID: user.id,
                                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                        interactedObjectLocation: DB_CONST.PLEDGES_CHILD,
                                        interactedObjectID: newPledgeObject.id,
                                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_PLEDGE.replace("%project%", project.projectName),
                                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                                        value: {
                                            before: currentPledgeObject,
                                            after: newPledgeObject
                                        }
                                    });

                                this.setState({
                                    currentPledge: newPledgeObject,
                                    displayThankYou: true
                                });
                            });
                    }
                });
        }
        // investor is going to update their pledge
        else {
            newPledgeObject.id = currentPledgeObject.id;
            newPledgeObject.status = DB_CONST.EDIT_A_PLEDGE;

            this.firebaseDB
                .ref(DB_CONST.PLEDGES_CHILD)
                .child(newPledgeObject.id)
                .update(newPledgeObject)
                .then(() => {
                    // track investor'activity
                    realtimeDBUtils
                        .trackActivity({
                            userID: user.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.PLEDGES_CHILD,
                            interactedObjectID: newPledgeObject.id,
                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_PLEDGE.replace("%project%", project.projectName),
                            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                            value: {
                                before: currentPledgeObject,
                                after: newPledgeObject
                            }
                        });

                    this.setState({
                        currentPledge: newPledgeObject,
                        displayThankYou: true
                    });
                });
        }
    };

    render() {
        const {
            MediaQueryState,

            groupUserName,
            groupProperties,
            groupPropertiesLoaded,
            shouldLoadOtherData,

            authStatus,
            authenticating,
            user,
            userLoaded,
            groupsUserIsIn,

            clubAttributes,
            clubAttributesLoaded
        } = this.props;

        const {
            project,
            projectLoaded,

            currentPledge,
            currentPledgeLoaded,

            pledgesLoaded,

            pledgeAmount,
            pledgeButtonClick,

            pledgeConfirmationDialogOpen,

            displayThankYou
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

        // user's profile has not been loaded yet
        if (authenticating
            || !userLoaded
            || !projectLoaded
            || !pledgesLoaded
            || !currentPledgeLoaded
            || !clubAttributesLoaded
            || (userLoaded && user && user.type === DB_CONST.TYPE_INVESTOR)
        ) {
            return (
                <FlexView width="100%" hAlignContent="center" style={{padding: 30}}>
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

        // user is null or not an investor
        // or the project cannot be loaded properly
        // or the project has no PrimaryOffer object
        if (authStatus !== AUTH_SUCCESS
            || !user
            || (user && user.type !== DB_CONST.TYPE_INVESTOR)
            || !project
            || (project && !project.hasOwnProperty('PrimaryOffer'))
        ) {
            return <PageNotFoundWhole/>;
        }

        // project is private
        if (project.visibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE) {
            // user is not in the group that posted the offer
            if (groupsUserIsIn.findIndex(group => group.anid === project.anid) === -1) {
                return <PageNotFoundWhole/>;
            }
        }

        // project is restricted
        if (project.visibility === DB_CONST.PROJECT_VISIBILITY_RESTRICTED) {
            // user is not in the group that posted the offer
            if (groupsUserIsIn.findIndex(group => group.anid === project.anid) === -1) {
                return (
                    <Container fluid style={{padding: 0}}>
                        <Row noGutters>
                            <Col xs={12} sm={12} md={12} lg={12}>
                                <HeaderWithoutDesc/>
                            </Col>
                            <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                                <FlexView column hAlignContent="center" marginTop={40}>
                                    <Typography variant="h5" align="center" paragraph>You are not a member of {project.group.displayName}, so you cannot pledge this offer. Join {project.group.displayName} to pledge.</Typography>
                                    <NavLink
                                        to={
                                            groupUserName
                                                ?
                                                ROUTES.VIEW_GROUP_DETAILS.replace(":groupUserName", groupUserName).replace(":groupID", project.group.anid)
                                                :
                                                ROUTES.VIEW_GROUP_DETAILS_INVEST_WEST_SUPER.replace(":groupID", project.group.anid)
                                        }
                                    >
                                        <Typography variant="h6" align="center">Join now</Typography>
                                    </NavLink>
                                </FlexView>
                            </Col>
                        </Row>
                    </Container>
                );
            }
        }

        // offer is no longer available to pledge
        if (project.status !== DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE
            && project.PrimaryOffer.status !== DB_CONST.PRIMARY_OFFER_STATUS_ON_GOING
        ) {
            return (
                <Container fluid style={{padding: 0}}>
                    <Row noGutters>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <HeaderWithoutDesc/>
                        </Col>
                        <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                            <FlexView column hAlignContent="center" marginTop={40}>
                                <Typography variant="h5" align="center" color="error">This offer can't be pledged.</Typography>
                            </FlexView>
                        </Col>
                    </Row>
                </Container>
            );
        }

        let FAQs;
        if (project.group.settings.hasOwnProperty(DB_CONST.PLEDGE_FAQS_CHILD)) {
            FAQs = [...project.group.settings[DB_CONST.PLEDGE_FAQS_CHILD]];
        } else {
            FAQs = [...clubAttributes[DB_CONST.PLEDGE_FAQS_CHILD]];
        }

        return (
            <Container fluid style={{padding: 0}}>
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <HeaderWithoutDesc/>
                    </Col>
                </Row>

                {/** Project's name (header) */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12} style={{paddingTop: 40, paddingBottom: 40, paddingLeft: 20, paddingRight: 20, backgroundColor: colors.kick_starter_background_color}}>
                        <Typography align="center" variant="h4">{project.projectName}</Typography>

                        <FlexView column hAlignContent="center">
                            <NavLink
                                to={
                                    project.hasOwnProperty('createdByGroupAdmin')
                                    && project.createdByGroupAdmin
                                        ?
                                        groupUserName
                                            ?
                                            ROUTES.VIEW_GROUP_DETAILS
                                                .replace(":groupUserName", groupUserName)
                                                .replace(":groupID", project.anid)
                                            :
                                            ROUTES.VIEW_GROUP_DETAILS_INVEST_WEST_SUPER
                                                .replace(":groupID", project.anid)
                                        :
                                        groupUserName
                                            ?
                                            ROUTES.USER_PROFILE
                                                .replace(":groupUserName", groupUserName)
                                                .replace(":userID", project.issuer.id)
                                            :
                                            ROUTES.USER_PROFILE_INVEST_WEST_SUPER
                                                .replace(":userID", project.issuer.id)
                                }
                                target="_blank"
                                className={css(sharedStyles.nav_link_hover, sharedStyles.black_text)}
                            >
                                <Typography align="center" variant="body2" style={{marginTop: 23
                                    }}>
                                    <u>
                                        {
                                            project.hasOwnProperty('createdByGroupAdmin')
                                            && project.createdByGroupAdmin
                                                ?
                                                `by ${project.group.displayName}`
                                                :
                                                `by ${project.issuer.firstName} ${project.issuer.lastName}`
                                        }
                                    </u>
                                </Typography>
                            </NavLink>
                            {
                                project.hasOwnProperty('createdByGroupAdmin')
                                && project.createdByGroupAdmin
                                    ?
                                    null
                                    :
                                    project.issuer.hasOwnProperty('linkedin') && project.issuer.linkedin.trim().length > 0
                                        ?
                                        <a href={project.issuer.linkedin} target="_blank" rel="noopener noreferrer">
                                            <img alt="linkedin_logo" src={require("../../img/linkedin_logo.png").default} style={{width: 64, height: 64}}/>
                                        </a>
                                        :
                                        null
                            }
                        </FlexView>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider/>
                    </Col>
                </Row>

                {
                    displayThankYou
                        ?
                        /** Thank you body - displayed after pledge has been made or edited */
                        <ThankYouComponent
                            groupUserName={groupUserName}
                            user={user}
                            project={project}
                            currentPledge={currentPledge}
                        />
                        :
                        /** Main body with pledge input */
                        <Row noGutters style={{padding: 20,marginBottom: 30}}>
                            <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}} style={{marginTop: 50}}>
                                <Typography variant="h5">
                                    {
                                        !currentPledge
                                            ?
                                            "Support this project"
                                            :
                                            "Update your pledge"
                                    }
                                </Typography>

                                <Paper elevation={0} square className={css(styles.pledge_box)}>
                                    <FlexView column>
                                        <Typography variant="h6">Define your pledge</Typography>

                                        <Row>
                                            <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 12, order: 1}} lg={{span: 9, order: 1}} style={{marginTop: 35}}>
                                                <TextField
                                                    error={(pledgeButtonClick && pledgeAmount.length === 0) || parseFloat(pledgeAmount) < 0}
                                                    name="pledgeAmount"
                                                    value={pledgeAmount}
                                                    type="number"
                                                    fullWidth
                                                    label="Pledge amount"
                                                    variant="outlined"
                                                    onChange={this.handleTextChanged}
                                                    InputProps={{
                                                        startAdornment:
                                                            <InputAdornment position="start">£</InputAdornment>
                                                    }}/>
                                            </Col>

                                            <Col xs={{span: 12, order: 3}} sm={{span: 12, order: 3}} md={{span: 12, order: 3}} lg={{span: 3, order: 2}} style={{marginTop: 35}}>
                                                <FlexView vAlignContent="center" height="100%">
                                                    <Button className={css(sharedStyles.no_text_transform)} size="medium" fullWidth variant="outlined" color="primary" onClick={this.handlePledgeClick}> Pledge</Button>
                                                </FlexView>
                                            </Col>

                                            {
                                                !currentPledge
                                                    ?
                                                    null
                                                    :
                                                    <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} md={{span: 12, order: 2}} lg={{span: 12, order: 3}}>
                                                        <Button style={{marginTop: 14}} variant="text" size="small" color="default" className={css(sharedStyles.no_text_transform)} onClick={this.handleCancelPledge}>Cancel your pledge</Button>
                                                    </Col>
                                            }
                                        </Row>
                                    </FlexView>
                                </Paper>
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}} style={{marginTop: 50}}>
                                <FlexView column>
                                    <Typography variant="body1" align="left" paragraph>
                                        By making a pledge you authorise Student Showcase to share your registered contact
                                        details with the issuer.
                                        The issuer will then contact you with regards to next steps.
                                        Making a pledge is simply an instruction to pass on your contact details.
                                        Making a pledge does not constitute a contractual or investment obligation of
                                        any sort.
                                        <br/><br/>
                                        Student Showcase is not regulated or authorised by the FCA. Student Showcase is for self
                                        certified investors only. If you are in any doubt please seek advice from an
                                        investment professional.
                                        <br/><br/>
                                        Neither Student Showcase nor the Groups offer any guarantees or assurances about the
                                        suitability or viability of any investment opportunity.
                                        <br/><br/>
                                        We rely upon issuers to provide accurate information and complete information.
                                        Investors should undertake their own due diligence into each investment
                                        opportunity.
                                        Please refer to our full&nbsp;
                                        <NavLink to={ROUTES.TERMS_OF_USE} target="_blank" className={css(sharedStyles.nav_link_hover)}>Terms and Conditions</NavLink>
                                        &nbsp;and&nbsp;
                                        <NavLink to={ROUTES.RISK_WARNING} target="_blank" className={css(sharedStyles.nav_link_hover)}>Risk Warning</NavLink>
                                        .
                                    </Typography>
                                </FlexView>

                                <FlexView column marginTop={50}>
                                    <Typography variant="subtitle1" align="left" style={{marginBottom: 14}}>
                                        <b>Frequently asked questions by {project.group.displayName}</b>
                                    </Typography>
                                    {
                                        FAQs.length === 0
                                            ?
                                            null
                                            :
                                            FAQs.map((question, index) => (
                                                <ExpansionPanel key={index} elevation={0} className={css(styles.frequently_asked_question_box)}>
                                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                                        <Typography variant="body2" align="left"><b>{question.question}</b></Typography>
                                                    </ExpansionPanelSummary>

                                                    <ExpansionPanelDetails>
                                                        <Typography variant="body2" align="left">{question.answer}</Typography>
                                                    </ExpansionPanelDetails>
                                                </ExpansionPanel>
                                            ))
                                    }
                                </FlexView>
                            </Col>
                        </Row>
                }

                {
                    displayThankYou
                        ?
                        null
                        :
                        <Row noGutters>
                            <Col xs={12} sm={12} md={12} lg={12} style={{marginTop: 100, position: MediaQueryState.isMobile || !MediaQueryState.minHeightScreen ? "relative" : "fixed", bottom: 0, zIndex: 10}}>
                                <RiskWarning/>
                            </Col>
                        </Row>
                }

                <ConfirmationDialog open={pledgeConfirmationDialogOpen} pledgeAmount={pledgeAmount} project={project} onClose={this.handleClosePledgeConfirmationDialog} onConfirmClick={this.handlePledgeConfirmClick}/>
            </Container>
        );
    }
}

/**
 * Pledge confirmation dialog
 */
class ConfirmationDialog extends Component {

    onClose = () => {
        this.props.onClose();
    };

    onConfirmClick = () => {
        this.props.onConfirmClick();
    };

    render() {

        const {
            open,
            pledgeAmount,
            project
        } = this.props;

        if (!project || pledgeAmount === '') {
            return null;
        }

        return (
            <Dialog open={open} onClose={this.onClose}>
                <DialogTitle>Pledge confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            `Are you sure you want to pledge £${Number(pledgeAmount).toLocaleString()}?`
                        }
                    </DialogContentText>
                    <DialogContentText>
                        <u><b>Note:</b></u> You can change or cancel your pledge anytime
                        before {utils.dateInReadableFormat(project.PrimaryOffer.expiredDate)}.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onClose}>Cancel</Button>
                    <Button color="primary" onClick={this.onConfirmClick}>Confirm</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

/**
 * Thank you component - displayed after pledge has been made or edited
 */
class ThankYouComponent extends Component {
    render() {
        const {
            groupUserName,
            user,
            project,
            currentPledge
        } = this.props;

        if (!project) {
            return null;
        }

        return (
            <Row noGutters style={{backgroundColor: colors.kick_starter_gray_background, paddingTop: 20, paddingBottom: 20, paddingLeft: 10, paddingRight: 10}}>
                <Col xs={12} sm={12} md={{offset: 2, span: 8}} lg={{offset: 3, span: 6}}>
                    <Row noGutters>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <FlexView column hAlignContent="center">
                                {
                                    !project.issuer.profilePicture
                                    || (project.issuer.profilePicture && project.issuer.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed')) === -1)
                                        ?
                                        <LetterAvatar firstName={project.issuer.firstName} lastName={project.issuer.lastName} width={120} height={120} textVariant="h5"/>
                                        :
                                        <FlexView width={120} height={120}>
                                            <Image roundedCircle thumbnail src={project.issuer.profilePicture[project.issuer.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed'))].url} style={{width: "100%", maxHeight: 120, objectFit: "contain"}}/>
                                        </FlexView>
                                }

                                <Typography variant="h6" align="left" style={{marginTop: 6}}>{`${project.issuer.firstName} ${project.issuer.lastName}`}</Typography>
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} style={{backgroundColor: colors.white, padding: 18, marginTop: 30}}>
                            <Typography variant="h5" paragraph align="center">
                                {
                                    currentPledge.status === 1
                                        ?
                                        `Thank you, ${user.title} ${user.firstName} ${user.lastName}!`
                                        :
                                        "Thank you, you're all set."
                                }
                            </Typography>
                            <Typography align="center">
                                {
                                    currentPledge.status === 1
                                        ?
                                        `You have pledged £${(Number(currentPledge.amount).toLocaleString())} for this offer.`
                                        :
                                        `You have successfully updated your pledge to £${Number(currentPledge.amount).toLocaleString()}.`
                                }
                            </Typography>
                            <Row noGutters style={{marginTop: 45}}>
                                <Col xs={12} sm={12} md={6} lg={6}>
                                    <FlexView hAlignContent="center">
                                        <Button color="primary" className={css(sharedStyles.no_text_transform, sharedStyles.black_text)} size="large" onClick={() => window.location.reload()}><u>Edit your pledge</u></Button>
                                    </FlexView>
                                </Col>
                                <Col xs={12} sm={12} md={6} lg={6}>
                                    <FlexView hAlignContent="center">
                                        <Button className={css(sharedStyles.no_text_transform, sharedStyles.black_text)} size="large"
                                            href={
                                                groupUserName
                                                    ?
                                                    ROUTES.PROJECT_DETAILS.replace(":groupUserName", groupUserName).replace(":projectID", project.id)
                                                    :
                                                    ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                                            }><u>Go back to this offer</u></Button>
                                    </FlexView>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PledgePage);

const styles = StyleSheet.create({
    pledge_box: {
        border: `1px solid ${colors.gray_300}`,
        padding: 30,
        marginTop: 30
    },

    frequently_asked_question_box: {
        border: `1px solid ${colors.gray_300}`,
        marginTop: 12
    }
});