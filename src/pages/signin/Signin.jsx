import React, {Component} from 'react';
import FlexView from 'react-flexview';
import {StyleSheet, css} from 'aphrodite';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    FormControl
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import HashLoader from 'react-spinners/HashLoader';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {NavLink} from 'react-router-dom';

import firebase from '../../firebase/firebaseApp';

import HeaderWithoutDesc from '../../shared-components/nav-bars/HeaderWithoutDesc';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as ROUTES from '../../router/routes';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as authActions from '../../redux-store/actions/authActions';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';

export const INVALID_AUTH_NONE = 0;
export const INVALID_AUTH_USER_NOT_EXIST = 1;
export const INVALID_AUTH_USER_DECLINED_TO_REGISTER = 2;
export const INVALID_AUTH_USER_LEFT = 3;
export const INVALID_AUTH_USER_KICKED_OUT = 4;
export const AUTH_SUCCESS = 5;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        user: state.auth.user,
        userLoaded: state.auth.userLoaded,

        authenticating: state.auth.authenticating,
        authStatus: state.auth.authStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        resetAuthStatus: () => dispatch(authActions.resetAuthStatus()),
        signin: (email, password) => dispatch(authActions.signin(email, password))
    }
};

class Signin extends Component {

    constructor(props) {
        super(props);

        this.firebaseAuth = firebase.auth();
        this.firebaseDB = firebase.database();

        this.state = {
            email: '',
            password: '',
            showPassword: false,

            error: {
                email: false,
                password: false
            },

            resetPassword: {
                resetPasswordDialogOpen: false,
                resetEmail: '',

                resetChecking: false,
                resetError: false,
                resetEmailSent: false
            }
        }
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,
            resetAuthStatus,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork
        } = this.props;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.SIGN_IN : ROUTES.SIGN_IN_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            resetAuthStatus();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,
            groupUserName,

            authenticating,
            user,

            authStatus,

            loadAngelNetwork
        } = this.props;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (!authenticating && authStatus === AUTH_SUCCESS) {
                switch (user.type) {
                    case DB_CONST.TYPE_ADMIN:
                        this.props.history.push({
                            pathname: groupUserName ? ROUTES.ADMIN.replace(":groupUserName", groupUserName) : ROUTES.ADMIN_INVEST_WEST_SUPER,
                            search: '?tab=Home'
                        });
                        return;
                    case DB_CONST.TYPE_INVESTOR:
                        this.props.history.push({
                            pathname: groupUserName ? ROUTES.DASHBOARD_INVESTOR.replace(":groupUserName", groupUserName) : ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER,
                            search: '?tab=Home'
                        });
                        return;
                    case DB_CONST.TYPE_ISSUER:
                        this.props.history.push({
                            pathname: groupUserName ? ROUTES.DASHBOARD_ISSUER.replace(":groupUserName", groupUserName) : ROUTES.DASHBOARD_ISSUER_INVEST_WEST_SUPER,
                            search: '?tab=Home'
                        });
                        return;
                    default:
                        return;
                }
            }
        }
    }

    /**
     * Capture the changes in input fields and update the corresponding states
     */
    handleTextChanged = event => {
        // get the name of the input field
        const name = event.target.name;
        // get the value of the input field
        const value = event.target.value;

        if (name === "resetEmail") {
            this.setState({
                resetPassword: {
                    ...this.state.resetPassword,
                    [name]: value
                }
            });
        } else {
            this.setState({
                [name]: value
            });
        }
    };

    /**
     * Check if pre-conditions met (password and email are filled?) before signing the user in.
     */
    handleSignin = event => {
        event.preventDefault();

        const email = this.state.email.trim().toLowerCase();
        const password = this.state.password;

        this.setState({
            resetPassword: {
                ...this.state.resetPassword,
                resetEmailSent: false
            }
        });

        if (email.length > 0 && password.length > 0) {
            this.setState({
                authStatus: false,
                error: {
                    email: false,
                    password: false
                }
            });

            this.props.signin(email, password);

        } else {
            if (email.length === 0 && password.length === 0) {
                this.setState({
                    authStatus: false,
                    error: {
                        email: true,
                        password: true
                    }
                });
            } else {
                if (email.length === 0 && password.length > 0) {
                    this.setState({
                        authStatus: false,
                        error: {
                            email: true,
                            password: false
                        }
                    });
                } else if (password.length === 0 && email.length > 0) {
                    this.setState({
                        authStatus: false,
                        error: {
                            email: false,
                            password: true
                        }
                    });
                }
            }
        }
    };

    /**
     * Open Reset Password Dialog
     */
    openResetPasswordDialog = () => {
        this.setState({
            resetPassword: {
                ...this.state.resetPassword,
                resetPasswordDialogOpen: true,
                // set resetEmailSent state to false to ensure the message of successfully sent email (if have) will disappear
                resetEmailSent: false
            }
        });
    };

    /**
     * Reset all states relating Reset Password Dialog when the dialog is closed.
     */
    handleCloseResetPasswordDialog = () => {
        this.setState({
            resetPassword: {
                ...this.state.resetPassword,
                resetPasswordDialogOpen: false,
                resetEmail: '',
                resetChecking: false,
                resetError: false,
            }
        });
    };

    /**
     * Send an email reset password to the user.
     */
    handleSendResetEmail = () => {
        const email = this.state.resetPassword.resetEmail;
        this.setState({
            resetPassword: {
                ...this.state.resetPassword,
                // set resetChecking state to true to indicate that the email the user input is being checked
                resetChecking: true
            }
        });
        firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                this.setState({
                    resetPassword: {
                        ...this.state.resetPassword,
                        resetEmailSent: true
                    }
                });
                this.handleCloseResetPasswordDialog();
            })
            .catch(error => {
                this.setState({
                    resetPassword: {
                        ...this.state.resetPassword,
                        resetChecking: false,
                        resetError: true
                    }
                });
            });
    };

    /**
     * Click to show password
     */
    handleClickShowPassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        });
    };

    /**
     * Render UI elements when the signing credentials are being checked
     */
    renderAuthStatus = () => {
        const {
            groupProperties,
            authenticating,
            authStatus
        } = this.props;

        if (this.state.resetPassword.resetEmailSent) {
            return (
                <FlexView
                    width="100%"
                    className={css(styles.reset_email_sent)}
                    marginBottom={20}
                >
                    <Typography
                        variant="body2"
                        align="left"
                    >
                        An email with password reset instructions has been sent to your email address
                    </Typography>
                </FlexView>
            );
        } else {
            if (authenticating) {
                return (
                    <FlexView hAlignContent="center" marginBottom={20} >
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
            } else {
                let errorMsg = '';
                switch (authStatus) {
                    case INVALID_AUTH_NONE:
                        return null;
                    case AUTH_SUCCESS:
                        return null;
                    case INVALID_AUTH_USER_NOT_EXIST:
                        errorMsg = "Email or password is invalid, or you are not a member of this course.";
                        break;
                    case INVALID_AUTH_USER_DECLINED_TO_REGISTER:
                        errorMsg = "You decided not to join this course.";
                        break;
                    case INVALID_AUTH_USER_LEFT:
                        errorMsg = "You have left this course.";
                        break;
                    case INVALID_AUTH_USER_KICKED_OUT:
                        errorMsg = "Unfortunately, you are no longer a member of this course.";
                        break;
                    default:
                        return null;
                }

                return (
                    <FlexView
                        className={css(styles.auth_error)}
                        marginBottom={20}
                    >
                        <Typography
                            variant="body2"
                            align="left"
                        >
                            {errorMsg}
                        </Typography>
                    </FlexView>
                );
            }
        }

    };

    render() {
        const {
            groupProperties,
            groupPropertiesLoaded,
            shouldLoadOtherData
        } = this.props;

        if (!groupPropertiesLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center" >
                    <HashLoader color={colors.primaryColor} />
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        return (
            <Container fluid style={{ padding: 0, position: "fixed", top: 0, height: "100%", overflow: "auto", backgroundColor: colors.gray_200 }} >
                <Row noGutters >

                    <HeaderWithoutDesc/>

                    <Col xs={{span: 12, offset: 0}} md={{span: 6, offset: 3}} lg={{span: 6, offset: 3}} style={{ padding: 20 }}>
                        <FlexView column marginTop={80} marginBottom={40} hAlignContent="center" vAlignContent="center">
                            {/** Sign in card */}
                            <Paper elevation={0} square className={css(sharedStyles.kick_starter_border_box)} style={{padding: 30}}>
                                <form onSubmit={this.handleSignin} >
                                    <FlexView column >
                                        <FlexView column hAlignContent="center" marginBottom={35} >
                                            <Typography variant="h4" align="center" paragraph color="primary">Sign in to your account</Typography>
                                            <Typography variant="body1" align="center">Connecting businesses and investors across the South West of England</Typography>
                                        </FlexView>

                                        {this.renderAuthStatus()}

                                        <FormControl>
                                            <TextField label="Email address" name="email" margin="normal" variant="outlined" error={this.state.error.email} onChange={this.handleTextChanged}/>
                                        </FormControl>

                                        <FormControl>
                                            <TextField
                                                label="Password"
                                                name="password"
                                                type={this.state.showPassword ? "text" : "password"}
                                                margin="normal"
                                                variant="outlined"
                                                error={this.state.error.password}
                                                onChange={this.handleTextChanged}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end" >
                                                            <IconButton edge="end" aria-label="Toggle password visibility" onClick={this.handleClickShowPassword} >
                                                                {
                                                                    !this.state.showPassword
                                                                        ?
                                                                        <VisibilityOff/>
                                                                        :
                                                                        <Visibility/>
                                                                }
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </FormControl>

                                        <FlexView marginTop={35} marginBottom={45} >
                                            <Typography variant="body1" align="left" >
                                                By clicking Sign In, you agree to our
                                                <NavLink to={ROUTES.TERMS_OF_USE} target="_blank" className={css(sharedStyles.nav_link_hover)} style={{ color: !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor }}>
                                                    <b> &nbsp;Terms of use&nbsp; </b>
                                                </NavLink>
                                                and our
                                                <NavLink to={ROUTES.PRIVACY_POLICY} target="_blank" className={css(sharedStyles.nav_link_hover)} style={{ color: !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor }} >
                                                    <b> &nbsp;Privacy policy. </b>
                                                </NavLink>
                                            </Typography>
                                        </FlexView>

                                        <FormControl>
                                            <Button type="submit" variant="contained" color="primary" size="large" className={css(sharedStyles.no_text_transform)}>Sign in</Button>
                                        </FormControl>

                                        <FlexView hAlignContent="center" marginTop={25} onClick={this.openResetPasswordDialog} >
                                            <Typography variant="body1" color="primary" className={css(sharedStyles.nav_link_hover)}>Forgot your password?</Typography>
                                        </FlexView>
                                    </FlexView>
                                </form>
                            </Paper>
                        </FlexView>
                    </Col>
                </Row>

                <ResetPasswordDialog groupProperties={groupProperties} open={this.state.resetPassword.resetPasswordDialogOpen} onClose={this.handleCloseResetPasswordDialog} onTextChanged={this.handleTextChanged} resetEmail={this.state.resetPassword.resetEmail} onSendEmailClick={this.handleSendResetEmail} resetChecking={this.state.resetPassword.resetChecking} resetError={this.state.resetPassword.resetError} />
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);

class ResetPasswordDialog extends Component {

    handleClose = () => {
        this.props.onClose();
    };

    onTextChanged = event => {
        this.props.onTextChanged(event);
    };

    onSendEmailClick = () => {
        this.props.onSendEmailClick();
    };

    renderReset = () => {
        const {
            groupProperties,
            resetChecking,
            resetError
        } = this.props;
        if (resetChecking) {
            return (
                <FlexView hAlignContent="center" marginBottom={30} >
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
        } else {
            if (resetError) {
                return (
                    <FlexView style={{ backgroundColor: colors.red_700 }} vAlignContent="center" marginBottom={30} >
                        <Typography variant="body1" className={css(styles.reset_email_error_text)}>Unable to send request password email</Typography>
                    </FlexView>
                );
            } else {
                return null;
            }
        }
    };

    render() {
        const {
            groupProperties,
            resetEmail,
            resetError,
            resetChecking,

            onClose,
            onTextChanged,
            onSendEmailClick,
            ...other
        } = this.props;
        return (
            <Dialog fullWidth maxWidth="sm" onClose={this.handleClose} {...other} >
                <DialogTitle>
                    <FlexView hAlignContent="center" marginTop={20} >
                        <Typography variant="h4" align="center" paragraph>Reset Your Password</Typography>
                    </FlexView>
                </DialogTitle>
                <FlexView column hAlignContent="center" >
                    <FlexView column marginRight={60} marginLeft={60} >
                        <Typography variant="body1" align="center" paragraph>Please provide the email address you used when you signed up for your Invest West account.</Typography>
                        <Typography variant="body1" align="center" paragraph>We will send you an email with a link to reset your password. <b>Please note that this link will only be valid for up to 3 hours.</b></Typography>
                    </FlexView>
                    <FlexView column width="100%" marginTop={50} className={css(styles.reset_password_actions_layout)}>

                        {this.renderReset()}

                        <Container fluid style={{ padding: 0 }}>
                            <Row>
                                <Col xs={12} sm={12} md={7} lg={9}>
                                    <FlexView height="100%" vAlignContent="center">
                                        <TextField name="resetEmail" value={resetEmail} label="Email address" variant="outlined" fullWidth onChange={this.onTextChanged}/>
                                    </FlexView>
                                </Col>
                                <Col xs={12} sm={12} md={5} lg={3}>
                                    <FlexView height="100%" vAlignContent="center">
                                        <Button fullWidth color="primary" variant="contained" size="medium" onClick={this.onSendEmailClick} className={css(sharedStyles.no_text_transform)}>Send</Button>
                                    </FlexView>
                                </Col>
                            </Row>
                        </Container>
                    </FlexView>
                </FlexView>
            </Dialog>
        );
    }
}

const styles = StyleSheet.create({
    no_margin: {
        margin: 0
    },

    hover: {
        ':hover': {
            color: colors.gray_800,
            cursor: 'pointer'
        }
    },

    auth_error: {
        backgroundColor: colors.red_700,
        color: colors.white,
        padding: 15
    },

    reset_email_sent: {
        backgroundColor: colors.dark_green,
        color: colors.white,
        padding: 15
    },

    reset_password_actions_layout: {
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 42,
        paddingBottom: 42,
        backgroundColor: colors.gray_200
    },

    reset_email_error_text: {
        color: colors.white,
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 15
    }
});