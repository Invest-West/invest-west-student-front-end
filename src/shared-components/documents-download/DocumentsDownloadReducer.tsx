import {DocumentClickAction, DocumentsDownloadAction, DocumentsDownloadEvents} from "./DocumentsDownloadActions";
import {PitchDocument} from "../../models/project";

export interface DocumentsDownloadState {
    selectedDocument?: PitchDocument;
    openRiskWarningDialog: boolean;
}

const initialState: DocumentsDownloadState = {
    openRiskWarningDialog: false
}

const documentsDownloadReducer = (state: DocumentsDownloadState = initialState, action: DocumentsDownloadAction) => {
    switch (action.type) {
        case DocumentsDownloadEvents.OpenRiskWarningDialog:
            const openRiskWarningDialogAction: DocumentClickAction = action as DocumentClickAction;
            return {
                ...state,
                selectedDocument: openRiskWarningDialogAction.selectedDocument,
                openRiskWarningDialog: true
            }
        case DocumentsDownloadEvents.CloseRiskWarningDialog:
            return {
                ...state,
                selectedDocument: undefined,
                openRiskWarningDialog: false
            }
        default:
            return state;
    }
}

export default documentsDownloadReducer;