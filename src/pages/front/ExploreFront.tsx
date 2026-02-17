import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../redux-store/reducers';
import { ManageGroupUrlState } from '../../redux-store/reducers/manageGroupUrlReducer';
import { AuthenticationState } from '../../redux-store/reducers/authenticationReducer';
import { NavLink, useParams } from 'react-router-dom';
import { RouteParams } from '../../router/router';
import { MediaQueryState } from '../../redux-store/reducers/mediaQueryReducer';
import Routes from '../../router/routes';
import '../../shared-js-css-styles/front.css';
import ExploreOffers from '../../shared-components/explore-offers/ExploreOffers';

import studentLogo from '../../img/student_logo.png';

interface ExploreFrontRouterProps {
  params: Record<string, string | undefined>;
}

interface ExploreFrontProps {
  ManageGroupUrlState: ManageGroupUrlState;
  AuthenticationState: AuthenticationState;
  MediaQueryState: MediaQueryState;
}

const mapStateToProps = (state: AppState) => {
  return {
    ManageGroupUrlState: state.ManageGroupUrlState,
    AuthenticationState: state.AuthenticationState,
    MediaQueryState: state.MediaQueryState,
  };
};

interface ExploreFrontState {
  activeTab: 'academia' | 'employer';
}

class ExploreFrontClass extends Component<
  ExploreFrontProps & ExploreFrontRouterProps,
  ExploreFrontState
> {
  constructor(props: ExploreFrontProps & ExploreFrontRouterProps) {
    super(props);
    this.state = {
      activeTab: 'academia',
    };
  }

  handleTabChange = (tab: 'academia' | 'employer') => {
    this.setState({ activeTab: tab });
  };
  render() {
    const { ManageGroupUrlState, AuthenticationState } = this.props;

    const routeParams = this.props.params;

    // Construct proper routes based on whether we have a group or not
    const aboutRoute = Routes.constructAboutRoute(routeParams);
    const hiwRoute = Routes.constructHiwRoute(routeParams);
    const contactRoute = Routes.constructContactRoute(routeParams);
    const exploreRoute = Routes.constructExploreRoute(routeParams);
    const signInRoute = Routes.constructSignInRoute(routeParams);
    const homeRoute = Routes.constructHomeRoute(
      routeParams,
      ManageGroupUrlState,
      AuthenticationState
    );

    return (
      <main>
        <header className="navbar transparent">
          <div className="navbar-left">
            <NavLink to={homeRoute}>
              <img className="logo" src={studentLogo} alt="Logo" />
            </NavLink>
            <p className="title">Student Showcase</p>
          </div>

          <div className="burger-menu">
            <div className="burger-bar"></div>
            <div className="burger-bar"></div>
            <div className="burger-bar"></div>
          </div>

          <div className="nav-overlay"></div>

          <div className="navbar-center">
            <NavLink to={aboutRoute}>About</NavLink>
            <NavLink to={hiwRoute}>How It Works</NavLink>
            <NavLink to={contactRoute}>Contact</NavLink>
          </div>
          <div className="navbar-right">
            <NavLink to={exploreRoute}>Explore</NavLink>
            <NavLink to={signInRoute}>Login</NavLink>
          </div>
        </header>
        <div>
          <ExploreOffers />;
        </div>
      </main>
    );
  }
}

const ConnectedExploreFront = connect(mapStateToProps)(ExploreFrontClass);

function ExploreFront() {
  const params = useParams();
  return <ConnectedExploreFront params={params} />;
}

export default ExploreFront;
