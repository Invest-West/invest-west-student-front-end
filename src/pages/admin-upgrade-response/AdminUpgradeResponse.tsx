import React, { Component } from "react";
import { connect } from "react-redux";
import { AppState } from "../../redux-store/reducers";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import {
    Box,
    Button,
    Paper,
    Typography
} from "@material-ui/core";
import { Col, Row } from "react-bootstrap";
import { css } from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import { RouteComponentProps } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { BarLoader } from "react-spinners";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";

import {
    validateUpgradeRequest,
    respondToUpgradeRequest,
    clearCourseAdminInviteState
} from "../../redux-store/actions/courseAdminInviteActions";
import {
    CourseAdminInviteState,
    isValidatingUpgrade,
    isRespondingToUpgrade
} from "../../redux-store/reducers/courseAdminInviteReducer";
import { MediaQueryState } from "../../redux-store/reducers/mediaQueryReducer";
import {
    AuthenticationState,
    AuthenticationStatus,
    authIsNotInitialized,
    isAuthenticating
} from "../../redux-store/reducers/authenticationReducer";
import Footer from "../../shared-components/footer/Footer";
import { safeSetItem } from "../../utils/browser";

/**
 * Route parameters
 */
interface RouteParams {
    requestId: string;
}

/**
 * Props interface
 */
interface AdminUpgradeResponseProps {
    MediaQueryState: MediaQueryState;
    AuthenticationState: AuthenticationState;
    CourseAdminInviteLocalState: CourseAdminInviteState;
    validateUpgradeRequest: (requestId: string) => any;
    respondToUpgradeRequest: (data: { requestId: string; action: 'accept' | 'decline' }) => any;
    clearCourseAdminInviteState: () => any;
}

/**
 * Local component state
 */
interface LocalState {
    requestId: string;
    responseSubmitted: boolean;
}

/**
 * Map state to props
 */
const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        AuthenticationState: state.AuthenticationState,
        CourseAdminInviteLocalState: state.CourseAdminInviteLocalState
    };
};

/**
 * Map dispatch to props
 */
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        validateUpgradeRequest: (requestId: string) => dispatch(validateUpgradeRequest(requestId)),
        respondToUpgradeRequest: (data: { requestId: string; action: 'accept' | 'decline' }) =>
            dispatch(respondToUpgradeRequest(data)),
        clearCourseAdminInviteState: () => dispatch(clearCourseAdminInviteState())
    };
};

/**
 * Admin Upgrade Response Page
 *
 * This page allows existing users to accept or decline upgrade requests
 * to become course admins or lecturers.
 */
class AdminUpgradeResponse extends Component<AdminUpgradeResponseProps & RouteComponentProps<RouteParams>, LocalState> {
    constructor(props: AdminUpgradeResponseProps & RouteComponentProps<RouteParams>) {
        super(props);
        this.state = {
            requestId: props.match.params.requestId || "",
            responseSubmitted: false
        };
    }

    componentDidMount() {
        this.handleAuthStateChange();
    }

    componentDidUpdate(prevProps: AdminUpgradeResponseProps & RouteComponentProps<RouteParams>) {
        const { AuthenticationState: prevAuthState } = prevProps;
        const { AuthenticationState: currentAuthState } = this.props;

        // Handle auth state changes
        if (prevAuthState.status !== currentAuthState.status) {
            this.handleAuthStateChange();
        }
    }

    /**
     * Handle authentication state changes
     * - Wait for auth to initialize
     * - Redirect to sign-in if unauthenticated
     * - Validate request if authenticated
     */
    handleAuthStateChange = () => {
        const { validateUpgradeRequest, AuthenticationState } = this.props;
        const { requestId } = this.state;

        // Wait for auth to initialize - don't do anything yet
        if (authIsNotInitialized(AuthenticationState) || isAuthenticating(AuthenticationState)) {
            return;
        }

        // Auth is now initialized - check if user is authenticated
        if (AuthenticationState.status === AuthenticationStatus.Unauthenticated) {
            // Store the current URL so user is redirected back after sign-in
            safeSetItem('redirectToAfterAuth', window.location.pathname);
            // Redirect to sign in
            this.props.history.push('/sign-in');
            return;
        }

        // User is authenticated - validate the request if we haven't already
        if (AuthenticationState.currentUser && requestId) {
            const { CourseAdminInviteLocalState } = this.props;
            // Only validate if we haven't started validating yet
            if (!CourseAdminInviteLocalState.validatingUpgrade &&
                !CourseAdminInviteLocalState.upgradeRequestValid &&
                !CourseAdminInviteLocalState.upgradeRequestError) {
                validateUpgradeRequest(requestId);
            }
        }
    }

    componentWillUnmount() {
        this.props.clearCourseAdminInviteState();
    }

    handleAccept = async () => {
        const { respondToUpgradeRequest } = this.props;
        const { requestId } = this.state;

        try {
            await respondToUpgradeRequest({ requestId, action: 'accept' });
            this.setState({ responseSubmitted: true });
        } catch (error) {
            // Error will be handled in the state
        }
    };

    handleDecline = async () => {
        const { respondToUpgradeRequest } = this.props;
        const { requestId } = this.state;

        try {
            await respondToUpgradeRequest({ requestId, action: 'decline' });
            this.setState({ responseSubmitted: true });
        } catch (error) {
            // Error will be handled in the state
        }
    };

    render() {
        const {
            MediaQueryState,
            AuthenticationState,
            CourseAdminInviteLocalState
        } = this.props;
        const { requestId } = this.state;

        // No request ID provided
        if (!requestId) {
            return this.renderError("No request ID provided", "Please use the link from your email.");
        }

        // Auth is still initializing - show loading
        if (authIsNotInitialized(AuthenticationState) || isAuthenticating(AuthenticationState)) {
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
                            Checking authentication...
                        </Typography>
                    </Box>
                </Box>
            );
        }

        // Not authenticated (will redirect in handleAuthStateChange, but show message briefly)
        if (!AuthenticationState.currentUser) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Typography variant="h6" color="textSecondary">
                        Please sign in to view this request...
                    </Typography>
                </Box>
            );
        }

        // Validating request
        if (isValidatingUpgrade(CourseAdminInviteLocalState)) {
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
                            Validating your request...
                        </Typography>
                    </Box>
                </Box>
            );
        }

        // Invalid request
        if (!CourseAdminInviteLocalState.validatingUpgrade && !CourseAdminInviteLocalState.upgradeRequestValid && CourseAdminInviteLocalState.upgradeRequestError) {
            return this.renderError(
                "Invalid Request",
                CourseAdminInviteLocalState.upgradeRequestError ||
                "This request is invalid or has expired."
            );
        }

        // Response completed
        if (CourseAdminInviteLocalState.upgradeResponseResult?.success) {
            return this.renderSuccessMessage();
        }

        // Valid request - show response options
        if (CourseAdminInviteLocalState.upgradeRequestValid && CourseAdminInviteLocalState.upgradeRequestData) {
            return this.renderResponseForm();
        }

        // Fallback loading state
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <HashLoader color="#1976d2" />
            </Box>
        );
    }

    /**
     * Renders an error message
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
                    onClick={() => this.props.history.push('/')}
                >
                    Go to Dashboard
                </Button>
            </Box>
        );
    }

    /**
     * Renders the success message after responding
     */
    renderSuccessMessage() {
        const { CourseAdminInviteLocalState } = this.props;
        const response = CourseAdminInviteLocalState.upgradeResponseResult;
        const accepted = response?.action === 'accepted';

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
                            paddingX="10px"
                            paddingY="60px"
                        >
                            <Paper
                                elevation={0}
                                square
                                className={css(sharedStyles.kick_starter_border_box)}
                                style={{
                                    width: 650,
                                    padding: 30,
                                    textAlign: 'center'
                                }}
                            >
                                <Box display="flex" justifyContent="center" marginBottom="20px">
                                    {accepted ? (
                                        <CheckCircleOutlineIcon
                                            style={{ fontSize: 80, color: '#4caf50' }}
                                        />
                                    ) : (
                                        <CancelOutlinedIcon
                                            style={{ fontSize: 80, color: '#f44336' }}
                                        />
                                    )}
                                </Box>

                                <Typography
                                    variant="h5"
                                    style={{ color: accepted ? '#4caf50' : '#f44336' }}
                                >
                                    {accepted ? 'Request Accepted!' : 'Request Declined'}
                                </Typography>

                                <Box height="20px" />

                                <Typography variant="body1" color="textSecondary">
                                    {response?.message || (accepted
                                        ? 'You have been granted admin access. You can now access the admin dashboard.'
                                        : 'You have declined the admin access request.')}
                                </Typography>

                                <Box height="30px" />

                                <Button
                                    className={css(sharedStyles.no_text_transform)}
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.props.history.push('/')}
                                >
                                    {accepted ? 'Go to Dashboard' : 'Continue'}
                                </Button>
                            </Paper>
                        </Box>
                    </Col>
                </Row>

                <Row noGutters>
                    <Col xs={12}>
                        <Footer />
                    </Col>
                </Row>
            </Box>
        );
    }

    /**
     * Renders the response form
     */
    renderResponseForm() {
        const {
            MediaQueryState,
            CourseAdminInviteLocalState
        } = this.props;

        const requestData = CourseAdminInviteLocalState.upgradeRequestData;
        const isResponding = isRespondingToUpgrade(CourseAdminInviteLocalState);

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
                                    Admin Access Request
                                </Typography>

                                <Box height="10px" />

                                <Typography
                                    align="center"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    You have been invited to become {requestData?.role === 'admin' ? 'an administrator' : 'a lecturer'}
                                </Typography>

                                <Box height="30px" />

                                {/* Loading spinner */}
                                {isResponding && (
                                    <Box display="flex" marginY="20px" justifyContent="center">
                                        <HashLoader color="#1976d2" />
                                    </Box>
                                )}

                                {/* Error message */}
                                {CourseAdminInviteLocalState.upgradeResponseError && (
                                    <Box marginY="20px">
                                        <Typography align="center" variant="body1" color="error">
                                            {CourseAdminInviteLocalState.upgradeResponseError}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Request Details */}
                                <Box
                                    bgcolor="#f5f5f5"
                                    padding="20px"
                                    borderRadius="8px"
                                    marginBottom="30px"
                                >
                                    <Typography variant="body1" gutterBottom>
                                        <strong>University:</strong> {requestData?.universityName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Course:</strong> {requestData?.courseName}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Role:</strong> {requestData?.role === 'admin' ? 'Course Administrator' : 'Lecturer'}
                                    </Typography>
                                </Box>

                                {/* Action Buttons */}
                                <Box display="flex" justifyContent="center" flexWrap="wrap">
                                    <Button
                                        className={css(sharedStyles.no_text_transform)}
                                        variant="contained"
                                        color="primary"
                                        disabled={isResponding}
                                        onClick={this.handleAccept}
                                        style={{ minWidth: 150, marginRight: 10 }}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        className={css(sharedStyles.no_text_transform)}
                                        variant="outlined"
                                        color="secondary"
                                        disabled={isResponding}
                                        onClick={this.handleDecline}
                                        style={{ minWidth: 150 }}
                                    >
                                        Decline
                                    </Button>
                                </Box>

                                <Box height="20px" />

                                <Typography
                                    align="center"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    By accepting, you will gain administrative access to manage this course.
                                </Typography>
                            </Paper>
                        </Box>
                    </Col>
                </Row>

                {/* Footer */}
                <Row noGutters>
                    <Col xs={12}>
                        <Footer />
                    </Col>
                </Row>
            </Box>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUpgradeResponse);
