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
import {validateGroupUrl, resetGroupUrlState} from "../../redux-store/actions/manageGroupUrlActions";
import {getGroupLogo} from "../../models/group_properties";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import Admin, {isAdmin} from "../../models/admin";
import {dateInReadableFormat} from "../../utils/utils";
import GroupOfMembership, {getHomeGroup} from "../../models/group_of_membership";
import {CheckCircle, Edit as EditIcon} from "@material-ui/icons";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import * as appColors from "../../values/colors";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import Footer from "../../shared-components/footer/Footer";
import {openFeedbackSnackbar} from "../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import EditGroupDetailsDialog from "../admin/components/EditGroupDetailsDialog";

interface GroupDetailsProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    GroupDetailsLocalState: GroupDetailsState;
    loadData: (viewedGroupUserName: string) => any;
    sendAccessRequest: () => any;
    removeAccessRequest: () => any;
    openFeedbackSnackbar: (type: FeedbackSnackbarTypes, message: string) => any;
    validateGroupUrl: (path: string, groupUserName: string | null, courseUserName?: string | null) => any;
    resetGroupUrlState: () => any;
}

interface GroupDetailsLocalComponentState {
    editDialogOpen: boolean;
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
        removeAccessRequest: () => dispatch(removeAccessRequest()),
        openFeedbackSnackbar: (type: FeedbackSnackbarTypes, message: string) => dispatch(openFeedbackSnackbar(type, message)),
        validateGroupUrl: (path: string, groupUserName: string | null, courseUserName?: string | null) => dispatch(validateGroupUrl(path, groupUserName, courseUserName)),
        resetGroupUrlState: () => dispatch(resetGroupUrlState())
    }
}

class GroupDetails extends Component<GroupDetailsProps & Readonly<RouteComponentProps<RouteParams>>, GroupDetailsLocalComponentState> {

    constructor(props: GroupDetailsProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.state = {
            editDialogOpen: false
        };
    }

    componentDidMount() {
        const viewedGroupUserName = this.props.match.params.viewedGroupUserName;
        if (viewedGroupUserName) {
            this.props.loadData(viewedGroupUserName);
        }
    }

    handleOpenEditDialog = () => {
        this.setState({ editDialogOpen: true });
    }

    handleCloseEditDialog = () => {
        this.setState({ editDialogOpen: false });
    }

    handleEditSuccess = () => {
        const { openFeedbackSnackbar, validateGroupUrl, resetGroupUrlState } = this.props;
        openFeedbackSnackbar(FeedbackSnackbarTypes.Success, 'Details updated successfully!');

        // Reload data to reflect changes
        const viewedGroupUserName = this.props.match.params.viewedGroupUserName;
        const viewedCourseUserName = this.props.match.params.viewedCourseUserName;

        if (viewedGroupUserName) {
            this.props.loadData(viewedGroupUserName);
            resetGroupUrlState();
            setTimeout(() => {
                validateGroupUrl(this.props.location.pathname, viewedGroupUserName, viewedCourseUserName);
            }, 100);
        }

        this.setState({ editDialogOpen: false });
    }

    // Check if the current group is a course (has a parent group)
    isCourse = () => {
        const { GroupDetailsLocalState } = this.props;
        return GroupDetailsLocalState.group?.parentGroupId != null ||
               GroupDetailsLocalState.group?.groupType === 'course';
    }

    // Get the parent group's username for API calls
    getParentGroupUserName = () => {
        const { ManageGroupUrlState } = this.props;
        // If we're viewing a course, groupNameFromUrl is the parent university
        return ManageGroupUrlState.groupNameFromUrl || '';
    }

    // Check if the current admin can edit this group/course
    canEdit = (currentAdmin: Admin | null) => {
        const { GroupDetailsLocalState } = this.props;

        if (!currentAdmin) return false;

        // Super admins can always edit
        if (currentAdmin.superAdmin || currentAdmin.superGroupAdmin) {
            return true;
        }

        // For courses, course admins can edit their own courses
        if (this.isCourse() && currentAdmin.courseIds && GroupDetailsLocalState.group?.anid) {
            return currentAdmin.courseIds.includes(GroupDetailsLocalState.group.anid);
        }

        return false;
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

        const canEditGroup = this.canEdit(currentAdmin);

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
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                            <Link href={GroupDetailsLocalState.group?.website ?? ""} target="_blank">
                                                <Image alt={`${GroupDetailsLocalState.group?.displayName} logo`} src={getGroupLogo(GroupDetailsLocalState.group ?? null) ?? undefined} style={{width: "100%", height: "auto", padding: 20, objectFit: "scale-down"}}/>
                                            </Link>
                                            {/* Single Edit button for admins */}
                                            {canEditGroup && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={this.handleOpenEditDialog}
                                                    className={css(sharedStyles.no_text_transform)}
                                                    style={{ marginTop: 10 }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
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
                                                <Typography variant="h4" align="left">{GroupDetailsLocalState.members?.length ?? 0}</Typography>
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
                                                    <Typography variant="h4" align="left">{GroupDetailsLocalState.offers?.length ?? 0}</Typography>

                                                    <Box height="2px"/>

                                                    <Typography variant="body1" align="left">Student projects</Typography>
                                                </Box>
                                            </Box>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <Box padding="18px" borderTop={`1px solid ${colors.grey["300"]}`}>
                                                <Typography variant="h4" align="left">{GroupDetailsLocalState.admins?.length ?? 0}</Typography>
                                                    <Box height="2px"/>
                                                <Typography variant="body1" align="left">Lecturers / Admins</Typography>
                                            </Box>
                                        </Col>

                                        {(GroupDetailsLocalState.group?.subGroups && GroupDetailsLocalState.group.subGroups.length > 0) ||
                                         (GroupDetailsLocalState.group?.childGroups && GroupDetailsLocalState.group.childGroups.length > 0) ? (
                                            <Col xs={12} sm={12} md={6} lg={6}>
                                                <Box display="flex" flexDirection="row">
                                                    <Box>
                                                        <Divider orientation="vertical"/>
                                                    </Box>

                                                    <Box padding="18px" borderTop={`1px solid ${colors.grey["300"]}`}>
                                                        <Typography variant="h4" align="left">
                                                            {GroupDetailsLocalState.group?.childGroups?.length ?? GroupDetailsLocalState.group?.subGroups?.length ?? 0}
                                                        </Typography>

                                                        <Box height="2px"/>

                                                        <Typography variant="body1" align="left">Courses</Typography>
                                                    </Box>
                                                </Box>
                                            </Col>
                                        ) : null}
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

            {/** Consolidated Edit Dialog */}
            {GroupDetailsLocalState.group && (
                <EditGroupDetailsDialog
                    open={this.state.editDialogOpen}
                    isCourse={this.isCourse()}
                    groupUserName={this.isCourse() ? this.getParentGroupUserName() : GroupDetailsLocalState.group.groupUserName}
                    courseUserName={this.isCourse() ? GroupDetailsLocalState.group.groupUserName : undefined}
                    groupAnid={GroupDetailsLocalState.group.anid}
                    currentName={GroupDetailsLocalState.group.displayName}
                    currentLogoUrl={getGroupLogo(GroupDetailsLocalState.group) || undefined}
                    currentDescription={GroupDetailsLocalState.group.description}
                    currentWebsite={GroupDetailsLocalState.group.website}
                    onClose={this.handleCloseEditDialog}
                    onSuccess={this.handleEditSuccess}
                />
            )}
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);
