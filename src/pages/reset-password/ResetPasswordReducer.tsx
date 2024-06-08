import {
    CompleteConfirmingResetPasswordAction,
    CompleteVerifyingCodeAction,
    ResetPasswordAction,
    ResetPasswordEvents,
    TextChangedAction
} from "./ResetPasswordActions";
import Error from "../../models/error";

export interface ResetPasswordState {
    verifyingCode: boolean;
    codeVerified: boolean;
    actionCode: string | null;
    email: string | null;
    errorVerifyingCode?: Error;

    password: string;
    confirmedPassword: string;

    resettingPassword: boolean;
    passwordReset: boolean;
    errorResettingPassword?: Error;
}

const initialState: ResetPasswordState = {
    verifyingCode: false,
    codeVerified: false,
    actionCode: null,
    email: null,

    password: "",
    confirmedPassword: "",

    resettingPassword: false,
    passwordReset: false
}

export const isVerifyingCode = (state: ResetPasswordState) => {
    return state.verifyingCode && !state.codeVerified;
}

export const successfullyVerifyingCode = (state: ResetPasswordState) => {
    return !state.verifyingCode && state.codeVerified && state.email !== null && state.errorVerifyingCode === undefined;
}

export const hasErrorVerifyingCode = (state: ResetPasswordState) => {
    return !state.verifyingCode && state.codeVerified && state.email === null && state.errorVerifyingCode !== undefined;
}

export const isResettingPassword = (state: ResetPasswordState) => {
    return state.resettingPassword && !state.passwordReset;
}

export const successfullyResettingPassword = (state: ResetPasswordState) => {
    return !state.resettingPassword && state.passwordReset && state.errorResettingPassword === undefined;
}

export const hasErrorResettingPassword = (state: ResetPasswordState) => {
    return !state.resettingPassword && !state.passwordReset && state.errorResettingPassword !== undefined;
}

const resetPasswordReducer = (state = initialState, action: ResetPasswordAction) => {
    switch (action.type) {
        case ResetPasswordEvents.VerifyingCode:
            return {
                ...state,
                verifyingCode: true,
                codeVerified: false
            }
        case ResetPasswordEvents.CompleteVerifyingCode:
            const completeVerifyingCodeAction: CompleteVerifyingCodeAction = action as CompleteVerifyingCodeAction;
            return {
                ...state,
                verifyingCode: false,
                codeVerified: true,
                actionCode: completeVerifyingCodeAction.actionCode,
                email: completeVerifyingCodeAction.email,
                errorVerifyingCode: completeVerifyingCodeAction.error !== undefined ? {detail: completeVerifyingCodeAction.error} : state.errorVerifyingCode
            }
        case ResetPasswordEvents.TextChanged:
            const textChangedAction: TextChangedAction = action as TextChangedAction;
            return {
                ...state,
                [textChangedAction.name]: textChangedAction.value
            }
        case ResetPasswordEvents.ConfirmingResetPassword:
            return {
                ...state,
                resettingPassword: true,
                passwordReset: false,
                errorResettingPassword: undefined
            }
        case ResetPasswordEvents.CompleteConfirmingResetPassword:
            const completeConfirmingResetPasswordAction: CompleteConfirmingResetPasswordAction = action as CompleteConfirmingResetPasswordAction;
            return {
                ...state,
                resettingPassword: false,
                passwordReset: completeConfirmingResetPasswordAction.error === undefined,
                errorResettingPassword: completeConfirmingResetPasswordAction.error ? {detail: completeConfirmingResetPasswordAction.error} : state.errorResettingPassword
            }
        default:
            return state;
    }
}

export default resetPasswordReducer;