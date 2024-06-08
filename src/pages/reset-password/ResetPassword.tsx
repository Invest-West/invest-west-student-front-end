import React, { Component } from "react";
import { connect } from "react-redux";
import { AppState } from "../../redux-store/reducers";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { RouteParams } from "../../router/router";
import { Col, Row } from "react-bootstrap";
import { css } from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import queryString from "query-string";
import { confirmPasswordReset, onTextChanged, verifyCode } from "./ResetPasswordActions";
import {
    hasErrorResettingPassword,
    hasErrorVerifyingCode,
    isResettingPassword,
    isVerifyingCode,
    ResetPasswordState,
    successfullyResettingPassword
} from "./ResetPasswordReducer";
import { HashLoader } from "react-spinners";
import { getGroupRouteTheme, ManageGroupUrlState } from "../../redux-store/reducers/manageGroupUrlReducer";
import Routes from "../../router/routes";
import { MediaQueryState } from "../../redux-store/reducers/mediaQueryReducer";

interface ResetPasswordProps {
    ManageGroupUrlState: ManageGroupUrlState;
    MediaQueryState: MediaQueryState;
    ResetPasswordLocalState: ResetPasswordState;
    verifyCode: (code: string | null) => any;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    confirmPasswordReset: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        MediaQueryState: state.MediaQueryState,
        ResetPasswordLocalState: state.ResetPasswordLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        verifyCode: (code: string | null) => dispatch(verifyCode(code)),
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        confirmPasswordReset: () => dispatch(confirmPasswordReset())
    }
}

class ResetPassword extends Component<ResetPasswordProps & Readonly<RouteComponentProps<RouteParams>>, any> {

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        if (params.oobCode) {
            const actionCode: string | string[] | null | undefined = params.oobCode;
            if (actionCode) {
                this.props.verifyCode(actionCode as string);
            } else {
                this.props.verifyCode(null);
            }
        } else {
            this.props.verifyCode(null);
        }
    }

    render() {
        const {
            ManageGroupUrlState,
            MediaQueryState,
            ResetPasswordLocalState,
            onTextChanged,
            confirmPasswordReset
        } = this.props;

        // verifying code
        if (isVerifyingCode(ResetPasswordLocalState)) {
            return <Box display="flex" justifyContent="center" marginTop="50px">
                <HashLoader
                    color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                />
            </Box>;
        }

        // failed to verify code
        if (hasErrorVerifyingCode(ResetPasswordLocalState)) {
            return <Redirect
                to={Routes.error404}
            />;
        }

        // password has been successfully updated
        if (successfullyResettingPassword(ResetPasswordLocalState)) {
            return <Box display="flex" justifyContent="center" alignItems="center" marginTop="50px">
                <Typography
                    variant="h5"
                    color="primary"
                    align="center"
                >
                    Your password has been updated.
                </Typography>
            </Box>;
        }

        return <Box
            paddingX={MediaQueryState.isMobile ? "18px" : "0px"}
            paddingY={MediaQueryState.isMobile ? "30px" : "60px"}
        >
            <Row
                noGutters
            >
                <Col
                    xs={12}
                    sm={12}
                    md={{ span: 6, offset: 3 }}
                    lg={{ span: 4, offset: 4 }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            align="left"
                        >
                            Reset Password
                        </Typography>
                        <Box
                            height="40px"
                        />
                        <TextField
                            required
                            fullWidth
                            variant="outlined"
                            label="Password"
                            name="password"
                            type="password"
                            onChange={onTextChanged}
                        />
                        <Box
                            height="25px"
                        />
                        <TextField
                            required
                            fullWidth
                            variant="outlined"
                            label="Confirm Password"
                            name="confirmedPassword"
                            type="password"
                            onChange={onTextChanged}
                        />
                        <Box
                            height="25px"
                        />
                        {
                            !hasErrorResettingPassword(ResetPasswordLocalState)
                                ? null
                                : <Box
                                    width="100%"
                                    bgcolor="error.main"
                                    padding="15px"
                                    marginBottom="20px"
                                    color="white"
                                >
                                    <Typography
                                        variant="body1"
                                        align="left"
                                    >
                                        {ResetPasswordLocalState.errorResettingPassword?.detail}
                                    </Typography>
                                </Box>
                        }
                        {
                            !isResettingPassword(ResetPasswordLocalState)
                                ? null
                                : <Box
                                    display="flex"
                                    justifyContent="center"
                                    marginBottom="20px"
                                >
                                    <HashLoader
                                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                    />
                                </Box>
                        }
                        <Box
                            height="25px"
                        />
                        <Box
                            display="flex"
                            justifyContent="flex-end"
                        >
                            <Button
                                variant="contained"
                                className={css(sharedStyles.no_text_transform)}
                                color="primary"
                                size="large"
                                onClick={() => confirmPasswordReset()}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
