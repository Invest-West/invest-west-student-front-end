import {
    CompleteProcessingResetPasswordRequestAction,
    SignInAction,
    SignInEvents,
    TextChangedAction
} from "./SignInActions";
import Error from "../../models/error";

export interface SignInState {
    signInEmail: string;
    signInPassword: string;
    showPassword: boolean;

    errorSignInEmail: boolean;
    errorSignInPassword: boolean;
    showResetPasswordDialog: boolean;
    resetPasswordDialogEmail: string;
    resetPasswordDialogProcessing: boolean;
    resetPasswordDialogEmailSent: boolean;
    resetPasswordDialogError?: Error;
}

const initialState: SignInState = {
    signInEmail: "",
    signInPassword: "",
    showPassword: false,
    
    errorSignInEmail: false,
    errorSignInPassword: false,
    showResetPasswordDialog: false,
    resetPasswordDialogEmail: "",
    resetPasswordDialogProcessing: false,
    resetPasswordDialogEmailSent: false
}

export const successfullySentResetPassword = (state: SignInState) => {
    return state.resetPasswordDialogEmailSent && state.resetPasswordDialogError === undefined;
}

export const errorSendingResetPassword = (state: SignInState) => {
    return state.resetPasswordDialogError !== undefined;
}

export const isProcessingResetPasswordRequest = (state: SignInState) => {
    return state.resetPasswordDialogProcessing;
}

const signInReducer = (state: SignInState = initialState, action: SignInAction) => {
    switch (action.type) {
        case SignInEvents.ResetAllStates:
            return {
                ...initialState
            }
        case SignInEvents.TextChanged:
            const textChangedAction: TextChangedAction = (action as TextChangedAction);
            return {
                ...state,
                [textChangedAction.name]: textChangedAction.value
            }
        case SignInEvents.TogglePasswordVisibility:
            return {
                ...state,
                showPassword: !state.showPassword
            }
        case SignInEvents.SignInEmailError:
            return {
                ...state,
                errorSignInEmail: true
            }
        case SignInEvents.SignInPasswordError:
            return {
                ...state,
                errorSignInPassword: true
            }           
        case SignInEvents.ClearErrors:
            return {
                ...state,
                errorSignInEmail: false,
                errorSignInPassword: false
            }
        case SignInEvents.ToggleResetPasswordDialog:
            return {
                ...state,
                showResetPasswordDialog: !state.showResetPasswordDialog,
                resetPasswordDialogEmail: "",
            }
        case SignInEvents.ProcessingResetPasswordRequest:
            return {
                ...state,
                resetPasswordDialogProcessing: true,
                resetPasswordDialogError: undefined
            }
        case SignInEvents.CompleteProcessingResetPasswordRequest:
            const completeAction: CompleteProcessingResetPasswordRequestAction =
                (action as CompleteProcessingResetPasswordRequestAction);
            return {
                ...state,
                resetPasswordDialogEmailSent: completeAction.error === undefined,
                resetPasswordDialogError: completeAction.error !== undefined
                    ? {detail: completeAction.error} : state.resetPasswordDialogError,
                resetPasswordDialogProcessing: false
            }
        default:
            return state;
    }
}

export default signInReducer;