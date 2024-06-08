import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ResourcesState} from "../../ResourcesReducer";
import {MediaQueryState} from "../../../../redux-store/reducers/mediaQueryReducer";
import {toggleContactResourceDialog} from "../../ResourcesActions";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, colors, Divider, Paper, Typography} from "@material-ui/core";
import {Col, Image, Row} from "react-bootstrap";
import CustomLink from "../../../../shared-js-css-styles/CustomLink";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import ContactResourceDialog from "../../components/ContactResourceDialog";
import {isDevelopmentEnvironment, isProductionEnvironment} from "../../../../utils/environmentUtil";
import FeedbackSnackbarNew from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarNew";

interface GrantFundingProps {
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

const grantFundingLogo: string = `${process.env.PUBLIC_URL}/resources/grant-funding/logo.png`;

interface GrantFundingResource {
    name: string;
    url: string;
    img: string;
}

const grantFundingResources: GrantFundingResource[] = [
    {
        name: "Our Services Brochure",
        url: "https://drive.google.com/open?id=1-GiFZT-maCglNUo-7UWJrezpXL64hLz2",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/our-services-brochure.png`
    },
    {
        name: "The Grant Report 2020",
        url: "https://drive.google.com/open?id=1Wz-1dDroReh4s7UspQTQJ-tSafNnv7eg",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/the-grant-report-2020.png`
    },
    {
        name: "Blog - Are You Missing Out on R&D Tax Credits?",
        url: "https://grantedltd.co.uk/about-us/the-funding-blog/",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/blog-are-you-missing-out-on-rd-tax-credits.png`
    },
    {
        name: "Blog - When is the Right Time to Apply for Grant Funding?",
        url: "https://grantedltd.co.uk/about-us/the-funding-blog/",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/blog-when-is-the-right-time-to-apply-for-grant-funding.png`
    },
    {
        name: "Granted Consultancy Introduction",
        url: "https://vimeo.com/317446864",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/granted-consultancy-introduction.png`
    },
    {
        name: "How to Know If Your Project is Eligible for R&D Grant Funding",
        url: "https://vimeo.com/317450389",
        img: `${process.env.PUBLIC_URL}/resources/grant-funding/how-to-know-if-your-project-is-eligible-for-rd-grant-funding.png`
    }
];

class GrantFunding extends Component<GrantFundingProps, any> {
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
                                <Typography
                                    variant="h4"
                                    align="left"
                                >
                                    Grant Funding
                                </Typography>
                            </Box>

                            {/** Divider */}
                            <Box
                                marginY="30px"
                            >
                                <Divider/>
                            </Box>

                            <Box
                                display="flex"
                                flexDirection="column"
                            >
                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    What are the Benefits of Grant Funding?
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box>
                                    <Typography
                                        align="left"
                                        variant="body1"
                                    >
                                        There are two main types of grants:
                                        <ol>
                                            <li>
                                                Capital/Business Growth grants and
                                            </li>
                                            <li>
                                                R&D grants.
                                            </li>
                                        </ol>
                                        Using Business Growth grants enables bigger, more impactful projects to be
                                        realised by covering capital expenditure e.g. buildings or machinery, with
                                        project success often being predicated on job growth.
                                        <br/><br/>
                                        Research and Development (R&D) grants allow a significant reduction in an
                                        innovative product’s time to market, beating the competition and establishing
                                        first-to-market status. This can have a pronounced impact on your business
                                        through the increase of commercial returns and subsequent business growth.
                                        <br/><br/>
                                        Other benefits of grant funding include:
                                        <br/>
                                        <ul>
                                            <li>
                                                No Debt - no costs or need to provide security
                                            </li>
                                            <li>
                                                No Equity giveaway - ensuring you retain control
                                            </li>
                                            <li>
                                                Access to Partners – funding may cover the costs of academic and
                                                commercial experts and attract renowned organisations
                                            </li>
                                            <li>
                                                External Validation – via a competitive process that has been
                                                scrutinised, supporting later access to investors.
                                            </li>
                                        </ul>
                                    </Typography>
                                </Box>

                                <Box
                                    height="50px"
                                />

                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    How do you know you are eligible for an R&D grant?
                                </Typography>
                                <Box
                                    height="10px"
                                />
                                <Box>
                                    <Typography
                                        align="left"
                                        variant="body1"
                                    >
                                        The main focus when applying for R&D grant funding should be on the outputs of a
                                        defined project. There are typically four categories for assessing project
                                        eligibility:
                                        <br/>
                                        <ol>
                                            <li>
                                                <b>Innovation</b> - Is your R&D project novel, disruptive and innovative
                                                with wider economic, social and environmental impacts?
                                            </li>
                                            <li>
                                                <b>Scalable</b> - Does your project have high commercial growth (and
                                                ideally
                                                export) potential?
                                            </li>
                                            <li>
                                                <b>IP Assignment Letter:</b> this ensures that all intellectual property
                                                relevant to the company has been transferred by you and other founders
                                                to
                                                the company itself.
                                            </li>
                                            <li>
                                                <b>Funding</b> - are you seeking £50k-£5m funding for feasibility,
                                                prototyping and/or testing?
                                            </li>
                                            <li>
                                                <b>Business</b> - Have you proven the concept, put a team of (UK/EU)
                                                experts in place and investigated IP protection?
                                            </li>
                                        </ol>
                                    </Typography>
                                </Box>

                                <Box
                                    height="50px"
                                />

                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    What Does the Application Process Typically Look Like?
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box>
                                    <Typography
                                        align="left"
                                        variant="body1"
                                    >
                                        As a guide, it typically takes between 9-12 months from engaging with Granted
                                        Consultancy to first drawdown of grant funds. The process involves taking into
                                        account finding the right funding competition, developing the application,
                                        waiting during the assessment window, progressing through due diligence and then
                                        completing project kick off.
                                    </Typography>
                                </Box>

                                <Box
                                    height="50px"
                                />

                                <Typography
                                    variant="h6"
                                    align="left"
                                >
                                    Why Use a Grant Funding Consultancy?
                                </Typography>
                                <Box
                                    height="20px"
                                />
                                <Box>
                                    <Typography
                                        align="left"
                                        variant="body1"
                                    >
                                        There are many different factors that will improve your chance of grant funding
                                        success; a grant funding consultancy will know where to find suitable funding,
                                        how to access it successfully and how to use it to best effect. Granted let you
                                        focus on your business, saving you time while we write the grant application for
                                        you.
                                        <br/><br/>
                                        A good consultancy will have pertinent sector expertise, the ability to upskill
                                        at a rapid pace in new technologies, and experience of working with companies of
                                        all sizes.
                                    </Typography>
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
                                        grantFundingResources.map((resource: any) => (
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
                                                        <Image
                                                            src={resource.img}
                                                            alt={resource.name}
                                                            style={{
                                                                objectFit: "cover"
                                                            }}
                                                        />
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
                                    Granted Consultancy are an in-house team of funding specialists with a demonstrable
                                    10-year track record of securing non-dilutive funding for innovative companies,
                                    raising over £85m in grant funding and £2.5m in R&D Tax Credits for clients.
                                    <br/><br/>
                                    Our full range of non-dilutive funding services (grant writing, project management,
                                    training and R&D tax credit support) allow our clients to focus on their business.
                                    Our experience covers the full lifespan of business maturities, from start-ups to
                                    multinationals.
                                    <br/><br/>
                                    Granted Consultancy’s expertise spans a variety of cutting-edge technologies with a
                                    focus on four key areas:
                                    <ul>
                                        <li>
                                            AI, Digital and Data
                                        </li>
                                        <li>
                                            Clean-tech and Agri-tech
                                        </li>
                                        <li>
                                            Health, Life Sciences and Education
                                        </li>
                                        <li>
                                            Manufacturing, Mobility and Materials
                                        </li>
                                    </ul>
                                    <br/><br/>
                                    The Granted team thrives on learning about new technologies, innovative business
                                    models and the people behind them – then taking that information and translating it
                                    into a language and format that funders can understand.
                                </Typography>
                                <Box
                                    height="40px"
                                />
                                <Box>
                                    <CustomLink
                                        url="https://grantedltd.co.uk"
                                        target="_blank"
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Image
                                                src={grantFundingLogo}
                                                alt="logo"
                                                width={MediaQueryState.isMobile ? "100%" : 400}
                                                height="100%"
                                                style={{
                                                    objectFit: "contain"
                                                }}
                                            />
                                        }
                                    />
                                </Box>

                                <Box
                                    height="60px"
                                />

                                <Typography
                                    align="left"
                                    variant="body1"
                                >
                                    <b>Get in touch! </b>
                                    <br/>
                                    If you have an R&D project that you would like to explore funding for,
                                </Typography>

                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    marginTop="25px"
                                >
                                    <Box
                                        bgcolor="#8DC341"
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
                resourceName="Grant Funding"
                resourceEmail={
                    isProductionEnvironment()
                        ? ["info@grantedltd.co.uk"]
                        : isDevelopmentEnvironment()
                        ? "dangkhoa.dk19@gmail.com"
                        : "help@investwest.online"
                }
            />

            <FeedbackSnackbarNew/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GrantFunding);