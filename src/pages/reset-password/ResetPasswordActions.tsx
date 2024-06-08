import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../redux-store/reducers";
import firebase from "../../firebase/firebaseApp";
import React from "react";
import {checkPasswordStrength, PASSWORD_VERY_WEAK} from "../../utils/utils";

export enum ResetPasswordEvents {
    VerifyingCode = "ResetPasswordEvents.VerifyingCode",
    CompleteVerifyingCode = "ResetPasswordEvents.CompleteVerifyingCode",
    TextChanged = "ResetPasswordEvents.TextChanged",
    ConfirmingResetPassword = "ResetPasswordEvents.ConfirmingResetPassword",
    CompleteConfirmingResetPassword = "ResetPasswordEvents.CompleteConfirmingResetPassword"
}

export interface ResetPasswordAction extends Action {

}

export interface CompleteVerifyingCodeAction extends ResetPasswordAction {
    actionCode: string | null;
    email: string | null;
    error?: string;
}

export interface TextChangedAction extends ResetPasswordAction {
    name: string;
    value: string;
}

export interface CompleteConfirmingResetPasswordAction extends ResetPasswordAction {
    error?: string;
}

export const verifyCode: ActionCreator<any> = (code: string | null) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ResetPasswordEvents.VerifyingCode
        });

        const completeAction: CompleteVerifyingCodeAction = {
            type: ResetPasswordEvents.CompleteVerifyingCode,
            actionCode: null,
            email: null
        };

        if (code === null) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            completeAction.actionCode = code;
            completeAction.email = await firebase.auth().verifyPasswordResetCode(code);
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const confirmPasswordReset: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            password,
            confirmedPassword,
            actionCode
        } = getState().ResetPasswordLocalState;

        const completeAction: CompleteConfirmingResetPasswordAction = {
            type: ResetPasswordEvents.CompleteConfirmingResetPassword
        };

        if (password.trim().length === 0 || confirmedPassword.trim().length === 0) {
            completeAction.error = "Please fill in the required fields.";
            return dispatch(completeAction);
        }

        if (password !== confirmedPassword) {
            completeAction.error = "Passwords do not match.";
            return dispatch(completeAction);
        }

        if (password.trim().length < 8) {
            completeAction.error = "Password must have at least 8 characters.";
            return dispatch(completeAction);
        }

        if (checkPasswordStrength(password) === PASSWORD_VERY_WEAK) {
            completeAction.error = "Please select a stronger password.";
            return dispatch(completeAction);
        }

        dispatch({
            type: ResetPasswordEvents.ConfirmingResetPassword
        });

        try {
            await firebase.auth().confirmPasswordReset(actionCode as string, password);
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }
    }
}

export const onTextChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: TextChangedAction = {
            type: ResetPasswordEvents.TextChanged,
            name: event.target.name,
            value: event.target.value
        }
        return dispatch(action);
    }
}