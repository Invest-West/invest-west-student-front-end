import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../redux-store/hooks';
import { NavLink, useParams } from 'react-router-dom';
import Routes from '../../router/routes';
import '../../shared-js-css-styles/front.css';

import studentLogo from '../../img/student_logo.png';
import handshake from '../../img/handshake_1.svg';
import money from '../../img/money.svg';
import time from '../../img/time.svg';
import computer from '../../img/computer.svg';

const About: React.FC = () => {
  const params = useParams();
  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      if (!prev) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

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
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-text">
            <h3>About us</h3>
            <h2>Transforming the way you see student projects</h2>
            <p>
              Here at Student Showcase we are passionate about giving students the best opportunity
              to show their best work, visually bringing to life there work.
            </p>
            <p>
              This allows you to view and interact with the real life projects that students from
              around the country have been working on and see if they are the right fit for you and
              you're company.
            </p>
          </div>
          <div className="about-hero-image">
            <img src={handshake} alt="2 people shaking hands over a desk" />
          </div>
        </div>
      </section>
      <section>
        <div className="about-intro">
          <h3>Why Choose Us</h3>
          <h2>Our goal is to help you get to know your potential employees experience better </h2>
        </div>
      </section>
      <section className="about-cards">
        <div>
          <div>
            <img src={money} alt="Coins with leafs growing out of them" />
          </div>
          <div>
            <h3>Benefits</h3>
            <p>
              Rather than having to scrape through CV after CV our platform provides a unique view
              of the work that students have undertaken in their degrees.
            </p>
          </div>
        </div>
        <div>
          <div>
            <img src={time} alt="A clock with a thumbs up beside it" />
          </div>
          <div>
            <h3>Efficient</h3>
            <p>
              We recognise hiring a new employee can be extremely time and cost consuming which is
              why we make sure you know exactly what a potential employee can do.
            </p>
          </div>
        </div>
        <div>
          <div>
            <img src={computer} alt="A laptop with graphs on the screen" />
          </div>
          <div>
            <h3>Correct Fit</h3>
            <p>
              Making sure that the fit is correct for all is also important which is why we
              categorise projects and give key insights into what the students work involves{' '}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
