import {
    CourseAdminInviteAction,
    CourseAdminInviteEvents,
    RequestAdminAccessSuccessAction,
    RequestAdminAccessErrorAction,
    ValidateInviteSuccessAction,
    ValidateInviteErrorAction,
    CompleteSignupSuccessAction,
    CompleteSignupErrorAction,
    ValidateUpgradeRequestSuccessAction,
    ValidateUpgradeRequestErrorAction,
    RespondToUpgradeSuccessAction,
    RespondToUpgradeErrorAction,
    FetchMyUpgradeRequestsSuccessAction,
    FetchMyUpgradeRequestsErrorAction
} from "../actions/courseAdminInviteActions";

/**
 * Invite data structure
 */
export interface InviteData {
    email: string;
    universityName: string;
    courseName: string;
    role: string;
}

/**
 * Upgrade request data structure
 */
export interface UpgradeRequestData {
    id: string;
    universityName: string;
    courseName: string;
    role: string;
    createdAt?: string;
    expiresAt?: string;
}

/**
 * Request admin access result
 */
export interface RequestAccessResult {
    success: boolean;
    type: 'signup_invitation' | 'upgrade_request';
    message: string;
    inviteId?: string;
    requestId?: string;
}

/**
 * Complete signup result
 */
export interface SignupResult {
    success: boolean;
    message: string;
    userId: string;
    customToken: string;
    redirectTo: string;
}

/**
 * Upgrade response result
 */
export interface UpgradeResponseResult {
    success: boolean;
    message: string;
    action: 'accepted' | 'declined';
}

/**
 * Course Admin Invite State
 */
export interface CourseAdminInviteState {
    // Request admin access state
    requestingAccess: boolean;
    requestAccessResult: RequestAccessResult | null;
    requestAccessError: string | null;

    // Validate invite state
    validatingInvite: boolean;
    inviteData: InviteData | null;
    inviteValid: boolean;
    inviteError: string | null;

    // Complete signup state
    completingSignup: boolean;
    signupResult: SignupResult | null;
    signupError: string | null;

    // Upgrade request validation state
    validatingUpgrade: boolean;
    upgradeRequestData: UpgradeRequestData | null;
    upgradeRequestValid: boolean;
    upgradeRequestError: string | null;

    // Respond to upgrade state
    respondingToUpgrade: boolean;
    upgradeResponseResult: UpgradeResponseResult | null;
    upgradeResponseError: string | null;

    // My upgrade requests state
    fetchingMyRequests: boolean;
    myUpgradeRequests: UpgradeRequestData[];
    myRequestsError: string | null;
}

const initialState: CourseAdminInviteState = {
    // Request admin access
    requestingAccess: false,
    requestAccessResult: null,
    requestAccessError: null,

    // Validate invite
    validatingInvite: false,
    inviteData: null,
    inviteValid: false,
    inviteError: null,

    // Complete signup
    completingSignup: false,
    signupResult: null,
    signupError: null,

    // Upgrade request validation
    validatingUpgrade: false,
    upgradeRequestData: null,
    upgradeRequestValid: false,
    upgradeRequestError: null,

    // Respond to upgrade
    respondingToUpgrade: false,
    upgradeResponseResult: null,
    upgradeResponseError: null,

    // My upgrade requests
    fetchingMyRequests: false,
    myUpgradeRequests: [],
    myRequestsError: null
};

/**
 * Selector functions
 */
export const isRequestingAccess = (state: CourseAdminInviteState): boolean => {
    return state.requestingAccess;
};

export const isValidatingInvite = (state: CourseAdminInviteState): boolean => {
    return state.validatingInvite;
};

export const isCompletingSignup = (state: CourseAdminInviteState): boolean => {
    return state.completingSignup;
};

export const isValidatingUpgrade = (state: CourseAdminInviteState): boolean => {
    return state.validatingUpgrade;
};

export const isRespondingToUpgrade = (state: CourseAdminInviteState): boolean => {
    return state.respondingToUpgrade;
};

export const isFetchingMyRequests = (state: CourseAdminInviteState): boolean => {
    return state.fetchingMyRequests;
};

export const hasInviteError = (state: CourseAdminInviteState): boolean => {
    return state.inviteError !== null;
};

export const hasSignupError = (state: CourseAdminInviteState): boolean => {
    return state.signupError !== null;
};

export const hasUpgradeRequestError = (state: CourseAdminInviteState): boolean => {
    return state.upgradeRequestError !== null;
};

/**
 * Reducer
 */
const courseAdminInviteReducer = (
    state: CourseAdminInviteState = initialState,
    action: CourseAdminInviteAction
): CourseAdminInviteState => {
    switch (action.type) {
        // Request Admin Access
        case CourseAdminInviteEvents.RequestAdminAccessStart:
            return {
                ...state,
                requestingAccess: true,
                requestAccessResult: null,
                requestAccessError: null
            };

        case CourseAdminInviteEvents.RequestAdminAccessSuccess:
            const requestSuccessAction = action as RequestAdminAccessSuccessAction;
            return {
                ...state,
                requestingAccess: false,
                requestAccessResult: requestSuccessAction.result,
                requestAccessError: null
            };

        case CourseAdminInviteEvents.RequestAdminAccessError:
            const requestErrorAction = action as RequestAdminAccessErrorAction;
            return {
                ...state,
                requestingAccess: false,
                requestAccessResult: null,
                requestAccessError: requestErrorAction.error
            };

        // Validate Invite
        case CourseAdminInviteEvents.ValidateInviteStart:
            return {
                ...state,
                validatingInvite: true,
                inviteData: null,
                inviteValid: false,
                inviteError: null
            };

        case CourseAdminInviteEvents.ValidateInviteSuccess:
            const validateSuccessAction = action as ValidateInviteSuccessAction;
            return {
                ...state,
                validatingInvite: false,
                inviteData: validateSuccessAction.inviteData.invite || null,
                inviteValid: validateSuccessAction.inviteData.valid,
                inviteError: null
            };

        case CourseAdminInviteEvents.ValidateInviteError:
            const validateErrorAction = action as ValidateInviteErrorAction;
            return {
                ...state,
                validatingInvite: false,
                inviteData: null,
                inviteValid: false,
                inviteError: validateErrorAction.error
            };

        // Complete Signup
        case CourseAdminInviteEvents.CompleteSignupStart:
            return {
                ...state,
                completingSignup: true,
                signupResult: null,
                signupError: null
            };

        case CourseAdminInviteEvents.CompleteSignupSuccess:
            const signupSuccessAction = action as CompleteSignupSuccessAction;
            return {
                ...state,
                completingSignup: false,
                signupResult: signupSuccessAction.result,
                signupError: null
            };

        case CourseAdminInviteEvents.CompleteSignupError:
            const signupErrorAction = action as CompleteSignupErrorAction;
            return {
                ...state,
                completingSignup: false,
                signupResult: null,
                signupError: signupErrorAction.error
            };

        // Validate Upgrade Request
        case CourseAdminInviteEvents.ValidateUpgradeRequestStart:
            return {
                ...state,
                validatingUpgrade: true,
                upgradeRequestData: null,
                upgradeRequestValid: false,
                upgradeRequestError: null
            };

        case CourseAdminInviteEvents.ValidateUpgradeRequestSuccess:
            const upgradeValidateSuccessAction = action as ValidateUpgradeRequestSuccessAction;
            return {
                ...state,
                validatingUpgrade: false,
                upgradeRequestData: upgradeValidateSuccessAction.requestData.request || null,
                upgradeRequestValid: upgradeValidateSuccessAction.requestData.valid,
                upgradeRequestError: null
            };

        case CourseAdminInviteEvents.ValidateUpgradeRequestError:
            const upgradeValidateErrorAction = action as ValidateUpgradeRequestErrorAction;
            return {
                ...state,
                validatingUpgrade: false,
                upgradeRequestData: null,
                upgradeRequestValid: false,
                upgradeRequestError: upgradeValidateErrorAction.error
            };

        // Respond to Upgrade
        case CourseAdminInviteEvents.RespondToUpgradeStart:
            return {
                ...state,
                respondingToUpgrade: true,
                upgradeResponseResult: null,
                upgradeResponseError: null
            };

        case CourseAdminInviteEvents.RespondToUpgradeSuccess:
            const respondSuccessAction = action as RespondToUpgradeSuccessAction;
            return {
                ...state,
                respondingToUpgrade: false,
                upgradeResponseResult: respondSuccessAction.result,
                upgradeResponseError: null
            };

        case CourseAdminInviteEvents.RespondToUpgradeError:
            const respondErrorAction = action as RespondToUpgradeErrorAction;
            return {
                ...state,
                respondingToUpgrade: false,
                upgradeResponseResult: null,
                upgradeResponseError: respondErrorAction.error
            };

        // Fetch My Requests
        case CourseAdminInviteEvents.FetchMyUpgradeRequestsStart:
            return {
                ...state,
                fetchingMyRequests: true,
                myRequestsError: null
            };

        case CourseAdminInviteEvents.FetchMyUpgradeRequestsSuccess:
            const fetchSuccessAction = action as FetchMyUpgradeRequestsSuccessAction;
            return {
                ...state,
                fetchingMyRequests: false,
                myUpgradeRequests: fetchSuccessAction.requests,
                myRequestsError: null
            };

        case CourseAdminInviteEvents.FetchMyUpgradeRequestsError:
            const fetchErrorAction = action as FetchMyUpgradeRequestsErrorAction;
            return {
                ...state,
                fetchingMyRequests: false,
                myRequestsError: fetchErrorAction.error
            };

        // Clear State
        case CourseAdminInviteEvents.ClearState:
            return initialState;

        default:
            return state;
    }
};

export default courseAdminInviteReducer;
