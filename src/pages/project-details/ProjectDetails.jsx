There are different ways to go about allowing non-logged in users access to those project pages. Here's one possible solution:

You must use a higher-order component (HOC) that wraps a private route and checks if a user is authenticated. If not, it allows rendering of public content, otherwise, it renders the private route.

Here's an example of an 'AuthRoute' HOC.

```jsx
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function AuthRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === true ? <Redirect to='/login' /> : <Component {...props} />
      }
    />
  );
}
```

To use it, replace the routes for your `groupViewOffer` and `nonGroupViewOffer` with this new `AuthRoute`, and pass down the `authenticated` prop to determine if the user is logged in:

```jsx
<AuthRoute authenticated={yourAuthenticationCheck} path='/groupViewOffer' component={groupViewOffer} />
<AuthRoute authenticated={yourAuthenticationCheck} path='/nonGroupViewOffer' component={nonGroupViewOffer} />
```

The `authenticated` prop should replace the current checks you have through redux. If `authenticated` is true, the `AuthRoute` redirects the user to '/login'. If false, it renders the requested component, providing access to non-logged in users.

Adapt the above example to your main component, checking the right Redux state and paths for your application.

This is a simplified approach and might not work for every case. The solution might need adjustments to fit specific requirements of a project.
