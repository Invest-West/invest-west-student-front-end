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

import {
    validateInviteToken,
    handleInputFieldChanged,
    createAccount,
    resetState
} from "./UniAdminSignupActions";
import {
    UniAdminSignupState,
    isValidatingToken,
    hasValidToken,
    hasInvalidToken,
    isCreatingAccount,
    hasSuccessfullyCreatedAccount,
    hasErrorCreatingAccount
} from "./UniAdminSignupReducer";
import { MediaQueryState } from "../../redux-store/reducers/mediaQueryReducer";
import Footer from "../../shared-components/footer/Footer";

/**
 * Valid titles for university admin
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
interface UniAdminSignupProps {
    MediaQueryState: MediaQueryState;
    UniAdminSignupLocalState: UniAdminSignupState;
    validateInviteToken: (token: string) => any;
    handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => any;
    createAccount: () => any;
    resetState: () => any;
}

/**
 * Map state to props
 */
const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        UniAdminSignupLocalState: state.UniAdminSignupLocalState
    };
};

/**
 * Map dispatch to props
 */
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        validateInviteToken: (token: string) => dispatch(validateInviteToken(token)),
        handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) =>
            dispatch(handleInputFieldChanged(event)),
        createAccount: () => dispatch(createAccount()),
        resetState: () => dispatch(resetState())
    };
};

/**
 * Local component state
 */
interface LocalState {
    isPasswordFocused: boolean;
}

/**
 * University Admin Signup Page
 *
 * This page allows invited university admins to complete their registration.
 * The signup flow is simplified compared to regular user signup:
 * - Title
 * - First Name
 * - Last Name
 * - Password (email is pre-filled from invite)
 */
class UniAdminSignup extends Component<UniAdminSignupProps & RouteComponentProps<RouteParams>, LocalState> {
    private token: string;

    constructor(props: UniAdminSignupProps & RouteComponentProps<RouteParams>) {
        super(props);
        this.token = props.match.params.token;
        this.state = {
            isPasswordFocused: false
        };
    }

    componentDidMount() {
        const { validateInviteToken, handleInputFieldChanged } = this.props;

        // Store token in state
        const mockEvent = {
            target: {
                name: "token",
                value: this.token
            }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputFieldChanged(mockEvent);

        // Validate the token
        if (this.token) {
            validateInviteToken(this.token);
        }
    }

    componentWillUnmount() {
        this.props.resetState();
    }

    componentDidUpdate(prevProps: UniAdminSignupProps & RouteComponentProps<RouteParams>) {
        const { UniAdminSignupLocalState: currentState } = this.props;
        const { UniAdminSignupLocalState: prevState } = prevProps;

        // Redirect after successful account creation
        if (!prevState.accountCreated && currentState.accountCreated && currentState.redirectTo) {
            this.props.history.push(currentState.redirectTo);
        }
    }

    render() {
        const {
            MediaQueryState,
            UniAdminSignupLocalState,
            handleInputFieldChanged,
            createAccount
        } = this.props;

        // No token provided
        if (!this.token) {
            return this.renderError("No invitation token provided", "Please use the link from your invitation email.");
        }

        // Validating token
        if (isValidatingToken(UniAdminSignupLocalState)) {
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
        if (hasInvalidToken(UniAdminSignupLocalState)) {
            return this.renderError(
                "Invalid Invitation",
                UniAdminSignupLocalState.errorValidatingToken?.detail ||
                "This invitation link is invalid or has expired. Please contact the administrator for a new invitation."
            );
        }

        // Valid token - show signup form
        if (hasValidToken(UniAdminSignupLocalState)) {
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
            UniAdminSignupLocalState,
            handleInputFieldChanged,
            createAccount
        } = this.props;

        const isFormDisabled = isCreatingAccount(UniAdminSignupLocalState);
        const isFormComplete =
            UniAdminSignupLocalState.title !== "-1" &&
            UniAdminSignupLocalState.firstName.trim().length > 0 &&
            UniAdminSignupLocalState.lastName.trim().length > 0 &&
            UniAdminSignupLocalState.password.length >= 8 &&
            UniAdminSignupLocalState.password === UniAdminSignupLocalState.confirmedPassword;

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
                                    Welcome to {UniAdminSignupLocalState.universityName}
                                </Typography>

                                <Box height="10px" />

                                <Typography
                                    align="center"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    Complete your registration to become the university administrator
                                </Typography>

                                <Box height="30px" />

                                {/* Loading spinner */}
                                {isCreatingAccount(UniAdminSignupLocalState) && (
                                    <Box display="flex" marginY="20px" justifyContent="center">
                                        <HashLoader color="#1976d2" />
                                    </Box>
                                )}

                                {/* Success message */}
                                {hasSuccessfullyCreatedAccount(UniAdminSignupLocalState) && (
                                    <Box marginY="20px">
                                        <Typography align="center" variant="body1" style={{ color: "#4caf50" }}>
                                            Account created successfully! Redirecting...
                                        </Typography>
                                    </Box>
                                )}

                                {/* Error message */}
                                {hasErrorCreatingAccount(UniAdminSignupLocalState) && (
                                    <Box marginY="20px">
                                        <Typography align="center" variant="body1" color="error">
                                            {UniAdminSignupLocalState.errorCreatingAccount?.detail}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Email (read-only) */}
                                <FormControl fullWidth>
                                    <TextField
                                        label="Email"
                                        value={UniAdminSignupLocalState.email}
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
                                        value={UniAdminSignupLocalState.title}
                                        // @ts-ignore
                                        onChange={handleInputFieldChanged}
                                        margin="dense"
                                        style={{ marginTop: 25 }}
                                    >
                                        <MenuItem key="-1" value="-1">
                                            Please select
                                        </MenuItem>
                                        {VALID_TITLES.map((title, index) => (
                                            <MenuItem key={index} value={title}>
                                                {title}
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
                                        value={UniAdminSignupLocalState.firstName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={isFormDisabled}
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/* Last Name */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={UniAdminSignupLocalState.lastName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={isFormDisabled}
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                <Box height="20px" />

                                {/* Password */}
                                <FormControl required fullWidth>
                                    <TextField
                                        required
                                        label="Password"
                                        name="password"
                                        value={UniAdminSignupLocalState.password}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        disabled={isFormDisabled}
                                        onChange={handleInputFieldChanged}
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
                                        value={UniAdminSignupLocalState.confirmedPassword}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        disabled={isFormDisabled}
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/* Password validation feedback */}
                                {(this.state.isPasswordFocused || UniAdminSignupLocalState.password.length > 0) && (
                                    <Box marginTop="8px">
                                        <Typography
                                            variant="body2"
                                            style={{
                                                color: UniAdminSignupLocalState.password.length >= 8
                                                    ? "#4caf50"
                                                    : "#f44336"
                                            }}
                                        >
                                            Password must be at least 8 characters ({UniAdminSignupLocalState.password.length}/8)
                                        </Typography>
                                    </Box>
                                )}

                                {/* Password match feedback */}
                                {UniAdminSignupLocalState.confirmedPassword.length > 0 && (
                                    <Box marginTop="4px">
                                        <Typography
                                            variant="body2"
                                            style={{
                                                color: UniAdminSignupLocalState.password === UniAdminSignupLocalState.confirmedPassword
                                                    ? "#4caf50"
                                                    : "#f44336"
                                            }}
                                        >
                                            {UniAdminSignupLocalState.password === UniAdminSignupLocalState.confirmedPassword
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
                                        onClick={() => createAccount()}
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

export default connect(mapStateToProps, mapDispatchToProps)(UniAdminSignup);
