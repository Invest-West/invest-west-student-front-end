import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import InvitedUser from "../../../models/invited_user";
import {userCache} from "../../../utils/CacheManager";
import GroupProperties, { GroupType, isUniversity, isCourse, getCoursesForUniversity, getUniversities } from "../../../models/group_properties";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    OutlinedInput,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@material-ui/core";
import {css} from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import FlexView from "react-flexview";
import {BeatLoader} from "react-spinners";
import * as colors from "../../../values/colors";
import Api, {ApiRoutes} from "../../../api/Api";
import UserRepository from "../../../api/repositories/UserRepository";
import * as realtimeDBUtils from "../../../firebase/realtimeDBUtils";
import {loadCourseStatistics} from "./manage-courses/ManageCoursesActions";

export const UPGRADE_USER_STATUS_NONE = 0;
export const UPGRADE_USER_STATUS_MISSING_DATA = 1;
export const UPGRADE_USER_STATUS_CHECKING = 2;
export const UPGRADE_USER_STATUS_USER_NOT_FOUND = 3;
export const UPGRADE_USER_STATUS_SUCCESS = 4;
export const UPGRADE_USER_STATUS_ERROR = 5;
export const UPGRADE_USER_STATUS_ALREADY_ADMIN = 6;

interface UpgradeUserToAdminProps {
    systemGroups: any[];
    groupsLoaded: boolean;
    currentAdmin?: any;
    currentGroup?: any;
    loadCourseStatistics: () => any;
}

interface UpgradeUserToAdminState {
    dialogOpen: boolean;
    searchEmail: string;
    selectedUniversity: string;
    selectedCourse: string;
    upgradeStatus: number;
    statusMessage: string;
    searchResults: any[];
    isSearching: boolean;
    selectedUser: any | null;
    availableCourses: GroupProperties[];
}

class UpgradeUserToAdmin extends Component<UpgradeUserToAdminProps, UpgradeUserToAdminState> {
    private userRepository: UserRepository;
    private api: Api;

    // Helper function to get all available courses for a university (both actual groups and virtual courses)
    private getAvailableCoursesForUniversity = (universityId: string, systemGroups: GroupProperties[]): GroupProperties[] => {
        const university = systemGroups.find(group => group.anid === universityId);
        if (!university) return [];

        // Get actual course groups
        const actualCourses = getCoursesForUniversity(systemGroups, universityId);
        
        // Get virtual courses from settings.availableCourses (string array)
        const availableCoursesStrings = university.settings?.availableCourses || [];
        
        // Create virtual course groups for the string-based courses that don't have actual groups
        const virtualCourses = availableCoursesStrings
            .filter(courseName => !actualCourses.some(course => course.displayName.toLowerCase() === courseName.toLowerCase()))
            .map(courseName => this.createVirtualCourseGroup(courseName, universityId, university.groupUserName));

        return [...actualCourses, ...virtualCourses];
    };

    // Create a virtual course group from a course name
    private createVirtualCourseGroup = (courseName: string, universityId: string, universityUserName: string): GroupProperties => {
        return {
            anid: `virtual-course-${universityId}-${courseName.toLowerCase().replace(/\s+/g, '-')}`,
            dateAdded: Date.now(),
            description: `${courseName} course`,
            displayName: courseName,
            displayNameLower: courseName.toLowerCase(),
            groupUserName: `${universityUserName}-${courseName.toLowerCase().replace(/\s+/g, '-')}`,
            isInvestWest: false,
            status: 1,
            plainLogo: [],
            settings: {
                primaryColor: '#1976d2',
                secondaryColor: '#dc004e',
                projectVisibility: 0,
                makeInvestorsContactDetailsVisibleToIssuers: false
            },
            groupType: GroupType.COURSE,
            parentGroupId: universityId,
            // Mark this as virtual for special handling
            isVirtual: true
        } as GroupProperties & { isVirtual?: boolean };
    };

    constructor(props: UpgradeUserToAdminProps) {
        super(props);
        this.state = {
            dialogOpen: false,
            searchEmail: '',
            selectedUniversity: (props.currentAdmin?.superAdmin || props.currentAdmin?.superGroupAdmin) ? '' : (isUniversity(props.currentGroup) ? props.currentGroup?.anid || '' : props.currentGroup?.parentGroupId || ''),
            selectedCourse: (props.currentAdmin?.superAdmin || props.currentAdmin?.superGroupAdmin) ? '' : (!isUniversity(props.currentGroup) ? props.currentGroup?.anid || '' : ''),
            upgradeStatus: UPGRADE_USER_STATUS_NONE,
            statusMessage: '',
            searchResults: [],
            isSearching: false,
            selectedUser: null,
            availableCourses: []
        };
        this.userRepository = new UserRepository();
        this.api = new Api();
    }

    componentDidMount() {
        // Initialize available courses for university admins
        if (this.props.currentGroup && isUniversity(this.props.currentGroup)) {
            const availableCourses = this.getAvailableCoursesForUniversity(this.props.currentGroup.anid, this.props.systemGroups);
            this.setState({ availableCourses });
        }
    }

    componentDidUpdate(prevProps: UpgradeUserToAdminProps) {
        // Update available courses if systemGroups or currentGroup changes
        if (prevProps.systemGroups !== this.props.systemGroups || prevProps.currentGroup !== this.props.currentGroup) {
            if (this.props.currentGroup && isUniversity(this.props.currentGroup)) {
                const availableCourses = this.getAvailableCoursesForUniversity(this.props.currentGroup.anid, this.props.systemGroups);
                this.setState({ availableCourses });
            }
        }
    }

    handleInputChanged = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const {name, value} = event.target;
        
        // If university is changed, reset course selection and load available courses
        if (name === 'selectedUniversity') {
            const selectedUniversityId = value as string;
            const availableCourses = selectedUniversityId 
                ? this.getAvailableCoursesForUniversity(selectedUniversityId, this.props.systemGroups)
                : [];
            
            this.setState({
                ...this.state,
                selectedUniversity: selectedUniversityId,
                selectedCourse: '',
                availableCourses,
                upgradeStatus: UPGRADE_USER_STATUS_NONE
            });
        } else {
            this.setState({
                ...this.state,
                [name as string]: value,
                upgradeStatus: UPGRADE_USER_STATUS_NONE
            } as any);
        }
    };

    toggleDialog = () => {
        this.setState({
            dialogOpen: !this.state.dialogOpen,
            searchEmail: '',
            selectedUniversity: '',
            selectedCourse: '',
            upgradeStatus: UPGRADE_USER_STATUS_NONE,
            statusMessage: '',
            searchResults: [],
            isSearching: false,
            selectedUser: null,
            availableCourses: []
        });
    };

    searchUser = async () => {
        const {searchEmail} = this.state;
        
        if (!searchEmail.trim()) {
            this.setState({
                upgradeStatus: UPGRADE_USER_STATUS_MISSING_DATA,
                statusMessage: 'Please enter an email address'
            });
            return;
        }

        this.setState({
            isSearching: true,
            upgradeStatus: UPGRADE_USER_STATUS_CHECKING,
            searchResults: []
        });

        try {
            // Search for users in invited users (this is where we can find existing users)
            // We'll need to implement a search API endpoint or use existing ones
            // For now, I'll simulate the search functionality
            // In a real implementation, you'd call an API to search for users by email
            
            // Simulated search - in real implementation, replace with actual API call
            const searchResults = await this.mockUserSearch(searchEmail);
            
            this.setState({
                isSearching: false,
                searchResults,
                upgradeStatus: searchResults.length > 0 ? UPGRADE_USER_STATUS_NONE : UPGRADE_USER_STATUS_USER_NOT_FOUND,
                statusMessage: searchResults.length === 0 ? 'No users found with this email address' : ''
            });
        } catch (error: unknown) {
            this.setState({
                isSearching: false,
                upgradeStatus: UPGRADE_USER_STATUS_ERROR,
                statusMessage: 'Error searching for user. Please try again.'
            });
        }
    };

    // Check if a user is already an admin of a specific course
    checkIfUserIsAlreadyAdmin = async (userEmail: string, groupId: string): Promise<boolean> => {
        // This would need to be implemented based on your admin checking logic
        // For now, we'll rely on the API call to handle this check
        return false;
    };

    // Search for users in both invited users and admin users databases
    mockUserSearch = async (email: string): Promise<any[]> => {
        try {
            const { currentAdmin, systemGroups } = this.props;
            
            // Load invited users based on admin type
            // Super admins and super group admins can see all users, regular group admins only see their group's users
            const groupFilter = (currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin) ? null : currentAdmin?.anid;
            const invitedUsers = await realtimeDBUtils.loadInvitedUsers(groupFilter);
            
            
            // Filter users by email (case-insensitive partial match)
            let matchingUsers = invitedUsers.filter((user: InvitedUser) => 
                user.email.toLowerCase().includes(email.toLowerCase())
            );
            

            // Also check admin users to see if any match the email
            // IMPORTANT: We need to check ALL groups to find if the user is an admin somewhere
            const allAdminUsers = [];
            
            // Check all available groups (regardless of current admin's permissions for search purposes)
            const groupsToCheck = systemGroups && systemGroups.length > 0 ? systemGroups : 
                                  (this.props.currentGroup ? [this.props.currentGroup] : []);
            
            
            for (const group of groupsToCheck) {
                try {
                    const groupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(group.anid) as any[];
                    
                    const adminMatches = groupAdmins.filter((admin: any) => 
                        admin.email && admin.email.toLowerCase().includes(email.toLowerCase())
                    );
                    
                    // Add group info to admin matches
                    adminMatches.forEach((admin: any) => {
                        admin.isAdmin = true;
                        admin.adminOfGroup = group;
                        admin.type = 'Admin';
                        admin.status = 1; // Admins are always active
                        admin.email = admin.email;
                        admin.group = group.displayName;
                        admin.anid = group.anid;
                        admin.isCurrentGroup = group.anid === currentAdmin?.anid;
                    });
                    allAdminUsers.push(...adminMatches);
                } catch (error) {
                }
            }

            // Merge results, prioritizing admin users (remove duplicates)
            const emailSet = new Set<string>();
            const combinedResults: any[] = [];
            
            // Add admin users first (higher priority)
            allAdminUsers.forEach((admin: any) => {
                if (!emailSet.has(admin.email.toLowerCase())) {
                    emailSet.add(admin.email.toLowerCase());
                    combinedResults.push(admin);
                }
            });
            
            // Add invited users that aren't already admins
            matchingUsers.forEach((user: any) => {
                if (!emailSet.has(user.email.toLowerCase())) {
                    emailSet.add(user.email.toLowerCase());
                    combinedResults.push(user);
                }
            });

            return combinedResults;
        } catch (error) {
            throw error;
        }
    };

    selectUser = (user: any) => {
        // Auto-select university and course based on the user's current membership
        let autoSelectedUniversity = '';
        let autoSelectedCourse = '';
        let availableCourses: GroupProperties[] = [];

        // If user is not an admin and has invitedBy field, use it to determine their group
        if (!user.isAdmin && user.invitedBy) {
            const userGroup = this.props.systemGroups.find(g => g.anid === user.invitedBy);

            if (userGroup) {
                if (isCourse(userGroup)) {
                    // User belongs to a course - auto-select both course and parent university
                    autoSelectedCourse = userGroup.anid;
                    autoSelectedUniversity = userGroup.parentGroupId || '';

                    if (autoSelectedUniversity) {
                        availableCourses = this.getAvailableCoursesForUniversity(autoSelectedUniversity, this.props.systemGroups);
                    }
                } else if (isUniversity(userGroup)) {
                    // User belongs to a university - auto-select university and load courses
                    autoSelectedUniversity = userGroup.anid;
                    availableCourses = this.getAvailableCoursesForUniversity(autoSelectedUniversity, this.props.systemGroups);
                }
            }
        } else if (user.isAdmin && user.adminOfGroup) {
            // User is already an admin - show their current admin group
            const adminGroup = user.adminOfGroup;

            if (isCourse(adminGroup)) {
                autoSelectedCourse = adminGroup.anid;
                autoSelectedUniversity = adminGroup.parentGroupId || '';

                if (autoSelectedUniversity) {
                    availableCourses = this.getAvailableCoursesForUniversity(autoSelectedUniversity, this.props.systemGroups);
                }
            } else if (isUniversity(adminGroup)) {
                autoSelectedUniversity = adminGroup.anid;
                availableCourses = this.getAvailableCoursesForUniversity(autoSelectedUniversity, this.props.systemGroups);
            }
        }

        this.setState({
            selectedUser: user,
            selectedUniversity: autoSelectedUniversity,
            selectedCourse: autoSelectedCourse,
            availableCourses: availableCourses,
            upgradeStatus: UPGRADE_USER_STATUS_NONE
        });
    };

    upgradeUserToAdmin = async () => {
        const {currentAdmin, currentGroup, systemGroups} = this.props;
        const {selectedUser, selectedUniversity, selectedCourse} = this.state;

        // Determine the target university and course based on admin type
        let targetUniversityId: string;
        let targetCourseId: string;

        if (currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin) {
            // Super admins can select any university and course
            targetUniversityId = selectedUniversity;
            targetCourseId = selectedCourse;
        } else {
            // Regular group admins work within their current group structure
            if (isUniversity(currentGroup)) {
                // If current group is a university, they can only manage courses within it
                targetUniversityId = currentGroup.anid;
                targetCourseId = selectedCourse; // They should select a course
            } else {
                // If current group is a course, get the parent university
                targetUniversityId = currentGroup?.parentGroupId || '';
                targetCourseId = currentGroup?.anid || '';
            }
        }

        if (!selectedUser || !targetCourseId || (!targetUniversityId && (currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin))) {
            let missingFields = [];
            if (!selectedUser) missingFields.push('user');
            if ((currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin) && !targetUniversityId) missingFields.push('university');
            if (!targetCourseId) missingFields.push('course');
            
            this.setState({
                upgradeStatus: UPGRADE_USER_STATUS_MISSING_DATA,
                statusMessage: `Please select a ${missingFields.join(' and ')}`
            });
            return;
        }

        // Get the target course properties object
        let targetCourseProperties;
        let targetUniversityProperties;

        // Find the target course and university
        // For virtual courses, we need to get them from our helper function
        let isVirtualCourse = false;
        targetCourseProperties = systemGroups.find(group => group.anid === targetCourseId);
        
        // If not found in systemGroups, it might be a virtual course
        if (!targetCourseProperties && targetUniversityId) {
            const allCoursesForUniversity = this.getAvailableCoursesForUniversity(targetUniversityId, systemGroups);
            targetCourseProperties = allCoursesForUniversity.find(course => course.anid === targetCourseId);
            isVirtualCourse = targetCourseProperties && (targetCourseProperties as any).isVirtual;
        }
        
        targetUniversityProperties = systemGroups.find(group => group.anid === targetUniversityId);

        if (!targetCourseProperties) {
            this.setState({
                upgradeStatus: UPGRADE_USER_STATUS_ERROR,
                statusMessage: 'Could not find the selected course. Please try again.'
            });
            return;
        }

        if (!targetUniversityProperties && targetUniversityId) {
            this.setState({
                upgradeStatus: UPGRADE_USER_STATUS_ERROR,
                statusMessage: 'Could not find the selected university. Please try again.'
            });
            return;
        }


        this.setState({
            upgradeStatus: UPGRADE_USER_STATUS_CHECKING,
            statusMessage: 'Upgrading user to admin...'
        });

        try {

            // Check if user is already admin of the specific target course/university combination
            const isAlreadyAdminOfTargetCourse = selectedUser.isAdmin && 
                selectedUser.adminOfGroup?.anid === targetCourseProperties.anid;
            
            const isAlreadyAdminOfTargetUniversity = selectedUser.isAdmin && 
                selectedUser.adminOfGroup?.anid === targetUniversityId;

            // Only block if they're already admin of the exact target course
            // Allow upgrading admins from other courses/universities to this course
            if (isAlreadyAdminOfTargetCourse) {
                this.setState({
                    upgradeStatus: UPGRADE_USER_STATUS_ALREADY_ADMIN,
                    statusMessage: `${selectedUser.email} is already an admin of ${targetCourseProperties.displayName}.`
                });
                return;
            }

            // For virtual courses, also check if they're already an admin of the target university
            // (since virtual course admins are actually university admins)
            if (isVirtualCourse && isAlreadyAdminOfTargetUniversity) {
                this.setState({
                    upgradeStatus: UPGRADE_USER_STATUS_ALREADY_ADMIN,
                    statusMessage: `${selectedUser.email} is already an admin of ${targetUniversityProperties.displayName}. They may already have access to ${targetCourseProperties.displayName}.`
                });
                return;
            }

            // Double-check by loading current admins of the target course/university
            try {
                let existingAdmin = null;
                
                if (isVirtualCourse) {
                    // For virtual courses, check university admins
                    const currentUniversityAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(targetUniversityId) as any[];
                    existingAdmin = currentUniversityAdmins.find((admin: any) => 
                        admin.email && admin.email.toLowerCase() === selectedUser.email.toLowerCase()
                    );
                    
                    if (existingAdmin) {
                        this.setState({
                            upgradeStatus: UPGRADE_USER_STATUS_ALREADY_ADMIN,
                            statusMessage: `${selectedUser.email} is already an admin of ${targetUniversityProperties.displayName}. They may already have access to ${targetCourseProperties.displayName}.`
                        });
                        return;
                    }
                } else {
                    // For real courses, check course admins
                    const currentGroupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(targetCourseProperties.anid) as any[];
                    existingAdmin = currentGroupAdmins.find((admin: any) => 
                        admin.email && admin.email.toLowerCase() === selectedUser.email.toLowerCase()
                    );
                    
                    if (existingAdmin) {
                        this.setState({
                            upgradeStatus: UPGRADE_USER_STATUS_ALREADY_ADMIN,
                            statusMessage: `${selectedUser.email} is already an admin of ${targetCourseProperties.displayName}.`
                        });
                        return;
                    }
                }
            } catch (adminCheckError) {
                // Continue with the upgrade attempt
            }

            if (isVirtualCourse) {
                // For virtual courses, add user as admin to the university
                // The course assignment will be handled through the university's course management
                await this.api.request(
                    "post",
                    ApiRoutes.addGroupAdminRoute,
                    {
                        queryParameters: null,
                        requestBody: {
                            adder: currentAdmin,
                            groupProperties: targetUniversityProperties,
                            newGroupAdminEmail: selectedUser.email,
                            // Include course information for virtual course assignment
                            additionalData: {
                                courseAssignment: targetCourseProperties.displayName,
                                isVirtualCourse: true,
                                existingAdminStatus: selectedUser.isAdmin ? {
                                    currentAdminOf: selectedUser.adminOfGroup?.displayName,
                                    currentAdminId: selectedUser.adminOfGroup?.anid
                                } : null,
                                upgradeType: selectedUser.isAdmin ? 'cross_group_upgrade' : 'new_admin'
                            }
                        }
                    }
                );
            } else {
                // Step 1: Add user to university (if not already a member and if it's different from course)
                if (targetUniversityProperties && targetUniversityId !== targetCourseId) {
                    try {
                        await this.api.request(
                            "post",
                            ApiRoutes.addGroupAdminRoute,
                            {
                                queryParameters: null,
                                requestBody: {
                                    adder: currentAdmin,
                                    groupProperties: targetUniversityProperties,
                                    newGroupAdminEmail: selectedUser.email,
                                    additionalData: {
                                        existingAdminStatus: selectedUser.isAdmin ? {
                                            currentAdminOf: selectedUser.adminOfGroup?.displayName,
                                            currentAdminId: selectedUser.adminOfGroup?.anid
                                        } : null,
                                        upgradeType: selectedUser.isAdmin ? 'cross_group_upgrade' : 'new_admin',
                                        targetCourse: targetCourseProperties.displayName
                                    }
                                }
                            }
                        );
                    } catch (universityError) {
                        // Continue with course assignment even if university assignment fails
                    }
                }

                // Step 2: Add user as admin to the specific course
                await this.api.request(
                    "post",
                    ApiRoutes.addGroupAdminRoute,
                    {
                        queryParameters: null,
                        requestBody: {
                            adder: currentAdmin,
                            groupProperties: targetCourseProperties,
                            newGroupAdminEmail: selectedUser.email,
                            additionalData: {
                                existingAdminStatus: selectedUser.isAdmin ? {
                                    currentAdminOf: selectedUser.adminOfGroup?.displayName,
                                    currentAdminId: selectedUser.adminOfGroup?.anid
                                } : null,
                                upgradeType: selectedUser.isAdmin ? 'cross_group_upgrade' : 'new_admin'
                            }
                        }
                    }
                );
            }

            const wasAlreadyAdmin = selectedUser.isAdmin;
            const upgradeAction = wasAlreadyAdmin ? 'added as additional admin' : 'upgraded to admin';
            
            const successMessage = isVirtualCourse
                ? `Successfully ${upgradeAction} for ${selectedUser.email} - course admin for ${targetCourseProperties.displayName} at ${targetUniversityProperties.displayName}!`
                : targetUniversityProperties 
                    ? `Successfully ${upgradeAction} for ${selectedUser.email} - admin of ${targetCourseProperties.displayName} (${targetUniversityProperties.displayName})!`
                    : `Successfully ${upgradeAction} for ${selectedUser.email} - admin of ${targetCourseProperties.displayName}!`;

            this.setState({
                upgradeStatus: UPGRADE_USER_STATUS_SUCCESS,
                statusMessage: successMessage
            });

            // Refresh course statistics after successful upgrade
            try {
                this.props.loadCourseStatistics();
            } catch (statsError) {
                // Don't fail the upgrade process if statistics refresh fails
            }

            // Clear user cache for the upgraded user to force fresh data on next login
            try {
                const userUid = selectedUser.officialUserID || selectedUser.id;
                if (userUid) {
                    userCache.delete(`user:${userUid}`);
                    userCache.delete(`user:${userUid}:groups`);
                }
            } catch (cacheError) {
                // Don't fail the upgrade process if cache clearing fails
            }

            // Reset form after successful upgrade
            setTimeout(() => {
                this.toggleDialog();
            }, 2000);

        } catch (error: unknown) {
            // Check if the error is about the user already being an admin
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage && (errorMessage.includes('already been used') || errorMessage.includes('already exists'))) {
                this.setState({
                    upgradeStatus: UPGRADE_USER_STATUS_ALREADY_ADMIN,
                    statusMessage: `${selectedUser.email} is already an admin of ${targetCourseProperties.displayName}.`
                });
            } else {
                this.setState({
                    upgradeStatus: UPGRADE_USER_STATUS_ERROR,
                    statusMessage: `Failed to upgrade user: ${errorMessage || 'Unknown error occurred'}`
                });
            }
        }
    };

    renderStatusMessage = () => {
        const {upgradeStatus, statusMessage} = this.state;

        if (upgradeStatus === UPGRADE_USER_STATUS_NONE) {
            return null;
        }

        if (upgradeStatus === UPGRADE_USER_STATUS_CHECKING) {
            return (
                <FlexView vAlignContent="center">
                    <BeatLoader size={10} color={colors.primaryColor} />
                    <Typography variant="body2" style={{ marginLeft: 10 }}>
                        {statusMessage}
                    </Typography>
                </FlexView>
            );
        }

        const color = upgradeStatus === UPGRADE_USER_STATUS_SUCCESS 
            ? 'primary' 
            : upgradeStatus === UPGRADE_USER_STATUS_ALREADY_ADMIN 
                ? 'secondary' 
                : 'error';

        return (
            <Typography variant="body2" color={color}>
                {statusMessage}
            </Typography>
        );
    };

    renderSearchResults = () => {
        const {searchResults, selectedUser} = this.state;

        if (searchResults.length === 0) {
            return null;
        }

        return (
            <Box marginTop={2}>
                <Typography variant="subtitle2" gutterBottom>
                    Search Results:
                </Typography>
                <Paper elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {searchResults.map((user, index) => (
                                <TableRow 
                                    key={index}
                                    selected={selectedUser?.id === user.id}
                                >
                                    <TableCell>
                                        {user.isAdmin 
                                            ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A')
                                            : user.officialUser ? 
                                                `${user.officialUser.firstName} ${user.officialUser.lastName}` : 
                                                (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A')
                                        }
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.isAdmin ? (
                                            <Typography variant="body2" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                Admin
                                            </Typography>
                                        ) : (
                                            user.type === 1 ? 'Student' : 'Project Viewer'
                                        )}
                                        <br />
                                        <Typography variant="caption" color="textSecondary">
                                            {user.status === 1 ? 'Active' : 'Not Registered'}
                                        </Typography>
                                        {user.isAdmin && user.adminOfGroup && (
                                            <>
                                                <br />
                                                <Typography variant="caption" style={{ color: '#d32f2f' }}>
                                                    Admin of: {user.adminOfGroup.displayName}
                                                </Typography>
                                            </>
                                        )}
                                        {!user.isAdmin && user.Invitor && (
                                            <>
                                                <br />
                                                <Typography variant="caption" color="primary">
                                                    Current Group: {user.Invitor.displayName}
                                                </Typography>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant={selectedUser?.id === user.id ? "contained" : "outlined"}
                                            color={selectedUser?.id === user.id ? "primary" : user.isAdmin ? "secondary" : "primary"}
                                            onClick={() => this.selectUser(user)}
                                        >
                                            {selectedUser?.id === user.id 
                                                ? "Selected" 
                                                : user.isAdmin 
                                                    ? "Select (Admin elsewhere)"
                                                    : "Select"
                                            }
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        );
    };

    render() {
        const {systemGroups, groupsLoaded, currentAdmin, currentGroup} = this.props;
        const {
            dialogOpen,
            searchEmail,
            selectedUniversity,
            selectedCourse,
            isSearching,
            selectedUser,
            availableCourses
        } = this.state;

        // Determine available groups based on admin type
        const availableUniversities = (currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin) 
            ? getUniversities(systemGroups)
            : (isUniversity(currentGroup) ? [currentGroup] : []);
        const isGroupAdmin = !(currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin);
        const isUniversityAdmin = isGroupAdmin && isUniversity(currentGroup);

        return (
            <Box>
                <Typography variant="h6" color="primary">
                    Upgrade User to Course Admin
                </Typography>

                <Box height="15px" />

                <Typography variant="body2" color="textSecondary" paragraph>
                    {isUniversityAdmin
                        ? "Search for existing users and upgrade them to become admins of a specific course within your university."
                        : isGroupAdmin 
                            ? "Search for existing users in your course and upgrade them to become course admins."
                            : currentAdmin?.superAdmin 
                                ? "Search for existing users across all universities and upgrade them to become admins of a specific course."
                                : "As a super course admin, search for existing users across all universities and upgrade them to become admins of any course."
                    }
                </Typography>

                <Button
                    className={css(sharedStyles.no_text_transform)}
                    variant="outlined"
                    color="primary"
                    onClick={this.toggleDialog}
                    startIcon={<AddIcon />}
                >
                    Upgrade User to Admin
                </Button>

                <Dialog
                    open={dialogOpen}
                    onClose={this.toggleDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <FlexView vAlignContent="center">
                            <FlexView grow={4}>
                                <Typography variant="h6" color="primary">
                                    {currentAdmin?.superAdmin 
                                        ? "Upgrade User to Course Admin (System Admin)" 
                                        : currentAdmin?.superGroupAdmin 
                                            ? "Upgrade User to Course Admin (Super Course Admin)"
                                            : "Upgrade User to Course Admin"
                                    }
                                </Typography>
                            </FlexView>
                            <FlexView grow={1} hAlignContent="right">
                                <IconButton onClick={this.toggleDialog}>
                                    <CloseIcon />
                                </IconButton>
                            </FlexView>
                        </FlexView>
                    </DialogTitle>

                    <DialogContent>
                        <Box display="flex" flexDirection="column" style={{gap: '16px'}}>
                            {/* Search User Section */}
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    1. Search for User
                                </Typography>
                                <Box display="flex" flexDirection="row" alignItems="center" style={{gap: '8px'}}>
                                    <TextField
                                        variant="outlined"
                                        label="User Email"
                                        name="searchEmail"
                                        placeholder="Enter user's email address"
                                        value={searchEmail}
                                        onChange={this.handleInputChanged}
                                        fullWidth
                                        required
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.searchUser}
                                        disabled={isSearching}
                                        startIcon={isSearching ? undefined : <SearchIcon />}
                                        className={css(sharedStyles.no_text_transform)}
                                    >
                                        {isSearching ? <BeatLoader size={8} color="white" /> : "Search"}
                                    </Button>
                                </Box>
                                {this.renderSearchResults()}
                            </Box>

                            {/* Select University Section */}
                            {!isGroupAdmin && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        2. Select University
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>University</InputLabel>
                                        <Select
                                            name="selectedUniversity"
                                            value={selectedUniversity}
                                            onChange={this.handleInputChanged}
                                            input={<OutlinedInput label="University" />}
                                            disabled={!groupsLoaded}
                                        >
                                            <MenuItem value="">
                                                {!groupsLoaded ? "Loading universities..." : "Select a university"}
                                            </MenuItem>
                                            {groupsLoaded && availableUniversities.map(university => (
                                                <MenuItem key={university.anid} value={university.anid}>
                                                    {university.displayName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}

                            {/* Select Course Section */}
                            {(!isGroupAdmin || isUniversityAdmin) && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {!isGroupAdmin ? "3. Select Course" : "2. Select Course"}
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Course</InputLabel>
                                        <Select
                                            name="selectedCourse"
                                            value={selectedCourse}
                                            onChange={this.handleInputChanged}
                                            input={<OutlinedInput label="Course" />}
                                            disabled={!groupsLoaded || (isUniversityAdmin && !availableCourses.length)}
                                        >
                                            <MenuItem value="">
                                                {!groupsLoaded 
                                                    ? "Loading courses..." 
                                                    : availableCourses.length === 0 
                                                        ? "No courses available" 
                                                        : "Select a course"
                                                }
                                            </MenuItem>
                                            {groupsLoaded && availableCourses.map(course => (
                                                <MenuItem key={course.anid} value={course.anid}>
                                                    {course.displayName}
                                                    {(course as any).isVirtual && (
                                                        <Typography variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                                                            (Course)
                                                        </Typography>
                                                    )}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                            
                            {isGroupAdmin && !isUniversityAdmin && currentGroup && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        2. Course
                                    </Typography>
                                    <Paper elevation={1} style={{ padding: 16 }}>
                                        <Typography variant="body2">
                                            <strong>Selected Course:</strong> {currentGroup.displayName}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            As a course admin, you can only upgrade users to admins of your course.
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* Selected User Summary */}
                            {selectedUser && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Selected User
                                    </Typography>
                                    <Paper elevation={1} style={{ padding: 16 }}>
                                        <Typography variant="body2">
                                            <strong>Email:</strong> {selectedUser.email}
                                        </Typography>
                                        {(selectedUser.officialUser || (selectedUser.firstName && selectedUser.lastName)) && (
                                            <Typography variant="body2">
                                                <strong>Name:</strong> {selectedUser.officialUser ? 
                                                    `${selectedUser.officialUser.firstName} ${selectedUser.officialUser.lastName}` :
                                                    `${selectedUser.firstName} ${selectedUser.lastName}`
                                                }
                                            </Typography>
                                        )}
                                        <Typography variant="body2">
                                            <strong>Type:</strong> {selectedUser.isAdmin ? 'Admin' : (selectedUser.type === 1 ? 'Student' : 'Project Viewer')}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Status:</strong> {selectedUser.status === 1 ? 'Active' : 'Not Registered'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Current Group:</strong> {
                                                selectedUser.isAdmin 
                                                    ? selectedUser.adminOfGroup?.displayName || 'N/A'
                                                    : selectedUser.Invitor?.displayName || 'N/A'
                                            }
                                        </Typography>
                                        
                                        {/* Info for admin users */}
                                        {selectedUser.isAdmin && (
                                            <Box marginTop={1} padding={1} style={{ backgroundColor: '#e3f2fd', borderRadius: 4 }}>
                                                <Typography variant="caption" style={{ color: '#1976d2' }}>
                                                    ℹ️ This user is currently an admin of {selectedUser.adminOfGroup?.displayName}. They can be upgraded to admin of additional courses.
                                                </Typography>
                                            </Box>
                                        )}
                                        
                                        {/* Info message if trying to upgrade to same group they're already a member of */}
                                        {!selectedUser.isAdmin && selectedUser.Invitor && selectedCourse && selectedUser.Invitor.anid === selectedCourse && (
                                            <Box marginTop={1} padding={1} style={{ backgroundColor: '#e3f2fd', borderRadius: 4 }}>
                                                <Typography variant="caption" style={{ color: '#1976d2' }}>
                                                    ℹ️ This user is already a member of the selected course and will be upgraded to admin.
                                                </Typography>
                                            </Box>
                                        )}
                                        
                                        {/* Info message for group admin context */}
                                        {!selectedUser.isAdmin && selectedUser.Invitor && !selectedCourse && currentGroup && selectedUser.Invitor.anid === currentGroup.anid && (
                                            <Box marginTop={1} padding={1} style={{ backgroundColor: '#e3f2fd', borderRadius: 4 }}>
                                                <Typography variant="caption" style={{ color: '#1976d2' }}>
                                                    ℹ️ This user is already a member of your course and will be upgraded to admin.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            )}

                            {/* Status Message */}
                            <Box>
                                {this.renderStatusMessage()}
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={20} hAlignContent="right" vAlignContent="center">
                            <Button
                                variant="outlined"
                                onClick={this.toggleDialog}
                                className={css(sharedStyles.no_text_transform)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.upgradeUserToAdmin}
                                disabled={
                                    !selectedUser || 
                                    (!isGroupAdmin && !selectedUniversity) ||
                                    ((!isGroupAdmin || isUniversityAdmin) && !selectedCourse) ||
                                    this.state.upgradeStatus === UPGRADE_USER_STATUS_CHECKING ||
                                    this.state.upgradeStatus === UPGRADE_USER_STATUS_ALREADY_ADMIN
                                }
                                className={css(sharedStyles.no_text_transform)}
                                style={{ marginLeft: 20 }}
                            >
                                {selectedUser?.isAdmin ? "Add as Course Admin" : "Upgrade to Admin"}
                            </Button>
                        </FlexView>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        systemGroups: state.manageSystemGroups?.systemGroups || [],
        groupsLoaded: state.manageSystemGroups?.groupsLoaded || false,
        currentAdmin: state.auth?.user,
        currentGroup: state.manageGroupFromParams?.groupProperties
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadCourseStatistics: () => dispatch(loadCourseStatistics())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeUserToAdmin);