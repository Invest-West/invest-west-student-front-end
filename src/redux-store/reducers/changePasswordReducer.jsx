import * as changePasswordActions from '../actions/changePasswordActions';
import * as authActions from '../actions/authActions';
import {
    PASSWORD_CHANGE_NONE,
    PASSWORD_CHANGE_RE_AUTH
} from '../../shared-components/change-password/ChangePasswordPage';

const initState = {
    currentPassword: '',
    newPassword: '',
    newPasswordVerified: '',
    passwordChangeResponseCode: PASSWORD_CHANGE_NONE
};

const changePasswordReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case changePasswordActions.RE_AUTHENTICATING_USER:
            return {
                ...state,
                passwordChangeResponseCode: PASSWORD_CHANGE_RE_AUTH
            };
        case changePasswordActions.RESET_CHANGE_PASSWORD:
            return {
                ...state,
                currentPassword: '',
                newPassword: '',
                newPasswordVerified: '',
                passwordChangeResponseCode: action.hasOwnProperty('responseCode') ? action.responseCode : PASSWORD_CHANGE_NONE
            };
        case changePasswordActions.CHANGE_PASSWORD_TEXT_CHANGED:
            return {
                ...state,
                [action.name]: action.value
            };
        case changePasswordActions.ERROR_CHANGING_PASSWORD:
            return {
                ...state,
                passwordChangeResponseCode: action.errorCode
            };
        default:
            return state;
    }
};

export default changePasswordReducer;