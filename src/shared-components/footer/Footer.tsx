import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {Box, Divider, Typography} from "@material-ui/core";
import Routes from "../../router/routes";
import * as appColors from "../../values/colors";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {Image} from "react-bootstrap";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";

interface FooterProps {
    position?: "relative" | "fixed",
    MediaQueryState: MediaQueryState;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState
    }
}

class Footer extends Component<FooterProps, any> {
    render() {
        const {
            position,
            MediaQueryState
        } = this.props;

        return <Box
            display="flex"
            flexDirection="column"
            paddingX="15px"
            paddingY="20px"
            borderTop={1}
            borderColor={appColors.kick_starter_gray_box_border}
            bgcolor={appColors.kick_starter_background_color}
            alignItems="center"
            width="100%"
            marginTop="100px"
            style={{
                position: position !== undefined ? position : (MediaQueryState.isMobile || !MediaQueryState.minHeightScreen ? "relative" : "fixed"),
                bottom: position === undefined ? 0 : "none"
            }}
        >
            <Box display="flex" flexDirection="row" justifyContent="center" >
                <CustomLink
                    color="black"
                    target="_blank"
                    activeColor="#007BFF"
                    activeUnderline={true}
                    url={Routes.constructPublicRoute("termsOfUse")}
                    component="nav-link"
                    childComponent={
                        <Typography variant="body1">Terms of Use</Typography>
                    }
                />

                <Box width={25} />

                <CustomLink
                    color="black"
                    target="_blank"
                    activeColor="#007BFF"
                    activeUnderline={true}
                    url={Routes.constructPublicRoute("privacyPolicy")}
                    component="nav-link"
                    childComponent={
                        <Typography variant="body1">Privacy Policy</Typography>
                    }
                />
            </Box>

            <Box marginY="20px" width={MediaQueryState.isMobile ? "100%" : "500px"}>
                <Divider/>
            </Box>

            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" >
                <Image
                    alt="Invest West logo"
                    src={require("../../img/logo.png").default}
                    style={{ width: "auto", height: 34, objectFit: "contain" }}
                />
                <Box width="20px" />
                <Typography align="left" variant="body1">Powered by Invest West. <br/> Copyright © 2021 Invest West Ltd - All Rights Reserved.</Typography>
            </Box>
        </Box>;
    }
}

export default connect(mapStateToProps)(Footer);
