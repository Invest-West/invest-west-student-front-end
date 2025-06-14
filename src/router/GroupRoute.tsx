import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux-store/reducers";
import {
    getGroupRouteTheme,
    isValidatingGroupUrl,
    ManageGroupUrlState,
    successfullyValidatedGroupUrl
} from "../redux-store/reducers/manageGroupUrlReducer";
import {RouteComponentProps} from "react-router-dom";
import Routes from "./routes";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {validateGroupUrl} from "../redux-store/actions/manageGroupUrlActions";
import {
    AuthenticationState,
    authIsNotInitialized,
    isAuthenticating,
    successfullyAuthenticated
} from "../redux-store/reducers/authenticationReducer";
import {Col, Container, Row} from "react-bootstrap";
import Header from "../shared-components/header/Header";
import {signIn, signOut} from "../redux-store/actions/authenticationActions";
import firebase from "../firebase/firebaseApp";
import {RouteParams} from "./router";
import {Box} from "@material-ui/core";
import {
    isLoadingSystemAttributes,
    ManageSystemAttributesState
} from "../redux-store/reducers/manageSystemAttributesReducer";
import {loadSystemAttributes} from "../redux-store/actions/manageSystemAttributesActions";
import User, {isInvestor, isIssuer} from "../models/user";
import Admin, {isAdmin} from "../models/admin";
import GroupOfMembership, {getHomeGroup} from "../models/group_of_membership";
import {BarLoader} from "react-spinners";
import { safeSetItem, safeGetItem, safeRemoveItem } from "../utils/browser";

interface GroupRouteProps extends GroupRouteLocalProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    loadSystemAttributes: () => any;
    validateGroupUrl: (path: string, groupUserName: string | null) => any;
    signIn: () => any;
    signOut: () => any;
}

interface GroupRouteLocalProps {
    showHeader: boolean;
    backgroundColor?: string;
    component: React.ReactNode;
}

interface GroupRouteState {
    navigatingFromSignInOrSignUpToDashboard: boolean;
    navigatingToSignIn: boolean;
    navigatingToError: boolean;
}

const initialState: GroupRouteState = {
    navigatingFromSignInOrSignUpToDashboard: false,
    navigatingToSignIn: false,
    navigatingToError: false
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadSystemAttributes: () => dispatch(loadSystemAttributes()),
        validateGroupUrl: (path: string, groupUserName: string | null) => dispatch(validateGroupUrl(path, groupUserName)),
        signIn: () => dispatch(signIn()),
        signOut: () => dispatch(signOut())
    }
}

class GroupRoute extends Component<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>, GroupRouteState> {
    private authListener: firebase.default.Unsubscribe | null;
    private routePath: string;
    private routeParams: any;

    constructor(props: GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.authListener = null;
        this.routePath = this.props.match.path;
        this.routeParams = this.props.match.params;
        this.state = {
            ...initialState
        }
    }

    /**
     * Construct a simple post-login redirect route that directly matches user types to their dashboards
     */
    constructPostLoginRoute = (): string => {
        const { AuthenticationState } = this.props;
        const currentUser = AuthenticationState.currentUser;
        const groupsOfMembership = AuthenticationState.groupsOfMembership || [];
        
        console.log('ROUTE CONSTRUCTION: User:', currentUser?.email);
        console.log('ROUTE CONSTRUCTION: User type:', currentUser?.type);
        console.log('ROUTE CONSTRUCTION: Available groups:', groupsOfMembership.map(g => g.group.groupUserName));
        console.log('ROUTE CONSTRUCTION: URL group param:', this.routeParams.groupUserName);
        
        if (!currentUser) {
            console.log('ROUTE CONSTRUCTION: No user found');
            return Routes.constructHomeRoute(this.routeParams, this.props.ManageGroupUrlState, this.props.AuthenticationState);
        }

        // Determine the group to use for group-based users
        const getGroupForUser = (): string => {
            // First priority: Use group from URL if available and user is a member
            if (this.routeParams.groupUserName) {
                const isGroupMember = groupsOfMembership.some(membership => 
                    membership.group.groupUserName === this.routeParams.groupUserName
                );
                if (isGroupMember) {
                    console.log('ROUTE CONSTRUCTION: Using URL group:', this.routeParams.groupUserName);
                    return this.routeParams.groupUserName;
                }
            }
            
            // Second priority: Look for invest-west group specifically
            const investWestGroup = groupsOfMembership.find(membership => 
                membership.group.groupUserName === 'invest-west'
            );
            if (investWestGroup) {
                console.log('ROUTE CONSTRUCTION: Using invest-west group');
                return 'invest-west';
            }
            
            // Third priority: Use their first available group
            if (groupsOfMembership.length > 0) {
                const firstGroup = groupsOfMembership[0].group.groupUserName;
                console.log('ROUTE CONSTRUCTION: Using first available group:', firstGroup);
                return firstGroup;
            }
            
            // Default fallback to invest-west
            console.log('ROUTE CONSTRUCTION: No groups found, defaulting to invest-west');
            return 'invest-west';
        };

        // Get the group name to use
        const groupName = getGroupForUser();
        
        // Check if user is admin
        const currentAdmin: Admin | null = isAdmin(currentUser);
        
        if (currentAdmin) {
            console.log('ROUTE CONSTRUCTION: User is admin');
            
            // Super admin → system admin dashboard
            if (currentAdmin.superAdmin) {
                console.log('ROUTE CONSTRUCTION: Super admin → system admin dashboard');
                return Routes.nonGroupAdminDashboard;
            }
            
            // Group admin → group admin dashboard with invest-west group
            console.log('ROUTE CONSTRUCTION: Group admin → group admin dashboard for:', groupName);
            return Routes.groupAdminDashboard.replace(":groupUserName", groupName) + "?tab=Home";
        }
        
        // Regular users (investors/issuers)
        if (isInvestor(currentUser as User)) {
            console.log('ROUTE CONSTRUCTION: Investor → investor dashboard for:', groupName);
            return Routes.groupInvestorDashboard.replace(":groupUserName", groupName) + "?tab=Home";
        } else {
            // Assume issuer if not investor
            console.log('ROUTE CONSTRUCTION: Issuer → issuer dashboard for:', groupName);
            return Routes.groupIssuerDashboard.replace(":groupUserName", groupName) + "?tab=Home";
        }
    };

    componentDidMount() {
        this.validateRouteAndAuthentication();
    }

    componentDidUpdate(prevProps: Readonly<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>>, prevState: Readonly<GroupRouteState>, snapshot?: any) {
        // Reset navigation state when user logs out (goes from authenticated to null)
        // This allows fresh redirect logic for the next login
        if (prevProps.AuthenticationState.currentUser !== null && this.props.AuthenticationState.currentUser === null) {
            console.log('DEBUG: User logged out, resetting navigation flags for next login');
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: false,
                navigatingToSignIn: false,
                navigatingToError: false
            });
        }

        this.validateRouteAndAuthentication();

        // system attributes are being loaded
        if (isLoadingSystemAttributes(this.props.ManageSystemAttributesState)) {
            return;
        }

        // group url is being validated
        if (isValidatingGroupUrl(this.props.ManageGroupUrlState)) {
            return;
        }

        // invalid group url --> redirect to 404 page
        // Skip this check for signup/signin routes where group validation might be pending
        if (!successfullyValidatedGroupUrl(this.props.ManageGroupUrlState) 
            && !this.state.navigatingToError 
            && !this.state.navigatingFromSignInOrSignUpToDashboard
            && !Routes.isSignInRoute(this.routePath) 
            && !Routes.isSignUpRoute(this.routePath)) {
            console.log('DEBUG: Redirecting to 404 - Group URL validation failed');
            this.setState({
                navigatingToError: true
            });
            this.props.history.push(Routes.error404);
            return;
        }

        // redirect an unauthenticated user to the sign in route if they try to access protected routes
        if (Routes.isProtectedRoute(this.routePath)
            && !authIsNotInitialized(this.props.AuthenticationState)
            && !isAuthenticating(this.props.AuthenticationState)
            && !successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingToSignIn
        ) {
            const { location } = this.props;

            safeSetItem('redirectToAfterAuth', `${location.pathname}${location?.search}`);

            this.setState({
                navigatingToSignIn: true
            });
            this.props.history.push(Routes.constructSignInRoute(this.routeParams));
        }

        // redirect the user to their stored redirect URL, or explore offers page if they are on the sign in/up route and are successfully authenticated
        console.log('=== LOGIN REDIRECT DEBUG ===');
        console.log('DEBUG: Route path:', this.routePath);
        console.log('DEBUG: Route params:', this.routeParams);
        console.log('DEBUG: Is signup route:', Routes.isSignUpRoute(this.routePath));
        console.log('DEBUG: Is signin route:', Routes.isSignInRoute(this.routePath));
        console.log('DEBUG: Successfully authenticated:', successfullyAuthenticated(this.props.AuthenticationState));
        console.log('DEBUG: Current user:', this.props.AuthenticationState.currentUser?.email);
        console.log('DEBUG: Navigating from signin/signup:', this.state.navigatingFromSignInOrSignUpToDashboard);
        console.log('DEBUG: Authentication status:', this.props.AuthenticationState.status);
        console.log('=== END DEBUG INFO ===');
        
        if ((Routes.isSignInRoute(this.routePath) || Routes.isSignUpRoute(this.routePath))
            && successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingFromSignInOrSignUpToDashboard
        ) {
            console.log('DEBUG: Entering authentication redirect logic');
            // Check for stored redirect URL first
            const storedRedirectUrl = safeGetItem('redirectToAfterAuth');
            let redirectRoute: string;
            
            if (storedRedirectUrl) {
                redirectRoute = storedRedirectUrl;
                safeRemoveItem('redirectToAfterAuth');
            } else {
                // Construct redirect route with robust fallback logic
                redirectRoute = this.constructPostLoginRoute();
                console.log('DEBUG: Post-login route constructed:', redirectRoute);
            }
            
            console.log('DEBUG: About to redirect to:', redirectRoute);
            
            // Validate the route before redirecting
            if (!redirectRoute || redirectRoute === '') {
                console.error('ERROR: Redirect route is empty or null!');
                redirectRoute = '/groups/invest-west'; // Emergency fallback
            }
            
            // Ensure route starts with / for absolute path
            if (!redirectRoute.startsWith('/')) {
                console.warn('WARNING: Redirect route is not absolute, fixing:', redirectRoute);
                redirectRoute = '/' + redirectRoute;
            }
            
            console.log('DEBUG: Final redirect route:', redirectRoute);
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: true
            });
            
            console.log('DEBUG: Executing history.push to:', redirectRoute);
            this.props.history.push(redirectRoute);
            return; // Exit early to prevent other redirect logic from running
        }

        // redirect the user to 404 page if they are trying to access routes that are not meant for them
        if (successfullyAuthenticated(this.props.AuthenticationState) && !this.state.navigatingFromSignInOrSignUpToDashboard) {
            const currentUser: User | Admin | null = this.props.AuthenticationState.currentUser;
            if (currentUser) {
                const currentAdmin: Admin | null = isAdmin(currentUser);
                let shouldRedirectToError: boolean = false;

                if (Routes.isRouteReservedForSuperAdmin(this.routePath)) {
                    if (!currentAdmin || (currentAdmin && !currentAdmin.superAdmin)) {
                        shouldRedirectToError = true;
                    }
                } else if (Routes.isGroupAdminRoute(this.routePath)) {
                    if (!currentAdmin) {
                        shouldRedirectToError = true;
                    } else {
                        const adminGroup: GroupOfMembership = this.props.AuthenticationState.groupsOfMembership[0];
                        if (adminGroup.group.groupUserName !== this.routeParams.groupUserName) {
                            shouldRedirectToError = true;
                        }
                    }
                } else if (Routes.isIssuerDashboardRoute(this.routePath)) {
                    if (!isIssuer(currentUser)) {
                        shouldRedirectToError = true;
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        shouldRedirectToError = true;
                    }
                } else if (Routes.isInvestorDashboardRoute(this.routePath)) {
                    if (!isInvestor(currentUser)) {
                        shouldRedirectToError = true;
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        shouldRedirectToError = true;
                    }
                }

                if (shouldRedirectToError && !this.state.navigatingToError) {
                    console.log('DEBUG: Redirecting to 404 - Unauthorized route access');
                    this.setState({
                        navigatingToError: true
                    });
                    this.props.history.push(Routes.error404);
                    return;
                }
            }
        }

        if (!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath) && this.state.navigatingFromSignInOrSignUpToDashboard) {
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: false
            });
        }

        if (Routes.isSignInRoute(this.routePath) && this.state.navigatingToSignIn) {
            this.setState({
                navigatingToSignIn: false
            });
        }

        if (Routes.isErrorRoute(this.routePath) && this.state.navigatingToError) {
            this.setState({
                navigatingToError: false
            });
        }
    }

    componentWillUnmount() {
        this.detachAuthListener();
    }

    render() {
        const {
            ManageSystemAttributesState,
            ManageGroupUrlState,
            AuthenticationState,
            showHeader,
            backgroundColor
        } = this.props;

        this.updateRouteAndParams();

        if (isLoadingSystemAttributes(ManageSystemAttributesState)
            || isValidatingGroupUrl(ManageGroupUrlState)
            || (successfullyValidatedGroupUrl(ManageGroupUrlState) && authIsNotInitialized(AuthenticationState))
            || ((!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath))
                && isAuthenticating(AuthenticationState))
        ) {
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

        if (successfullyValidatedGroupUrl(ManageGroupUrlState)) {
            return (
                <Container
                    fluid
                    style={{
                        padding: 0,
                        height: backgroundColor !== undefined ? "100%" : "none",
                        minHeight: backgroundColor !== undefined ? "100vh" : "none",
                        backgroundColor: backgroundColor ?? "none"
                    }}
                >
                    {
                        !showHeader
                            ? null
                            : <Row
                                noGutters
                            >
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                >
                                    <Header
                                        routePath={this.routePath}
                                        homUrl={Routes.constructHomeRoute(this.routeParams, ManageGroupUrlState, AuthenticationState)}
                                        dashboardUrl={Routes.constructDashboardRoute(this.routeParams, ManageGroupUrlState, AuthenticationState)}
                                        signInUrl={Routes.constructSignInRoute(this.routeParams)}
                                    />
                                </Col>
                            </Row>
                    }

                    <Row
                        noGutters
                    >
                        <Box
                            width="100%"
                            height="100%"
                        >
                            {
                                this.props.component
                            }
                        </Box>
                    </Row>
                </Container>
            );
        }

        return null;
    }

    validateRouteAndAuthentication = () => {
        this.updateRouteAndParams();

        this.props.loadSystemAttributes();

        this.props.validateGroupUrl(
            this.routePath, this.routeParams.hasOwnProperty("groupUserName")
                ? this.routeParams.groupUserName 
                : this.routePath === Routes.nonGroupSignIn || this.routePath === Routes.nonGroupSignUp
                    ? "invest-west"
                    : null
        );

        this.attachAuthListener();
    }

    updateRouteAndParams = () => {
        this.routePath = this.props.match.path;
        this.routeParams = this.props.match.params;
    }

    attachAuthListener = () => {
        const {
            ManageGroupUrlState
        } = this.props;

        if (successfullyValidatedGroupUrl(ManageGroupUrlState) && !this.authListener) {
            this.authListener = firebase.auth().onAuthStateChanged(firebaseUser => {
                if (firebaseUser) {
                    this.props.signIn();
                } else {
                    this.props.signOut();
                }
            });
        }
    }

    detachAuthListener = () => {
        if (this.authListener) {
            this.authListener();
            this.authListener = null;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupRoute);