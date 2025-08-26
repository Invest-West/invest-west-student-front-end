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
import linkedIn from "../../img/linkedin_logo.png";
import insta from "../../img/insta.svg";
import discord from "../../img/discord.svg";


interface ContactProps {
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

interface ContactState {
    activeTab: "academia" | "employer";
}

class Contact extends Component<ContactProps & Readonly<RouteComponentProps<RouteParams>>, ContactState> {
    constructor(props: ContactProps & Readonly<RouteComponentProps<RouteParams>>) {
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
            </div>            
            <div className="navbar-right">
                <NavLink to={exploreRoute}>Explore</NavLink>
                <NavLink to={signInRoute}>Login</NavLink>
            </div>
           </header>
                <section className="contact-container">
                    <div className="contact-hero">
                        <h2>Contact Us</h2>
                        <p>Not sure what you need? The team at Student Showcase are on hand to help guide you and suggest the best options to you.</p>
                        <div>
                            <img src="" alt=""/>
                        <p><a href="mailto:info@studentshowcase.co.uk">info@studentshowcase.co.uk</a></p>
                        </div>
                        <div className="contact-info">
                            <h4>Stay Connected:</h4>
                            <div>
                                <a href="https://www.linkedin.com/company/student-showcase25" target="_blank"><img src={linkedIn} alt="Linkedin"/></a>
                            </div>
                        </div>
                    </div>
                    <div className="contact-form">
                        <form action="#" method="POST">
                            <label ></label>
                            <input type="text" id="name" name="name" placeholder="Full Name" required/>

                            <label></label>
                            <input type="email" id="email" name="email" placeholder="Email" required/>

                            <label></label>
                            <textarea id="message" name="message" placeholder="Write your message here" required></textarea>

                            <button type="submit">Send</button>
                        </form>
                    </div>
                </section>
        </main>
        )
    }
}

export default connect(mapStateToProps)(Contact);