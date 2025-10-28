import React, {Component} from 'react';
import {
    Button,
    Collapse,
    Divider,
    IconButton,
    InputAdornment,
    InputBase,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
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
import {HashLoader} from 'react-spinners';

import {css} from 'aphrodite';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import * as colors from '../../../values/colors';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as myUtils from '../../../utils/utils';

import {connect} from 'react-redux';
import * as addAngelNetworkDialogActions from '../../../redux-store/actions/addAngelNetworkDialogActions';
import * as courseRequestDialogActions from '../../../redux-store/actions/courseRequestDialogActions';
import * as angelNetworksActions from '../../../redux-store/actions/angelNetworksActions';
import {NavLink} from "react-router-dom";
import Routes from "../../../router/routes";
import {isUniversity} from "../../../models/group_properties";
import AddCourseRequestDialog from "./AddCourseRequestDialog";

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
        systemGroups: state.manageSystemGroups?.systemGroups || []
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
        stopListeningForAngelNetworksChanged: () => dispatch(angelNetworksActions.stopListeningForAngelNetworksChanged())
    }
};

class AngelNetworks extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expandedUniversities: {}, // Track which universities are expanded: {universityId: boolean}
            courseRequests: [], // Store all course requests
            loadingCourseRequests: false,
            approvingRequest: null, // Track which request is being approved
            rejectingRequest: null // Track which request is being rejected
        };
    }

    toggleUniversityExpansion = (universityId) => {
        this.setState(prevState => ({
            expandedUniversities: {
                ...prevState.expandedUniversities,
                [universityId]: !prevState.expandedUniversities[universityId]
            }
        }));
    };

    /**
     * Load course requests
     */
    loadCourseRequests = async () => {
        const {admin} = this.props;

        // Only load for admins
        if (!admin || admin.type !== DB_CONST.TYPE_ADMIN) {
            return;
        }

        this.setState({loadingCourseRequests: true});

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            const response = await new CourseRequestRepository().fetchCourseRequests({
                status: "pending" // Only fetch pending requests
            });

            this.setState({
                courseRequests: response.data || [],
                loadingCourseRequests: false
            });
        } catch (error) {
            console.error('Error loading course requests:', error);
            this.setState({
                courseRequests: [],
                loadingCourseRequests: false
            });
        }
    };

    /**
     * Approve a course request
     */
    handleApproveCourseRequest = async (requestId) => {
        this.setState({approvingRequest: requestId});

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            await new CourseRequestRepository().approveCourseRequest(requestId);

            // Reload course requests and angel networks to show the new course
            await this.loadCourseRequests();
            this.props.loadAngelNetworks();

            this.setState({approvingRequest: null});
        } catch (error) {
            console.error('Error approving course request:', error);
            alert('Error approving course request: ' + (error.response?.data?.detail || error.message));
            this.setState({approvingRequest: null});
        }
    };

    /**
     * Reject a course request
     */
    handleRejectCourseRequest = async (requestId, courseName) => {
        const reason = prompt(`Please provide a reason for rejecting "${courseName}":`);

        if (!reason || reason.trim().length === 0) {
            return; // User cancelled or didn't provide a reason
        }

        this.setState({rejectingRequest: requestId});

        try {
            const CourseRequestRepository = require('../../../api/repositories/CourseRequestRepository').default;
            await new CourseRequestRepository().rejectCourseRequest(requestId, reason.trim());

            // Reload course requests to remove the rejected one
            await this.loadCourseRequests();

            this.setState({rejectingRequest: null});
        } catch (error) {
            console.error('Error rejecting course request:', error);
            alert('Error rejecting course request: ' + (error.response?.data?.detail || error.message));
            this.setState({rejectingRequest: null});
        }
    };

    componentDidMount() {
        this.loadData({inComponentDidMount: true});
        this.addListener();
        this.loadCourseRequests(); // Load pending course requests
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,

            admin,

            stopListeningForAngelNetworksChanged
        } = this.props;

        // cancel all listeners if user is set to null or user is not an admin with permission
        if (!admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN) || !shouldLoadOtherData) {
            stopListeningForAngelNetworksChanged();
            return;
        }

        this.loadData({inComponentDidMount: false});
        this.addListener();
    }

    componentWillUnmount() {
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
            toggleAddAngelNetworkDialog,
            toggleCourseRequestDialog
        } = this.props;

        // Check if user is super admin or super group admin
        const isSuperUser = admin && (admin.superAdmin || admin.superGroupAdmin);

        // Debug logging
        console.log('%c=== ANGEL NETWORKS BUTTON DEBUG ===', 'background: #222; color: #ff6b6b; font-size: 14px');
        console.log('Admin:', admin);
        console.log('Is Super User (superAdmin OR superGroupAdmin)?', isSuperUser);
        console.log('Will show:', isSuperUser ? 'Add New Group button' : 'Add New Course button');
        console.log('%c===================================', 'background: #222; color: #ff6b6b');

        return (
            <FlexView
                column
                width="100%"
            >
                <Divider style={{marginBottom: 20}}/>
                <Row style={{marginBottom: 10}}>
                    <Col xs={12} md={5} lg={12} style={{marginBottom: 40}}>
                        {admin && isSuperUser ? (
                            // Super admins see "Add New Group" - creates university directly
                            <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleAddAngelNetworkDialog}>
                                <AddIcon style={{marginRight: 10, width: 20, height: "auto"}}/>
                                Add new group
                            </Button>
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
                    </Col>
                </Row>
                {
                    this.renderAngelNetworksTable()
                }

                {/* Course request dialog for group admins */}
                <AddCourseRequestDialog />
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
                                    <InputBase name="searchText" value={searchText}  onChange={handleAngelNetworksTableInputChanged} fullWidth placeholder="Search group by name" type="text"
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
                                    <Typography variant="body2" className={css(sharedStyles.white_text)}  align="left">Groups</Typography>
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
            console.log('%c🔍 SystemGroups Debug:', 'background: #222; color: #ffa500; font-size: 14px');
            console.log('Total systemGroups:', systemGroups.length);
            const universities = systemGroups.filter(g => !g.parentGroupId);
            const courses = systemGroups.filter(g => g.parentGroupId);
            console.log(`Universities: ${universities.length}, Courses: ${courses.length}`);
            if (courses.length > 0) {
                console.log('Courses in systemGroups:');
                console.table(courses.map(c => ({
                    name: c.displayName,
                    anid: c.anid,
                    parentGroupId: c.parentGroupId,
                    groupType: c.groupType || 'N/A'
                })));
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
                        console.log(`%c📚 Found ${courses.length} courses for ${angelNetwork.displayName}:`, 'color: green; font-weight: bold');
                        console.table(courses.map(c => ({
                            name: c.displayName,
                            anid: c.anid,
                            parentGroupId: c.parentGroupId,
                            groupType: c.groupType
                        })));
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
                                                        courses.map(course => (
                                                            <TableRow key={course.anid}>
                                                                <TableCell>
                                                                    <NavLink
                                                                        to={Routes.constructGroupDetailRoute(groupUserName, null, course.groupUserName)}
                                                                        className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                                                    >
                                                                        <Typography color="primary" variant="body2">
                                                                            {course.displayName}
                                                                        </Typography>
                                                                    </NavLink>
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
                                                        ))
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
                                                                        <Typography variant="body2" color="textSecondary">
                                                                            {myUtils.dateTimeInReadableFormat(request.requestedDate)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography variant="body2" style={{color: '#EA580C'}}>
                                                                            Pending
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
                                                                                    color="secondary"
                                                                                    onClick={() => this.handleRejectCourseRequest(request.id, request.courseName)}
                                                                                    disabled={isApproving || isRejecting}
                                                                                    style={{minWidth: 80}}
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

export default connect(mapStateToProps, mapDispatchToProps)(AngelNetworks);