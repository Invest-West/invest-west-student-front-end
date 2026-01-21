import React, { Component } from "react";
import { connect } from "react-redux";
import { AppState } from "../../redux-store/reducers";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import { Col, Row } from "react-bootstrap";
import { css } from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import { RouteComponentProps } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { BarLoader } from "react-spinners";
import firebase from "../../firebase/firebaseApp";

import {
    validateCourseAdminInvite,
    completeCourseAdminSignup,
    clearCourseAdminInviteState
} from "../../redux-store/actions/courseAdminInviteActions";
import {
    CourseAdminInviteState,
    isValidatingInvite,
    isCompletingSignup
} from "../../redux-store/reducers/courseAdminInviteReducer";
import { MediaQueryState } from "../../redux-store/reducers/mediaQueryReducer";
import Footer from "../../shared-components/footer/Footer";

/**
 * Valid titles for course admin
 */
const VALID_TITLES = ['Mr', 'Miss', 'Mrs', 'Ms', 'Dr', 'Prof', 'Other'];

/**
 * Route parameters
 */
interface RouteParams {
    token: string;
}

/**
 * Props interface
 */
interface CourseAdminSignupProps {
    MediaQueryState: MediaQueryState;
    CourseAdminInviteLocalState: CourseAdminInviteState;
    validateCourseAdminInvite: (token: string) => any;
    completeCourseAdminSignup: (data: any) => any;
    clearCourseAdminInviteState: () => any;
}

/**
 * Local component state for form fields
 */
interface LocalState {
    token: string;
    title: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmedPassword: string;
    isPasswordFocused: boolean;
}

/**
 * Map state to props
 */
const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        CourseAdminInviteLocalState: state.CourseAdminInviteLocalState
    };
};

/**
 * Map dispatch to props
 */
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        validateCourseAdminInvite: (token: string) => dispatch(validateCourseAdminInvite(token)),
        completeCourseAdminSignup: (data: any) => dispatch(completeCourseAdminSignup(data)),
        clearCourseAdminInviteState: () => dispatch(clearCourseAdminInviteState())
    };
};

/**
 * Course Admin Signup Page
 *
 * This page allows invited course admins to complete their registration.
 * The signup flow is simplified:
 * - Title
 * - First Name
 * - Last Name
 * - Password (email is pre-filled from invite)
 */
class CourseAdminSignup extends Component<CourseAdminSignupProps & RouteComponentProps<RouteParams>, LocalState> {
    constructor(props: CourseAdminSignupProps & RouteComponentProps<RouteParams>) {
        super(props);
        this.state = {
            token: props.match.params.token || "",
            title: "-1",
            firstName: "",
            lastName: "",
            password: "",
            confirmedPassword: "",
            isPasswordFocused: false
        };
    }

    componentDidMount() {
        const { validateCourseAdminInvite } = this.props;
        const { token } = this.state;

        // Validate the token
        if (token) {
            validateCourseAdminInvite(token);
        }
    }

    componentWillUnmount() {
        this.props.clearCourseAdminInviteState();
    }

    componentDidUpdate(prevProps: CourseAdminSignupProps & RouteComponentProps<RouteParams>) {
        const { CourseAdminInviteLocalState: currentState } = this.props;
        const { CourseAdminInviteLocalState: prevState } = prevProps;

        // Redirect after successful account creation
        if (!prevState.signupResult && currentState.signupResult?.success) {
            // Sign in with custom token
            if (currentState.signupResult.customToken) {
                firebase.auth().signInWithCustomToken(currentState.signupResult.customToken)
                    .then(() => {
                        if (currentState.signupResult?.redirectTo) {
                            this.props.history.push(currentState.signupResult.redirectTo);
                        }
                    })
                    .catch((error) => {
                        // If auto-sign-in fails, still redirect
                        if (currentState.signupResult?.redirectTo) {
                            this.props.history.push(currentState.signupResult.redirectTo);
                        }
                    });
            } else if (currentState.signupResult.redirectTo) {
                this.props.history.push(currentState.signupResult.redirectTo);
            }
        }
    }

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const name = event.target.name;
        const value = event.target.value as string;
        if (name) {
            this.setState((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    handleCreateAccount = async () => {
        const { completeCourseAdminSignup } = this.props;
        const { token, title, firstName, lastName, password } = this.state;

        await completeCourseAdminSignup({
            token,
            title,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password
        });
    };

    render() {
        const {
            MediaQueryState,
            CourseAdminInviteLocalState
        } = this.props;
        const { token } = this.state;

        // No token provided
        if (!token) {
            return this.renderError("No invitation token provided", "Please use the link from your invitation email.");
        }

        // Validating token
        if (isValidatingInvite(CourseAdminInviteLocalState)) {
            return (
                <Box>
                    <BarLoader
                        color="#1976d2"
                        width="100%"
                        height={4}
                    />
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="50vh"
                    >
                        <Typography variant="h6" color="textSecondary">
                            Validating your invitation...
                        </Typography>
                    </Box>
                </Box>
            );
        }

        // Invalid token
        if (!CourseAdminInviteLocalState.validatingInvite && !CourseAdminInviteLocalState.inviteValid && CourseAdminInviteLocalState.inviteError) {
            return this.renderError(
                "Invalid Invitation",
                CourseAdminInviteLocalState.inviteError ||
                "This invitation link is invalid or has expired. Please contact the administrator for a new invitation."
            );
        }

        // Valid token - show signup form
        if (CourseAdminInviteLocalState.inviteValid && CourseAdminInviteLocalState.inviteData) {
            return this.renderSignupForm();
        }

        // Fallback loading state
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <HashLoader color="#1976d2" />
            </Box>
        );
    }

    /**
     * Renders an error message with a retry button
     */
    renderError(title: string, message: string) {
        return (
            <Box
                marginTop="60px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                paddingX="20px"
            >
                <Typography variant="h5" color="error" align="center">
                    {title}
                </Typography>
                <Box height="20px" />
                <Typography variant="body1" color="textSecondary" align="center">
                    {message}
                </Typography>
                <Box height="30px" />
                <Button
                    className={css(sharedStyles.no_text_transform)}
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    /**
     * Renders the signup form
     */
    renderSignupForm() {
        const {
            MediaQueryState,
            CourseAdminInviteLocalState
        } = this.props;
        const { title, firstName, lastName, password, confirmedPassword } = this.state;

        const inviteData = CourseAdminInviteLocalState.inviteData;
        const isFormDisabled = isCompletingSignup(CourseAdminInviteLocalState);
        const isFormComplete =
            title !== "-1" &&
            firstName.trim().length > 0 &&
            lastName.trim().length > 0 &&
            password.length >= 8 &&
            password === confirmedPassword;

        return (
            <Box>
                <Row noGutters>
                    <Col
                        xs={{ span: 12, offset: 0 }}
                        sm={{ span: 12, offset: 0 }}
                        md={{ span: 8, offset: 2 }}
                        lg={{ span: 4, offset: 4 }}
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
                                {/* Header */}
                                <Typography
                                    align="center"
                                    variant="h5"
                                    color="primary"
                                >
                                    Welcome to {inviteData?.universityName}
                                </Typography>

                                <Box height="10px" />

                                <Typography
                                    align="center"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    Complete your registration to become {inviteData?.role === 'admin' ? 'an administrator' : 'a lecturer'} for {inviteData?.courseName}
                                </Typography>

                                <Box height="30px" />

                                {/* Loading spinner */}
                                {isCompletingSignup(CourseAdminInviteLocalState) && (
                                    <Box display="flex" marginY="20px" justifyContent="center">
                                        <HashLoader color="#1976d2" />
                                    </Box>
                                )}

                                {/* Success message */}
                                {CourseAdminInviteLocalState.signupResult?.success && (
                                    <Box marginY="20px">
                                        <Typography align="center" variant="body1" style={{ color: "#4caf50" }}>
                                            Account created successfully! Redirecting...
                                        </Typography>
                                    </Box>
                                )}

                                {/* Error message */}
                                {CourseAdminInviteLocalState.signupError && (
                                    <Box marginY="20px">
                                        <Typography align="center" variant="body1" color="error">
                                            {CourseAdminInviteLocalState.signupError}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Email (read-only) */}
                                <FormControl fullWidth>
                                    <TextField
                                        label="Email"
                                        value={inviteData?.email || ""}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled
                                        helperText="This is the email address from your invitation"
                                    />
                                </FormControl>

                                <Box height="20px" />

                                {/* Title */}
                                <FormControl required fullWidth disabled={isFormDisabled}>
                                    <InputLabel>
                                        <Typography variant="body1" color="primary">
                                            Title
                                        </Typography>
                                    </InputLabel>
                                    <Select
                                        name="title"
                                        value={title}
                                        // @ts-ignore
                                        onChange={this.handleInputChange}
                                        margin="dense"
                                        style={{ marginTop: 25 }}
                                    >
                                        <MenuItem key="-1" value="-1">
                                            Please select
                                        </MenuItem>
                                        {VALID_TITLES.map((t, index) => (
                                            <MenuItem key={index} value={t}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box height="20px" />

                                {/* First Name */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="First name"
                                        name="firstName"
                                        value={firstName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={isFormDisabled}
                                        onChange={this.handleInputChange}
                                    />
                                </FormControl>

                                {/* Last Name */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={lastName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={isFormDisabled}
                                        onChange={this.handleInputChange}
                                    />
                                </FormControl>

                                <Box height="20px" />

                                {/* Password */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="Password"
                                        name="password"
                                        value={password}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        disabled={isFormDisabled}
                                        onChange={this.handleInputChange}
                                        onFocus={() => this.setState({ isPasswordFocused: true })}
                                        onBlur={() => this.setState({ isPasswordFocused: false })}
                                    />
                                </FormControl>

                                {/* Confirmed Password */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="Confirm password"
                                        name="confirmedPassword"
                                        value={confirmedPassword}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        disabled={isFormDisabled}
                                        onChange={this.handleInputChange}
                                    />
                                </FormControl>

                                {/* Password validation feedback */}
                                {(this.state.isPasswordFocused || password.length > 0) && (
                                    <Box marginTop="8px">
                                        <Typography
                                            variant="body2"
                                            style={{
                                                color: password.length >= 8
                                                    ? "#4caf50"
                                                    : "#f44336"
                                            }}
                                        >
                                            Password must be at least 8 characters ({password.length}/8)
                                        </Typography>
                                    </Box>
                                )}

                                {/* Password match feedback */}
                                {confirmedPassword.length > 0 && (
                                    <Box marginTop="4px">
                                        <Typography
                                            variant="body2"
                                            style={{
                                                color: password === confirmedPassword
                                                    ? "#4caf50"
                                                    : "#f44336"
                                            }}
                                        >
                                            {password === confirmedPassword
                                                ? "Passwords match"
                                                : "Passwords do not match"}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Create Account button */}
                                <Box marginTop="40px" display="flex" justifyContent="center">
                                    <Button
                                        className={css(sharedStyles.no_text_transform)}
                                        color="primary"
                                        variant="contained"
                                        disabled={!isFormComplete || isFormDisabled}
                                        onClick={this.handleCreateAccount}
                                    >
                                        Create Account
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Col>
                </Row>

                {/* Footer */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Footer />
                    </Col>
                </Row>
            </Box>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseAdminSignup);
