import {
    UniAdminSignupAction,
    UniAdminSignupEvents,
    CompleteValidatingTokenAction,
    InputFieldChangedAction,
    CompleteCreatingAccountAction
} from "./UniAdminSignupActions";
import Error from "../../models/error";

/**
 * State interface for University Admin Signup page
 */
export interface UniAdminSignupState {
    // Token validation state
    token: string;
    validatingToken: boolean;
    tokenValidated: boolean;
    tokenValid: boolean;
    universityName: string;
    email: string;
    errorValidatingToken?: Error;

    // Form fields
    title: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmedPassword: string;

    // Account creation state
    creatingAccount: boolean;
    accountCreated: boolean;
    errorCreatingAccount?: Error;
    redirectTo?: string;
}

/**
 * Initial state
 */
const initialState: UniAdminSignupState = {
    token: "",
    validatingToken: false,
    tokenValidated: false,
    tokenValid: false,
    universityName: "",
    email: "",

    title: "-1",
    firstName: "",
    lastName: "",
    password: "",
    confirmedPassword: "",

    creatingAccount: false,
    accountCreated: false
};

/**
 * Helper selectors
 */
export const isValidatingToken = (state: UniAdminSignupState): boolean => {
    return state.validatingToken && !state.tokenValidated;
};

export const hasValidToken = (state: UniAdminSignupState): boolean => {
    return state.tokenValidated && state.tokenValid && !state.errorValidatingToken;
};

export const hasInvalidToken = (state: UniAdminSignupState): boolean => {
    return state.tokenValidated && !state.tokenValid;
};

export const isCreatingAccount = (state: UniAdminSignupState): boolean => {
    return state.creatingAccount && !state.accountCreated;
};

export const hasSuccessfullyCreatedAccount = (state: UniAdminSignupState): boolean => {
    return state.accountCreated && !state.errorCreatingAccount;
};

export const hasErrorCreatingAccount = (state: UniAdminSignupState): boolean => {
    return !state.creatingAccount && state.errorCreatingAccount !== undefined;
};

/**
 * Reducer
 */
const uniAdminSignupReducer = (state = initialState, action: UniAdminSignupAction): UniAdminSignupState => {
    switch (action.type) {
        case UniAdminSignupEvents.ValidatingToken:
            return {
                ...state,
                validatingToken: true,
                tokenValidated: false,
                tokenValid: false,
                errorValidatingToken: undefined
            };

        case UniAdminSignupEvents.CompleteValidatingToken:
            const completeValidatingAction = action as CompleteValidatingTokenAction;
            return {
                ...state,
                validatingToken: false,
                tokenValidated: true,
                tokenValid: completeValidatingAction.valid,
                universityName: completeValidatingAction.universityName || "",
                email: completeValidatingAction.email || "",
                errorValidatingToken: completeValidatingAction.error
                    ? { detail: completeValidatingAction.error }
                    : undefined
            };

        case UniAdminSignupEvents.InputFieldChanged:
            const inputFieldAction = action as InputFieldChangedAction;
            return {
                ...state,
                [inputFieldAction.name]: inputFieldAction.value
            };

        case UniAdminSignupEvents.CreatingAccount:
            return {
                ...state,
                creatingAccount: true,
                accountCreated: false,
                errorCreatingAccount: undefined
            };

        case UniAdminSignupEvents.CompleteCreatingAccount:
            const completeCreatingAction = action as CompleteCreatingAccountAction;
            return {
                ...state,
                creatingAccount: false,
                accountCreated: completeCreatingAction.success,
                errorCreatingAccount: completeCreatingAction.error
                    ? { detail: completeCreatingAction.error }
                    : undefined,
                redirectTo: completeCreatingAction.redirectTo
            };

        case UniAdminSignupEvents.Reset:
            return initialState;

        default:
            return state;
    }
};

export default uniAdminSignupReducer;
