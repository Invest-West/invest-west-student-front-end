import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {MediaQueryState} from "../../../../redux-store/reducers/mediaQueryReducer";
import {Box, Button, colors, Divider, Paper, Typography} from "@material-ui/core";
import {Col, Image, Row} from "react-bootstrap";
import CustomLink from "../../../../shared-js-css-styles/CustomLink";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {ResourcesState} from "../../ResourcesReducer";
import {toggleContactResourceDialog} from "../../ResourcesActions";
import ContactResourceDialog from "../../components/ContactResourceDialog";
import FeedbackSnackbarNew from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarNew";
import {isDevelopmentEnvironment, isProductionEnvironment} from "../../../../utils/environmentUtil";
import {AttachFile} from "@material-ui/icons";

interface FounderCatalystProps {
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

interface FounderCatalystResource {
    name: string;
    url: string;
}

const founderCatalystLogo: string = `${process.env.PUBLIC_URL}/resources/founder-catalyst/logo.svg`;
const justynWaterworthImg: string = `${process.env.PUBLIC_URL}/resources/founder-catalyst/justyn-waterworth.jpeg`;
const samSimpsonImg: string = `${process.env.PUBLIC_URL}/resources/founder-catalyst/sam-simpson.jpeg`;
const charlesFrankImg: string = `${process.env.PUBLIC_URL}/resources/founder-catalyst/charles-frank.jpeg`;

const founderCatalystResources: FounderCatalystResource[] = [
    {
        name: "Model Articles of Association",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-articles-of-association.pdf`
    },
    {
        name: "Model Board Minutes",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-board-minutes.pdf`
    },
    {
        name: "Model Subscription & Shareholders’ Agreement",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-subscription-and-shareholder-agreement.pdf`
    },
    {
        name: "Model Founder Service Agreement",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-founder-service-agreement.pdf`
    },
    {
        name: "Model IP Assignment",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-ip-assignment.pdf`
    },
    {
        name: "Model Disclosure Letter",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-disclosure-letter.pdf`
    },
    {
        name: "Model Non-disclosure Agreement",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-non-disclosure-agreement.pdf`
    },
    {
        name: "Model Term Sheet",
        url: `${process.env.PUBLIC_URL}/resources/founder-catalyst/model-term-sheet.pdf`
    }
];

class FounderCatalyst extends Component<FounderCatalystProps, any> {
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
            <Row
                noGutters
            >
                <Col
                    xs={12}
                    sm={12}
                    md={{span: 10, offset: 1}}
                    lg={{span: 8, offset: 2}}
                    xl={{span: 6, offset: 3}}
                >
                    <Paper>
                        <Box
                            padding="20px"
                        >
                            {/** Header */}
                            <Box
                                display="flex"
                                flexDirection="column"
                                width="100%"
                            >
                                <Row
                                    noGutters
                                    style={{
                                        width: "100%"
                                    }}
                                >
                                    <Col
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        lg={4}
                                        xl={3}
                                    >
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            width="100%"
                                            height="100%"
                                            paddingX="25px"
                                        >
                                            <Image
                                                src={founderCatalystLogo}
                                                alt="Founder Catalyst Logo"
                                                width="100%"
                                                height="auto"
                                                style={{
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </Box>
                                    </Col>
                                    <Col
                                        xs={12}
                                        sm={12}
                                        md={7}
                                        lg={8}
                                        xl={9}
                                    >
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            justifyContent="center"
                                            alignItems="start"
                                            height="100%"
                                            paddingX="25px"
                                        >
                                            <Box
                                                marginY="30px"
                                            >
                                                <Typography
                                                    variant="h4"
                                                    align="left"
                                                >
                                                    Founder Catalyst
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body1"
                                                align="left"
                                            >
                                                Legal paperwork for founders raising investment.
                                                <br/><br/>
                                                A collection of resources to help entrepreneurs better understand the
                                                legal requirements when equity fundraising. This content is kindly
                                                provided by our friends at FounderCatalyst.
                                                <br/><br/>
                                                When raising investment for your business, the legal journey can be
                                                slow,
                                                frustrating and expensive. When do you need a lawyer? How do you find a
                                                good one? How can you afford them? This page aims to demystify some of
                                                the process by showing you what documents you and your investors likely
                                                to need as part of your fund-raising process.
                                            </Typography>
                                        </Box>
                                    </Col>
                                </Row>
                            </Box>

                            {/** Divider */}
                            <Box
                                marginY="30px"
                            >
                                <Divider/>
                            </Box>

                            {/** Tips */}
                            <Box
                                display="flex"
                                flexDirection="column"
                            >
                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    8 reasons why founders use FounderCatalyst’s platform
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box>
                                    <ol>
                                        <li>
                                            Save over £3,500. The traditional lawyer approach costs between £5,000 to
                                            £10,000. FounderCatalyst is £1,495 plus VAT, fixed!
                                        </li>
                                        <br/>
                                        <li>
                                            Simplifying the legal process. The FounderCatalyst platform is designed for
                                            founders, to be as simple and intuitive to use as possible. The platform
                                            works by asking you a series of questions in a logical order, with detailed
                                            explanations alongside.
                                        </li>
                                        <br/>
                                        <li>
                                            Up-to-date legal documents. Trusted documents based on the British Venture
                                            Capital Association’s (BVCA) model documents, used by many of the UK’s
                                            leading law firms.
                                        </li>
                                        <br/>
                                        <li>
                                            By using the FounderCatalyst platform, angel investors know you are more
                                            likely to be ‘investment ready’ and due diligence will be easier. A real
                                            differentiator for you in the crowded funding market.
                                        </li>
                                        <br/>
                                        <li>
                                            Time is risk. The conventional legal approach can be slow and frustrating.
                                            By using the FounderCatalyst platform, get your legals completed in as
                                            little as 30 minutes. Updates in minutes rather than days. Deal momentum is
                                            key to your funding success.
                                        </li>
                                        <br/>
                                        <li>
                                            Unsure and still want to use an advisor? No problem. By using both founder
                                            and advisor roles on the platform, your trusted advisor can help as much or
                                            as little as you want – so you still achieve significant time and cost
                                            savings.
                                        </li>
                                        <br/>
                                        <li>
                                            EIS and SEIS advance assurance a must? Proven expertise on hand to help you
                                            achieve this important tax relief for your investors, at no extra charge.
                                        </li>
                                        <br/>
                                        <li>
                                            Invest West has negotiated a further 10% discount for our members. Please
                                            sign up via the button below to receive your discount.
                                            <br/><br/>
                                            <CustomLink
                                                url="http://www.foundercatalyst.com/v/INVESTWEST"
                                                target="_blank"
                                                color="none"
                                                activeColor="none"
                                                activeUnderline={false}
                                                component="a"
                                                childComponent={
                                                    <Box
                                                        bgcolor="#31C2DE"
                                                        color="white"
                                                        clone
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            className={css(sharedStyles.no_text_transform)}
                                                        >
                                                            10% Discount
                                                        </Button>
                                                    </Box>
                                                }
                                            />
                                        </li>
                                    </ol>
                                </Box>

                                <Box
                                    height="50px"
                                />

                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    What documents are you and your investors likely to need?
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box>
                                    <ol>
                                        <li>
                                            <b>Initial Term Sheet:</b> this summarises all the key points of the deal
                                            you are offering to potential investors.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Founder Service Agreement:</b> one for each founder - it is an agreement
                                            between you and the company, very similar to an employment contract.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>IP Assignment Letter:</b> this ensures that all intellectual property
                                            relevant to the company has been transferred by you and other founders to
                                            the company itself.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Subscription and Shareholders' Agreement (SSA):</b> this document details
                                            the agreement between you and your fellow founders, the company, any
                                            existing shareholders and your new investors.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Articles of Association:</b> this document works alongside the SSA and
                                            contains the company's constitution.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Cap Table:</b> one for before investment and one for after. These
                                            provide details of your current and future shareholders.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Resolutions:</b> for both shareholders and directors. These formally
                                            allow the company to take on the new investment you are seeking.
                                        </li>
                                        <br/>
                                        <li>
                                            <b>Disclosure Letter:</b> this enables you to formally disclose any issues
                                            relating to your business to your potential investors.
                                        </li>
                                    </ol>
                                </Box>
                            </Box>

                            {/** Divider */}
                            <Box
                                marginY="30px"
                            >
                                <Divider/>
                            </Box>

                            {/** Resources */}
                            <Box
                                display="flex"
                                flexDirection="column"
                            >
                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    Resources
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                >
                                    {
                                        founderCatalystResources.map((resource: any) => (
                                            <CustomLink
                                                key={resource.name}
                                                url={resource.url}
                                                target="_blank"
                                                color="black"
                                                activeColor="none"
                                                activeUnderline={true}
                                                component="a"
                                                childComponent={
                                                    <Box
                                                        display="flex"
                                                        flexDirection="row"
                                                        alignItems="center"
                                                        marginBottom="12px"
                                                    >
                                                        <AttachFile fontSize="small"/>
                                                        <Box
                                                            width="10px"
                                                        />
                                                        <Typography
                                                            variant="body1"
                                                            align="left"
                                                        >
                                                            {resource.name}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        ))
                                    }
                                </Box>
                            </Box>

                            {/** Divider */}
                            <Box
                                marginY="30px"
                            >
                                <Divider/>
                            </Box>

                            {/** About us */}
                            <Box
                                display="flex"
                                flexDirection="column"
                            >
                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    About us
                                </Typography>
                                <Box
                                    height="15px"
                                />
                                <Typography
                                    variant="body1"
                                    align="justify"
                                >
                                    FounderCatalyst was created by a team of successful entrepreneurs, angel investors
                                    and lawyers to simplify and accelerate the early-stage investment legal journey.
                                    <br/><br/>
                                    FounderCatalyst’s aim is to be the trusted legal platform of choice, simplifying and
                                    managing the funding process, raising everyone’s chances of success.
                                </Typography>
                                <Box
                                    height="40px"
                                />
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    justifyContent="center"
                                >
                                    <CustomLink
                                        url="https://www.linkedin.com/in/justynwaterworth/"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={justynWaterworthImg}
                                                alt="Justyn Waterworth"
                                                width={MediaQueryState.isMobile ? 100 : 145}
                                                height={MediaQueryState.isMobile ? 100 : 145}
                                                style={{
                                                    objectFit: "cover"
                                                }}
                                            />
                                        }
                                    />
                                    <Box
                                        width="25px"
                                    />
                                    <CustomLink
                                        url="https://www.linkedin.com/in/samsimpson1/"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={samSimpsonImg}
                                                alt="Sam Simpson"
                                                width={MediaQueryState.isMobile ? 100 : 145}
                                                height={MediaQueryState.isMobile ? 100 : 145}
                                                style={{
                                                    objectFit: "cover"
                                                }}
                                            />
                                        }
                                    />
                                    <Box
                                        width="25px"
                                    />
                                    <CustomLink
                                        url="https://www.linkedin.com/in/charlesfrankspeechlys/"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={charlesFrankImg}
                                                alt="Charles Frank"
                                                width={MediaQueryState.isMobile ? 100 : 145}
                                                height={MediaQueryState.isMobile ? 100 : 145}
                                                style={{
                                                    objectFit: "cover"
                                                }}
                                            />
                                        }
                                    />
                                </Box>
                                <Box
                                    height="60px"
                                />
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Box
                                        bgcolor="#31C2DE"
                                        color="white"
                                        clone
                                    >
                                        <Button
                                            variant="contained"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={() => toggleContactResourceDialog()}
                                        >
                                            Contact us
                                        </Button>
                                    </Box>
                                </Box>
                                <Box
                                    height="20px"
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Col>
            </Row>

            <ContactResourceDialog
                resourceName="Founder Catalyst"
                resourceEmail={
                    isProductionEnvironment()
                        ? ["justyn@foundercatalyst.com", "sam@foundercatalyst.com"]
                        : isDevelopmentEnvironment()
                        ? "dangkhoa.dk19@gmail.com"
                        : "help@investwest.online"
                }
            />

            <FeedbackSnackbarNew/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FounderCatalyst);