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
import GroupProperties, {isCourse, isUniversity} from "../models/group_properties";
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
    private static readonly LAST_AUTH_TIMESTAMP_KEY = 'lastSuccessfulAuthTimestamp';
    private hasCompletedInitialAuthCheck: boolean; // ⚡ FIX: Track if Firebase has completed initial auth restoration

    constructor(props: GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.authListener = null;
        this.routePath = this.props.match.path;
        this.routeParams = this.props.match.params;
        this.hasCompletedInitialAuthCheck = false; // ⚡ FIX: Initialize to false
        this.state = {
            ...initialState
        }
    }

    private getLastAuthTimestamp(): number {
        try {
            const stored = sessionStorage.getItem(GroupRoute.LAST_AUTH_TIMESTAMP_KEY);
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    }

    private setLastAuthTimestamp(timestamp: number): void {
        try {
            sessionStorage.setItem(GroupRoute.LAST_AUTH_TIMESTAMP_KEY, timestamp.toString());
        } catch {
            // Ignore storage errors
        }
    }

    /**
     * ⚡ FIX: Clear stale authentication timestamps
     * Prevents old timestamps from interfering with auth restoration after page refresh
     */
    private clearStaleAuthTimestamp(): void {
        const lastAuthTimestamp = this.getLastAuthTimestamp();
        if (lastAuthTimestamp > 0) {
            const now = Date.now();
            const timeSinceLastAuth = now - lastAuthTimestamp;
            const staleThreshold = 30000; // 30 seconds

            if (timeSinceLastAuth > staleThreshold) {
                console.log(`[COURSE ADMIN AUTH] 🧹 Clearing stale auth timestamp (${timeSinceLastAuth}ms old)`);
                this.setLastAuthTimestamp(0);
            }
        }
    }

    /**
     * Construct a simple post-login redirect route that directly matches user types to their dashboards
     */
    constructPostLoginRoute = (): string => {
        const { AuthenticationState } = this.props;
        const currentUser = AuthenticationState.currentUser;
        const groupsOfMembership = AuthenticationState.groupsOfMembership || [];

        if (!currentUser) {
            return Routes.constructHomeRoute(this.routeParams, this.props.ManageGroupUrlState, this.props.AuthenticationState);
        }

        /**
         * Helper to extract university and course usernames from user's group membership
         * Returns { universityUserName: string, courseUserName: string }
         *
         * IMPORTANT: During post-login redirect, we should find the user's ACTUAL assigned course,
         * NOT use the route params from the login URL (e.g., /groups/invest-west/student-showcase/login)
         *
         * NOTE: Admins use groupsOfMembership for courses, but Issuers/Investors have course in user.course field
         */
        const getUniversityAndCourseForUser = (): { universityUserName: string, courseUserName: string } => {
            // Check if user is admin - admins use groupsOfMembership for course assignments
            const currentAdmin: Admin | null = isAdmin(currentUser);

            console.log('[GET UNIVERSITY AND COURSE] Starting with:', {
                routeParams: this.routeParams,
                isAdmin: !!currentAdmin,
                userCourse: !currentAdmin ? (currentUser as User).course : undefined,
                userCourseType: !currentAdmin ? typeof (currentUser as User).course : undefined,
                userCourseValue: !currentAdmin ? JSON.stringify((currentUser as User).course) : undefined,
                groupsOfMembershipCount: groupsOfMembership.length,
                groupsOfMembership: groupsOfMembership.map(m => ({
                    groupUserName: m.group.groupUserName,
                    displayName: m.group.displayName,
                    groupType: m.group.groupType,
                    isHomeGroup: m.isHomeGroup,
                    anid: m.group.anid
                }))
            });

            // For non-admin users (issuers/investors), check user.course field first
            // IMPORTANT: Exclude '-1' which is a placeholder/uninitialized value during signup
            const userCourseField = !currentAdmin ? (currentUser as User).course : undefined;
            console.log('[GET UNIVERSITY AND COURSE] 🔍 Checking user.course field:', {
                hasUserCourse: !!userCourseField,
                userCourseValue: userCourseField,
                isNotMinusOne: userCourseField !== '-1',
                willUseCourseField: !!userCourseField && userCourseField !== '-1'
            });

            if (!currentAdmin && userCourseField && userCourseField !== '-1') {
                const userCourse = userCourseField;

                // Check if userCourse is a course anid (number) or course username (string)
                // If it's an anid, we need to find the corresponding course in groupsOfMembership
                const courseMembership = groupsOfMembership.find(m =>
                    isCourse(m.group) && (m.group.anid === userCourse || m.group.groupUserName === userCourse)
                );

                if (courseMembership) {
                    const parentUniversity = groupsOfMembership.find(m =>
                        m.group.anid === courseMembership.group.parentGroupId
                    );

                    console.log('[GET UNIVERSITY AND COURSE] ✅ Found matching course in groupsOfMembership:', {
                        courseUserName: courseMembership.group.groupUserName,
                        courseName: courseMembership.group.displayName,
                        courseAnid: courseMembership.group.anid,
                        universityUserName: parentUniversity ? parentUniversity.group.groupUserName : 'invest-west',
                        matchedBy: courseMembership.group.anid === userCourse ? 'anid' : 'groupUserName'
                    });

                    return {
                        universityUserName: parentUniversity ? parentUniversity.group.groupUserName : 'invest-west',
                        courseUserName: courseMembership.group.groupUserName
                    };
                }

                // If no match found in groupsOfMembership, assume userCourse is already a course username
                console.log('[GET UNIVERSITY AND COURSE] ⚠️ Course not found in groupsOfMembership, using as-is:', {
                    courseUserName: userCourse,
                    universityUserName: 'invest-west'
                });
                return {
                    universityUserName: 'invest-west',
                    courseUserName: userCourse
                };
            }

            // For admins, find course in groupsOfMembership (prioritize COURSE memberships)
            const courseMemberships = groupsOfMembership.filter(m => isCourse(m.group));
            const universityMemberships = groupsOfMembership.filter(m => isUniversity(m.group));

            console.log('[GET UNIVERSITY AND COURSE] Separated memberships:', {
                courseCount: courseMemberships.length,
                universityCount: universityMemberships.length,
                courses: courseMemberships.map(m => m.group.groupUserName),
                universities: universityMemberships.map(m => m.group.groupUserName)
            });

            // If user has course membership(s), use the FIRST course found (their assigned course)
            if (courseMemberships.length > 0) {
                const firstCourse = courseMemberships[0].group;

                // Try to find parent university in memberships
                const parentUniversity = groupsOfMembership
                    .find(m => m.group.anid === firstCourse.parentGroupId);

                if (parentUniversity) {
                    console.log('[GET UNIVERSITY AND COURSE] ✅ Found user assigned course with parent university:', {
                        courseUserName: firstCourse.groupUserName,
                        universityUserName: parentUniversity.group.groupUserName,
                        courseName: firstCourse.displayName,
                        universityName: parentUniversity.group.displayName
                    });
                    return {
                        universityUserName: parentUniversity.group.groupUserName,
                        courseUserName: firstCourse.groupUserName
                    };
                }

                // If parent not in memberships but parentGroup is populated
                if (firstCourse.parentGroup) {
                    console.log('[GET UNIVERSITY AND COURSE] ✅ Found user assigned course with parentGroup property:', {
                        courseUserName: firstCourse.groupUserName,
                        universityUserName: firstCourse.parentGroup.groupUserName
                    });
                    return {
                        universityUserName: firstCourse.parentGroup.groupUserName,
                        courseUserName: firstCourse.groupUserName
                    };
                }

                // Fallback: extract university from course username (format: university-course-name)
                const courseUserName = firstCourse.groupUserName;
                if (courseUserName.startsWith('invest-west-')) {
                    console.log('[GET UNIVERSITY AND COURSE] ✅ Found user assigned invest-west course:', {
                        courseUserName: courseUserName,
                        universityUserName: 'invest-west'
                    });
                    return {
                        universityUserName: 'invest-west',
                        courseUserName: courseUserName
                    };
                }
            }

            // If user has NO course memberships but has university membership, use DEFAULT course
            if (universityMemberships.length > 0) {
                const firstUniversity = universityMemberships[0].group;
                console.log('[GET UNIVERSITY AND COURSE] ⚠️ User has university membership but NO course - using DEFAULT:', {
                    universityUserName: firstUniversity.groupUserName,
                    courseUserName: 'student-showcase'
                });
                return {
                    universityUserName: firstUniversity.groupUserName,
                    courseUserName: 'student-showcase'
                };
            }

            // Ultimate fallback: DEFAULT to invest-west/student-showcase
            console.log('[GET UNIVERSITY AND COURSE] ⚠️ No memberships found - using ultimate DEFAULT');
            return {
                universityUserName: 'invest-west',
                courseUserName: 'student-showcase'
            };
        };

        // Get university and course usernames based on user's membership
        const { universityUserName, courseUserName } = getUniversityAndCourseForUser();

        // Check if user is admin
        const currentAdmin: Admin | null = isAdmin(currentUser);

        if (currentAdmin) {
            // Super admin → system admin dashboard
            if (currentAdmin.superAdmin) {
                return Routes.nonGroupAdminDashboard;
            }

            // Group admin → course admin dashboard with proper hierarchy
            const adminRoute = Routes.courseAdminDashboard
                .replace(":groupUserName", universityUserName)
                .replace(":courseUserName", courseUserName) + "?tab=Home";
            console.log('[POST-LOGIN DEBUG] Admin route:', adminRoute,
                `(university: ${universityUserName}, course: ${courseUserName})`);
            return adminRoute;
        }

        // Regular users (investors/issuers)
        if (isInvestor(currentUser as User)) {
            const investorRoute = Routes.courseInvestorDashboard
                .replace(":groupUserName", universityUserName)
                .replace(":courseUserName", courseUserName) + "?tab=Home";
            console.log('[POST-LOGIN DEBUG] Investor route:', investorRoute,
                `(university: ${universityUserName}, course: ${courseUserName})`);
            return investorRoute;
        } else {
            // Assume issuer if not investor
            const issuerRoute = Routes.courseIssuerDashboard
                .replace(":groupUserName", universityUserName)
                .replace(":courseUserName", courseUserName) + "?tab=Home";
            console.log('[POST-LOGIN DEBUG] Issuer route:', issuerRoute,
                `(university: ${universityUserName}, course: ${courseUserName})`);
            return issuerRoute;
        }
    };

    componentDidMount() {
        // ⚡ FIX: Clear any stale auth timestamps before starting auth flow
        // This prevents old timestamps from interfering with auth restoration
        this.clearStaleAuthTimestamp();
        this.validateRouteAndAuthentication();
    }

    componentDidUpdate(prevProps: Readonly<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>>, prevState: Readonly<GroupRouteState>, snapshot?: any) {

        // Detect when authentication completes successfully and set grace period timestamp
        // This must happen BEFORE the hasSignificantPropsChanged check
        const justAuthenticated = !successfullyAuthenticated(prevProps.AuthenticationState) &&
                                   successfullyAuthenticated(this.props.AuthenticationState);

        if (justAuthenticated) {
            const now = Date.now();
            console.log(`[COURSE ADMIN AUTH] ✅ Authentication completed successfully! Setting grace period timestamp: ${now}`);
            this.setLastAuthTimestamp(now);
        }

        // Only run expensive logic if key props have actually changed
        const hasSignificantPropsChanged = (
            prevProps.AuthenticationState.currentUser !== this.props.AuthenticationState.currentUser ||
            prevProps.ManageSystemAttributesState !== this.props.ManageSystemAttributesState ||
            prevProps.ManageGroupUrlState !== this.props.ManageGroupUrlState ||
            prevProps.location.pathname !== this.props.location.pathname
        );


        if (!hasSignificantPropsChanged) {
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
            ManageGroupUrlState: this.props.ManageGroupUrlState,
            hasValidationError: this.props.ManageGroupUrlState.error
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

        // Check if this is a course-based dashboard route that should be excluded from 404 redirect
        const isCourseDashboardRoute = Routes.isIssuerDashboardRoute(this.routePath) ||
                                     Routes.isInvestorDashboardRoute(this.routePath) ||
                                     Routes.isGroupAdminRoute(this.routePath);

        console.log('[ROUTING DEBUG] Pre-404 check:', {
            groupUrlValidated: successfullyValidatedGroupUrl(this.props.ManageGroupUrlState),
            routePath: this.routePath,
            isCreateOfferRoute: isCreateOfferRoute,
            isCourseDashboardRoute: isCourseDashboardRoute,
            isSignInRoute: Routes.isSignInRoute(this.routePath),
            isSignUpRoute: Routes.isSignUpRoute(this.routePath),
            isGroupViewOffer: this.routePath === Routes.groupViewOffer,
            isInvestWestRoute: isInvestWestRoute,
            isProtectedAdminRoute: isProtectedAdminRoute,
            navigatingToError: this.state.navigatingToError,
            navigatingFromSignIn: this.state.navigatingFromSignInOrSignUpToDashboard,
            validationError: this.props.ManageGroupUrlState.error?.detail
        });

        if (!successfullyValidatedGroupUrl(this.props.ManageGroupUrlState)
            && !this.state.navigatingToError
            && !this.state.navigatingFromSignInOrSignUpToDashboard
            && !isAuthenticating(this.props.AuthenticationState)  // ⚡ FIX: Don't 404 during auth
            && !Routes.isSignInRoute(this.routePath)
            && !Routes.isSignUpRoute(this.routePath)
            && this.routePath !== Routes.groupViewOffer
            && !isCreateOfferRoute  // Add exclusion for create-offer routes
            && !isCourseDashboardRoute  // Add exclusion for course-based dashboard routes
            && !isInvestWestRoute
            && !isProtectedAdminRoute) {  // Don't redirect admin routes to 404 - let auth handle it
            console.log('[ROUTING DEBUG] ❌ TRIGGERING 404 REDIRECT - Validation check failed', {
                successfullyValidatedGroupUrl: successfullyValidatedGroupUrl(this.props.ManageGroupUrlState),
                navigatingToError: this.state.navigatingToError,
                navigatingFromSignInOrSignUpToDashboard: this.state.navigatingFromSignInOrSignUpToDashboard,
                isSignInRoute: Routes.isSignInRoute(this.routePath),
                isSignUpRoute: Routes.isSignUpRoute(this.routePath),
                isGroupViewOffer: this.routePath === Routes.groupViewOffer,
                isCreateOfferRoute: isCreateOfferRoute,
                isCourseDashboardRoute: isCourseDashboardRoute,
                isInvestWestRoute: isInvestWestRoute,
                isProtectedAdminRoute: isProtectedAdminRoute,
                routePath: this.routePath,
                ManageGroupUrlState: this.props.ManageGroupUrlState
            });
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
            const redirectUrl = `${location.pathname}${location?.search}`;

            console.log('[ROUTING DEBUG] 🔒 Protected route - redirecting to sign in', {
                protectedRoute: this.routePath,
                routeParams: this.routeParams,
                redirectUrl: redirectUrl,
                storingInSessionStorage: true,
                signInRoute: Routes.constructSignInRoute(this.routeParams)
            });

            safeSetItem('redirectToAfterAuth', redirectUrl);

            this.setState({
                navigatingToSignIn: true
            });
            this.props.history.push(Routes.constructSignInRoute(this.routeParams));
        }
        
        if ((Routes.isSignInRoute(this.routePath) || Routes.isSignUpRoute(this.routePath))
            && successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingFromSignInOrSignUpToDashboard
            && this.props.AuthenticationState.groupsOfMembership.length > 0  // ⚡ FIX: Ensure groups are loaded before redirect
        ) {

            // Check for stored redirect URL first
            const storedRedirectUrl = safeGetItem('redirectToAfterAuth');
            let redirectRoute: string;

            if (storedRedirectUrl) {
                console.log('[POST-LOGIN] ✅ Using stored redirect URL:', storedRedirectUrl);
                redirectRoute = storedRedirectUrl;
                safeRemoveItem('redirectToAfterAuth');
            } else {
                console.log('[POST-LOGIN] ⚠️ No stored redirect found, constructing route based on user type');
                // Construct redirect route with robust fallback logic
                redirectRoute = this.constructPostLoginRoute();
            }

            // IMPORTANT: Validate the constructed/stored route
            // If it contains course info, verify the user has access
            const urlParts = redirectRoute.split('/');
            if (urlParts.length >= 5 && urlParts[1] === 'groups') {
                const groupParam = urlParts[2];
                const courseParam = urlParts[3];
                console.log('[POST-LOGIN] Validating redirect route:', {
                    redirectRoute,
                    groupParam,
                    courseParam,
                    groupsOfMembership: this.props.AuthenticationState.groupsOfMembership.map(m => ({
                        groupUserName: m.group.groupUserName,
                        groupType: m.group.groupType
                    }))
                });
            }


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

            console.log('[POST-LOGIN] 🎯 Redirecting after successful authentication:', {
                from: this.routePath,
                to: redirectRoute,
                settingNavigatingFlag: true,
                currentUser: {
                    id: this.props.AuthenticationState.currentUser?.id,
                    email: this.props.AuthenticationState.currentUser?.email,
                    type: this.props.AuthenticationState.currentUser?.type
                },
                groupsOfMembershipCount: this.props.AuthenticationState.groupsOfMembership.length,
                groupsOfMembership: this.props.AuthenticationState.groupsOfMembership.map(m => ({
                    groupUserName: m.group.groupUserName,
                    displayName: m.group.displayName,
                    anid: m.group.anid,
                    groupType: m.group.groupType
                }))
            });

            this.setState({
                navigatingFromSignInOrSignUpToDashboard: true
            });

            this.props.history.push(redirectRoute);
            return; // Exit early to prevent other redirect logic from running
        }

        // redirect the user to 404 page if they are trying to access routes that are not meant for them
        console.log('[ROUTING DEBUG] Permission check gate:', {
            successfullyAuthenticated: successfullyAuthenticated(this.props.AuthenticationState),
            navigatingFromSignInOrSignUpToDashboard: this.state.navigatingFromSignInOrSignUpToDashboard,
            willCheckPermissions: successfullyAuthenticated(this.props.AuthenticationState) && !this.state.navigatingFromSignInOrSignUpToDashboard,
            currentUser: this.props.AuthenticationState.currentUser?.id,
            authStatus: this.props.AuthenticationState.status
        });

        if (successfullyAuthenticated(this.props.AuthenticationState) && !this.state.navigatingFromSignInOrSignUpToDashboard) {
            console.log('[ROUTING DEBUG] Checking user access permissions');
            const currentUser: User | Admin | null = this.props.AuthenticationState.currentUser;

            if (currentUser) {
                console.log('[ROUTING DEBUG] Current user found:', currentUser.id);
                const currentAdmin: Admin | null = isAdmin(currentUser);
                let shouldRedirectToError: boolean = false;
                
                if (Routes.isRouteReservedForSuperAdmin(this.routePath)) {
                    if (!currentAdmin || (currentAdmin && !currentAdmin.superAdmin)) {
                        shouldRedirectToError = true;
                    }
                } else if (Routes.isGroupAdminRoute(this.routePath)) {
                    if (!currentAdmin) {
                        console.log('[ROUTING DEBUG] 🚫 Not an admin, will redirect to 404');
                        shouldRedirectToError = true;
                    } else {
                        console.log('[ROUTING DEBUG] 🔍 Checking admin route permissions', {
                            routePath: this.routePath,
                            routeGroupUserName: this.routeParams.groupUserName,
                            routeCourseUserName: this.routeParams.courseUserName,
                            adminAnid: currentAdmin.anid,
                            adminSuperAdmin: currentAdmin.superAdmin,
                            totalMemberships: this.props.AuthenticationState.groupsOfMembership.length
                        });

                        // For course-based admin routes, check if admin has membership to either:
                        // 1. The course specified in courseUserName parameter, OR
                        // 2. The university specified in groupUserName parameter
                        const membershipChecks = this.props.AuthenticationState.groupsOfMembership.map(membership => {
                            const matchesUniversity = membership.group.groupUserName === this.routeParams.groupUserName;
                            const matchesCourse = this.routeParams.courseUserName &&
                                                 membership.group.groupUserName === this.routeParams.courseUserName;

                            console.log('[ROUTING DEBUG] Checking membership:', {
                                membershipGroupUserName: membership.group.groupUserName,
                                membershipDisplayName: membership.group.displayName,
                                membershipAnid: membership.group.anid,
                                membershipGroupType: membership.group.groupType,
                                routeGroupUserName: this.routeParams.groupUserName,
                                routeCourseUserName: this.routeParams.courseUserName,
                                matchesUniversity,
                                matchesCourse,
                                willMatch: matchesUniversity || matchesCourse
                            });

                            return matchesUniversity || matchesCourse;
                        });

                        const hasMatchingMembership = membershipChecks.some(match => match);

                        console.log('[ROUTING DEBUG] 📋 Admin membership check result:', {
                            hasMatchingMembership,
                            routeGroupUserName: this.routeParams.groupUserName,
                            routeCourseUserName: this.routeParams.courseUserName,
                            membershipCount: this.props.AuthenticationState.groupsOfMembership.length,
                            adminMemberships: this.props.AuthenticationState.groupsOfMembership.map(m => ({
                                groupUserName: m.group.groupUserName,
                                displayName: m.group.displayName,
                                anid: m.group.anid,
                                groupType: m.group.groupType
                            })),
                            willRedirectTo404: !hasMatchingMembership
                        });

                        if (!hasMatchingMembership) {
                            console.log('[ROUTING DEBUG] 🚫 No matching membership found, will redirect to 404');
                            shouldRedirectToError = true;
                        } else {
                            console.log('[ROUTING DEBUG] ✅ Matching membership found, access granted');
                        }
                    }
                } else if (Routes.isIssuerDashboardRoute(this.routePath)) {
                    if (!isIssuer(currentUser)) {
                        shouldRedirectToError = true;
                    } else if (this.routeParams.courseUserName) {
                        // For course-based routes, check if it's the invest-west group
                        // invest-west with courses doesn't require membership check
                        if (this.routeParams.groupUserName !== 'invest-west') {
                            // For non-invest-west course routes, still check membership
                            if (this.props.AuthenticationState.groupsOfMembership
                                .filter(groupOfMembership =>
                                    groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                            ) {
                                shouldRedirectToError = true;
                            }
                        }
                        // invest-west course routes are allowed for all issuers
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        shouldRedirectToError = true;
                    }
                } else if (Routes.isInvestorDashboardRoute(this.routePath)) {
                    console.log('[ROUTING DEBUG] Checking investor dashboard access:', {
                        isInvestor: isInvestor(currentUser),
                        routeParams: this.routeParams,
                        groupsOfMembership: this.props.AuthenticationState.groupsOfMembership,
                        routePath: this.routePath,
                        hasCourseParam: !!this.routeParams.courseUserName,
                        groupUserName: this.routeParams.groupUserName,
                        courseUserName: this.routeParams.courseUserName
                    });

                    if (!isInvestor(currentUser)) {
                        console.log('[ROUTING DEBUG] User is not an investor, redirecting to 404');
                        shouldRedirectToError = true;
                    } else if (this.routeParams.courseUserName) {
                        // For course-based routes, check if it's the invest-west group
                        console.log('[ROUTING DEBUG] Course-based investor route detected:', {
                            groupUserName: this.routeParams.groupUserName,
                            courseUserName: this.routeParams.courseUserName,
                            isInvestWest: this.routeParams.groupUserName === 'invest-west'
                        });

                        // invest-west with courses doesn't require membership check
                        if (this.routeParams.groupUserName === 'invest-west') {
                            console.log('[ROUTING DEBUG] invest-west course route - allowing access without membership check');
                            shouldRedirectToError = false;
                        } else {
                            // For non-invest-west course routes, still check membership
                            const membershipCount = this.props.AuthenticationState.groupsOfMembership
                                .filter(groupOfMembership =>
                                    groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length;

                            console.log('[ROUTING DEBUG] Non-invest-west course route membership check:', {
                                groupUserName: this.routeParams.groupUserName,
                                membershipCount: membershipCount
                            });

                            if (membershipCount === 0) {
                                console.log('[ROUTING DEBUG] User is not a member of group:', this.routeParams.groupUserName, ', redirecting to 404');
                                shouldRedirectToError = true;
                            }
                        }
                    } else {
                        // Non-course routes - standard group membership check
                        const membershipCount = this.props.AuthenticationState.groupsOfMembership
                            .filter(groupOfMembership =>
                                groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length;

                        console.log('[ROUTING DEBUG] Standard group route membership check:', {
                            groupUserName: this.routeParams.groupUserName,
                            membershipCount: membershipCount
                        });

                        if (membershipCount === 0) {
                            console.log('[ROUTING DEBUG] User is not a member of group:', this.routeParams.groupUserName, ', redirecting to 404');
                            shouldRedirectToError = true;
                        }
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

                console.log('[ROUTING DEBUG] Final redirect decision:', {
                    shouldRedirectToError,
                    navigatingToError: this.state.navigatingToError,
                    willRedirect: shouldRedirectToError && !this.state.navigatingToError,
                    routePath: this.routePath,
                    routeParams: this.routeParams
                });

                if (shouldRedirectToError && !this.state.navigatingToError) {
                    console.log('[ROUTING DEBUG] ⛔ REDIRECTING TO 404 PAGE - Permission check failed ⛔', {
                        routePath: this.routePath,
                        routeParams: this.routeParams,
                        currentUser: {
                            id: this.props.AuthenticationState.currentUser?.id,
                            email: this.props.AuthenticationState.currentUser?.email,
                            type: this.props.AuthenticationState.currentUser?.type
                        },
                        isAdmin: !!currentAdmin,
                        adminAnid: currentAdmin?.anid,
                        groupsOfMembership: this.props.AuthenticationState.groupsOfMembership.map(m => ({
                            groupUserName: m.group.groupUserName,
                            displayName: m.group.displayName,
                            anid: m.group.anid,
                            groupType: m.group.groupType,
                            isHomeGroup: m.isHomeGroup
                        })),
                        reasonForRedirect: Routes.isRouteReservedForSuperAdmin(this.routePath) ? 'Not super admin' :
                                          Routes.isGroupAdminRoute(this.routePath) ? 'Admin permission check failed' :
                                          Routes.isIssuerDashboardRoute(this.routePath) ? 'Issuer permission check failed' :
                                          Routes.isInvestorDashboardRoute(this.routePath) ? 'Investor permission check failed' :
                                          Routes.isCreateOfferRoute(this.routePath) ? 'Create offer permission check failed' :
                                          'Unknown reason'
                    });
                    this.setState({
                        navigatingToError: true
                    });
                    this.props.history.push(Routes.error404);
                    return;
                }
            }
        }

        if (!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath) && this.state.navigatingFromSignInOrSignUpToDashboard) {
            console.log('[ROUTING DEBUG] Resetting navigatingFromSignInOrSignUpToDashboard flag:', {
                currentRoute: this.routePath,
                wasNavigatingFromSignIn: this.state.navigatingFromSignInOrSignUpToDashboard
            });
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

        // Check if current route is a project viewing route (public access allowed)
        const isProjectViewRoute = this.routePath === Routes.groupViewOffer || this.routePath === Routes.nonGroupViewOffer;
        
        // Check if current route is an admin route that should be handled more gracefully during auth loading
        const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);
        
        const loadingSystemAttrs = isLoadingSystemAttributes(ManageSystemAttributesState);
        const validatingGroupUrl = isValidatingGroupUrl(ManageGroupUrlState);
        const groupUrlValidated = successfullyValidatedGroupUrl(ManageGroupUrlState);
        const authNotInitialized = authIsNotInitialized(AuthenticationState);
        const isAuthenticatingUser = isAuthenticating(AuthenticationState);

        // ⚡ FIX: Check if this is a public route that doesn't require auth
        const isPublicRoute = !Routes.isProtectedRoute(this.routePath);

        console.log('[ROUTING DEBUG] Loading states check:', {
            loadingSystemAttrs,
            validatingGroupUrl,
            groupUrlValidated,
            authNotInitialized,
            isAuthenticatingUser,
            isProjectViewRoute,
            isAdminRoute,
            isPublicRoute,
            routePath: this.routePath,
            isSignInRoute: Routes.isSignInRoute(this.routePath),
            isSignUpRoute: Routes.isSignUpRoute(this.routePath)
        });

        // ⚡ FIX: Don't block rendering for public routes
        // Only require auth initialization for protected routes
        if (loadingSystemAttrs
            || validatingGroupUrl
            || (groupUrlValidated && authNotInitialized && !isPublicRoute)
            || ((!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath))
                && isAuthenticatingUser)
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
            console.log('[ROUTING DEBUG] Rendering component for validated group URL');
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
            console.log('[COURSE ADMIN AUTH] 🔥 Attaching auth listener');

            this.authListener = firebase.auth().onAuthStateChanged(firebaseUser => {
                const timestamp = new Date().toISOString();
                const now = Date.now();
                const isCurrentlyAuthenticating = isAuthenticating(this.props.AuthenticationState);
                const isAlreadyAuthenticated = successfullyAuthenticated(this.props.AuthenticationState);
                const currentUser = this.props.AuthenticationState.currentUser;
                const authStatus = this.props.AuthenticationState.status;

                // ⚡ FIX: Track if this is the initial auth check
                // On page refresh, Firebase needs time to restore persisted auth state
                // Don't trigger signOut on the first callback if user is null
                const isInitialCheck = !this.hasCompletedInitialAuthCheck;
                if (isInitialCheck) {
                    this.hasCompletedInitialAuthCheck = true;
                }

                // Grace period: if we just authenticated successfully within the last 10 seconds,
                // don't trigger signOut even if Firebase user becomes null temporarily
                // Using sessionStorage so timestamp persists across component remounts during navigation
                const lastAuthTimestamp = this.getLastAuthTimestamp();
                const timeSinceLastAuth = now - lastAuthTimestamp;
                const isWithinGracePeriod = timeSinceLastAuth < 10000; // ⚡ FIX: Increased to 10 seconds for safer navigation

                console.log(`[COURSE ADMIN AUTH] 🔥 Auth listener triggered at ${timestamp}`, {
                    hasFirebaseUser: !!firebaseUser,
                    firebaseUserId: firebaseUser?.uid,
                    firebaseEmail: firebaseUser?.email,
                    reduxAuthStatus: authStatus,
                    reduxCurrentUserId: currentUser?.id,
                    reduxCurrentUserEmail: currentUser?.email,
                    reduxCurrentUserType: currentUser?.type,
                    isCurrentlyAuthenticating,
                    isAlreadyAuthenticated,
                    isWithinGracePeriod,
                    isInitialCheck,
                    timeSinceLastAuth,
                    lastAuthTimestamp,
                    routePath: this.routePath
                });

                if (firebaseUser) {
                    console.log(`[COURSE ADMIN AUTH] 🔥 Auth listener at ${timestamp}: Firebase user detected, calling signIn`, {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        willCallSignIn: true,
                        isInitialCheck,
                        currentReduxState: {
                            isAuthenticating: isCurrentlyAuthenticating,
                            isAuthenticated: isAlreadyAuthenticated,
                            currentUserId: currentUser?.id
                        }
                    });

                    // Note: Grace period timestamp is set in componentDidUpdate when auth completes
                    this.props.signIn();
                } else {
                    // Only sign out if:
                    // 1. We're not currently authenticating, AND
                    // 2. The user is not already successfully authenticated, AND
                    // 3. We're not within the grace period after a successful auth (10 seconds), AND
                    // 4. This is NOT the initial auth check (give Firebase time to restore auth on page refresh)
                    // This prevents premature sign-out during auth process, navigation, and page refresh
                    const willSignOut = !isCurrentlyAuthenticating && !isAlreadyAuthenticated && !isWithinGracePeriod && !isInitialCheck;

                    console.log(`[COURSE ADMIN AUTH] 🔥 Auth listener at ${timestamp}: No Firebase user detected`, {
                        isCurrentlyAuthenticating,
                        isAlreadyAuthenticated,
                        isWithinGracePeriod,
                        isInitialCheck,
                        willSignOut,
                        currentReduxUser: {
                            id: currentUser?.id,
                            email: currentUser?.email,
                            type: currentUser?.type
                        },
                        authStatus,
                        routePath: this.routePath,
                        lastAuthTimestamp,
                        timeSinceLastAuth
                    });

                    if (willSignOut) {
                        console.log(`[COURSE ADMIN AUTH] 🔥 Auth listener at ${timestamp}: Calling signOut`);
                        console.trace('[COURSE ADMIN AUTH] Stack trace for signOut trigger:');
                        // Clear the timestamp when signing out
                        this.setLastAuthTimestamp(0);
                        this.props.signOut();
                    } else {
                        console.log(`[COURSE ADMIN AUTH] 🔥 Auth listener at ${timestamp}: Skipping signOut (user is authenticating, authenticated, within grace period, or initial check)`);
                    }
                }
            });
        }
    }

    detachAuthListener = () => {
        if (this.authListener) {
            this.authListener();
            this.authListener = null;
            this.hasCompletedInitialAuthCheck = false; // ⚡ FIX: Reset flag when detaching listener
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupRoute);