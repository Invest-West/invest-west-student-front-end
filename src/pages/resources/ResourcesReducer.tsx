import {DetailedPageCompleteSendingContactEmailAction, ResourcesAction, ResourcesEvents} from "./ResourcesActions";
import Error from "../../models/error";

export interface ResourcesState {
    detailedPageContactDialogOpen: boolean;
    detailedPageSendingContactEmail: boolean;
    detailedPageErrorSendingContactEmail?: Error;
}

const initialState: ResourcesState = {
    detailedPageContactDialogOpen: false,
    detailedPageSendingContactEmail: false
}

export const isDetailedPageSendingContactEmail = (state: ResourcesState) => {
    return state.detailedPageSendingContactEmail;
}

export const hasErrorSendingContactEmailInDetailedPage = (state: ResourcesState) => {
    return !state.detailedPageSendingContactEmail && state.detailedPageErrorSendingContactEmail !== undefined;
}

const resourcesReducer = (state = initialState, action: ResourcesAction) => {
    switch (action.type) {
        case ResourcesEvents.DetailedPageToggleContactDialog:
            return {
                ...state,
                detailedPageContactDialogOpen: !state.detailedPageContactDialogOpen
            }
        case ResourcesEvents.DetailedPageSendingContactEmail:
            return {
                ...state,
                detailedPageSendingContactEmail: true,
                detailedPageErrorSendingContactEmail: undefined
            }
        case ResourcesEvents.DetailedPageCompleteSendingContactEmail:
            const detailedPageCompleteSendingContactEmailAction: DetailedPageCompleteSendingContactEmailAction = action as DetailedPageCompleteSendingContactEmailAction;
            return {
                ...state,
                detailedPageContactDialogOpen: false,
                detailedPageSendingContactEmail: false,
                detailedPageErrorSendingContactEmail: detailedPageCompleteSendingContactEmailAction.error !== undefined
                    ? {detail: detailedPageCompleteSendingContactEmailAction.error}
                    : state.detailedPageErrorSendingContactEmail
            }
        default:
            return state;
    }
}

export default resourcesReducer;