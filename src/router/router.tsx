import React from 'react';
import { BrowserRouter, Route, Routes as ReactRouterRoutes, useParams } from 'react-router-dom';
import IssuerDashboard from '../pages/dashboard-issuer/IssuerDashboard';
import InvestorDashboard from '../pages/dashboard-investor/InvestorDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CreatePitchPage from '../pages/create-project/CreateProject';
import UserProfile from '../pages/profile/ProfilePageViewOnly';
import ProjectDetails from '../pages/project-details/ProjectDetails';
import PrivacyPolicyPage from '../pages/system-public-pages/PrivacyPolicyPage';
import TermsOfUsePage from '../pages/system-public-pages/TermsOfUsePage';
import RiskWarningPage from '../pages/system-public-pages/RiskWarningPage';
import CreatePitchTermsAndConditionsPage from '../pages/system-public-pages/CreatePitchTermsAndConditionsPage';
import ContactUs from '../pages/system-public-pages/ContactUs';
import HelpPage from '../pages/system-public-pages/HelpPage';
import GroupDetails from '../pages/group-details/GroupDetails';
import MarketingPreferencesPage from '../pages/system-public-pages/MarketingPreferencesPage';
import ProfilePageEditable from '../pages/profile/ProfilePageEditable';

import Front from '../pages/front/Front';
import About from '../pages/front/About';
import Hiw from '../pages/front/Hiw';
import Contact from '../pages/front/Contact';
import ExploreFront from '../pages/front/ExploreFront';
import SignIn from '../pages/signin/SignInNew';
import PageNotFound from '../shared-components/page-not-found/PageNotFoundNew';
import ErrorBoundary from './ErrorBoundary';
import RouteDefs from './routes';
import GroupRoute from './GroupRoute';
import ResetPassword from '../pages/reset-password/ResetPassword';
import ResourceDetail from '../pages/resources/pages/ResourceDetail';
import SignUpNew from '../pages/signup/SignUpNew';
import CourseSetupPage from '../pages/setup/CourseSetupPage';
import UniAdminSignup from '../pages/uni-admin-signup/UniAdminSignup';
import CourseAdminSignup from '../pages/course-admin-signup/CourseAdminSignup';
import AdminUpgradeResponse from '../pages/admin-upgrade-response/AdminUpgradeResponse';
import { colors } from '@mui/material';

/**
 * Parameters in the url
 */
export interface RouteParams {
  groupUserName: string;
  courseUserName?: string;

  [params: string]: string | undefined;
}

/**
 * Debug route component - displays route parameter information
 */
function RouteParamsDebug() {
  const params = useParams();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Route Parameters Debug</h1>
      <p>
        <strong>Group User Name:</strong> {params.groupUserName}
      </p>
      <p>
        <strong>Course User Name:</strong> {params.courseUserName}
      </p>
      <p>
        <strong>Full Params:</strong> {JSON.stringify(params, null, 2)}
      </p>
    </div>
  );
}

/**
 * Direct admin test route component
 */
function DirectAdminTest() {
  const params = useParams();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Direct Admin Test</h1>
      <p>This route bypasses GroupRoute validation</p>
      <p>
        <strong>Group:</strong> {params.groupUserName}
      </p>
      <p>
        <strong>Course:</strong> {params.courseUserName}
      </p>
      <p>If you see this, route matching is working correctly!</p>
      <p>The issue is likely in GroupRoute validation logic.</p>
    </div>
  );
}

const AppRouter = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <ReactRouterRoutes>
        {/** Course setup route - temporary for database setup */}
        <Route path="/setup-courses" element={<CourseSetupPage />} />

        {/** Debug route - for testing course navigation */}
        <Route
          path="/debug-admin"
          element={
            <div style={{ padding: '20px' }}>
              <h1>Course Navigation Debug</h1>
              <p>Current URL: {window.location.href}</p>
              <h3>Test Course Routes:</h3>
              <a
                href="/groups/invest-west/student-showcase/admin?tab=Home"
                style={{ display: 'block', margin: '10px 0' }}
              >
                Admin Dashboard
              </a>
              <a
                href="/groups/invest-west/student-showcase/dashboard/investor?tab=Home"
                style={{ display: 'block', margin: '10px 0' }}
              >
                Investor Dashboard
              </a>
              <a
                href="/groups/invest-west/student-showcase/dashboard/issuer?tab=Home"
                style={{ display: 'block', margin: '10px 0' }}
              >
                Issuer Dashboard
              </a>
              <a
                href="/groups/invest-west/student-showcase"
                style={{ display: 'block', margin: '10px 0' }}
              >
                Course Front Page
              </a>
            </div>
          }
        />

        {/** Route Parameter Debug - test what params are being extracted */}
        <Route path="/groups/:groupUserName/:courseUserName/debug" element={<RouteParamsDebug />} />

        {/** Direct Admin Test - bypass GroupRoute wrapper */}
        <Route
          path="/groups/:groupUserName/:courseUserName/test-admin"
          element={<DirectAdminTest />}
        />

        {/** University Admin Signup - public route for invited university admins */}
        <Route path="/uni-admin-signup/:token" element={<UniAdminSignup />} />

        {/** Course Admin Signup - public route for invited course admins/lecturers */}
        <Route path="/course-admin-signup/:token" element={<CourseAdminSignup />} />

        {/** Admin Upgrade Response - protected route for existing users to accept/decline admin role */}
        <Route
          path="/admin-upgrade/:requestId"
          element={<GroupRoute showHeader={true} component={<AdminUpgradeResponse />} />}
        />

        <Route
          path={RouteDefs.courseSignUp}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignUpNew />}
            />
          }
        />

        <Route
          path={RouteDefs.groupSignUp}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignUpNew />}
            />
          }
        />

        <Route
          path={RouteDefs.nonGroupSignUp}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignUpNew />}
            />
          }
        />
        <Route
          path={RouteDefs.nonGroupFront}
          element={<GroupRoute showHeader={false} component={<Front />} />}
        />
        <Route
          path={RouteDefs.courseFront}
          element={<GroupRoute showHeader={false} component={<Front />} />}
        />
        <Route
          path={RouteDefs.groupFront}
          element={<GroupRoute showHeader={false} component={<Front />} />}
        />
        <Route
          path={RouteDefs.nonGroupAbout}
          element={<GroupRoute showHeader={false} component={<About />} />}
        />
        <Route
          path={RouteDefs.courseAbout}
          element={<GroupRoute showHeader={false} component={<About />} />}
        />
        <Route
          path={RouteDefs.groupAbout}
          element={<GroupRoute showHeader={false} component={<About />} />}
        />

        <Route
          path={RouteDefs.nonGroupHiw}
          element={<GroupRoute showHeader={false} component={<Hiw />} />}
        />

        <Route
          path={RouteDefs.courseHiw}
          element={<GroupRoute showHeader={false} component={<Hiw />} />}
        />
        <Route
          path={RouteDefs.groupHiw}
          element={<GroupRoute showHeader={false} component={<Hiw />} />}
        />

        <Route
          path={RouteDefs.nonGroupContact}
          element={<GroupRoute showHeader={false} component={<Contact />} />}
        />

        <Route
          path={RouteDefs.courseContact}
          element={<GroupRoute showHeader={false} component={<Contact />} />}
        />
        <Route
          path={RouteDefs.groupContact}
          element={<GroupRoute showHeader={false} component={<Contact />} />}
        />

        <Route
          path={RouteDefs.nonGroupExploreFront}
          element={<GroupRoute showHeader={false} component={<ExploreFront />} />}
        />

        <Route
          path={RouteDefs.courseExploreFront}
          element={<GroupRoute showHeader={false} component={<ExploreFront />} />}
        />
        <Route
          path={RouteDefs.groupExploreFront}
          element={<GroupRoute showHeader={false} component={<ExploreFront />} />}
        />

        <Route
          path={RouteDefs.nonGroupSignIn}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignIn />}
            />
          }
        />
        <Route
          path={RouteDefs.courseSignIn}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignIn />}
            />
          }
        />
        <Route
          path={RouteDefs.groupSignIn}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignIn />}
            />
          }
        />
        <Route
          path={RouteDefs.superAdminSignIn}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<SignIn />}
            />
          }
        />

        <Route
          path={RouteDefs.courseAdminDashboard}
          element={<GroupRoute showHeader={false} component={<AdminDashboard />} />}
        />
        <Route
          path={RouteDefs.groupAdminDashboard}
          element={<GroupRoute showHeader={false} component={<AdminDashboard />} />}
        />
        <Route
          path={RouteDefs.nonGroupAdminDashboard}
          element={<GroupRoute showHeader={false} component={<AdminDashboard />} />}
        />

        <Route
          path={RouteDefs.courseIssuerDashboard}
          element={<GroupRoute showHeader={false} component={<IssuerDashboard />} />}
        />
        <Route
          path={RouteDefs.groupIssuerDashboard}
          element={<GroupRoute showHeader={false} component={<IssuerDashboard />} />}
        />
        <Route
          path={RouteDefs.nonGroupIssuerDashboard}
          element={<GroupRoute showHeader={false} component={<IssuerDashboard />} />}
        />

        <Route
          path={RouteDefs.courseInvestorDashboard}
          element={<GroupRoute showHeader={false} component={<InvestorDashboard />} />}
        />
        <Route
          path={RouteDefs.groupInvestorDashboard}
          element={<GroupRoute showHeader={false} component={<InvestorDashboard />} />}
        />
        <Route
          path={RouteDefs.nonGroupInvestorDashboard}
          element={<GroupRoute showHeader={false} component={<InvestorDashboard />} />}
        />

        <Route
          path={RouteDefs.courseViewOffer}
          element={<GroupRoute showHeader={true} component={<ProjectDetails />} />}
        />
        <Route
          path={RouteDefs.groupViewOffer}
          element={<GroupRoute showHeader={true} component={<ProjectDetails />} />}
        />
        <Route
          path={RouteDefs.nonGroupViewOffer}
          element={<GroupRoute showHeader={true} component={<ProjectDetails />} />}
        />

        <Route
          path={RouteDefs.courseCreateOffer}
          element={<GroupRoute showHeader={true} component={<CreatePitchPage />} />}
        />
        <Route
          path={RouteDefs.groupCreateOffer}
          element={<GroupRoute showHeader={true} component={<CreatePitchPage />} />}
        />
        <Route
          path={RouteDefs.nonGroupCreateOffer}
          element={<GroupRoute showHeader={true} component={<CreatePitchPage />} />}
        />

        <Route
          path={RouteDefs.nonGroupViewGroup}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<GroupDetails />}
            />
          }
        />
        <Route
          path={RouteDefs.courseViewGroup}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<GroupDetails />}
            />
          }
        />
        <Route
          path={RouteDefs.groupViewGroup}
          element={
            <GroupRoute
              showHeader={true}
              backgroundColor={colors.grey['200']}
              component={<GroupDetails />}
            />
          }
        />

        <Route
          path={RouteDefs.nonGroupViewUserProfile}
          element={<GroupRoute showHeader={true} component={<UserProfile />} />}
        />
        <Route
          path={RouteDefs.courseViewUserProfile}
          element={<GroupRoute showHeader={true} component={<UserProfile />} />}
        />
        <Route
          path={RouteDefs.groupViewUserProfile}
          element={<GroupRoute showHeader={true} component={<UserProfile />} />}
        />

        <Route
          path={RouteDefs.nonGroupViewResourceDetail}
          element={<GroupRoute showHeader={true} component={<ResourceDetail />} />}
        />
        <Route
          path={RouteDefs.courseViewResourceDetail}
          element={<GroupRoute showHeader={true} component={<ResourceDetail />} />}
        />
        <Route
          path={RouteDefs.groupViewResourceDetail}
          element={<GroupRoute showHeader={true} component={<ResourceDetail />} />}
        />

        <Route
          path={RouteDefs.nonGroupEditUserProfile}
          element={<GroupRoute showHeader={true} component={<ProfilePageEditable />} />}
        />
        <Route
          path={RouteDefs.courseEditUserProfile}
          element={<GroupRoute showHeader={true} component={<ProfilePageEditable />} />}
        />
        <Route
          path={RouteDefs.groupEditUserProfile}
          element={<GroupRoute showHeader={true} component={<ProfilePageEditable />} />}
        />

        <Route
          path={RouteDefs.courseHelp}
          element={<GroupRoute showHeader={true} component={<HelpPage />} />}
        />
        <Route
          path={RouteDefs.groupHelp}
          element={<GroupRoute showHeader={true} component={<HelpPage />} />}
        />

        <Route
          path={RouteDefs.nonGroupContactUs}
          element={<GroupRoute showHeader={true} component={<ContactUs />} />}
        />
        <Route
          path={RouteDefs.courseContactUs}
          element={<GroupRoute showHeader={true} component={<ContactUs />} />}
        />
        <Route
          path={RouteDefs.groupContactUs}
          element={<GroupRoute showHeader={true} component={<ContactUs />} />}
        />

        <Route
          path={RouteDefs.nonGroupPrivacyPolicy}
          element={<GroupRoute showHeader={true} component={<PrivacyPolicyPage />} />}
        />

        <Route
          path={RouteDefs.nonGroupTermsOfUse}
          element={<GroupRoute showHeader={true} component={<TermsOfUsePage />} />}
        />

        <Route
          path={RouteDefs.nonGroupRiskWarning}
          element={<GroupRoute showHeader={true} component={<RiskWarningPage />} />}
        />

        <Route
          path={RouteDefs.nonGroupCreatePitchTermsAndConditions}
          element={
            <GroupRoute showHeader={true} component={<CreatePitchTermsAndConditionsPage />} />
          }
        />

        <Route
          path={RouteDefs.nonGroupMarketingPreferences}
          element={<GroupRoute showHeader={true} component={<MarketingPreferencesPage />} />}
        />

        <Route
          path={RouteDefs.nonGroupAuthAction}
          element={<GroupRoute showHeader={true} component={<ResetPassword />} />}
        />

        <Route
          path={RouteDefs.error404}
          element={<GroupRoute showHeader={true} component={<PageNotFound />} />}
        />

        {/** Handle undefined paths */}
        <Route path="*" element={<GroupRoute showHeader={true} component={<PageNotFound />} />} />
      </ReactRouterRoutes>
    </ErrorBoundary>
  </BrowserRouter>
);

export default AppRouter;
