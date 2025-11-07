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
            expandedCourses: {}, // Track which courses are expanded: {courseId: boolean}
            courseMembers: {}, // Store members for each course: {courseId: members[]}
            loadingCourseMembers: {}, // Track loading state for course members: {courseId: boolean}
            courseRequests: [], // Store all course requests
            loadingCourseRequests: false,
            approvingRequest: null, // Track which request is being approved
            rejectingRequest: null, // Track which request is being rejected
            hasLoadedCourseMembers: false // Track if we've already loaded all course members
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

    toggleCourseExpansion = async (courseId, courseGroupUserName) => {
        const isCurrentlyExpanded = this.state.expandedCourses[courseId];

        // Toggle expansion
        this.setState(prevState => ({
            expandedCourses: {
                ...prevState.expandedCourses,
                [courseId]: !isCurrentlyExpanded
            }
        }));

        // If we're expanding and haven't loaded members yet, fetch them
        if (!isCurrentlyExpanded && !this.state.courseMembers[courseId]) {
            await this.loadCourseMembers(courseId, courseGroupUserName);
        }
    };

    /**
     * Load members for a specific course
     */
    loadCourseMembers = async (courseId, courseGroupUserName) => {
        console.log(`🔄 loadCourseMembers called for courseId: ${courseId}, courseGroupUserName: ${courseGroupUserName}`);

        this.setState(prevState => ({
            loadingCourseMembers: {
                ...prevState.loadingCourseMembers,
                [courseId]: true
            }
        }));

        try {
            const realtimeDBUtils = require('../../../firebase/realtimeDBUtils');
            console.log(`    🌐 Calling loadGroupAdminsBasedOnGroupID with courseId: ${courseId}`);

            const startTime = Date.now();
            // Use the same method as GroupDetails page - load admins by group ANID
            const groupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(courseId);
            const endTime = Date.now();

            console.log(`    ⏱️ API call completed in ${endTime - startTime}ms`);
            console.log(`    ✅ Response received:`, groupAdmins);
            console.log(`    📊 Fetched ${groupAdmins?.length || 0} total admins for course ${courseId}`);
            console.log(`    📋 Raw response data:`, groupAdmins);

            const adminsArray = groupAdmins || [];

            // Debug: Check the structure of the first admin object
            if (adminsArray.length > 0) {
                console.log(`    🔍 First admin object structure:`, adminsArray[0]);
                console.log(`    🔍 Available properties:`, Object.keys(adminsArray[0]));
            }

            // Fetch user details for admins who are missing firstName/lastName
            // (happens when users are upgraded to admin without preserving these fields)
            const adminsWithDetails = await Promise.all(adminsArray.map(async (admin) => {
                // If firstName and lastName exist, use them
                if (admin.firstName && admin.lastName) {
                    console.log(`    ✅ Admin ${admin.email} already has name: ${admin.firstName} ${admin.lastName}`);
                    return admin;
                }

                // Otherwise, fetch from Users node
                try {
                    console.log(`    🔍 Fetching user details for admin ${admin.email} (${admin.id})`);
                    const userProfile = await realtimeDBUtils.loadUserBasedOnID(admin.id);
                    if (userProfile) {
                        console.log(`    ✅ Found user profile:`, userProfile.firstName, userProfile.lastName);
                        return {
                            ...admin,
                            firstName: userProfile.firstName || undefined,
                            lastName: userProfile.lastName || undefined,
                            title: userProfile.title || admin.title || 'Lecturer'
                        };
                    }
                } catch (error) {
                    console.warn(`    ⚠️ Could not load user profile for ${admin.email}:`, error);
                }

                // No fallback - leave as undefined to indicate missing data
                console.log(`    ⚠️ Admin ${admin.email} has no firstName/lastName in database`);
                return {
                    ...admin,
                    firstName: undefined,
                    lastName: undefined,
                    title: admin.title || 'Lecturer'
                };
            }));

            console.log(`    👨‍🏫 Found ${adminsWithDetails.length} admins/lecturers for course ${courseId}:`,
                adminsWithDetails.map(m => `${m.firstName} ${m.lastName}`).join(', ')
            );

            this.setState(prevState => {
                console.log(`    💾 Storing ${adminsWithDetails.length} members for courseId ${courseId} in state`);
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
        } catch (error) {
            console.error(`❌ Error loading course members for ${courseId}:`, error);
            console.error(`❌ Error details:`, {
                message: error.message
            });
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
    };

    /**
     * Load all course members proactively
     */
    loadAllCourseMembers = async () => {
        const {angelNetworks, systemGroups} = this.props;

        // Prevent loading multiple times
        if (this.state.hasLoadedCourseMembers) {
            console.log('⏭️ Course members already loaded, skipping...');
            return;
        }

        // Mark as loaded immediately to prevent multiple calls
        this.setState({hasLoadedCourseMembers: true});

        if (!systemGroups || systemGroups.length === 0) {
            console.log('⚠️ No systemGroups available to load course members from');
            return;
        }

        console.log('🔍 DEBUG: systemGroups structure:', systemGroups.length, 'total groups');

        // Courses are stored separately with parentGroupId linking to university
        const allCourses = systemGroups.filter(g => g.parentGroupId);

        console.log(`📚 Found ${allCourses.length} courses in systemGroups`);
        allCourses.forEach(course => {
            console.log(`  Course: ${course.displayName} (${course.anid}) - parent: ${course.parentGroupId}`);
        });

        if (allCourses.length === 0) {
            console.log('⚠️ No courses found in systemGroups');
            return;
        }

        console.log(`📚 Loading members for ${allCourses.length} courses...`);

        // Load members for all courses in parallel
        const promises = allCourses.map(course => {
            console.log(`  → Loading members for course: ${course.groupUserName} (${course.anid})`);
            return this.loadCourseMembers(course.anid, course.groupUserName);
        });

        await Promise.all(promises);
        console.log('✅ All course members loaded');
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

        console.log('🎯 componentDidMount - checking if we should load course members');
        const {angelNetworks, angelNetworksLoaded, systemGroups} = this.props;
        console.log('  angelNetworksLoaded:', angelNetworksLoaded);
        console.log('  angelNetworks count:', angelNetworks?.length);
        console.log('  systemGroups count:', systemGroups?.length);

        // Try to load course members if system groups are available
        if (systemGroups && systemGroups.length > 0) {
            console.log('🎓 systemGroups available in componentDidMount, loading course members now...');
            // Add a small delay to ensure everything is ready
            setTimeout(() => {
                this.loadAllCourseMembers();
            }, 500);
        } else {
            console.log('⏳ systemGroups not available yet in componentDidMount, will try in componentDidUpdate');
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

        console.log('🔍 AngelNetworks componentDidUpdate:', {
            prevAngel: prevProps.angelNetworks?.length,
            currentAngel: angelNetworks?.length,
            prevLoaded: prevProps.angelNetworksLoaded,
            currentLoaded: angelNetworksLoaded,
            shouldLoad: !prevProps.angelNetworksLoaded && angelNetworksLoaded && angelNetworks && angelNetworks.length > 0
        });

        // cancel all listeners if user is set to null or user is not an admin with permission
        if (!admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN) || !shouldLoadOtherData) {
            console.log('⚠️ Early return from componentDidUpdate - no admin permission or shouldLoadOtherData');
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
            console.log('🎓 systemGroups just became available in componentDidUpdate, loading course members...');
            this.loadAllCourseMembers();
        }
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
                                Add new university
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
                <AddCourseRequestDialog onSuccess={this.loadCourseRequests} />
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
                                                        courses.map(course => {
                                                            const isCourseExpanded = this.state.expandedCourses[course.anid] || false;
                                                            const courseMembers = this.state.courseMembers[course.anid] || [];
                                                            const loadingMembers = this.state.loadingCourseMembers[course.anid] || false;

                                                            // Debug logging
                                                            if (isCourseExpanded) {
                                                                console.log(`📖 Rendering expanded course ${course.displayName} (${course.anid})`);
                                                                console.log(`   Members in state:`, courseMembers.length, courseMembers.map(m => `${m.profile?.firstName} ${m.profile?.lastName}`));
                                                                console.log(`   All course members in state:`, Object.keys(this.state.courseMembers));
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

export default connect(mapStateToProps, mapDispatchToProps)(AngelNetworks);