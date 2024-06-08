import {
    PASSWORD_CHANGE_FAIL,
    PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED,
    PASSWORD_CHANGE_NOT_STRONG_ENOUGH, PASSWORD_CHANGE_RE_AUTH_FAILED,
    PASSWORD_CHANGE_SUCCESS
} from '../../shared-components/change-password/ChangePasswordPage';
import * as utils from '../../utils/utils';
import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const CHANGE_PASSWORD_TEXT_CHANGED = 'CHANGE_PASSWORD_TEXT_CHANGED';
export const handleTextChanged = event => {
    return {
        type: CHANGE_PASSWORD_TEXT_CHANGED,
        name: event.target.name,
        value: event.target.value
    }
};

export const RESET_CHANGE_PASSWORD = 'RESET_CHANGE_PASSWORD';
export const reset = () => {
    return {
        type: RESET_CHANGE_PASSWORD
    }
};

export const RE_AUTHENTICATING_USER = 'RE_AUTHENTICATING_USER';
export const ERROR_CHANGING_PASSWORD = 'ERROR_CHANGING_PASSWORD';
export const requestChangePassword = () => {
    return (dispatch, getState) => {

        dispatch({
            type: RE_AUTHENTICATING_USER
        });

        const passwords = {
            currentPassword: getState().changePassword.currentPassword,
            newPassword: getState().changePassword.newPassword,
            newPasswordVerified: getState().changePassword.newPasswordVerified
        };

        const currentUser = getState().auth.user;

        changePassword(currentUser.email, passwords)
            .then(responseCode => {
                dispatch({
                    type: RESET_CHANGE_PASSWORD,
                    responseCode
                });

                realtimeDBUtils
                    .trackActivity({
                        userID: firebase.auth().currentUser.uid,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CHANGED_PASSWORD
                    });
            })
            .catch(errorCode => {
                dispatch({
                    type: ERROR_CHANGING_PASSWORD,
                    errorCode
                });
            });
    }
};

const changePassword = async (email, passwords) => {
    return new Promise((resolve, reject) => {
        if (passwords.newPassword !== passwords.newPasswordVerified) {
            return reject(PASSWORD_CHANGE_NOT_MATCH_WITH_VERIFIED);
        }

        const passwordStrength = utils.checkPasswordStrength(passwords.newPassword);
        if (passwordStrength === utils.PASSWORD_VERY_WEAK) {
            return reject(PASSWORD_CHANGE_NOT_STRONG_ENOUGH);
        }

        firebase
            .auth()
            .signInWithEmailAndPassword(email, passwords.currentPassword)
            .then(credential => {
                firebase
                    .auth()
                    .currentUser
                    .updatePassword(passwords.newPassword)
                    .then(() => {
                        return resolve(PASSWORD_CHANGE_SUCCESS);
                    })
                    .catch(error => {
                        return reject(PASSWORD_CHANGE_FAIL)
                    });
            })
            .catch(error => {
                return reject(PASSWORD_CHANGE_RE_AUTH_FAILED);
            });
    });
};