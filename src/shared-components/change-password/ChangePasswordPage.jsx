import React, {Component} from 'react';
import {
    Container,
    Row,
    Col
} from 'react-bootstrap';
import {
    Button,
    TextField,
    Typography,
    IconButton
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';

import * as colors from '../../values/colors';

import {connect} from 'react-redux';
import * as changePasswordActions from '../../redux-store/actions/changePasswordActions';

export const PASSWORD_CHANGE_NONE = 0;
export const PASSWORD_CHANGE_RE_AUTH = 1;
export const PASSWORD_CHANGE_SUCCESS = 2;
export const PASSWORD_CHANGE_FAIL = 3;
export const PASSWORD_CHANGE_RE_AUTH_FAILED = 4;
export const PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED = 5;
export const PASSWORD_CHANGE_NOT_STRONG_ENOUGH = 6;

const mapStateToProps = state => {
    return {
        currentPassword: state.changePassword.currentPassword,
        newPassword: state.changePassword.newPassword,
        newPasswordVerified: state.changePassword.newPasswordVerified,
        passwordChangeResponseCode: state.changePassword.passwordChangeResponseCode
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleTextChanged: (event) => dispatch(changePasswordActions.handleTextChanged(event)),
        reset: () => dispatch(changePasswordActions.reset()),
        requestChangePassword: () => dispatch(changePasswordActions.requestChangePassword())
    }
};

class ChangePasswordPage extends Component {

    render() {
        const {
            currentPassword,
            newPassword,
            newPasswordVerified,
            passwordChangeResponseCode,

            handleTextChanged,
            reset,
            requestChangePassword
        } = this.props;

        return (
            <Container fluid style={{ padding: 0 }} >
                <Row noGutters >
                    <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 24 }} >
                        <FlexView column >
                            <Typography align="left" variant="h6" color="primary">Update your password</Typography>
                            <Typography align="left" variant="body2" color="textSecondary" style={{ marginTop: 10, marginBottom: 18 }}>Update your password regularly to protect your account better. Password must contain at least 8 characters.</Typography>
                            <TextField
                                label="Current password"
                                name="currentPassword"
                                value={currentPassword}
                                type="password"
                                margin="normal"
                                variant="outlined"
                                onChange={handleTextChanged}
                            />

                            <TextField
                                label="New password"
                                name="newPassword"
                                value={newPassword}
                                type="password"
                                margin="normal"
                                variant="outlined"
                                error={
                                    passwordChangeResponseCode === PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED
                                }
                                onChange={handleTextChanged}
                            />

                            <TextField
                                label="Verify password"
                                name="newPasswordVerified"
                                value={newPasswordVerified}
                                type="password"
                                margin="normal"
                                variant="outlined"
                                error={
                                    passwordChangeResponseCode === PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED
                                }
                                onChange={handleTextChanged}
                            />

                            <Row noGutters >
                                <Col xs={12} sm={12} md={6} lg={8} style={{ marginTop: 20 }} >
                                    <PasswordUpdate
                                        responseCode={passwordChangeResponseCode}
                                        onCloseMessage={reset}
                                    />
                                </Col>
                                <Col xs={12} sm={12} md={6} lg={4} style={{ marginTop: 20 }} >
                                    <FlexView hAlignContent="right" width="100%" >
                                        <FlexView marginRight={20} >
                                            <Button variant="outlined" color="primary" onClick={reset}>Cancel</Button>
                                        </FlexView>
                                        <FlexView>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={requestChangePassword}
                                                disabled={
                                                    currentPassword.length === 0 ||
                                                    newPassword.length === 0 ||
                                                    newPasswordVerified.length === 0
                                                }>
                                                Save
                                            </Button>
                                        </FlexView>
                                    </FlexView>
                                </Col>
                            </Row>
                        </FlexView>
                    </Col>
                </Row>
            </Container>
        );
    }
}

class PasswordUpdate extends Component {

    onCloseMessage = () => {
        this.props.onCloseMessage();
    };

    renderMessage = () => {
        switch (this.props.responseCode) {
            case PASSWORD_CHANGE_RE_AUTH: {
                return {message: "Re-authenticating ...", color: colors.dark_green};
            }
            case PASSWORD_CHANGE_FAIL: {
                return {message: "Failed to change password", color: colors.red_700};
            }
            case PASSWORD_CHANGE_SUCCESS: {
                return {
                    message: "Password changed successfully",
                    color: colors.dark_green
                };
            }
            case PASSWORD_CHANGE_RE_AUTH_FAILED: {
                return {message: "Failed to re-authenticate", color: colors.red_700};
            }
            case PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED: {
                return {
                    message: "New passwords not match with each other",
                    color: colors.red_700
                };
            }
            case PASSWORD_CHANGE_NOT_STRONG_ENOUGH: {
                return {
                    message:
                        "Password must have at least 8 characters",
                    color: colors.red_700
                };
            }
            default:
                return null;
        }
    };

    render() {
        const {
            responseCode
        } = this.props;
        return (
            responseCode === PASSWORD_CHANGE_NONE
                ?
                null
                :
                <FlexView grow={1} style={{ backgroundColor: this.renderMessage().color }} vAlignContent="center" >

                    <FlexView className={css(styles.changing_password_text_background)} >
                        <Typography align="left" variant="subtitle1" color="inherit" >{this.renderMessage().message}</Typography>
                    </FlexView>

                    <FlexView
                        grow
                        vAlignContent="center"
                        hAlignContent="right"
                        style={{ padding: 4 }}
                    >
                        <IconButton onClick={this.onCloseMessage} >
                            <CloseIcon fontSize="small" style={{ color: colors.white }} />
                        </IconButton>
                    </FlexView>
                </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPage);

const styles = StyleSheet.create({

    changing_password_text_background: {
        color: colors.white,
        marginLeft: 15,
        marginTop: 10,
        marginBottom: 10
    }
});