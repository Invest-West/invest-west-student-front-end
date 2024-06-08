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
import SignIn from "../pages/signin/SignInNew";
import PageNotFound from "../shared-components/page-not-found/PageNotFoundNew";
import ErrorBoundary from './ErrorBoundary';
import Routes from "./routes";
import GroupRoute from "./GroupRoute";
import ResetPassword from "../pages/reset-password/ResetPassword";
import ResourceDetail from "../pages/resources/pages/ResourceDetail";
import SignUpNew from "../pages/signup/SignUpNew";
import {colors} from "@material-ui/core";

/**
 * Parameters in the url
 */
export interface RouteParams {
    groupUserName: string;

    [params: string]: string;
}

const AppRouter = () => (
    <BrowserRouter>
    <ErrorBoundary>
        <Switch>
            <Route path={Routes.groupSignUp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignUp} exact
                            // @ts-ignore
                            render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                                // @ts-ignore
                                                            component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.nonGroupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.groupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignIn} exact
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
            <Route path={Routes.groupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>

            <Route path={Routes.groupIssuerDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<IssuerDashboard {...props}/>}/>}/>

            <Route path={Routes.groupInvestorDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<InvestorDashboard {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>
            <Route path={Routes.groupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>

            <Route path={Routes.nonGroupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>
            <Route path={Routes.groupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewGroup} exact
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
            <Route path={Routes.groupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewResourceDetail} exact
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
            <Route path={Routes.groupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>

            <Route path={Routes.groupHelp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<HelpPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupContactUs} exact
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
