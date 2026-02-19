import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
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
import { useParams, useNavigate } from 'react-router-dom';
import HashLoader from 'react-spinners/HashLoader';
import { BarLoader } from 'react-spinners';
import firebase from '../../firebase/firebaseApp';

import {
  validateCourseAdminInvite,
  completeCourseAdminSignup,
  clearCourseAdminInviteState,
} from '../../redux-store/actions/courseAdminInviteActions';
import {
  isValidatingInvite,
  isCompletingSignup,
} from '../../redux-store/reducers/courseAdminInviteReducer';
import Footer from '../../shared-components/footer/Footer';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';

/**
 * Valid titles for course admin
 */
const VALID_TITLES = ['Mr', 'Miss', 'Mrs', 'Ms', 'Dr', 'Prof', 'Other'];

const CourseAdminSignup: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const MediaQueryState = useAppSelector((state) => state.MediaQueryState);
  const CourseAdminInviteLocalState = useAppSelector((state) => state.CourseAdminInviteLocalState);

  const [token] = useState(params.token || '');
  const [title, setTitle] = useState('-1');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const prevSignupResultRef = useRef(CourseAdminInviteLocalState.signupResult);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      dispatch(validateCourseAdminInvite(token));
    }
    return () => {
      dispatch(clearCourseAdminInviteState());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle redirect after successful signup
  useEffect(() => {
    const prevResult = prevSignupResultRef.current;
    const currentResult = CourseAdminInviteLocalState.signupResult;
    prevSignupResultRef.current = currentResult;

    if (!prevResult && currentResult?.success) {
      if (currentResult.customToken) {
        firebase
          .auth()
          .signInWithCustomToken(currentResult.customToken)
          .then(() => {
            if (currentResult.redirectTo) {
              navigate(currentResult.redirectTo);
            }
          })
          .catch(() => {
            if (currentResult.redirectTo) {
              navigate(currentResult.redirectTo);
            }
          });
      } else if (currentResult.redirectTo) {
        navigate(currentResult.redirectTo);
      }
    }
  }, [CourseAdminInviteLocalState.signupResult, navigate]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const name = event.target.name;
    const value = event.target.value as string;
    if (!name) return;

    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmedPassword':
        setConfirmedPassword(value);
        break;
    }
  };

  const handleCreateAccount = async () => {
    await dispatch(
      completeCourseAdminSignup({
        token,
        title,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      })
    );
  };

  // No token provided
  if (!token) {
    return renderError(
      'No invitation token provided',
      'Please use the link from your invitation email.'
    );
  }

  // Validating token
  if (isValidatingInvite(CourseAdminInviteLocalState)) {
    return (
      <Box>
        <BarLoader color="#1976d2" width="100%" height={4} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6" color="textSecondary">
            Validating your invitation...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Invalid token
  if (
    !CourseAdminInviteLocalState.validatingInvite &&
    !CourseAdminInviteLocalState.inviteValid &&
    CourseAdminInviteLocalState.inviteError
  ) {
    return renderError(
      'Invalid Invitation',
      CourseAdminInviteLocalState.inviteError ||
        'This invitation link is invalid or has expired. Please contact the administrator for a new invitation.'
    );
  }

  // Valid token - show signup form
  if (CourseAdminInviteLocalState.inviteValid && CourseAdminInviteLocalState.inviteData) {
    const inviteData = CourseAdminInviteLocalState.inviteData;
    const isFormDisabled = isCompletingSignup(CourseAdminInviteLocalState);
    const isFormComplete =
      title !== '-1' &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      password.length >= 8 &&
      password === confirmedPassword;

    return (
      <Box>
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
                {/* Header */}
                <Typography align="center" variant="h5" color="primary">
                  Welcome to {inviteData?.universityName}
                </Typography>

                <Box height="10px" />

                <Typography align="center" variant="body2" color="textSecondary">
                  Complete your registration to become{' '}
                  {inviteData?.role === 'admin' ? 'an administrator' : 'a lecturer'} for{' '}
                  {inviteData?.courseName}
                </Typography>

                <Box height="30px" />

                {/* Loading spinner */}
                {isCompletingSignup(CourseAdminInviteLocalState) && (
                  <Box display="flex" marginY="20px" justifyContent="center">
                    <HashLoader color="#1976d2" />
                  </Box>
                )}

                {/* Success message */}
                {CourseAdminInviteLocalState.signupResult?.success && (
                  <Box marginY="20px">
                    <Typography align="center" variant="body1" style={{ color: '#4caf50' }}>
                      Account created successfully! Redirecting...
                    </Typography>
                  </Box>
                )}

                {/* Error message */}
                {CourseAdminInviteLocalState.signupError && (
                  <Box marginY="20px">
                    <Typography align="center" variant="body1" color="error">
                      {CourseAdminInviteLocalState.signupError}
                    </Typography>
                  </Box>
                )}

                {/* Email (read-only) */}
                <FormControl variant="standard" fullWidth>
                  <TextField
                    label="Email"
                    value={inviteData?.email || ''}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    disabled
                    helperText="This is the email address from your invitation"
                  />
                </FormControl>

                <Box height="20px" />

                {/* Title */}
                <FormControl variant="standard" required fullWidth disabled={isFormDisabled}>
                  <InputLabel>
                    <Typography variant="body1" color="primary">
                      Title
                    </Typography>
                  </InputLabel>
                  <Select
                    variant="standard"
                    name="title"
                    value={title}
                    // @ts-ignore
                    onChange={handleInputChange}
                    margin="dense"
                    style={{ marginTop: 25 }}
                  >
                    <MenuItem key="-1" value="-1">
                      Please select
                    </MenuItem>
                    {VALID_TITLES.map((t, index) => (
                      <MenuItem key={index} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box height="20px" />

                {/* First Name */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="First name"
                    name="firstName"
                    value={firstName}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    disabled={isFormDisabled}
                    onChange={handleInputChange}
                  />
                </FormControl>

                {/* Last Name */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Last name"
                    name="lastName"
                    value={lastName}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    disabled={isFormDisabled}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <Box height="20px" />

                {/* Password */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Password"
                    name="password"
                    value={password}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    type="password"
                    disabled={isFormDisabled}
                    onChange={handleInputChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                </FormControl>

                {/* Confirmed Password */}
                <FormControl variant="standard" required fullWidth>
                  <TextField
                    required
                    label="Confirm password"
                    name="confirmedPassword"
                    value={confirmedPassword}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    type="password"
                    disabled={isFormDisabled}
                    onChange={handleInputChange}
                  />
                </FormControl>

                {/* Password validation feedback */}
                {(isPasswordFocused || password.length > 0) && (
                  <Box marginTop="8px">
                    <Typography
                      variant="body2"
                      style={{
                        color: password.length >= 8 ? '#4caf50' : '#f44336',
                      }}
                    >
                      Password must be at least 8 characters ({password.length}/8)
                    </Typography>
                  </Box>
                )}

                {/* Password match feedback */}
                {confirmedPassword.length > 0 && (
                  <Box marginTop="4px">
                    <Typography
                      variant="body2"
                      style={{
                        color: password === confirmedPassword ? '#4caf50' : '#f44336',
                      }}
                    >
                      {password === confirmedPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </Typography>
                  </Box>
                )}

                {/* Create Account button */}
                <Box marginTop="40px" display="flex" justifyContent="center">
                  <Button
                    className={css(sharedStyles.no_text_transform)}
                    color="primary"
                    variant="contained"
                    disabled={!isFormComplete || isFormDisabled}
                    onClick={handleCreateAccount}
                  >
                    Create Account
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Col>
        </Row>
        {/* Footer */}
        <Row noGutters>
          <Col xs={12} sm={12} md={12} lg={12}>
            <Footer />
          </Col>
        </Row>
      </Box>
    );
  }

  // Fallback loading state
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <HashLoader color="#1976d2" />
    </Box>
  );
};

function renderError(title: string, message: string) {
  return (
    <Box marginTop="60px" display="flex" flexDirection="column" alignItems="center" paddingX="20px">
      <Typography variant="h5" color="error" align="center">
        {title}
      </Typography>
      <Box height="20px" />
      <Typography variant="body1" color="textSecondary" align="center">
        {message}
      </Typography>
      <Box height="30px" />
      <Button
        className={css(sharedStyles.no_text_transform)}
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </Box>
  );
}

export default CourseAdminSignup;
