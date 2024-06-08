import React, {Component} from "react";
import FlexView from "react-flexview/lib";
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {css} from "aphrodite";
import {Col, Container, Row} from "react-bootstrap";
import {HashLoader} from "react-spinners";
import {NavLink} from "react-router-dom";

import {connect} from "react-redux";
import * as manageGroupFromParamsActions from "../../redux-store/actions/manageGroupFromParamsActions";
import * as authActions from "../../redux-store/actions/authActions";
import PageNotFoundWhole from "../../shared-components/page-not-found/PageNotFoundWhole";
import UserNotAbleToRegisterOrJoin from "./components/UserNotAbleToRegisterOrJoin";

import * as colors from "../../values/colors";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as DB_CONST from "../../firebase/databaseConsts";
import firebase from "../../firebase/firebaseApp";
import * as utils from "../../utils/utils";
import * as ROUTES from "../../router/routes";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {ApiRoutes} from "../../api/Api.tsx";
import Api from "../../api/Api";

const ERROR_NONE = 0;
const ERROR_MISSING_FIELD = 1;
const ERROR_INVALID_EMAIL_ADDRESS = 2;
const ERROR_PASSWORDS_NOT_MATCH = 3;
const ERROR_PASSWORD_NOT_STRONG_ENOUGH = 4;
const ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH = 5;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        clubAttributes: state.manageClubAttributes.clubAttributes
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        togglePreventValidatingUserWhenSigningUp: (shouldPrevent) => dispatch(authActions.togglePreventValidatingUserWhenSigningUp(shouldPrevent)),
        getUserProfileAndValidateUser: (uid) => dispatch(authActions.getUserProfileAndValidateUser(uid))
    }
};

class Signup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            dataLoaded: false,
            loadingData: false,

            publicRegistration: false,
            publicRegistrationType: null,
            publicRegistrationUser: null,

            // the invited user object that is loaded using the invited id specified in the URL
            invitedUserWithSpecifiedInvitedID: null,
            // the invited users array that is loaded using the email obtained from the invited user object above
            invitedUsersWithTheEmailObtained: null,

            userWelcomeName: '',

            password: '',
            confirmPassword: '',
            marketingPreferencesChecked: false,

            // check if the Create account (register of new user) button
            // or the Join (registered user to join in another angel network) button is pressed
            submitted: false,
            // process the Signup or the Join event
            processingSubmission: false,
            // error status
            errorStatus: ERROR_NONE
        };

        this.firebaseAuth = firebase.auth();
        this.firebaseDB = firebase.database();
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
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.SIGN_UP : ROUTES.SIGN_UP_INVEST_WEST_SUPER, match.path);

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
            dataLoaded,
            loadingData
        } = this.state;

        const invitedID = this.props.match.params.id;

        if (!dataLoaded && !loadingData) {
            if (invitedID === "investor" || invitedID === "issuer") {
                this.setState({
                    dataLoaded: true,
                    loadingData: false,
                    publicRegistration: true,
                    publicRegistrationType:
                        invitedID === "investor"
                            ?
                            DB_CONST.TYPE_INVESTOR
                            :
                            invitedID === "issuer"
                                ?
                                DB_CONST.TYPE_ISSUER
                                :
                                null
                    ,
                    publicRegistrationUser: {
                        email: '',
                        confirmedEmail: '',
                        title: DB_CONST.USER_TITLES[0],
                        firstName: '',
                        lastName: ''
                    }
                });
            } else {
                this.setState({
                    loadingData: true
                });

                // load the invited user that is specified by the invited id in the URL
                realtimeDBUtils
                    .getInvitedUserBasedOnIDOrEmail(invitedID, realtimeDBUtils.GET_INVITED_USER_BASED_ON_INVITED_ID)
                    .then(invitedUsersByInvitedID => {
                        // set the obtained invited user to state
                        this.setState({
                            invitedUserWithSpecifiedInvitedID: invitedUsersByInvitedID[0],
                            userWelcomeName: invitedUsersByInvitedID[0].firstName
                        });

                        // load the invited users that share the same email
                        // --> check if the user has been invited by other angel networks
                        realtimeDBUtils
                            .getInvitedUserBasedOnIDOrEmail(invitedUsersByInvitedID[0].email, realtimeDBUtils.GET_INVITED_USER_BASED_ON_EMAIL)
                            .then(invitedUsersByEmail => {
                                // set the obtained invited users to state
                                this.setState({
                                    invitedUsersWithTheEmailObtained: invitedUsersByEmail,
                                    dataLoaded: true,
                                    loadingData: false
                                });
                            })
                            .catch(error => {
                                // no invited users found with the email specified
                                // --> the user was only invited by one angel network
                                this.setState({
                                    dataLoaded: true,
                                    loadingData: false
                                });
                            });
                    })
                    .catch(error => {
                        // no invited user found with the invited id
                        this.setState({
                            dataLoaded: true,
                            loadingData: false
                        });
                    });
            }
        }
    };

    /**
     * Sign up for new user functions
     */

    /**
     * Handle when input changed in the SignupForNewUser component
     *
     * @param event
     */
    handleSignupForNewUserInputChanged = event => {
        const {
            publicRegistration
        } = this.state;

        const target = event.target;
        const name = target.name;

        switch (target.type) {
            case 'text':
                if (!publicRegistration) {
                    this.setState({
                        invitedUserWithSpecifiedInvitedID: {
                            ...this.state.invitedUserWithSpecifiedInvitedID,
                            [name]: target.value
                        }
                    });
                } else {
                    this.setState({
                        publicRegistrationUser: {
                            ...this.state.publicRegistrationUser,
                            [name]: target.value
                        }
                    });
                }
                return;
            case 'password':
                this.setState({
                    [name]: target.value
                });
                return;
            case 'checkbox':
                this.setState({
                    [name]: target.checked
                });
                return;
            default:
                if (!publicRegistration) {
                    this.setState({
                        invitedUserWithSpecifiedInvitedID: {
                            ...this.state.invitedUserWithSpecifiedInvitedID,
                            [name]: target.value
                        }
                    });
                } else {
                    this.setState({
                        publicRegistrationUser: {
                            ...this.state.publicRegistrationUser,
                            [name]: target.value
                        }
                    });
                }
                return;
        }
    };

    /**
     * Handle when the Create account button is presses
     */
    handleSignupForNewUserClick = async () => {
        const {
            groupUserName,
            groupProperties
        } = this.props;

        const {
            publicRegistration,
            publicRegistrationType,
            publicRegistrationUser,

            invitedUserWithSpecifiedInvitedID,
            password,
            confirmPassword,
            marketingPreferencesChecked
        } = this.state;

        this.setState({
            submitted: true
        });

        if ((!publicRegistration
                && invitedUserWithSpecifiedInvitedID !== null
                && invitedUserWithSpecifiedInvitedID !== undefined
                && invitedUserWithSpecifiedInvitedID.title !== DB_CONST.USER_TITLES[0]
                && invitedUserWithSpecifiedInvitedID.firstName.trim().length > 0
                && invitedUserWithSpecifiedInvitedID.lastName.trim().length > 0
                && invitedUserWithSpecifiedInvitedID.email.trim().length > 0

                && password.trim().length > 0
                && confirmPassword.trim().length > 0
            )
            || (
                publicRegistration
                && publicRegistrationUser.title !== DB_CONST.USER_TITLES[0]
                && publicRegistrationUser.firstName.trim().length > 0
                && publicRegistrationUser.lastName.trim().length > 0
                && publicRegistrationUser.email.trim().length > 0
                && publicRegistrationUser.confirmedEmail.trim().length > 0

                && password.trim().length > 0
                && confirmPassword.trim().length > 0
            )
        ) {
            // public registration
            if (publicRegistration) {
                if (publicRegistrationUser.email.trim().toLowerCase() !== publicRegistrationUser.confirmedEmail.trim().toLowerCase()) {
                    this.setState({
                        errorStatus: ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH
                    });
                    return;
                }

                // check if email is valid
                if (!utils.isValidEmailAddress(publicRegistrationUser.email)) {
                    this.setState({
                        errorStatus: ERROR_INVALID_EMAIL_ADDRESS
                    });
                    return;
                }
            }

            // check if email is valid for non-public registration
            if (!publicRegistration
                && invitedUserWithSpecifiedInvitedID
                && !utils.isValidEmailAddress(invitedUserWithSpecifiedInvitedID.email)
            ) {
                this.setState({
                    errorStatus: ERROR_INVALID_EMAIL_ADDRESS
                });
                return;
            }

            // check if passwords are matched
            if (password !== confirmPassword) {
                this.setState({
                    errorStatus: ERROR_PASSWORDS_NOT_MATCH
                });
                return;
            }

            // check the strength of password
            const passwordStrength = utils.checkPasswordStrength(password);
            if (passwordStrength === utils.PASSWORD_VERY_WEAK) {
                this.setState({
                    errorStatus: ERROR_PASSWORD_NOT_STRONG_ENOUGH
                });
                return;
            }

            this.setState({
                submitted: false,
                processingSubmission: true,
                errorStatus: ERROR_NONE
            });

            let data = {};

            // public registration
            if (publicRegistration) {
                data = {
                    isPublicRegistration: true,
                    userProfile: {
                        id: "",
                        email: publicRegistrationUser.email,
                        firstName: publicRegistrationUser.firstName,
                        lastName: publicRegistrationUser.lastName,
                        title: publicRegistrationUser.title,
                        type: publicRegistrationType
                    },
                    password: password,
                    groupID: groupProperties.anid
                };
            }
            // register via invitation email
            else {
                // ensure invitedUserWithSpecifiedInvitedID !== null
                if (invitedUserWithSpecifiedInvitedID) {
                    data = {
                        isPublicRegistration: false,
                        invitedUserID: invitedUserWithSpecifiedInvitedID.id,
                        userProfile: {
                            id: "",
                            email: invitedUserWithSpecifiedInvitedID.email,
                            firstName: invitedUserWithSpecifiedInvitedID.firstName,
                            lastName: invitedUserWithSpecifiedInvitedID.lastName,
                            title: invitedUserWithSpecifiedInvitedID.title,
                            type: invitedUserWithSpecifiedInvitedID.type
                        },
                        password: password,
                        groupID: invitedUserWithSpecifiedInvitedID.Invitor.anid
                    };
                }
            }

            try {
                await new Api().request(
                    "post",
                    ApiRoutes.createUser,
                    {
                        queryParameters: null,
                        requestBody: data
                    }
                );

                this.firebaseAuth
                    .signInWithEmailAndPassword(
                        !publicRegistration
                            ?
                            invitedUserWithSpecifiedInvitedID.email.trim().toLowerCase()
                            :
                            publicRegistrationUser.email.trim().toLowerCase()
                        ,
                        password
                    )
                    .then(auth => {
                        const id = this.firebaseDB
                            .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                            .push()
                            .key;
                        // create a node in MarketingPreferences to keep track of the user's preferences
                        this.firebaseDB
                            .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                            .child(id)
                            .set({
                                id,
                                userID: auth.user.uid,
                                date: utils.getCurrentDate(),
                                accepted: marketingPreferencesChecked
                            })
                            .then(() => {
                                if (!publicRegistration) {
                                    if (invitedUserWithSpecifiedInvitedID.type === DB_CONST.TYPE_INVESTOR) {
                                        this.props.history.push(
                                            groupUserName
                                                ?
                                                `${ROUTES.DASHBOARD_INVESTOR.replace(":groupUserName", groupUserName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    } else {
                                        this.props.history.push(
                                            groupUserName
                                                ?
                                                `${ROUTES.DASHBOARD_ISSUER.replace(":groupUserName", groupUserName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_ISSUER_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    }
                                } else {
                                    if (publicRegistrationType === DB_CONST.TYPE_INVESTOR) {
                                        this.props.history.push(
                                            groupUserName
                                                ?
                                                `${ROUTES.DASHBOARD_INVESTOR.replace(":groupUserName", groupUserName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    } else {
                                        this.props.history.push(
                                            groupUserName
                                                ?
                                                `${ROUTES.DASHBOARD_ISSUER.replace(":groupUserName", groupUserName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_ISSUER_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    }
                                }
                            });
                    });
            } catch (error) {
                this.setState({
                    errorStatus: error.toString(),
                    processingSubmission: false
                });
            }
        } else {
            this.setState({
                errorStatus: ERROR_MISSING_FIELD
            });
        }
    };

    /**
     * ///--------------------------------------------------------------------------------------------------------------
     */

    /**
     * Join functions
     */

    /**
     * Handle when the user clicks on the Decline button
     */
    handleDeclineToJoinTheAngelNetwork = () => {
        const {
            invitedUserWithSpecifiedInvitedID
        } = this.state;

        this.firebaseDB
            .ref(DB_CONST.INVITED_USERS_CHILD)
            .child(invitedUserWithSpecifiedInvitedID.id)
            .update({
                id: invitedUserWithSpecifiedInvitedID.id,
                status: DB_CONST.INVITED_USER_DECLINED_TO_REGISTER
            })
            .then(() => {
                // don't need to have a listener here, simply update the state after changing the status
                this.setState({
                    invitedUserWithSpecifiedInvitedID: {
                        ...this.state.invitedUserWithSpecifiedInvitedID,
                        status: DB_CONST.INVITED_USER_DECLINED_TO_REGISTER
                    }
                });
            })
            .catch(error => {
                // handle error
            });
    };

    /**
     * Handle when the user clicks on the Agree button
     */
    handleAgreeToJoinTheAngelNetwork = () => {
        const {
            invitedUserWithSpecifiedInvitedID,
            invitedUsersWithTheEmailObtained
        } = this.state;

        const invitedUsersByEmailThatHaveRegisteredIndex = invitedUsersWithTheEmailObtained.findIndex(
            invitedUserByEmail =>
                invitedUserByEmail.id !== invitedUserWithSpecifiedInvitedID.id && invitedUserByEmail.hasOwnProperty('officialUserID'));

        // user has already registered (joined) before
        if (invitedUsersByEmailThatHaveRegisteredIndex !== -1) {
            const userOfficialID = invitedUsersWithTheEmailObtained[invitedUsersByEmailThatHaveRegisteredIndex].id;
            const updatedInvitedUser = {
                id: invitedUserWithSpecifiedInvitedID.id,
                email: invitedUserWithSpecifiedInvitedID.email.toLowerCase(),
                status: DB_CONST.INVITED_USER_STATUS_ACTIVE,
                officialUserID: userOfficialID,
                joinedDate: utils.getCurrentDate(),
                type: invitedUserWithSpecifiedInvitedID.type,
                invitedBy: invitedUserWithSpecifiedInvitedID.invitedBy,
                invitedDate: invitedUserWithSpecifiedInvitedID.invitedDate
            };

            this.firebaseDB
                .ref(DB_CONST.INVITED_USERS_CHILD)
                .child(invitedUserWithSpecifiedInvitedID.id)
                .update(updatedInvitedUser)
                .then(() => {
                    // don't need to have a listener here, simply update the state after changing the status
                    this.setState({
                        invitedUserWithSpecifiedInvitedID: {
                            ...this.state.invitedUserWithSpecifiedInvitedID,
                            status: DB_CONST.INVITED_USER_DECLINED_TO_REGISTER
                        }
                    });
                })
                .catch(error => {
                    // handle error
                });
        }
        // user has not registered (joined) before
        else {
            // do nothing because if the user has not registered before, the register form should show up
        }
    };

    /**
     * ///--------------------------------------------------------------------------------------------------------------
     */

    render() {
        const {
            groupUserName,
            groupProperties,
            groupPropertiesLoaded,
            shouldLoadOtherData
        } = this.props;

        const {
            dataLoaded,
            loadingData,

            publicRegistration,
            publicRegistrationType,
            publicRegistrationUser,

            invitedUserWithSpecifiedInvitedID,
            invitedUsersWithTheEmailObtained,

            userWelcomeName,

            password,
            confirmPassword,
            marketingPreferencesChecked,

            submitted,
            processingSubmission,
            errorStatus
        } = this.state;

        if (!groupPropertiesLoaded) {
            return (
                <FlexView
                    marginTop={30}
                    hAlignContent="center"
                >
                    <HashLoader
                        color={colors.primaryColor}
                    />
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (loadingData && !dataLoaded) {
            return (
                <FlexView
                    marginTop={30}
                    hAlignContent="center"
                >
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

        // groupProperties = null means super admin site,
        // the user must not be allowed to signup on super admin site
        // also, if the invitedID is not relating to any invited user in the db, display Page not found.
        if (!groupProperties || (!publicRegistration && !invitedUserWithSpecifiedInvitedID)) {
            return <PageNotFoundWhole/>;
        }

        // if the URL is not for public registration,
        // check if the user is opening the page under the correct group url.
        // if not, display Page not found.
        if (!publicRegistration
            && invitedUserWithSpecifiedInvitedID.invitedBy !== groupProperties.anid
        ) {
            return <PageNotFoundWhole/>;
        }

        // the invited user of this angel network has already registered
        if (!publicRegistration
            && (invitedUserWithSpecifiedInvitedID.hasOwnProperty('officialUserID')
                || invitedUserWithSpecifiedInvitedID.status !== DB_CONST.INVITED_USER_NOT_REGISTERED
            )
        ) {
            return (
                <UserNotAbleToRegisterOrJoin
                    invitedUser={invitedUserWithSpecifiedInvitedID}
                />
            );
        }

        let invitedUsersByEmailThatHaveRegistered = [];

        if (!publicRegistration) {
            invitedUsersByEmailThatHaveRegistered = invitedUsersWithTheEmailObtained.filter(
                invitedUserByEmail =>
                    invitedUserByEmail.id !== invitedUserWithSpecifiedInvitedID.id && invitedUserByEmail.hasOwnProperty('officialUserID'));
        }

        return (
            <Container
                fluid
                style={{
                    padding: 0,
                    height: "100%",
                    minHeight: "100vh",
                    backgroundColor: colors.gray_200,
                    overflow: "auto"
                }}
            >
                {
                    // the invited user has not joined any angel network before
                    invitedUsersByEmailThatHaveRegistered.length === 0
                        ?
                        <SignupForNewUser
                            publicRegistration={publicRegistration}
                            publicRegistrationType={publicRegistrationType}
                            publicRegistrationUser={publicRegistrationUser}
                            groupUserName={groupUserName}
                            groupProperties={groupProperties}
                            invitedUser={invitedUserWithSpecifiedInvitedID}
                            userWelcomeName={userWelcomeName}
                            password={password}
                            confirmPassword={confirmPassword}
                            marketingPreferencesChecked={marketingPreferencesChecked}
                            submitted={submitted}
                            processingSubmission={processingSubmission}
                            errorStatus={errorStatus}
                            handleInputChanged={this.handleSignupForNewUserInputChanged}
                            handleSignupClick={this.handleSignupForNewUserClick}
                        />
                        :
                        <SignupForRegisteredUser
                            groupProperties={groupProperties}
                            invitedUser={invitedUserWithSpecifiedInvitedID}
                            handleDeclineClick={this.handleDeclineToJoinTheAngelNetwork}
                            handleAgreeClick={this.handleAgreeToJoinTheAngelNetwork}
                        />
                }
            </Container>
        );
    }
}

/**
 * Signup component for a new user
 */
class SignupForNewUser extends Component {

    handleInputChanged = event => {
        this.props.handleInputChanged(event);
    };

    handleSignupClick = () => {
        this.props.handleSignupClick();
    };

    render() {
        const {
            publicRegistration,
            publicRegistrationType,
            publicRegistrationUser,

            groupUserName,
            groupProperties,

            invitedUser,

            userWelcomeName,

            password,
            confirmPassword,
            marketingPreferencesChecked,

            submitted,
            processingSubmission
        } = this.props;

        return (
            <Row
                noGutters
            >
                <Col
                    xs={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                    style={{
                        paddingLeft: 18,
                        paddingRight: 18,
                    }}
                >
                    <Paper
                        elevation={0}
                        square
                        className={css(sharedStyles.kick_starter_border_box)}
                        style={{
                            marginTop: 70,
                            marginBottom: 100
                        }}
                    >
                        {/** Registration title */}
                        <FlexView
                            style={{
                                padding: 20,
                                backgroundColor: colors.kick_starter_signup_background
                            }}
                        >
                            <Typography
                                variant="h5"
                            >
                                {
                                    publicRegistrationType === null
                                        ?
                                        "Sign up"
                                        :
                                        publicRegistrationType === DB_CONST.TYPE_INVESTOR
                                            ?
                                            "Investor sign up"
                                            :
                                            "Issuer sign up"
                                }
                            </Typography>
                        </FlexView>

                        {/** Divider */}
                        <Divider/>

                        {/** Welcome text */}
                        <FlexView
                            column
                            style={{
                                padding: 20
                            }}
                        >
                            <Typography
                                align="left"
                                variant="h6"
                                color="primary"
                            >
                                {
                                    !publicRegistration
                                        ?
                                        `Welcome ${userWelcomeName}`
                                        :
                                        `Welcome to ${groupProperties.displayName}`
                                }
                            </Typography>

                            {/** QIB issuer registration text */}
                            {
                                groupUserName === "qib"
                                && (
                                    (publicRegistration && publicRegistrationType === DB_CONST.TYPE_ISSUER)
                                    || (!publicRegistration && invitedUser.type === DB_CONST.TYPE_ISSUER)
                                )
                                    ?
                                    <Typography
                                        align="justify"
                                        variant="body1"
                                        style={{
                                            marginTop: 10,
                                            marginBottom: 20
                                        }}
                                    >
                                        The Quarterly Investment Briefing is an event run by TechSPARK for investors to
                                        network, share and learn. Investment opportunities and one pagers added to this
                                        platform will be shared by the event host verbally and circulated via this
                                        password protected website to c. 300+ investors and enablers of investment
                                        (lawyers, accountants etc.) who have expressed interest in the region and
                                        investment opportunities here.
                                    </Typography>
                                    :
                                    null
                            }

                            {/** Invitation registration text */}
                            {
                                !publicRegistration
                                    ?
                                    <Typography
                                        align="left"
                                        variant="subtitle1"
                                        color="primary"
                                        paragraph
                                        style={{
                                            marginTop: 8
                                        }}
                                    >
                                        You have been invited to join the {invitedUser.Invitor.displayName} members
                                        area.
                                    </Typography>
                                    :
                                    null
                            }

                            {/** Title */}
                            <FormControl
                                required
                                fullWidth
                                error={
                                    !publicRegistration
                                        ?
                                        invitedUser.title === DB_CONST.USER_TITLES[0] && submitted
                                        :
                                        publicRegistrationUser.title === DB_CONST.USER_TITLES[0] && submitted
                                }
                                style={{
                                    marginBottom: 15,
                                    marginTop: 15
                                }}
                            >
                                <InputLabel>
                                    <Typography
                                        variant="body1"
                                        color="primary"
                                    >
                                        Title
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="title"
                                    value={
                                        !publicRegistration
                                            ?
                                            invitedUser.title
                                            :
                                            publicRegistrationUser.title
                                    }
                                    onChange={this.handleInputChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    {
                                        DB_CONST.USER_TITLES.map((title, index) => (
                                            <MenuItem
                                                key={index}
                                                value={title}
                                            >
                                                {title}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>

                            {/** Names */}
                            <FlexView>
                                <FlexView
                                    grow
                                    marginRight={10}
                                >
                                    <TextField
                                        required
                                        label="First name"
                                        name="firstName"
                                        value={
                                            !publicRegistration
                                                ?
                                                invitedUser.firstName
                                                :
                                                publicRegistrationUser.firstName
                                        }
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        error={
                                            !publicRegistration
                                                ?
                                                invitedUser.firstName.length === 0 && submitted
                                                :
                                                publicRegistrationUser.firstName.length === 0 && submitted
                                        }
                                        onChange={this.handleInputChanged}
                                    />
                                </FlexView>
                                <FlexView
                                    grow
                                    marginLeft={10}
                                >
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={
                                            !publicRegistration
                                                ?
                                                invitedUser.lastName
                                                :
                                                publicRegistrationUser.lastName
                                        }
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        error={
                                            !publicRegistration
                                                ?
                                                invitedUser.lastName.length === 0 && submitted
                                                :
                                                publicRegistrationUser.lastName.length === 0 && submitted
                                        }
                                        onChange={this.handleInputChanged}
                                    />
                                </FlexView>
                            </FlexView>

                            {/** Email */}
                            <FormControl
                                fullWidth
                            >
                                <TextField
                                    required
                                    label="Email"
                                    name="email"
                                    value={
                                        !publicRegistration
                                            ?
                                            invitedUser.email
                                            :
                                            publicRegistrationUser.email
                                    }
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    error={
                                        !publicRegistration
                                            ?
                                            invitedUser.email.trim().length === 0 && submitted
                                            :
                                            publicRegistrationUser.email.trim().length === 0 && submitted
                                    }
                                    disabled={!publicRegistration}
                                    onChange={!publicRegistration ? null : this.handleInputChanged}
                                    style={{
                                        marginTop: 10
                                    }}
                                />
                            </FormControl>

                            {
                                !publicRegistration
                                    ?
                                    null
                                    :
                                    // Confirmed email
                                    <FormControl
                                        fullWidth
                                    >
                                        <TextField
                                            required
                                            label="Re-enter email"
                                            name="confirmedEmail"
                                            value={publicRegistrationUser.confirmedEmail}
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            error={publicRegistrationUser.confirmedEmail.trim().length === 0 && submitted}
                                            onChange={!publicRegistration ? null : this.handleInputChanged}
                                            style={{
                                                marginTop: 10
                                            }}
                                        />
                                    </FormControl>
                            }

                            <FlexView
                                column
                                marginTop={20}
                            >
                                {/** Password */}
                                <TextField
                                    required
                                    label="Password"
                                    name="password"
                                    value={password}
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    type="password"
                                    error={password.length === 0 && submitted}
                                    onChange={this.handleInputChanged}
                                    style={{marginTop: 10}}
                                />

                                {/** Confirm */}
                                <TextField
                                    required
                                    label="Confirm password"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    type="password"
                                    error={confirmPassword.length === 0 && submitted}
                                    onChange={this.handleInputChanged}
                                    style={{marginTop: 10}}
                                />
                            </FlexView>

                            <FlexView
                                vAlignContent="center"
                                marginTop={8}
                            >
                                <Checkbox
                                    name="marketingPreferencesChecked"
                                    color="primary"
                                    checked={marketingPreferencesChecked}
                                    onChange={this.handleInputChanged}
                                />
                                <Typography
                                    variant="body2"
                                >
                                    Accept&nbsp;
                                    <NavLink
                                        to={ROUTES.MARKETING_PREFERENCES}
                                        target="_blank"
                                        className={css(sharedStyles.nav_link_hover)}
                                        style={{
                                            color:
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                        }}
                                    >
                                        <b>
                                            marketing preferences
                                        </b>
                                    </NavLink>
                                </Typography>
                            </FlexView>

                            {
                                this.renderError()
                            }

                            {
                                !processingSubmission
                                    ?
                                    null
                                    :
                                    <FlexView
                                        hAlignContent="center"
                                        marginTop={15}
                                    >
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
                            }

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={processingSubmission}
                                onClick={this.handleSignupClick}
                                className={css(sharedStyles.no_text_transform)}
                                style={{
                                    marginTop: 30,
                                    marginBottom: 14
                                }}
                            >
                                {
                                    publicRegistrationType === null
                                        ?
                                        "Create account"
                                        :
                                        publicRegistrationType === DB_CONST.TYPE_INVESTOR
                                            ?
                                            "Create investor account"
                                            :
                                            "Create issuer account"
                                }
                            </Button>

                            <Typography
                                variant="body2"
                                align="center"
                            >
                                By signing up, you agree to our
                                <NavLink
                                    to={ROUTES.TERMS_OF_USE}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Terms of use&nbsp;
                                    </b>
                                </NavLink>
                                and
                                <NavLink
                                    to={ROUTES.PRIVACY_POLICY}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Privacy policy.
                                    </b>
                                </NavLink>
                            </Typography>

                            <FlexView
                                hAlignContent="center"
                                marginTop={20}
                            >
                                <Typography
                                    variant="body1"
                                    align="center"
                                >
                                    Already have an account?&nbsp;&nbsp;
                                    <NavLink
                                        to={
                                            groupUserName
                                                ? ROUTES.SIGN_IN.replace(":groupUserName", groupUserName)
                                                :
                                                ROUTES.SIGN_IN_INVEST_WEST_SUPER
                                        }
                                        className={css(sharedStyles.nav_link_hover)}
                                        style={{
                                            color:
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                        }}
                                    >
                                        Sign in
                                    </NavLink>
                                </Typography>
                            </FlexView>
                        </FlexView>
                    </Paper>
                </Col>
            </Row>
        );
    }

    /**
     * Render error feedback
     *
     * @returns {null|*}
     */
    renderError = () => {
        const {
            errorStatus
        } = this.props;

        let errorMessage = '';

        switch (errorStatus) {
            case ERROR_NONE:
                return null;
            case ERROR_MISSING_FIELD:
                errorMessage = 'Please fill in all the fields.';
                break;
            case ERROR_INVALID_EMAIL_ADDRESS:
                errorMessage = 'Please use a valid email address.';
                break;
            case ERROR_PASSWORDS_NOT_MATCH:
                errorMessage = 'Passwords do not match.';
                break;
            case ERROR_PASSWORD_NOT_STRONG_ENOUGH:
                errorMessage = 'Password is too weak. Please select a stronger password.';
                break;
            case ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH:
                errorMessage = 'Emails do not match.';
                break;
            default:
                errorMessage = errorStatus;
                break;
        }
        return (
            <FlexView
                marginTop={30}
                hAlignContent="center"
                width="100%"
            >
                <Typography
                    variant="body2"
                    align="center"
                    color="error"
                >
                    {errorMessage}
                </Typography>
            </FlexView>
        );
    }
}

/**
 * Signup component (or exactly Join component) for a registered user who is already a member of an angel network
 * but was also invited by other angel networks to join in their groups.
 */
class SignupForRegisteredUser extends Component {

    render() {
        const {
            groupProperties,

            invitedUser,

            handleDeclineClick,
            handleAgreeClick
        } = this.props;

        return (
            <Row
                noGutters
            >
                <Col
                    xs={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                    style={{
                        paddingLeft: 18,
                        paddingRight: 18,
                    }}
                >
                    <Paper
                        elevation={0}
                        square
                        className={css(sharedStyles.kick_starter_border_box)}
                        style={{
                            marginTop: 70,
                            marginBottom: 100
                        }}
                    >
                        <FlexView
                            style={{
                                padding: 20,
                                backgroundColor: colors.kick_starter_signup_background
                            }}
                        >
                            <Typography
                                variant="h5"
                            >
                                Join {invitedUser.Invitor.displayName}
                            </Typography>

                        </FlexView>

                        <Divider/>

                        <FlexView
                            column
                            style={{
                                padding: 20
                            }}
                        >
                            <Typography
                                align="center"
                                variant="h6"
                                style={{
                                    marginTop: 10,
                                    marginBottom: 10
                                }}
                            >
                                {`${invitedUser.Invitor.displayName} invited you to join their group as an ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? 'investor' : 'issuer'}. Do you want to join their group?`}
                            </Typography>

                            <FlexView
                                width="100%"
                                marginTop={25}
                                marginBottom={30}
                            >
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    className={css(sharedStyles.no_text_transform)}
                                    onClick={handleDeclineClick}
                                    style={{
                                        marginRight: 6
                                    }}
                                >
                                    Decline
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    className={css(sharedStyles.no_text_transform)}
                                    onClick={handleAgreeClick}
                                    style={{
                                        marginLeft: 6
                                    }}
                                >
                                    Agree
                                </Button>
                            </FlexView>

                            <Typography
                                variant="body2"
                                align="center"
                            >
                                By clicking Agree, you also agree to our
                                <NavLink
                                    to={ROUTES.TERMS_OF_USE}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Terms of use&nbsp;
                                    </b>
                                </NavLink>
                                and
                                <NavLink
                                    to={ROUTES.PRIVACY_POLICY}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Privacy policy.
                                    </b>
                                </NavLink>
                            </Typography>
                        </FlexView>
                    </Paper>
                </Col>
            </Row>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);