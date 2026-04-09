import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../redux-store/hooks';
import { NavLink, useParams } from 'react-router-dom';
import Routes from '../../router/routes';
import '../../shared-js-css-styles/front.css';

import studentLogo from '../../img/student_logo.png';
import linkedIn from '../../img/linkedin_logo.png';

const Contact: React.FC = () => {
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
      <section className="contact-container">
        <div className="contact-hero">
          <h2>Contact Us</h2>
          <p>
            Not sure what you need? The team at Student Showcase are on hand to help guide you and
            suggest the best options to you.
          </p>
          <div>
            <img src="" alt="" />
            <p>
              <a href="mailto:info@studentshowcase.co.uk">info@studentshowcase.co.uk</a>
            </p>
          </div>
          <div className="contact-info">
            <h4>Stay Connected:</h4>
            <div>
              <a
                href="https://www.linkedin.com/company/student-showcase25"
                target="_blank"
                rel="noreferrer"
              >
                <img src={linkedIn} alt="Linkedin" />
              </a>
            </div>
          </div>
        </div>
        <div className="contact-form">
          <form action="#" method="POST">
            <label>Name:</label>
            <input type="text" id="name" name="name" placeholder="Your Name" required />

            <label>Company Name:</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Company Name"
              required
            />

            <label>Company Position:</label>
            <input
              type="text"
              id="companyPosition"
              name="companyPosition"
              placeholder="Your Position"
              required
            />

            <label>Company Email:</label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              placeholder="Company Email"
              required
            />

            <label>Message:</label>
            <textarea
              id="message"
              name="message"
              placeholder="Write your message here"
              required
            ></textarea>

            <button type="submit">Send</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
