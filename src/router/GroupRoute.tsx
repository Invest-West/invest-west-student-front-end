import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  getGroupRouteTheme,
  isValidatingGroupUrl,
  successfullyValidatedGroupUrl,
} from '../redux-store/reducers/manageGroupUrlReducer';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Routes from './routes';
import { validateGroupUrl } from '../redux-store/actions/manageGroupUrlActions';
import {
  authIsNotInitialized,
  isAuthenticating,
  successfullyAuthenticated,
} from '../redux-store/reducers/authenticationReducer';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../shared-components/header/Header';
import { signIn, signOut } from '../redux-store/actions/authenticationActions';
import firebase from '../firebase/firebaseApp';
import { Box } from '@mui/material';
import { isLoadingSystemAttributes } from '../redux-store/reducers/manageSystemAttributesReducer';
import { loadSystemAttributes } from '../redux-store/actions/manageSystemAttributesActions';
import User, { isInvestor, isIssuer } from '../models/user';
import Admin, { isAdmin } from '../models/admin';
import { isCourse, isUniversity } from '../models/group_properties';
import { BarLoader } from 'react-spinners';
import { safeSetItem, safeGetItem, safeRemoveItem } from '../utils/browser';
import { useAppSelector, useAppDispatch } from '../redux-store/hooks';

interface GroupRouteProps {
  showHeader: boolean;
  backgroundColor?: string;
  component: React.ReactNode;
}

const LAST_AUTH_TIMESTAMP_KEY = 'lastSuccessfulAuthTimestamp';

function getLastAuthTimestamp(): number {
  try {
    const stored = sessionStorage.getItem(LAST_AUTH_TIMESTAMP_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function setLastAuthTimestamp(timestamp: number): void {
  try {
    sessionStorage.setItem(LAST_AUTH_TIMESTAMP_KEY, timestamp.toString());
  } catch {
    // Ignore storage errors
  }
}

function GroupRoute({ showHeader, backgroundColor, component }: GroupRouteProps) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ManageSystemAttributesState = useAppSelector((state) => state.ManageSystemAttributesState);
  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);

  const matchedPattern = useMatchedRoutePattern(location.pathname);

  // Navigation state (replaces this.state)
  const [navigatingFromSignInOrSignUpToDashboard, setNavigatingFromSignInOrSignUpToDashboard] =
    useState(false);
  const [navigatingToSignIn, setNavigatingToSignIn] = useState(false);
  const [navigatingToError, setNavigatingToError] = useState(false);

  // Instance refs (replaces class instance variables)
  const authListenerRef = useRef<firebase.default.Unsubscribe | null>(null);
  const hasCompletedInitialAuthCheckRef = useRef(false);

  // Track previous values for componentDidUpdate logic
  const prevAuthStateRef = useRef(AuthenticationState);
  const prevSystemAttrsRef = useRef(ManageSystemAttributesState);
  const prevGroupUrlRef = useRef(ManageGroupUrlState);
  const prevPathnameRef = useRef(location.pathname);

  // Current route info (replaces this.routePath / this.routeParams, updated on each render)
  const routePath = matchedPattern;
  const routeParams = params;

  // --- Helper functions ---

  const constructPostLoginRoute = useCallback((): string => {
    const currentUser = AuthenticationState.currentUser;
    const groupsOfMembership = AuthenticationState.groupsOfMembership || [];

    if (!currentUser) {
      return Routes.constructHomeRoute(routeParams, ManageGroupUrlState, AuthenticationState);
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
      return (
        Routes.courseAdminDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home'
      );
    }

    if (isInvestor(currentUser as User)) {
      return (
        Routes.courseInvestorDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home'
      );
    } else {
      return (
        Routes.courseIssuerDashboard
          .replace(':groupUserName', universityUserName)
          .replace(':courseUserName', courseUserName) + '?tab=Home'
      );
    }
  }, [AuthenticationState, ManageGroupUrlState, routeParams]);

  const attachAuthListener = useCallback(() => {
    const isProjectViewRoute =
      routePath === Routes.groupViewOffer ||
      routePath === Routes.nonGroupViewOffer ||
      routePath === Routes.courseViewOffer;

    const isAdminRoute = Routes.isGroupAdminRoute(routePath);

    if (
      (successfullyValidatedGroupUrl(ManageGroupUrlState) || isProjectViewRoute || isAdminRoute) &&
      !authListenerRef.current
    ) {
      authListenerRef.current = firebase.auth().onAuthStateChanged((firebaseUser) => {
        const now = Date.now();
        const isCurrentlyAuthenticating = isAuthenticating(AuthenticationState);
        const isAlreadyAuthenticated = successfullyAuthenticated(AuthenticationState);

        const isInitialCheck = !hasCompletedInitialAuthCheckRef.current;
        if (isInitialCheck) {
          hasCompletedInitialAuthCheckRef.current = true;
        }

        const lastAuthTimestamp = getLastAuthTimestamp();
        const timeSinceLastAuth = now - lastAuthTimestamp;
        const isWithinGracePeriod = timeSinceLastAuth < 10000;

        if (firebaseUser) {
          dispatch(signIn());
        } else {
          const willSignOut =
            !isCurrentlyAuthenticating &&
            !isAlreadyAuthenticated &&
            !isWithinGracePeriod &&
            !isInitialCheck;

          if (willSignOut) {
            setLastAuthTimestamp(0);
            dispatch(signOut());
          }
        }
      });
    }
  }, [routePath, ManageGroupUrlState, AuthenticationState, dispatch]);

  const detachAuthListener = useCallback(() => {
    if (authListenerRef.current) {
      authListenerRef.current();
      authListenerRef.current = null;
      hasCompletedInitialAuthCheckRef.current = false;
    }
  }, []);

  const validateRouteAndAuthentication = useCallback(() => {
    dispatch(loadSystemAttributes());

    const groupUserNameParam = routeParams.hasOwnProperty('groupUserName')
      ? routeParams.groupUserName!
      : routePath === Routes.nonGroupSignIn || routePath === Routes.nonGroupSignUp
        ? 'invest-west'
        : routePath === Routes.superAdminSignIn
          ? null
          : 'invest-west';

    const courseUserNameParam = routeParams.hasOwnProperty('courseUserName')
      ? routeParams.courseUserName!
      : null;

    dispatch(validateGroupUrl(routePath, groupUserNameParam, courseUserNameParam));

    attachAuthListener();
  }, [dispatch, routePath, routeParams, attachAuthListener]);

  // componentDidMount: clear stale auth and validate
  useEffect(() => {
    // Clear stale auth timestamp
    const lastAuthTimestamp = getLastAuthTimestamp();
    if (lastAuthTimestamp > 0) {
      const timeSinceLastAuth = Date.now() - lastAuthTimestamp;
      if (timeSinceLastAuth > 30000) {
        setLastAuthTimestamp(0);
      }
    }

    validateRouteAndAuthentication();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentWillUnmount: detach auth listener
  useEffect(() => {
    return () => {
      detachAuthListener();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentDidUpdate: handle auth/routing state changes
  useEffect(() => {
    const prevAuthState = prevAuthStateRef.current;

    const justAuthenticated =
      !successfullyAuthenticated(prevAuthState) && successfullyAuthenticated(AuthenticationState);

    if (justAuthenticated) {
      setLastAuthTimestamp(Date.now());
    }

    const hasSignificantPropsChanged =
      prevAuthState.currentUser !== AuthenticationState.currentUser ||
      prevSystemAttrsRef.current !== ManageSystemAttributesState ||
      prevGroupUrlRef.current !== ManageGroupUrlState ||
      prevPathnameRef.current !== location.pathname;

    // Update prev refs
    prevAuthStateRef.current = AuthenticationState;
    prevSystemAttrsRef.current = ManageSystemAttributesState;
    prevGroupUrlRef.current = ManageGroupUrlState;
    prevPathnameRef.current = location.pathname;

    if (!hasSignificantPropsChanged) {
      return;
    }

    if (prevAuthState.currentUser !== null && AuthenticationState.currentUser === null) {
      setNavigatingFromSignInOrSignUpToDashboard(false);
      setNavigatingToSignIn(false);
      setNavigatingToError(false);
    }

    validateRouteAndAuthentication();

    if (isLoadingSystemAttributes(ManageSystemAttributesState)) {
      return;
    }

    if (isValidatingGroupUrl(ManageGroupUrlState)) {
      return;
    }

    const isInvestWestRoute = routeParams.groupUserName === 'invest-west';
    const isAdminRoute = Routes.isGroupAdminRoute(routePath);
    const isProtectedAdminRoute = Routes.isProtectedRoute(routePath) && isAdminRoute;
    const isCreateOfferRoute = Routes.isCreateOfferRoute(routePath);
    const isCourseDashboardRoute =
      Routes.isIssuerDashboardRoute(routePath) ||
      Routes.isInvestorDashboardRoute(routePath) ||
      Routes.isGroupAdminRoute(routePath);

    if (
      !successfullyValidatedGroupUrl(ManageGroupUrlState) &&
      !navigatingToError &&
      !navigatingFromSignInOrSignUpToDashboard &&
      !isAuthenticating(AuthenticationState) &&
      !Routes.isSignInRoute(routePath) &&
      !Routes.isSignUpRoute(routePath) &&
      routePath !== Routes.groupViewOffer &&
      routePath !== Routes.courseViewOffer &&
      routePath !== Routes.nonGroupViewOffer &&
      !isCreateOfferRoute &&
      !isCourseDashboardRoute &&
      !isInvestWestRoute &&
      !isProtectedAdminRoute
    ) {
      setNavigatingToError(true);
      navigate(Routes.error404);
      return;
    }

    if (
      Routes.isProtectedRoute(routePath) &&
      !authIsNotInitialized(AuthenticationState) &&
      !isAuthenticating(AuthenticationState) &&
      !successfullyAuthenticated(AuthenticationState) &&
      !navigatingToSignIn
    ) {
      const redirectUrl = `${location.pathname}${location?.search}`;
      const isLoggingOut = safeGetItem('isLoggingOut') === 'true';
      if (!isLoggingOut) {
        safeSetItem('redirectToAfterAuth', redirectUrl);
      }

      setNavigatingToSignIn(true);
      navigate(Routes.constructSignInRoute(routeParams));
    }

    const currentUserForRedirect = AuthenticationState.currentUser;
    const isSuperAdmin = currentUserForRedirect && isAdmin(currentUserForRedirect)?.superAdmin;

    if (
      (Routes.isSignInRoute(routePath) || Routes.isSignUpRoute(routePath)) &&
      successfullyAuthenticated(AuthenticationState) &&
      !navigatingFromSignInOrSignUpToDashboard &&
      (AuthenticationState.groupsOfMembership.length > 0 || isSuperAdmin)
    ) {
      const storedRedirectUrl = safeGetItem('redirectToAfterAuth');
      let redirectRoute: string;

      if (storedRedirectUrl) {
        redirectRoute = storedRedirectUrl;
        safeRemoveItem('redirectToAfterAuth');
      } else {
        redirectRoute = constructPostLoginRoute();
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

      setNavigatingFromSignInOrSignUpToDashboard(true);
      navigate(redirectRoute);
      return;
    }

    if (
      successfullyAuthenticated(AuthenticationState) &&
      !navigatingFromSignInOrSignUpToDashboard
    ) {
      const currentUser: User | Admin | null = AuthenticationState.currentUser;

      if (currentUser) {
        const currentAdmin: Admin | null = isAdmin(currentUser);
        let shouldRedirectToError: boolean = false;

        if (Routes.isRouteReservedForSuperAdmin(routePath)) {
          if (!currentAdmin || (currentAdmin && !currentAdmin.superAdmin)) {
            shouldRedirectToError = true;
          }
        } else if (Routes.isGroupAdminRoute(routePath)) {
          if (!currentAdmin) {
            shouldRedirectToError = true;
          } else {
            const membershipChecks = AuthenticationState.groupsOfMembership.map((membership) => {
              const matchesUniversity =
                membership.group.groupUserName === routeParams.groupUserName;
              const matchesCourse =
                routeParams.courseUserName &&
                membership.group.groupUserName === routeParams.courseUserName;
              return matchesUniversity || matchesCourse;
            });

            const hasMatchingMembership = membershipChecks.some((match) => match);
            if (!hasMatchingMembership) {
              shouldRedirectToError = true;
            }
          }
        } else if (Routes.isIssuerDashboardRoute(routePath)) {
          if (!isIssuer(currentUser)) {
            shouldRedirectToError = true;
          } else if (routeParams.courseUserName) {
            if (routeParams.groupUserName !== 'invest-west') {
              if (
                AuthenticationState.groupsOfMembership.filter(
                  (groupOfMembership) =>
                    groupOfMembership.group.groupUserName === routeParams.groupUserName
                ).length === 0
              ) {
                shouldRedirectToError = true;
              }
            }
          } else if (
            AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === routeParams.groupUserName
            ).length === 0
          ) {
            shouldRedirectToError = true;
          }
        } else if (Routes.isInvestorDashboardRoute(routePath)) {
          if (!isInvestor(currentUser)) {
            shouldRedirectToError = true;
          } else if (routeParams.courseUserName) {
            if (routeParams.groupUserName === 'invest-west') {
              shouldRedirectToError = false;
            } else {
              const membershipCount = AuthenticationState.groupsOfMembership.filter(
                (groupOfMembership) =>
                  groupOfMembership.group.groupUserName === routeParams.groupUserName
              ).length;
              if (membershipCount === 0) {
                shouldRedirectToError = true;
              }
            }
          } else {
            const membershipCount = AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === routeParams.groupUserName
            ).length;
            if (membershipCount === 0) {
              shouldRedirectToError = true;
            }
          }
        } else if (Routes.isCreateOfferRoute(routePath)) {
          const currentAdminCheck = isAdmin(currentUser);
          if (!isIssuer(currentUser) && !isInvestor(currentUser) && !currentAdminCheck) {
            shouldRedirectToError = true;
          } else if (routeParams.courseUserName) {
            if (routeParams.groupUserName !== 'invest-west') {
              if (
                AuthenticationState.groupsOfMembership.filter(
                  (groupOfMembership) =>
                    groupOfMembership.group.groupUserName === routeParams.groupUserName
                ).length === 0
              ) {
                shouldRedirectToError = true;
              }
            }
          } else if (
            AuthenticationState.groupsOfMembership.filter(
              (groupOfMembership) =>
                groupOfMembership.group.groupUserName === routeParams.groupUserName
            ).length === 0
          ) {
            shouldRedirectToError = true;
          }
        }

        if (shouldRedirectToError && !navigatingToError) {
          setNavigatingToError(true);
          navigate(Routes.error404);
          return;
        }
      }
    }

    if (
      !Routes.isSignInRoute(routePath) &&
      !Routes.isSignUpRoute(routePath) &&
      navigatingFromSignInOrSignUpToDashboard
    ) {
      setNavigatingFromSignInOrSignUpToDashboard(false);
    }

    if (Routes.isSignInRoute(routePath) && navigatingToSignIn) {
      setNavigatingToSignIn(false);
    }

    if (Routes.isErrorRoute(routePath) && navigatingToError) {
      setNavigatingToError(false);
    }
  }); // Runs on every render, matching componentDidUpdate behavior

  // --- Render ---

  const loadingSystemAttrs = isLoadingSystemAttributes(ManageSystemAttributesState);
  const validatingGroupUrl = isValidatingGroupUrl(ManageGroupUrlState);
  const groupUrlValidated = successfullyValidatedGroupUrl(ManageGroupUrlState);
  const authNotInitialized = authIsNotInitialized(AuthenticationState);
  const isAuthenticatingUser = isAuthenticating(AuthenticationState);
  const isPublicRoute = !Routes.isProtectedRoute(routePath);

  if (
    loadingSystemAttrs ||
    validatingGroupUrl ||
    (groupUrlValidated && authNotInitialized && !isPublicRoute) ||
    (!Routes.isSignInRoute(routePath) &&
      !Routes.isSignUpRoute(routePath) &&
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
                routePath={routePath}
                homUrl={Routes.constructHomeRoute(
                  routeParams,
                  ManageGroupUrlState,
                  AuthenticationState
                )}
                dashboardUrl={Routes.constructDashboardRoute(
                  routeParams,
                  ManageGroupUrlState,
                  AuthenticationState
                )}
                signInUrl={Routes.constructSignInRoute(routeParams)}
              />
            </Col>
          </Row>
        )}

        <Row noGutters>
          <Box width="100%" height="100%">
            {component}
          </Box>
        </Row>
      </Container>
    );
  }

  return null;
}

/**
 * Custom hook to determine which route pattern matched the current pathname.
 * This replaces the v5 match.path which gave us the route pattern.
 */
function useMatchedRoutePattern(pathname: string): string {
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
  const pathOnly = pathname.split('?')[0];
  const regexStr = pattern
    .replace(/:[a-zA-Z]+\?/g, '([^/]*)?') // optional params
    .replace(/:[a-zA-Z]+/g, '([^/]+)'); // required params
  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(pathOnly);
}

export default GroupRoute;
