import React, {Component, FormEvent} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {AnyAction} from "redux";
import {ThunkDispatch} from "redux-thunk";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from "@material-ui/core";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {Col, Row} from "react-bootstrap";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Visibility from "@material-ui/icons/Visibility";
import Routes from "../../router/routes";
import ExploreOffers from "../../shared-components/explore-offers/ExploreOffers";
import {
    errorSendingResetPassword,
    isProcessingResetPasswordRequest,
    SignInState,
    successfullySentResetPassword
} from "./SignInReducer";
import {
    onSendResetPasswordClick,
    onSignInClick,
    onTextChanged,
    togglePasswordVisibility,
    toggleResetPasswordDialog
} from "./SignInActions";
import {
    AuthenticationState,
    hasAuthenticationError,
    isAuthenticating
} from "../../redux-store/reducers/authenticationReducer";
import HashLoader from "react-spinners/HashLoader";
import * as appColors from "../../values/colors";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {Close} from "@material-ui/icons";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Footer from "../../shared-components/footer/Footer";
import '../../shared-js-css-styles/sharedStyles.scss';

interface SignInProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    MediaQueryState: MediaQueryState;
    SignInLocalState: SignInState;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    togglePasswordVisibility: () => any;
    onSignInClick: (event: FormEvent) => any;
    toggleResetPasswordDialog: () => any;
    onSendResetPasswordClick: (email: string) => () => Promise<void>;
  }
  
  

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        MediaQueryState: state.MediaQueryState,
        SignInLocalState: state.SignInLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        togglePasswordVisibility: () => dispatch(togglePasswordVisibility()),
        onSignInClick: (event: FormEvent) => dispatch(onSignInClick(event)),
        toggleResetPasswordDialog: () => dispatch(toggleResetPasswordDialog()),
        onSendResetPasswordClick: (email: string) => dispatch(onSendResetPasswordClick(email))
    }
}

class SignInNew extends Component<SignInProps & Readonly<RouteComponentProps<RouteParams>>, {}> {
          
    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            MediaQueryState,
            SignInLocalState,
            onTextChanged,
            onSignInClick,
            togglePasswordVisibility,
            toggleResetPasswordDialog
        } = this.props;

        return <Box>
            <Row noGutters >
                <Col xs={{span: 12, offset: 0}} md={{span: 6, offset: 3}} lg={{span: 6, offset: 3}} >
                    <Box display="flex" width="100%" justifyContent="center" paddingX={MediaQueryState.isMobile ? "10px" : "0px"} paddingY={MediaQueryState.isMobile ? "20px" : "60px"} >
                        {/** Sign in card container */}
                        <Paper elevation={0} square className={css(sharedStyles.kick_starter_border_box)} style={{ width: 650, padding: MediaQueryState.isMobile ? 20 : 30 }} >
                            {/** Sign in card header */}
                            <Box display="flex" flexDirection="column" marginBottom="35px" >
                                <Typography variant="h4" align="center" paragraph color="primary">Sign in to your account</Typography>
                                <Typography variant="body1" align="center">Connecting businesses and investors across the South West of England</Typography>
                            </Box>

                            {/** Display message to inform the user that the reset password email
                             has been successfully sent */}
                            {
                                !successfullySentResetPassword(SignInLocalState)
                                    ? null
                                    : <Box marginBottom="35px" color="white" bgcolor={appColors.dark_green} padding="15px" >
                                        <Typography variant="body1" align="left">An email with password reset instructions has been sent to your email address.</Typography>
                                    </Box>
                            }

                            {/** Signin error */}
                            {
                                !hasAuthenticationError(AuthenticationState)
                                    ? null
                                    : <Box marginBottom="35px" padding="15px" color="white" bgcolor="error.main" >
                                        <Typography variant="body1" align="left">
                                       {/** {AuthenticationState.error?.detail} */}
                                       Error: Username or password not recognised
                                        </Typography>
                                    </Box>
                            }

                            {/** Sign in form */}
                            <form onSubmit={onSignInClick}>
                                <Box display="flex" flexDirection="column" >
                                    {/** Email field */}
                                    <FormControl>
                                        <TextField label="Email address" name="signInEmail" value={SignInLocalState.signInEmail} margin="normal" variant="outlined" error={SignInLocalState.errorSignInEmail} onChange={onTextChanged} />
                                    </FormControl>

                                    {/** Password field */}
                                    <FormControl>
                                        <TextField
                                            label="Password"
                                            name="signInPassword"
                                            type={SignInLocalState.showPassword ? "text" : "password"}
                                            margin="normal"
                                            variant="outlined"
                                            error={SignInLocalState.errorSignInPassword}
                                            onChange={onTextChanged}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" >
                                                        <IconButton edge="end" aria-label="Toggle password visibility" onClick={togglePasswordVisibility} >
                                                            {
                                                                SignInLocalState.showPassword
                                                                    ?
                                                                    <VisibilityOff/>
                                                                    :
                                                                    <Visibility/>
                                                            }
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </FormControl>
                                    <Box marginTop="35px" marginBottom="45px" >
                                        <Typography variant="body1" align="center" >
                                            By clicking Sign In, you agree to our&nbsp;
                                            <CustomLink url={Routes.nonGroupTermsOfUse} target="_blank" color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} activeColor="none" activeUnderline component="nav-link" childComponent={ "Terms of use" } />
                                            &nbsp;and&nbsp;
                                            <CustomLink url={Routes.nonGroupPrivacyPolicy} target="_blank" color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} activeColor="none" activeUnderline component="nav-link" childComponent={ "Privacy policy" } />
                                            .
                                        </Typography>
                                    </Box>

                                    {
                                        !isAuthenticating(AuthenticationState)
                                            ? null
                                            : <Box display="flex" marginBottom="45px" justifyContent="center" >
                                                <HashLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
                                            </Box>
                                    }


                                    <FormControl>
                                        <Button type="submit" variant="contained" color="primary" size="large" className={css(sharedStyles.no_text_transform)}>Sign in</Button>
                                    </FormControl>

                                    {/** Sign up */}
                                    <Box display="flex" marginTop="25px" justifyContent="center" >
                                        <Typography variant="body1" >
                                            Don't have an Student account? &nbsp;
                                            <CustomLink url={Routes.constructSignUpRoute(ManageGroupUrlState.groupNameFromUrl ?? "", undefined, this.props.match.params.courseUserName ?? "student-showcase")} color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} activeColor="none" activeUnderline component="nav-link" childComponent={ "Sign up" } />
                                        </Typography>
                                    </Box>

                                    {/** Forgot password */}
                                    <Box display="flex" marginTop="16px" justifyContent="center" onClick={toggleResetPasswordDialog} >
                                        <Typography variant="body1" color="primary" className={css(sharedStyles.nav_link_hover)}>Forgot your password?</Typography>
                                    </Box>
                                </Box>
                            </form>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Footer */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Footer/>
                </Col>
            </Row>

            {/** Reset password dialog */}
            <ResetPasswordDialogComponent/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInNew);

class ResetPasswordDialog extends Component<SignInProps, {}> {
    render() {
        const {
            ManageGroupUrlState,
            SignInLocalState,
            onTextChanged,
            toggleResetPasswordDialog,
            onSendResetPasswordClick
        } = this.props;

        return <Dialog
            fullWidth
            maxWidth="sm"
            fullScreen={this.props.MediaQueryState.isMobile}
            open={SignInLocalState.showResetPasswordDialog}
            onClose={toggleResetPasswordDialog}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <Box display="flex" justifyContent="flex-start" flexGrow={2}>
                        <Typography variant="h5" align="left">Reset Your Password</Typography>
                    </Box>
                    <Box display="flex" justifyContent="flex-end" flexGrow={1}>
                        <IconButton onClick={toggleResetPasswordDialog}>
                            <Close/>
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent style={{ padding: 0 }}>
                <Box display="flex" flexDirection="column" justifyContent="center" marginTop="15px" paddingX="24px">
                    <Box display="flex" flexDirection="column">
                        <Typography variant="body1" align="left">Please provide the email address you used when you signed up for your Student account.</Typography>
                        <Box height="25px"/>
                        <Typography variant="body1" align="left">We will send you an email with a link to reset your password. <b>Please note that this link will only be valid for up to 3 hours.</b></Typography>
                    </Box>

                    <Box height="42px"/>

                    <Box display="flex" flexDirection="column">
                        {/** Display error */}
                        {
                            !errorSendingResetPassword(SignInLocalState)
                                ? null
                                : <Box width="100%" bgcolor="error.main" padding="15px" marginBottom="42px" color="white">
                                    <Typography variant="body1" align="left">Unable to send request password email.</Typography>
                                </Box>
                        }

                        {/** Processing indicator */}
                        {
                            !isProcessingResetPasswordRequest(SignInLocalState)
                                ? null
                                : <Box display="flex" justifyContent="center" marginBottom="42px">
                                    <HashLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}/>
                                </Box>
                        }

                        {/** Email input */}
                        <TextField name="resetPasswordDialogEmail" value={SignInLocalState.resetPasswordDialogEmail} label="Email address" variant="outlined" fullWidth onChange={onTextChanged}/>
                    </Box>

                    <Box height="25px"/>
                </Box>
            </DialogContent>

            <DialogActions>
                <Box display="flex" justifyContent="flex-end" padding="8px">
                    <Button color="primary" variant="contained" size="medium" onClick={() => onSendResetPasswordClick(SignInLocalState.resetPasswordDialogEmail.trim())}  className={css(sharedStyles.no_text_transform)} disabled={SignInLocalState.resetPasswordDialogEmail.trim().length === 0}>Send</Button>
                </Box>
            </DialogActions>
        </Dialog>;
    }
}

const ResetPasswordDialogComponent = connect(mapStateToProps, mapDispatchToProps)(ResetPasswordDialog);

