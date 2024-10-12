From your code, it seems like you are using React with Redux and you are rendering elements based on authentication state. 

Here are general steps you can follow:

1. You need to differentiate the behavior based on the page.

2. If the page name is groupViewOffer or nonGroupViewOffer, you should display the projects regardless of the authentication status.

Here is a solution (I'm assuming your `ConstructDashboardRoute` is responsible for displaying projects):

```
//obtain page name from route 
const pageName = this.props.match.params;

//Then at the appropriate place
url={
    pageName === 'groupViewOffer' || 
    pageName === 'nonGroupViewOffer' ? 
      Routes.constructDashboardRoute(this.props.match.params, ManageGroupUrlState, AuthenticationState) 
      : 
      isAuthenticating(AuthenticationState)
          ? ""
          : !successfullyAuthenticated(AuthenticationState)
            ? Routes.constructSignInRoute(this.props.match.params)
            : Routes.constructDashboardRoute(this.props.match.params, ManageGroupUrlState, AuthenticationState)
}
```

This conditions checks if current route is groupViewOffer or nonGroupViewOffer and in these cases it shows project details.

Hence, the url of your CustomLink component would be assigned on the basis of this condition.

However, this is assuming `constructDashboardRoute` is responsible for showing the projects. Modify the function names as per your app structure. So the main concept is manipulating the routes on basis of page names.

**Please Note**: This solution assumes that the projects are stored somewhere accessible by anyone without the need to be authenticated. Keep in mind the security and privacy concerns involved when making parts of your application publicly accessible.
