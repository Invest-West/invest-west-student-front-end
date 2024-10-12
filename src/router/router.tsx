Your current routing setup seems to be handling user login and group membership via the GroupRoute component. However, if you need to make your project views (groupViewOffer & nonGroupViewOffer) accessible to visitors who are not logged in, you need to make some changes.

The current GroupRoute could be validating user login. However, you should ensure that these validation rules are not applied for these certain routes. You can accomplish this by removing the GroupRoute wrapper from these routes and have them directly render the needed component.

Here's how you can modify your routes for groupViewOffer and nonGroupOffer;

```jsx
<Route path={Routes.nonGroupViewOffer} exact
       render={props => <ProjectDetails {...props}/>}/>

<Route path={Routes.groupViewOffer} exact
       render={props => <ProjectDetails {...props}/>}/>
```

Please replace these lines in your AppRouter function.

Note: This code modification assumes that the ProjectDetails component does not need any authentication or group identification on its own and it does not depend on any authentication-related props being passed from the GroupRoute component. 

If it's not the case, you may need to refactor the ProjectDetails component as well or run a condition check either in those pages or within the GroupRoute to bypass the authentication for these 2 routes.

Remember to thoroughly test all aspects of your application to be sure nothing breaks with this adjustment!
