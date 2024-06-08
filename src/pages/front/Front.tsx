import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {Col, Container, Image, Row} from "react-bootstrap";
import {Box, Button, colors, Divider, Typography, Link} from "@material-ui/core";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {
    getGroupRouteTheme,
    isValidatingGroupUrl,
    ManageGroupUrlState,
    routeContainsGroupName
} from "../../redux-store/reducers/manageGroupUrlReducer";
import {
    AuthenticationState,
    isAuthenticating,
    successfullyAuthenticated
} from "../../redux-store/reducers/authenticationReducer";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {getGroupLogo} from "../../models/group_properties";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import Routes from "../../router/routes";
import {toRGBWithOpacity} from "../../utils/colorUtils";

const logoHeightMobile: number = 160;
const logoHeight: number = 220;

interface FrontProps {
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

class Front extends Component<FrontProps & Readonly<RouteComponentProps<RouteParams>>, any> {
    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            MediaQueryState
        } = this.props;

        return <Container fluid style={{padding: 0, position: "fixed", height: "100% !important", overflowY: "auto", top: 0}}>
            <Row noGutters >
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center" paddingX="30px" paddingY="20px">
                        <CustomLink url={Routes.constructContactUsRoute(this.props.match.params)} color="black" activeColor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} activeUnderline={false} component="nav-link" 
                        childComponent={
                                <Typography variant="body1">Contact us</Typography>
                            }/>

                        <Box width="35px"/>

                        <Box width="35px"/>

                        <CustomLink
                            url={
                                isAuthenticating(AuthenticationState)
                                    ? ""
                                    : !successfullyAuthenticated(AuthenticationState)
                                    ? Routes.constructSignInRoute(this.props.match.params)
                                    : Routes.constructDashboardRoute(this.props.match.params, ManageGroupUrlState, AuthenticationState)
                            }
                            color="black"
                            activeColor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                            activeUnderline={false}
                            // TODO: When completely migrate to the new authentication flow, change this component to "nav-link"
                            component="a"
                            childComponent={
                                <Button color="primary" className={css(sharedStyles.no_text_transform)} variant="contained" size="medium">
                                    {
                                        isAuthenticating(AuthenticationState)
                                            ? ""
                                            : !successfullyAuthenticated(AuthenticationState)
                                            ? "Sign in"
                                            : "Dashboard"
                                    }
                                </Button>
                            }
                        />
                    </Box>
                </Col>
            </Row>

            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Divider/>
                </Col>
            </Row>

            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Box display="flex" flexDirection="column" height="100%" minHeight="100vh"
                        bgcolor={
                            toRGBWithOpacity(
                                getGroupRouteTheme(ManageGroupUrlState).palette.primary.main,
                                0.12
                            )
                        }
                    >
                        {/* Front page link to website */}
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={3} paddingY="50px">
                        <Link href={ManageGroupUrlState.group?.website ?? ""} target="_blank">

                            {
                                isValidatingGroupUrl(ManageGroupUrlState)
                                    ? null
                                    : <Image
                                        alt="logo"
                                        src={
                                            !routeContainsGroupName(ManageGroupUrlState)
                                                ? require("../../img/logo.png").default
                                                : getGroupLogo(ManageGroupUrlState.group)
                                        }
                                        style={{
                                            width: "auto",
                                            height: MediaQueryState.isMobile ? logoHeightMobile : logoHeight
                                        }}
                                    />
                            }
                            </Link>

                            <Box height="20px"/>

                            <Typography color="primary" variant="h2" align="center">
                                {
                                    isValidatingGroupUrl(ManageGroupUrlState)
                                        ? ""
                                        : !routeContainsGroupName(ManageGroupUrlState)
                                        ? "Invest West"
                                        : ManageGroupUrlState.group?.displayName
                                }
                            </Typography>

                            {
                                routeContainsGroupName(ManageGroupUrlState)
                                    ? null
                                    : <Box color={colors.blueGrey["500"]} marginTop="20px">
                                        <Typography variant="h4" align="center">Connecting businesses and investors</Typography>
                                    </Box>
                            }
                        </Box>

                        <Box display="flex" flexDirection="column" justifyContent="flex-end" flexGrow={1}>
                            <Image alt="front_footer" src={require("../../img/front_page_cover_image.png").default} style={{objectFit: "fill"}}/>
                            <Box height="90px"
                                bgcolor={
                                    toRGBWithOpacity(
                                        getGroupRouteTheme(ManageGroupUrlState).palette.primary.main,
                                        0.75
                                    )
                                }
                            />
                        </Box>
                    </Box>
                </Col>
            </Row>
        </Container>;
    }
}

export default connect(mapStateToProps)(Front);