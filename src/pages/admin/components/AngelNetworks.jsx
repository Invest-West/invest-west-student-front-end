import React, {Component} from 'react';
import {
    Button,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {Col, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {HashLoader, BeatLoader} from 'react-spinners';

import {css} from 'aphrodite';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import * as colors from '../../../values/colors';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as myUtils from '../../../utils/utils';

import {connect} from 'react-redux';
import * as addAngelNetworkDialogActions from '../../../redux-store/actions/addAngelNetworkDialogActions';
import * as courseRequestDialogActions from '../../../redux-store/actions/courseRequestDialogActions';
import * as angelNetworksActions from '../../../redux-store/actions/angelNetworksActions';
import * as groupAdminsTableActions from '../../../redux-store/actions/groupAdminsTableActions';
import {NavLink} from "react-router-dom";
import Routes from "../../../router/routes";
import {isUniversity, getUniversities, getCoursesForUniversity} from "../../../models/group_properties";
import AddCourseRequestDialog from "./AddCourseRequestDialog";

// Status constants for add new group admin dialog
export const ADD_NEW_GROUP_ADMIN_STATUS_NONE = 0;
export const ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL = 1;
export const ADD_NEW_GROUP_ADMIN_STATUS_CHECKING = 2;
export const ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED = 3;
export const ADD_NEW_GROUP_ADMIN_STATUS_SUCCESS = 4;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        admin: state.auth.user,

        angelNetworks: state.manageAngelNetworks.angelNetworks,
        loadingAngelNetworks: state.manageAngelNetworks.loadingAngelNetworks,
        angelNetworksLoaded: state.manageAngelNetworks.angelNetworksLoaded,
        page: state.manageAngelNetworks.page,
        rowsPerPage: state.manageAngelNetworks.rowsPerPage,

        searchText: state.manageAngelNetworks.searchText,
        inSearchMode: state.manageAngelNetworks.inSearchMode,
        matchedAngelNetworks: state.manageAngelNetworks.matchedAngelNetworks,

        // Get all groups for course lookup
        systemGroups: state.manageSystemGroups?.systemGroups || [],

        // Add new group admin dialog state
        addNewGroupAdminDialogOpen: state.manageGroupAdminsTable.addNewGroupAdminDialogOpen,
        newGroupAdminEmail: state.manageGroupAdminsTable.newGroupAdminEmail,
        selectedUniversity: state.manageGroupAdminsTable.selectedUniversity,
        selectedCourse: state.manageGroupAdminsTable.selectedCourse,
        availableCourses: state.manageGroupAdminsTable.availableCourses,
        addNewGroupAdminStatus: state.manageGroupAdminsTable.addNewGroupAdminStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleAddAngelNetworkDialog: () => dispatch(addAngelNetworkDialogActions.toggleAddAngelNetworkDialog()),
        toggleCourseRequestDialog: () => dispatch(courseRequestDialogActions.toggleCourseRequestDialog()),
        loadAngelNetworks: () => dispatch(angelNetworksActions.loadAngelNetworks()),
        changePage: (event, newPage) => dispatch(angelNetworksActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(angelNetworksActions.changeRowsPerPage(event)),
        handleAngelNetworksTableInputChanged: (event) => dispatch(angelNetworksActions.handleAngelNetworksTableInputChanged(event)),
        toggleSearchMode: () => dispatch(angelNetworksActions.toggleSearchMode()),
        startListeningForAngelNetworksChanged: () => dispatch(angelNetworksActions.startListeningForAngelNetworksChanged()),
        stopListeningForAngelNetworksChanged: () => dispatch(angelNetworksActions.stopListeningForAngelNetworksChanged()),

        // Add new group admin actions
        toggleAddNewGroupAdminDialog: () => dispatch(groupAdminsTableActions.toggleAddNewGroupAdminDialog()),
        handleInputChanged: (event) => dispatch(groupAdminsTableActions.handleInputChanged(event)),
        handleAddNewGroupAdmin: () => dispatch(groupAdminsTableActions.handleAddNewGroupAdmin())
    }
};

class AngelNetworks extends Component {

    constructor(props) {
        super(props);

        // VERSION MARKER - Confirm new code is loaded

        this.state = {
            expandedUniversities: {}, // Track which universities are expanded: {universityId: boolean}
            expandedCourses: {}, // Track which courses are expanded: {courseId: boolean}
            courseMembers: {}, // Store members for each course: {courseId: members[]}
            loadingCourseMembers: {}, // Track loading state for course members: {courseId: boolean}
            courseRequests: [], // Store all course requests
            loadingCourseRequests: false,
            approvingRequest: null, // Track which request is being approved
            rejectingRequest: null, // Track which request is being rejected
            hasLoadedCourseMembers: false // Track if we've already loaded all course members
        };
        this._isMounted = false; // ⚡ Track mount state to prevent memory leaks
        this._loadCourseMembersTimeout = null; // ⚡ Track timeout to cancel on unmount
    }

    toggleUniversityExpansion = (universityId) => {
        if (!this._isMounted) return;

        this.setState(prevState => ({
            expandedUniversities: {
                ...prevState.expandedUniversities,
                [universityId]: !prevState.expandedUniversities[universityId]
            }
        }));
    };

    toggleCourseExpansion = async (courseId, courseGroupUserName) => {
        if (!this._isMounted) return;

        const isCurrentlyExpanded = this.state.expandedCourses[courseId];

        // Toggle expansion
        if (this._isMounted) {
            this.setState(prevState => ({
                expandedCourses: {
                    ...prevState.expandedCourses,
                    [courseId]: !isCurrentlyExpanded
                }
            }));
        }

        // If we're expanding and haven't loaded members yet, fetch them
        if (!isCurrentlyExpanded && !this.state.courseMembers[courseId]) {
            await this.loadCourseMembers(courseId, courseGroupUserName);
        }
    };

    /**
     * Load members for a specific course
     */
    loadCourseMembers = async (courseId, courseGroupUserName) => {
        if (!this._isMounted) return; // ⚡ FIX: Don't start if unmounted

        // Special marker for debugging
        if (courseId === '-Ocef1L3VwMSRKDgT5n5') {
        }

        if (this._isMounted) {
            this.setState(prevState => ({
                loadingCourseMembers: {
                    ...prevState.loadingCourseMembers,
                    [courseId]: true
                }
            }));
        }

        try {
            const realtimeDBUtils = require('../../../firebase/realtimeDBUtils');
            const { systemGroups } = this.props;

            // Find the course to get its parent university
            const course = systemGroups?.find(g => g.anid === courseId);

            // SCENARIO 1: Load admins where anid = courseId (course-level admins)
            const courseAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(courseId);
            // SCENARIO 2: Load ALL admins and filter for those with courseIds containing this courseId
            const firebase = require('../../../firebase/firebaseApp').default;
            const DB_CONST = require('../../../firebase/databaseConsts');

            const snapshot = await firebase
                .database()
                .ref(DB_CONST.ADMINISTRATORS_CHILD)
                .once('value');

            let adminsWithCourseId = [];
            if (snapshot.exists()) {
                const adminsObject = snapshot.val();
                const allAdmins = Object.keys(adminsObject).map(key => adminsObject[key]);
                adminsWithCourseId = allAdmins.filter(admin =>
                    admin.courseIds && Array.isArray(admin.courseIds) && admin.courseIds.includes(courseId)
                );
            }

            if (!this._isMounted) return; // ⚡ FIX: Stop if unmounted during async call

            // Combine course-specific admins and remove duplicates by email
            // NOTE: We do NOT include university-level admins here - only admins specifically assigned to this course
            const allCourseAdmins = [...(courseAdmins || []), ...adminsWithCourseId];
            const uniqueAdmins = allCourseAdmins.reduce((acc, admin) => {
                if (!acc.find(a => a.email === admin.email)) {
                    acc.push(admin);
                }
                return acc;
            }, []);


            const adminsArray = uniqueAdmins || [];

            // Debug: Check the structure of the first admin object
            if (adminsArray.length > 0) {
            }

            // Fetch user details for admins who are missing firstName/lastName
            // (happens when users are upgraded to admin without preserving these fields)
            const adminsWithDetails = await Promise.all(adminsArray.map(async (admin) => {
                // If firstName and lastName exist, use them
                if (admin.firstName && admin.lastName) {
                    return admin;
                }

                // Otherwise, fetch from Users node
                try {
                    const userProfile = await realtimeDBUtils.loadUserBasedOnID(admin.id);
                    if (userProfile) {
                        return {
                            ...admin,
                            firstName: userProfile.firstName || undefined,
                            lastName: userProfile.lastName || undefined,
                            title: userProfile.title || admin.title || 'Lecturer'
                        };
                    }
                } catch (error) {
                }

                // No fallback - leave as undefined to indicate missing data
                return {
                    ...admin,
                    firstName: undefined,
                    lastName: undefined,
                    title: admin.title || 'Lecturer'
                };
            }));

            if (this._isMounted) { // ⚡ FIX: Only update state if still mounted
                this.setState(prevState => {
                    return {
                        courseMembers: {
                            ...prevState.courseMembers,
                            [courseId]: adminsWithDetails
                        },
                        loadingCourseMembers: {
                            ...prevState.loadingCourseMembers,
                            [courseId]: false
                        }
                    };
                });
            }
        } catch (error) {
            if (this._isMounted) { // ⚡ FIX: Only update state if still mounted
                this.setState(prevState => ({
                    courseMembers: {
                        ...prevState.courseMembers,
                        [courseId]: []
                    },
                    loadingCourseMembers: {
                        ...prevState.loadingCourseMembers,
                        [courseId]: false
                    }
                }));
            }
        }
    };

    /**
     * Load all course members proactively
     */
    loadAllCourseMembers = async () => {
        // ⚡ FIX: Check if component is still mounted before doing anything
        if (!this._isMounted) {
            return;
        }

        const {angelNetworks, systemGroups} = this.props;

        // Prevent loading multiple times
        if (this.state.hasLoadedCourseMembers) {
            return;
        }

        // Mark as loaded immediately to prevent multiple calls
        if (this._isMounted) {
            this.setState({hasLoadedCourseMembers: true});
        }

        if (!systemGroups || systemGroups.length === 0) {
            return;
        }

        // Courses are stored separately with parentGroupId linking to university
        const allCourses = systemGroups.filter(g => g.parentGroupId);

        if (allCourses.length === 0) {
            return;
        }

        // Load members for all courses in parallel
        const promises = allCourses.map(course => {
            return this.loadCourseMembers(course.anid, course.groupUserName);
        });

        await Promise.all(promises);
    };

    /**
     * Load course requests
     */
    loadCourseRequests = async () => {
        // ⚡ FIX: Check if component is still mounted
        if (!this._isMounted) {
            return;
        }

        const {admin} = this.props;

        // Only load for admins
        if (!admin || admin.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        if (this._isMounted) {
            this.setState({loadingCourseRequests: true});
        }

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            const response = await new CourseRequestRepository().fetchCourseRequests({
                status: "pending" // Only fetch pending requests
            });

            if (this._isMounted) {
                this.setState({
                    courseRequests: response.data || [],
                    loadingCourseRequests: false
                });
            }
        } catch (error) {
            if (this._isMounted) {
                this.setState({
                    courseRequests: [],
                    loadingCourseRequests: false
                });
            }
        }
    };

    /**
     * Approve a course request
     */
    handleApproveCourseRequest = async (requestId) => {
        if (!this._isMounted) return;

        if (this._isMounted) {
            this.setState({approvingRequest: requestId});
        }

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            await new CourseRequestRepository().approveCourseRequest(requestId);

            // Reload course requests and angel networks to show the new course
            await this.loadCourseRequests();
            this.props.loadAngelNetworks();

            if (this._isMounted) {
                this.setState({approvingRequest: null});
            }
        } catch (error) {
            alert('Error approving course request: ' + (error.response?.data?.detail || error.message));
            if (this._isMounted) {
                this.setState({approvingRequest: null});
            }
        }
    };

    /**
     * Reject a course request
     */
    handleRejectCourseRequest = async (requestId, courseName) => {
        if (!this._isMounted) return;

        const reason = prompt(`Please provide a reason for rejecting "${courseName}":`);

        if (!reason || reason.trim().length === 0) {
            return; // User cancelled or didn't provide a reason
        }

        if (this._isMounted) {
            this.setState({rejectingRequest: requestId});
        }

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            await new CourseRequestRepository().rejectCourseRequest(requestId, reason.trim());

            // Reload course requests to remove the rejected one
            await this.loadCourseRequests();

            if (this._isMounted) {
                this.setState({rejectingRequest: null});
            }
        } catch (error) {
            alert('Error rejecting course request: ' + (error.response?.data?.detail || error.message));
            if (this._isMounted) {
                this.setState({rejectingRequest: null});
            }
        }
    };

    componentDidMount() {
        this._isMounted = true; // ⚡ Component is now mounted

        this.loadData({inComponentDidMount: true});
        this.addListener();
        this.loadCourseRequests(); // Load pending course requests

        const {angelNetworks, angelNetworksLoaded, systemGroups} = this.props;

        // Try to load course members if system groups are available
        if (systemGroups && systemGroups.length > 0) {
            // Add a small delay to ensure everything is ready
            this._loadCourseMembersTimeout = setTimeout(() => {
                if (this._isMounted) {
                    this.loadAllCourseMembers();
                }
            }, 500);
        } else {
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,

            admin,
            angelNetworks,
            angelNetworksLoaded,

            stopListeningForAngelNetworksChanged
        } = this.props;

        // cancel all listeners if user is set to null or user is not an admin with permission
        if (!admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN) || !shouldLoadOtherData) {
            stopListeningForAngelNetworksChanged();
            return;
        }

        this.loadData({inComponentDidMount: false});
        this.addListener();

        // Load all course members when systemGroups becomes available
        const prevSystemGroups = prevProps.systemGroups;
        const {systemGroups} = this.props;

        if (!this.state.hasLoadedCourseMembers && systemGroups && systemGroups.length > 0 &&
            (!prevSystemGroups || prevSystemGroups.length === 0 || prevSystemGroups !== systemGroups)) {
            this.loadAllCourseMembers();
        }
    }

    componentWillUnmount() {
        this._isMounted = false; // ⚡ Component is unmounting

        // ⚡ Cancel pending timeout to prevent memory leak
        if (this._loadCourseMembersTimeout) {
            clearTimeout(this._loadCourseMembersTimeout);
            this._loadCourseMembersTimeout = null;
        }

        const {
            stopListeningForAngelNetworksChanged
        } = this.props;

        stopListeningForAngelNetworksChanged();
    }

    /**
     * Load data
     */
    loadData = ({inComponentDidMount = true}) => {
        const {
            shouldLoadOtherData,

            admin,

            loadingAngelNetworks,
            angelNetworksLoaded,

            loadAngelNetworks
        } = this.props;

        if (shouldLoadOtherData) {
            if (inComponentDidMount) {
                if (admin && (admin.superAdmin || admin.type === DB_CONST.TYPE_ADMIN)) {
                    loadAngelNetworks();
                }
            } else {
                // loadAngelNetworks() is called in componentDidUpdate which happens after every state changes
                // therefore, in order to avoid unlimited calls of loadAngelNetworks, another check variable called loadingAngelNetworks
                // is added to ensure the function only gets called once.
                if (admin && (admin.superAdmin || admin.type === DB_CONST.TYPE_ADMIN) && !loadingAngelNetworks && !angelNetworksLoaded) {
                    loadAngelNetworks();
                }
            }
        }
    };

    /**
     * Add listener
     */
    addListener = () => {
        const {
            shouldLoadOtherData,

            angelNetworks,
            angelNetworksLoaded,

            startListeningForAngelNetworksChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (angelNetworks && angelNetworksLoaded) {
                startListeningForAngelNetworksChanged();
            }
        }
    };

    render() {
        const {
            admin,
            groupProperties,
            systemGroups,
            toggleAddAngelNetworkDialog,
            toggleCourseRequestDialog,
            toggleAddNewGroupAdminDialog,
            addNewGroupAdminDialogOpen,
            newGroupAdminEmail,
            selectedUniversity,
            selectedCourse,
            availableCourses,
            addNewGroupAdminStatus,
            handleInputChanged,
            handleAddNewGroupAdmin
        } = this.props;

        // Check if user is super admin or super group admin
        const isSuperUser = admin && (admin.superAdmin || admin.superGroupAdmin);

        return (
            <FlexView
                column
                width="100%"
            >
                <Divider style={{marginBottom: 20}}/>
                <Row style={{marginBottom: 10}}>
                    <Col xs={12} md={5} lg={12} style={{marginBottom: 40}}>
                        <FlexView hAlignContent="left" vAlignContent="center">
                            {admin && isSuperUser ? (
                                <>
                                    {/* Super admins see "Add New Group" - creates university directly */}
                                    <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleAddAngelNetworkDialog}>
                                        <AddIcon style={{marginRight: 10, width: 20, height: "auto"}}/>
                                        Add new university
                                    </Button>
                                    {/* Super group admins also see "Add new group admin" button */}
                                    {admin.superGroupAdmin && (
                                        <Button
                                            color="primary"
                                            variant="outlined"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={toggleAddNewGroupAdminDialog}
                                            style={{ marginLeft: 10 }}
                                        >
                                            Add new group admin
                                        </Button>
                                    )}
                                </>
                            ) : admin && !isSuperUser ? (
                                // Regular group admins see "Add New Course" - creates request
                                <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleCourseRequestDialog}>
                                    <AddIcon style={{marginRight: 10, width: 20, height: "auto"}}/>
                                    Add new course
                                </Button>
                            ) : (
                                <Typography color="error" variant="body2">
                                    No admin user found. Please ensure you're logged in as an admin.
                                </Typography>
                            )}
                        </FlexView>
                    </Col>
                </Row>
                {
                    this.renderAngelNetworksTable()
                }

                {/* Course request dialog for group admins */}
                <AddCourseRequestDialog onSuccess={this.loadCourseRequests} />

                {/* Add Group Admin Dialog */}
                <AddGroupAdminDialog
                    groupProperties={groupProperties}
                    systemGroups={systemGroups}
                    addNewGroupAdminDialogOpen={addNewGroupAdminDialogOpen}
                    newGroupAdminEmail={newGroupAdminEmail}
                    selectedUniversity={selectedUniversity}
                    selectedCourse={selectedCourse}
                    availableCourses={availableCourses}
                    addNewGroupAdminStatus={addNewGroupAdminStatus}
                    toggleAddNewGroupAdminDialog={toggleAddNewGroupAdminDialog}
                    handleInputChanged={handleInputChanged}
                    handleAddNewGroupAdmin={handleAddNewGroupAdmin}
                />
            </FlexView>
        );
    }

    /**
     * Render angel networks table
     *
     * @returns {*}
     */
    renderAngelNetworksTable = () => {
        const {
            groupPropertiesLoaded,
            groupProperties,
            admin,
            angelNetworks,
            page,
            rowsPerPage,
            searchText,
            inSearchMode,
            loadAngelNetworks,
            changePage,
            changeRowsPerPage,
            handleAngelNetworksTableInputChanged,
            toggleSearchMode
        } = this.props;

        if (!groupPropertiesLoaded || !admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN)) {
            return null;
        }

        // sort angel networks by added date
        angelNetworks.sort((angelNetwork1, angelNetwork2) => {
            return (angelNetwork2.dateAdded - angelNetwork1.dateAdded);
        });

        return (
            <Paper elevation={1} style={{overflowX: "auto"}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell colSpan={3} cellColor={colors.blue_gray_50}
                                component={
                                    <InputBase name="searchText" value={searchText}  onChange={handleAngelNetworksTableInputChanged} fullWidth placeholder="Search university by name" type="text"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <OverlayTrigger trigger={['hover', 'focus']}  flip placement="bottom"
                                                    overlay={
                                                        <Tooltip id={`tooltip-bottom`}>
                                                            {
                                                                inSearchMode
                                                                    ?
                                                                    "Exit search mode"
                                                                    :
                                                                    "Enter search mode"
                                                            }
                                                        </Tooltip>
                                                    }>
                                                    <IconButton onClick={toggleSearchMode}>
                                                        {
                                                            inSearchMode
                                                                ?
                                                                <CloseIcon/>
                                                                :
                                                                <SearchIcon/>
                                                        }
                                                    </IconButton>
                                                </OverlayTrigger>
                                            </InputAdornment>
                                        }
                                    />
                                }
                            />
                            <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50}
                                component={
                                    <FlexView hAlignContent="right" vAlignContent="center">
                                        <OverlayTrigger trigger={['hover', 'focus']} flip  placement="bottom"
                                            overlay={
                                                <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>
                                            }>
                                            <IconButton onClick={loadAngelNetworks} style={{marginLeft: 10}}>
                                                <RefreshIcon/>
                                            </IconButton>
                                        </OverlayTrigger>
                                    </FlexView>
                                }
                            />
                        </TableRow>
                        <TableRow>
                            <StyledTableCell colSpan={2}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)}  align="left">Universities</Typography>
                                }/>
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">ID</Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">
                                        Date added
                                    </Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">Status</Typography>
                                }
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.renderAngelNetworkRows()}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination style={{backgroundColor: colors.blue_gray_50}} rowsPerPageOptions={[5, 10, 25]} count={angelNetworks.length} rowsPerPage={rowsPerPage}  page={page} backIconButtonProps={{'aria-label': 'Previous Page',}} nextIconButtonProps={{'aria-label': 'Next Page',}} SelectProps={{ native: true,}} onChangePage={changePage} onChangeRowsPerPage={changeRowsPerPage}/>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    };

    /**
     * Render angel network rows
     *
     * @returns {*}
     */
    renderAngelNetworkRows = () => {
        const {
            groupUserName,
            groupProperties,
            angelNetworks,
            angelNetworksLoaded,
            matchedAngelNetworks,
            inSearchMode,
            page,
            rowsPerPage,
            systemGroups
        } = this.props;

        // Debug: Log systemGroups to verify it contains both universities and courses
        if (systemGroups && systemGroups.length > 0) {
            const universities = systemGroups.filter(g => !g.parentGroupId);
            const courses = systemGroups.filter(g => g.parentGroupId);
            if (courses.length > 0) {
            }
        }

        let renderedAngelNetworks = [];

        if (inSearchMode) {
            renderedAngelNetworks = matchedAngelNetworks;
        } else {
            renderedAngelNetworks = angelNetworks;
        }

        if (renderedAngelNetworks.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5}>
                        <FlexView
                         style={{ margin: 40}} hAlignContent="center" vAlignContent="center">
                            {
                                angelNetworksLoaded
                                    ?
                                    <Typography variant="h6" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "Can't find any groups with this name."
                                                :
                                                "No groups added yet."
                                        }
                                    </Typography>
                                    :
                                    <HashLoader
                                        color={
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                        }/>
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            renderedAngelNetworks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(angelNetwork => {
                // Safety checks
                if (!angelNetwork) return null;

                const isUniv = isUniversity(angelNetwork);

                // Get actual course groups from systemGroups (now includes courses from Courses node)
                let courses = [];
                if (isUniv && systemGroups && systemGroups.length > 0) {
                    courses = systemGroups.filter(group =>
                        group.parentGroupId === angelNetwork.anid
                    );

                    // Debug logging
                    if (courses.length > 0) {
                    }
                }

                // Fallback to availableCourses strings if no actual course groups exist yet
                let courseStrings = [];
                if (isUniv && angelNetwork.settings && angelNetwork.settings.availableCourses) {
                    courseStrings = angelNetwork.settings.availableCourses;
                }

                // Get pending requests for this university
                const pendingRequests = this.state.courseRequests.filter(
                    req => req.request.universityId === angelNetwork.anid
                );

                const isExpanded = this.state.expandedUniversities[angelNetwork.anid] || false;

                const hasCoursesOrStrings = (courses.length > 0) || (courseStrings.length > 0) || (pendingRequests.length > 0);

                return (
                    <React.Fragment key={angelNetwork.anid}>
                        <TableRow hover>
                            <TableCell colSpan={2}>
                                <FlexView vAlignContent="center">
                                    {/* Show expand/collapse icon for universities with courses */}
                                    {isUniv && hasCoursesOrStrings && (
                                        <IconButton
                                            size="small"
                                            onClick={() => this.toggleUniversityExpansion(angelNetwork.anid)}
                                            style={{marginRight: 8}}
                                        >
                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    )}
                                    {isUniv && !hasCoursesOrStrings && (
                                        <div style={{width: 40, marginRight: 8}} />
                                    )}
                                    <NavLink to={Routes.constructGroupDetailRoute(groupUserName, null, angelNetwork.groupUserName)} className={css(sharedStyles.nav_link_hover_without_changing_text_color)}>
                                        <Typography color="primary">
                                            {angelNetwork.displayName}
                                            {isUniv && hasCoursesOrStrings && (
                                                <span style={{color: colors.gray_600, fontSize: '0.875rem', marginLeft: 8}}>
                                                    ({(courses.length > 0 ? courses.length : courseStrings.length)} course{(courses.length > 0 ? courses.length : courseStrings.length) !== 1 ? 's' : ''}{pendingRequests.length > 0 ? `, ${pendingRequests.length} pending` : ''})
                                                </span>
                                            )}
                                        </Typography>
                                    </NavLink>
                                </FlexView>
                            </TableCell>
                            <TableCell colSpan={1}>
                                <Typography color="primary">{angelNetwork.anid}</Typography>
                            </TableCell>
                            <TableCell colSpan={1}>
                                <Typography color="primary">{myUtils.dateTimeInReadableFormat(angelNetwork.dateAdded)}</Typography>
                            </TableCell>
                            <TableCell colSpan={1}>
                                <Typography
                                    color={
                                        angelNetwork.status === DB_CONST.GROUP_STATUS_ACTIVE
                                            ?
                                            "primary"
                                            :
                                            "error"
                                    }>
                                    {
                                        angelNetwork.status === DB_CONST.GROUP_STATUS_ACTIVE
                                            ?
                                            "Active"
                                            :
                                            "Suspended"
                                    }
                                </Typography>
                            </TableCell>
                        </TableRow>

                        {/* Expandable row showing courses */}
                        {isUniv && hasCoursesOrStrings && (
                            <TableRow>
                                <TableCell colSpan={5} style={{paddingBottom: 0, paddingTop: 0, backgroundColor: colors.blue_gray_50}}>
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <div style={{padding: '16px 0 16px 48px'}}>
                                            <Typography variant="subtitle2" gutterBottom style={{fontWeight: 'bold', color: colors.primaryColor}}>
                                                Courses in {angelNetwork.displayName}:
                                            </Typography>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{fontWeight: 'bold'}}>Course Name</TableCell>
                                                        <TableCell style={{fontWeight: 'bold'}}>Course ID</TableCell>
                                                        <TableCell style={{fontWeight: 'bold'}}>Date Added</TableCell>
                                                        <TableCell style={{fontWeight: 'bold'}}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {courses.length > 0 ? (
                                                        // Show actual course groups with links
                                                        courses.map(course => {
                                                            const isCourseExpanded = this.state.expandedCourses[course.anid] || false;
                                                            const courseMembers = this.state.courseMembers[course.anid] || [];
                                                            const loadingMembers = this.state.loadingCourseMembers[course.anid] || false;

                                                            // Debug logging
                                                            if (isCourseExpanded) {
                                                            }

                                                            return (
                                                                <React.Fragment key={course.anid}>
                                                                    <TableRow>
                                                                        <TableCell>
                                                                            <FlexView vAlignContent="center">
                                                                                {/* Expand/collapse icon for courses */}
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => this.toggleCourseExpansion(course.anid, course.groupUserName)}
                                                                                    style={{marginRight: 8}}
                                                                                >
                                                                                    {isCourseExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                                                </IconButton>
                                                                                <NavLink
                                                                                    to={Routes.constructGroupDetailRoute(groupUserName, null, course.groupUserName)}
                                                                                    className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                                                                >
                                                                                    <Typography color="primary" variant="body2">
                                                                                        {course.displayName}
                                                                                        {courseMembers.length > 0 && courseMembers.some(m => m.firstName && m.lastName) && (
                                                                                            <span style={{color: colors.gray_600, fontSize: '0.75rem', marginLeft: 8}}>
                                                                                                ({courseMembers
                                                                                                    .filter(member => member.firstName && member.lastName)
                                                                                                    .map(member => `${member.firstName} ${member.lastName}`)
                                                                                                    .join(', ')})
                                                                                            </span>
                                                                                        )}
                                                                                        {loadingMembers && (
                                                                                            <span style={{color: colors.gray_600, fontSize: '0.75rem', marginLeft: 8}}>
                                                                                                (Loading...)
                                                                                            </span>
                                                                                        )}
                                                                                    </Typography>
                                                                                </NavLink>
                                                                            </FlexView>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography variant="body2">{course.anid}</Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography variant="body2">
                                                                                {myUtils.dateTimeInReadableFormat(course.dateAdded)}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography
                                                                                variant="body2"
                                                                                color={
                                                                                    course.status === DB_CONST.GROUP_STATUS_ACTIVE
                                                                                        ? "primary"
                                                                                        : "error"
                                                                                }
                                                                            >
                                                                                {course.status === DB_CONST.GROUP_STATUS_ACTIVE ? "Active" : "Suspended"}
                                                                            </Typography>
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    {/* Nested row showing lecturers/admins for this course */}
                                                                    <TableRow>
                                                                        <TableCell colSpan={4} style={{paddingBottom: 0, paddingTop: 0, backgroundColor: colors.gray_50}}>
                                                                            <Collapse in={isCourseExpanded} timeout="auto" unmountOnExit>
                                                                                <div style={{padding: '12px 0 12px 40px'}}>
                                                                                    <Typography variant="caption" gutterBottom style={{fontWeight: 'bold', color: colors.primaryColor}}>
                                                                                        Lecturers/Admins:
                                                                                    </Typography>
                                                                                    {loadingMembers ? (
                                                                                        <FlexView style={{padding: 20}} hAlignContent="center" vAlignContent="center">
                                                                                            <HashLoader size={30} color={colors.primaryColor} />
                                                                                        </FlexView>
                                                                                    ) : courseMembers.length > 0 ? (
                                                                                        <Table size="small">
                                                                                            <TableHead>
                                                                                                <TableRow>
                                                                                                    <TableCell style={{fontWeight: 'bold', fontSize: '0.75rem'}}>Name</TableCell>
                                                                                                    <TableCell style={{fontWeight: 'bold', fontSize: '0.75rem'}}>Email</TableCell>
                                                                                                    <TableCell style={{fontWeight: 'bold', fontSize: '0.75rem'}}>Title</TableCell>
                                                                                                    <TableCell style={{fontWeight: 'bold', fontSize: '0.75rem'}}>Joined Date</TableCell>
                                                                                                </TableRow>
                                                                                            </TableHead>
                                                                                            <TableBody>
                                                                                                {courseMembers.map((member, idx) => (
                                                                                                    <TableRow key={member.id || idx}>
                                                                                                        <TableCell>
                                                                                                            <Typography variant="caption">
                                                                                                                {member.firstName && member.lastName
                                                                                                                    ? `${member.firstName} ${member.lastName}`
                                                                                                                    : 'N/A'
                                                                                                                }
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                            <Typography variant="caption">
                                                                                                                {member.email || 'N/A'}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                            <Typography variant="caption">
                                                                                                                {member.title || 'Lecturer'}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                            <Typography variant="caption">
                                                                                                                {member.dateAdded ? myUtils.dateTimeInReadableFormat(member.dateAdded) : 'N/A'}
                                                                                                            </Typography>
                                                                                                        </TableCell>
                                                                                                    </TableRow>
                                                                                                ))}
                                                                                            </TableBody>
                                                                                        </Table>
                                                                                    ) : (
                                                                                        <Typography variant="caption" color="textSecondary" style={{fontStyle: 'italic', paddingLeft: 8}}>
                                                                                            No lecturers/admins assigned to this course yet.
                                                                                        </Typography>
                                                                                    )}
                                                                                </div>
                                                                            </Collapse>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    ) : (
                                                        // Fallback: show course strings without links
                                                        courseStrings.map((courseName, index) => (
                                                            <TableRow key={`${angelNetwork.anid}-${courseName}-${index}`}>
                                                                <TableCell>
                                                                    <Typography variant="body2" style={{paddingLeft: 8}}>
                                                                        {courseName}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell colSpan={3}>
                                                                    <Typography variant="body2" color="textSecondary" style={{fontStyle: 'italic'}}>
                                                                        Legacy course (no detail page)
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}

                                                    {/* Pending Course Requests Section */}
                                                    {this.state.courseRequests
                                                        .filter(req => req.request.universityId === angelNetwork.anid)
                                                        .map(courseRequestInstance => {
                                                            const request = courseRequestInstance.request;
                                                            const isApproving = this.state.approvingRequest === request.id;
                                                            const isRejecting = this.state.rejectingRequest === request.id;

                                                            return (
                                                                <TableRow key={request.id} style={{backgroundColor: '#FFF9E6'}}>
                                                                    <TableCell>
                                                                        <FlexView vAlignContent="center">
                                                                            <Typography variant="body2" style={{fontStyle: 'italic', color: '#D97706'}}>
                                                                                {request.courseName} (Pending Approval)
                                                                            </Typography>
                                                                        </FlexView>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" style={{color: '#EA580C'}}>
                                                                            Pending
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2">
                                                                            {myUtils.dateTimeInReadableFormat(request.requestedDate)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {/* Only show approve/reject buttons for super admins */}
                                                                        {(this.props.admin.superAdmin || this.props.admin.superGroupAdmin) && (
                                                                            <FlexView hAlignContent="left">
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={() => this.handleApproveCourseRequest(request.id)}
                                                                                    disabled={isApproving || isRejecting}
                                                                                    style={{marginRight: 8, minWidth: 80}}
                                                                                >
                                                                                    {isApproving ? "Approving..." : "Approve"}
                                                                                </Button>
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    onClick={() => this.handleRejectCourseRequest(request.id, request.courseName)}
                                                                                    disabled={isApproving || isRejecting}
                                                                                    style={{
                                                                                        minWidth: 80,
                                                                                        borderColor: '#DC2626',
                                                                                        color: '#DC2626'
                                                                                    }}
                                                                                >
                                                                                    {isRejecting ? "Rejecting..." : "Reject"}
                                                                                </Button>
                                                                            </FlexView>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                );
            })
        );
    };
}

/**
 * Add Group Admin Dialog Component
 */
class AddGroupAdminDialog extends Component {
    render() {
        const {
            groupProperties,
            systemGroups,
            addNewGroupAdminDialogOpen,
            newGroupAdminEmail,
            selectedUniversity,
            selectedCourse,
            availableCourses,
            addNewGroupAdminStatus,
            toggleAddNewGroupAdminDialog,
            handleInputChanged,
            handleAddNewGroupAdmin
        } = this.props;

        // Get list of universities
        const universities = getUniversities(systemGroups || []);

        return (
            <Dialog open={addNewGroupAdminDialogOpen} fullWidth maxWidth="md" onClose={toggleAddNewGroupAdminDialog}>
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">
                                Add new group admin
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleAddNewGroupAdminDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="Email"
                        name="newGroupAdminEmail"
                        placeholder="Write email here"
                        value={newGroupAdminEmail}
                        onChange={handleInputChanged}
                        fullWidth
                        required
                        style={{ marginTop: 10, marginBottom: 16}}
                    />

                    <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                        <InputLabel>University</InputLabel>
                        <Select
                            name="selectedUniversity"
                            value={selectedUniversity}
                            onChange={handleInputChanged}
                            input={<OutlinedInput label="University" />}
                        >
                            <MenuItem value="">
                                Select a university
                            </MenuItem>
                            {universities.map(university => (
                                <MenuItem key={university.anid} value={university.anid}>
                                    {university.displayName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                        <InputLabel>Course (Optional)</InputLabel>
                        <Select
                            name="selectedCourse"
                            value={selectedCourse}
                            onChange={handleInputChanged}
                            input={<OutlinedInput label="Course (Optional)" />}
                            disabled={!selectedUniversity}
                        >
                            <MenuItem value="">
                                {!selectedUniversity
                                    ? "Select a university first"
                                    : availableCourses.length === 0
                                        ? "No courses available (will use default)"
                                        : "No specific course (default)"
                                }
                            </MenuItem>
                            {availableCourses.map(course => (
                                <MenuItem key={course.anid} value={course.anid}>
                                    {course.displayName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginTop: 8 }}>
                        Note: If no course is selected, the invitation will be sent for the default course.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={20} hAlignContent="right" vAlignContent="center">
                        {
                            this.renderStatusMessage()
                        }
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleAddNewGroupAdmin}
                            size="medium"
                            className={css(sharedStyles.no_text_transform)}
                            style={{marginLeft: 20}}
                        >
                            Add
                            <AddIcon fontSize="small" style={{ marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Render status message
     *
     * @returns {null|*}
     */
    renderStatusMessage = () => {
        const {
            addNewGroupAdminStatus,
            groupProperties
        } = this.props;

        let msg = {
            text: '',
            color: ''
        };

        switch (addNewGroupAdminStatus) {
            case ADD_NEW_GROUP_ADMIN_STATUS_NONE:
                return null;
            case ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL:
                msg.text = "Please fill in the email.";
                msg.color = "error";
                break;
            case ADD_NEW_GROUP_ADMIN_STATUS_CHECKING:
                return (
                    <BeatLoader
                        size={10}
                        color={
                            !groupProperties
                                ?
                                colors.primaryColor
                                :
                                groupProperties.settings.primaryColor
                        }
                    />
                );
            case ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED:
                msg.text = "This email has been used by another account.";
                msg.color = "error";
                break;
            case ADD_NEW_GROUP_ADMIN_STATUS_SUCCESS:
                return null;
            default:
                return null;
        }

        return (
            <Typography color={msg.color} variant="body1" align="left">
                {msg.text}
            </Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AngelNetworks);