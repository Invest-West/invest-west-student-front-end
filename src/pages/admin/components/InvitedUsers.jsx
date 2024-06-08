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
import {Col, Row} from "react-bootstrap";
import FlexView from "react-flexview";
import {HashLoader} from "react-spinners";
import {NavLink} from "react-router-dom";
import {css} from "aphrodite";
import InfoOverlay from "../../../shared-components/info_overlay/InfoOverlay";
import {connect} from "react-redux";
import * as invitedUsersActions from "../../../redux-store/actions/invitedUsersActions";
import * as invitationDialogActions from "../../../redux-store/actions/invitationDialogActions";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as ROUTES from "../../../router/routes";
import * as myUtils from "../../../utils/utils";
import * as colors from "../../../values/colors";

export const FILTER_REGISTRATION_STATUS_ALL = -1;

export const FILTER_GROUP_MEMBERS_ALL = 0;
export const FILTER_HOME_MEMBERS = 1;
export const FILTER_PLATFORM_MEMBERS = 2;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,

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
        addMembersFromOneGroupToAnotherGroup: (fromGroup, toGroup) => dispatch(invitedUsersActions.addMembersFromOneGroupToAnotherGroup(fromGroup, toGroup)),

        toggleInvitationDialog: () => dispatch(invitationDialogActions.toggleInvitationDialog())
    }
};

class InvitedUsers extends Component {

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

            loadInvitedUsers
        } = this.props;

        if (invitedUsers && !invitedUsersBeingLoaded && !invitedUsersLoaded) {
            loadInvitedUsers();
        }

        this.addListener();
    }

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

            toggleInvitationDialog,
            toggleSearchMode,
            handleInputChanged,
            exportToCsv,
            addMembersFromOneGroupToAnotherGroup
        } = this.props;

        return (
            <FlexView column width="100%">
                <Divider style={{marginBottom: 30}}/>

                {/** Invite new user button - available for group admins only */}
                {
                    admin.superAdmin
                        ?
                        null
                        :
                        <Row style={{marginBottom: 30}}>
                            <Col xs={12} md={5} lg={12}>
                                <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleInvitationDialog}>
                                    <Add style={{ marginRight: 10, width: 20, height: "auto"}}/>Invite new group member</Button>
                            </Col>
                        </Row>
                }

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
                                <MenuItem value={DB_CONST.TYPE_INVESTOR}>Investor</MenuItem>
                                <MenuItem value={DB_CONST.TYPE_ISSUER}>Issuer</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>

                    {/** Group members */}
                    {
                        !admin.superAdmin
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
                                            <MenuItem value={FILTER_HOME_MEMBERS} key={FILTER_HOME_MEMBERS}>Home members</MenuItem>
                                            <MenuItem value={FILTER_PLATFORM_MEMBERS} key={FILTER_PLATFORM_MEMBERS}>Platform members</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FlexView marginLeft={15}>
                                        <InfoOverlay
                                            placement="right"
                                            message={
                                                "Home members are the users that registered through this group. Platform members are existing users of Invest West who requested access to this group."
                                            }
                                        />
                                    </FlexView>
                                </FlexView>
                            </Col>
                            :
                            <Col xs={12} sm={12} md={4} lg={3}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        <Typography variant="body1" color="primary" align="left">Group</Typography>
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
                                                    "Loading groups ..."
                                                    :
                                                    "All"
                                            }
                                        </MenuItem>
                                        {
                                            !groupsLoaded
                                                ?
                                                null
                                                :
                                                systemGroups.map(group => (
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

                            <InfoOverlay placement="right"
                                message={
                                    admin.superAdmin
                                        ?
                                        "Export all the users in the system to a .csv file."
                                        :
                                        "Export all the members in your group to a .csv file."
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
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Name</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Email</b></Typography>
                            </TableCell>
                            {
                                !admin.superAdmin
                                    ?
                                    null
                                    :
                                    <TableCell colSpan={2}>
                                        <Typography align="left" variant="body2"><b>Group</b></Typography>
                                    </TableCell>
                            }
                            <TableCell colSpan={1}>
                                <Typography align="left" variant="body2"><b>User type</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Invited/requested to join date</b></Typography>
                            </TableCell>
                            <TableCell colSpan={1}>
                                <Typography align="left" variant="body2"><b>Registration status</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2" ><b>Registered/joined date</b></Typography>
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
                                            admin.superAdmin
                                            || (!admin.superAdmin
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

                                    {/** Display home/platform members */}
                                    {
                                        admin.superAdmin
                                            ?
                                            null
                                            :
                                            <Typography align="left" variant="body2" color="textSecondary" style={{ marginTop: 15}}>
                                                {
                                                    invitedUser.hasOwnProperty('invitedDate')
                                                    && invitedUser.invitedDate !== "none"
                                                        ?
                                                        "Home member"
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
                                    <Typography align="left" variant="body2" paragraph={admin.superAdmin}>{invitedUser.email}</Typography>

                                    {
                                        admin.superAdmin
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

                            {/** Group the user belongs to - available only for super admins */}
                            {
                                !admin.superAdmin
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
                                                        "Home member"
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
                                            "Issuer"
                                            :
                                            "Investor"
                                    }
                                </Typography>
                            </TableCell>

                            {/** Date invited / requested to join / registered via public link */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        invitedUser.invitedDate !== "none"
                                        && (
                                            invitedUser.hasOwnProperty('requestedToJoinDate')
                                            && invitedUser.requestedToJoinDate !== "none"
                                        )
                                            ?
                                            `Registered via public link on ${myUtils.dateInReadableFormat(invitedUser.invitedDate)}`
                                            :
                                            invitedUser.invitedDate !== "none"
                                                ?
                                                `Invited on ${myUtils.dateInReadableFormat(invitedUser.invitedDate)}`
                                                :
                                                `Requested to join on ${myUtils.dateInReadableFormat(invitedUser.requestedToJoinDate)}`
                                    }
                                </Typography>
                            </TableCell>

                            {/** Registration status */}
                            <TableCell colSpan={1}>{this.renderInvitedUserRegistrationStatus(invitedUser)}</TableCell>

                            {/** Date registered/joined */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        !invitedUser.hasOwnProperty('joinedDate')
                                            ?
                                            null
                                            :
                                            !invitedUser.requestedToJoin
                                                ?
                                                `Registered on ${myUtils.dateInReadableFormat(invitedUser.joinedDate)}`
                                                :
                                                `Joined on ${myUtils.dateInReadableFormat(invitedUser.joinedDate)}`
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
                msgObj.msg = `Current ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? "investor" : "issuer"}`;
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