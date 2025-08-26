import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {
    ManageGroupUrlState
} from "../../redux-store/reducers/manageGroupUrlReducer";
import {
    AuthenticationState
} from "../../redux-store/reducers/authenticationReducer";
import {RouteComponentProps, NavLink} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import Routes from "../../router/routes";
import "../../shared-js-css-styles/front.css";

import studentLogo from "../../img/student_logo.png"; 
import handshake from "../../img/handshake_1.svg"; 
import money from "../../img/money.svg";
import time from "../../img/time.svg";
import computer from "../../img/computer.svg";

interface AboutProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    MediaQueryState: MediaQueryState;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        MediaQueryState: state.MediaQueryState
    }
}

interface AboutState {
    activeTab: "academia" | "employer";
}

class About extends Component<AboutProps & Readonly<RouteComponentProps<RouteParams>>, AboutState> {
    constructor(props: AboutProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.state = {
            activeTab: "academia"
        };
    }
    
    handleTabChange = (tab: "academia" | "employer") => {
        this.setState({ activeTab: tab });
    }
      render() {
        const {
            ManageGroupUrlState,
            AuthenticationState
        } = this.props;
        
        const { activeTab } = this.state;
        const { match } = this.props;
        const groupParam = match.params.groupUserName ? match.params.groupUserName : null;
        
        // Construct proper routes based on whether we have a group or not
        const aboutRoute = groupParam ? `/groups/${groupParam}/about` : "/about";
        const hiwRoute = groupParam ? `/groups/${groupParam}/Hiw` : "/Hiw";
        const contactRoute = groupParam ? Routes.groupContact.replace(":groupUserName", groupParam) : Routes.nonGroupContact;
        const exploreRoute = groupParam ? `/groups/${groupParam}/explore` : "/explore";
        const signInRoute = Routes.constructSignInRoute(match.params);
        const homeRoute = Routes.constructHomeRoute(match.params, ManageGroupUrlState, AuthenticationState);

        return (
        <main>
           <header className="navbar transparent">
            <div className="navbar-left">
                <NavLink to={homeRoute}><img className="logo" src={studentLogo} alt="Logo"/></NavLink>
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
            </div>            <div className="navbar-right">
                <NavLink to={exploreRoute}>Explore</NavLink>
                <NavLink to={signInRoute}>Login</NavLink>
            </div>
           </header>
            <section className="about-hero">
                    <div className="about-hero-content">
                        <div className="about-hero-text">
                            <h3>About us</h3>
                            <h2>Transforming the way you see student projects</h2>
                            <p>Here at Student Showcase we are passionate about giving students the best opportunity to show their best work, visually bringing to life there work.</p>
                            <p>This allows you to view and interact with the real life projects that students from around the country have been working on and see if they are the right fit for you and you’re company.</p>
                        </div>
                        <div className="about-hero-image">
                            <img src={handshake} alt="2 people shaking hands over a desk"/>
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
                            <img src={money} alt="Image of coins with leafs growing out of them"/>
                        </div>
                        <div>
                            <h3>Benefits</h3>
                            <p>Rather than having to scrape through CV after CV our platform provides a unique view of the work that students have undertaken in their degrees.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={time} alt="Image of a clock with a thumbs up beside it"/>
                        </div>
                        <div>
                            <h3>Efficient</h3>
                            <p>We recognise hiring a new employee can be extremely time and cost consuming which is why we make sure you know exactly what a potential employee can do.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={computer} alt="Image of a laptop with graphs on the screen"/>
                        </div>
                        <div>
                            <h3>Correct Fit</h3>
                            <p>Making sure that the fit is correct for all is also important which is why we categorise projects and give key insights into what the students work involves </p>
                        </div>
                    </div>
                </section>
        </main>
        )
    }
}

export default connect(mapStateToProps)(About);