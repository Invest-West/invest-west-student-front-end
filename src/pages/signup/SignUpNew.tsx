import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {UserTitles, HearAbout} from "../../models/user";
import {AuthenticationState, isAuthenticating} from "../../redux-store/reducers/authenticationReducer";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {createAccount, handleInputFieldChanged, loadInvitedUser} from "./SignUpActions";
import {
    hasErrorCreatingAccount,
    hasErrorLoadingInvitedUser,
    isCreatingAccount,
    isLoadingInvitedUser,
    notFoundInvitedUser,
    SignUpState
} from "./SignUpReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {BarLoader} from "react-spinners";
import Routes from "../../router/routes";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {TYPE_INVESTOR, TYPE_ISSUER} from "../../firebase/databaseConsts";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import HashLoader from "react-spinners/HashLoader";
import {hasRegistered} from "../../models/invited_user";
import Footer from "../../shared-components/footer/Footer";

interface SignUpProps {
    ManageGroupUrlState: ManageGroupUrlState;
    MediaQueryState: MediaQueryState;
    AuthenticationState: AuthenticationState;
    SignUpLocalState: SignUpState;
    loadInvitedUser: (invitedUserID: string) => any;
    handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    createAccount: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        MediaQueryState: state.MediaQueryState,
        AuthenticationState: state.AuthenticationState,
        SignUpLocalState: state.SignUpLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadInvitedUser: (invitedUserID: string) => dispatch(loadInvitedUser(invitedUserID)),
        handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(event)),
        createAccount: () => dispatch(createAccount())
    }
}

class SignUpNew extends Component<SignUpProps & Readonly<RouteComponentProps<RouteParams>>, {}> {
    // invited user id (optional parameter from the url)
    // if invitedUserId = undefined --> public registration
    private invitedUserId: string | undefined;

    componentDidMount() {
        const {
            loadInvitedUser
        } = this.props;

        this.invitedUserId = this.props.match.params.id;
        if (this.invitedUserId) {
            loadInvitedUser(this.invitedUserId);
        }
    }

    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            MediaQueryState,
            SignUpLocalState,
            handleInputFieldChanged,
            createAccount
        } = this.props;

        // invited user ID is specified in the url
        if (this.invitedUserId) {
            // loading invited user
            if (isLoadingInvitedUser(SignUpLocalState)) {
                return (
                    <Box>
                        <BarLoader
                            color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                            width="100%"
                            height={4}
                        />
                    </Box>
                );
            }

            // error loading invited user (network error or not found)
            // OR user has already signed up
            if (hasErrorLoadingInvitedUser(SignUpLocalState)
                || (SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser))
            ) {
                return <Box
                    marginTop="30px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Typography
                        variant="h6"
                        color="error"
                    >
                        {
                            // invalid invitedUserID
                            notFoundInvitedUser(SignUpLocalState)
                                ? "This registration URL is not valid."
                                // user has already signed up
                                : SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)
                                ? "You have already registered. Please sign in."
                                // other error
                                : `${SignUpLocalState.errorLoadingInvitedUser?.detail}`
                        }
                    </Typography>
                    <Box
                        height="20px"
                    />
                    <Button
                        className={css(sharedStyles.no_text_transform)}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            // invalid invitedUserID
                            if (notFoundInvitedUser(SignUpLocalState)) {
                                this.props.history.replace(
                                    Routes.constructSignUpRoute(ManageGroupUrlState.groupNameFromUrl ?? "")
                                );
                                window.location.reload();
                                return;
                            }

                            // user has already signed up
                            if (SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)) {
                                this.props.history.push(Routes.constructSignInRoute(this.props.match.params));
                                return;
                            }

                            // other error
                            window.location.reload();
                        }}
                    >
                        {
                            // invalid invitedUserID
                            notFoundInvitedUser(SignUpLocalState)
                                ? "Go to public registration"
                                // user has already signed up
                                : SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)
                                ? "Sign in"
                                // other error
                                : "Retry"
                        }
                    </Button>
                </Box>;
            }
        }

        return <Box>
            {/** Sign up card */}
            <Row noGutters>
                <Col
                    xs={{span: 12, offset: 0}}
                    sm={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                >
                    <Box
                        display="flex"
                        width="100%"
                        justifyContent="center"
                        paddingX={MediaQueryState.isMobile ? "10px" : "0px"}
                        paddingY={MediaQueryState.isMobile ? "20px" : "60px"}
                    >
                        <Paper
                            elevation={0}
                            square
                            className={css(sharedStyles.kick_starter_border_box)}
                            style={{
                                width: 650,
                                padding: MediaQueryState.isMobile ? 20 : 30
                            }}
                        >
                            <Typography
                                align="center"
                                variant="h5"
                                color="primary"
                            >
                                {`Welcome to ${ManageGroupUrlState.group?.displayName}`}
                            </Typography>

                            <Box
                                height="20px"
                            />

                            {/** Hash loader */}
                            {
                                isCreatingAccount(SignUpLocalState) || isAuthenticating(AuthenticationState)
                                    ? <Box
                                        display="flex"
                                        marginY="20px"
                                        justifyContent="center"
                                    >
                                        <HashLoader
                                            color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                        />
                                    </Box>
                                    : null
                            }

                            {/** Error message */}
                            {
                                !hasErrorCreatingAccount(SignUpLocalState)
                                    ? <Box
                                        marginY="20px"
                                    >
                                        <Typography
                                            align="center"
                                            variant="body1"
                                            color="error"
                                        >
                                            {SignUpLocalState.errorCreatingAccount?.detail}
                                        </Typography>
                                    </Box>
                                    : null
                            }

                            {/** User type */}
                            <FormControl
                                required
                                fullWidth
                                disabled={this.invitedUserId !== undefined}
                            >
                                <InputLabel>
                                    <Typography
                                        variant="body1"
                                        color="primary"
                                    >
                                        What would you like to do?
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="userType"
                                    value={SignUpLocalState.userType}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value={-1}
                                    >
                                        Please select
                                    </MenuItem>
                                    <MenuItem
                                        key={TYPE_ISSUER}
                                        value={TYPE_ISSUER}
                                    >
                                        Upload student project
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Box
                                height="30px"
                            />

                            {/** Title */}
                            <FormControl
                                required
                                fullWidth
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
                                    value={SignUpLocalState.title}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value="-1"
                                    >
                                        Please select
                                    </MenuItem>
                                    {
                                        UserTitles.map((title, index) => (
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

                            <Box
                                height="25px"
                            />

                            {/** Names */}
                            <Box
                                marginBottom="18px"
                            >
                                {/** First name */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="First name"
                                        name="firstName"
                                        value={SignUpLocalState.firstName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Last name */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={SignUpLocalState.lastName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>
                            </Box>

                            {/** Emails */}
                            <Box
                                marginBottom="18px"
                            >
                                {/** Email */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Email"
                                        name="email"
                                        value={SignUpLocalState.email}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={this.invitedUserId !== undefined}
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Confirmed email */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Re-enter email"
                                        name="confirmedEmail"
                                        value={SignUpLocalState.confirmedEmail}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>
                            </Box>

                            {/** Passwords */}
                            <Box>
                                {/** Password */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Password"
                                        name="password"
                                        value={SignUpLocalState.password}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Confirmed password */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Confirm password"
                                        name="confirmedPassword"
                                        value={SignUpLocalState.confirmedPassword}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>


                                {/** How did you hear about us */}
                                <Box marginTop="28px"/>
                                <FormControl fullWidth>
                                <InputLabel>
                                    <Typography variant="body1" color="primary">
                                        How did you hear about us?
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="discover"
                                    value={SignUpLocalState.discover}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value="-1"
                                    >
                                        Please select
                                    </MenuItem>
                                    {
                                        HearAbout.map((discover, index) => (
                                            <MenuItem
                                                key={index}
                                                value={discover}
                                            >
                                                {discover}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            </Box>

                            {/** Marketing preferences checkbox */}
                            <Box
                                marginTop="28px"
                            >
                                <FormControl>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                    >
                                        <Checkbox
                                            name="acceptMarketingPreferences"
                                            color="primary"
                                            checked={SignUpLocalState.acceptMarketingPreferences}
                                            onChange={handleInputFieldChanged}
                                        />
                                        <Typography
                                            variant="body1"
                                        >
                                            Accept&nbsp;
                                            <CustomLink
                                                url={Routes.nonGroupMarketingPreferences}
                                                target="_blank"
                                                color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                                activeColor="none"
                                                activeUnderline
                                                component="a"
                                                childComponent={
                                                    "marketing preferences"
                                                }
                                            />
                                            .
                                        </Typography>
                                    </Box>
                                </FormControl>
                            </Box>

                            {/** T&Cs */}
                            <Box
                                marginTop="25px"
                            >
                                <Typography
                                    variant="body1"
                                    align="center"
                                >
                                    By signing up, you agree to our&nbsp;
                                    <CustomLink
                                        url={Routes.nonGroupTermsOfUse}
                                        target="_blank"
                                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="a"
                                        childComponent={
                                            "Terms of use"
                                        }
                                    />
                                    &nbsp;and&nbsp;
                                    <CustomLink
                                        url={Routes.nonGroupPrivacyPolicy}
                                        target="_blank"
                                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="a"
                                        childComponent={
                                            "Privacy policy"
                                        }
                                    />
                                    .
                                </Typography>
                            </Box>

                            {/** Create Account button */}
                            <Box
                                marginTop="40px"
                                display="flex"
                                justifyContent="center"
                            >
                                <Button
                                    className={css(sharedStyles.no_text_transform)}
                                    color="primary"
                                    variant="contained"
                                    disabled={
                                        SignUpLocalState.userType === -1
                                        || SignUpLocalState.title === "-1"
                                        || SignUpLocalState.firstName.trim().length === 0
                                        || SignUpLocalState.lastName.trim().length === 0
                                        || SignUpLocalState.email.trim().length === 0
                                        || SignUpLocalState.confirmedEmail.trim().length === 0
                                        || SignUpLocalState.password.trim().length === 0
                                        || SignUpLocalState.discover === "-1"
                                        || SignUpLocalState.confirmedPassword.trim().length === 0
                                    }
                                    onClick={() => createAccount()}
                                >
                                    Create account
                                </Button>
                            </Box>

                            {/** Sign in if have an account */}
                            <Box
                                marginTop="20px"
                            >
                                <Typography
                                    variant="body2"
                                    align="center"
                                >
                                    Already have an student account?&nbsp;
                                    <CustomLink
                                        url={Routes.constructSignInRoute(this.props.match.params)}
                                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="nav-link"
                                        childComponent={
                                            "Sign in"
                                        }
                                    />
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Footer */}
            <Row
                noGutters
            >
                <Col
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                >
                    <Footer/>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpNew);