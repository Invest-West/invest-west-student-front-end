import React, {Component} from 'react';
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    Typography,
    Button,
    InputBase,
    TablePagination,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import {
    HashLoader
} from 'react-spinners';
import {css} from 'aphrodite';
import FlexView from 'react-flexview';

import * as utils from '../../../utils/utils';
import * as colors from '../../../values/colors';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as groupAdminsTableActions from '../../../redux-store/actions/groupAdminsTableActions';
import RequestAdminAccessDialog from './RequestAdminAccessDialog';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,
        currentUser: state.auth.user,
        tableGroup: state.manageGroupAdminsTable.tableGroup,
        groupAdmins: state.manageGroupAdminsTable.groupAdmins,
        groupAdminsLoaded: state.manageGroupAdminsTable.groupAdminsLoaded,
        loadingGroupAdmins: state.manageGroupAdminsTable.loadingGroupAdmins,
        page: state.manageGroupAdminsTable.page,
        rowsPerPage: state.manageGroupAdminsTable.rowsPerPage,
        searchText: state.manageGroupAdminsTable.searchText,
        inSearchMode: state.manageGroupAdminsTable.inSearchMode,
        filterCourse: state.manageGroupAdminsTable.filterCourse,
        systemGroups: state.manageSystemGroups.systemGroups
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadGroupAdmins: () => dispatch(groupAdminsTableActions.loadGroupAdmins()),
        changePage: (event, newPage) => dispatch(groupAdminsTableActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(groupAdminsTableActions.changeRowsPerPage(event)),
        handleInputChanged: (event) => dispatch(groupAdminsTableActions.handleInputChanged(event)),
        toggleSearchMode: () => dispatch(groupAdminsTableActions.toggleSearchMode()),
        startListeningForGroupAdminsChanged: () => dispatch(groupAdminsTableActions.startListeningForGroupAdminsChanged()),
        stopListeningForGroupAdminsChanged: () => dispatch(groupAdminsTableActions.stopListeningForGroupAdminsChanged())
    }
};

class GroupAdminsTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessRequestDialogOpen: false
        };
    }

    componentDidMount() {
        this.loadData();
        this.addListeners();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        const {
            shouldLoadOtherData,
            tableGroup,
            stopListeningForGroupAdminsChanged
        } = this.props;

        // cancel all listeners if tableGroup is set to null
        if (!tableGroup || !shouldLoadOtherData) {
            stopListeningForGroupAdminsChanged();
            return;
        }

        this.loadData();
        this.addListeners();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,
            tableGroup,
            loadingGroupAdmins,
            groupAdminsLoaded,
            loadGroupAdmins
        } = this.props;

        if (shouldLoadOtherData) {
            if (tableGroup && !loadingGroupAdmins && !groupAdminsLoaded) {
                loadGroupAdmins();
            }
        }
    };

    /**
     * Add listener
     */
    addListeners = () => {
        const {
            shouldLoadOtherData,
            groupAdmins,
            groupAdminsLoaded,
            startListeningForGroupAdminsChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (groupAdmins && groupAdminsLoaded) {
                startListeningForGroupAdminsChanged();
            }
        }
    };

    /**
     * Toggle access request dialog
     */
    toggleAccessRequestDialog = () => {
        this.setState({
            accessRequestDialogOpen: !this.state.accessRequestDialogOpen
        });
    };

    /**
     * Handle successful request submission
     */
    handleRequestSuccess = () => {
        // Optionally show a success message or reload data
        const {loadGroupAdmins} = this.props;
        loadGroupAdmins();
    };

    render() {
        const {
            groupProperties,
            currentUser,
            tableGroup,
            page,
            rowsPerPage,
            searchText,
            inSearchMode,
            filterCourse,
            systemGroups,
            changePage,
            changeRowsPerPage,
            loadGroupAdmins,
            handleInputChanged,
            toggleSearchMode
        } = this.props;

        return (
            <div style={{width: "100%"}}>
                <Paper elevation={1} style={{overflowX: "auto", width: "100%"}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell colSpan={4} cellColor={colors.blue_gray_50}
                                    component={
                                        <InputBase name="searchText" value={searchText} onChange={handleInputChanged} fullWidth placeholder="Search by email" type="text"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" fli
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
                                <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50} component={
                                        <FlexView hAlignContent="right" vAlignContent="center">
                                            {
                                                !currentUser.superAdmin && !currentUser.superGroupAdmin && tableGroup !== null
                                                    ?
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" flip
                                                        overlay={
                                                            <Tooltip id={`tooltip-request-admin`}>
                                                                Request to add a new admin to your course. A super admin will review your request.
                                                            </Tooltip>
                                                        }>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            className={css(sharedStyles.no_text_transform)}
                                                            onClick={this.toggleAccessRequestDialog}
                                                            style={{ marginRight: 8}}
                                                            startIcon={<PersonAddIcon />}
                                                        >
                                                            Request Admin Access
                                                        </Button>
                                                    </OverlayTrigger>
                                                    :
                                                    null
                                            }
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" flip
                                                overlay={
                                                    <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>}>
                                                <IconButton onClick={loadGroupAdmins} style={{marginLeft: 10}}>
                                                    <RefreshIcon/>
                                                </IconButton>
                                            </OverlayTrigger>
                                        </FlexView>
                                    }
                                />
                            </TableRow>
                            <TableRow>
                                <StyledTableCell colSpan={6} cellColor={colors.blue_gray_50}
                                    component={
                                        <FlexView marginTop={10} marginBottom={10}>
                                            <FormControl style={{minWidth: 200}}>
                                                <InputLabel>
                                                    <Typography variant="body1" color="primary">Course</Typography>
                                                </InputLabel>
                                                <Select
                                                    margin="dense"
                                                    input={<OutlinedInput labelWidth={0} name="filterCourse"/>}
                                                    name="filterCourse"
                                                    value={filterCourse}
                                                    onChange={handleInputChanged}
                                                    style={{marginTop: 25}}
                                                >
                                                    <MenuItem value="all" key="all">
                                                        All courses
                                                    </MenuItem>
                                                    {
                                                        this.getAvailableCourses().map(course => (
                                                            <MenuItem value={course.anid} key={course.anid}>
                                                                {course.displayName || course.groupUserName}
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
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
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Email</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left"  className={css(sharedStyles.white_text)}>University</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left"  className={css(sharedStyles.white_text)}>Courses</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left"  className={css(sharedStyles.white_text)}>Type</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Date added</Typography>}/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.renderTableRows()
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    style={{backgroundColor: colors.blue_gray_50}}
                                    rowsPerPageOptions={[10, 30, 50]}
                                    count={this.getRenderedGroupAdmins().length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChangePage={changePage}
                                    onChangeRowsPerPage={changeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>

                {/* Admin Access Request Dialog for admins */}
                {tableGroup && (
                    <RequestAdminAccessDialog
                        open={this.state.accessRequestDialogOpen}
                        universityId={tableGroup.anid}
                        universityName={tableGroup.displayName}
                        onClose={this.toggleAccessRequestDialog}
                        onSuccess={this.handleRequestSuccess}
                    />
                )}
            </div>
        );
    }

    /**
     * Get university name by anid
     */
    getUniversityName = (anid) => {
        const { systemGroups } = this.props;
        if (!systemGroups || systemGroups.length === 0) {
            return '-';
        }
        const university = systemGroups.find(group => group.anid === anid && !group.parentGroupId);
        return university ? university.displayName : '-';
    };

    /**
     * Get course names for an admin
     */
    getCourseNames = (admin) => {
        const { systemGroups } = this.props;

        if (!systemGroups || systemGroups.length === 0) {
            return '-';
        }

        // If admin has specific courseIds, use those
        if (admin.courseIds && admin.courseIds.length > 0) {
            const courseNames = admin.courseIds.map(courseId => {
                const course = systemGroups.find(group => group.anid === courseId);
                return course ? course.displayName : courseId;
            });
            return courseNames.join(', ');
        }

        // Check if this is a super group admin who manages all courses
        if (admin.superGroupAdmin) {
            console.log('[GET COURSE NAMES] Super group admin - manages all courses');
            return 'All courses';
        }

        // Check if admin's anid matches a specific COURSE (course-level admin)
        const adminCourse = systemGroups.find(group => group.anid === admin.anid && group.parentGroupId);

        if (adminCourse) {
            return adminCourse.displayName || adminCourse.groupUserName;
        }

        // Otherwise, check if admin's anid matches a UNIVERSITY (university-level admin)
        const adminUniversity = systemGroups.find(group => group.anid === admin.anid && !group.parentGroupId);

        if (adminUniversity) {
            // Find all courses under this university
            const coursesUnderUniversity = systemGroups.filter(group => {
                const isChildByParentId = group.parentGroupId === admin.anid;
                const isChildByUserName = group.groupUserName &&
                                         group.groupUserName.includes('-') &&
                                         group.groupUserName.startsWith(adminUniversity.groupUserName + '-');

                return isChildByParentId || isChildByUserName;
            });

            if (coursesUnderUniversity.length === 0) {
                return 'All courses';
            }

            const courseNames = coursesUnderUniversity.map(course => course.displayName || course.groupUserName);
            return courseNames.join(', ');
        }

        return 'All courses';
    };

    /**
     * Get available courses for the current university
     */
    getAvailableCourses = () => {
        const { tableGroup, systemGroups } = this.props;
        if (!tableGroup || !systemGroups || systemGroups.length === 0) {
            return [];
        }
        // Get courses for this university (courses have parentGroupId matching the university)
        return systemGroups.filter(group => group.parentGroupId === tableGroup.anid || (group.groupUserName && group.groupUserName.startsWith(tableGroup.groupUserName + '-')));
    };

    /**
     * Render table rows
     *
     * @returns {*[]|*}
     */
    renderTableRows = () => {
        const {
            groupProperties,
            groupAdminsLoaded,
            page,
            rowsPerPage,
            inSearchMode
        } = this.props;

        if (this.getRenderedGroupAdmins().length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6}>
                        <FlexView hAlignContent="center" vAlignContent="center" style={{margin: 20}}>
                            {
                                groupAdminsLoaded
                                    ?
                                    <Typography variant="body1" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "No group admins found."
                                                :
                                                "No group admins."
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
                                        }
                                    />
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            this.getRenderedGroupAdmins()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(groupAdmin => (
                    <TableRow key={groupAdmin.id} hover>
                        <TableCell colSpan={2}>
                            <Typography variant="body2" align="left">
                                {groupAdmin.email}
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {this.getUniversityName(groupAdmin.anid)}
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {this.getCourseNames(groupAdmin)}
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {
                                    groupAdmin.superGroupAdmin
                                        ?
                                        "Super group admin"
                                        :
                                        "Group admin"
                                }
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {utils.dateTimeInReadableFormat(groupAdmin.dateAdded)}
                            </Typography>
                        </TableCell>
                    </TableRow>
                )
            )
        );
    };

    /**
     * Get rendered group admins
     *
     * @returns {*[]}
     */
    getRenderedGroupAdmins = () => {
        const {
            searchText,
            inSearchMode,
            filterCourse,
            groupAdmins,
            systemGroups
        } = this.props;

        let searchedGroupAdmins = [...groupAdmins];

        // Filter by search text
        if (inSearchMode) {
            searchedGroupAdmins = searchedGroupAdmins
                .filter(groupAdmin => groupAdmin.email.includes(searchText.toLowerCase()));
        }

        // Filter by course
        if (filterCourse && filterCourse !== 'all') {
            searchedGroupAdmins = searchedGroupAdmins.filter(groupAdmin => {
                // If admin has specific courseIds, check if the selected course is in their list
                if (groupAdmin.courseIds && groupAdmin.courseIds.length > 0) {
                    return groupAdmin.courseIds.includes(filterCourse);
                }

                // Super group admins see all courses
                if (groupAdmin.superGroupAdmin) {
                    return true;
                }

                if (systemGroups && systemGroups.length > 0) {
                    // Check if admin's anid matches the selected course directly (course-level admin)
                    if (groupAdmin.anid === filterCourse) {
                        return true;
                    }

                    // Check if the selected course is under this admin's university (university-level admin)
                    const selectedCourse = systemGroups.find(group => group.anid === filterCourse);
                    if (selectedCourse) {
                        // Check if the course's parent is this admin's university
                        if (selectedCourse.parentGroupId === groupAdmin.anid) {
                            return true;
                        }
                        // Also check by groupUserName pattern
                        const adminUniversity = systemGroups.find(group => group.anid === groupAdmin.anid && !group.parentGroupId);
                        if (adminUniversity && selectedCourse.groupUserName &&
                            selectedCourse.groupUserName.startsWith(adminUniversity.groupUserName + '-')) {
                            return true;
                        }
                    }
                }

                return false;
            });
        }

        return searchedGroupAdmins.sort((groupAdmin1, groupAdmin2) => {
            return groupAdmin2.time - groupAdmin1.time;
        });
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupAdminsTable);