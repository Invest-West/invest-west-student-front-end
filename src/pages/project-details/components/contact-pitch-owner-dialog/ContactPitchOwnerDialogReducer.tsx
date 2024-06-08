import {
    CompleteSendingContactEmailAction,
    ContactPitchOwnerDialogAction,
    ContactPitchOwnerDialogEvents,
    ToggleContactDialogAction
} from "./ContactPitchOwnerDialogActions";
import Error from "../../../../models/error";

export interface ContactPitchOwnerDialogState {
    projectName: string | null;
    projectOwnerEmail: string | null;
    contactDialogOpen: boolean;
    sendingContactEmail: boolean;
    errorSendingContactEmail?: Error;
}

const initialState: ContactPitchOwnerDialogState = {
    projectName: null,
    projectOwnerEmail: null,
    contactDialogOpen: false,
    sendingContactEmail: false
}

export const isSendingContactEmail = (state: ContactPitchOwnerDialogState) => {
    return state.sendingContactEmail;
}

export const hasErrorSendingContactEmail = (state: ContactPitchOwnerDialogState) => {
    return !state.sendingContactEmail && state.errorSendingContactEmail !== undefined;
}

const contactPitchOwnerDialogReducer = (state = initialState, action: ContactPitchOwnerDialogAction) => {
    switch (action.type) {
        case ContactPitchOwnerDialogEvents.ToggleContactDialog:
            const toggleContactDialogAction: ToggleContactDialogAction = action as ToggleContactDialogAction;
            return {
                ...state,
                contactDialogOpen: !state.contactDialogOpen,
                projectName: toggleContactDialogAction.projectName,
                projectOwnerEmail: toggleContactDialogAction.projectOwnerEmail
            }
        case ContactPitchOwnerDialogEvents.SendingContactEmail:
            return {
                ...state,
                sendingContactEmail: true,
                errorSendingContactEmail: undefined
            }
        case ContactPitchOwnerDialogEvents.CompleteSendingContactEmail:
            const completeSendingContactEmailFunction: CompleteSendingContactEmailAction = action as CompleteSendingContactEmailAction;
            return {
                ...state,
                contactDialogOpen: false,
                sendingContactEmail: false,
                errorSendingContactEmail: completeSendingContactEmailFunction.error !== undefined
                    ? {detail: completeSendingContactEmailFunction.error}
                    : state.errorSendingContactEmail
            }
        default:
            return state;
    }
}

export default contactPitchOwnerDialogReducer;