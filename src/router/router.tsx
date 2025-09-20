import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import IssuerDashboard from "../pages/dashboard-issuer/IssuerDashboard";
import InvestorDashboard from "../pages/dashboard-investor/InvestorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreatePitchPage from "../pages/create-project/CreateProject";
import UserProfile from "../pages/profile/ProfilePageViewOnly";
import ProjectDetails from "../pages/project-details/ProjectDetails";
import PrivacyPolicyPage from "../pages/system-public-pages/PrivacyPolicyPage";
import TermsOfUsePage from "../pages/system-public-pages/TermsOfUsePage";
import RiskWarningPage from "../pages/system-public-pages/RiskWarningPage";
import CreatePitchTermsAndConditionsPage from "../pages/system-public-pages/CreatePitchTermsAndConditionsPage";
import ContactUs from "../pages/system-public-pages/ContactUs";
import HelpPage from "../pages/system-public-pages/HelpPage";
import GroupDetails from "../pages/group-details/GroupDetails";
import MarketingPreferencesPage from "../pages/system-public-pages/MarketingPreferencesPage";
import ProfilePageEditable from "../pages/profile/ProfilePageEditable";

import Front from "../pages/front/Front";
import About from "../pages/front/About";
import Hiw from "../pages/front/Hiw";
import Contact from "../pages/front/Contact";
import ExploreFront from "../pages/front/ExploreFront";
import SignIn from "../pages/signin/SignInNew";
import PageNotFound from "../shared-components/page-not-found/PageNotFoundNew";
import ErrorBoundary from './ErrorBoundary';
import Routes from "./routes";
import GroupRoute from "./GroupRoute";
import ResetPassword from "../pages/reset-password/ResetPassword";
import ResourceDetail from "../pages/resources/pages/ResourceDetail";
import SignUpNew from "../pages/signup/SignUpNew";
import CourseSetupPage from "../pages/setup/CourseSetupPage";
import {colors} from "@material-ui/core";

/**
 * Parameters in the url
 */
export interface RouteParams {
    groupUserName: string;
    courseUserName?: string;

    [params: string]: string | undefined;
}

const AppRouter = () => (
    <BrowserRouter>
    <ErrorBoundary>
        <Switch>
            {/** Course setup route - temporary for database setup */}
            <Route path="/setup-courses" exact
                // @ts-ignore
                   render={props => <CourseSetupPage {...props} />}/>

            {/** Debug route - for testing course navigation */}
            <Route path="/debug-admin" exact
                // @ts-ignore
                   render={props => {
                       return <div style={{padding: '20px'}}>
                           <h1>Course Navigation Debug</h1>
                           <p>Current URL: {window.location.href}</p>
                           <h3>Test Course Routes:</h3>
                           <a href="/groups/invest-west/student-showcase/admin?tab=Home" style={{display: 'block', margin: '10px 0'}}>
                               Admin Dashboard
                           </a>
                           <a href="/groups/invest-west/student-showcase/dashboard/investor?tab=Home" style={{display: 'block', margin: '10px 0'}}>
                               Investor Dashboard
                           </a>
                           <a href="/groups/invest-west/student-showcase/dashboard/issuer?tab=Home" style={{display: 'block', margin: '10px 0'}}>
                               Issuer Dashboard
                           </a>
                           <a href="/groups/invest-west/student-showcase" style={{display: 'block', margin: '10px 0'}}>
                               Course Front Page
                           </a>
                       </div>;
                   }}/>
            
            {/** Route Parameter Debug - test what params are being extracted */}
            <Route path="/groups/:groupUserName/:courseUserName/debug" exact
                // @ts-ignore
                   render={props => {
                       console.log('[ROUTE DEBUG] Course route params:', props.match.params);
                       return <div style={{padding: '20px'}}>
                           <h1>Route Parameters Debug</h1>
                           <p><strong>Match Path:</strong> {props.match.path}</p>
                           <p><strong>Match URL:</strong> {props.match.url}</p>
                           <p><strong>Group User Name:</strong> {props.match.params.groupUserName}</p>
                           <p><strong>Course User Name:</strong> {props.match.params.courseUserName}</p>
                           <p><strong>Full Params:</strong> {JSON.stringify(props.match.params, null, 2)}</p>
                       </div>;
                   }}/>
            
            {/** Direct Admin Test - bypass GroupRoute wrapper */}
            <Route path="/groups/:groupUserName/:courseUserName/test-admin" exact
                // @ts-ignore
                   render={props => {
                       console.log('[ADMIN TEST] Direct admin route accessed:', props.match.params);
                       return <div style={{padding: '20px'}}>
                           <h1>Direct Admin Test</h1>
                           <p>This route bypasses GroupRoute validation</p>
                           <p><strong>Group:</strong> {props.match.params.groupUserName}</p>
                           <p><strong>Course:</strong> {props.match.params.courseUserName}</p>
                           <p>If you see this, route matching is working correctly!</p>
                           <p>The issue is likely in GroupRoute validation logic.</p>
                       </div>;
                   }}/>

            <Route path={Routes.courseSignUp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.groupSignUp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignUp} exact
                    // @ts-ignore
                    render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]} component={<SignUpNew {...props}/>}/>}/>            
                    <Route path={Routes.nonGroupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.courseFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.groupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.nonGroupAbout} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<About {...props}/>}/>}/>
            <Route path={Routes.courseAbout} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<About {...props}/>}/>}/>
            <Route path={Routes.groupAbout} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<About {...props}/>}/>}/>

            <Route path={Routes.nonGroupHiw} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Hiw {...props}/>}/>}/>

            <Route path={Routes.courseHiw} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Hiw {...props}/>}/>}/>
            <Route path={Routes.groupHiw} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Hiw {...props}/>}/>}/>

            <Route path={Routes.nonGroupContact} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Contact {...props}/>}/>}/>
            
            <Route path={Routes.courseContact} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Contact {...props}/>}/>}/>
            <Route path={Routes.groupContact} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Contact {...props}/>}/>}/>    

            <Route path={Routes.nonGroupExploreFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<ExploreFront {...props}/>}/>}/>

            <Route path={Routes.courseExploreFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<ExploreFront {...props}/>}/>}/>
            <Route path={Routes.groupExploreFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<ExploreFront {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.courseSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.groupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.superAdminSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>

            <Route path={Routes.nonGroupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>
            <Route path={Routes.courseAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>
            <Route path={Routes.groupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>

            <Route path={Routes.courseIssuerDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<IssuerDashboard {...props}/>}/>}/>
            <Route path={Routes.groupIssuerDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<IssuerDashboard {...props}/>}/>}/>

            <Route path={Routes.courseInvestorDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<InvestorDashboard {...props}/>}/>}/>
            <Route path={Routes.groupInvestorDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<InvestorDashboard {...props}/>}/>}/>

            <Route path={Routes.courseViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>
            <Route path={Routes.groupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>
            <Route path={Routes.nonGroupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>

            <Route path={Routes.courseCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>
            <Route path={Routes.groupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>
            <Route path={Routes.nonGroupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<GroupDetails {...props}/>}/>}/>
            <Route path={Routes.courseViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<GroupDetails {...props}/>}/>}/>
            <Route path={Routes.groupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<GroupDetails {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>
            <Route path={Routes.courseViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>
            <Route path={Routes.groupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>
            <Route path={Routes.courseViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>
            <Route path={Routes.groupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>

            <Route path={Routes.nonGroupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>
            <Route path={Routes.courseEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>
            <Route path={Routes.groupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>

            <Route path={Routes.courseHelp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<HelpPage {...props}/>}/>}/>
            <Route path={Routes.groupHelp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<HelpPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>
            <Route path={Routes.courseContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>
            <Route path={Routes.groupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>



            <Route path={Routes.nonGroupPrivacyPolicy} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<PrivacyPolicyPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupTermsOfUse} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<TermsOfUsePage {...props}/>}/>}/>

            <Route path={Routes.nonGroupRiskWarning} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<RiskWarningPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupCreatePitchTermsAndConditions} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchTermsAndConditionsPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupMarketingPreferences} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<MarketingPreferencesPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupAuthAction} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                       // @ts-ignore
                                                component={<ResetPassword {...props}/>}/>}/>

            <Route path={Routes.error404} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<PageNotFound {...props}/>}/>}/>

            {/** Handle undefined paths */}
            <Route
                // @ts-ignore
                render={props => <GroupRoute {...props} showHeader={true}
                                             component={<PageNotFound {...props}/>}/>}/>

        </Switch>
        </ErrorBoundary>
    </BrowserRouter>
);

export default AppRouter;
