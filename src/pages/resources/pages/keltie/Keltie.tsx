import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {MediaQueryState} from "../../../../redux-store/reducers/mediaQueryReducer";
import {Box, Button, colors, Divider, Paper, Typography} from "@material-ui/core";
import {Col, Image, Row} from "react-bootstrap";
import CustomLink from "../../../../shared-js-css-styles/CustomLink";
import {AttachFile} from "@material-ui/icons";
import ReactPlayer from "react-player";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {ResourcesState} from "../../ResourcesReducer";
import {toggleContactResourceDialog} from "../../ResourcesActions";
import ContactResourceDialog from "../../components/ContactResourceDialog";
import FeedbackSnackbarNew from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarNew";
import {isDevelopmentEnvironment, isProductionEnvironment} from "../../../../utils/environmentUtil";

interface KeltieProps {
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

interface KeltieResource {
    name: string;
    url: string;
}

const keltieLogo: string = `${process.env.PUBLIC_URL}/resources/keltie/logo.jpg`;
const sullivanFountainImg: string = `${process.env.PUBLIC_URL}/resources/keltie/sullivan-fountain.jpg`;
const richardLawrenceImg: string = `${process.env.PUBLIC_URL}/resources/keltie/richard-lawrence.jpg`;

const keltieDocuments: KeltieResource[] = [
    {
        name: "An introduction to IP",
        url: `${process.env.PUBLIC_URL}/resources/keltie/an-introduction-to-ip.pdf`
    },
    {
        name: "Designs - Info Sheet",
        url: `${process.env.PUBLIC_URL}/resources/keltie/designs-info-sheet.pdf`
    },
    {
        name: "Patent searching overview guide",
        url: `${process.env.PUBLIC_URL}/resources/keltie/patent-searching-overview-guide.pdf`
    },
    {
        name: "How to get the best from your IP",
        url: `${process.env.PUBLIC_URL}/resources/keltie/how-to-get-the-best-from-your-ip.pptx`
    },
    {
        name: "The tool box",
        url: `${process.env.PUBLIC_URL}/resources/keltie/the-tool-box.pptx`
    }
];

const keltieVideos: KeltieResource[] = [
    {
        name: "IP for Startups: Top 5 Things You Need to Know",
        url: "https://www.youtube.com/watch?v=r5mOCm2tzjg"
    },
    {
        name: "Patents for non patent attorneys - Episode 1",
        url: `${process.env.PUBLIC_URL}/resources/keltie/patents-for-non-patent-attorneys-episode-1.mp4`
    },
    {
        name: "Patents for non patent attorneys - Episode 2",
        url: `${process.env.PUBLIC_URL}/resources/keltie/patents-for-non-patent-attorneys-episode-2.mp4`
    },
    {
        name: "Artificial Intelligence and Patents: AI Inventors",
        url: "https://www.youtube.com/watch?v=QZOC2ZLWjPI"
    },
    {
        name: "Patents and the Internet of Things",
        url: "https://www.youtube.com/watch?v=BnyvbgUSjv4"
    },
    {
        name: "IP Tips: Reducing patent spend (in light of Covid-19)",
        url: "https://www.youtube.com/watch?v=7v00c9VpS-E"
    }
];

class Keltie extends Component<KeltieProps, any> {
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
                                <Row noGutters style={{ width: "100%" }}>
        
                                    <Col sm={12} md={12} lg={12}>
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" paddingX="25px">
                                            <Box marginY="30px">
                                                <Typography variant="h3" align="center">Intellectual Property</Typography>
                                            </Box>
                                            <Typography variant="h6" align="center">A collection of resources to help entrepreneurs better understand Intellectual Property issues. This content is kindly provided by our friends at Keltie LLP.</Typography>
                                        </Box>
                                    </Col>
                                    <Col sm={12} md={12} lg={12}>
                                        <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
                                            <ReactPlayer url={keltieVideos[0].url} height="50vh" width="100%" playing={false} controls={true}/>
                                        </Box>
                                    </Col>
                                </Row>

                                <Box height="30px"/>

                                <Row noGutters style={{ width: "100%"}}>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                        <Divider/>
                                    </Col>
                                </Row>

                                <Box height="30px"/>

                                <Row noGutters style={{ width: "100%" }}>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                        <Typography variant="body1" align="center">
                                            Intellectual property comprises the intangible business assets that are the
                                            result of creativity. In a technology business, much or even most of the
                                            value of the business may lie in the intellectual property that it owns or
                                            controls. While this asset value is significant, the main role of
                                            intellectual property is usually to support the commercial strategy of the
                                            business. It is therefore very important to understand what intellectual
                                            property is needed by a business to support its commercial strategy, so that
                                            the business can make good decisions about identifying and securing the
                                            intellectual property that it needs as efficiently as possible.
                                        </Typography>
                                    </Col>
                                </Row>
                            </Box>

                            {/** Divider */}
                            <Box marginY="30px">
                                <Divider/>
                            </Box>

                            {/** Tips */}
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" align="left">Top 5 Things You Need to Know</Typography>
                                <Box height="20px"/>
                                <Typography variant="body1" align="left" component="span">
                                    <ol>
                                        <li>
                                            There are four main forms of IP Protection
                                            <br/>
                                            <ol type="a">
                                                <li><i>Patents</i> for technological innovations,</li>
                                                <li><i>Trademarks</i> for branding,</li>
                                                <li><i>Registered</i> Designs for the look and feel of a product,</li>
                                                <li><i>Copyright</i> for creative works such as instruction manuals or
                                                    software code.
                                                </li>
                                            </ol>
                                        </li>
                                        <br/>
                                        <li>
                                            Registered vs. unregistered rights
                                            <br/>
                                            <ul>
                                                <li>
                                                    There are differences in strength of registered vs unregistered
                                                    rights, as well as their costs and timescales. Its important to
                                                    choose the right option for your business.
                                                </li>
                                            </ul>
                                        </li>
                                        <br/>
                                        <li>
                                            Application vs. granted rights
                                            <br/>
                                            <ul>
                                                <li>
                                                    When discussing registered rights, always be clear whether you have
                                                    made an application for rights, or actually have granted rights.
                                                </li>
                                            </ul>
                                        </li>
                                        <br/>
                                        <li>
                                            Assessing risk - registrability searching vs Freedom To Operate (FTO)
                                            <br/>
                                            <ul>
                                                <li>
                                                    Owning a registered right, be it a trade mark, patent or registered
                                                    design, does not mean that you automatically have the right to use
                                                    it.
                                                </li>
                                                <li>
                                                    Two types of searching are therefore common with IP. The first is
                                                    performed to understand the chances of your application passing the
                                                    registration process (i.e. patentability searching or trade mark
                                                    registrability searching), whilst the second considers whether your
                                                    proposed commercial activities will be impacted by pre-existing
                                                    rights.
                                                </li>
                                            </ul>
                                        </li>
                                        <br/>
                                        <li>
                                            IP rights are jurisdictional
                                            <br/>
                                            <ul>
                                                <li> IP rights are only enforceable in the country or region they have been granted.</li>
                                            </ul>
                                        </li>
                                    </ol>
                                </Typography>
                                <br/>
                                <Typography variant="body1" align="left">
                                    The UK IPO (Intellectual Property Office) provide funding for IP audits and support
                                    for start-ups. <b>For more information on accessing IP audit funding in the South West,
                                    follow this link</b>&nbsp;
                                    <a href="https://www.businesswest.co.uk/about/partners-programmes/innovate2succeed" target="_blank" rel="noreferrer">Innovate UK EDGE | Business West</a>.
                                </Typography>
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
                                        keltieDocuments.map((document: any) => (
                                            <CustomLink
                                                key={document.name}
                                                url={document.url}
                                                target="_blank"
                                                color="black"
                                                activeColor="none"
                                                activeUnderline={true}
                                                component="a"
                                                childComponent={
                                                    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="12px">
                                                        <AttachFile fontSize="small"/>
                                                        <Box width="10px"/>
                                                        <Typography variant="body1" align="left">{document.name}</Typography>
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

                            {/** Training (videos) */}
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" align="left">Training</Typography>
                                <Box height="30px"/>
                                <Box display="flex" flexDirection="column">
                                    {
                                        keltieVideos.map((video: any, index: number) =>
                                            <Box key={index} marginBottom="20px">
                                                <Row style={{ width: "100%" }}>
                                                    <Col xs={12} sm={12} md={4} lg={3}>
                                                        <ReactPlayer url={video.url} height="auto" width="100%" playing={false} controls={true}/>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={8} lg={9}>
                                                        <Typography variant="subtitle1" align="left"><b>{video.name}</b></Typography>
                                                    </Col>
                                                </Row>
                                            </Box>
                                        )
                                    }
                                </Box>
                            </Box>

                            {/** Divider */}
                            <Box marginY="30px">
                                <Divider/>
                            </Box>

                            {/** About us */}
                            <Box display="flex" flexDirection="column" >
                                <Typography variant="h6" align="left">About us</Typography>
                                <Box height="15px" />
                                <Typography variant="body1" align="justify" >
                                    Keltie is an intellectual property firm with a unique personality. A firm that’s
                                    renowned for its excellence, earned by putting talented, energetic and principled
                                    people at its heart.
                                    <br/><br/>
                                    Based in Europe but with global reach, we specialise in IP law and management. Our
                                    clients benefit from an extraordinarily experienced and multi-faceted group of IP
                                    experts. Our team includes patent, trade mark and design attorneys who work on every
                                    technology and in all commercial fields.
                                    <br/><br/>
                                    Sullivan Fountain and Richard Lawrence at the Keltie Cotswolds office serve the
                                    South West region and would be delighted to discuss your IP challenges further.
                                </Typography>
                                <Box height="40px" />
                                <Box display="flex" flexDirection="row" justifyContent="center" >
                                    <CustomLink
                                        url="https://www.keltie.com"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={keltieLogo}
                                                alt="Keltie logo"
                                                width={MediaQueryState.isMobile ? 100 : 145}
                                                height={MediaQueryState.isMobile ? 100 : 145}
                                                style={{ objectFit: "cover" }}
                                            />
                                        }
                                    />
                                    <Box width="25px" />
                                    <CustomLink
                                        url="https://www.keltie.com/staff/sullivan-fountain.html"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={sullivanFountainImg}
                                                alt="Sullivan Fountain"
                                                width={MediaQueryState.isMobile ? 100 : 145}
                                                height={MediaQueryState.isMobile ? 100 : 145}
                                                style={{ objectFit: "cover" }}
                                            />
                                        }
                                    />
                                    <Box width="25px" />
                                    <CustomLink
                                        url="https://www.keltie.com/staff/richard-lawrence.html"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image src={richardLawrenceImg} alt="Richard Lawrence" width={MediaQueryState.isMobile ? 100 : 145} height={MediaQueryState.isMobile ? 100 : 145} style={{ objectFit: "cover" }} />
                                        }
                                    />
                                </Box>
                                <Box height="60px" />
                                <Box display="flex" justifyContent="center" alignItems="center" >
                                    <Box bgcolor="#52155A" color="white" clone >
                                        <Button variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => toggleContactResourceDialog()} > Contact us </Button>
                                    </Box>
                                </Box>
                                <Box height="20px" />
                            </Box>
                        </Box>
                    </Paper>
                </Col>
            </Row>

            <ContactResourceDialog
                resourceName="Keltie LLP"
                resourceEmail={
                    isProductionEnvironment()
                        ? ["sullivan.fountain@keltie.com"]
                        : isDevelopmentEnvironment()
                        ? "dangkhoa.dk19@gmail.com"
                        : "help@investwest.online"
                }
            />

            <FeedbackSnackbarNew/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Keltie);