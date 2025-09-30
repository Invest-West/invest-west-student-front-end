import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, IconButton, TextField, Typography, Paper, Chip, CircularProgress} from "@material-ui/core";
import GroupProperties from "../../../../models/group_properties";
import {isSavingCoursesChanges, ManageCoursesState} from "./ManageCoursesReducer";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {
    addNewCourse,
    cancelCoursesChanges, 
    deleteCourse,
    loadCoursesFromGroup,
    onTextChanged,
    saveCoursesChanges,
    toggleAddNewCourse,
    loadCourseStatistics
} from "./ManageCoursesActions";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import PeopleIcon from "@material-ui/icons/People";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import RefreshIcon from "@material-ui/icons/Refresh";
import SettingsIcon from "@material-ui/icons/Settings";
import CourseMembers from "./CourseMembers";

interface ManageCoursesProps {
    groupProperties: GroupProperties;
    ManageCoursesLocalState: ManageCoursesState;
    toggleAddNewCourse: () => any;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    addNewCourse: () => any;
    deleteCourse: (course: string) => any;
    saveCoursesChanges: () => any;
    cancelCoursesChanges: () => any;
    loadCoursesFromGroup: () => any;
    loadCourseStatistics: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        groupProperties: state.manageGroupFromParams.groupProperties,
        ManageCoursesLocalState: state.ManageCoursesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleAddNewCourse: () => dispatch(toggleAddNewCourse()),
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        addNewCourse: () => dispatch(addNewCourse()),
        deleteCourse: (course: string) => dispatch(deleteCourse(course)),
        saveCoursesChanges: () => dispatch(saveCoursesChanges()),
        cancelCoursesChanges: () => dispatch(cancelCoursesChanges()),
        loadCoursesFromGroup: () => dispatch(loadCoursesFromGroup()),
        loadCourseStatistics: () => dispatch(loadCourseStatistics())
    }
}

interface ManageCoursesLocalState {
    courseMembersDialogOpen: boolean;
    selectedCourse: string | null;
}

class ManageCourses extends Component<ManageCoursesProps, ManageCoursesLocalState> {
    constructor(props: ManageCoursesProps) {
        super(props);
        this.state = {
            courseMembersDialogOpen: false,
            selectedCourse: null
        };
    }

    componentDidMount() {
        // Initialize courses from group properties when component mounts
        const { loadCoursesFromGroup, loadCourseStatistics } = this.props;
        loadCoursesFromGroup();
        loadCourseStatistics();
    }

    componentDidUpdate(prevProps: ManageCoursesProps) {
        // Reload statistics when courses change
        if (prevProps.ManageCoursesLocalState.courses !== this.props.ManageCoursesLocalState.courses) {
            this.props.loadCourseStatistics();
        }
    }

    getCourseStatistics = (courseName: string) => {
        const { ManageCoursesLocalState } = this.props;
        return ManageCoursesLocalState.courseStatistics.find(stat => stat.courseName === courseName) || {
            courseName,
            studentCount: 0,
            adminCount: 0,
            loading: true
        };
    }

    handleOpenCourseMembers = (courseName: string) => {
        this.setState({
            courseMembersDialogOpen: true,
            selectedCourse: courseName
        });
    }

    handleCloseCourseMembers = () => {
        this.setState({
            courseMembersDialogOpen: false,
            selectedCourse: null
        });
        // Reload statistics to reflect any changes
        this.props.loadCourseStatistics();
    }

    getCourseUserName = (courseName: string) => {
        // Return just the course name formatted, not prefixed with group name
        return courseName.toLowerCase().replace(/\s+/g, '-');
    }

    render() {
        const {
            groupProperties,
            ManageCoursesLocalState,
            toggleAddNewCourse,
            onTextChanged,
            addNewCourse,
            deleteCourse,
            saveCoursesChanges,
            cancelCoursesChanges
        } = this.props;

        if (!groupProperties || !groupProperties.settings) {
            return null;
        }

        return <Box>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="primary">Edit courses for {groupProperties.displayName}</Typography>
                <IconButton 
                    onClick={() => this.props.loadCourseStatistics()}
                    size="small"
                    disabled={ManageCoursesLocalState.loadingStatistics}
                    title="Refresh course statistics"
                >
                    {ManageCoursesLocalState.loadingStatistics ? (
                        <CircularProgress size={20} />
                    ) : (
                        <RefreshIcon />
                    )}
                </IconButton>
            </Box>

            <Box height="15px"/>

            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => toggleAddNewCourse()}>
                {
                    !ManageCoursesLocalState.addingNewCourse
                        ? <AddIcon/>
                        : <CloseIcon/>
                }

                <Box
                    width="6px"
                />
                {
                    !ManageCoursesLocalState.addingNewCourse
                        ? "Add new course"
                        : "Cancel adding new course"
                }
            </Button>

            {
                !ManageCoursesLocalState.addingNewCourse
                    ? null
                    : <Box display="flex" flexDirection="row" alignItems="center" marginTop="10px">
                        <TextField variant="outlined" margin="dense" onChange={onTextChanged}/>
                        <Box width="15px"/>
                        <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => addNewCourse()}>Add</Button>
                      </Box>
            }

            <Box height="30px"/>

            {ManageCoursesLocalState.courses.length === 0 ? (
                <Box textAlign="center" padding="40px">
                    <Typography variant="body1" color="textSecondary">
                        No courses available. Add a new course to get started.
                    </Typography>
                </Box>
            ) : (
                ManageCoursesLocalState.courses.map(course => {
                    const statistics = this.getCourseStatistics(course);
                    return (
                        <Paper 
                            key={course}
                            elevation={2} 
                            style={{ 
                                padding: '16px', 
                                marginBottom: '12px', 
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                {/* Course Name */}
                                <Box flex={1}>
                                    <Typography variant="h6" style={{ fontWeight: 600, color: '#333' }}>
                                        {course}
                                    </Typography>
                                </Box>

                                {/* Statistics */}
                                <Box display="flex" flexDirection="row" alignItems="center">
                                    {/* Student Count */}
                                    <Chip
                                        icon={statistics.loading ? <CircularProgress size={16} /> : <PeopleIcon />}
                                        label={statistics.loading ? "..." : `${statistics.studentCount} Students`}
                                        variant="outlined"
                                        size="small"
                                        style={{ 
                                            backgroundColor: '#e3f2fd', 
                                            color: '#1976d2',
                                            borderColor: '#1976d2',
                                            fontWeight: 500,
                                            marginRight: 8
                                        }}
                                    />

                                    {/* Admin Count */}
                                    <Chip
                                        icon={statistics.loading ? <CircularProgress size={16} /> : <SupervisorAccountIcon />}
                                        label={statistics.loading ? "..." : `${statistics.adminCount} Admins`}
                                        variant="outlined"
                                        size="small"
                                        style={{ 
                                            backgroundColor: '#f3e5f5', 
                                            color: '#7b1fa2',
                                            borderColor: '#7b1fa2',
                                            fontWeight: 500,
                                            marginRight: 8
                                        }}
                                    />

                                    {/* Manage Members Button */}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<SettingsIcon />}
                                        onClick={() => this.handleOpenCourseMembers(course)}
                                        style={{ 
                                            color: '#1976d2',
                                            borderColor: '#1976d2',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            marginRight: 8
                                        }}
                                    >
                                        Manage Members
                                    </Button>

                                    {/* Delete Button */}
                                    <Box>
                                        <IconButton 
                                            onClick={() => deleteCourse(course)}
                                            size="small"
                                            style={{ color: '#d32f2f' }}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    );
                })
            )}

            <Box display="flex" flexDirection="row" marginTop="20px">
                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => cancelCoursesChanges()}>Cancel changes</Button>
                <Box width="15px"/>
                <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => saveCoursesChanges()} disabled={isSavingCoursesChanges(ManageCoursesLocalState)}>
                    {
                        isSavingCoursesChanges(ManageCoursesLocalState)
                            ? "Saving ..."
                            : "Save changes"
                    }
                </Button>
            </Box>

            {/* Course Members Dialog */}
            {this.state.selectedCourse && (
                <CourseMembers
                    open={this.state.courseMembersDialogOpen}
                    onClose={this.handleCloseCourseMembers}
                    courseName={this.state.selectedCourse}
                    groupUserName={groupProperties.groupUserName}
                    courseUserName={this.getCourseUserName(this.state.selectedCourse)}
                />
            )}
        </Box>;
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCourses);