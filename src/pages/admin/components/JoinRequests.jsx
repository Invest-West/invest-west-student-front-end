import React, { useEffect, useRef } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  Typography,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Table,
  InputBase,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlexView from 'react-flexview';
import { NavLink } from 'react-router-dom';
import { css } from 'aphrodite';
import { HashLoader } from 'react-spinners';

import { useAppSelector, useAppDispatch } from '../../../redux-store/hooks';
import * as manageJoinRequestsActions from '../../../redux-store/actions/manageJoinRequestsActions';

import sharedStyles, { StyledTableCell } from '../../../shared-js-css-styles/SharedStyles';
import * as colors from '../../../values/colors';
import * as ROUTES from '../../../router/routes';
import * as myUtils from '../../../utils/utils';

const JoinRequests = () => {
  const dispatch = useAppDispatch();
  const groupUserName = useAppSelector((state) => state.manageGroupFromParams.groupUserName);
  const groupProperties = useAppSelector((state) => state.manageGroupFromParams.groupProperties);
  const groupPropertiesLoaded = useAppSelector(
    (state) => state.manageGroupFromParams.groupPropertiesLoaded
  );
  const shouldLoadOtherData = useAppSelector(
    (state) => state.manageGroupFromParams.shouldLoadOtherData
  );
  const user = useAppSelector((state) => state.auth.user);
  const joinRequests = useAppSelector((state) => state.manageJoinRequests.joinRequests);
  const loadingJoinRequests = useAppSelector(
    (state) => state.manageJoinRequests.loadingJoinRequests
  );
  const joinRequestsLoaded = useAppSelector((state) => state.manageJoinRequests.joinRequestsLoaded);
  const searchText = useAppSelector((state) => state.manageJoinRequests.searchText);
  const inSearchMode = useAppSelector((state) => state.manageJoinRequests.inSearchMode);
  const matchedJoinRequests = useAppSelector(
    (state) => state.manageJoinRequests.matchedJoinRequests
  );
  const page = useAppSelector((state) => state.manageJoinRequests.page);
  const rowsPerPage = useAppSelector((state) => state.manageJoinRequests.rowsPerPage);

  const prevShouldLoadRef = useRef(shouldLoadOtherData);
  const prevUserRef = useRef(user);

  // Initial load
  useEffect(() => {
    if (shouldLoadOtherData && user && !loadingJoinRequests && !joinRequestsLoaded) {
      dispatch(manageJoinRequestsActions.loadJoinRequests());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach listener when join requests are loaded
  useEffect(() => {
    if (shouldLoadOtherData && joinRequests && joinRequestsLoaded) {
      dispatch(manageJoinRequestsActions.startListeningForJoinRequestsChanged());
    }
  }, [joinRequestsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle prop changes (componentDidUpdate logic)
  useEffect(() => {
    if (!user || !shouldLoadOtherData) {
      dispatch(manageJoinRequestsActions.stopListeningForJoinRequestsChanged());
      prevShouldLoadRef.current = shouldLoadOtherData;
      prevUserRef.current = user;
      return;
    }

    // Only re-load if shouldLoadOtherData or user changed
    if (prevShouldLoadRef.current !== shouldLoadOtherData || prevUserRef.current !== user) {
      if (!loadingJoinRequests && !joinRequestsLoaded) {
        dispatch(manageJoinRequestsActions.loadJoinRequests());
      }
      if (joinRequests && joinRequestsLoaded) {
        dispatch(manageJoinRequestsActions.startListeningForJoinRequestsChanged());
      }
    }

    prevShouldLoadRef.current = shouldLoadOtherData;
    prevUserRef.current = user;
  }, [shouldLoadOtherData, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadJoinRequests = () => dispatch(manageJoinRequestsActions.loadJoinRequests());
  const handleToggleSearchMode = () => dispatch(manageJoinRequestsActions.toggleSearchMode());
  const handleChangePage = (event, newPage) =>
    dispatch(manageJoinRequestsActions.changePage(event, newPage));
  const handleChangeRowsPerPage = (event) =>
    dispatch(manageJoinRequestsActions.changeRowsPerPage(event));
  const handleInputChanged = (event) =>
    dispatch(manageJoinRequestsActions.handleJoinRequestsTableInputChanged(event));
  const handleAcceptJoinRequest = (request) =>
    dispatch(manageJoinRequestsActions.acceptJoinRequest(request));
  const handleRejectJoinRequest = (request) =>
    dispatch(manageJoinRequestsActions.rejectJoinRequest(request));

  if (!groupPropertiesLoaded || !user) {
    return null;
  }

  // sort join requests by request date (recent requests come first)
  const sortedJoinRequests = [...joinRequests].sort((a, b) => b.requestedDate - a.requestedDate);

  const renderJoinRequestsRows = () => {
    const renderedJoinRequests = inSearchMode ? matchedJoinRequests : sortedJoinRequests;

    if (renderedJoinRequests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <FlexView style={{ margin: 40 }} hAlignContent="center" vAlignContent="center">
              {joinRequestsLoaded ? (
                <Typography variant="h6" align="center">
                  {inSearchMode
                    ? "Can't find any access request with this email."
                    : 'No access requests yet.'}
                </Typography>
              ) : (
                <HashLoader
                  color={
                    !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor
                  }
                />
              )}
            </FlexView>
          </TableCell>
        </TableRow>
      );
    }

    return renderedJoinRequests
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((joinRequest) => (
        <TableRow key={joinRequest.id} hover>
          <TableCell colSpan={2}>
            <FlexView column>
              <NavLink
                to={
                  groupUserName
                    ? `${ROUTES.USER_PROFILE.replace(':groupUserName', groupUserName).replace(':userID', joinRequest.userID)}`
                    : `${ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(':userID', joinRequest.userID)}`
                }
                className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
              >
                <Typography align="left" variant="body1" color="primary">
                  {`${joinRequest.userProfile.title} ${joinRequest.userProfile.firstName} ${joinRequest.userProfile.lastName}`}
                </Typography>
              </NavLink>
            </FlexView>
          </TableCell>
          <TableCell colSpan={1}>
            <Typography align="left" variant="body1">
              {joinRequest.userProfile.email}
            </Typography>
          </TableCell>
          <TableCell colSpan={1}>
            <Typography align="left" variant="body1">
              {myUtils.dateInReadableFormat(joinRequest.requestedDate)}
            </Typography>
          </TableCell>
          <TableCell colSpan={1}>
            <FlexView>
              <Button
                variant="outlined"
                className={css(sharedStyles.no_text_transform)}
                color="secondary"
                onClick={() => handleRejectJoinRequest(joinRequest)}
                style={{ marginRight: 6 }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                className={css(sharedStyles.no_text_transform)}
                color="primary"
                onClick={() => handleAcceptJoinRequest(joinRequest)}
                style={{ marginLeft: 6 }}
              >
                Accept
              </Button>
            </FlexView>
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <Paper elevation={1} style={{ width: '100%', overflowX: 'auto', marginTop: 20 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell
              colSpan={3}
              cellColor={colors.blue_gray_50}
              component={
                <InputBase
                  name="searchText"
                  value={searchText}
                  onChange={handleInputChanged}
                  fullWidth
                  placeholder="Search access request by email"
                  type="text"
                  startAdornment={
                    <InputAdornment position="start">
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        flip
                        placement="bottom"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            {inSearchMode ? 'Exit search mode' : 'Enter search mode'}
                          </Tooltip>
                        }
                      >
                        <IconButton onClick={handleToggleSearchMode} size="large">
                          {inSearchMode ? <CloseIcon /> : <SearchIcon />}
                        </IconButton>
                      </OverlayTrigger>
                    </InputAdornment>
                  }
                />
              }
            />
            <StyledTableCell
              colSpan={2}
              cellColor={colors.blue_gray_50}
              component={
                <FlexView hAlignContent="right" vAlignContent="center">
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    flip
                    placement="bottom"
                    overlay={<Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>}
                  >
                    <IconButton
                      onClick={handleLoadJoinRequests}
                      style={{ marginLeft: 10 }}
                      size="large"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </OverlayTrigger>
                </FlexView>
              }
            />
          </TableRow>
          <TableRow>
            <StyledTableCell
              colSpan={2}
              cellColor={
                !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor
              }
              textColor={colors.white}
              component={
                <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>
                  User&apos;s name
                </Typography>
              }
            />
            <StyledTableCell
              colSpan={1}
              cellColor={
                !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor
              }
              textColor={colors.white}
              component={
                <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>
                  Email
                </Typography>
              }
            />
            <StyledTableCell
              colSpan={1}
              cellColor={
                !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor
              }
              textColor={colors.white}
              component={
                <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>
                  Requested date
                </Typography>
              }
            />
            <StyledTableCell
              colSpan={1}
              cellColor={
                !groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor
              }
              textColor={colors.white}
              component={
                <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>
                  Action
                </Typography>
              }
            />
          </TableRow>
        </TableHead>
        <TableBody>{renderJoinRequestsRows()}</TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              colSpan={5}
              count={sortedJoinRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{ 'aria-label': 'Previous Page' }}
              nextIconButtonProps={{ 'aria-label': 'Next Page' }}
              SelectProps={{ native: true }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </Paper>
  );
};

export default JoinRequests;
