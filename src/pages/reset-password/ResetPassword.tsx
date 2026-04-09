import React, { useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { css } from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import queryString from 'query-string';
import { confirmPasswordReset, onTextChanged, verifyCode } from './ResetPasswordActions';
import {
  hasErrorResettingPassword,
  hasErrorVerifyingCode,
  isResettingPassword,
  isVerifyingCode,
  successfullyResettingPassword,
} from './ResetPasswordReducer';
import { HashLoader } from 'react-spinners';
import { getGroupRouteTheme } from '../../redux-store/reducers/manageGroupUrlReducer';
import Routes from '../../router/routes';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const ManageGroupUrlState = useAppSelector((state) => state.ManageGroupUrlState);
  const MediaQueryState = useAppSelector((state) => state.MediaQueryState);
  const ResetPasswordLocalState = useAppSelector((state) => state.ResetPasswordLocalState);

  useEffect(() => {
    const params = queryString.parse(location.search);
    if (params.oobCode) {
      const actionCode: string | string[] | null | undefined = params.oobCode;
      if (actionCode) {
        dispatch(verifyCode(actionCode as string));
      } else {
        dispatch(verifyCode(null));
      }
    } else {
      dispatch(verifyCode(null));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // verifying code
  if (isVerifyingCode(ResetPasswordLocalState)) {
    return (
      <Box display="flex" justifyContent="center" marginTop="50px">
        <HashLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
      </Box>
    );
  }

  // failed to verify code
  if (hasErrorVerifyingCode(ResetPasswordLocalState)) {
    return <Navigate to={Routes.error404} replace />;
  }

  // password has been successfully updated
  if (successfullyResettingPassword(ResetPasswordLocalState)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" marginTop="50px">
        <Typography variant="h5" color="primary" align="center">
          Your password has been updated.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      paddingX={MediaQueryState.isMobile ? '18px' : '0px'}
      paddingY={MediaQueryState.isMobile ? '30px' : '60px'}
    >
      <Row noGutters>
        <Col xs={12} sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Box>
            <Typography variant="h4" align="left">
              Reset Password
            </Typography>
            <Box height="40px" />
            <TextField
              required
              fullWidth
              variant="outlined"
              label="Password"
              name="password"
              type="password"
              onChange={(event) => dispatch(onTextChanged(event))}
            />
            <Box height="25px" />
            <TextField
              required
              fullWidth
              variant="outlined"
              label="Confirm Password"
              name="confirmedPassword"
              type="password"
              onChange={(event) => dispatch(onTextChanged(event))}
            />
            <Box height="25px" />
            {!hasErrorResettingPassword(ResetPasswordLocalState) ? null : (
              <Box
                width="100%"
                bgcolor="error.main"
                padding="15px"
                marginBottom="20px"
                color="white"
              >
                <Typography variant="body1" align="left">
                  {ResetPasswordLocalState.errorResettingPassword?.detail}
                </Typography>
              </Box>
            )}
            {!isResettingPassword(ResetPasswordLocalState) ? null : (
              <Box display="flex" justifyContent="center" marginBottom="20px">
                <HashLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
              </Box>
            )}
            <Box height="25px" />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                className={css(sharedStyles.no_text_transform)}
                color="primary"
                size="large"
                onClick={() => dispatch(confirmPasswordReset())}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Col>
      </Row>
    </Box>
  );
};

export default ResetPassword;
