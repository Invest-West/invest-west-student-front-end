import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import EmailRepository, {
    ClientEmailTypes,
    ContactPitchOwnerEmailData
} from "../../../../api/repositories/EmailRepository";
import * as emailUtils from "../../../../utils/emailUtils";
import User from "../../../../models/user";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ContactPitchOwnerDialogEvents {
    ToggleContactDialog = "ContactPitchOwnerDialogEvents.ToggleContactDialog",
    SendingContactEmail = "ContactPitchOwnerDialogEvents.SendingContactEmail",
    CompleteSendingContactEmail = "ContactPitchOwnerDialogEvents.CompleteSendingContactEmail",
    UpdateSenderEmail = "ContactPitchOwnerDialogEvents.UpdateSenderEmail",
    UpdateSenderName = "ContactPitchOwnerDialogEvents.UpdateSenderName"
}

export interface ContactPitchOwnerDialogAction extends Action {

}

export interface ToggleContactDialogAction extends ContactPitchOwnerDialogAction {
    projectName: string | null;
    projectOwnerEmail: string | null;
}

export interface CompleteSendingContactEmailAction extends ContactPitchOwnerDialogAction {
    error?: string;
}

export interface UpdateSenderEmailAction extends ContactPitchOwnerDialogAction {
    senderEmail: string;
}

export interface UpdateSenderNameAction extends ContactPitchOwnerDialogAction {
    senderName: string;
}

export const toggleContactPitchOwnerDialog: ActionCreator<any> = (projectName?: string, projectOwnerEmail?: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const { currentUser } = getState().AuthenticationState;
        const action: ToggleContactDialogAction = {
            type: ContactPitchOwnerDialogEvents.ToggleContactDialog,
            projectName: projectName ?? null,
            projectOwnerEmail: projectOwnerEmail ?? null
        };
        
        // Initialize sender email and name when opening dialog
        if (projectName && projectOwnerEmail) {
            if (currentUser) {
                dispatch({
                    type: ContactPitchOwnerDialogEvents.UpdateSenderEmail,
                    senderEmail: currentUser.email
                });
                dispatch({
                    type: ContactPitchOwnerDialogEvents.UpdateSenderName,
                    senderName: `${(currentUser as User).firstName} ${(currentUser as User).lastName}`
                });
            } else {
                // Clear fields for non-logged-in users
                dispatch({
                    type: ContactPitchOwnerDialogEvents.UpdateSenderEmail,
                    senderEmail: ''
                });
                dispatch({
                    type: ContactPitchOwnerDialogEvents.UpdateSenderName,
                    senderName: ''
                });
            }
        }
        
        return dispatch(action);
    }
}

export const sendContactEmail: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            projectName,
            projectOwnerEmail,
            sendingContactEmail
        } = getState().ContactPitchOwnerDialogLocalState;

        if (sendingContactEmail) {
            return;
        }

        if (!projectName || !projectOwnerEmail) {
            return;
        }

        const {
            currentUser
        } = getState().AuthenticationState;

        const { senderEmail, senderName } = getState().ContactPitchOwnerDialogLocalState;
        
        // Validate required fields
        if (!senderEmail || !senderName) {
            return;
        }

        dispatch({
            type: ContactPitchOwnerDialogEvents.SendingContactEmail
        });

        const completeAction: CompleteSendingContactEmailAction = {
            type: ContactPitchOwnerDialogEvents.CompleteSendingContactEmail
        };

        try {
            const { senderEmail, senderName } = getState().ContactPitchOwnerDialogLocalState;
            
            // Get server URL from clubAttributes (same as working ContactUs and invitations)
            const state = getState() as any; // Cast to access legacy reducer
            const { clubAttributes } = state.manageClubAttributes || {};
            
            if (!clubAttributes || !clubAttributes.serverURL) {
                console.error('Server URL not available in clubAttributes. State:', state.manageClubAttributes);
                throw new Error('Server configuration not available. Please refresh the page.');
            }
            
            const emailData = {
                receiver: projectOwnerEmail,
                sender: senderEmail,
                userName: senderName,
                projectName: projectName
            };

            console.log('Sending contact email with data:', emailData);
            console.log('Using server URL:', clubAttributes.serverURL);
            console.log('Email type enum value:', emailUtils.EMAIL_CONTACT_PITCH_OWNER);
            console.log('Sending email with exact data:', {
                serverURL: clubAttributes.serverURL,
                emailType: emailUtils.EMAIL_CONTACT_PITCH_OWNER,
                data: emailData
            });
            
            // Try with EMAIL_CONTACT_PITCH_OWNER first, fallback to EMAIL_ENQUIRY if needed
            let emailTypeToUse = emailUtils.EMAIL_CONTACT_PITCH_OWNER;
            let emailDataToUse: any = emailData;
            
            try {
                // Use the working emailUtils.sendEmail method (same as ContactUs)
                await emailUtils.sendEmail({
                    serverURL: clubAttributes.serverURL,
                    emailType: emailTypeToUse,
                    data: emailDataToUse
                });
            } catch (firstError) {
                console.warn('ContactPitchOwner email type failed, trying EMAIL_ENQUIRY:', firstError);
                
                // Fallback to EMAIL_ENQUIRY format (like ContactUs)
                emailTypeToUse = emailUtils.EMAIL_ENQUIRY;
                emailDataToUse = {
                    sender: senderEmail,
                    receiver: projectOwnerEmail,
                    subject: `Contact request about project: ${projectName}`,
                    description: `${senderName} would like to know more about your project "${projectName}". Please contact them at ${senderEmail}.`,
                    senderName: senderName,
                    senderPhone: '' // Not required for this use case
                } as any; // Cast to any to avoid type conflicts
                
                console.log('Retrying with EMAIL_ENQUIRY format:', {
                    serverURL: clubAttributes.serverURL,
                    emailType: emailTypeToUse,
                    data: emailDataToUse
                });
                
                await emailUtils.sendEmail({
                    serverURL: clubAttributes.serverURL,
                    emailType: emailTypeToUse,
                    data: emailDataToUse
                });
            }
            
            console.log('Email sent successfully!');
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Success, "Email sent successfully."));
        } catch (error) {
            console.error('Email sending failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                statusCode: error.statusCode,
                response: error.response,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                responseHeaders: error.response?.headers
            });
            
            // Log the exact request data that failed
            const state = getState() as any;
            const { clubAttributes: logClubAttributes } = state.manageClubAttributes || {};
            console.error('Failed request data:', {
                serverURL: logClubAttributes?.serverURL,
                emailType: emailUtils.EMAIL_CONTACT_PITCH_OWNER,
                emailData: emailData
            });
            
            let errorMessage = 'Failed to send email.';
            if (error.statusCode === 404) {
                errorMessage = 'Email service not available. Please try again later.';
            } else if (error.statusCode === 400) {
                errorMessage = 'Invalid email data. Please check your information.';
            } else if (error.statusCode === 401 || error.statusCode === 403) {
                errorMessage = 'Authentication failed. Please refresh and try again.';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            
            completeAction.error = errorMessage;
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, errorMessage));
        }
    }
}

export const updateSenderEmail: ActionCreator<any> = (senderEmail: string) => {
    return (dispatch: Dispatch) => {
        const action: UpdateSenderEmailAction = {
            type: ContactPitchOwnerDialogEvents.UpdateSenderEmail,
            senderEmail: senderEmail
        };
        return dispatch(action);
    }
}

export const updateSenderName: ActionCreator<any> = (senderName: string) => {
    return (dispatch: Dispatch) => {
        const action: UpdateSenderNameAction = {
            type: ContactPitchOwnerDialogEvents.UpdateSenderName,
            senderName: senderName
        };
        return dispatch(action);
    }
}