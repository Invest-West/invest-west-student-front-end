import React, {Component} from "react";
import {connect} from "react-redux";
import {
    getGroupRouteTheme,
    isValidatingGroupUrl,
    ManageGroupUrlState,
    routeContainsGroupName,
    successfullyValidatedGroupUrl
} from "../../redux-store/reducers/manageGroupUrlReducer";
import {
    AuthenticationState,
    isAuthenticating,
    successfullyAuthenticated
} from "../../redux-store/reducers/authenticationReducer";
import {AppState} from "../../redux-store/reducers";
import {Col, Container, Row} from "react-bootstrap";
import * as appColors from "../../values/colors";
import {Box, Button, Divider, Typography} from "@material-ui/core";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {getGroupLogo} from "../../models/group_properties";
import Routes from "../../router/routes";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";

interface HeaderProps extends HeaderLocalProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
}

interface HeaderLocalProps {
    routePath: string;
    homUrl: string;
    dashboardUrl: string;
    signInUrl: string;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

class Header extends Component<HeaderProps, {}> {
    render() {
        const {
            MediaQueryState,
            ManageGroupUrlState,
            AuthenticationState,
            routePath,
            homUrl,
            dashboardUrl,
            signInUrl
        } = this.props;


        return <Container fluid style={{ padding: 0 }} >
            <Row noGutters style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: appColors.white }}>
                {/** Home/Dashboard */}
                <Col xs={{span: 6, order: 3}} sm={{span: 6, order: 3}} md={{span: 4, order: 1}} lg={{span: 4, order: 1}} >
                    <Box display="flex" flexDirection="row" height="100%" alignItems="center" marginLeft="30px" >
                        {
                            successfullyAuthenticated(AuthenticationState)
                                ? null
                                : <CustomLink
                                    color="black"
                                    activeColor={
                                        Routes.isErrorRoute(routePath) || Routes.isSystemPublicRoute(routePath)
                                            ? appColors.primaryColor
                                            : getGroupRouteTheme(ManageGroupUrlState).palette.primary.main
                                    }
                                    activeUnderline={false}
                                    url={homUrl}
                                    component="nav-link"
                                    childComponent={
                                        <Typography variant="body1">Home</Typography>
                                    }
                                />
                        }

                        {
                            isAuthenticating(AuthenticationState)
                                ? null
                                : !successfullyAuthenticated(AuthenticationState)
                                ? null
                                : <CustomLink
                                    color="black"
                                    activeColor={
                                        Routes.isErrorRoute(routePath) || Routes.isSystemPublicRoute(routePath)
                                            ? appColors.primaryColor
                                            : getGroupRouteTheme(ManageGroupUrlState).palette.primary.main
                                    }
                                    activeUnderline={false}
                                    url={dashboardUrl}
                                    component="nav-link"
                                    childComponent={
                                        <Typography variant="body1">Dashboard</Typography>
                                    }
                                />
                        }
                    </Box>
                </Col>

                {/** Logo */}
                <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 4, order: 2}} lg={{span: 4, order: 2}}>
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <CustomLink
                            color="none"
                            activeColor="none"
                            activeUnderline={false}
                            url={homUrl}
                            component="nav-link"
                            childComponent={
                                <Box display="flex" flexDirection="column" width="125px" height="100%" justifyContent="center" alignItems="center">
                                    <img
                                        alt="logo"
                                        src={
                                            Routes.isErrorRoute(routePath) || Routes.isSystemPublicRoute(routePath)
                                                ? require("../../img/logo.png").default
                                                : ManageGroupUrlState.group && getGroupLogo(ManageGroupUrlState.group)
                                                    ? getGroupLogo(ManageGroupUrlState.group)
                                                    : require("../../img/logo.png").default
                                        }
                                        style={{ width: "auto", height: 36, objectFit: "contain" }}
                                    />
                                    <Box height="3px" />
                                    <Box
                                        fontWeight="fontWeightBold"
                                        color={
                                            Routes.isErrorRoute(routePath) || Routes.isSystemPublicRoute(routePath)
                                                ? appColors.primaryColor
                                                : "primary.main"
                                        }
                                    >
                                        <Typography variant="body1" noWrap >
                                            {
                                                Routes.isErrorRoute(routePath) || Routes.isSystemPublicRoute(routePath)
                                                    ? "Default student"
                                                    : ManageGroupUrlState.group?.displayName 
                                                        ? ManageGroupUrlState.group.displayName
                                                        : routeContainsGroupName(ManageGroupUrlState)
                                                            ? "Loading..."
                                                            : "Default student"
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    </Box>
                </Col>

                {
                    !MediaQueryState.isMobile
                        ? null
                        : <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} >
                            <Box marginY="10px" >
                                <Divider/>
                            </Box>
                        </Col>
                }

                {/** Sign in/Avatar */}
                <Col xs={{span: 6, order: 4}} sm={{span: 6, order: 4}} md={{span: 4, order: 3}} lg={{span: 4, order: 3}} >
                    {
                        isAuthenticating(AuthenticationState)
                            ? null
                            : !successfullyAuthenticated(AuthenticationState)
                            ? Routes.isSignInRoute(routePath)
                                ? null
                                : <Box display="flex" flexDirection="row" height="100%" justifyContent="flex-end" alignItems="center" marginRight="30px" >
                                    <CustomLink
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        url={signInUrl}
                                        // TODO: When completely migrate to the new authentication flow, change this component to "nav-link"
                                        component="a"
                                        childComponent={
                                            <Button color="primary" className={css(sharedStyles.no_text_transform)} variant="contained" size="medium">Sign in</Button>
                                        }
                                    />
                                </Box>
                            : null
                    }
                </Col>
            </Row>

            {/** Divider */}
            <Row noGutters >
                <Col xs={12} sm={12} md={12} lg={12} >
                    <Divider/>
                </Col>
            </Row>
        </Container>;
    }
}

export default connect(mapStateToProps)(Header);