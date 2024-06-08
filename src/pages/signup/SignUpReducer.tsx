import {
    CompleteCreatingAccountAction,
    CompleteLoadingInvitedUserAction,
    InputFieldChangedAction,
    SignUpAction,
    SignUpEvents
} from "./SignUpActions";
import Error from "../../models/error";
import InvitedUser from "../../models/invited_user";
import {AuthenticationEvents} from "../../redux-store/actions/authenticationActions";

export interface SignUpState {
    invitedUser?: InvitedUser;
    invitedUserLoaded: boolean;
    loadingInvitedUser: boolean;
    errorLoadingInvitedUser?: Error;

    userType: number;
    title: string;
    discover: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmedEmail: string;
    password: string;
    confirmedPassword: string;
    acceptMarketingPreferences: boolean;

    creatingAccount: boolean;
    errorCreatingAccount?: Error;
}

const initialState: SignUpState = {
    invitedUserLoaded: false,
    loadingInvitedUser: false,

    userType: -1,
    title: "-1",
    discover: "-1",
    firstName: "",
    lastName: "",
    email: "",
    confirmedEmail: "",
    password: "",
    confirmedPassword: "",
    acceptMarketingPreferences: false,

    creatingAccount: false
}

export const isLoadingInvitedUser = (state: SignUpState) => {
    return !state.invitedUserLoaded && state.loadingInvitedUser;
}

export const hasSuccessfullyLoadedInvitedUser = (state: SignUpState) => {
    return state.invitedUserLoaded && !state.loadingInvitedUser && state.invitedUser !== undefined && state.errorLoadingInvitedUser === undefined;
}

export const hasErrorLoadingInvitedUser = (state: SignUpState) => {
    return state.invitedUserLoaded && !state.loadingInvitedUser && state.invitedUser === undefined && state.errorLoadingInvitedUser !== undefined;
}

export const notFoundInvitedUser = (state: SignUpState) => {
    return hasErrorLoadingInvitedUser(state) && state.errorLoadingInvitedUser && state.errorLoadingInvitedUser.detail.includes("404");
}

export const isCreatingAccount = (state: SignUpState) => {
    return state.creatingAccount;
}

export const hasErrorCreatingAccount = (state: SignUpState) => {
    return !state.creatingAccount && state.errorCreatingAccount !== undefined;
}

const signUpReducer = (state = initialState, action: SignUpAction) => {
    switch (action.type) {
        case AuthenticationEvents.SignOut:
            return initialState;
        case AuthenticationEvents.CompleteAuthentication:
            return initialState;
        case SignUpEvents.LoadingInvitedUser:
            return {
                ...state,
                invitedUser: undefined,
                invitedUserLoaded: false,
                loadingInvitedUser: true,
                errorLoadingInvitedUser: undefined
            }
        case SignUpEvents.CompleteLoadingInvitedUser:
            const completeLoadingInvitedUserAction: CompleteLoadingInvitedUserAction = action as CompleteLoadingInvitedUserAction;
            return {
                ...state,
                invitedUser: completeLoadingInvitedUserAction.invitedUser,
                invitedUserLoaded: true,
                loadingInvitedUser: false,
                errorLoadingInvitedUser: completeLoadingInvitedUserAction.error !== undefined
                    ? {detail: completeLoadingInvitedUserAction.error} : state.errorLoadingInvitedUser,
                userType: completeLoadingInvitedUserAction.invitedUser
                    ? completeLoadingInvitedUserAction.invitedUser.type : state.userType,
                title: completeLoadingInvitedUserAction.invitedUser
                    ? completeLoadingInvitedUserAction.invitedUser.title : state.title,
                firstName: completeLoadingInvitedUserAction.invitedUser
                    ? completeLoadingInvitedUserAction.invitedUser.firstName : state.firstName,
                lastName: completeLoadingInvitedUserAction.invitedUser
                    ? completeLoadingInvitedUserAction.invitedUser.lastName : state.lastName,
                email: completeLoadingInvitedUserAction.invitedUser
                    ? completeLoadingInvitedUserAction.invitedUser.email : state.email
            }
        case SignUpEvents.InputFieldChanged:
            const inputFieldChangedAction: InputFieldChangedAction = action as InputFieldChangedAction;
            return {
                ...state,
                [inputFieldChangedAction.name]: inputFieldChangedAction.value
            }
        case SignUpEvents.CreatingAccount:
            return {
                ...state,
                creatingAccount: true,
                successfullyCreatedAccount: false,
                errorCreatingAccount: undefined
            }
        case SignUpEvents.CompleteCreatingAccount:
            const completeCreatingAccountAction: CompleteCreatingAccountAction = action as CompleteCreatingAccountAction;
            return {
                ...state,
                creatingAccount: false,
                errorCreatingAccount: completeCreatingAccountAction.error
                    ? {detail: completeCreatingAccountAction.error} : state.errorCreatingAccount
            }
        default:
            return state;
    }
}

export default signUpReducer;