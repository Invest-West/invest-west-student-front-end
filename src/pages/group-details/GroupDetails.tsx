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
import {Box, Button, colors, Divider, Paper, Typography, Link, TextField, IconButton} from "@material-ui/core";
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
import firebase from "../../firebase/firebaseApp";
import * as DB_CONST from "../../firebase/databaseConsts";
import {openFeedbackSnackbar} from "../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import EditGroupImageDialog from "../admin/components/EditGroupImageDialog";
import EditCourseNameDialog from "../admin/components/manage-courses/EditCourseNameDialog";

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
    isEditingDescription: boolean;
    editedDescription: string;
    isSavingDescription: boolean;
    editLogoDialogOpen: boolean;
    editNameDialogOpen: boolean;
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
            isEditingDescription: false,
            editedDescription: '',
            isSavingDescription: false,
            editLogoDialogOpen: false,
            editNameDialogOpen: false
        };
    }

    componentDidMount() {
        const viewedGroupUserName = this.props.match.params.viewedGroupUserName;
        if (viewedGroupUserName) {
            this.props.loadData(viewedGroupUserName);
        }
    }

    handleStartEditingDescription = () => {
        const { GroupDetailsLocalState } = this.props;
        this.setState({
            isEditingDescription: true,
            editedDescription: GroupDetailsLocalState.group?.description || ''
        });
    }

    handleCancelEditingDescription = () => {
        this.setState({
            isEditingDescription: false,
            editedDescription: ''
        });
    }

    handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            editedDescription: event.target.value
        });
    }

    handleSaveDescription = async () => {
        const { GroupDetailsLocalState, openFeedbackSnackbar } = this.props;
        const { editedDescription } = this.state;

        if (!GroupDetailsLocalState.group) {
            return;
        }

        this.setState({ isSavingDescription: true });

        try {
            // Check if this is a course (in Courses node) or a university (in GroupProperties node)
            const coursesSnapshot = await firebase
                .database()
                .ref(DB_CONST.COURSES_CHILD)
                .child(GroupDetailsLocalState.group.anid)
                .once('value');

            if (coursesSnapshot.exists()) {
                // Update in Courses node
                await firebase
                    .database()
                    .ref(DB_CONST.COURSES_CHILD)
                    .child(GroupDetailsLocalState.group.anid)
                    .update({ description: editedDescription });
            } else {
                // Update in GroupProperties node
                await firebase
                    .database()
                    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                    .child(GroupDetailsLocalState.group.anid)
                    .update({ description: editedDescription });
            }

            openFeedbackSnackbar(FeedbackSnackbarTypes.Success, 'Description updated successfully!');

            this.setState({
                isEditingDescription: false,
                isSavingDescription: false,
                editedDescription: ''
            });

            // Reload data to reflect changes
            const viewedGroupUserName = this.props.match.params.viewedGroupUserName;
            if (viewedGroupUserName) {
                this.props.loadData(viewedGroupUserName);
            }
        } catch (error) {
            console.error('Error updating description:', error);
            openFeedbackSnackbar(FeedbackSnackbarTypes.Error, 'Failed to update description');
            this.setState({ isSavingDescription: false });
        }
    }

    handleOpenEditLogoDialog = () => {
        this.setState({ editLogoDialogOpen: true });
    }

    handleCloseEditLogoDialog = () => {
        this.setState({ editLogoDialogOpen: false });
    }

    handleLogoUpdateSuccess = () => {
        const { openFeedbackSnackbar, validateGroupUrl, resetGroupUrlState } = this.props;
        openFeedbackSnackbar(FeedbackSnackbarTypes.Success, 'Logo updated successfully!');

        // Reload data to reflect changes
        const viewedGroupUserName = this.props.match.params.viewedGroupUserName;
        const viewedCourseUserName = this.props.match.params.viewedCourseUserName;

        console.log('[LOGO UPDATE] Starting refresh...', { viewedGroupUserName, viewedCourseUserName });

        if (viewedGroupUserName) {
            // Reload GroupDetailsLocalState
            console.log('[LOGO UPDATE] Calling loadData...');
            this.props.loadData(viewedGroupUserName);

            // Force refresh of ManageGroupUrlState by resetting first, then validating
            console.log('[LOGO UPDATE] Resetting group URL state...');
            resetGroupUrlState();

            // Wait a brief moment for the reset to complete, then validate
            setTimeout(() => {
                console.log('[LOGO UPDATE] Calling validateGroupUrl...');
                validateGroupUrl(this.props.location.pathname, viewedGroupUserName, viewedCourseUserName);
            }, 100);
        }

        this.setState({ editLogoDialogOpen: false });
    }

    handleOpenEditNameDialog = () => {
        this.setState({ editNameDialogOpen: true });
    }

    handleCloseEditNameDialog = () => {
        this.setState({ editNameDialogOpen: false });
    }

    handleNameUpdateSuccess = (newName: string) => {
        const { openFeedbackSnackbar, validateGroupUrl, resetGroupUrlState } = this.props;
        openFeedbackSnackbar(FeedbackSnackbarTypes.Success, 'Course name updated successfully!');

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

        this.setState({ editNameDialogOpen: false });
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
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                            <Link href={GroupDetailsLocalState.group?.website ?? ""} target="_blank">
                                                <Image alt={`${GroupDetailsLocalState.group?.displayName} logo`} src={getGroupLogo(GroupDetailsLocalState.group ?? null) ?? undefined} style={{width: "100%", height: "auto", padding: 20, objectFit: "scale-down"}}/>
                                            </Link>
                                            {currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin) && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={this.handleOpenEditLogoDialog}
                                                    className={css(sharedStyles.no_text_transform)}
                                                    style={{ marginTop: 10 }}
                                                >
                                                    Edit Logo
                                                </Button>
                                            )}
                                        </Box>
                                    </Col>

                                    {/** Name section */}
                                    <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} md={{span: 12, order: 2}} lg={{span: 9, order: 2}}>
                                        <Box display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
                                            <Typography align="center" variant="h4">{GroupDetailsLocalState.group?.displayName}</Typography>

                                            {/* Edit Name button - only for super admins viewing a course */}
                                            {currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin) && this.isCourse() && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={this.handleOpenEditNameDialog}
                                                    className={css(sharedStyles.no_text_transform)}
                                                    style={{ marginTop: 10 }}
                                                >
                                                    Edit Name
                                                </Button>
                                            )}

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
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">About</Typography>
                                    {currentAdmin && !this.state.isEditingDescription && (
                                        <IconButton
                                            size="small"
                                            onClick={this.handleStartEditingDescription}
                                            title="Edit description"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                {this.state.isEditingDescription ? (
                                    <>
                                        <Box marginTop="18px">
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={6}
                                                variant="outlined"
                                                value={this.state.editedDescription}
                                                onChange={this.handleDescriptionChange}
                                                disabled={this.state.isSavingDescription}
                                            />
                                        </Box>
                                        <Box marginTop="18px" display="flex" justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                onClick={this.handleCancelEditingDescription}
                                                disabled={this.state.isSavingDescription}
                                                className={css(sharedStyles.no_text_transform)}
                                                style={{ marginRight: 8 }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={this.handleSaveDescription}
                                                disabled={this.state.isSavingDescription || this.state.editedDescription === GroupDetailsLocalState.group?.description}
                                                className={css(sharedStyles.no_text_transform)}
                                            >
                                                {this.state.isSavingDescription ? 'Saving...' : 'Save'}
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Box marginTop="18px" whiteSpace="pre-line">
                                        <Typography variant="body1" align="left">{GroupDetailsLocalState.group?.description}</Typography>
                                    </Box>
                                )}

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

            {/** Edit Logo Dialog */}
            {GroupDetailsLocalState.group && (
                <EditGroupImageDialog
                    open={this.state.editLogoDialogOpen}
                    groupUserName={GroupDetailsLocalState.group.groupUserName}
                    currentImageUrl={getGroupLogo(GroupDetailsLocalState.group) || undefined}
                    onClose={this.handleCloseEditLogoDialog}
                    onSuccess={this.handleLogoUpdateSuccess}
                />
            )}

            {/** Edit Course Name Dialog */}
            {GroupDetailsLocalState.group && this.isCourse() && (
                <EditCourseNameDialog
                    open={this.state.editNameDialogOpen}
                    groupUserName={this.getParentGroupUserName()}
                    courseUserName={GroupDetailsLocalState.group.groupUserName}
                    currentName={GroupDetailsLocalState.group.displayName}
                    onClose={this.handleCloseEditNameDialog}
                    onSuccess={this.handleNameUpdateSuccess}
                />
            )}
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);