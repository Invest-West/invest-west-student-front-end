I suggest to create a RouteGuard component, that will have a property isPublic where you will be able to specify whether the page should be accessible without authentication or not.

Here is how it might be implemented:

```JavaScript
// RouteGuard.js
import {Route, Redirect} from "react-router-dom";
import { isValidatingGroupUrl, successfullyValidatedGroupUrl } from "../redux-store/reducers/manageGroupUrlReducer";
import { isLoadingSystemAttributes } from "../redux-store/reducers/manageSystemAttributesReducer";
import { authIsNotInitialized, isAuthenticating, successfullyAuthenticated } from "../redux-store/reducers/authenticationReducer";

const RouteGuard = props => {

  const {AuthenticationState, ManageGroupUrlState, component: Component, isPublic, ...rest } = props;

  const renderContent = ({ location }) => {

    // here you put the validation logic

    const userAuthenticated = successfullyAuthenticated(AuthenticationState);
    const urlSuccessfullyValidated = successfullyValidatedGroupUrl(ManageGroupUrlState);
    const systemAttributesLoaded = !isLoadingSystemAttributes(ManageSystemAttributesState);

    // if user is not logged in - allow access only to public pages
    if (!userAuthenticated && !isPublic)
    return <Redirect to={{pathname: "/signin", state: {from: location}}}/> 

    if(userAuthenticated && systemAttributesLoaded && urlSuccessfullyValidated){
     return <Component/>
    }
    else {
      return <div>  Please wait, the data is loading... </div>
    }
  }

  return (
    <Route {...rest} render={renderContent}/>
  );
}

export default RouteGuard;
``` 

Then for your nonGroupViewOffer page, you would use the RouteGuard component like this:

```JavaScript
<RouteGuard isPublic={true} path="/nonGroupViewOffer" component={NonGroupViewOfferPage} />
``` 
This route will be accessible without logging in.


For all other routes, where user should be authenticated, use RouteGuard with isPublic set to false:

```JavaScript
<RouteGuard isPublic={false} path="/dashboard" component={DashboardPage} />
```
This route will not be accessible unless the user is logged in.
