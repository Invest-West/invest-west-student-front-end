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
import ExploreOffers from "../../shared-components/explore-offers/ExploreOffers";

import studentLogo from "../../img/student_logo.png";


interface ExploreFrontProps {
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

interface ExploreFrontState {
    activeTab: "academia" | "employer";
}

class ExploreFront extends Component<ExploreFrontProps & Readonly<RouteComponentProps<RouteParams>>, ExploreFrontState> {
    constructor(props: ExploreFrontProps & Readonly<RouteComponentProps<RouteParams>>) {
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
        const aboutRoute = Routes.constructAboutRoute(match.params);
        const hiwRoute = Routes.constructHiwRoute(match.params);
        const contactRoute = Routes.constructContactRoute(match.params);
        const exploreRoute = Routes.constructExploreRoute(match.params);
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
            <div>
                <ExploreOffers/>;
            </div>
        </main>
        )
    }
}

export default connect(mapStateToProps)(ExploreFront);