import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Col, Row } from 'react-bootstrap';
import { css } from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import { UserTitles, HearAbout } from '../../models/user';
import { isAuthenticating } from '../../redux-store/reducers/authenticationReducer';
import { useParams, useNavigate } from 'react-router-dom';
import { createAccount, handleInputFieldChanged, loadInvitedUser } from './SignUpActions';
import { findCourseDisplayNameByUrl } from '../../utils/courseUtils';
import {
  hasErrorCreatingAccount,
  hasErrorLoadingInvitedUser,
  isCreatingAccount,
  isLoadingInvitedUser,
  notFoundInvitedUser,
} from './SignUpReducer';
import { getGroupRouteTheme } from '../../redux-store/reducers/manageGroupUrlReducer';
import { BarLoader } from 'react-spinners';
import Routes from '../../router/routes';
import CustomLink from '../../shared-js-css-styles/CustomLink';
import { TYPE_INVESTOR, TYPE_ISSUER } from '../../firebase/databaseConsts';
import HashLoader from 'react-spinners/HashLoader';
import { hasRegistered } from '../../models/invited_user';
import Footer from '../../shared-components/footer/Footer';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';

const SignUpNew: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const MediaQueryState = useAppSelector((state) => state.MediaQueryState);
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);
  const SignUpLocalState = useAppSelector((state) => state.SignUpLocalState);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // invited user id (optional parameter from the url)
  // if invitedUserId = undefined --> public registration
  const invitedUserId = params.id;

  // Track previous group for componentDidUpdate logic
  const prevGroupRef = useRef(ManageGroupUrlState.group);

  // componentDidMount: load invited user and try to set course from URL
  useEffect(() => {
    if (invitedUserId) {
      dispatch(loadInvitedUser(invitedUserId));
    }

    // Try to set course from URL on mount
    trySetCourseFromUrl(params.courseUserName, ManageGroupUrlState, SignUpLocalState, dispatch);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentDidUpdate: if group just loaded, try to set course from URL
  useEffect(() => {
    if (!prevGroupRef.current && ManageGroupUrlState.group) {
      trySetCourseFromUrl(params.courseUserName, ManageGroupUrlState, SignUpLocalState, dispatch);
    }
    prevGroupRef.current = ManageGroupUrlState.group;
  }, [ManageGroupUrlState.group]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChanged = (event: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(handleInputFieldChanged(event));
  const handleCreateAccount = () => dispatch(createAccount());

  // invited user ID is specified in the url
  if (invitedUserId) {
    // loading invited user
    if (isLoadingInvitedUser(SignUpLocalState)) {
      return (
        <Box>
          <BarLoader
            color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
            width="100%"
            height={4}
          />
        </Box>
      );
    }

    // error loading invited user (network error or not found)
    // OR user has already signed up
    if (
      hasErrorLoadingInvitedUser(SignUpLocalState) ||
      (SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser))
    ) {
      return (
        <Box marginTop="30px" display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6" color="error">
            {
              // invalid invitedUserID
              notFoundInvitedUser(SignUpLocalState)
                ? 'This registration URL is not valid.'
                : // user has already signed up
                  SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)
                  ? 'You have already registered. Please sign in.'
                  : // other error
                    `${SignUpLocalState.errorLoadingInvitedUser?.detail}`
            }
          </Typography>
          <Box height="20px" />
          <Button
            className={css(sharedStyles.no_text_transform)}
            variant="contained"
            color="primary"
            onClick={() => {
              // invalid invitedUserID
              if (notFoundInvitedUser(SignUpLocalState)) {
                navigate(Routes.constructSignUpRoute(ManageGroupUrlState.groupNameFromUrl ?? ''), {
                  replace: true,
                });
                window.location.reload();
                return;
              }

              // user has already signed up
              if (SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)) {
                navigate(Routes.constructSignInRoute(params));
                return;
              }

              // other error
              window.location.reload();
            }}
          >
            {
              // invalid invitedUserID
              notFoundInvitedUser(SignUpLocalState)
                ? 'Go to public registration'
                : // user has already signed up
                  SignUpLocalState.invitedUser && hasRegistered(SignUpLocalState.invitedUser)
                  ? 'Sign in'
                  : // other error
                    'Retry'
            }
          </Button>
        </Box>
      );
    }
  }

  return (
    <Box>
      {/** Sign up card */}
      <Row noGutters>
        <Col
          xs={{ span: 12, offset: 0 }}
          sm={{ span: 12, offset: 0 }}
          md={{ span: 8, offset: 2 }}
          lg={{ span: 4, offset: 4 }}
        >
          <Box
            display="flex"
            width="100%"
            justifyContent="center"
            paddingX={MediaQueryState.isMobile ? '10px' : '0px'}
            paddingY={MediaQueryState.isMobile ? '20px' : '60px'}
          >
            <Paper
              elevation={0}
              square
              className={css(sharedStyles.kick_starter_border_box)}
              style={{
                width: 650,
                padding: MediaQueryState.isMobile ? 20 : 30,
              }}
            >
              <Typography align="center" variant="h5" color="primary">
                {`Welcome to ${ManageGroupUrlState.group?.displayName}`}
              </Typography>

              <Box height="20px" />

              {/** Hash loader */}
              {isCreatingAccount(SignUpLocalState) || isAuthenticating(AuthenticationState) ? (
                <Box display="flex" marginY="20px" justifyContent="center">
                  <HashLoader
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                  />
                </Box>
              ) : null}

              {/** Error message */}
              {!hasErrorCreatingAccount(SignUpLocalState) ? (
                <Box marginY="20px">
                  <Typography align="center" variant="body1" color="error">
                    {SignUpLocalState.errorCreatingAccount?.detail}
                  </Typography>
                </Box>
              ) : null}

              {/** User type */}
              <FormControl
                variant="standard"
                required
                fullWidth
                disabled={invitedUserId !== undefined}
              >
                <InputLabel>
                  <Typography variant="body1" color="primary">
                    What would you like to do?
                  </Typography>
                </InputLabel>
                <Select
                  variant="standard"
                  name="userType"
                  value={SignUpLocalState.userType}
                  // @ts-ignore
                  onChange={handleFieldChanged}
                  margin="dense"
                  style={{
                    marginTop: 25,
                  }}
                >
                  <MenuItem key="-1" value={-1}>
                    Please select
                  </MenuItem>
                  <MenuItem key={TYPE_ISSUER} value={TYPE_ISSUER}>
                    Add student project
                  </MenuItem>
                  <MenuItem key={TYPE_INVESTOR} value={TYPE_INVESTOR}>
                    View student projects
                  </MenuItem>
                </Select>
              </FormControl>

              <Box height="30px" />

              {/** Title */}
              <FormControl variant="standard" required fullWidth>
                <InputLabel>
                  <Typography variant="body1" color="primary">
                    Title
                  </Typography>
                </InputLabel>
                <Select
                  variant="standard"
                  name="title"
                  value={SignUpLocalState.title}
                  // @ts-ignore
                  onChange={handleFieldChanged}
                  margin="dense"
                  style={{
                    marginTop: 25,
                  }}
                >
                  <MenuItem key="-1" value="-1">
                    Please select
                  </MenuItem>
                  {UserTitles.map((title, index) => (
                    <MenuItem key={index} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box height="25px" />

              {/** Names */}
              <Box marginBottom="18px">
                {/** First name */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="First name"
                    name="firstName"
                    value={SignUpLocalState.firstName}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    onChange={handleFieldChanged}
                  />
                </FormControl>

                {/** Last name */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Last name"
                    name="lastName"
                    value={SignUpLocalState.lastName}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    onChange={handleFieldChanged}
                  />
                </FormControl>
              </Box>

              {/** Emails */}
              <Box marginBottom="18px">
                {/** Email */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Email"
                    name="email"
                    value={SignUpLocalState.email}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    disabled={invitedUserId !== undefined}
                    onChange={handleFieldChanged}
                  />
                </FormControl>

                {/** Confirmed email */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Re-enter email"
                    name="confirmedEmail"
                    value={SignUpLocalState.confirmedEmail}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    onChange={handleFieldChanged}
                  />
                </FormControl>
              </Box>

              {/** Passwords */}
              <Box>
                {/** Password */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Password"
                    name="password"
                    value={SignUpLocalState.password}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    type="password"
                    onChange={handleFieldChanged}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                </FormControl>

                {/** Confirmed password */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Confirm password"
                    name="confirmedPassword"
                    value={SignUpLocalState.confirmedPassword}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    type="password"
                    onChange={handleFieldChanged}
                  />
                </FormControl>

                {/** Password length validation feedback */}
                {(isPasswordFocused || SignUpLocalState.password.length > 0) && (
                  <Box marginTop="8px">
                    <Typography
                      variant="body2"
                      style={{
                        color:
                          SignUpLocalState.password.length >= 10
                            ? getGroupRouteTheme(ManageGroupUrlState).palette.success?.main ||
                              '#4caf50'
                            : getGroupRouteTheme(ManageGroupUrlState).palette.error?.main ||
                              '#f44336',
                      }}
                    >
                      Password must be at least 10 characters ({SignUpLocalState.password.length}
                      /10)
                    </Typography>
                  </Box>
                )}

                {/** How did you hear about us */}
                <Box marginTop="28px" />
                <FormControl variant="standard" fullWidth>
                  <InputLabel>
                    <Typography variant="body1" color="primary">
                      How did you hear about us?
                    </Typography>
                  </InputLabel>
                  <Select
                    variant="standard"
                    name="discover"
                    value={SignUpLocalState.discover}
                    // @ts-ignore
                    onChange={handleFieldChanged}
                    margin="dense"
                    style={{
                      marginTop: 25,
                    }}
                  >
                    <MenuItem key="-1" value="-1">
                      Please select
                    </MenuItem>
                    {HearAbout.map((discover, index) => (
                      <MenuItem key={index} value={discover}>
                        {discover}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/** Marketing preferences checkbox */}
              <Box marginTop="28px">
                <FormControl variant="standard">
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Checkbox
                      name="acceptMarketingPreferences"
                      color="primary"
                      checked={SignUpLocalState.acceptMarketingPreferences}
                      onChange={handleFieldChanged}
                    />
                    <Typography variant="body1">
                      Accept&nbsp;
                      <CustomLink
                        url={Routes.nonGroupMarketingPreferences}
                        target="_blank"
                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                        activeColor="none"
                        activeUnderline
                        component="a"
                        childComponent={'marketing preferences'}
                      />
                      .
                    </Typography>
                  </Box>
                </FormControl>
              </Box>

              {/** T&Cs */}
              <Box marginTop="25px">
                <Typography variant="body1" align="center">
                  By signing up, you agree to our&nbsp;
                  <CustomLink
                    url={Routes.nonGroupTermsOfUse}
                    target="_blank"
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                    activeColor="none"
                    activeUnderline
                    component="a"
                    childComponent={'Terms of use'}
                  />
                  &nbsp;and&nbsp;
                  <CustomLink
                    url={Routes.nonGroupPrivacyPolicy}
                    target="_blank"
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                    activeColor="none"
                    activeUnderline
                    component="a"
                    childComponent={'Privacy policy'}
                  />
                  .
                </Typography>
              </Box>

              {/** Create Account button */}
              <Box marginTop="40px" display="flex" justifyContent="center">
                <Button
                  className={css(sharedStyles.no_text_transform)}
                  color="primary"
                  variant="contained"
                  disabled={
                    SignUpLocalState.userType === -1 ||
                    SignUpLocalState.title === '-1' ||
                    SignUpLocalState.firstName.trim().length === 0 ||
                    SignUpLocalState.lastName.trim().length === 0 ||
                    SignUpLocalState.email.trim().length === 0 ||
                    SignUpLocalState.confirmedEmail.trim().length === 0 ||
                    SignUpLocalState.password.trim().length === 0 ||
                    SignUpLocalState.confirmedPassword.trim().length === 0
                  }
                  onClick={() => handleCreateAccount()}
                >
                  Create account
                </Button>
              </Box>

              {/** Error message */}
              {hasErrorCreatingAccount(SignUpLocalState) && (
                <Box marginTop="16px" display="flex" justifyContent="center">
                  <Typography variant="body2" color="error" align="center">
                    {SignUpLocalState.errorCreatingAccount?.detail.includes('email') ||
                    SignUpLocalState.errorCreatingAccount?.detail.includes('already') ||
                    SignUpLocalState.errorCreatingAccount?.detail.includes('used') ||
                    SignUpLocalState.errorCreatingAccount?.detail.includes('exists')
                      ? 'Email address is already being used'
                      : SignUpLocalState.errorCreatingAccount?.detail}
                  </Typography>
                </Box>
              )}

              {/** Sign in if have an account */}
              <Box marginTop="20px">
                <Typography variant="body2" align="center">
                  Already have an Student Showcase account?&nbsp;
                  <CustomLink
                    url={Routes.constructSignInRoute(params)}
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                    activeColor="none"
                    activeUnderline
                    component="nav-link"
                    childComponent={'Sign in'}
                  />
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Col>
      </Row>
      {/** Footer */}
      <Row noGutters>
        <Col xs={12} sm={12} md={12} lg={12}>
          <Footer />
        </Col>
      </Row>
    </Box>
  );
};

export default SignUpNew;

/**
 * Tries to auto-select the course from the URL parameter.
 */
function trySetCourseFromUrl(
  courseUserName: string | undefined,
  ManageGroupUrlState: { group?: { settings?: { availableCourses?: any[] } } | null },
  SignUpLocalState: { course: string },
  dispatch: ReturnType<typeof useAppDispatch>
) {
  // Don't override if user has already selected a course
  if (SignUpLocalState.course !== '-1') {
    return;
  }

  if (courseUserName && (ManageGroupUrlState.group as any)?.settings?.availableCourses) {
    const courseDisplayName = findCourseDisplayNameByUrl(
      courseUserName,
      (ManageGroupUrlState.group as any).settings.availableCourses
    );

    if (courseDisplayName) {
      // Simulate an input field change to set the course
      const mockEvent = {
        target: {
          name: 'course',
          value: courseDisplayName,
          type: 'select',
          checked: false,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      dispatch(handleInputFieldChanged(mockEvent));
    }
  }
}
