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
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {fetchOffers} from "../../shared-components/explore-offers/ExploreOffersActions";
import {ExploreOffersState, hasNotFetchedOffers} from "../../shared-components/explore-offers/ExploreOffersReducer";
import {FetchProjectsOrderByOptions} from "../../api/repositories/OfferRepository";
import OffersCarousel from "../../shared-components/offers-carousel/OffersCarousel";
import {Box} from "@material-ui/core";

// Import images
import studentLogo from "../../img/student_logo.png"; 

interface FrontProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    MediaQueryState: MediaQueryState;
    ExploreOffersLocalState: ExploreOffersState;
    fetchOffers: (orderBy?: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        MediaQueryState: state.MediaQueryState,
        ExploreOffersLocalState: state.ExploreOffersLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        fetchOffers: (orderBy?: string) => dispatch(fetchOffers(orderBy))
    }
}

interface FrontState {
    activeTab: "academia" | "employer";
}

class Front extends Component<FrontProps & Readonly<RouteComponentProps<RouteParams>>, FrontState> {
    constructor(props: FrontProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.state = {
            activeTab: "academia"
        };
    }

    componentDidMount() {
        if (hasNotFetchedOffers(this.props.ExploreOffersLocalState)) {
            this.props.fetchOffers(FetchProjectsOrderByOptions.Phase);
        }
    }
      handleTabChange = (tab: "academia" | "employer") => {
        this.setState({ activeTab: tab });
    }
    
    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            ExploreOffersLocalState
        } = this.props;
        
        // Not using activeTab in this component currently
        const { match } = this.props;
        const groupParam = match.params.groupUserName ? match.params.groupUserName : null;
        
        // Construct proper routes based on whether we have a group or not
        const aboutRoute = groupParam ? `/groups/${groupParam}/about` : "/about";
        const hiwRoute = groupParam ? `/groups/${groupParam}/Hiw` : "/Hiw";
        const contactRoute = groupParam ? `/groups/${groupParam}/contact` : "contact-us-front";
        const exploreRoute = groupParam ? `/groups/${groupParam}/explore` : "/explore";
        const signInRoute = Routes.constructSignInRoute(match.params);
        const homeRoute = Routes.constructHomeRoute(match.params, ManageGroupUrlState, AuthenticationState);
        
        return (
        <main>
           <header className="navbar transparent">
            <div className="navbar-left">
                <NavLink to={homeRoute}><img className="logo" src={studentLogo} alt="Logo"/></NavLink>
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
             <section className="hero">
                <div className="hero-content">
                <h1>Helping You Show Your Talents To The World</h1>
                <p>Connecting students with industry to find the next generation of thinkers. Displaying the best o the UK talent pool across the full range of disciplines, from Biology to Business.</p>

                <NavLink to={exploreRoute} className="cta-button">Explore Projects</NavLink>
                </div>
                {ExploreOffersLocalState.offerInstances.length > 0 && (
                    <Box
                        paddingX={this.props.MediaQueryState.isMobile ? "20px" : "56px"}
                        paddingY={this.props.MediaQueryState.isMobile ? "15px" : "40px"}
                        marginTop="2rem"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        <OffersCarousel offers={ExploreOffersLocalState.offerInstances.slice(0, 3)} />
                    </Box>
                )}
            </section>
        </main>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Front);