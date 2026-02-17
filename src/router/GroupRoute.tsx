import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../redux-store/reducers';
import {
  getGroupRouteTheme,
  isValidatingGroupUrl,
  ManageGroupUrlState,
  successfullyValidatedGroupUrl,
} from '../redux-store/reducers/manageGroupUrlReducer';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Routes from './routes';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { validateGroupUrl } from '../redux-store/actions/manageGroupUrlActions';
import {
  AuthenticationState,
  authIsNotInitialized,
  isAuthenticating,
  successfullyAuthenticated,
} from '../redux-store/reducers/authenticationReducer';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../shared-components/header/Header';
import { signIn, signOut } from '../redux-store/actions/authenticationActions';
import firebase from '../firebase/firebaseApp';
import { Box } from '@mui/material';
import {
  isLoadingSystemAttributes,
  ManageSystemAttributesState,
} from '../redux-store/reducers/manageSystemAttributesReducer';
import { loadSystemAttributes } from '../redux-store/actions/manageSystemAttributesActions';
import User, { isInvestor, isIssuer } from '../models/user';
import Admin, { isAdmin } from '../models/admin';
import { isCourse, isUniversity } from '../models/group_properties';
import { BarLoader } from 'react-spinners';
import { safeSetItem, safeGetItem, safeRemoveItem } from '../utils/browser';

interface GroupRouteReduxProps {
  ManageSystemAttributesState: ManageSystemAttributesState;
  ManageGroupUrlState: ManageGroupUrlState;
  AuthenticationState: AuthenticationState;
  loadSystemAttributes: () => any;
  validateGroupUrl: (
    path: string,
    groupUserName: string | null,
    courseUserName?: string | null
  ) => any;
  signIn: () => any;
  signOut: () => any;
}

interface GroupRouteLocalProps {
  showHeader: boolean;
  backgroundColor?: string;
  component: React.ReactNode;
}

/** Props injected by the functional wrapper (replacing RouteComponentProps) */
interface GroupRouteRouterProps {
  params: Record<string, string | undefined>;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  location: { pathname: string; search: string; hash: string };
  matchedPattern: string | null;
}

type GroupRouteClassProps = GroupRouteReduxProps & GroupRouteLocalProps & GroupRouteRouterProps;

interface GroupRouteState {
  navigatingFromSignInOrSignUpToDashboard: boolean;
  navigatingToSignIn: boolean;
  navigatingToError: boolean;
}

const initialState: GroupRouteState = {
  navigatingFromSignInOrSignUpToDashboard: false,
  navigatingToSignIn: false,
  navigatingToError: false,
};

const mapStateToProps = (state: AppState) => {
  return {
    ManageSystemAttributesState: state.ManageSystemAttributesState,
    ManageGroupUrlState: state.ManageGroupUrlState,
    AuthenticationState: state.AuthenticationState,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    loadSystemAttributes: () => dispatch(loadSystemAttributes()),
    validateGroupUrl: (
      path: string,
      groupUserName: string | null,
      courseUserName?: string | null
    ) => dispatch(validateGroupUrl(path, groupUserName, courseUserName)),
    signIn: () => dispatch(signIn()),
    signOut: () => dispatch(signOut()),
  };
};

class GroupRouteClass extends Component<GroupRouteClassProps, GroupRouteState> {
  private authListener: firebase.default.Unsubscribe | null;
  private routePath: string;
  private routeParams: any;
  private static readonly LAST_AUTH_TIMESTAMP_KEY = 'lastSuccessfulAuthTimestamp';
  private hasCompletedInitialAuthCheck: boolean;

  constructor(props: GroupRouteClassProps) {
    super(props);
    this.authListener = null;
    this.routePath = this.props.matchedPattern || '';
    this.routeParams = this.props.params;
    this.hasCompletedInitialAuthCheck = false;
    this.state = {
      ...initialState,
    };
  }

  private getLastAuthTimestamp(): number {
    try {
      const stored = sessionStorage.getItem(GroupRouteClass.LAST_AUTH_TIMESTAMP_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  private setLastAuthTimestamp(timestamp: number): void {
    try {
      sessionStorage.setItem(GroupRouteClass.LAST_AUTH_TIMESTAMP_KEY, timestamp.toString());
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Clear stale authentication timestamps
   */
  private clearStaleAuthTimestamp(): void {
    const lastAuthTimestamp = this.getLastAuthTimestamp();
    if (lastAuthTimestamp > 0) {
      const now = Date.now();
      const timeSinceLastAuth = now - lastAuthTimestamp;
      const staleThreshold = 30000; // 30 seconds

      if (timeSinceLastAuth > staleThreshold) {
        console.log(
          `[COURSE ADMIN AUTH] Clearing stale auth timestamp (${timeSinceLastAuth}ms old)`
        );
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
      return Routes.constructHomeRoute(
        this.routeParams,
        this.props.ManageGroupUrlState,
        this.props.AuthenticationState
      );
    }

    const getUniversityAndCourseForUser = (): {
      universityUserName: string;
      courseUserName: string;
    } => {
      const currentAdmin: Admin | null = isAdmin(currentUser);

      const userCourseField = !currentAdmin ? (currentUser as User).course : undefined;

      if (!currentAdmin && userCourseField && userCourseField !== '-1') {
        const userCourse = userCourseField;

        const courseMembership = groupsOfMembership.find(
          (m) =>
            isCourse(m.group) &&
            (m.group.anid === userCourse || m.group.groupUserName === userCourse)
        );

        if (courseMembership) {
          const parentUniversity = groupsOfMembership.find(
            (m) => m.group.anid === courseMembership.group.parentGroupId
          );

          return {
            universityUserName: parentUniversity
              ? parentUniversity.group.groupUserName
              : 'invest-west',
            courseUserName: courseMembership.group.groupUserName,
          };
        }

        return {
          universityUserName: 'invest-west',
          courseUserName: userCourse,
        };
      }

      const courseMemberships = groupsOfMembership.filter((m) => isCourse(m.group));
      const universityMemberships = groupsOfMembership.filter((m) => isUniversity(m.group));

      if (courseMemberships.length > 0) {
        const firstCourse = courseMemberships[0].group;

        const parentUniversity = groupsOfMembership.find(
          (m) => m.group.anid === firstCourse.parentGroupId
        );

        if (parentUniversity) {
          return {
            universityUserName: parentUniversity.group.groupUserName,
            courseUserName: firstCourse.groupUserName,
          };
        }

        if (firstCourse.parentGroup) {
          return {
            universityUserName: firstCourse.parentGroup.groupUserName,
            courseUserName: firstCourse.groupUserName,
          };
        }

        const courseUserName = firstCourse.groupUserName;
        if (courseUserName.startsWith('invest-west-')) {
          return {
            universityUserName: 'invest-west',
            courseUserName: courseUserName,
          };
        }
      }

      if (universityMemberships.length > 0) {
        const firstUniversity = universityMemberships[0].group;
        return {
          universityUserName: firstUniversity.groupUserName,
          courseUserName: 'student-showcase',
        };
      }

      return {
        universityUserName: 'invest-west',
        courseUserName: 'student-showcase',
      };
    };

    const { universityUserName, courseUserName } = getUniversityAndCourseForUser();

    const currentAdmin: Admin | null = isAdmin(currentUser);

    if (currentAdmin) {
      if (currentAdmin.superAdmin) {
        return Routes.nonGroupAdminDashboard;
      }

      const adminRoute =
        Routes.courseAdminDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home';
      return adminRoute;
    }

    if (isInvestor(currentUser as User)) {
      const investorRoute =
        Routes.courseInvestorDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home';
      return investorRoute;
    } else {
      const issuerRoute =
        Routes.courseIssuerDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home';
      return issuerRoute;
    }
  };

  componentDidMount() {
    this.clearStaleAuthTimestamp();
    this.validateRouteAndAuthentication();
  }

  componentDidUpdate(
    prevProps: Readonly<GroupRouteClassProps>,
    prevState: Readonly<GroupRouteState>,
    snapshot?: any
  ) {
    const justAuthenticated =
      !successfullyAuthenticated(prevProps.AuthenticationState) &&
      successfullyAuthenticated(this.props.AuthenticationState);

    if (justAuthenticated) {
      const now = Date.now();
      this.setLastAuthTimestamp(now);
    }

    const hasSignificantPropsChanged =
      prevProps.AuthenticationState.currentUser !== this.props.AuthenticationState.currentUser ||
      prevProps.ManageSystemAttributesState !== this.props.ManageSystemAttributesState ||
      prevProps.ManageGroupUrlState !== this.props.ManageGroupUrlState ||
      prevProps.location.pathname !== this.props.location.pathname;

    if (!hasSignificantPropsChanged) {
      return;
    }

    if (
      prevProps.AuthenticationState.currentUser !== null &&
      this.props.AuthenticationState.currentUser === null
    ) {
      this.setState({
        navigatingFromSignInOrSignUpToDashboard: false,
        navigatingToSignIn: false,
        navigatingToError: false,
      });
    }

    this.validateRouteAndAuthentication();

    if (isLoadingSystemAttributes(this.props.ManageSystemAttributesState)) {
      return;
    }

    if (isValidatingGroupUrl(this.props.ManageGroupUrlState)) {
      return;
    }

    const isInvestWestRoute = this.routeParams.groupUserName === 'invest-west';

    const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);
    const isProtectedAdminRoute = Routes.isProtectedRoute(this.routePath) && isAdminRoute;

    const isCreateOfferRoute = Routes.isCreateOfferRoute(this.routePath);

    const isCourseDashboardRoute =
      Routes.isIssuerDashboardRoute(this.routePath) ||
      Routes.isInvestorDashboardRoute(this.routePath) ||
      Routes.isGroupAdminRoute(this.routePath);

    if (
      !successfullyValidatedGroupUrl(this.props.ManageGroupUrlState) &&
      !this.state.navigatingToError &&
      !this.state.navigatingFromSignInOrSignUpToDashboard &&
      !isAuthenticating(this.props.AuthenticationState) &&
      !Routes.isSignInRoute(this.routePath) &&
      !Routes.isSignUpRoute(this.routePath) &&
      this.routePath !== Routes.groupViewOffer &&
      this.routePath !== Routes.courseViewOffer &&
      this.routePath !== Routes.nonGroupViewOffer &&
      !isCreateOfferRoute &&
      !isCourseDashboardRoute &&
      !isInvestWestRoute &&
      !isProtectedAdminRoute
    ) {
      this.setState({
        navigatingToError: true,
      });
      this.props.navigate(Routes.error404);
      return;
    }

    if (
      Routes.isProtectedRoute(this.routePath) &&
      !authIsNotInitialized(this.props.AuthenticationState) &&
      !isAuthenticating(this.props.AuthenticationState) &&
      !successfullyAuthenticated(this.props.AuthenticationState) &&
      !this.state.navigatingToSignIn
    ) {
      const { location } = this.props;
      const redirectUrl = `${location.pathname}${location?.search}`;

      const isLoggingOut = safeGetItem('isLoggingOut') === 'true';
      if (!isLoggingOut) {
        safeSetItem('redirectToAfterAuth', redirectUrl);
      }

      this.setState({
        navigatingToSignIn: true,
      });
      this.props.navigate(Routes.constructSignInRoute(this.routeParams));
    }

    const currentUserForRedirect = this.props.AuthenticationState.currentUser;
    const isSuperAdmin = currentUserForRedirect && isAdmin(currentUserForRedirect)?.superAdmin;

    if (
      (Routes.isSignInRoute(this.routePath) || Routes.isSignUpRoute(this.routePath)) &&
      successfullyAuthenticated(this.props.AuthenticationState) &&
      !this.state.navigatingFromSignInOrSignUpToDashboard &&
      (this.props.AuthenticationState.groupsOfMembership.length > 0 || isSuperAdmin)
    ) {
      const storedRedirectUrl = safeGetItem('redirectToAfterAuth');
      let redirectRoute: string;

      if (storedRedirectUrl) {
        redirectRoute = storedRedirectUrl;
        safeRemoveItem('redirectToAfterAuth');
      } else {
        redirectRoute = this.constructPostLoginRoute();
      }

      const urlParts = redirectRoute.split('/');
      if (urlParts.length >= 5 && urlParts[1] === 'groups') {
        // Validation of redirect route
      }

      if (!redirectRoute || redirectRoute === '') {
        console.error('[ROUTING ERROR] Redirect route is empty or null!');
        redirectRoute = '/groups/invest-west';
      }

      if (!redirectRoute.startsWith('/')) {
        redirectRoute = '/' + redirectRoute;
      }

      this.setState({
        navigatingFromSignInOrSignUpToDashboard: true,
      });

      this.props.navigate(redirectRoute);
      return;
    }

    if (
      successfullyAuthenticated(this.props.AuthenticationState) &&
      !this.state.navigatingFromSignInOrSignUpToDashboard
    ) {
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
            const membershipChecks = this.props.AuthenticationState.groupsOfMembership.map(
              (membership) => {
                const matchesUniversity =
                  membership.group.groupUserName === this.routeParams.groupUserName;
                const matchesCourse =
                  this.routeParams.courseUserName &&
                  membership.group.groupUserName === this.routeParams.courseUserName;

                return matchesUniversity || matchesCourse;
              }
            );

            const hasMatchingMembership = membershipChecks.some((match) => match);

            if (!hasMatchingMembership) {
              shouldRedirectToError = true;
            }
          }
        } else if (Routes.isIssuerDashboardRoute(this.routePath)) {
          if (!isIssuer(currentUser)) {
            shouldRedirectToError = true;
          } else if (this.routeParams.courseUserName) {
            if (this.routeParams.groupUserName !== 'invest-west') {
              if (
                this.props.AuthenticationState.groupsOfMembership.filter(
                  (groupOfMembership) =>
                    groupOfMembership.group.groupUserName === this.routeParams.groupUserName
                ).length === 0
              ) {
                shouldRedirectToError = true;
              }
            }
          } else if (
            this.props.AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === this.routeParams.groupUserName
            ).length === 0
          ) {
            shouldRedirectToError = true;
          }
        } else if (Routes.isInvestorDashboardRoute(this.routePath)) {
          if (!isInvestor(currentUser)) {
            shouldRedirectToError = true;
          } else if (this.routeParams.courseUserName) {
            if (this.routeParams.groupUserName === 'invest-west') {
              shouldRedirectToError = false;
            } else {
              const membershipCount = this.props.AuthenticationState.groupsOfMembership.filter(
                (groupOfMembership) =>
                  groupOfMembership.group.groupUserName === this.routeParams.groupUserName
              ).length;

              if (membershipCount === 0) {
                shouldRedirectToError = true;
              }
            }
          } else {
            const membershipCount = this.props.AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === this.routeParams.groupUserName
            ).length;

            if (membershipCount === 0) {
              shouldRedirectToError = true;
            }
          }
        } else if (Routes.isCreateOfferRoute(this.routePath)) {
          const currentAdmin = isAdmin(currentUser);
          if (!isIssuer(currentUser) && !isInvestor(currentUser) && !currentAdmin) {
            shouldRedirectToError = true;
          } else if (this.routeParams.courseUserName) {
            if (this.routeParams.groupUserName !== 'invest-west') {
              if (
                this.props.AuthenticationState.groupsOfMembership.filter(
                  (groupOfMembership) =>
                    groupOfMembership.group.groupUserName === this.routeParams.groupUserName
                ).length === 0
              ) {
                shouldRedirectToError = true;
              }
            }
          } else if (
            this.props.AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === this.routeParams.groupUserName
            ).length === 0
          ) {
            shouldRedirectToError = true;
          }
        }

        if (shouldRedirectToError && !this.state.navigatingToError) {
          this.setState({
            navigatingToError: true,
          });
          this.props.navigate(Routes.error404);
          return;
        }
      }
    }

    if (
      !Routes.isSignInRoute(this.routePath) &&
      !Routes.isSignUpRoute(this.routePath) &&
      this.state.navigatingFromSignInOrSignUpToDashboard
    ) {
      this.setState({
        navigatingFromSignInOrSignUpToDashboard: false,
      });
    }

    if (Routes.isSignInRoute(this.routePath) && this.state.navigatingToSignIn) {
      this.setState({
        navigatingToSignIn: false,
      });
    }

    if (Routes.isErrorRoute(this.routePath) && this.state.navigatingToError) {
      this.setState({
        navigatingToError: false,
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
      backgroundColor,
    } = this.props;

    this.updateRouteAndParams();

    const loadingSystemAttrs = isLoadingSystemAttributes(ManageSystemAttributesState);
    const validatingGroupUrl = isValidatingGroupUrl(ManageGroupUrlState);
    const groupUrlValidated = successfullyValidatedGroupUrl(ManageGroupUrlState);
    const authNotInitialized = authIsNotInitialized(AuthenticationState);
    const isAuthenticatingUser = isAuthenticating(AuthenticationState);

    const isPublicRoute = !Routes.isProtectedRoute(this.routePath);

    if (
      loadingSystemAttrs ||
      validatingGroupUrl ||
      (groupUrlValidated && authNotInitialized && !isPublicRoute) ||
      (!Routes.isSignInRoute(this.routePath) &&
        !Routes.isSignUpRoute(this.routePath) &&
        isAuthenticatingUser &&
        !isPublicRoute)
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
            height: backgroundColor !== undefined ? '100%' : 'none',
            minHeight: backgroundColor !== undefined ? '100vh' : 'none',
            backgroundColor: backgroundColor ?? 'none',
          }}
        >
          {!showHeader ? null : (
            <Row noGutters>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Header
                  routePath={this.routePath}
                  homUrl={Routes.constructHomeRoute(
                    this.routeParams,
                    ManageGroupUrlState,
                    AuthenticationState
                  )}
                  dashboardUrl={Routes.constructDashboardRoute(
                    this.routeParams,
                    ManageGroupUrlState,
                    AuthenticationState
                  )}
                  signInUrl={Routes.constructSignInRoute(this.routeParams)}
                />
              </Col>
            </Row>
          )}

          <Row noGutters>
            <Box width="100%" height="100%">
              {this.props.component}
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

    const groupUserNameParam = this.routeParams.hasOwnProperty('groupUserName')
      ? this.routeParams.groupUserName
      : this.routePath === Routes.nonGroupSignIn || this.routePath === Routes.nonGroupSignUp
        ? 'invest-west'
        : this.routePath === Routes.superAdminSignIn
          ? null
          : 'invest-west';

    const courseUserNameParam = this.routeParams.hasOwnProperty('courseUserName')
      ? this.routeParams.courseUserName
      : null;

    this.props.validateGroupUrl(this.routePath, groupUserNameParam, courseUserNameParam);

    this.attachAuthListener();
  };

  updateRouteAndParams = () => {
    this.routePath = this.props.matchedPattern || '';
    this.routeParams = this.props.params;
  };

  attachAuthListener = () => {
    const { ManageGroupUrlState } = this.props;

    const isProjectViewRoute =
      this.routePath === Routes.groupViewOffer ||
      this.routePath === Routes.nonGroupViewOffer ||
      this.routePath === Routes.courseViewOffer;

    const isAdminRoute = Routes.isGroupAdminRoute(this.routePath);

    if (
      (successfullyValidatedGroupUrl(ManageGroupUrlState) || isProjectViewRoute || isAdminRoute) &&
      !this.authListener
    ) {
      this.authListener = firebase.auth().onAuthStateChanged((firebaseUser) => {
        const now = Date.now();
        const isCurrentlyAuthenticating = isAuthenticating(this.props.AuthenticationState);
        const isAlreadyAuthenticated = successfullyAuthenticated(this.props.AuthenticationState);

        const isInitialCheck = !this.hasCompletedInitialAuthCheck;
        if (isInitialCheck) {
          this.hasCompletedInitialAuthCheck = true;
        }

        const lastAuthTimestamp = this.getLastAuthTimestamp();
        const timeSinceLastAuth = now - lastAuthTimestamp;
        const isWithinGracePeriod = timeSinceLastAuth < 10000;

        if (firebaseUser) {
          this.props.signIn();
        } else {
          const willSignOut =
            !isCurrentlyAuthenticating &&
            !isAlreadyAuthenticated &&
            !isWithinGracePeriod &&
            !isInitialCheck;

          if (willSignOut) {
            this.setLastAuthTimestamp(0);
            this.props.signOut();
          }
        }
      });
    }
  };

  detachAuthListener = () => {
    if (this.authListener) {
      this.authListener();
      this.authListener = null;
      this.hasCompletedInitialAuthCheck = false;
    }
  };
}

const ConnectedGroupRouteClass = connect(mapStateToProps, mapDispatchToProps)(GroupRouteClass);

/**
 * Functional wrapper that injects React Router v6 hooks into the class component.
 * This replaces the v5 RouteComponentProps pattern.
 */
function GroupRoute(props: GroupRouteLocalProps) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the matched route pattern by checking against known routes
  // In v6, we use location.pathname and match against route definitions
  const matchedPattern = useMatchedRoutePattern(location.pathname);

  return (
    <ConnectedGroupRouteClass
      {...props}
      params={params}
      navigate={navigate}
      location={location}
      matchedPattern={matchedPattern}
    />
  );
}

/**
 * Custom hook to determine which route pattern matched the current pathname.
 * This replaces the v5 match.path which gave us the route pattern (e.g., "/groups/:groupUserName/:courseUserName/admin")
 */
function useMatchedRoutePattern(pathname: string): string {
  // Try all known route patterns and return the one that matches
  const allRoutePatterns = [
    Routes.courseSignUp,
    Routes.groupSignUp,
    Routes.nonGroupSignUp,
    Routes.courseFront,
    Routes.groupFront,
    Routes.nonGroupFront,
    Routes.courseAbout,
    Routes.groupAbout,
    Routes.nonGroupAbout,
    Routes.courseHiw,
    Routes.groupHiw,
    Routes.nonGroupHiw,
    Routes.courseContact,
    Routes.groupContact,
    Routes.nonGroupContact,
    Routes.courseExploreFront,
    Routes.groupExploreFront,
    Routes.nonGroupExploreFront,
    Routes.courseSignIn,
    Routes.groupSignIn,
    Routes.nonGroupSignIn,
    Routes.superAdminSignIn,
    Routes.courseAdminDashboard,
    Routes.groupAdminDashboard,
    Routes.nonGroupAdminDashboard,
    Routes.courseIssuerDashboard,
    Routes.groupIssuerDashboard,
    Routes.nonGroupIssuerDashboard,
    Routes.courseInvestorDashboard,
    Routes.groupInvestorDashboard,
    Routes.nonGroupInvestorDashboard,
    Routes.courseViewOffer,
    Routes.groupViewOffer,
    Routes.nonGroupViewOffer,
    Routes.courseCreateOffer,
    Routes.groupCreateOffer,
    Routes.nonGroupCreateOffer,
    Routes.courseViewGroup,
    Routes.groupViewGroup,
    Routes.nonGroupViewGroup,
    Routes.courseViewUserProfile,
    Routes.groupViewUserProfile,
    Routes.nonGroupViewUserProfile,
    Routes.courseViewResourceDetail,
    Routes.groupViewResourceDetail,
    Routes.nonGroupViewResourceDetail,
    Routes.courseEditUserProfile,
    Routes.groupEditUserProfile,
    Routes.nonGroupEditUserProfile,
    Routes.courseHelp,
    Routes.groupHelp,
    Routes.courseContactUs,
    Routes.groupContactUs,
    Routes.nonGroupContactUs,
    Routes.nonGroupPrivacyPolicy,
    Routes.nonGroupTermsOfUse,
    Routes.nonGroupRiskWarning,
    Routes.nonGroupCreatePitchTermsAndConditions,
    Routes.nonGroupMarketingPreferences,
    Routes.nonGroupAuthAction,
    Routes.error404,
    '/admin-upgrade/:requestId',
  ];

  // Convert route pattern to regex and test against pathname
  for (const pattern of allRoutePatterns) {
    if (matchesPattern(pathname, pattern)) {
      return pattern;
    }
  }

  return '';
}

/**
 * Tests if a pathname matches a route pattern (e.g., "/groups/:groupUserName/admin")
 */
function matchesPattern(pathname: string, pattern: string): boolean {
  // Remove query string from pathname
  const pathOnly = pathname.split('?')[0];

  // Convert route pattern to regex
  // Replace :paramName with a regex group that matches any non-slash characters
  // Handle optional params like :id?
  const regexStr = pattern
    .replace(/:[a-zA-Z]+\?/g, '([^/]*)?') // optional params
    .replace(/:[a-zA-Z]+/g, '([^/]+)'); // required params

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(pathOnly);
}

export default GroupRoute;
