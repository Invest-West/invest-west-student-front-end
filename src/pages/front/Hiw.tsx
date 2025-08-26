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

// Import images
import studentLogo from "../../img/student_logo.png";
import studentLaptop from "../../img/student_laptop.svg";
import studentSignup from "../../img/student_signup.svg";
import studentUpload from "../../img/student_upload.svg";
import studentShake from "../../img/student_shake.svg";
import employHero from "../../img/employ_hero.svg";
import employSignup from "../../img/employ_signup.svg";
import employProject from "../../img/employ_project.svg";
import employHire from "../../img/employ_hire.svg";


interface HiwProps {
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

interface HiwState {
    activeTab: "academia" | "employer";
}

class Hiw extends Component<HiwProps & Readonly<RouteComponentProps<RouteParams>>, HiwState> {
    constructor(props: HiwProps & Readonly<RouteComponentProps<RouteParams>>) {
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
            <div className="hiw-tabs">
                <button 
                    className={`hiw-tab ${activeTab === "academia" ? "active" : ""}`} 
                    onClick={() => this.handleTabChange("academia")}
                >
                    Academia
                </button>
                <button 
                    className={`hiw-tab ${activeTab === "employer" ? "active" : ""}`}
                    onClick={() => this.handleTabChange("employer")}
                >
                    Industry
                </button>
            </div>
            <div className={`hiw-academia hiw-view ${activeTab === "academia" ? "active" : ""}`}>
                <section className="hiw-hero">
                    <div className="hiw-hero-content">
                        <div className="hiw-hero-text">
                            <h2>Bringing your projects closer to your industry of choice</h2>
                            <p>Struggling to present your projects on your CV? let us help by bringing your work to life and putting you in Hiw of the industry's eyes.</p>
                        </div>
                        <div className="hiw-hero-image">
                            <img src={studentLaptop} alt="Student with laptop"/>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="hiw-intro">
                        <h2>How we help you</h2>
                    </div>
                </section>
                <section className="hiw-cards">
                    <div>
                        <div>
                            <img src={studentSignup} alt="A student signing up to a website"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 1</p>
                            <h4>Setup your account</h4>
                            <p>Setup an account with your university group and begin to explore some of our example and live projects as inspiration.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={studentUpload} alt="A student uploading a file"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 2</p>
                            <h4>Upload project</h4>
                            <p>Upload your work to our platform ready to show off to industry and recruiters using the site, as well as send it along with your CV for jobs you are applying for so those in industry can view it.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={studentShake} alt="A student shaking hands with an employer"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 3</p>
                            <h4>Connect with industry</h4>
                            <p>Connect with industry in your areas of interest and get that dream job you always wanted.</p>
                        </div>
                    </div>
                </section>
            </div>
            <div className={`hiw-employer hiw-view ${activeTab === "employer" ? "active" : ""}`}>                <section className="hiw-hero">
                    <div className="hiw-hero-content">
                        <div className="hiw-hero-text">
                            <h2>Bringing your future academic projects to life</h2>
                            <p>Finding it hard to visualize what a potential employee's previous work looks like? Let us help by showing you exactly that - students' work come to life on our platform.</p>
                        </div>
                        <div className="hiw-hero-image">
                            <img src={employHero} alt="Employer viewing projects"/>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="hiw-intro">
                        <h2>How we help you</h2>
                    </div>
                </section>
                <section className="hiw-cards">
                    <div>
                        <div>
                            <img src={employSignup} alt="Employer signing up"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 1</p>
                            <h4>Access Projects</h4>
                            <p>Choose to setup an account or just view the project you have been provided. If you have been sent more than one link, why not sign up to get more support should you require it.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={employProject} alt="Employer viewing projects"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 2</p>
                            <h4>View Projects</h4>
                            <p>See what potential employees have to offer and make sure it’s relevant to what you do and if they would be a good match for your company.</p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <img src={employHire} alt="Employer hiring candidate"/>
                        </div>
                        <div>
                            <p className="hiw-step">Step 3</p>                            
                            <h4>Connect with candidates</h4>
                            <p>Connect with talented students whose skills match your company's needs and find your next perfect hire.</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
        )
    }
}

export default connect(mapStateToProps)(Hiw);