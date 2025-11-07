import React, {Component} from 'react';
import {
    Button,
    Divider,
    FormControl,
    IconButton,
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
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import {Col, Row} from "react-bootstrap";
import FlexView from "react-flexview";
import {HashLoader} from "react-spinners";
import {NavLink} from "react-router-dom";
import {css} from "aphrodite";
import InfoOverlay from "../../../shared-components/info_overlay/InfoOverlay";
import {connect} from "react-redux";
import * as invitedUsersActions from "../../../redux-store/actions/invitedUsersActions";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as ROUTES from "../../../router/routes";
import * as myUtils from "../../../utils/utils";
import * as colors from "../../../values/colors";
import OfferRepository, {FetchProjectsOrderByOptions} from "../../../api/repositories/OfferRepository";
import firebase from "../../../firebase/firebaseApp";
import UserRepository from "../../../api/repositories/UserRepository";
import UpgradeUserToAdmin from "./UpgradeUserToAdmin";
import InviteMultipleUsers from "./InviteMultipleUsers";

export const FILTER_REGISTRATION_STATUS_ALL = -1;

export const FILTER_GROUP_MEMBERS_ALL = 0;
export const FILTER_HOME_MEMBERS = 1;
export const FILTER_PLATFORM_MEMBERS = 2;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,

        // Add group and course URL parameters for signup URL generation
        groupNameFromUrl: state.ManageGroupUrlState.groupNameFromUrl,
        courseNameFromUrl: state.ManageGroupUrlState.courseNameFromUrl,

        systemGroups: state.manageSystemGroups.systemGroups,
        groupsLoaded: state.manageSystemGroups.groupsLoaded,

        admin: state.auth.user,

        invitedUsers: state.invitedUsers.invitedUsers,
        invitedUsersLoaded: state.invitedUsers.invitedUsersLoaded,
        invitedUsersBeingLoaded: state.invitedUsers.invitedUsersBeingLoaded,

        invitedUsersPage: state.invitedUsers.invitedUsersPage,
        invitedUsersRowsPerPage: state.invitedUsers.invitedUsersRowsPerPage,

        filterRegistrationStatus: state.invitedUsers.filterRegistrationStatus,
        filterUserType: state.invitedUsers.filterUserType,
        filterMembers: state.invitedUsers.filterMembers,
        filterGroup: state.invitedUsers.filterGroup,

        invitedUserSearchText: state.invitedUsers.invitedUserSearchText,
        invitedUsersInSearchMode: state.invitedUsers.invitedUsersInSearchMode,

        requestingCsv: state.invitedUsers.requestingCsv,
        addingMembersFromOneGroupToAnotherGroup: state.invitedUsers.addingMembersFromOneGroupToAnotherGroup,

        matchedInvitedUsers: state.invitedUsers.matchedInvitedUsers
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadInvitedUsers: () => dispatch(invitedUsersActions.loadInvitedUsers()),
        toggleSearchMode: () => dispatch(invitedUsersActions.toggleInvitedUsersSearchMode()),
        handleInputChanged: (event) => dispatch(invitedUsersActions.handleInputChanged(event)),
        handleChangeTablePage: (event, newPage) => dispatch(invitedUsersActions.handleChangeTablePage(event, newPage)),
        handleChangeTableRowsPerPage: (event) => dispatch(invitedUsersActions.handleChangeTableRowsPerPage(event)),
        startListeningForInvitedUsersChanged: () => dispatch(invitedUsersActions.startListeningForInvitedUsersChanged()),
        resendInvite: (invitedUser) => dispatch(invitedUsersActions.resendInvite(invitedUser)),
        exportToCsv: () => dispatch(invitedUsersActions.exportToCsv()),
        addMembersFromOneGroupToAnotherGroup: (fromGroup, toGroup) => dispatch(invitedUsersActions.addMembersFromOneGroupToAnotherGroup(fromGroup, toGroup))
    }
};

class InvitedUsers extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userProjectCounts: {}, // Map of userID -> project count
            loadingProjectCounts: false,
            userLastLoginDates: {}, // Map of userID -> last login date
            loadingLastLoginDates: false,
            // Sorting state
            sortColumn: 'lastLogin', // default to sorting by last logged in
            sortDirection: 'desc' // 'desc' to show most recent logins first
        };
        this.offerRepository = new OfferRepository();
        this.userRepository = new UserRepository();
    }

    componentDidMount() {
        const {
            invitedUsers,
            invitedUsersLoaded,
            invitedUsersBeingLoaded,

            loadInvitedUsers
        } = this.props;

        if (invitedUsers && !invitedUsersBeingLoaded && !invitedUsersLoaded) {
            loadInvitedUsers();
        }

        this.addListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            invitedUsers,
            invitedUsersLoaded,
            invitedUsersBeingLoaded,
            matchedInvitedUsers,

            loadInvitedUsers
        } = this.props;

        if (invitedUsers && !invitedUsersBeingLoaded && !invitedUsersLoaded) {
            loadInvitedUsers();
        }

        this.addListener();
        
        // Load project counts when users are loaded and we haven't loaded them yet
        if (invitedUsersLoaded && !prevProps.invitedUsersLoaded && !this.state.loadingProjectCounts && Object.keys(this.state.userProjectCounts).length === 0) {
            this.loadProjectCounts();
        }
        
        // Load last login dates when users are loaded
        if (invitedUsersLoaded && (!prevProps.invitedUsersLoaded || prevProps.matchedInvitedUsers !== matchedInvitedUsers) && !this.state.loadingLastLoginDates) {
            this.loadLastLoginDates();
        }
    }

    /**
     * Load project counts for all users
     */
    loadProjectCounts = async () => {
        const { invitedUsers, matchedInvitedUsers } = this.props;
        
        if (!invitedUsers || invitedUsers.length === 0) {
            return;
        }

        this.setState({ loadingProjectCounts: true });

        try {
            const projectCounts = {};
            
            // Get unique user IDs from matched users (displayed users)
            const usersToCount = matchedInvitedUsers || invitedUsers;

            // Process each user individually to handle both invited user ID and official user ID
            for (const user of usersToCount) {
                try {
                    // Use officialUserID for registered users, fall back to id for unregistered users
                    const userIdToQuery = user.officialUserID || user.id;
                    
                    
                    const response = await this.offerRepository.fetchOffers({
                        issuer: userIdToQuery,
                        phase: "all", // Include all phases (approved, expired, etc.)
                        orderBy: FetchProjectsOrderByOptions.Issuer
                    });
                    
                    const projectCount = response.data ? response.data.length : 0;
                    
                    // Store the count using the invited user's ID (for display purposes)
                    projectCounts[user.id] = projectCount;
                } catch (error) {
                    projectCounts[user.id] = 0;
                }
            }

            this.setState({ 
                userProjectCounts: projectCounts,
                loadingProjectCounts: false 
            });
        } catch (error) {
            console.error("Error loading project counts:", error);
            this.setState({ loadingProjectCounts: false });
        }
    };

    /**
     * Load last login dates for all users
     */
    loadLastLoginDates = async () => {
        const { invitedUsers, matchedInvitedUsers } = this.props;
        
        if (!invitedUsers || invitedUsers.length === 0) {
            return;
        }

        this.setState({ loadingLastLoginDates: true });

        try {
            const lastLoginDates = {};
            
            // Get users to process
            const usersToProcess = matchedInvitedUsers || invitedUsers;

            // Fetch last login dates for registered users
            for (const user of usersToProcess) {
                try {
                    // Only fetch for users who have registered (have officialUserID)
                    if (user.officialUserID) {
                        
                        const response = await this.userRepository.retrieveUser(user.officialUserID);
                        
                        const userProfile = response.data;
                        
                        if (userProfile && userProfile.lastLoginDate) {
                            lastLoginDates[user.id] = userProfile.lastLoginDate;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to fetch last login date for user ${user.email}:`, error);
                }
            }

            this.setState({ 
                userLastLoginDates: lastLoginDates,
                loadingLastLoginDates: false 
            });
        } catch (error) {
            console.error("Error loading last login dates:", error);
            this.setState({ loadingLastLoginDates: false });
        }
    };

    /**
     * Refresh login dates manually
     */
    refreshLoginDates = () => {
        this.setState({
            userLastLoginDates: {},  // Clear existing data
            loadingLastLoginDates: false
        }, () => {
            this.loadLastLoginDates();
        });
    };

    /**
     * Get course display name for a user
     * Returns the course name if user has courseId, otherwise returns "Home member"
     */
    getCourseDisplayName = (invitedUser) => {
        const { systemGroups } = this.props;

        console.log('[GET COURSE DISPLAY] ==========================================');
        console.log('[GET COURSE DISPLAY] User email:', invitedUser.email);
        console.log('[GET COURSE DISPLAY] User courseId:', invitedUser.courseId);
        console.log('[GET COURSE DISPLAY] User courseName (OLD FIELD - IGNORED):', invitedUser.courseName);
        console.log('[GET COURSE DISPLAY] Has systemGroups:', !!systemGroups);
        console.log('[GET COURSE DISPLAY] SystemGroups length:', systemGroups ? systemGroups.length : 0);

        // NOTE: We IGNORE courseName field - it's from the old manual entry system
        // We only use courseId to look up the real course from the system

        if (systemGroups && systemGroups.length > 0) {
            console.log('[GET COURSE DISPLAY] Available groups:', systemGroups.map(g => ({
                anid: g.anid,
                name: g.displayName || g.groupUserName,
                groupUserName: g.groupUserName
            })));
        }

        // Check if user has a courseId
        if (invitedUser.courseId && systemGroups && systemGroups.length > 0) {
            console.log('[GET COURSE DISPLAY] ✅ User has courseId, searching for match...');

            let course = null;

            // First try: match by anid (for real course IDs)
            course = systemGroups.find(group => group.anid === invitedUser.courseId);
            if (course) {
                console.log('[GET COURSE DISPLAY] ✅ Found course by anid match:', course.displayName || course.groupUserName);
                return course.displayName || course.groupUserName || "Unknown course";
            }

            // Second try: handle virtual course IDs like "virtual-course--M2I40dBdzdI89yDCaAn-student-showcase"
            if (invitedUser.courseId.startsWith('virtual-course-')) {
                console.log('[GET COURSE DISPLAY] 🔍 Detected virtual course ID, parsing...');
                // Extract the course username from the virtual ID
                // Format: "virtual-course-{parentId}-{courseUserName}"
                // Split: ["virtual", "course", "", "M2I40dBdzdI89yDCaAn", "student", "showcase"]
                const parts = invitedUser.courseId.split('-');
                console.log('[GET COURSE DISPLAY] Split parts:', parts);

                if (parts.length >= 5) {
                    // Skip "virtual", "course", empty string (from --), and parentId
                    // Start from index 4 onwards to get the actual course name
                    const courseUserName = parts.slice(4).join('-');
                    console.log('[GET COURSE DISPLAY] Extracted courseUserName:', courseUserName);

                    // Try to find course by groupUserName
                    course = systemGroups.find(group =>
                        group.groupUserName && group.groupUserName.toLowerCase() === courseUserName.toLowerCase()
                    );

                    if (course) {
                        console.log('[GET COURSE DISPLAY] ✅ Found course by groupUserName match:', course.displayName || course.groupUserName);
                        return course.displayName || course.groupUserName || "Unknown course";
                    } else {
                        console.log('[GET COURSE DISPLAY] ❌ No course found with groupUserName:', courseUserName);
                        console.log('[GET COURSE DISPLAY] Available groupUserNames:', systemGroups.map(g => g.groupUserName));
                    }
                }
            }

            console.log('[GET COURSE DISPLAY] ❌ No matching course found for courseId:', invitedUser.courseId);
        } else {
            console.log('[GET COURSE DISPLAY] ❌ No courseId on user or no systemGroups');
        }

        // Fallback: check if user has profile.BusinessProfile.course
        console.log('[GET COURSE DISPLAY] Checking officialUser.BusinessProfile.course...');
        console.log('[GET COURSE DISPLAY] Has officialUser:', !!invitedUser.officialUser);
        if (invitedUser.officialUser) {
            console.log('[GET COURSE DISPLAY] Has BusinessProfile:', !!invitedUser.officialUser.BusinessProfile);
            if (invitedUser.officialUser.BusinessProfile) {
                console.log('[GET COURSE DISPLAY] BusinessProfile.course:', invitedUser.officialUser.BusinessProfile.course);
            }
        }

        if (invitedUser.officialUser &&
            invitedUser.officialUser.BusinessProfile &&
            invitedUser.officialUser.BusinessProfile.course) {
            console.log('[GET COURSE DISPLAY] ✅ Using profile course:', invitedUser.officialUser.BusinessProfile.course);
            return invitedUser.officialUser.BusinessProfile.course;
        }

        // Default fallback
        console.log('[GET COURSE DISPLAY] ❌ Falling back to "Home member"');
        console.log('[GET COURSE DISPLAY] Full invitedUser object:', invitedUser);
        return "Home member";
    };

    /**
     * Test login date update for a specific user (for debugging)
     */
    testUpdateLoginDate = async (userId) => {
        try {            
            // First, retrieve the current user profile
            const retrieveResponse = await this.userRepository.retrieveUser(userId);
            
            // Update with current timestamp
            const currentTimestamp = Date.now();
            const updatedUser = { ...retrieveResponse.data, lastLoginDate: currentTimestamp };
            
            
            const updateResponse = await this.userRepository.updateUser({
                updatedUser: updatedUser
            });
            
            
            // Verify the update by retrieving the user again
            const verifyResponse = await this.userRepository.retrieveUser(userId);
            
            return verifyResponse.data;
        } catch (error) {
            console.error(`TEST UPDATE: Error during test:`, error);
            return null;
        }
    };

    /**
     * Generate and copy signup URL to clipboard
     */
    copySignupUrl = () => {
        const { groupNameFromUrl, courseNameFromUrl } = this.props;

        // Build the signup URL based on current group and course
        let signupUrl = `${window.location.origin}/groups`;

        if (groupNameFromUrl) {
            signupUrl += `/${groupNameFromUrl}`;

            if (courseNameFromUrl) {
                signupUrl += `/${courseNameFromUrl}`;
            }

            signupUrl += '/signup';
        } else {
            // Fallback to default URL structure
            signupUrl += '/invest-west/student-showcase/signup';
        }

        // Copy to clipboard
        navigator.clipboard.writeText(signupUrl).then(() => {
            // You could add a success notification here if needed
            console.log('Signup URL copied to clipboard:', signupUrl);
        }).catch((error) => {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = signupUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    };

    /**
     * Add listener
     */
    addListener = () => {
        const {
            invitedUsers,
            invitedUsersLoaded,

            startListeningForInvitedUsersChanged
        } = this.props;

        if (invitedUsers && invitedUsersLoaded) {
            startListeningForInvitedUsersChanged();
        }
    };

    /**
     * Handle column header click for sorting
     */
    handleSort = (column) => {
        const { sortColumn, sortDirection } = this.state;
        
        let newDirection = 'asc';
        if (sortColumn === column && sortDirection === 'asc') {
            newDirection = 'desc';
        }
        
        this.setState({
            sortColumn: column,
            sortDirection: newDirection
        });
    };

    /**
     * Sort users based on current sort column and direction
     */
    sortUsers = (users) => {
        const { sortColumn, sortDirection } = this.state;
        
        if (!sortColumn) {
            return users;
        }
        
        const sortedUsers = [...users].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortColumn) {
                case 'name':
                    aValue = a.officialUser ? `${a.officialUser.firstName} ${a.officialUser.lastName}`.toLowerCase() : '';
                    bValue = b.officialUser ? `${b.officialUser.firstName} ${b.officialUser.lastName}`.toLowerCase() : '';
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'userType':
                    aValue = a.type === DB_CONST.TYPE_ISSUER ? 'student' : 'project viewer';
                    bValue = b.type === DB_CONST.TYPE_ISSUER ? 'student' : 'project viewer';
                    break;
                case 'projectsCreated':
                    aValue = this.state.userProjectCounts[a.id] || 0;
                    bValue = this.state.userProjectCounts[b.id] || 0;
                    break;
                case 'registrationStatus':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'lastLogin':
                    aValue = this.state.userLastLoginDates[a.id] || 0;
                    bValue = this.state.userLastLoginDates[b.id] || 0;
                    break;
                default:
                    return 0;
            }
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            }
            
            // Handle numeric comparison
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        return sortedUsers;
    };

    /**
     * Render sort icon for table headers
     */
    renderSortIcon = (column) => {
        const { sortColumn, sortDirection } = this.state;
        
        if (sortColumn !== column) {
            return null;
        }
        
        return sortDirection === 'asc' ? 
            <ArrowUpwardIcon fontSize="small" style={{ marginLeft: 4 }} /> : 
            <ArrowDownwardIcon fontSize="small" style={{ marginLeft: 4 }} />;
    };

    render() {
        const {
            admin,

            filterRegistrationStatus,
            filterUserType,
            filterMembers,
            filterGroup,
            invitedUserSearchText,
            invitedUsersInSearchMode,

            systemGroups,
            groupsLoaded,
            requestingCsv,
            addingMembersFromOneGroupToAnotherGroup,

            toggleSearchMode,
            handleInputChanged,
            exportToCsv,
            addMembersFromOneGroupToAnotherGroup
        } = this.props;

        return (
            <FlexView column width="100%">
                <Divider style={{marginBottom: 30}}/>

                {/** Invite/Upgrade users section - different UI for super admins vs regular admins */}
                <Row style={{marginBottom: 30}}>
                    {/** For regular admins: Show Copy URL and Invite Multiple Users */}
                    {
                        !(admin.superAdmin || admin.superGroupAdmin)
                            ?
                            <>
                                <Col xs={12} md={6} lg={6} style={{marginBottom: 20}}>
                                    <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={this.copySignupUrl}>
                                        <FileCopyIcon style={{ marginRight: 10, width: 20, height: "auto"}}/>Copy signup URL</Button>
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={12}>
                                    <InviteMultipleUsers/>
                                </Col>
                            </>
                            :
                            null
                    }
                    {/** For super admins and super group admins: Show Upgrade User to Admin */}
                    {
                        (admin.superAdmin || admin.superGroupAdmin)
                            ?
                            <Col xs={12} sm={12} md={12} lg={12}>
                                <UpgradeUserToAdmin/>
                            </Col>
                            :
                            null
                    }
                </Row>

                {/** Filters */}
                <Row>
                    {/** Registration status */}
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>
                                <Typography variant="body1" color="primary" align="left">Registration status</Typography>
                            </InputLabel>
                            <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterRegistrationStatus"/>
                                }
                                style={{marginTop: 25, width: "100%"}}
                                name="filterRegistrationStatus"
                                value={filterRegistrationStatus}
                                onChange={handleInputChanged}>
                                <MenuItem value={FILTER_REGISTRATION_STATUS_ALL}> All</MenuItem>
                                <MenuItem value={DB_CONST.INVITED_USER_NOT_REGISTERED}>Not registered</MenuItem>
                                <MenuItem value={DB_CONST.INVITED_USER_STATUS_ACTIVE}>Active</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>

                    {/** User type */}
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>
                                <Typography variant="body1" color="primary" align="left">User type</Typography>
                            </InputLabel>
                            <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterUserType"/>
                                }
                                style={{ marginTop: 25, width: "100%"}}
                                name="filterUserType"
                                value={filterUserType}
                                onChange={handleInputChanged}>
                                <MenuItem value={0}>All</MenuItem>
                                <MenuItem value={DB_CONST.TYPE_INVESTOR}>Project viewer</MenuItem>
                                <MenuItem value={DB_CONST.TYPE_ISSUER}>Student</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>

                    {/** Group members */}
                    {
                        !(admin.superAdmin || admin.superGroupAdmin)
                            ?
                            <Col xs={12} sm={12} md={4} lg={3}>
                                <FlexView vAlignContent="center">
                                    <FormControl fullWidth>
                                        <InputLabel>
                                            <Typography variant="body1" color="primary" align="left">Members</Typography>
                                        </InputLabel>
                                        <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterMembers"/>
                                            }
                                            style={{ marginTop: 25, width: "100%"}}
                                            name="filterMembers"
                                            value={filterMembers}
                                            onChange={handleInputChanged}
                                        >
                                            <MenuItem value={FILTER_GROUP_MEMBERS_ALL} key={FILTER_GROUP_MEMBERS_ALL}>All</MenuItem>
                                            <MenuItem value={FILTER_HOME_MEMBERS} key={FILTER_HOME_MEMBERS}>Course students</MenuItem>
                                            <MenuItem value={FILTER_PLATFORM_MEMBERS} key={FILTER_PLATFORM_MEMBERS}>Platform members</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FlexView marginLeft={15}>
                                        <InfoOverlay
                                            placement="right"
                                            message={
                                                "Students are listed with their enrolled course name. Platform members are existing users of Student Showcase who requested access to this university."
                                            }
                                        />
                                    </FlexView>
                                </FlexView>
                            </Col>
                            :
                            <Col xs={12} sm={12} md={4} lg={3}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        <Typography variant="body1" color="primary" align="left">University</Typography>
                                    </InputLabel>
                                    <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterGroup" disabled={!groupsLoaded}/>
                                        }
                                        style={{marginTop: 25, width: "100%"}}
                                        name="filterGroup"
                                        value={filterGroup}
                                        onChange={handleInputChanged}>
                                        <MenuItem value="null" key="null">
                                            {
                                                !groupsLoaded
                                                    ?
                                                    "Loading universities ..."
                                                    :
                                                    "All"
                                            }
                                        </MenuItem>
                                        {
                                            !groupsLoaded
                                                ?
                                                null
                                                :
                                                systemGroups
                                                    .filter(group => !group.parentGroupId)
                                                    .map(group => (
                                                        <MenuItem value={group.anid} key={group.anid}>{group.displayName}</MenuItem>
                                                    ))
                                        }
                                    </Select>
                                </FormControl>
                            </Col>
                    }
                </Row>

                {/** Search email */}
                <Row
                    style={{ marginTop: 30,  marginBottom: 30}}>
                    <Col xs={12} sm={12} md={12} lg={8}>
                        <FlexView>
                            <FlexView basis="90%" vAlignContent="center" hAlignContent="center"
                            >
                                <TextField value={invitedUserSearchText} label="Search by email" name="invitedUserSearchText" fullWidth variant="outlined" margin="dense" onChange={handleInputChanged}/>
                            </FlexView>
                            <FlexView hAlignContent="center" vAlignContent="center" basis="10%" marginLeft={10}>
                                <IconButton style={{width: 50,height: 50}}
                                    onClick={toggleSearchMode}>
                                    {
                                        !invitedUsersInSearchMode
                                            ?
                                            <SearchIcon/>
                                            :
                                            <CloseIcon/>
                                    }
                                </IconButton>
                            </FlexView>
                        </FlexView>
                    </Col>
                </Row>

                {/** Add members (only investors) from QIB to Silicon Gorge and vice versa */}
                {
                    !admin.superAdmin
                        ?
                        null
                        :
                        systemGroups.findIndex(group => group.anid === filterGroup) !== -1
                        && (
                            systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].groupUserName === "qib"
                            || systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].groupUserName === "iap-silicon-gorge"
                        )
                            ?
                            <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)}
                                    onClick={
                                        systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].groupUserName === "qib"
                                            ?
                                            () => addMembersFromOneGroupToAnotherGroup(
                                                // from qib
                                                systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].anid,
                                                // to sg
                                                systemGroups[systemGroups.findIndex(group => group.groupUserName === "iap-silicon-gorge")].anid
                                            )
                                            :
                                            () => addMembersFromOneGroupToAnotherGroup(
                                                // from sg
                                                systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].anid,
                                                // to qib
                                                systemGroups[systemGroups.findIndex(group => group.groupUserName === "qib")].anid
                                            )
                                    }
                                    style={{marginRight: 10}}>
                                    {
                                        addingMembersFromOneGroupToAnotherGroup
                                            ?
                                            "Adding ..."
                                            :
                                            systemGroups[systemGroups.findIndex(group => group.anid === filterGroup)].groupUserName === "qib"
                                                ?
                                                "Add members from QIB to Silicon Gorge"
                                                :
                                                "Add members from Silicon Gorge to QIB"
                                    }
                                </Button>
                            </FlexView>
                            :
                            null
                }

                {/** Export button - only available for admins */}
                {
                    admin.type !== DB_CONST.TYPE_ADMIN
                        ?
                        null
                        :
                        <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={exportToCsv} style={{marginRight: 10}}
                            >
                                {
                                    requestingCsv
                                        ?
                                        "Exporting ..."
                                        :
                                        "Export to csv"
                                }
                            </Button>

                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={this.refreshLoginDates} style={{marginRight: 10}}
                            >
                                {
                                    this.state.loadingLastLoginDates
                                        ?
                                        "Refreshing ..."
                                        :
                                        "Refresh Login Dates"
                                }
                            </Button>

                            <InfoOverlay placement="right"
                                message={
                                    (admin.superAdmin || admin.superGroupAdmin)
                                        ?
                                        "Export all the users in the system to a .csv file."
                                        :
                                        "Export all the members in your course to a .csv file."
                                }
                            />
                        </FlexView>
                }

                {
                    this.renderInvitedUsersTable()
                }
            </FlexView>
        );
    }

    /**
     * Render invited users table
     *
     * @returns {null|*}
     */
    renderInvitedUsersTable() {
        const {
            admin,

            matchedInvitedUsers,

            invitedUsersPage,
            invitedUsersRowsPerPage,

            handleChangeTablePage,
            handleChangeTableRowsPerPage
        } = this.props;

        return (
            <Paper elevation={0} style={{width: "100%", overflowX: "auto", marginTop: 20}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('name')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>Name</b></Typography>
                                    {this.renderSortIcon('name')}
                                </FlexView>
                            </TableCell>
                            <TableCell colSpan={2} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('email')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>Email</b></Typography>
                                    {this.renderSortIcon('email')}
                                </FlexView>
                            </TableCell>
                            {
                                !(admin.superAdmin || admin.superGroupAdmin)
                                    ?
                                    null
                                    :
                                    <TableCell colSpan={2}>
                                        <Typography align="left" variant="body2"><b>University</b></Typography>
                                    </TableCell>
                            }
                            <TableCell colSpan={1} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('userType')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>User type</b></Typography>
                                    {this.renderSortIcon('userType')}
                                </FlexView>
                            </TableCell>
                            <TableCell colSpan={2} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('projectsCreated')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>Projects Created</b></Typography>
                                    {this.renderSortIcon('projectsCreated')}
                                </FlexView>
                            </TableCell>
                            <TableCell colSpan={1} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('registrationStatus')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>Registration status</b></Typography>
                                    {this.renderSortIcon('registrationStatus')}
                                </FlexView>
                            </TableCell>
                            <TableCell colSpan={2} style={{ cursor: 'pointer' }} onClick={() => this.handleSort('lastLogin')}>
                                <FlexView vAlignContent="center">
                                    <Typography align="left" variant="body2"><b>Last logged in</b></Typography>
                                    {this.renderSortIcon('lastLogin')}
                                </FlexView>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.renderInvitedUsersRows()
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination rowsPerPageOptions={[5, 10, 25]} count={matchedInvitedUsers.length} rowsPerPage={invitedUsersRowsPerPage} page={invitedUsersPage}
                                backIconButtonProps={{
                                    'aria-label': 'Previous Page',
                                }}
                                nextIconButtonProps={{
                                    'aria-label': 'Next Page',
                                }}
                                SelectProps={{
                                    native: true,
                                }}
                                onChangePage={handleChangeTablePage}
                                onChangeRowsPerPage={handleChangeTableRowsPerPage}/>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    } catch (error) {
        console.error("Error in renderInvitedUsersTable:", error);
        return null;
    }

    /**
     * Render invited users rows
     *
     * @returns {*}
     */
    renderInvitedUsersRows = () => {
        const {
            groupUserName,
            groupProperties,
            admin,
            invitedUsersLoaded,
            matchedInvitedUsers,
            invitedUsersPage,
            invitedUsersRowsPerPage,
            invitedUsersInSearchMode,
            filterRegistrationStatus,
            filterUserType,
            filterGroup,
            filterMembers,
            resendInvite
        } = this.props;

        let renderedInvitedUsers = [];

        if (matchedInvitedUsers.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={12}>
                        <FlexView style={{ margin: 40}} hAlignContent="center" vAlignContent="center">
                            {
                                invitedUsersLoaded
                                    ?
                                    <Typography variant="h6" align="center">
                                        {
                                            invitedUsersInSearchMode
                                            || filterRegistrationStatus !== FILTER_REGISTRATION_STATUS_ALL
                                            || filterUserType !== 0
                                            || filterGroup !== "null"
                                            || filterMembers !== FILTER_GROUP_MEMBERS_ALL
                                                ?
                                                "There are no users found using your current filter criteria."
                                                :
                                                "No users found."
                                        }
                                    </Typography>
                                    :
                                    <HashLoader color={colors.primaryColor}/>
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        let matchedUsersInvitedByTheGroup = matchedInvitedUsers.filter(
            user => user.hasOwnProperty('invitedDate') && user.invitedDate !== "none"
        );
        matchedUsersInvitedByTheGroup.sort((user1, user2) => {
            return user2.invitedDate - user1.invitedDate;
        });

        let matchedUsersRequestedToJoin = matchedInvitedUsers.filter(
            user => user.hasOwnProperty('invitedDate') && user.invitedDate === "none"
        );
        matchedUsersRequestedToJoin.sort((user1, user2) => {
            return user2.requestedToJoinDate - user1.requestedToJoinDate;
        });

        if (filterMembers === FILTER_HOME_MEMBERS) {
            renderedInvitedUsers = [...matchedUsersInvitedByTheGroup];
        } else if (filterMembers === FILTER_PLATFORM_MEMBERS) {
            renderedInvitedUsers = [...matchedUsersRequestedToJoin];
        } else {
            renderedInvitedUsers = [...matchedUsersInvitedByTheGroup, ...matchedUsersRequestedToJoin];
        }

        // Apply sorting if a sort column is selected
        renderedInvitedUsers = this.sortUsers(renderedInvitedUsers);

        return (
            !renderedInvitedUsers
                ?
                null
                :
                renderedInvitedUsers
                    .slice(invitedUsersPage * invitedUsersRowsPerPage, invitedUsersPage * invitedUsersRowsPerPage + invitedUsersRowsPerPage)
                    .map(invitedUser => (
                        <TableRow hover key={invitedUser.id}>
                            {/** User name */}
                            <TableCell colSpan={2}>
                                <FlexView column>
                                    {/** User name */}
                                    {invitedUser.officialUser ? (
                                    <NavLink
                                        to={
                                            invitedUser.hasOwnProperty('officialUserID')
                                                ?
                                                groupUserName
                                                    ?
                                                    ROUTES.EDIT_USER_PROFILE
                                                        .replace(":groupUserName", groupUserName)
                                                        .replace(":userID", invitedUser.officialUserID)
                                                    :
                                                    ROUTES.EDIT_USER_PROFILE_INVEST_WEST_SUPER
                                                        .replace(":userID", invitedUser.officialUserID)
                                                :
                                                groupUserName
                                                    ?
                                                    ROUTES.USER_PROFILE
                                                        .replace(":groupUserName", groupUserName)
                                                        .replace(":userID", invitedUser.id)
                                                    :
                                                    ROUTES.USER_PROFILE_INVEST_WEST_SUPER
                                                        .replace(":userID", invitedUser.id)
                                        }
                                        className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                    >
                                        <Typography color="primary" align="left">
                                            {`${invitedUser.officialUser.firstName} ${invitedUser.officialUser.lastName}`}
                                        </Typography>
                                    </NavLink>

                                    ) : (
                                        <Typography color="textSecondary" align="left">
                                            User not found
                                        </Typography>
                                    )}

                                    {/** Resend invite button */}
                                    {
                                        invitedUser.status === DB_CONST.INVITED_USER_STATUS_ACTIVE
                                            ?
                                            null
                                            :
                                            // this check to ensure only the group admin that initally invited this
                                            // user can resend the invitation
                                            (admin.superAdmin || admin.superGroupAdmin)
                                            || (!(admin.superAdmin || admin.superGroupAdmin)
                                                && groupProperties
                                                && groupProperties.anid !== invitedUser.invitedBy
                                            )
                                                ?
                                                null
                                                :
                                                <FlexView marginTop={10}>
                                                    <Button variant="outlined" size="small" color="primary" className={css(sharedStyles.no_text_transform)} onClick={() => resendInvite(invitedUser)}>Resend invite</Button>
                                                </FlexView>
                                    }

                                    {/** Display enrolled course or platform member status */}
                                    {
                                        (admin.superAdmin || admin.superGroupAdmin)
                                            ?
                                            null
                                            :
                                            <Typography align="left" variant="body2" color="textSecondary" style={{ marginTop: 15}}>
                                                {
                                                    invitedUser.hasOwnProperty('invitedDate')
                                                    && invitedUser.invitedDate !== "none"
                                                        ?
                                                        this.getCourseDisplayName(invitedUser)
                                                        :
                                                        "Platform member"
                                                }
                                            </Typography>
                                    }
                                </FlexView>
                            </TableCell>

                            {/** Email */}
                            <TableCell colSpan={2}>
                                <FlexView column>
                                    <Typography align="left" variant="body2" paragraph={(admin.superAdmin || admin.superGroupAdmin)}>{invitedUser.email}</Typography>

                                    {
                                        (admin.superAdmin || admin.superGroupAdmin)
                                            ?
                                            <FlexView column>
                                                <Typography align="left" variant="body2" color="textSecondary"><b><u>Invited ID:</u></b> {invitedUser.id}</Typography>
                                                {
                                                    !invitedUser.hasOwnProperty('officialUserID')
                                                        ?
                                                        null
                                                        :
                                                        <Typography align="left" variant="body2" color="textSecondary"><b><u>UID:</u></b> {invitedUser.officialUserID}</Typography>
                                                }
                                            </FlexView>
                                            :
                                            null
                                    }
                                </FlexView>
                            </TableCell>

                            {/** Group the user belongs to - available only for super admins and super group admins */}
                            {
                                !(admin.superAdmin || admin.superGroupAdmin)
                                    ?
                                    null
                                    :
                                    <TableCell colSpan={2}>
                                        <FlexView column>
                                            <Typography align="left" variant="body2" paragraph>
                                                {invitedUser.Invitor.displayName}
                                            </Typography>

                                            <Typography align="left" variant="body2" color="textSecondary">
                                                {
                                                    invitedUser.hasOwnProperty('invitedDate')
                                                    && invitedUser.invitedDate !== "none"
                                                        ?
                                                        this.getCourseDisplayName(invitedUser)
                                                        :
                                                        "Platform member"
                                                }
                                            </Typography>
                                        </FlexView>
                                    </TableCell>
                            }

                            {/** User type */}
                            <TableCell colSpan={1}>
                                <Typography align="left"  variant="body2">
                                    {
                                        invitedUser.type === DB_CONST.TYPE_ISSUER
                                            ?
                                            "Student"
                                            :
                                            "Project viewer"
                                    }
                                </Typography>
                            </TableCell>

                            {/** Projects Created */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        this.state.loadingProjectCounts
                                            ?
                                            "Loading..."
                                            :
                                            this.state.userProjectCounts.hasOwnProperty(invitedUser.id)
                                                ?
                                                this.state.userProjectCounts[invitedUser.id]
                                                :
                                                "0"
                                    }
                                </Typography>
                            </TableCell>

                            {/** Registration status */}
                            <TableCell colSpan={1}>{this.renderInvitedUserRegistrationStatus(invitedUser)}</TableCell>

                            {/** Last logged in */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        this.state.loadingLastLoginDates
                                            ?
                                            "Loading..."
                                            :
                                            this.state.userLastLoginDates.hasOwnProperty(invitedUser.id)
                                                ?
                                                myUtils.dateInReadableFormat(this.state.userLastLoginDates[invitedUser.id])
                                                :
                                                invitedUser.status === DB_CONST.INVITED_USER_STATUS_ACTIVE
                                                    ?
                                                    "Never logged in"
                                                    :
                                                    "Not registered"
                                    }
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))
        );
    };

    /**
     * This function is used to render invited users' registration status
     *
     * @param invitedUser
     * @returns {null|*}
     */
    renderInvitedUserRegistrationStatus = invitedUser => {

        let msgObj = {
            msg: '',
            color: ''
        };

        switch (invitedUser.status) {
            case DB_CONST.INVITED_USER_NOT_REGISTERED:
                msgObj.msg = 'Not registered';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_USER_STATUS_ACTIVE:
                msgObj.msg = `Current ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? "project viewer" : "student"}`;
                msgObj.color = 'primary';
                break;
            case DB_CONST.INVITED_USER_DECLINED_TO_REGISTER:
                msgObj.msg = 'Declined to join';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_USER_STATUS_LEFT:
                msgObj.msg = 'Left';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_USER_STATUS_KICKED_OUT:
                msgObj.msg = 'Kicked out';
                msgObj.color = 'error';
                break;
            default:
                return null;
        }

        return (
            <Typography align="left" variant="body2" color={msgObj.color}>{msgObj.msg}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitedUsers);