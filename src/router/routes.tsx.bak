To make the project views accessible to non-logged in users, we need to ensure that the routes `nonGroupViewOffer` and `groupViewOffer` are not protected routes. In your current implementation, these routes are protected and only accessible by logged in users. Following are changes that you need to incorporate for both project views to be viewed by visitors who are not logged in:

```javascript
public static isProtectedRoute = (route: string) => {
    return route !== Routes.nonGroupFront
        && route !== Routes.groupFront
        && route !== Routes.nonGroupSignIn
        && route !== Routes.groupSignIn
        && route !== Routes.nonGroupSignUp
        && route !== Routes.groupSignUp
        && route !== Routes.nonGroupContactUs
        && route !== Routes.groupContactUs
        && route !== Routes.nonGroupViewOffer // add this line
        && route !== Routes.groupViewOffer    // add this line
        && route !== Routes.nonGroupPrivacyPolicy
        && route !== Routes.nonGroupTermsOfUse
        && route !== Routes.nonGroupRiskWarning
        && route !== Routes.nonGroupCreatePitchTermsAndConditions
        && route !== Routes.nonGroupMarketingPreferences
        && route !== Routes.nonGroupAuthAction
        && route !== Routes.error404;
}

public static isRouteReservedForSuperAdmin = (route: string) => {
    return route === Routes.nonGroupAdminDashboard
        || route === Routes.nonGroupViewUserProfile
        || route === Routes.nonGroupEditUserProfile
        || route === Routes.nonGroupCreateOffer
        || route !== Routes.nonGroupViewOffer // change from === to !==
        || route !== Routes.groupViewOffer    // change from === to !==
        || route === Routes.nonGroupViewPledge
        || route === Routes.nonGroupViewGroup;
}
```

In the `isProtectedRoute` and `isRouteReservedForSuperAdmin`, we've made sure that the routes nonGroupViewOffer and groupViewOffer are not protected and not reserved for the super admin respectively. So, now they should be accessible by visitors who are not logged in.
