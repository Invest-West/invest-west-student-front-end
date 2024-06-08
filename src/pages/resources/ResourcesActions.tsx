import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../redux-store/reducers";
import EmailRepository, {ClientEmailTypes, ContactResourceEmailData} from "../../api/repositories/EmailRepository";
import User, {hasBusinessProfile} from "../../models/user";
import Admin, {isAdmin} from "../../models/admin";
import {openFeedbackSnackbar} from "../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ResourcesEvents {
    DetailedPageToggleContactDialog = "ResourcesEvents.DetailedPageToggleContactDialog",
    DetailedPageSendingContactEmail = "ResourcesEvents.DetailedPageSendingContactEmail",
    DetailedPageCompleteSendingContactEmail = "ResourcesEvents.DetailedPageCompleteSendingContactEmail"
}

export interface ResourcesAction extends Action {

}

export interface DetailedPageCompleteSendingContactEmailAction extends ResourcesAction {
    error?: string;
}

export const toggleContactResourceDialog: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: ResourcesEvents.DetailedPageToggleContactDialog
        });
    }
}

export const sendContactEmail: ActionCreator<any> = (receiver: string | string[]) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            detailedPageSendingContactEmail
        } = getState().ResourcesLocalState;

        if (detailedPageSendingContactEmail) {
            return;
        }

        const {
            currentUser
        } = getState().AuthenticationState;

        if (!currentUser) {
            return;
        }

        const admin: Admin | null = isAdmin(currentUser);

        dispatch({
            type: ResourcesEvents.DetailedPageSendingContactEmail
        });

        const completeAction: DetailedPageCompleteSendingContactEmailAction = {
            type: ResourcesEvents.DetailedPageCompleteSendingContactEmail
        };

        try {
            const emailInfo: ContactResourceEmailData = {
                receiver: receiver,
                sender: currentUser.email,
                userName: `${(currentUser as User).firstName} ${(currentUser as User).lastName}`,
                userCompanyName: `${admin ? "Not specified" : hasBusinessProfile((currentUser as User))
                    ? (currentUser as User).BusinessProfile?.companyName : "Not specified."}`
            };

            await new EmailRepository().sendEmail({
                emailType: ClientEmailTypes.ContactResource,
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