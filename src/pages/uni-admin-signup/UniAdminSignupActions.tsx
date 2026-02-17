import { Action, ActionCreator, Dispatch } from "redux";
import { AppState } from "../../redux-store/reducers";
import Api from "../../api/Api";
import firebase from "../../firebase/firebaseApp";

/**
 * API Routes for University Admin Invite
 */
export class UniAdminInviteApiRoutes {
    static baseRoute = "/uni";
    static validateInviteRoute = `${UniAdminInviteApiRoutes.baseRoute}/admin-invite/validate`;
    static completeSignupRoute = `${UniAdminInviteApiRoutes.baseRoute}/admin-invite/complete`;
}

/**
 * Events for the UniAdminSignup page
 */
export enum UniAdminSignupEvents {
    ValidatingToken = "UniAdminSignupEvents.ValidatingToken",
    CompleteValidatingToken = "UniAdminSignupEvents.CompleteValidatingToken",
    InputFieldChanged = "UniAdminSignupEvents.InputFieldChanged",
    CreatingAccount = "UniAdminSignupEvents.CreatingAccount",
    CompleteCreatingAccount = "UniAdminSignupEvents.CompleteCreatingAccount",
    Reset = "UniAdminSignupEvents.Reset"
}

/**
 * Base action interface
 */
export interface UniAdminSignupAction extends Action {
}

/**
 * Action for completing token validation
 */
export interface CompleteValidatingTokenAction extends UniAdminSignupAction {
    valid: boolean;
    universityName?: string;
    email?: string;
    error?: string;
}

/**
 * Action for input field changes
 */
export interface InputFieldChangedAction extends UniAdminSignupAction {
    name: string;
    value: string;
}

/**
 * Action for completing account creation
 */
export interface CompleteCreatingAccountAction extends UniAdminSignupAction {
    success: boolean;
    error?: string;
    customToken?: string;
    redirectTo?: string;
}

/**
 * Validates the invite token with the backend
 */
export const validateInviteToken: ActionCreator<any> = (token: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const completeAction: CompleteValidatingTokenAction = {
            type: UniAdminSignupEvents.CompleteValidatingToken,
            valid: false
        };

        try {
            dispatch({
                type: UniAdminSignupEvents.ValidatingToken
            });

            const response = await Api.doGet(
                `${UniAdminInviteApiRoutes.validateInviteRoute}/${token}`
            );

            if (response.data.valid) {
                completeAction.valid = true;
                completeAction.universityName = response.data.universityName;
                completeAction.email = response.data.email;
            } else {
                completeAction.valid = false;
                completeAction.error = response.data.error || "Invalid or expired invitation link";
            }

            return dispatch(completeAction);
        } catch (error: any) {
            completeAction.valid = false;
            completeAction.error = error.toString().includes("404")
                ? "This invitation link is invalid or has expired"
                : error.toString();
            return dispatch(completeAction);
        }
    };
};

/**
 * Handles input field changes
 */
export const handleInputFieldChanged: ActionCreator<any> = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: InputFieldChangedAction = {
            type: UniAdminSignupEvents.InputFieldChanged,
            name: event.target.name || "",
            value: event.target.value as string
        };

        return dispatch(action);
    };
};

/**
 * Creates the university admin account
 */
export const createAccount: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            token,
            title,
            firstName,
            lastName,
            password,
            confirmedPassword
        } = getState().UniAdminSignupLocalState;

        const completeAction: CompleteCreatingAccountAction = {
            type: UniAdminSignupEvents.CompleteCreatingAccount,
            success: false
        };

        // Validate passwords match
        if (password !== confirmedPassword) {
            completeAction.error = "Passwords do not match";
            return dispatch(completeAction);
        }

        // Validate password length
        if (password.length < 8) {
            completeAction.error = "Password must be at least 8 characters long";
            return dispatch(completeAction);
        }

        // Validate required fields
        if (!title || title === "-1") {
            completeAction.error = "Please select a title";
            return dispatch(completeAction);
        }

        if (!firstName.trim() || !lastName.trim()) {
            completeAction.error = "Please enter your first and last name";
            return dispatch(completeAction);
        }

        try {
            dispatch({
                type: UniAdminSignupEvents.CreatingAccount
            });

            const response = await Api.doPost(
                UniAdminInviteApiRoutes.completeSignupRoute,
                {
                    token,
                    title,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    password
                }
            );

            if (response.data.success) {
                completeAction.success = true;
                completeAction.customToken = response.data.customToken;
                completeAction.redirectTo = response.data.redirectTo;

                // Sign in with custom token
                if (response.data.customToken) {
                    try {
                        await firebase.auth().signInWithCustomToken(response.data.customToken);
                    } catch (authError) {
                        console.warn("Auto sign-in failed:", authError);
                        // Continue anyway, user can sign in manually
                    }
                }
            } else {
                completeAction.error = response.data.error || "Failed to create account";
            }

            return dispatch(completeAction);
        } catch (error: any) {
            completeAction.error = error.toString().includes("already exists")
                ? "An account with this email already exists"
                : error.toString();
            return dispatch(completeAction);
        }
    };
};

/**
 * Resets the signup state
 */
export const resetState: ActionCreator<any> = () => {
    return (dispatch: Dispatch) => {
        return dispatch({
            type: UniAdminSignupEvents.Reset
        });
    };
};
