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
    Chip
} from "@material-ui/core";
import {ExpandMore, ExpandLess, School, Business} from "@material-ui/icons";
import GroupProperties, {getGroupLogo} from "../../models/group_properties";
import {Image} from "react-bootstrap";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {isAdmin} from "../../models/admin";
import {ExploreGroupsState} from "./ExploreGroupsReducer";
import GroupOfMembership from "../../models/group_of_membership";
import {ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import * as colors from "../../values/colors";
import {NavLink} from "react-router-dom";
import Routes from "../../router/routes";

interface UniversityGroupItemProps {
    university: GroupProperties;
}

interface UniversityGroupItemConnectedProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ExploreGroupsLocalState: ExploreGroupsState;
}

type UniversityGroupItemFullProps = UniversityGroupItemProps & UniversityGroupItemConnectedProps;

interface UniversityGroupItemState {
    expanded: boolean;
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
            expanded: false
        };
    }

    toggleExpanded = () => {
        const { expanded } = this.state;
        this.setState({
            expanded: !expanded
        });
    }

    render() {
        const {university, AuthenticationState, ManageGroupUrlState, ExploreGroupsLocalState} = this.props;
        const {expanded} = this.state;

        const currentUser = AuthenticationState.currentUser;
        const currentAdmin = currentUser ? isAdmin(currentUser) : null;
        const isCurrentUserAdmin = !!currentAdmin;

        // Use the new course hierarchy from childGroups
        const courses = university.childGroups || [];
        const courseCount = courses.length;

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
                                            component="a"
                                            href={university.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', cursor: 'pointer' }}
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

                        {courses.length === 0 ? (
                            <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                                No courses available for this university.
                            </Typography>
                        ) : (
                            <Box>
                                {courses.map((course, index) => {
                                    // Check if user is a member of this specific course
                                    const isMemberOfCourse = userGroupsOfMembership.some(
                                        (membership: GroupOfMembership) => membership.group.anid === course.anid
                                    );

                                    // Construct the route to view the course details page
                                    const courseRoute = Routes.constructGroupDetailRoute(
                                        university.groupUserName,
                                        null,
                                        course.groupUserName
                                    );

                                    return (
                                        <NavLink
                                            key={course.anid}
                                            to={courseRoute}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Box
                                                marginBottom={index < courses.length - 1 ? 2 : 0}
                                                style={{
                                                    padding: '16px',
                                                    backgroundColor: isMemberOfCourse ? '#e8f5e9' : '#f8f9fa',
                                                    border: isMemberOfCourse ? '2px solid #4caf50' : '1px solid #e9ecef',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease-in-out'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    {/* Course Name and Status */}
                                                    <Box display="flex" alignItems="center" flex={1}>
                                                        <School style={{ fontSize: 18, marginRight: 8, color: colors.primaryColor }} />
                                                        <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#333' }}>
                                                            {course.displayName}
                                                        </Typography>
                                                        {isMemberOfCourse && (
                                                            <Chip
                                                                label="Member"
                                                                size="small"
                                                                color="secondary"
                                                                style={{ marginLeft: 8 }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Course Description */}
                                                {course.description && (
                                                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 8, marginLeft: 26 }}>
                                                        {course.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </NavLink>
                                    );
                                })}
                            </Box>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversityGroupItem);