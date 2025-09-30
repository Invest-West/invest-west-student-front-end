import Admin, {isAdmin} from "../models/admin";
import GroupOfMembership, {getHomeGroup} from "../models/group_of_membership";
import {AuthenticationState} from "../redux-store/reducers/authenticationReducer";
import {ManageGroupUrlState} from "../redux-store/reducers/manageGroupUrlReducer";
import User, {isInvestor} from "../models/user";

export interface CreateProjectRouteParams {
    edit?: string;
    admin?: string;
    issuer?: string;
}

export default class Routes {
    static baseGroup: string = "/groups/:groupUserName";
    static baseCourse: string = "/groups/:groupUserName/:courseUserName";

    static nonGroupFront: string = "/";
    static groupFront: string = `${Routes.baseGroup}`;
    static courseFront: string = `${Routes.baseCourse}`;

    static nonGroupAbout: string = "/about";  
    static groupAbout: string = `${Routes.baseGroup}/about`;
    static courseAbout: string = `${Routes.baseCourse}/about`;
    
    static nonGroupHiw: string = "/Hiw";
    static groupHiw: string = `${Routes.baseGroup}/Hiw`;
    static courseHiw: string = `${Routes.baseCourse}/Hiw`;

    static nonGroupContact: string = "/contact-us-front";
    static groupContact: string = `${Routes.baseGroup}/contact-us-front`;
    static courseContact: string = `${Routes.baseCourse}/contact-us-front`;

    static nonGroupExploreFront: string = "/explore";
    static groupExploreFront: string = `${Routes.baseGroup}/explore`;
    static courseExploreFront: string = `${Routes.baseCourse}/explore`;

    static nonGroupSignIn: string = "/groups/invest-west/student-showcase/signin";
    static groupSignIn: string = `${Routes.baseGroup}/signin`;
    static courseSignIn: string = `${Routes.baseCourse}/signin`;
    static superAdminSignIn: string = "/signin/super-admin";

    static nonGroupSignUp:string = "/groups/invest-west/student-showcase/signup";
    static groupSignUp: string = `${Routes.baseGroup}/signup/:id?`;
    static courseSignUp: string = `${Routes.baseCourse}/signup/:id?`;

    static nonGroupAdminDashboard: string = "/admin";
    static groupAdminDashboard: string = `${Routes.baseGroup}/admin`;
    static courseAdminDashboard: string = `${Routes.baseCourse}/admin`;

    static nonGroupIssuerDashboard: string = "/groups/invest-west/student-showcase/dashboard/issuer";
    static groupIssuerDashboard: string = `${Routes.baseGroup}/dashboard/issuer`;
    static courseIssuerDashboard: string = `${Routes.baseCourse}/dashboard/issuer`;

    static nonGroupInvestorDashboard: string = "/groups/invest-west/student-showcase/dashboard/investor";
    static groupInvestorDashboard: string = `${Routes.baseGroup}/dashboard/investor`;
    static courseInvestorDashboard: string = `${Routes.baseCourse}/dashboard/investor`;

    static nonGroupViewUserProfile: string = "/view-profile/:userID";
    static groupViewUserProfile: string = `${Routes.baseGroup}/view-profile/:userID`;
    static courseViewUserProfile: string = `${Routes.baseCourse}/view-profile/:userID`;

    static nonGroupEditUserProfile: string = "/edit-profile/:userID";
    static groupEditUserProfile: string = `${Routes.baseGroup}/edit-profile/:userID`;
    static courseEditUserProfile: string = `${Routes.baseCourse}/edit-profile/:userID`;

    static nonGroupCreateOffer: string = "/create-offer";
    static groupCreateOffer: string = `${Routes.baseGroup}/create-offer`;
    static courseCreateOffer: string = `${Routes.baseCourse}/create-offer`;

    static nonGroupViewOffer: string = "/projects/:projectID";
    static groupViewOffer: string = `${Routes.baseGroup}/projects/:projectID`;
    static courseViewOffer: string = `${Routes.baseCourse}/projects/:projectID`;

    static nonGroupViewPledge: string = "/pledge";
    static groupViewPledge: string = `${Routes.baseGroup}/pledge`;
    static courseViewPledge: string = `${Routes.baseCourse}/pledge`;

    static nonGroupViewGroup: string = "/view-group-details/:viewedGroupUserName";
    static groupViewGroup: string = `${Routes.baseGroup}/view-group-details/:viewedGroupUserName`;
    static courseViewGroup: string = `${Routes.baseCourse}/view-group-details/:viewedGroupUserName`;

    static nonGroupViewResourceDetail: string = "/resources/:resourceName";
    static groupViewResourceDetail: string = `${Routes.baseGroup}/resources/:resourceName`;
    static courseViewResourceDetail: string = `${Routes.baseCourse}/resources/:resourceName`;

    static nonGroupContactUs: string = "/contact-us";
    static groupContactUs: string = `${Routes.baseGroup}/contact-us`;
    static courseContactUs: string = `${Routes.baseCourse}/contact-us`;

    static groupHelp: string = `${Routes.baseGroup}/help`;
    static courseHelp: string = `${Routes.baseCourse}/help`;

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
        return route !== Routes.nonGroupFront
            && route !== Routes.groupFront
            && route !== Routes.courseFront
            && route !== Routes.nonGroupAbout
            && route !== Routes.groupAbout
            && route !== Routes.courseAbout
            && route !== Routes.nonGroupHiw
            && route !== Routes.groupHiw
            && route !== Routes.courseHiw
            && route !== Routes.nonGroupSignIn
            && route !== Routes.nonGroupContact
            && route !== Routes.nonGroupExploreFront
            && route !== Routes.groupExploreFront
            && route !== Routes.courseExploreFront
            && route !== Routes.groupContact
            && route !== Routes.courseContact
            && route !== Routes.groupSignIn
            && route !== Routes.courseSignIn
            && route !== Routes.nonGroupSignUp
            && route !== Routes.groupSignUp
            && route !== Routes.courseSignUp
            && route !== Routes.nonGroupContactUs
            && route !== Routes.groupContactUs
            && route !== Routes.courseContactUs
            && route !== Routes.nonGroupPrivacyPolicy
            && route !== Routes.nonGroupTermsOfUse
            && route !== Routes.nonGroupRiskWarning
            && route !== Routes.nonGroupCreatePitchTermsAndConditions
            && route !== Routes.nonGroupMarketingPreferences
            && route !== Routes.nonGroupAuthAction
            && route !== Routes.error404
            && route !== Routes.nonGroupViewOffer
            && route !== Routes.groupViewOffer
            && route !== Routes.courseViewOffer;
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
        return route === Routes.groupAdminDashboard || route === Routes.courseAdminDashboard;
    }

    /**
     * Check if a route is dedicated for an issuer
     *
     * @param route
     */
    public static isIssuerDashboardRoute = (route: string) => {
        return route === Routes.nonGroupIssuerDashboard || route === Routes.groupIssuerDashboard || route === Routes.courseIssuerDashboard;
    }

    /**
     * Check  if a route is dedicated for an investor
     *
     * @param route
     */
    public static isInvestorDashboardRoute = (route: string) => {
        return route === Routes.nonGroupInvestorDashboard || route === Routes.groupInvestorDashboard || route === Routes.courseInvestorDashboard;
    }

    /**
     * Check if a route is a create offer route
     *
     * @param route
     */
    public static isCreateOfferRoute = (route: string) => {
        return route === Routes.groupCreateOffer || route === Routes.courseCreateOffer || route === Routes.nonGroupCreateOffer;
    }

    /**
     * Check if a route is a sign in route
     *
     * @param route
     */
    public static isSignInRoute = (route: string) => {
        return route === Routes.nonGroupSignIn || route === Routes.groupSignIn || route === Routes.courseSignIn || route === Routes.superAdminSignIn;
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
        return route === Routes.nonGroupSignUp || route === Routes.groupSignUp || route === Routes.courseSignUp;
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
        
        // If no user is authenticated, default to invest-west course-based navigation
        if (!AuthenticationState.currentUser) {
            if (routeParams.groupUserName && routeParams.courseUserName) {
                const route = Routes.courseFront
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
                return route;
            } else if (routeParams.groupUserName) {
                // Default to a course within the group
                const route = Routes.courseFront
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", "student-showcase");
                return route;
            } else {
                // Default to invest-west with student-showcase course
                const route = Routes.courseFront
                    .replace(":groupUserName", "invest-west")
                    .replace(":courseUserName", "student-showcase");
                return route;
            }
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        
        // Helper function to get course route with invest-west/student-showcase fallback
        const getCourseRouteForUser = (): string => {
            // First priority: Use both group and course from URL if user is a member
            if (routeParams.groupUserName && routeParams.courseUserName && AuthenticationState.groupsOfMembership
                .some(membership => membership.group.groupUserName === routeParams.groupUserName)) {
                return Routes.courseFront
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
            }
            
            // Second priority: Use group from URL with default course
            if (routeParams.groupUserName && AuthenticationState.groupsOfMembership
                .some(membership => membership.group.groupUserName === routeParams.groupUserName)) {
                return Routes.courseFront
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", "student-showcase");
            }
            
            // Third priority: Look for invest-west group specifically
            const investWestGroup = AuthenticationState.groupsOfMembership
                .find(membership => membership.group.groupUserName === 'invest-west');
            if (investWestGroup) {
                return Routes.courseFront
                    .replace(":groupUserName", "invest-west")
                    .replace(":courseUserName", "student-showcase");
            }
            
            // Fourth priority: Use home group if available
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (homeGroup) {
                return Routes.courseFront
                    .replace(":groupUserName", homeGroup.group.groupUserName)
                    .replace(":courseUserName", "student-showcase");
            }
            
            // Fifth priority: Use first available group
            if (AuthenticationState.groupsOfMembership.length > 0) {
                return Routes.courseFront
                    .replace(":groupUserName", AuthenticationState.groupsOfMembership[0].group.groupUserName)
                    .replace(":courseUserName", "student-showcase");
            }
            
            // Final fallback: invest-west/student-showcase
            return Routes.courseFront
                .replace(":groupUserName", "invest-west")
                .replace(":courseUserName", "student-showcase");
        };

        // Handle admin users
        if (currentAdmin) {
            // Super admin → system front page
            if (currentAdmin.superAdmin) {
                return Routes.nonGroupFront;
            }
            // Group admin → use their group with default course
            else if (AuthenticationState.groupsOfMembership.length > 0) {
                const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                return Routes.courseFront
                    .replace(":groupUserName", adminGroup.group.groupUserName)
                    .replace(":courseUserName", "student-showcase");
            }
        }
        
        // Handle regular users (investors/issuers)
        return getCourseRouteForUser();
    }

    /**
     * Construct sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructSignInRoute = (routeParams: any) => {
        if (routeParams.courseUserName && routeParams.groupUserName) {
            return Routes.courseSignIn
                .replace(":groupUserName", routeParams.groupUserName)
                .replace(":courseUserName", routeParams.courseUserName);
        } else if (routeParams.groupUserName) {
            // Default to student-showcase course for group-based URLs
            return Routes.courseSignIn
                .replace(":groupUserName", routeParams.groupUserName)
                .replace(":courseUserName", "student-showcase");
        } else {
            // Default to invest-west/student-showcase course
            return Routes.nonGroupSignIn;
        }
    }

    /**
     * Construct sign up route + with a default value of IW group
     *
     * @param groupUserName
     * @param invitedUserID
     * @param courseUserName
     */
    public static constructSignUpRoute = (groupUserName: string, invitedUserID?: string, courseUserName?: string) => {
        if (courseUserName && groupUserName) {
            return Routes.courseSignUp
                .replace(":groupUserName", groupUserName)
                .replace(":courseUserName", courseUserName)
                .replace(invitedUserID ? ":id?" : "/:id?", invitedUserID ?? "");
        } else if (groupUserName) {
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
     * Construct HIW route (How It Works) - maintains course parameter
     */
    public static constructHiwRoute = (routeParams: any) => {
        
        if (routeParams.groupUserName) {
            if (routeParams.courseUserName) {
                // Course-based URL - maintain course parameter
                const route = Routes.courseHiw
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
                return route;
            } else {
                // Group-based URL  
                const route = Routes.groupHiw.replace(":groupUserName", routeParams.groupUserName);
                return route;
            }
        } else {
            // No group specified - default to course-based invest-west
            const route = Routes.courseHiw
                .replace(":groupUserName", "invest-west")
                .replace(":courseUserName", "student-showcase");
            return route;
        }
    }

    /**
     * Construct About route - maintains course parameters in navigation
     */
    public static constructAboutRoute = (routeParams: any) => {
        
        if (routeParams.groupUserName) {
            if (routeParams.courseUserName) {
                // Course-based URL - maintain course parameter
                const route = Routes.courseAbout
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
                return route;
            } else {
                // Group-based URL  
                const route = Routes.groupAbout.replace(":groupUserName", routeParams.groupUserName);
                return route;
            }
        } else {
            // No group specified - default to course-based invest-west
            const route = Routes.courseAbout
                .replace(":groupUserName", "invest-west")
                .replace(":courseUserName", "student-showcase");
            return route;
        }
    }

    /**
     * Construct Contact route - maintains course parameters in navigation
     */
    public static constructContactRoute = (routeParams: any) => {
        
        if (routeParams.groupUserName) {
            if (routeParams.courseUserName) {
                // Course-based URL - maintain course parameter
                const route = Routes.courseContact
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
                return route;
            } else {
                // Group-based URL  
                const route = Routes.groupContact.replace(":groupUserName", routeParams.groupUserName);
                return route;
            }
        } else {
            // No group specified - default to course-based invest-west
            const route = Routes.courseContact
                .replace(":groupUserName", "invest-west")
                .replace(":courseUserName", "student-showcase");
            return route;
        }
    }

    /**
     * Construct Explore route - maintains course parameters in navigation
     */
    public static constructExploreRoute = (routeParams: any) => {
        
        if (routeParams.groupUserName) {
            if (routeParams.courseUserName) {
                // Course-based URL - maintain course parameter
                const route = Routes.courseExploreFront
                    .replace(":groupUserName", routeParams.groupUserName)
                    .replace(":courseUserName", routeParams.courseUserName);
                return route;
            } else {
                // Group-based URL  
                const route = Routes.groupExploreFront.replace(":groupUserName", routeParams.groupUserName);
                return route;
            }
        } else {
            // No group specified - default to course-based invest-west
            const route = Routes.courseExploreFront
                .replace(":groupUserName", "invest-west")
                .replace(":courseUserName", "student-showcase");
            return route;
        }
    }

    /**
     * Construct explore offers route (navigate to Explore Offers page)
     *
     * @param routeParams
     * @param ManageGroupUrlState
     * @param AuthenticationState
     */
    public static constructExploreOffersRoute = (routeParams: any, ManageGroupUrlState: ManageGroupUrlState,
                                                 AuthenticationState: AuthenticationState) => {
        // Priority 1: Use the group from the current URL context if available
        if (routeParams.groupUserName) {
            return Routes.groupExploreFront.replace(":groupUserName", routeParams.groupUserName);
        }

        // Priority 2: Use the group from ManageGroupUrlState if available
        if (ManageGroupUrlState.groupNameFromUrl) {
            return Routes.groupExploreFront.replace(":groupUserName", ManageGroupUrlState.groupNameFromUrl);
        }

        // Priority 2.5: Special handling for signup routes - extract group from route path
        if (ManageGroupUrlState.routePath === Routes.nonGroupSignUp || ManageGroupUrlState.routePath === Routes.nonGroupSignIn) {
            return Routes.groupExploreFront.replace(":groupUserName", "invest-west");
        }

        // Priority 3: Check user's group memberships
        if (AuthenticationState.currentUser) {
            const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
            if (currentAdmin) {
                if (currentAdmin.superAdmin) {
                    return Routes.nonGroupExploreFront;
                } else {
                    if (AuthenticationState.groupsOfMembership.length >= 1) {
                        const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                        return Routes.groupExploreFront.replace(":groupUserName", adminGroup.group.groupUserName);
                    }
                    // Fallback for admin with no groups
                    return Routes.groupExploreFront.replace(":groupUserName", "invest-west");
                }
            } else {
                // Look for invest-west group specifically first
                const investWestGroup = AuthenticationState.groupsOfMembership
                    .find(membership => membership.group.groupUserName === 'invest-west');
                if (investWestGroup) {
                    return Routes.groupExploreFront.replace(":groupUserName", "invest-west");
                }

                const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
                if (homeGroup) {
                    return Routes.groupExploreFront.replace(":groupUserName", homeGroup.group.groupUserName);
                }
                // Fallback to first group if no home group is set
                if (AuthenticationState.groupsOfMembership.length >= 1) {
                    return Routes.groupExploreFront.replace(":groupUserName", AuthenticationState.groupsOfMembership[0].group.groupUserName);
                }
            }
        }

        // Default fallback to invest-west/student-showcase course instead of non-group
        return Routes.courseExploreFront
            .replace(":groupUserName", "invest-west")
            .replace(":courseUserName", "student-showcase");
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
        if (!AuthenticationState.currentUser) {
            return Routes.constructSignInRoute(routeParams);
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        
        // Helper function to get group name with invest-west fallback
        const getGroupNameForUser = (): string => {
            // First priority: Use group from URL if user is a member
            if (routeParams.groupUserName && AuthenticationState.groupsOfMembership
                .some(membership => membership.group.groupUserName === routeParams.groupUserName)) {
                return routeParams.groupUserName;
            }

            // Second priority: Look for invest-west group specifically
            const investWestGroup = AuthenticationState.groupsOfMembership
                .find(membership => membership.group.groupUserName === 'invest-west');
            if (investWestGroup) {
                return 'invest-west';
            }

            // Third priority: Use home group if available
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (homeGroup) {
                return homeGroup.group.groupUserName;
            }

            // Fourth priority: Use first available group
            if (AuthenticationState.groupsOfMembership.length > 0) {
                return AuthenticationState.groupsOfMembership[0].group.groupUserName;
            }

            // Final fallback: invest-west
            return 'invest-west';
        };

        // Helper function to get course name with student-showcase fallback
        const getCourseNameForUser = (): string => {
            // First priority: Use course from URL if provided
            if (routeParams.courseUserName) {
                return routeParams.courseUserName;
            }

            // TODO: In future, get user's actual assigned course from their profile
            // For now, fallback to student-showcase
            return 'student-showcase';
        };

        let route: string = "";

        // Handle admin users
        if (currentAdmin) {
            // Super admin → system admin dashboard
            if (currentAdmin.superAdmin) {
                route = Routes.nonGroupAdminDashboard;
            }
            // Group admin → course admin dashboard
            else if (AuthenticationState.groupsOfMembership.length > 0) {
                const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                const courseName = getCourseNameForUser();
                route = Routes.courseAdminDashboard
                    .replace(":groupUserName", adminGroup.group.groupUserName)
                    .replace(":courseUserName", courseName);
                console.log('[DASHBOARD DEBUG] Constructed admin dashboard route:', route);
            } else {
                // Fallback for group admin with no groups
                const courseName = getCourseNameForUser();
                route = Routes.courseAdminDashboard
                    .replace(":groupUserName", "invest-west")
                    .replace(":courseUserName", courseName);
                console.log('[DASHBOARD DEBUG] Constructed fallback admin dashboard route:', route);
            }
        }
        // Handle regular users (investors/issuers)
        else {
            const groupName = getGroupNameForUser();
            const courseName = getCourseNameForUser();

            if (isInvestor(AuthenticationState.currentUser as User)) {
                route = Routes.courseInvestorDashboard
                    .replace(":groupUserName", groupName)
                    .replace(":courseUserName", courseName);
                console.log('[DASHBOARD DEBUG] Constructed investor dashboard route:', route);
            } else {
                // Assume issuer if not investor
                route = Routes.courseIssuerDashboard
                    .replace(":groupUserName", groupName)
                    .replace(":courseUserName", courseName);
                console.log('[DASHBOARD DEBUG] Constructed issuer dashboard route:', route);
            }
        }

        // Fallback safety check
        if (!route) {
            return Routes.constructSignInRoute(routeParams);
        }

        route += "?tab=Home";
        return route;
    }

    /**
     * Construct view project (offer) route
     *
     * @param groupUserName
     * @param courseUserName
     * @param projectID
     */
    public static constructProjectDetailRoute = (groupUserName: string | null, courseUserName: string | null, projectID: string) => {
        let route;
        if (groupUserName) {
            if (courseUserName) {
                route = Routes.courseViewOffer
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName);
            } else {
                route = Routes.groupViewOffer.replace(":groupUserName", groupUserName);
            }
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
     * @param courseUserName
     * @param params
     */
    public static constructCreateProjectRoute = (groupUserName: string | null, courseUserName?: string | null, params?: CreateProjectRouteParams) => {
        let route;
        if (groupUserName) {
            if (courseUserName) {
                route = Routes.courseCreateOffer
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName);
            } else {
                route = Routes.groupCreateOffer.replace(":groupUserName", groupUserName);
            }
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
     * @param courseUserName
     * @param viewedGroupUserName
     */
    public static constructGroupDetailRoute = (groupUserName: string | null, courseUserName: string | null, viewedGroupUserName: string) => {
        let route;
        if (groupUserName) {
            if (courseUserName) {
                route = Routes.courseViewGroup
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName);
            } else {
                route = Routes.groupViewGroup.replace(":groupUserName", groupUserName);
            }
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
     * @param courseUserName
     * @param resourceName
     */
    public static constructViewResourceDetailRoute = (groupUserName: string | null, courseUserName: string | null, resourceName: string) => {
        let route;
        if (groupUserName) {
            if (courseUserName) {
                route = Routes.courseViewResourceDetail
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName)
                    .replace(":resourceName", resourceName);
            } else {
                route = Routes.groupViewResourceDetail
                    .replace(":groupUserName", groupUserName)
                    .replace(":resourceName", resourceName);
            }
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