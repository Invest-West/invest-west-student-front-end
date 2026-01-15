import {
    CompleteSendingContactEmailAction,
    ContactPitchOwnerDialogAction,
    ContactPitchOwnerDialogEvents,
    ToggleContactDialogAction,
    UpdateSenderEmailAction,
    UpdateSenderNameAction,
    UpdateCompanyNameAction,
    UpdateCompanyPositionAction,
    UpdateCompanyEmailAction,
    UpdateMessageAction
} from "./ContactPitchOwnerDialogActions";
import Error from "../../../../models/error";

export interface ContactPitchOwnerDialogState {
    projectName: string | null;
    projectOwnerEmail: string | null;
    contactDialogOpen: boolean;
    sendingContactEmail: boolean;
    errorSendingContactEmail?: Error;
    senderName: string;
    companyName: string;
    companyPosition: string;
    companyEmail: string;
    message: string;
}

const initialState: ContactPitchOwnerDialogState = {
    projectName: null,
    projectOwnerEmail: null,
    contactDialogOpen: false,
    sendingContactEmail: false,
    senderName: '',
    companyName: '',
    companyPosition: '',
    companyEmail: '',
    message: ''
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
        case ContactPitchOwnerDialogEvents.UpdateSenderEmail:
            const updateSenderEmailAction: UpdateSenderEmailAction = action as UpdateSenderEmailAction;
            return {
                ...state,
                senderEmail: updateSenderEmailAction.senderEmail
            }
        case ContactPitchOwnerDialogEvents.UpdateSenderName:
            const updateSenderNameAction: UpdateSenderNameAction = action as UpdateSenderNameAction;
            return {
                ...state,
                senderName: updateSenderNameAction.senderName
            }
        case ContactPitchOwnerDialogEvents.UpdateCompanyName:
            const updateCompanyNameAction: UpdateCompanyNameAction = action as UpdateCompanyNameAction;
            return {
                ...state,
                companyName: updateCompanyNameAction.companyName
            }
        case ContactPitchOwnerDialogEvents.UpdateCompanyPosition:
            const updateCompanyPositionAction: UpdateCompanyPositionAction = action as UpdateCompanyPositionAction;
            return {
                ...state,
                companyPosition: updateCompanyPositionAction.companyPosition
            }
        case ContactPitchOwnerDialogEvents.UpdateCompanyEmail:
            const updateCompanyEmailAction: UpdateCompanyEmailAction = action as UpdateCompanyEmailAction;
            return {
                ...state,
                companyEmail: updateCompanyEmailAction.companyEmail
            }
        case ContactPitchOwnerDialogEvents.UpdateMessage:
            const updateMessageAction: UpdateMessageAction = action as UpdateMessageAction;
            return {
                ...state,
                message: updateMessageAction.message
            }
        default:
            return state;
    }
}

export default contactPitchOwnerDialogReducer;