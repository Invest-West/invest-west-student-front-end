import React from 'react';
import { useAppSelector } from '../../redux-store/hooks';
import { NavLink, useParams } from 'react-router-dom';
import Routes from '../../router/routes';
import '../../shared-js-css-styles/front.css';
import ExploreOffers from '../../shared-components/explore-offers/ExploreOffers';

import studentLogo from '../../img/student_logo.png';

const ExploreFront: React.FC = () => {
  const params = useParams();
  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);

  const aboutRoute = Routes.constructAboutRoute(params);
  const hiwRoute = Routes.constructHiwRoute(params);
  const contactRoute = Routes.constructContactRoute(params);
  const exploreRoute = Routes.constructExploreRoute(params);
  const signInRoute = Routes.constructSignInRoute(params);
  const homeRoute = Routes.constructHomeRoute(params, ManageGroupUrlState, AuthenticationState);

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
};

export default ExploreFront;
