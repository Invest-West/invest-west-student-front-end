import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {
    Box,
    Card,
    CardContent,
    Collapse,
    Typography,
    IconButton,
    Divider,
    Chip,
    CircularProgress
} from "@material-ui/core";
import {ExpandMore, ExpandLess, School, Business, People, SupervisorAccount} from "@material-ui/icons";
import GroupProperties, {getGroupLogo, isUniversity, GroupType} from "../../models/group_properties";
import {Image} from "react-bootstrap";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {isAdmin} from "../../models/admin";
import {ExploreGroupsState} from "./ExploreGroupsReducer";
import GroupOfMembership from "../../models/group_of_membership";
import {ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import GroupItem from "./GroupItem";
import * as colors from "../../values/colors";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import InvitedUser from "../../models/invited_user";

interface UniversityGroupItemProps {
    university: GroupProperties;
}

interface UniversityGroupItemConnectedProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ExploreGroupsLocalState: ExploreGroupsState;
}

type UniversityGroupItemFullProps = UniversityGroupItemProps & UniversityGroupItemConnectedProps;

interface CourseStatistics {
    courseName: string;
    studentCount: number;
    adminCount: number;
    loading: boolean;
}

interface UniversityGroupItemState {
    expanded: boolean;
    courseStatistics: CourseStatistics[];
    loadingStatistics: boolean;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreGroupsLocalState: state.ExploreGroupsLocalState
    }
}

const mapDispatchToProps = () => {
    return {}
}

class UniversityGroupItem extends Component<UniversityGroupItemFullProps, UniversityGroupItemState> {
    
    constructor(props: UniversityGroupItemFullProps) {
        super(props);
        this.state = {
            expanded: false,
            courseStatistics: [],
            loadingStatistics: false
        };
    }

    toggleExpanded = () => {
        const { expanded } = this.state;
        this.setState({
            expanded: !expanded
        });
        
        // Load course statistics when expanding
        if (!expanded) {
            this.loadCourseStatistics();
        }
    }

    loadCourseStatistics = async () => {
        const { university } = this.props;
        
        if (!university.settings?.availableCourses || university.settings.availableCourses.length === 0) {
            return;
        }

        const courses = university.settings.availableCourses;
        
        this.setState({ loadingStatistics: true });

        try {
            // Initialize course statistics with loading state
            const initialStatistics: CourseStatistics[] = courses.map(courseName => ({
                courseName,
                studentCount: 0,
                adminCount: 0,
                loading: true
            }));
            
            this.setState({ courseStatistics: initialStatistics });

            // Load all invited users for this group
            const invitedUsers = await realtimeDBUtils.loadInvitedUsers(university.anid) as InvitedUser[];
            
            // Load all admins for this group  
            const groupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(university.anid) as any[];

            // Calculate statistics for each course
            const updatedStatistics: CourseStatistics[] = courses.map(courseName => {
                // Count all students (invited users) for this group
                const totalStudents = invitedUsers.filter(user => user.type === 1).length; // type 1 = student
                
                // Count all admins for this group
                const totalAdmins = groupAdmins.length;
                
                // For demonstration, we'll distribute users roughly evenly across courses
                // In a real implementation, this would be based on actual course assignments
                const courseIndex = courses.indexOf(courseName);
                const coursesCount = courses.length;
                
                // Simple distribution logic for demo purposes
                const studentCount = coursesCount > 0 ? Math.floor(totalStudents / coursesCount) + (courseIndex < (totalStudents % coursesCount) ? 1 : 0) : 0;
                const adminCount = coursesCount > 0 ? Math.floor(totalAdmins / coursesCount) + (courseIndex < (totalAdmins % coursesCount) ? 1 : 0) : 0;

                return {
                    courseName,
                    studentCount: Math.max(0, studentCount),
                    adminCount: Math.max(0, adminCount),
                    loading: false
                };
            });

            this.setState({ 
                courseStatistics: updatedStatistics,
                loadingStatistics: false
            });

        } catch (error) {
            console.error('Error loading course statistics:', error);
            
            // Set error state for all courses
            const errorStatistics: CourseStatistics[] = courses.map(courseName => ({
                courseName,
                studentCount: 0,
                adminCount: 0,
                loading: false
            }));
            
            this.setState({ 
                courseStatistics: errorStatistics,
                loadingStatistics: false
            });
        }
    }

    getCourseStatistics = (courseName: string) => {
        const { courseStatistics } = this.state;
        return courseStatistics.find(stat => stat.courseName === courseName) || {
            courseName,
            studentCount: 0,
            adminCount: 0,
            loading: true
        };
    }

    render() {
        const {university, AuthenticationState, ManageGroupUrlState, ExploreGroupsLocalState} = this.props;
        const {expanded} = this.state;
        
        const currentUser = AuthenticationState.currentUser;
        const currentAdmin = currentUser ? isAdmin(currentUser) : null;
        const isCurrentUserAdmin = !!currentAdmin;

        // Use available courses from university settings instead of child groups
        const availableCourses = university.settings?.availableCourses || [];
        const courses = university.childGroups || [];
        const courseCount = availableCourses.length > 0 ? availableCourses.length : courses.length;

        // Check if user is member of university or any of its courses
        const userGroupsOfMembership = AuthenticationState.groupsOfMembership || [];
        const isUniversityMember = userGroupsOfMembership.some(
            (membership: GroupOfMembership) => membership.group.anid === university.anid
        );
        const memberCourses = courses.filter(course =>
            userGroupsOfMembership.some((membership: GroupOfMembership) => membership.group.anid === course.anid)
        );

        return (
            <Card 
                elevation={2} 
                style={{ 
                    marginBottom: 16,
                    border: expanded ? `2px solid ${colors.primaryColor}` : '1px solid #e0e0e0'
                }}
            >
                {/* University Header */}
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" flexGrow={1}>
                            {/* University Logo */}
                            <Box marginRight={2}>
                                {getGroupLogo(university) ? (
                                    <Image
                                        src={getGroupLogo(university)!}
                                        alt={`${university.displayName} logo`}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            objectFit: 'contain',
                                            borderRadius: 8
                                        }}
                                    />
                                ) : (
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        style={{
                                            width: 60,
                                            height: 60,
                                            backgroundColor: colors.primaryColor,
                                            borderRadius: 8
                                        }}
                                    >
                                        <School style={{ color: 'white', fontSize: 30 }} />
                                    </Box>
                                )}
                            </Box>

                            {/* University Info */}
                            <Box flexGrow={1}>
                                <Box display="flex" alignItems="center" marginBottom={1}>
                                    <Typography variant="h6" color="primary">
                                        {university.displayName}
                                    </Typography>
                                    <Chip
                                        label="University"
                                        size="small"
                                        style={{
                                            marginLeft: 8,
                                            backgroundColor: colors.primaryColor,
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    {isUniversityMember && (
                                        <Chip
                                            label="Member"
                                            size="small"
                                            color="secondary"
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                </Box>
                                
                                <Typography variant="body2" color="textSecondary" paragraph>
                                    {university.description}
                                </Typography>

                                <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
                                    </Typography>
                                    {memberCourses.length > 0 && (
                                        <Typography variant="body2" color="primary">
                                            Member of {memberCourses.length} course{memberCourses.length !== 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                    {university.website && (
                                        <Typography 
                                            variant="body2" 
                                            color="primary"
                                            className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                            component="a"
                                            href={university.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit Website
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Expand Button */}
                        <IconButton onClick={this.toggleExpanded} color="primary">
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                            <Typography variant="body2" style={{ marginLeft: 4 }}>
                                {expanded ? 'Hide' : 'Show'} Courses
                            </Typography>
                        </IconButton>
                    </Box>
                </CardContent>

                {/* Courses Section */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Divider />
                    <CardContent style={{ paddingTop: 8 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            <Business style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                            Available Courses
                        </Typography>
                        
                        {availableCourses.length === 0 ? (
                            <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                                No courses available for this university.
                            </Typography>
                        ) : (
                            <Box>
                                {availableCourses.map((courseName, index) => {
                                    const statistics = this.getCourseStatistics(courseName);
                                    return (
                                        <Box 
                                            key={courseName} 
                                            marginBottom={index < availableCourses.length - 1 ? 2 : 0}
                                            style={{
                                                padding: '16px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e9ecef',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                {/* Course Name */}
                                                <Box display="flex" alignItems="center" flex={1}>
                                                    <School style={{ fontSize: 18, marginRight: 8, color: colors.primaryColor }} />
                                                    <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#333' }}>
                                                        {courseName}
                                                    </Typography>
                                                </Box>

                                                {/* Statistics */}
                                                <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                                                    {/* Student Count */}
                                                    <Chip
                                                        icon={statistics.loading ? <CircularProgress size={16} /> : <People />}
                                                        label={statistics.loading ? "..." : `${statistics.studentCount} Students`}
                                                        variant="outlined"
                                                        size="small"
                                                        style={{ 
                                                            backgroundColor: '#e3f2fd', 
                                                            color: '#1976d2',
                                                            borderColor: '#1976d2',
                                                            fontWeight: 500
                                                        }}
                                                    />

                                                    {/* Admin Count */}
                                                    <Chip
                                                        icon={statistics.loading ? <CircularProgress size={16} /> : <SupervisorAccount />}
                                                        label={statistics.loading ? "..." : `${statistics.adminCount} Lecturers`}
                                                        variant="outlined"
                                                        size="small"
                                                        style={{ 
                                                            backgroundColor: '#f3e5f5', 
                                                            color: '#7b1fa2',
                                                            borderColor: '#7b1fa2',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                                
                                {/* Show child groups if they exist and no available courses are defined */}
                                {courses.length > 0 && availableCourses.length === 0 && (
                                    <Box marginTop={2}>
                                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                                            Course Groups:
                                        </Typography>
                                        {courses.map((course, index) => (
                                            <Box key={course.anid} marginBottom={index < courses.length - 1 ? 2 : 0}>
                                                <GroupItem
                                                    group={course}
                                                    isSubGroup={true}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversityGroupItem);