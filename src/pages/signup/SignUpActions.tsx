import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../redux-store/reducers";
import InvitedUser from "../../models/invited_user";
import UserRepository from "../../api/repositories/UserRepository";
import React from "react";
import {checkPasswordStrength, PASSWORD_VERY_WEAK} from "../../utils/passwordUtils";
import {isValidEmailAddress} from "../../utils/emailUtils";
import {signIn} from "../../redux-store/actions/authenticationActions";

export enum SignUpEvents {
    LoadingInvitedUser = "SignUpEvents.LoadingInvitedUser",
    CompleteLoadingInvitedUser = "SignUpEvents.CompleteLoadingInvitedUser",
    InputFieldChanged = "SignUpEvents.InputFieldChanged",
    CreatingAccount = "SignUpEvents.CreatingAccount",
    CompleteCreatingAccount = "SignUpEvents.CompleteCreatingAccount"
}

export interface SignUpAction extends Action {

}

export interface CompleteLoadingInvitedUserAction extends SignUpAction {
    invitedUser?: InvitedUser;
    error?: string;
}

export interface InputFieldChangedAction extends SignUpAction {
    name: string;
    value: string | boolean;
}

export interface CompleteCreatingAccountAction extends SignUpAction {
    error?: string;
}

export const loadInvitedUser: ActionCreator<any> = (invitedUserID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {

        const completeAction: CompleteLoadingInvitedUserAction = {
            type: SignUpEvents.CompleteLoadingInvitedUser
        };

        try {
            dispatch({
                type: SignUpEvents.LoadingInvitedUser
            });

            const response = await new UserRepository().retrieveInvitedUser(invitedUserID);
            const invitedUser: InvitedUser = response.data;
            completeAction.invitedUser = JSON.parse(JSON.stringify(invitedUser));
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const handleInputFieldChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const inputFieldType: string = event.target.type;
        const inputFieldName: string = event.target.name;
        const inputFieldValue: string = event.target.value;
        const inputFieldChecked: boolean = event.target.checked;

        const action: InputFieldChangedAction = {
            type: SignUpEvents.InputFieldChanged,
            name: inputFieldName,
            value: inputFieldType === "checkbox" ? inputFieldChecked : inputFieldValue
        };

        return dispatch(action);
    }
}

export const createAccount: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            invitedUser,
            userType,
            title,
            discover,
            course,
            firstName,
            lastName,
            email,
            confirmedEmail,
            password,
            confirmedPassword,
            acceptMarketingPreferences
        } = getState().SignUpLocalState;

        const {
            group
        } = getState().ManageGroupUrlState;

        const completeAction: CompleteCreatingAccountAction = {
            type: SignUpEvents.CompleteCreatingAccount
        };

        // invalid email address
        if (!isValidEmailAddress(email) || !isValidEmailAddress(confirmedEmail)) {
            completeAction.error = "Please enter a valid email address.";
            return dispatch(completeAction);
        }

        // emails not match
        if (email.trim().toLocaleLowerCase() !== confirmedEmail.trim().toLocaleLowerCase()) {
            completeAction.error = "Emails do not match.";
            return dispatch(completeAction);
        }

        // passwords not match
        if (password !== confirmedPassword) {
            completeAction.error = "Passwords do not match.";
            return dispatch(completeAction);
        }

        // password too short
        if (password.length < 10) {
            completeAction.error = "Please type a password with 10 or more characters";
            return dispatch(completeAction);
        }

        // password not strong enough
        if (checkPasswordStrength(password) === PASSWORD_VERY_WEAK) {
            completeAction.error = "Password is too weak. Please select a stronger password.";
            return dispatch(completeAction);
        }

        try {
            dispatch({
                type: SignUpEvents.CreatingAccount
            });

            await new UserRepository().signUp({
                isPublicRegistration: invitedUser === undefined,
                invitedUserID: invitedUser !== undefined ? invitedUser.id : undefined,
                userProfile: {
                    title,
                    discover,
                    course,
                    firstName,
                    lastName,
                    email,
                    type: userType
                },
                password,
                groupID: invitedUser ? invitedUser.invitedBy : group?.anid ?? "",
                acceptMarketingPreferences: acceptMarketingPreferences,
            });

            dispatch(completeAction);
            return dispatch(signIn(email, password));
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}