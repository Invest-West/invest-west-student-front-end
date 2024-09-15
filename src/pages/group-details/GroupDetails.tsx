import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    GroupDetailsState,
    hasAccessRequestsBeenSatisfied,
    hasErrorLoadingData,
    isLoadingData, isRemovingAccessRequest, isSendingAccessRequest,
    successfullyLoadedData
} from "./GroupDetailsReducer";
import {Box, Button, colors, Divider, Paper, Typography, Link} from "@material-ui/core";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {Col, Image, Row} from "react-bootstrap";
import {BeatLoader} from "react-spinners";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {loadData, removeAccessRequest, sendAccessRequest} from "./GroupDetailsActions";
import {getGroupLogo} from "../../models/group_properties";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import Admin, {isAdmin} from "../../models/admin";
import {dateInReadableFormat} from "../../utils/utils";
import GroupOfMembership, {getHomeGroup} from "../../models/group_of_membership";
import {CheckCircle} from "@material-ui/icons";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import * as appColors from "../../values/colors";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import Footer from "../../shared-components/footer/Footer";

interface GroupDetailsProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    GroupDetailsLocalState: GroupDetailsState;
    loadData: (viewedGroupUserName: string) => any;
    sendAccessRequest: () => any;
    removeAccessRequest: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        GroupDetailsLocalState: state.GroupDetailsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadData: (viewedGroupUserName: string) => dispatch(loadData(viewedGroupUserName)),
        sendAccessRequest: () => dispatch(sendAccessRequest()),
        removeAccessRequest: () => dispatch(removeAccessRequest())
    }
}

class GroupDetails extends Component<GroupDetailsProps & Readonly<RouteComponentProps<RouteParams>>, any> {

    componentDidMount() {
        const { viewedGroupUserName } = this.props.match.params;
        if (viewedGroupUserName) {
            this.props.loadData(viewedGroupUserName);
        } else {
            console.error("viewedGroupUserName is undefined.");
        }
    }

    render() {
        const {
            MediaQueryState,
            ManageGroupUrlState,
            AuthenticationState,
            GroupDetailsLocalState,
            sendAccessRequest,
            removeAccessRequest
        } = this.props;

        const currentUser = AuthenticationState.currentUser;

        if (!currentUser) {
            return null;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        // loading
        if (isLoadingData(GroupDetailsLocalState)) {
            return <Box display="flex" justifyContent="center" marginTop="50px">
                <BeatLoader
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                />
            </Box>;
        }

        // error
        if (hasErrorLoadingData(GroupDetailsLocalState) || !successfullyLoadedData(GroupDetailsLocalState)) {
            return <Box display="flex" justifyContent="center" alignItems="center" marginTop="50px">
                <Typography variant="h5" color="error" align="center">Error loading page. Please retry.</Typography>
            </Box>;
        }

        let groupMember: GroupOfMembership | undefined = undefined;
        if (!currentAdmin) {
            groupMember = AuthenticationState.groupsOfMembership.find(
                groupOfMembership => groupOfMembership.group.anid === GroupDetailsLocalState.group?.anid);
        }

        let hasRequestedToAccessGroup: boolean = false;
        if (hasAccessRequestsBeenSatisfied(GroupDetailsLocalState)) {
            hasRequestedToAccessGroup = GroupDetailsLocalState.accessRequestsInstances
                ?.findIndex(accessRequestInstance => accessRequestInstance.group.anid === GroupDetailsLocalState.group?.anid) !== -1;
        }

        // successfully loaded
        return <Box paddingY={MediaQueryState.isMobile ? "15px" : "40px"}>
            {/** Header section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box>
                        <Paper>
                            <Box padding="20px">
                                <Row noGutters>
                                    {/** Logo section */}
                                    <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 12, order: 1}} lg={{span: 3, order: 1}}>
                                        <Box display="flex"justifyContent="center" alignItems="center">
                                            <Link href={GroupDetailsLocalState.group?.website ?? ""} target="_blank">
                                                <Image alt={`${GroupDetailsLocalState.group?.displayName} logo`} src={getGroupLogo(GroupDetailsLocalState.group ?? null) ?? undefined} style={{width: "100%", height: "auto", padding: 20, objectFit: "scale-down"}}/>
                                            </Link>
                                        </Box>
                                    </Col>

                                    {/** Name section */}
                                    <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} md={{span: 12, order: 2}} lg={{span: 9, order: 2}}>
                                        <Box display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
                                            <Typography align="center" variant="h4">{GroupDetailsLocalState.group?.displayName}</Typography>

                                            {/** Home/platform member + joined date (available for investor and issuer) */}
                                            {
                                                currentAdmin
                                                    ? null
                                                    : !groupMember
                                                    ? <Box marginTop="25px">
                                                        {
                                                            !hasRequestedToAccessGroup
                                                                ? <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => sendAccessRequest()} disabled={isSendingAccessRequest(GroupDetailsLocalState)}>
                                                                    {
                                                                        isSendingAccessRequest(GroupDetailsLocalState)
                                                                            ? "Sending request ..."
                                                                            : "Join Course"
                                                                    }
                                                                </Button>
                                                                : <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => removeAccessRequest()} disabled={isRemovingAccessRequest(GroupDetailsLocalState)}>
                                                                    {
                                                                        isRemovingAccessRequest(GroupDetailsLocalState)
                                                                            ? "Cancelling ..."
                                                                            : "Cancel request"
                                                                    }
                                                                </Button>
                                                        }
                                                    </Box>
                                                    : <Box marginTop="25px">
                                                        <Box display="flex" flexDirection="row">
                                                            <CheckCircle fontSize="small" color="primary"/>
                                                            <Box width="6px"/>
                                                            <Typography variant="body1" align="center" color="textSecondary">
                                                                {
                                                                    getHomeGroup(AuthenticationState.groupsOfMembership)?.group.anid === groupMember.group.anid
                                                                        ? "Home member"
                                                                        : "Platform member"
                                                                }
                                                            </Typography>
                                                        </Box>


                                                        <Box marginTop="5px">
                                                            <Typography variant="body1" align="center" color="textSecondary">
                                                                Joined
                                                                on: {dateInReadableFormat(groupMember.joinedDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                            }
                                        </Box>
                                    </Col>
                                </Row>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** About section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box marginTop="25px">
                        <Paper>
                            <Box padding="20px">
                                <Typography variant="h6">About</Typography>

                                <Box marginTop="18px" whiteSpace="pre-line">
                                    <Typography variant="body1" align="left">{GroupDetailsLocalState.group?.description}</Typography>
                                </Box>

                                <Box marginTop="18px">
                                    <Typography variant="body1" align="left">For more information, visit us at:&nbsp;
                                        <CustomLink
                                            url={GroupDetailsLocalState.group?.website ?? ""}
                                            target="_blank"
                                            color="none"
                                            activeColor="none"
                                            activeUnderline={true}
                                            component="a"
                                            childComponent={
                                                GroupDetailsLocalState.group?.website ?? "unknown"
                                            }/>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Statistics section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box marginTop="25px">
                        <Paper>
                            <Box padding="20px">
                                <Typography variant="h6">Statistics</Typography>

                                <Box marginTop="20px" border={`1px solid ${colors.grey["300"]}`} bgcolor={appColors.kick_starter_background_color}>
                                    <Row>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <Box padding="18px">
                                                <Typography variant="h4" align="left">{GroupDetailsLocalState.members?.length}</Typography>
                                                    <Box height="2px"/>
                                                <Typography variant="body1" align="left">Students</Typography>
                                            </Box>
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <Box display="flex" flexDirection="row">
                                                <Box>
                                                    <Divider orientation="vertical"/>
                                                </Box>

                                                <Box padding="18px">
                                                    <Typography variant="h4" align="left">{GroupDetailsLocalState.offers?.length}</Typography>

                                                    <Box height="2px"/>

                                                    <Typography variant="body1" align="left">Student projects</Typography>
                                                </Box>
                                            </Box>
                                        </Col>
                                    </Row>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Footer */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Footer/>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);