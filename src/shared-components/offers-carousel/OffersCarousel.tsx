import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {ProjectInstance} from "../../models/project";
import OfferItem from "../explore-offers/OfferItem";
import {Box, IconButton} from "@material-ui/core";
import {ArrowBackIos, ArrowForwardIos} from "@material-ui/icons";
import {Col, Row} from "react-bootstrap";
import {withRouter, RouteComponentProps} from "react-router-dom";
import Routes from "../../router/routes";
import "./OffersCarousel.scss";

interface OffersCarouselProps extends RouteComponentProps {
    offers: ProjectInstance[];
    AuthenticationState: AuthenticationState;
    ManageGroupUrlState: ManageGroupUrlState;
}

interface OffersCarouselState {
    currentIndex: number;
    itemsPerView: number;
}

const mapStateToProps = (state: AppState) => {
    return {
        AuthenticationState: state.AuthenticationState,
        ManageGroupUrlState: state.ManageGroupUrlState
    }
}

class OffersCarousel extends Component<OffersCarouselProps, OffersCarouselState> {
    private carouselRef = React.createRef<HTMLDivElement>();
    
    constructor(props: OffersCarouselProps) {
        super(props);
        this.state = {
            currentIndex: 0,
            itemsPerView: 3
        };
    }
    
    componentDidMount() {
        this.updateItemsPerView();
        window.addEventListener('resize', this.updateItemsPerView);
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateItemsPerView);
    }
    
    updateItemsPerView = () => {
        const width = window.innerWidth;
        let itemsPerView = 3;
        
        if (width < 576) {
            itemsPerView = 1;
        } else if (width < 992) {
            itemsPerView = 2;
        }
        
        this.setState({ itemsPerView });
    }
    
    handleOfferClick = (offer: ProjectInstance) => {
        const { ManageGroupUrlState, history } = this.props;
        const projectUrl = Routes.constructProjectDetailRoute(ManageGroupUrlState.groupNameFromUrl ?? null, ManageGroupUrlState.courseNameFromUrl ?? null, offer.projectDetail.id);
        history.push(projectUrl);
    }
    
    handlePrevClick = () => {
        const { offers } = this.props;
        if (!offers || offers.length === 0) return;
        
        this.setState(prevState => ({
            currentIndex: prevState.currentIndex === 0 ? offers.length - 1 : prevState.currentIndex - 1
        }));
    }
    
    handleNextClick = () => {
        const { offers } = this.props;
        if (!offers || offers.length === 0) return;
        
        this.setState(prevState => ({
            currentIndex: (prevState.currentIndex + 1) % offers.length
        }));
    }
    
    getVisibleOffers = () => {
        const { offers } = this.props;
        const { currentIndex, itemsPerView } = this.state;
        
        if (!offers || offers.length === 0) return [];
        
        const visibleOffers = [];
        for (let i = 0; i < itemsPerView; i++) {
            const index = (currentIndex + i) % offers.length;
            visibleOffers.push(offers[index]);
        }
        
        return visibleOffers;
    }

    render() {
        const { offers } = this.props;
        const { itemsPerView } = this.state;

        if (!offers || offers.length === 0) {
            return null;
        }

        const visibleOffers = this.getVisibleOffers();
        const showArrows = offers.length > itemsPerView;

        return (
            <div className="offers-carousel">
                <div className="carousel-container" ref={this.carouselRef}>
                    {showArrows && (
                        <IconButton 
                            className="carousel-button carousel-button-prev"
                            onClick={this.handlePrevClick}
                            size="medium"
                        >
                            <ArrowBackIos />
                        </IconButton>
                    )}
                    
                    <Row>
                        {visibleOffers.map((offer, index) => (
                            <Col key={offer.projectDetail.id} xs={12} sm={12} md={6} lg={4}>
                                <Box 
                                    margin="16px"
                                    onClick={() => this.handleOfferClick(offer)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <OfferItem offerInstance={offer} />
                                </Box>
                            </Col>
                        ))}
                    </Row>
                    
                    {showArrows && (
                        <IconButton 
                            className="carousel-button carousel-button-next"
                            onClick={this.handleNextClick}
                            size="medium"
                        >
                            <ArrowForwardIos />
                        </IconButton>
                    )}
                </div>
                
                {showArrows && (
                    <div className="carousel-indicators">
                        {offers.map((_, index) => (
                            <div
                                key={index}
                                className={`indicator ${index === this.state.currentIndex ? 'active' : ''}`}
                                onClick={() => this.setState({ currentIndex: index })}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps)(OffersCarousel));