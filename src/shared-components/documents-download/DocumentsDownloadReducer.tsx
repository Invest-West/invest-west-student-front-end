import {DocumentClickAction, DocumentsDownloadAction, DocumentsDownloadEvents} from "./DocumentsDownloadActions";
import {PitchDocument} from "../../models/project";

export interface DocumentsDownloadState {
    selectedDocument?: PitchDocument;
    openRiskWarningDialog: boolean;
    openPdfViewer: boolean;
}

const initialState: DocumentsDownloadState = {
    openRiskWarningDialog: false,
    openPdfViewer: false
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
        case DocumentsDownloadEvents.OpenPdfViewer:
            const openPdfViewerAction: DocumentClickAction = action as DocumentClickAction;
            return {
                ...state,
                selectedDocument: openPdfViewerAction.selectedDocument,
                openPdfViewer: true
            }
        case DocumentsDownloadEvents.ClosePdfViewer:
            return {
                ...state,
                selectedDocument: undefined,
                openPdfViewer: false
            }
        default:
            return state;
    }
}

export default documentsDownloadReducer;