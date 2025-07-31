import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import Keltie from "./pages/keltie/Keltie";
import {Box, Card, Typography} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import ResourceItem from "./ResourceItem";
import FounderCatalyst from "./pages/founder-catalyst/FounderCatalyst";
import GrantFunding from "./pages/grant-funding/GrantFunding";
import MerixStudio from "./pages/merix-studio/merixStudio";


interface ResourcesProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {}
}

export interface Resource {
    name: string;
    logo: string;
    page: React.ReactNode;
}

export const resources: Resource[] = [
    {
        name: "Intellectual Property",
        logo: `${process.env.PUBLIC_URL}/resources/keltie/logo.jpg`,
        page: <Keltie/>
    },
    {
        name: "Fundraising Legals",
        logo: `${process.env.PUBLIC_URL}/resources/founder-catalyst/logo.svg`,
        page: <FounderCatalyst/>
    },
    {
        name: "Grant Funding",
        logo: `${process.env.PUBLIC_URL}/resources/grant-funding/logo.png`,
        page: <GrantFunding/>
    },
    {
        name: "Product Development",
        logo: `${process.env.PUBLIC_URL}/resources/merix-studio/merix-logo.png`,
        page: <MerixStudio/>
    }
];

class Resources extends Component<ResourcesProps & Readonly<RouteComponentProps<RouteParams>>, any> {
    render() {
        const {
            MediaQueryState,
            ManageGroupUrlState
        } = this.props;

        return <Box
            paddingX={MediaQueryState.isMobile ? "20px" : "56px"}
            paddingY={MediaQueryState.isMobile ? "15px" : "40px"}
        >
            <Row noGutters>
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}}>
                    <Card elevation={0}>
                        <Box display="flex" flexDirection="column" alignItems="center" bgcolor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} color="white" paddingY="28px">
                            <Typography variant="h6" align="center">Resources on Student Showcase</Typography>
                        </Box>
                    </Card>
                </Col>
            </Row>

            {/** Loader */}
            {/*{*/}
            {/*    !isFetchingGroups(ExploreGroupsLocalState)*/}
            {/*        ? null*/}
            {/*        : <Row*/}
            {/*            noGutters*/}
            {/*        >*/}
            {/*            <Col*/}
            {/*                xs={12}*/}
            {/*                sm={12}*/}
            {/*                md={12}*/}
            {/*                lg={12}*/}
            {/*            >*/}
            {/*                <Box*/}
            {/*                    display="flex"*/}
            {/*                    marginY="80px"*/}
            {/*                    justifyContent="center"*/}
            {/*                >*/}
            {/*                    <BeatLoader*/}
            {/*                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}*/}
            {/*                    />*/}
            {/*                </Box>*/}
            {/*            </Col>*/}
            {/*        </Row>*/}
            {/*}*/}

            {/** Resources area */}
            <Box marginTop="30px">
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Row>
                            {
                                resources
                                    .map(resource =>
                                        <Col key={resource.name} xs={12} sm={12} md={3}>
                                            <ResourceItem resource={resource}/>
                                        </Col>
                                    )
                            }
                        </Row>
                    </Col>
                </Row>
            </Box>

            {/** Pagination */}
            {/*{*/}
            {/*    // !successfullyFetchedGroups(ExploreGroupsLocalState)*/}
            {/*    //     ? null*/}
            {/*    //     : paginationPages === 1*/}
            {/*    //     ? null*/}
            {/*    //     :*/}
            {/*        <Row*/}
            {/*            noGutters*/}
            {/*        >*/}
            {/*            <Col*/}
            {/*                xs={12}*/}
            {/*                sm={12}*/}
            {/*                md={12}*/}
            {/*                lg={12}*/}
            {/*            >*/}
            {/*                <Box*/}
            {/*                    display="flex"*/}
            {/*                    justifyContent="center"*/}
            {/*                    marginTop="55px"*/}
            {/*                >*/}
            {/*                    <Pagination*/}
            {/*                        count={0}*/}
            {/*                        page={0}*/}
            {/*                        color="primary"*/}
            {/*                        //onChange={}*/}
            {/*                    />*/}
            {/*                </Box>*/}
            {/*            </Col>*/}
            {/*        </Row>*/}
            {/*}*/}
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Resources);