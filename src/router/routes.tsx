import Admin, {isAdmin} from "../models/admin";
import GroupOfMembership, {getHomeGroup} from "../models/group_of_membership";
import {AuthenticationState} from "../redux-store/reducers/authenticationReducer";
import {ManageGroupUrlState} from "../redux-store/reducers/manageGroupUrlReducer";
import { matchPath } from 'react-router-dom';
import User, {isInvestor} from "../models/user";

export interface CreateProjectRouteParams {
    edit?: string;
    admin?: string;
    issuer?: string;
}

export default class Routes {
    static baseGroup: string = "/groups/:groupUserName";

    static nonGroupFront: string = "/";
    static groupFront: string = `${Routes.baseGroup}`;

    static nonGroupSignIn: string = "/groups/invest-west/signin";
    static groupSignIn: string = `${Routes.baseGroup}/signin`;
    static superAdminSignIn: string = "/signin/super-admin";

    static nonGroupSignUp:string = "/groups/invest-west/signup";
    static groupSignUp: string = `${Routes.baseGroup}/signup/:id?`;

    static nonGroupAdminDashboard: string = "/admin";
    static groupAdminDashboard: string = `${Routes.baseGroup}/admin`;

    static groupIssuerDashboard: string = `${Routes.baseGroup}/dashboard/issuer`;

    static groupInvestorDashboard: string = `${Routes.baseGroup}/dashboard/investor`;

    static nonGroupViewUserProfile: string = "/view-profile/:userID";
    static groupViewUserProfile: string = `${Routes.baseGroup}/view-profile/:userID`;

    static nonGroupEditUserProfile: string = "/edit-profile/:userID";
    static groupEditUserProfile: string = `${Routes.baseGroup}/edit-profile/:userID`;

    static nonGroupCreateOffer: string = "/create-offer";
    static groupCreateOffer: string = `${Routes.baseGroup}/create-offer`;

    static nonGroupViewOffer: string = "/projects/:projectID";
    static groupViewOffer: string = `${Routes.baseGroup}/projects/:projectID`;

    static nonGroupViewPledge: string = "/pledge";
    static groupViewPledge: string = `${Routes.baseGroup}/pledge`;

    static nonGroupViewGroup: string = "/view-group-details/:viewedGroupUserName";
    static groupViewGroup: string = `${Routes.baseGroup}/view-group-details/:viewedGroupUserName`;

    static nonGroupViewResourceDetail: string = "/resources/:resourceName";
    static groupViewResourceDetail: string = `${Routes.baseGroup}/resources/:resourceName`;

    static nonGroupContactUs: string = "/contact-us";
    static groupContactUs: string = `${Routes.baseGroup}/contact-us`;

    static groupHelp: string = `${Routes.baseGroup}/help`;

    static nonGroupTermsOfUse: string = "/terms-of-use";
    static nonGroupPrivacyPolicy: string = "/privacy-policy";
    static nonGroupRiskWarning: string = "/risk-warning-footer";
    static nonGroupCreatePitchTermsAndConditions: string = "/create-project-terms-and-conditions";
    static nonGroupMarketingPreferences: string = "/marketing-preferences";

    static nonGroupAuthAction: string = "/auth/action";

    static error404: string = "/error/404";

    /**
     * Check if a route is a protected one
     *
     * @param route
     */
    public static isProtectedRoute = (route: string) => {
        const publicRoutes = [
            Routes.nonGroupFront,
            Routes.groupFront,
            Routes.nonGroupSignIn,
            Routes.groupSignIn,
            Routes.nonGroupSignUp,
            Routes.groupSignUp,
            Routes.nonGroupContactUs,
            Routes.groupContactUs,
            Routes.nonGroupPrivacyPolicy,
            Routes.nonGroupTermsOfUse,
            Routes.nonGroupRiskWarning,
            Routes.nonGroupCreatePitchTermsAndConditions,
            Routes.nonGroupMarketingPreferences,
            Routes.nonGroupAuthAction,
            Routes.error404,
            Routes.nonGroupViewOffer,
            Routes.groupViewOffer,
        ];
    
        // Check if the route matches any of the public routes
        const isProtected = !publicRoutes.some(publicRoute => {
            const match = matchPath(route, { path: publicRoute });
            return match !== null;
        });
    
        return isProtected;
    }

    /**
     * Check if a route is reserved just for super admin
     *
     * @param route
     */
    public static isRouteReservedForSuperAdmin = (route: string) => {
        return route === Routes.nonGroupAdminDashboard
            || route === Routes.nonGroupViewUserProfile
            || route === Routes.nonGroupEditUserProfile
            || route === Routes.nonGroupCreateOffer
            || route === Routes.nonGroupViewOffer
            || route === Routes.nonGroupViewPledge
            || route === Routes.nonGroupViewGroup;
    }

    /**
     * Check if a route is dedicated for a group admin
     *
     * @param route
     */
    public static isGroupAdminRoute = (route: string) => {
        return route === Routes.groupAdminDashboard;
    }

    /**
     * Check if a route is dedicated for an issuer
     *
     * @param route
     */
    public static isIssuerDashboardRoute = (route: string) => {
        return route === Routes.groupIssuerDashboard;
    }

    /**
     * Check  if a route is dedicated for an investor
     *
     * @param route
     */
    public static isInvestorDashboardRoute = (route: string) => {
        return route === Routes.groupInvestorDashboard;
    }

    /**
     * Check if a route is a sign in route
     *
     * @param route
     */
    public static isSignInRoute = (route: string) => {
        return route === Routes.nonGroupSignIn || route === Routes.groupSignIn || route === Routes.superAdminSignIn;
    }

    /**
     * Check if a route is a super admin sign in route
     *
     * @param route
     */
    public static isSuperAdminSignInRoute = (route: string) => {
        return route === Routes.superAdminSignIn;
    }

    /**
     * Check if a route is a sign up route
     *
     * @param route
     */
    public static isSignUpRoute = (route: string) => {
        return route === Routes.nonGroupSignUp || route === Routes.groupSignUp;
    }

    /**
     * Check if a route is an error route
     *
     * @param route
     */
    public static isErrorRoute = (route: string) => {
        return route === Routes.error404;
    }

    /**
     * Check if a route is a system public route
     *
     * @param route
     */
    public static isSystemPublicRoute = (route: string) => {
        return route === Routes.nonGroupPrivacyPolicy
            || route === Routes.nonGroupRiskWarning
            || route === Routes.nonGroupTermsOfUse
            || route === Routes.nonGroupCreatePitchTermsAndConditions
            || route === Routes.nonGroupMarketingPreferences;
    }

    /**
     * Construct public route
     *
     * @param route
     */
    public static constructPublicRoute = (route: "privacyPolicy" | "riskWarning" | "termsOfUse" | "createPitchTermsAndConditions" | "marketingPreferences") => {
        switch (route) {
            case "privacyPolicy":
                return Routes.nonGroupPrivacyPolicy;
            case "riskWarning":
                return Routes.nonGroupRiskWarning;
            case "termsOfUse":
                return Routes.nonGroupTermsOfUse;
            case "createPitchTermsAndConditions":
                return Routes.nonGroupCreatePitchTermsAndConditions;
            case "marketingPreferences":
                return Routes.nonGroupMarketingPreferences;
        }
    }

    /**
     * Construct home route (navigate to Front page)
     *
     * @param routeParams
     * @param ManageGroupUrlState
     * @param AuthenticationState
     */
    public static constructHomeRoute = (routeParams: any, ManageGroupUrlState: ManageGroupUrlState,
                                        AuthenticationState: AuthenticationState) => {
        let route: string = "";

        if (!AuthenticationState.currentUser) {
            if (!routeParams.groupUserName) {
                return Routes.nonGroupFront;
            } else {
                return Routes.groupFront.replace(":groupUserName", routeParams.groupUserName);
            }
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        // an admin MUST use the correct sign in page to sign in
        if (currentAdmin) {
            // current admin is a super admin
            if (currentAdmin.superAdmin) {
                route = Routes.nonGroupFront;
            }
            // current admin is not a super admin
            else {
                if (AuthenticationState.groupsOfMembership.length === 1) {
                    const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                    route = Routes.groupFront.replace(":groupUserName", adminGroup.group.groupUserName);
                }
            }
        }
            // an investor or an issuer can use any sign in page (group sign in page) to sign in,
        // except the Invest West sign in page (with no group parameter) as it is reserved for the super admins only
        else {
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (routeParams.groupUserName) {
                if (AuthenticationState.groupsOfMembership
                    .filter(groupOfMembership =>
                        groupOfMembership.group.groupUserName === routeParams.groupUserName).length > 0
                ) {
                    route = Routes.groupFront.replace(":groupUserName", routeParams.groupUserName);
                } else if (homeGroup) {
                    route = Routes.groupFront.replace(":groupUserName", homeGroup.group.groupUserName);
                }
            } else if (homeGroup) {
                route = Routes.groupFront.replace(":groupUserName", homeGroup.group.groupUserName);
            }
        }

        if (!route) {
            return Routes.nonGroupFront;
        }

        return route;
    }

    /**
     * Construct sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructSignInRoute = (routeParams: any) => {
        if (routeParams.groupUserName) {
            return Routes.groupSignIn.replace(":groupUserName", routeParams.groupUserName);
        } else {
            return Routes.nonGroupSignIn;
        }
    }

    /**
     * Construct sign up route + with a default value of IW group
     *
     * @param groupUserName
     * @param invitedUserID
     */
    public static constructSignUpRoute = (groupUserName: string, invitedUserID?: string) => {
        if (groupUserName) {
            return Routes.groupSignUp
                .replace(":groupUserName", groupUserName)
                .replace(invitedUserID ? ":id?" : "/:id?", invitedUserID ?? "");
        } else {
            return Routes.nonGroupSignUp;
        }
    }

    /**
     * Construct sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructContactUsRoute = (routeParams: any) => {
        if (routeParams.groupUserName) {
            return Routes.groupContactUs.replace(":groupUserName", routeParams.groupUserName);
        } else {
            return Routes.nonGroupContactUs;
        }
    }


    /**
     * Construct dashboard route (navigate to Dashboard page)
     *
     * @param routeParams
     * @param ManageGroupUrlState
     * @param AuthenticationState
     */
    public static constructDashboardRoute = (routeParams: any, ManageGroupUrlState: ManageGroupUrlState,
                                             AuthenticationState: AuthenticationState) => {
        let route: string = "";

        if (!AuthenticationState.currentUser) {
            return Routes.constructSignInRoute(routeParams);
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        // an admin MUST use the correct sign in page to sign in
        if (currentAdmin) {
            // current admin is a super admin
            // --> redirect to super admin dashboard
            if (currentAdmin.superAdmin) {
                route = Routes.nonGroupAdminDashboard;
            }
                // current admin is not a super admin
            // --> redirect to group admin dashboard
            else {
                if (AuthenticationState.groupsOfMembership.length === 1) {
                    const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                    route = Routes.groupAdminDashboard.replace(":groupUserName", adminGroup.group.groupUserName);
                }
            }
        }
            // an investor or an issuer can use any sign in page (group sign in page) to sign in,
        // except the Invest West sign in page (with no group parameter) as it is reserved for the super admins only
        else {
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (routeParams.groupUserName) {
                if (AuthenticationState.groupsOfMembership
                    .filter(groupOfMembership =>
                        groupOfMembership.group.groupUserName === routeParams.groupUserName).length > 0
                ) {
                    if (isInvestor(AuthenticationState.currentUser as User)) {
                        route = Routes.groupInvestorDashboard.replace(":groupUserName", routeParams.groupUserName);
                    } else {
                        route = Routes.groupIssuerDashboard.replace(":groupUserName", routeParams.groupUserName);
                    }
                } else if (homeGroup) {
                    if (isInvestor(AuthenticationState.currentUser as User)) {
                        route = Routes.groupInvestorDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                    } else {
                        route = Routes.groupIssuerDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                    }
                }
            } else if (homeGroup) {
                if (isInvestor(AuthenticationState.currentUser as User)) {
                    route = Routes.groupInvestorDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                } else {
                    route = Routes.groupIssuerDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                }
            }
        }

        if (route === "") {
            return Routes.constructSignInRoute(routeParams);
        }
        route += "?tab=Home";
        return route;
    }

    /**
     * Construct view project (offer) route
     *
     * @param groupUserName
     * @param projectID
     */
    public static constructProjectDetailRoute = (groupUserName: string | null, projectID: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewOffer.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupViewOffer;
        }
        route = route.replace(":projectID", projectID);
        return route;
    }

    /**
     * Construct create project (offer) route
     *
     * @param groupUserName
     * @param params
     */
    public static constructCreateProjectRoute = (groupUserName: string | null, params?: CreateProjectRouteParams) => {
        let route;
        if (groupUserName) {
            route = Routes.groupCreateOffer.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupCreateOffer;
        }

        if (params !== undefined) {
            // edit an offer
            if (params.edit) {
                route += `?edit=${params.edit}`;
            }
            // group admin creates an offer on behalf of an issuer
            else if (params.admin && params.issuer) {
                route += `?admin=${params.admin}&issuer=${params.issuer}`;
            }
        }

        return route;
    }

    /**
     * Construct view group route
     *
     * @param groupUserName
     * @param viewedGroupUserName
     */
    public static constructGroupDetailRoute = (groupUserName: string | null, viewedGroupUserName: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewGroup.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupViewGroup;
        }
        route = route.replace(":viewedGroupUserName", viewedGroupUserName);
        return route;
    }

    /**
     * Construct view resource detail route
     *
     * @param groupUserName
     * @param resourceName
     */
    public static constructViewResourceDetailRoute = (groupUserName: string | null, resourceName: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewResourceDetail
                .replace(":groupUserName", groupUserName)
                .replace(":resourceName", resourceName);
        } else {
            route = Routes.nonGroupViewResourceDetail.replace(":resourceName", resourceName);
        }
        return route;
    }
}


//------------------- OLD ROUTES ---------------------------------------------------------------------------------------
export const ORIGINAL_WEB_URL = "https://investwest.online";

// angel network path INCLUDING Invest West angel network
export const GROUP_PATH = "/groups/:groupUserName";

// front with angel network logo
export const FRONT = GROUP_PATH;
// front with Invest West page --> Only for Invest West super admins
export const FRONT_INVEST_WEST_SUPER = "/";

// sign in with angel network logo --> only allow admins and users belong to this angel network to login
export const SIGN_IN = `${GROUP_PATH}/signin`;
// sign in with Invest West logo --> only allow Invest West super admins to login
export const SIGN_IN_INVEST_WEST_SUPER = "/signin";

// admin dashboard of an angel network --> only allow admins of the angel network to interact
export const ADMIN = `${GROUP_PATH}/admin`;
// issuer dashboard of Invest West --> only allow Invest West super admins to interact
export const ADMIN_INVEST_WEST_SUPER = "/admin";

// issuer dashboard of an angel network --> only allow issuers of the angel network to interact
export const DASHBOARD_ISSUER = `${GROUP_PATH}/dashboard/issuer`;
// issuer dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_ISSUER_INVEST_WEST_SUPER = "/dashboard/issuer";

// investor dashboard of an angel network --> only allow investors of the angel network to interact
export const DASHBOARD_INVESTOR = `${GROUP_PATH}/dashboard/investor`;
// investor dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_INVESTOR_INVEST_WEST_SUPER = "/dashboard/investor";

// sign up page for an angel network --> only users who have been invited by this angel network can see
export const SIGN_UP = `${GROUP_PATH}/signup/:id`;
// sign up page for Invest West --> only Invest West super admins can interact
export const SIGN_UP_INVEST_WEST_SUPER = "/signup/:id";

// view a user's profile while logged in under an angel network
export const USER_PROFILE = `${GROUP_PATH}/view-profile/:userID`;
// view a user's profile while logged in under Invest West super admins
export const USER_PROFILE_INVEST_WEST_SUPER = "/view-profile/:userID";

// edit a user's profile for group admins
export const EDIT_USER_PROFILE = `${GROUP_PATH}/edit-profile/:userID`;
// edit a user's profile for super admins
export const EDIT_USER_PROFILE_INVEST_WEST_SUPER = "/edit-profile/:userID";

// pledge under an angel network
export const PLEDGE = `${GROUP_PATH}/pledge`;
// pledge under Invest West Invest West super admins
export const PLEDGE_INVEST_WEST_SUPER = "/pledge";

// create an offer under an angel network
export const CREATE_OFFER = `${GROUP_PATH}/create-offer`;
export const EDIT_OFFER = `${CREATE_OFFER}?edit=:projectID`;
export const GROUP_ADMIN_CREATE_OFFER_ON_BEHALF_OF_ISSUER = `${CREATE_OFFER}?admin=:adminID&issuer=:issuerID`;
// create an offer under Invest West super admins
export const CREATE_OFFER_INVEST_WEST_SUPER = "/create-offer";
export const EDIT_OFFER_INVEST_WEST_SUPER = `${CREATE_OFFER_INVEST_WEST_SUPER}?edit=:projectID`;

// view offer's details under an angel network
export const PROJECT_DETAILS = `${GROUP_PATH}/projects/:projectID`;
// view offer's details under Invest West super admins
export const PROJECT_DETAILS_INVEST_WEST_SUPER = "/projects/:projectID";

export const VIEW_GROUP_DETAILS = `${GROUP_PATH}/view-group-details/:groupID`;
export const VIEW_GROUP_DETAILS_INVEST_WEST_SUPER = "/view-group-details/:groupID";

export const CONTACT_US = `${GROUP_PATH}/contact-us`;
export const CONTACT_US_INVEST_WEST_SUPER = "/contact-us";

export const CONTACT_US_2 = `${GROUP_PATH}/contact-us-2`;
export const CONTACT_US_INVEST_WEST_SUPER_2 = "/contact-us-2";

export const HELP = `${GROUP_PATH}/help`;
export const HELP_INVEST_WEST_SUPER = "/help";

export const TERMS_OF_USE = "/terms-of-use";
export const PRIVACY_POLICY = "/privacy-policy";
export const RISK_WARNING = "/risk-warning-footer";
export const CREATE_PITCH_TERMS_AND_CONDITIONS = "/create-project-terms-and-conditions";
export const ABOUT_US = "/about-us";
export const MARKETING_PREFERENCES = "/marketing-preferences";

export const ERROR_404 = "/error/404";
