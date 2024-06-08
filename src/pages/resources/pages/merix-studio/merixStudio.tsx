/* eslint-disable jsx-a11y/img-redundant-alt */
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ResourcesState} from "../../ResourcesReducer";
import {MediaQueryState} from "../../../../redux-store/reducers/mediaQueryReducer";
import {toggleContactResourceDialog} from "../../ResourcesActions";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, colors, Divider, Paper, Typography} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import CustomLink from "../../../../shared-js-css-styles/CustomLink";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {AttachFile} from "@material-ui/icons";
import ContactResourceDialog from "../../components/ContactResourceDialog";
import {isDevelopmentEnvironment, isProductionEnvironment} from "../../../../utils/environmentUtil";
import FeedbackSnackbarNew from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarNew";

interface MerixStudioProps {
    MediaQueryState: MediaQueryState;
    ResourcesLocalState: ResourcesState;
    toggleContactResourceDialog: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ResourcesLocalState: state.ResourcesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleContactResourceDialog: () => dispatch(toggleContactResourceDialog())
    }
}

const MerixSolution: string = `${process.env.PUBLIC_URL}/resources/merix-studio/chart-1.png`;
const MerixSolution3: string = `${process.env.PUBLIC_URL}/resources/merix-studio/chart-4.jpg`;



interface MerixStudioResource {
    name: string;
    url: string;
}

const MerixStudioResources: MerixStudioResource[] = [
    {
        name: "Minimum Viable Product uncovered",
        url: "https://content.merixstudio.com/insights/minimum-viable-product-uncovered-what-it-really-an/?theme=startups"
    },
    {
        name: "The right solution for your product launch",
        url: "https://learn.merixstudio.com/product-launch-ebook"
    },
    {
        name: "Startup DNA",
        url: "https://www.merixstudio.com/services/startup-dna/"
    },
    {
        name: "How to launch with a bang",
        url: "https://content.merixstudio.com/insights/how-to-launch-a-product-with-a-bang/"
    },
    {
        name: "State of early-stage startups 2021",
        url: "https://content.merixstudio.com/insights/early-stage-startups-2021-report/"
    },
    {
        name: "Startup DNA, turn your idea into a prototype",
        url: "https://content.merixstudio.com/insights/startup-dna-turn-your-idea-prototype/"
    },
    {
        name: "If you're passionate about an idea give it a try",
        url: "https://content.merixstudio.com/insights/if-youre-passionate-about-an-idea-give-it-a-try-in/"
    },
    {
        name: "Prototype is just one piece of the puzzle",
        url: "https://content.merixstudio.com/insights/prototype-just-one-piece-puzzle-interview-truman-d/"
    },
    {
        name: "Pimp your pitch deck",
        url: "https://content.merixstudio.com/insights/pimp-your-pitch-deck/"
    },
    {
        name: "Building prototype in a UK based startup",
        url: "https://content.merixstudio.com/insights/building-prototype-uk-based-startup/"
    },
];

class MerixStudio extends Component<MerixStudioProps, any> {
    render() {
        const {
            MediaQueryState,
            toggleContactResourceDialog
        } = this.props;

        return <Box
            height="100%"
            minHeight="100vh"
            bgcolor={colors.grey["200"]}
            paddingX={MediaQueryState.isMobile ? "15px" : "56px"}
            paddingY={MediaQueryState.isMobile ? "15px" : "40px"}
        >
            <Row noGutters>
                <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 6, offset: 3}}>
                    <Paper>
                        <Box padding="20px">
                            {/** Header */}
                            <Box display="flex" flexDirection="column" width="100%">
                                <Typography variant="h4" align="left">Merixstudio</Typography>
                            </Box>
                            <Box>
                                <Typography align="left" variant="body1">Merixstudio’s key expertise is the delivery of high-quality and performant web applications and cross-platform mobile apps. Based on the needs of our clients, we can support them in end-to-end product development or seamlessly extend their in-house team of engineers.</Typography>
                                <CustomLink
                                    url="https://www.merixstudio.com/contact/"
                                    target="_blank"
                                    color="none"
                                    activeColor="none"
                                    activeUnderline={false}
                                    component="a"
                                    childComponent={
                                        <Box bgcolor="#31C2DE" color="white" marginY="20px" clone>
                                            <Button variant="contained" className={css(sharedStyles.no_text_transform)}>Contact Us</Button>
                                        </Box>
                                    }
                                />
                            </Box>

                            {/** Divider */}
                            <Box marginY="30px">
                                <Divider/>
                            </Box>
                            <Box display="flex" flexDirection="column">
                                <Box marginY="30px">
                                    <Typography variant="h6" align="left">The right solution for your product launch</Typography>
                                </Box>
                                    <Typography variant="body1" align="center">THE ULTIMATE GUIDE TO COMPOSING</Typography>
                                    <Typography variant="body1" align="center">THE RIGHT SOLUTION FOR YOUR PRODUCT LAUNCH</Typography>
                                <Box marginY="30px">
                                    <Typography variant="body1" align="left">Although similar at first glance, the three concepts differ considerably - especially in terms of the purpose each of them serves. The choice of which one to start with depends on many factors, including your current state of knowledge or the budget you can spend on a given project.</Typography>
                                </Box>
                                    <img width="100%" height="auto" src={MerixSolution} alt="Merix image"/>
                                    <img width="100%" height="auto" src={MerixSolution3} alt="Merix image"/>
                            </Box>

                            {/** Divider */}
                            <Box marginY="30px">
                                <Divider/>
                            </Box>

                            {/** Resources */}
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" align="left">Resources</Typography>
                                <Box height="20px"/>
                                <Box display="flex" flexDirection="column">
                                    {
                                        MerixStudioResources.map((resource: any) => (
                                            <CustomLink
                                                key={resource.name}
                                                url={resource.url}
                                                target="_blank"
                                                color="black"
                                                activeColor="none"
                                                activeUnderline={true}
                                                component="a"
                                                childComponent={
                                                    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="12px">
                                                        <AttachFile fontSize="small"/>
                                                        <Box width="10px"/>
                                                        <Typography variant="body1" align="left">{resource.name}</Typography>
                                                    </Box>
                                                }
                                            />
                                        ))
                                    }
                                </Box>
                            </Box>

                            {/** Divider */}
                            <Box marginY="30px">
                                <Divider/>
                            </Box>

                            {/** About us */}
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" align="left">About us</Typography>
                                <Typography variant="body1" align="justify">
                                    <br/><br/>
                                    Merixstudio’s key expertise is the delivery of high-quality and performant web applications
                                    and cross-platform mobile apps. Based on the needs of our clients, we can support them in
                                    end-to-end product development or seamlessly extend their in-house team of engineers.
                                    <br/><br/>
                                    <ul>
                                        <li>200+ engineers</li>
                                        <li>250 clients supported</li>
                                    </ul>
                                </Typography>

                                <Typography align="left" variant="body1">
                                    <b>Get in touch!</b>
                                    <br/>
                                </Typography>

                                <Box display="flex" justifyContent="center" alignItems="center" marginTop="25px">
                                    <Box bgcolor="#8DC341" color="white" clone>
                                        <Button variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => toggleContactResourceDialog()}>Contact us</Button>
                                    </Box>
                                </Box>
                                <Box height="20px"/>
                            </Box>
                        </Box>
                    </Paper>
                </Col>
            </Row>

            <ContactResourceDialog
                resourceName="Merix Studio"
                resourceEmail={
                    isProductionEnvironment()
                        ? ["g.spychalski@merixstudio.com"]
                        : isDevelopmentEnvironment()
                        ? "j.kubczak@merixstudio.com"
                        : "support@investwest.online"
                }
            />

            <FeedbackSnackbarNew/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MerixStudio);