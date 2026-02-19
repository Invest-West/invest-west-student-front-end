import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Routes from '../../router/routes';
import { fetchOffers } from '../../shared-components/explore-offers/ExploreOffersActions';
import { hasNotFetchedOffers } from '../../shared-components/explore-offers/ExploreOffersReducer';
import { FetchProjectsOrderByOptions } from '../../api/repositories/OfferRepository';
import OffersCarousel from '../../shared-components/offers-carousel/OffersCarousel';
import { Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';

// Import images
import studentLogo from '../../img/student_logo.png';

const Front: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams();

  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);
  const MediaQueryState = useAppSelector((state) => state.MediaQueryState);
  const ExploreOffersLocalState = useAppSelector((state) => state.ExploreOffersLocalState);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // componentDidMount: fetch offers
  useEffect(() => {
    if (hasNotFetchedOffers(ExploreOffersLocalState)) {
      dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentWillUnmount: clean up body class
  useEffect(() => {
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      const willBeOpen = !prev;
      if (willBeOpen) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
      return willBeOpen;
    });
  }, []);

  // Construct proper routes based on whether we have a group or not
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

        <div
          className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="burger-bar"></div>
          <div className="burger-bar"></div>
          <div className="burger-bar"></div>
        </div>

        <div
          className={`nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        ></div>

        <div className={`navbar-center ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <NavLink to={aboutRoute} onClick={toggleMobileMenu}>
            About
          </NavLink>
          <NavLink to={hiwRoute} onClick={toggleMobileMenu}>
            How It Works
          </NavLink>
          <NavLink to={contactRoute} onClick={toggleMobileMenu}>
            Contact
          </NavLink>
        </div>
        <div className={`navbar-right ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <NavLink to={exploreRoute} onClick={toggleMobileMenu}>
            Explore
          </NavLink>
          <NavLink to={signInRoute} onClick={toggleMobileMenu}>
            Login
          </NavLink>
        </div>
      </header>
      <section className="hero">
        <div className="hero-content">
          <h1>Helping You Show Your Talents To The World</h1>
          <p>
            Connecting students with industry to find the next generation of thinkers. Displaying
            the best of UK talent across the full range of disciplines, from Biology to Business.
          </p>

          <NavLink to={exploreRoute} className="cta-button">
            Explore Projects
          </NavLink>
        </div>
        {ExploreOffersLocalState.offerInstances.length > 0 && (
          <Box
            paddingX={MediaQueryState.isMobile ? '20px' : '56px'}
            paddingY={MediaQueryState.isMobile ? '15px' : '40px'}
            marginTop="2rem"
            style={{
              borderRadius: '10px',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <OffersCarousel offers={ExploreOffersLocalState.offerInstances.slice(0, 3)} />
          </Box>
        )}
      </section>
    </main>
  );
};

export default Front;
