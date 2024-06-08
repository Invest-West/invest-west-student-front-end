import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import EmailRepository, {
    ClientEmailTypes,
    ContactPitchOwnerEmailData
} from "../../../../api/repositories/EmailRepository";
import User from "../../../../models/user";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ContactPitchOwnerDialogEvents {
    ToggleContactDialog = "ContactPitchOwnerDialogEvents.ToggleContactDialog",
    SendingContactEmail = "ContactPitchOwnerDialogEvents.SendingContactEmail",
    CompleteSendingContactEmail = "ContactPitchOwnerDialogEvents.CompleteSendingContactEmail"
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

export const toggleContactPitchOwnerDialog: ActionCreator<any> = (projectName?: string, projectOwnerEmail?: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ToggleContactDialogAction = {
            type: ContactPitchOwnerDialogEvents.ToggleContactDialog,
            projectName: projectName ?? null,
            projectOwnerEmail: projectOwnerEmail ?? null
        };
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

        if (!currentUser) {
            return;
        }

        dispatch({
            type: ContactPitchOwnerDialogEvents.SendingContactEmail
        });

        const completeAction: CompleteSendingContactEmailAction = {
            type: ContactPitchOwnerDialogEvents.CompleteSendingContactEmail
        };

        try {
            const emailInfo: ContactPitchOwnerEmailData = {
                receiver: projectOwnerEmail,
                sender: currentUser.email,
                userName: `${(currentUser as User).firstName} ${(currentUser as User).lastName}`,
                projectName: projectName
            };

            await new EmailRepository().sendEmail({
                emailType: ClientEmailTypes.ContactPitchOwner,
                emailInfo: emailInfo
            });

            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Success, "Email sent."));
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
        }
    }
}