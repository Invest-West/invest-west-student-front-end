import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../reducers";
import CourseAdminInviteRepository, {
    RequestAdminAccessData,
    CourseAdminSignupData,
    UpgradeResponseData
} from "../../api/repositories/CourseAdminInviteRepository";

/**
 * Action types for course admin invite operations
 */
export enum CourseAdminInviteEvents {
    // Request admin access
    RequestAdminAccessStart = "CourseAdminInviteEvents.RequestAdminAccessStart",
    RequestAdminAccessSuccess = "CourseAdminInviteEvents.RequestAdminAccessSuccess",
    RequestAdminAccessError = "CourseAdminInviteEvents.RequestAdminAccessError",

    // Validate invite
    ValidateInviteStart = "CourseAdminInviteEvents.ValidateInviteStart",
    ValidateInviteSuccess = "CourseAdminInviteEvents.ValidateInviteSuccess",
    ValidateInviteError = "CourseAdminInviteEvents.ValidateInviteError",

    // Complete signup
    CompleteSignupStart = "CourseAdminInviteEvents.CompleteSignupStart",
    CompleteSignupSuccess = "CourseAdminInviteEvents.CompleteSignupSuccess",
    CompleteSignupError = "CourseAdminInviteEvents.CompleteSignupError",

    // Validate upgrade request
    ValidateUpgradeRequestStart = "CourseAdminInviteEvents.ValidateUpgradeRequestStart",
    ValidateUpgradeRequestSuccess = "CourseAdminInviteEvents.ValidateUpgradeRequestSuccess",
    ValidateUpgradeRequestError = "CourseAdminInviteEvents.ValidateUpgradeRequestError",

    // Respond to upgrade
    RespondToUpgradeStart = "CourseAdminInviteEvents.RespondToUpgradeStart",
    RespondToUpgradeSuccess = "CourseAdminInviteEvents.RespondToUpgradeSuccess",
    RespondToUpgradeError = "CourseAdminInviteEvents.RespondToUpgradeError",

    // Fetch my upgrade requests
    FetchMyUpgradeRequestsStart = "CourseAdminInviteEvents.FetchMyUpgradeRequestsStart",
    FetchMyUpgradeRequestsSuccess = "CourseAdminInviteEvents.FetchMyUpgradeRequestsSuccess",
    FetchMyUpgradeRequestsError = "CourseAdminInviteEvents.FetchMyUpgradeRequestsError",

    // Clear state
    ClearState = "CourseAdminInviteEvents.ClearState"
}

/**
 * Action interfaces
 */
export interface CourseAdminInviteAction extends Action {
}

export interface RequestAdminAccessSuccessAction extends CourseAdminInviteAction {
    result: {
        success: boolean;
        type: 'signup_invitation' | 'upgrade_request';
        message: string;
        inviteId?: string;
        requestId?: string;
    };
}

export interface RequestAdminAccessErrorAction extends CourseAdminInviteAction {
    error: string;
}

export interface ValidateInviteSuccessAction extends CourseAdminInviteAction {
    inviteData: {
        valid: boolean;
        invite?: {
            email: string;
            universityName: string;
            courseName: string;
            role: string;
        };
    };
}

export interface ValidateInviteErrorAction extends CourseAdminInviteAction {
    error: string;
}

export interface CompleteSignupSuccessAction extends CourseAdminInviteAction {
    result: {
        success: boolean;
        message: string;
        userId: string;
        customToken: string;
        redirectTo: string;
    };
}

export interface CompleteSignupErrorAction extends CourseAdminInviteAction {
    error: string;
}

export interface ValidateUpgradeRequestSuccessAction extends CourseAdminInviteAction {
    requestData: {
        valid: boolean;
        request?: {
            id: string;
            universityName: string;
            courseName: string;
            role: string;
        };
    };
}

export interface ValidateUpgradeRequestErrorAction extends CourseAdminInviteAction {
    error: string;
}

export interface RespondToUpgradeSuccessAction extends CourseAdminInviteAction {
    result: {
        success: boolean;
        message: string;
        action: 'accepted' | 'declined';
    };
}

export interface RespondToUpgradeErrorAction extends CourseAdminInviteAction {
    error: string;
}

export interface FetchMyUpgradeRequestsSuccessAction extends CourseAdminInviteAction {
    requests: Array<{
        id: string;
        universityName: string;
        courseName: string;
        role: string;
        createdAt: string;
        expiresAt: string;
    }>;
}

export interface FetchMyUpgradeRequestsErrorAction extends CourseAdminInviteAction {
    error: string;
}

/**
 * Request admin access for an email (super admin only)
 */
export const requestAdminAccess: ActionCreator<any> = (data: RequestAdminAccessData) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: CourseAdminInviteEvents.RequestAdminAccessStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.requestAdminAccess(data);

            const successAction: RequestAdminAccessSuccessAction = {
                type: CourseAdminInviteEvents.RequestAdminAccessSuccess,
                result: response.data
            };

            dispatch(successAction);
            return response.data;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error ||
                                 error.response?.data?.message ||
                                 'Failed to send invitation';

            const errorAction: RequestAdminAccessErrorAction = {
                type: CourseAdminInviteEvents.RequestAdminAccessError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Validate course admin invite token (public)
 */
export const validateCourseAdminInvite: ActionCreator<any> = (token: string) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: CourseAdminInviteEvents.ValidateInviteStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.validateCourseAdminInvite(token);

            const successAction: ValidateInviteSuccessAction = {
                type: CourseAdminInviteEvents.ValidateInviteSuccess,
                inviteData: response.data
            };

            dispatch(successAction);
            return response.data;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Invalid invitation';

            const errorAction: ValidateInviteErrorAction = {
                type: CourseAdminInviteEvents.ValidateInviteError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Complete course admin signup (public)
 */
export const completeCourseAdminSignup: ActionCreator<any> = (data: CourseAdminSignupData) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: CourseAdminInviteEvents.CompleteSignupStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.completeCourseAdminSignup(data);

            const successAction: CompleteSignupSuccessAction = {
                type: CourseAdminInviteEvents.CompleteSignupSuccess,
                result: response.data
            };

            dispatch(successAction);
            return response.data;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to create account';

            const errorAction: CompleteSignupErrorAction = {
                type: CourseAdminInviteEvents.CompleteSignupError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Validate upgrade request (auth required)
 */
export const validateUpgradeRequest: ActionCreator<any> = (requestId: string) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: CourseAdminInviteEvents.ValidateUpgradeRequestStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.validateUpgradeRequest(requestId);

            const successAction: ValidateUpgradeRequestSuccessAction = {
                type: CourseAdminInviteEvents.ValidateUpgradeRequestSuccess,
                requestData: response.data
            };

            dispatch(successAction);
            return response.data;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Invalid request';

            const errorAction: ValidateUpgradeRequestErrorAction = {
                type: CourseAdminInviteEvents.ValidateUpgradeRequestError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Respond to upgrade request (auth required)
 */
export const respondToUpgradeRequest: ActionCreator<any> = (data: UpgradeResponseData) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: CourseAdminInviteEvents.RespondToUpgradeStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.respondToUpgradeRequest(data);

            const successAction: RespondToUpgradeSuccessAction = {
                type: CourseAdminInviteEvents.RespondToUpgradeSuccess,
                result: response.data
            };

            dispatch(successAction);
            return response.data;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to respond to request';

            const errorAction: RespondToUpgradeErrorAction = {
                type: CourseAdminInviteEvents.RespondToUpgradeError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Fetch pending upgrade requests for the current user (auth required)
 */
export const fetchMyUpgradeRequests: ActionCreator<any> = () => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: CourseAdminInviteEvents.FetchMyUpgradeRequestsStart
        });

        try {
            const repository = new CourseAdminInviteRepository();
            const response = await repository.getMyUpgradeRequests();

            const successAction: FetchMyUpgradeRequestsSuccessAction = {
                type: CourseAdminInviteEvents.FetchMyUpgradeRequestsSuccess,
                requests: response.data.requests
            };

            dispatch(successAction);
            return response.data.requests;

        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch requests';

            const errorAction: FetchMyUpgradeRequestsErrorAction = {
                type: CourseAdminInviteEvents.FetchMyUpgradeRequestsError,
                error: errorMessage
            };

            dispatch(errorAction);
            throw new Error(errorMessage);
        }
    };
};

/**
 * Clear course admin invite state
 */
export const clearCourseAdminInviteState: ActionCreator<CourseAdminInviteAction> = () => {
    return {
        type: CourseAdminInviteEvents.ClearState
    };
};
