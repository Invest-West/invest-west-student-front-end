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
    validateGroupUrl: (path: string, groupUserName: string | null, courseUserName?: string | null) => any;
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
        validateGroupUrl: (path: string, groupUserName: string | null, courseUserName?: string | null) => dispatch(validateGroupUrl(path, groupUserName, courseUserName)),
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
        console.log('[ROUTING DEBUG] constructPostLoginRoute called');
        const { AuthenticationState } = this.props;
        const currentUser = AuthenticationState.currentUser;
        const groupsOfMembership = AuthenticationState.groupsOfMembership || [];
        
        console.log('[ROUTING DEBUG] Current user:', currentUser?.email || 'null');
        console.log('[ROUTING DEBUG] Groups of membership:', groupsOfMembership.map(g => g.group.groupUserName));
        console.log('[ROUTING DEBUG] Route params:', this.routeParams);
        
        if (!currentUser) {
            console.log('[ROUTING DEBUG] No current user, calling constructHomeRoute');
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
                    return this.routeParams.groupUserName;
                }
            }
            
            // Second priority: Look for invest-west group specifically
            const investWestGroup = groupsOfMembership.find(membership => 
                membership.group.groupUserName === 'invest-west'
            );
            if (investWestGroup) {
                return 'invest-west';
            }
            
            // Third priority: Use their first available group
            if (groupsOfMembership.length > 0) {
                const firstGroup = groupsOfMembership[0].group.groupUserName;
                return firstGroup;
            }
            
            return 'invest-west';
        };

        // Get the group name to use
        const groupName = getGroupForUser();
        console.log('[ROUTING DEBUG] Selected group name:', groupName);
        
        // Check if user is admin
        const currentAdmin: Admin | null = isAdmin(currentUser);
        
        if (currentAdmin) {
            console.log('[ROUTING DEBUG] User is admin, superAdmin:', currentAdmin.superAdmin);
            
            // Super admin → system admin dashboard
            if (currentAdmin.superAdmin) {
                console.log('[ROUTING DEBUG] Redirecting to super admin dashboard');
                return Routes.nonGroupAdminDashboard;
            }
            
            // Group admin → course admin dashboard with invest-west/student-showcase
            const adminRoute = Routes.courseAdminDashboard
                .replace(":groupUserName", groupName)
                .replace(":courseUserName", "student-showcase") + "?tab=Home";
            console.log('[ROUTING DEBUG] Redirecting to course admin dashboard:', adminRoute);
            return adminRoute;
        }
        
        // Regular users (investors/issuers)
        if (isInvestor(currentUser as User)) {
            const investorRoute = Routes.courseInvestorDashboard
                .replace(":groupUserName", groupName)
                .replace(":courseUserName", "student-showcase") + "?tab=Home";
            console.log('[ROUTING DEBUG] Redirecting to course investor dashboard:', investorRoute);
            return investorRoute;
        } else {
            // Assume issuer if not investor
            const issuerRoute = Routes.courseIssuerDashboard
                .replace(":groupUserName", groupName)
                .replace(":courseUserName", "student-showcase") + "?tab=Home";
            console.log('[ROUTING DEBUG] Redirecting to course issuer dashboard:', issuerRoute);
            return issuerRoute;
        }
    };

    componentDidMount() {
        this.validateRouteAndAuthentication();
    }

    componentDidUpdate(prevProps: Readonly<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>>, prevState: Readonly<GroupRouteState>, snapshot?: any) {
        console.log('[ROUTING DEBUG] componentDidUpdate called');
        console.log('[ROUTING DEBUG] Current location:', this.props.location.pathname);
        console.log('[ROUTING DEBUG] Previous location:', prevProps.location.pathname);
        
        // Only run expensive logic if key props have actually changed
        const hasSignificantPropsChanged = (
            prevProps.AuthenticationState.currentUser !== this.props.AuthenticationState.currentUser ||
            prevProps.ManageSystemAttributesState !== this.props.ManageSystemAttributesState ||
            prevProps.ManageGroupUrlState !== this.props.ManageGroupUrlState ||
            prevProps.location.pathname !== this.props.location.pathname
        );

        console.log('[ROUTING DEBUG] hasSignificantPropsChanged:', hasSignificantPropsChanged);

        if (!hasSignificantPropsChanged) {
            console.log('[ROUTING DEBUG] No significant props changed, skipping update');
            return;
        }

        // Reset navigation state when user logs out (goes from authenticated to null)
        // This allows fresh redirect logic for the next login
        if (prevProps.AuthenticationState.currentUser !== null && this.props.AuthenticationState.currentUser === null) {
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
        // Also skip for project viewing routes which should be accessible without group validation
        console.log('[ROUTING DEBUG] Group URL validation check:', {
            successfullyValidatedGroupUrl: successfullyValidatedGroupUrl(this.props.ManageGroupUrlState),
            navigatingToError: this.state.navigatingToError,
            navigatingFromSignInOrSignUpToDashboard: this.state.navigatingFromSignInOrSignUpToDashboard,
            isSignInRoute: Routes.isSignInRoute(this.routePath),
            isSignUpRoute: Routes.isSignUpRoute(this.routePath),
            routePath: this.routePath,
            ManageGroupUrlState: this.props.ManageGroupUrlState
        });
        
        // Allow invest-west group to bypass validation issues temporarily for debugging
        const isInvestWestRoute = this.routeParams.groupUserName === 'invest-west';
        
        // Allow admin routes to bypass group validation issues more gracefully
        const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);
        const isProtectedAdminRoute = Routes.isProtectedRoute(this.routePath) && isAdminRoute;
        
        console.log('[ROUTING DEBUG] Route validation check:', {
            isInvestWestRoute,
            isAdminRoute,
            isProtectedAdminRoute,
            routePath: this.routePath,
            successfullyValidatedGroupUrl: successfullyValidatedGroupUrl(this.props.ManageGroupUrlState)
        });
        
        // Check if this is a create-offer route that should be excluded from 404 redirect
        const isCreateOfferRoute = Routes.isCreateOfferRoute(this.routePath);

        console.log('[ROUTING DEBUG] Pre-404 check:', {
            groupUrlValidated: successfullyValidatedGroupUrl(this.props.ManageGroupUrlState),
            routePath: this.routePath,
            isCreateOfferRoute: isCreateOfferRoute,
            isSignInRoute: Routes.isSignInRoute(this.routePath),
            isSignUpRoute: Routes.isSignUpRoute(this.routePath),
            isGroupViewOffer: this.routePath === Routes.groupViewOffer,
            isInvestWestRoute: isInvestWestRoute,
            isProtectedAdminRoute: isProtectedAdminRoute,
            navigatingToError: this.state.navigatingToError,
            navigatingFromSignIn: this.state.navigatingFromSignInOrSignUpToDashboard
        });

        if (!successfullyValidatedGroupUrl(this.props.ManageGroupUrlState)
            && !this.state.navigatingToError
            && !this.state.navigatingFromSignInOrSignUpToDashboard
            && !Routes.isSignInRoute(this.routePath)
            && !Routes.isSignUpRoute(this.routePath)
            && this.routePath !== Routes.groupViewOffer
            && !isCreateOfferRoute  // Add exclusion for create-offer routes
            && !isInvestWestRoute
            && !isProtectedAdminRoute) {  // Don't redirect admin routes to 404 - let auth handle it
            console.log('[ROUTING DEBUG] Group URL validation failed, redirecting to 404');
            this.setState({
                navigatingToError: true
            });
            this.props.history.push(Routes.error404);
            return;
        } else if ((isInvestWestRoute || isProtectedAdminRoute) && !successfullyValidatedGroupUrl(this.props.ManageGroupUrlState)) {
            console.log('[ROUTING DEBUG] invest-west or admin route detected but validation pending, allowing through');
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
        
        if ((Routes.isSignInRoute(this.routePath) || Routes.isSignUpRoute(this.routePath))
            && successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingFromSignInOrSignUpToDashboard
        ) {
            console.log('[ROUTING DEBUG] User authenticated on sign-in/sign-up route, initiating redirect');
            console.log('[ROUTING DEBUG] Current route path:', this.routePath);
            
            // Check for stored redirect URL first
            const storedRedirectUrl = safeGetItem('redirectToAfterAuth');
            let redirectRoute: string;
            
            if (storedRedirectUrl) {
                console.log('[ROUTING DEBUG] Found stored redirect URL:', storedRedirectUrl);
                redirectRoute = storedRedirectUrl;
                safeRemoveItem('redirectToAfterAuth');
            } else {
                // Construct redirect route with robust fallback logic
                console.log('[ROUTING DEBUG] No stored redirect, constructing route');
                redirectRoute = this.constructPostLoginRoute();
            }
            
            console.log('[ROUTING DEBUG] Final redirect route:', redirectRoute);
            
            // Validate the route before redirecting
            if (!redirectRoute || redirectRoute === '') {
                console.error('[ROUTING ERROR] Redirect route is empty or null!');
                redirectRoute = '/groups/invest-west'; // Emergency fallback
            }
            
            // Ensure route starts with / for absolute path
            if (!redirectRoute.startsWith('/')) {
                console.warn('[ROUTING WARNING] Redirect route is not absolute, fixing:', redirectRoute);
                redirectRoute = '/' + redirectRoute;
            }
            
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: true
            });
            
            console.log('[ROUTING DEBUG] Executing history.push to:', redirectRoute);
            this.props.history.push(redirectRoute);
            return; // Exit early to prevent other redirect logic from running
        }

        // redirect the user to 404 page if they are trying to access routes that are not meant for them
        if (successfullyAuthenticated(this.props.AuthenticationState) && !this.state.navigatingFromSignInOrSignUpToDashboard) {
            const currentUser: User | Admin | null = this.props.AuthenticationState.currentUser;
            console.log('[ROUTING DEBUG] Checking user permissions for route access');
            console.log('[ROUTING DEBUG] Current user:', currentUser?.email || 'null');
            console.log('[ROUTING DEBUG] Route path:', this.routePath);
            
            if (currentUser) {
                const currentAdmin: Admin | null = isAdmin(currentUser);
                let shouldRedirectToError: boolean = false;
                
                console.log('[ROUTING DEBUG] User is admin:', !!currentAdmin, currentAdmin?.superAdmin ? 'super' : 'regular');

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
                } else if (Routes.isCreateOfferRoute(this.routePath)) {
                    // Allow issuers, investors, and admins to access create offer routes
                    const currentAdmin = isAdmin(currentUser);
                    if (!isIssuer(currentUser) && !isInvestor(currentUser) && !currentAdmin) {
                        shouldRedirectToError = true;
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        shouldRedirectToError = true;
                    }
                }

                if (shouldRedirectToError && !this.state.navigatingToError) {
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

        console.log('[ROUTING DEBUG] render() called for path:', this.props.location.pathname);
        console.log('[ROUTING DEBUG] ManageSystemAttributesState:', ManageSystemAttributesState);
        console.log('[ROUTING DEBUG] ManageGroupUrlState:', ManageGroupUrlState);
        console.log('[ROUTING DEBUG] AuthenticationState.currentUser:', AuthenticationState.currentUser?.email || 'null');

        this.updateRouteAndParams();

        // Check if current route is a project viewing route (public access allowed)
        const isProjectViewRoute = this.routePath === Routes.groupViewOffer || this.routePath === Routes.nonGroupViewOffer;
        
        // Check if current route is an admin route that should be handled more gracefully during auth loading
        const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);
        
        const loadingSystemAttrs = isLoadingSystemAttributes(ManageSystemAttributesState);
        const validatingGroupUrl = isValidatingGroupUrl(ManageGroupUrlState);
        const groupUrlValidated = successfullyValidatedGroupUrl(ManageGroupUrlState);
        const authNotInitialized = authIsNotInitialized(AuthenticationState);
        const isAuthenticatingUser = isAuthenticating(AuthenticationState);

        console.log('[ROUTING DEBUG] Loading states check:', {
            loadingSystemAttrs,
            validatingGroupUrl,
            groupUrlValidated,
            authNotInitialized,
            isAuthenticatingUser,
            isProjectViewRoute,
            isAdminRoute,
            routePath: this.routePath,
            isSignInRoute: Routes.isSignInRoute(this.routePath),
            isSignUpRoute: Routes.isSignUpRoute(this.routePath)
        });

        if (loadingSystemAttrs
            || validatingGroupUrl
            || (groupUrlValidated && authNotInitialized && !isProjectViewRoute && !isAdminRoute)
            || ((!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath))
                && isAuthenticatingUser)
        ) {
            console.log('[ROUTING DEBUG] Showing loading spinner due to loading states');
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
            console.log('[ROUTING DEBUG] Group URL successfully validated, rendering component');
            console.log('[ROUTING DEBUG] Component to render:', typeof this.props.component);
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

        console.log('[ROUTING DEBUG] Neither loading nor validated - returning null');
        console.log('[ROUTING DEBUG] Final state check:', {
            successfullyValidated: successfullyValidatedGroupUrl(ManageGroupUrlState),
            ManageGroupUrlState,
            finalRender: 'null'
        });
        return null;
    }

    validateRouteAndAuthentication = () => {
        this.updateRouteAndParams();

        this.props.loadSystemAttributes();

        const groupUserNameParam = this.routeParams.hasOwnProperty("groupUserName")
            ? this.routeParams.groupUserName 
            : this.routePath === Routes.nonGroupSignIn || this.routePath === Routes.nonGroupSignUp
                ? "invest-west"
                : this.routePath === Routes.superAdminSignIn
                    ? null  // Super admin sign-in doesn't need group validation
                    : "invest-west";  // Default to invest-west for course-based routes

        const courseUserNameParam = this.routeParams.hasOwnProperty("courseUserName")
            ? this.routeParams.courseUserName
            : null;  // Course is optional
                    
        console.log('[ROUTING DEBUG] validateGroupUrl called with:', {
            routePath: this.routePath,
            groupUserNameParam,
            courseUserNameParam,
            routeParams: this.routeParams,
            currentURL: window.location.href,
            matchPath: this.props.match.path,
            matchParams: this.props.match.params
        });
        
        // Extra debugging for course admin route specifically
        if (this.routePath === Routes.courseAdminDashboard) {
            console.log('[ADMIN ROUTE DEBUG] Course admin route detected!', {
                routePath: this.routePath,
                expectedPath: Routes.courseAdminDashboard,
                groupParam: groupUserNameParam,
                courseParam: courseUserNameParam,
                hasGroupParam: this.routeParams.hasOwnProperty("groupUserName"),
                hasCourseParam: this.routeParams.hasOwnProperty("courseUserName")
            });
        }

        // Extra debugging for create-offer routes specifically
        if (this.routePath === Routes.courseCreateOffer || this.routePath === Routes.groupCreateOffer || this.routePath === Routes.nonGroupCreateOffer) {
            console.log('[CREATE-OFFER ROUTE DEBUG] Create offer route detected!', {
                routePath: this.routePath,
                expectedCoursePath: Routes.courseCreateOffer,
                expectedGroupPath: Routes.groupCreateOffer,
                expectedNonGroupPath: Routes.nonGroupCreateOffer,
                groupParam: groupUserNameParam,
                courseParam: courseUserNameParam,
                hasGroupParam: this.routeParams.hasOwnProperty("groupUserName"),
                hasCourseParam: this.routeParams.hasOwnProperty("courseUserName"),
                currentURL: window.location.href,
                matchPath: this.props.match.path,
                matchParams: this.props.match.params,
                allRouteParams: this.routeParams
            });
        }
        
        this.props.validateGroupUrl(this.routePath, groupUserNameParam, courseUserNameParam);

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

        // Check if current route is a project viewing route (public access allowed)
        const isProjectViewRoute = this.routePath === Routes.groupViewOffer || this.routePath === Routes.nonGroupViewOffer;
        
        // Check if current route is an admin route that should attach auth listener immediately
        const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);
        
        // For project viewing routes and admin routes, attach auth listener immediately to avoid blocking
        // For other routes, wait for group URL validation to complete
        if ((successfullyValidatedGroupUrl(ManageGroupUrlState) || isProjectViewRoute || isAdminRoute) && !this.authListener) {
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