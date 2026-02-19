import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { Col, Row } from 'react-bootstrap';
import FlexView from 'react-flexview';
import { HashLoader } from 'react-spinners';
import { NavLink } from 'react-router-dom';
import { css } from 'aphrodite';
import InfoOverlay from '../../../shared-components/info_overlay/InfoOverlay';
import { useSelector, useDispatch } from 'react-redux';
import * as invitedUsersActions from '../../../redux-store/actions/invitedUsersActions';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as ROUTES from '../../../router/routes';
import * as myUtils from '../../../utils/utils';
import * as colors from '../../../values/colors';
import offerRepository, {
  FetchProjectsOrderByOptions,
} from '../../../api/repositories/OfferRepository';
import firebase from '../../../firebase/firebaseApp';
import userRepository from '../../../api/repositories/UserRepository';
import UpgradeUserToAdmin from './UpgradeUserToAdmin';
import InviteMultipleUsers from './InviteMultipleUsers';

export const FILTER_REGISTRATION_STATUS_ALL = -1;

export const FILTER_GROUP_MEMBERS_ALL = 0;
export const FILTER_HOME_MEMBERS = 1;
export const FILTER_PLATFORM_MEMBERS = 2;

function InvitedUsers() {
  const dispatch = useDispatch();

  // Redux state
  const groupUserName = useSelector((state) => state.manageGroupFromParams.groupUserName);
  const groupProperties = useSelector((state) => state.manageGroupFromParams.groupProperties);
  const groupNameFromUrl = useSelector((state) => state.ManageGroupUrlState.groupNameFromUrl);
  const courseNameFromUrl = useSelector((state) => state.ManageGroupUrlState.courseNameFromUrl);
  const systemGroups = useSelector((state) => state.manageSystemGroups.systemGroups);
  const groupsLoaded = useSelector((state) => state.manageSystemGroups.groupsLoaded);
  const admin = useSelector((state) => state.auth.user);
  const invitedUsers = useSelector((state) => state.invitedUsers.invitedUsers);
  const invitedUsersLoaded = useSelector((state) => state.invitedUsers.invitedUsersLoaded);
  const invitedUsersBeingLoaded = useSelector(
    (state) => state.invitedUsers.invitedUsersBeingLoaded
  );
  const invitedUsersPage = useSelector((state) => state.invitedUsers.invitedUsersPage);
  const invitedUsersRowsPerPage = useSelector(
    (state) => state.invitedUsers.invitedUsersRowsPerPage
  );
  const filterRegistrationStatus = useSelector(
    (state) => state.invitedUsers.filterRegistrationStatus
  );
  const filterUserType = useSelector((state) => state.invitedUsers.filterUserType);
  const filterMembers = useSelector((state) => state.invitedUsers.filterMembers);
  const filterGroup = useSelector((state) => state.invitedUsers.filterGroup);
  const invitedUserSearchText = useSelector((state) => state.invitedUsers.invitedUserSearchText);
  const invitedUsersInSearchMode = useSelector(
    (state) => state.invitedUsers.invitedUsersInSearchMode
  );
  const requestingCsv = useSelector((state) => state.invitedUsers.requestingCsv);
  const addingMembersFromOneGroupToAnotherGroup = useSelector(
    (state) => state.invitedUsers.addingMembersFromOneGroupToAnotherGroup
  );
  const matchedInvitedUsers = useSelector((state) => state.invitedUsers.matchedInvitedUsers);

  // Dispatch wrappers
  const loadInvitedUsers = useCallback(
    () => dispatch(invitedUsersActions.loadInvitedUsers()),
    [dispatch]
  );
  const toggleSearchMode = useCallback(
    () => dispatch(invitedUsersActions.toggleInvitedUsersSearchMode()),
    [dispatch]
  );
  const handleInputChanged = useCallback(
    (event) => dispatch(invitedUsersActions.handleInputChanged(event)),
    [dispatch]
  );
  const handleChangeTablePage = useCallback(
    (event, newPage) => dispatch(invitedUsersActions.handleChangeTablePage(event, newPage)),
    [dispatch]
  );
  const handleChangeTableRowsPerPage = useCallback(
    (event) => dispatch(invitedUsersActions.handleChangeTableRowsPerPage(event)),
    [dispatch]
  );
  const startListeningForInvitedUsersChanged = useCallback(
    () => dispatch(invitedUsersActions.startListeningForInvitedUsersChanged()),
    [dispatch]
  );
  const resendInvite = useCallback(
    (invitedUser) => dispatch(invitedUsersActions.resendInvite(invitedUser)),
    [dispatch]
  );
  const exportToCsv = useCallback(() => dispatch(invitedUsersActions.exportToCsv()), [dispatch]);
  const dispatchAddMembersFromOneGroupToAnotherGroup = useCallback(
    (fromGroup, toGroup) =>
      dispatch(
        invitedUsersActions.dispatchAddMembersFromOneGroupToAnotherGroup(fromGroup, toGroup)
      ),
    [dispatch]
  );

  // Local state
  const [userProjectCounts, setUserProjectCounts] = useState({});
  const [loadingProjectCounts, setLoadingProjectCounts] = useState(false);
  const [userLastLoginDates, setUserLastLoginDates] = useState({});
  const [loadingLastLoginDates, setLoadingLastLoginDates] = useState(false);
  const [sortColumn, setSortColumn] = useState('lastLogin');
  const [sortDirection, setSortDirection] = useState('desc');

  // Refs for repositories
  // Track previous values for componentDidUpdate logic
  const prevInvitedUsersLoadedRef = useRef(false);
  const prevMatchedInvitedUsersRef = useRef(null);

  // Load invited users on mount and when needed
  useEffect(() => {
    if (invitedUsers && !invitedUsersBeingLoaded && !invitedUsersLoaded) {
      loadInvitedUsers();
    }
  }, [invitedUsers, invitedUsersBeingLoaded, invitedUsersLoaded, loadInvitedUsers]);

  // Add listener when users are loaded
  useEffect(() => {
    if (invitedUsers && invitedUsersLoaded) {
      startListeningForInvitedUsersChanged();
    }
  }, [invitedUsers, invitedUsersLoaded, startListeningForInvitedUsersChanged]);

  // Load project counts when users first become loaded
  useEffect(() => {
    if (
      invitedUsersLoaded &&
      !prevInvitedUsersLoadedRef.current &&
      !loadingProjectCounts &&
      Object.keys(userProjectCounts).length === 0
    ) {
      loadProjectCountsFn();
    }
    prevInvitedUsersLoadedRef.current = invitedUsersLoaded;
  }, [invitedUsersLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load last login dates when users become loaded or matched users change
  useEffect(() => {
    if (
      invitedUsersLoaded &&
      (!prevInvitedUsersLoadedRef.current ||
        prevMatchedInvitedUsersRef.current !== matchedInvitedUsers) &&
      !loadingLastLoginDates
    ) {
      loadLastLoginDatesFn();
    }
    prevMatchedInvitedUsersRef.current = matchedInvitedUsers;
  }, [invitedUsersLoaded, matchedInvitedUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProjectCountsFn() {
    if (!invitedUsers || invitedUsers.length === 0) {
      return;
    }

    setLoadingProjectCounts(true);

    try {
      const projectCounts = {};
      const usersToCount = matchedInvitedUsers || invitedUsers;

      for (const user of usersToCount) {
        try {
          const userIdToQuery = user.officialUserID || user.id;

          const response = await offerRepository.fetchOffers({
            issuer: userIdToQuery,
            phase: 'all',
            orderBy: FetchProjectsOrderByOptions.Issuer,
          });

          projectCounts[user.id] = response.data ? response.data.length : 0;
        } catch (error) {
          projectCounts[user.id] = 0;
        }
      }

      setUserProjectCounts(projectCounts);
      setLoadingProjectCounts(false);
    } catch (error) {
      console.error('Error loading project counts:', error);
      setLoadingProjectCounts(false);
    }
  }

  async function loadLastLoginDatesFn() {
    if (!invitedUsers || invitedUsers.length === 0) {
      return;
    }

    setLoadingLastLoginDates(true);

    try {
      const lastLoginDates = {};
      const usersToProcess = matchedInvitedUsers || invitedUsers;

      for (const user of usersToProcess) {
        try {
          if (user.officialUserID) {
            const response = await userRepository.retrieveUser(user.officialUserID);
            const userProfile = response.data;
            if (userProfile && userProfile.lastLoginDate) {
              lastLoginDates[user.id] = userProfile.lastLoginDate;
            }
          }
        } catch (error) {
          if (!error.toString().includes('404')) {
            console.warn(`Failed to fetch last login date for user ${user.email}:`, error);
          }
        }
      }

      setUserLastLoginDates(lastLoginDates);
      setLoadingLastLoginDates(false);
    } catch (error) {
      console.error('Error loading last login dates:', error);
      setLoadingLastLoginDates(false);
    }
  }

  function refreshLoginDates() {
    setUserLastLoginDates({});
    setLoadingLastLoginDates(false);
    // Use setTimeout to ensure state update before calling load
    setTimeout(() => loadLastLoginDatesFn(), 0);
  }

  function getCourseDisplayName(invitedUser) {
    if (invitedUser.courseId && systemGroups && systemGroups.length > 0) {
      let course = null;

      course = systemGroups.find((group) => group.anid === invitedUser.courseId);
      if (course) {
        return course.displayName || course.groupUserName || 'Unknown course';
      }

      if (invitedUser.courseId.startsWith('virtual-course-')) {
        const parts = invitedUser.courseId.split('-');
        if (parts.length >= 5) {
          const courseUserName = parts.slice(4).join('-');
          course = systemGroups.find(
            (group) =>
              group.groupUserName &&
              group.groupUserName.toLowerCase() === courseUserName.toLowerCase()
          );
          if (course) {
            return course.displayName || course.groupUserName || 'Unknown course';
          }
        }
      }
    }

    if (
      invitedUser.officialUser &&
      invitedUser.officialUser.BusinessProfile &&
      invitedUser.officialUser.BusinessProfile.course
    ) {
      return invitedUser.officialUser.BusinessProfile.course;
    }

    return 'Home member';
  }

  async function testUpdateLoginDate(userId) {
    try {
      const retrieveResponse = await userRepository.retrieveUser(userId);
      const currentTimestamp = Date.now();
      const updatedUser = { ...retrieveResponse.data, lastLoginDate: currentTimestamp };
      await userRepository.updateUser({ updatedUser });
      const verifyResponse = await userRepository.retrieveUser(userId);
      return verifyResponse.data;
    } catch (error) {
      console.error(`TEST UPDATE: Error during test:`, error);
      return null;
    }
  }

  function copySignupUrl() {
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
    navigator.clipboard
      .writeText(signupUrl)
      .then(() => {
        // You could add a success notification here if needed
        console.log('Signup URL copied to clipboard:', signupUrl);
      })
      .catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = signupUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      });
  }

  function handleSort(column) {
    let newDirection = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    setSortColumn(column);
    setSortDirection(newDirection);
  }

  function sortUsers(users) {
    if (!sortColumn) {
      return users;
    }

    const sortedUsers = [...users].sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'name':
          aValue = a.officialUser
            ? `${a.officialUser.firstName} ${a.officialUser.lastName}`.toLowerCase()
            : '';
          bValue = b.officialUser
            ? `${b.officialUser.firstName} ${b.officialUser.lastName}`.toLowerCase()
            : '';
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
          aValue = userProjectCounts[a.id] || 0;
          bValue = userProjectCounts[b.id] || 0;
          break;
        case 'registrationStatus':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastLogin':
          aValue = userLastLoginDates[a.id] || 0;
          bValue = userLastLoginDates[b.id] || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedUsers;
  }

  function renderSortIcon(column) {
    if (sortColumn !== column) {
      return null;
    }

    return sortDirection === 'asc' ? (
      <ArrowUpwardIcon fontSize="small" style={{ marginLeft: 4 }} />
    ) : (
      <ArrowDownwardIcon fontSize="small" style={{ marginLeft: 4 }} />
    );
  }

  return (
    <FlexView column width="100%">
      <Divider style={{ marginBottom: 30 }} />
      {/** Invite/Upgrade users section */}
      <Row style={{ marginBottom: 30 }}>
        {/** For regular admins: Show Copy URL button */}
        {!(admin.superAdmin || admin.superGroupAdmin) ? (
          <Col xs={12} md={6} lg={6} style={{ marginBottom: 20 }}>
            <Button
              color="primary"
              variant="outlined"
              className={css(sharedStyles.no_text_transform)}
              onClick={copySignupUrl}
            >
              <FileCopyIcon style={{ marginRight: 10, width: 20, height: 'auto' }} />
              Copy signup URL
            </Button>
          </Col>
        ) : null}
        {/** Invite Multiple Users - available to all admins */}
        <Col xs={12} sm={12} md={12} lg={12}>
          <InviteMultipleUsers />
        </Col>
        {/** For super admins and super group admins: Also show Upgrade User to Admin */}
        {admin.superAdmin || admin.superGroupAdmin ? (
          <Col xs={12} sm={12} md={12} lg={12} style={{ marginTop: 20 }}>
            <UpgradeUserToAdmin />
          </Col>
        ) : null}
      </Row>
      {/** Filters */}
      <Row>
        {/** Registration status */}
        <Col xs={12} sm={12} md={4} lg={3}>
          <FormControl variant="standard" fullWidth>
            <InputLabel>
              <Typography variant="body1" color="primary" align="left">
                Registration status
              </Typography>
            </InputLabel>
            <Select
              variant="standard"
              margin="dense"
              input={<OutlinedInput labelWidth={0} name="filterRegistrationStatus" />}
              style={{ marginTop: 25, width: '100%' }}
              name="filterRegistrationStatus"
              value={filterRegistrationStatus}
              onChange={handleInputChanged}
            >
              <MenuItem value={FILTER_REGISTRATION_STATUS_ALL}> All</MenuItem>
              <MenuItem value={DB_CONST.INVITED_USER_NOT_REGISTERED}>Not registered</MenuItem>
              <MenuItem value={DB_CONST.INVITED_USER_STATUS_ACTIVE}>Active</MenuItem>
            </Select>
          </FormControl>
        </Col>

        {/** User type */}
        <Col xs={12} sm={12} md={4} lg={3}>
          <FormControl variant="standard" fullWidth>
            <InputLabel>
              <Typography variant="body1" color="primary" align="left">
                User type
              </Typography>
            </InputLabel>
            <Select
              variant="standard"
              margin="dense"
              input={<OutlinedInput labelWidth={0} name="filterUserType" />}
              style={{ marginTop: 25, width: '100%' }}
              name="filterUserType"
              value={filterUserType}
              onChange={handleInputChanged}
            >
              <MenuItem value={0}>All</MenuItem>
              <MenuItem value={DB_CONST.TYPE_INVESTOR}>Project viewer</MenuItem>
              <MenuItem value={DB_CONST.TYPE_ISSUER}>Student</MenuItem>
            </Select>
          </FormControl>
        </Col>

        {/** Group members - shown to regular admins and superGroupAdmins */}
        {!admin.superAdmin ? (
          <Col xs={12} sm={12} md={4} lg={3}>
            <FlexView vAlignContent="center">
              <FormControl variant="standard" fullWidth>
                <InputLabel>
                  <Typography variant="body1" color="primary" align="left">
                    Members
                  </Typography>
                </InputLabel>
                <Select
                  variant="standard"
                  margin="dense"
                  input={<OutlinedInput labelWidth={0} name="filterMembers" />}
                  style={{ marginTop: 25, width: '100%' }}
                  name="filterMembers"
                  value={filterMembers}
                  onChange={handleInputChanged}
                >
                  <MenuItem value={FILTER_GROUP_MEMBERS_ALL} key={FILTER_GROUP_MEMBERS_ALL}>
                    All
                  </MenuItem>
                  <MenuItem value={FILTER_HOME_MEMBERS} key={FILTER_HOME_MEMBERS}>
                    Course students
                  </MenuItem>
                  <MenuItem value={FILTER_PLATFORM_MEMBERS} key={FILTER_PLATFORM_MEMBERS}>
                    Platform members
                  </MenuItem>
                </Select>
              </FormControl>

              <FlexView marginLeft={15}>
                <InfoOverlay
                  placement="right"
                  message={
                    'Students are listed with their enrolled course name. Platform members are existing users of Student Showcase who requested access to this university.'
                  }
                />
              </FlexView>
            </FlexView>
          </Col>
        ) : null}

        {/** University filter - only shown to super admins */}
        {admin.superAdmin ? (
          <Col xs={12} sm={12} md={4} lg={3}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>
                <Typography variant="body1" color="primary" align="left">
                  University
                </Typography>
              </InputLabel>
              <Select
                variant="standard"
                margin="dense"
                input={<OutlinedInput labelWidth={0} name="filterGroup" disabled={!groupsLoaded} />}
                style={{ marginTop: 25, width: '100%' }}
                name="filterGroup"
                value={filterGroup}
                onChange={handleInputChanged}
              >
                <MenuItem value="null" key="null">
                  {!groupsLoaded ? 'Loading universities ...' : 'All'}
                </MenuItem>
                {!groupsLoaded
                  ? null
                  : systemGroups
                      .filter((group) => !group.parentGroupId)
                      .map((group) => (
                        <MenuItem value={group.anid} key={group.anid}>
                          {group.displayName}
                        </MenuItem>
                      ))}
              </Select>
            </FormControl>
          </Col>
        ) : null}
      </Row>
      {/** Search email */}
      <Row style={{ marginTop: 30, marginBottom: 30 }}>
        <Col xs={12} sm={12} md={12} lg={8}>
          <FlexView>
            <FlexView basis="90%" vAlignContent="center" hAlignContent="center">
              <TextField
                value={invitedUserSearchText}
                label="Search by email"
                name="invitedUserSearchText"
                fullWidth
                variant="outlined"
                margin="dense"
                onChange={handleInputChanged}
              />
            </FlexView>
            <FlexView hAlignContent="center" vAlignContent="center" basis="10%" marginLeft={10}>
              <IconButton style={{ width: 50, height: 50 }} onClick={toggleSearchMode} size="large">
                {!invitedUsersInSearchMode ? <SearchIcon /> : <CloseIcon />}
              </IconButton>
            </FlexView>
          </FlexView>
        </Col>
      </Row>
      {/** Add members (only investors) from QIB to Silicon Gorge and vice versa */}
      {!admin.superAdmin ? null : systemGroups.findIndex((group) => group.anid === filterGroup) !==
          -1 &&
        (systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
          .groupUserName === 'qib' ||
          systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
            .groupUserName === 'iap-silicon-gorge') ? (
        <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
          <Button
            variant="outlined"
            className={css(sharedStyles.no_text_transform)}
            onClick={
              systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
                .groupUserName === 'qib'
                ? () =>
                    dispatchAddMembersFromOneGroupToAnotherGroup(
                      // from qib
                      systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
                        .anid,
                      // to sg
                      systemGroups[
                        systemGroups.findIndex(
                          (group) => group.groupUserName === 'iap-silicon-gorge'
                        )
                      ].anid
                    )
                : () =>
                    dispatchAddMembersFromOneGroupToAnotherGroup(
                      // from sg
                      systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
                        .anid,
                      // to qib
                      systemGroups[systemGroups.findIndex((group) => group.groupUserName === 'qib')]
                        .anid
                    )
            }
            style={{ marginRight: 10 }}
          >
            {addingMembersFromOneGroupToAnotherGroup
              ? 'Adding ...'
              : systemGroups[systemGroups.findIndex((group) => group.anid === filterGroup)]
                    .groupUserName === 'qib'
                ? 'Add members from QIB to Silicon Gorge'
                : 'Add members from Silicon Gorge to QIB'}
          </Button>
        </FlexView>
      ) : null}
      {/** Export button - only available for admins */}
      {admin.type !== DB_CONST.TYPE_ADMIN ? null : (
        <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
          <Button
            variant="outlined"
            className={css(sharedStyles.no_text_transform)}
            onClick={exportToCsv}
            style={{ marginRight: 10 }}
          >
            {requestingCsv ? 'Exporting ...' : 'Export to csv'}
          </Button>

          <Button
            variant="outlined"
            className={css(sharedStyles.no_text_transform)}
            onClick={refreshLoginDates}
            style={{ marginRight: 10 }}
          >
            {loadingLastLoginDates ? 'Refreshing ...' : 'Refresh Login Dates'}
          </Button>

          <InfoOverlay
            placement="right"
            message={
              admin.superAdmin
                ? 'Export all the users in the system to a .csv file.'
                : 'Export all the members in your university to a .csv file.'
            }
          />
        </FlexView>
      )}
      {renderInvitedUsersTable()}
    </FlexView>
  );

  function renderInvitedUsersTable() {
    return (
      <Paper elevation={0} style={{ width: '100%', overflowX: 'auto', marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>Name</b>
                  </Typography>
                  {renderSortIcon('name')}
                </FlexView>
              </TableCell>
              <TableCell
                colSpan={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('email')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>Email</b>
                  </Typography>
                  {renderSortIcon('email')}
                </FlexView>
              </TableCell>
              {!admin.superAdmin ? null : (
                <TableCell colSpan={2}>
                  <Typography align="left" variant="body2">
                    <b>University</b>
                  </Typography>
                </TableCell>
              )}
              <TableCell
                colSpan={1}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('userType')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>User type</b>
                  </Typography>
                  {renderSortIcon('userType')}
                </FlexView>
              </TableCell>
              <TableCell
                colSpan={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('projectsCreated')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>Projects Created</b>
                  </Typography>
                  {renderSortIcon('projectsCreated')}
                </FlexView>
              </TableCell>
              <TableCell
                colSpan={1}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('registrationStatus')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>Registration status</b>
                  </Typography>
                  {renderSortIcon('registrationStatus')}
                </FlexView>
              </TableCell>
              <TableCell
                colSpan={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('lastLogin')}
              >
                <FlexView vAlignContent="center">
                  <Typography align="left" variant="body2">
                    <b>Last logged in</b>
                  </Typography>
                  {renderSortIcon('lastLogin')}
                </FlexView>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderInvitedUsersRows()}</TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={matchedInvitedUsers.length}
                rowsPerPage={invitedUsersRowsPerPage}
                page={invitedUsersPage}
                backIconButtonProps={{
                  'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page',
                }}
                SelectProps={{
                  native: true,
                }}
                onPageChange={handleChangeTablePage}
                onRowsPerPageChange={handleChangeTableRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    );
  }

  function renderInvitedUsersRows() {
    let renderedInvitedUsers = [];

    if (matchedInvitedUsers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12}>
            <FlexView style={{ margin: 40 }} hAlignContent="center" vAlignContent="center">
              {invitedUsersLoaded ? (
                <Typography variant="h6" align="center">
                  {invitedUsersInSearchMode ||
                  filterRegistrationStatus !== FILTER_REGISTRATION_STATUS_ALL ||
                  filterUserType !== 0 ||
                  filterGroup !== 'null' ||
                  filterMembers !== FILTER_GROUP_MEMBERS_ALL
                    ? 'There are no users found using your current filter criteria.'
                    : 'No users found.'}
                </Typography>
              ) : (
                <HashLoader color={colors.primaryColor} />
              )}
            </FlexView>
          </TableCell>
        </TableRow>
      );
    }

    const matchedUsersInvitedByTheGroup = matchedInvitedUsers.filter(
      (user) => user.hasOwnProperty('invitedDate') && user.invitedDate !== 'none'
    );
    matchedUsersInvitedByTheGroup.sort((user1, user2) => {
      return user2.invitedDate - user1.invitedDate;
    });

    const matchedUsersRequestedToJoin = matchedInvitedUsers.filter(
      (user) => user.hasOwnProperty('invitedDate') && user.invitedDate === 'none'
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
    renderedInvitedUsers = sortUsers(renderedInvitedUsers);

    return !renderedInvitedUsers
      ? null
      : renderedInvitedUsers
          .slice(
            invitedUsersPage * invitedUsersRowsPerPage,
            invitedUsersPage * invitedUsersRowsPerPage + invitedUsersRowsPerPage
          )
          .map((invitedUser) => (
            <TableRow hover key={invitedUser.id}>
              {/** User name */}
              <TableCell colSpan={2}>
                <FlexView column>
                  {/** User name */}
                  {invitedUser.officialUser ? (
                    <NavLink
                      to={
                        invitedUser.hasOwnProperty('officialUserID')
                          ? groupUserName
                            ? ROUTES.EDIT_USER_PROFILE.replace(
                                ':groupUserName',
                                groupUserName
                              ).replace(':userID', invitedUser.officialUserID)
                            : ROUTES.EDIT_USER_PROFILE_INVEST_WEST_SUPER.replace(
                                ':userID',
                                invitedUser.officialUserID
                              )
                          : groupUserName
                            ? ROUTES.USER_PROFILE.replace(':groupUserName', groupUserName).replace(
                                ':userID',
                                invitedUser.id
                              )
                            : ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(
                                ':userID',
                                invitedUser.id
                              )
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
                  {invitedUser.status ===
                  DB_CONST.INVITED_USER_STATUS_ACTIVE ? null : admin.superAdmin || // user can resend the invitation // this check to ensure only the group admin that initally invited this
                    admin.superGroupAdmin ||
                    (!(admin.superAdmin || admin.superGroupAdmin) &&
                      groupProperties &&
                      groupProperties.anid !== invitedUser.invitedBy) ? null : (
                    <FlexView marginTop={10}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        className={css(sharedStyles.no_text_transform)}
                        onClick={() => resendInvite(invitedUser)}
                      >
                        Resend invite
                      </Button>
                    </FlexView>
                  )}

                  {/** Display enrolled course or platform member status - shown to non-super admins */}
                  {admin.superAdmin ? null : (
                    <Typography
                      align="left"
                      variant="body2"
                      color="textSecondary"
                      style={{ marginTop: 15 }}
                    >
                      {invitedUser.hasOwnProperty('invitedDate') &&
                      invitedUser.invitedDate !== 'none'
                        ? getCourseDisplayName(invitedUser)
                        : 'Platform member'}
                    </Typography>
                  )}
                </FlexView>
              </TableCell>

              {/** Email */}
              <TableCell colSpan={2}>
                <FlexView column>
                  <Typography align="left" variant="body2">
                    {invitedUser.email}
                  </Typography>
                </FlexView>
              </TableCell>

              {/** Group the user belongs to - available only for super admins */}
              {!admin.superAdmin ? null : (
                <TableCell colSpan={2}>
                  <FlexView column>
                    <Typography align="left" variant="body2" paragraph>
                      {invitedUser.Invitor.displayName}
                    </Typography>

                    <Typography align="left" variant="body2" color="textSecondary">
                      {invitedUser.hasOwnProperty('invitedDate') &&
                      invitedUser.invitedDate !== 'none'
                        ? getCourseDisplayName(invitedUser)
                        : 'Platform member'}
                    </Typography>
                  </FlexView>
                </TableCell>
              )}

              {/** User type */}
              <TableCell colSpan={1}>
                <Typography align="left" variant="body2">
                  {invitedUser.type === DB_CONST.TYPE_ISSUER ? 'Student' : 'Project viewer'}
                </Typography>
              </TableCell>

              {/** Projects Created */}
              <TableCell colSpan={2}>
                <Typography align="left" variant="body2">
                  {loadingProjectCounts
                    ? 'Loading...'
                    : userProjectCounts.hasOwnProperty(invitedUser.id)
                      ? userProjectCounts[invitedUser.id]
                      : '0'}
                </Typography>
              </TableCell>

              {/** Registration status */}
              <TableCell colSpan={1}>{renderInvitedUserRegistrationStatus(invitedUser)}</TableCell>

              {/** Last logged in */}
              <TableCell colSpan={2}>
                <Typography align="left" variant="body2">
                  {loadingLastLoginDates
                    ? 'Loading...'
                    : userLastLoginDates.hasOwnProperty(invitedUser.id)
                      ? myUtils.dateInReadableFormat(userLastLoginDates[invitedUser.id])
                      : invitedUser.status === DB_CONST.INVITED_USER_STATUS_ACTIVE
                        ? 'Never logged in'
                        : 'Not registered'}
                </Typography>
              </TableCell>
            </TableRow>
          ));
  }

  function renderInvitedUserRegistrationStatus(invitedUser) {
    const msgObj = {
      msg: '',
      color: '',
    };

    switch (invitedUser.status) {
      case DB_CONST.INVITED_USER_NOT_REGISTERED:
        msgObj.msg = 'Not registered';
        msgObj.color = 'error';
        break;
      case DB_CONST.INVITED_USER_STATUS_ACTIVE:
        msgObj.msg = `Current ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? 'project viewer' : 'student'}`;
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
      <Typography align="left" variant="body2" color={msgObj.color}>
        {msgObj.msg}
      </Typography>
    );
  }
}

export default InvitedUsers;
