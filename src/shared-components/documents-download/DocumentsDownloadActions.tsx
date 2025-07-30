import {Action, ActionCreator, Dispatch} from "redux";
import {PitchDocument} from "../../models/project";
import {AppState} from "../../redux-store/reducers";

export enum DocumentsDownloadEvents {
    OpenRiskWarningDialog = "DocumentsDownloadEvents.OpenRiskWarningDialog",
    CloseRiskWarningDialog = "DocumentsDownloadEvents.CloseRiskWarningDialog",
    OpenPdfViewer = "DocumentsDownloadEvents.OpenPdfViewer",
    ClosePdfViewer = "DocumentsDownloadEvents.ClosePdfViewer"
}

export interface DocumentsDownloadAction extends Action {

}

export interface DocumentClickAction extends DocumentsDownloadAction {
    selectedDocument?: PitchDocument;
}

export const onDocumentClick: ActionCreator<any> = (document: PitchDocument, shouldShowRiskWarning: boolean) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        // Check if it's a PDF file
        const isPdf = document.fileName.toLowerCase().endsWith('.pdf');
        
        if (!shouldShowRiskWarning) {
            if (isPdf) {
                // Open PDF viewer for PDF files
                const action: DocumentClickAction = {
                    type: DocumentsDownloadEvents.OpenPdfViewer,
                    selectedDocument: document
                };
                return dispatch(action);
            } else {
                // For non-PDF files, do nothing (prevent automatic download)
                return;
            }
        }
        
        // Show risk warning dialog
        const action: DocumentClickAction = {
            type: DocumentsDownloadEvents.OpenRiskWarningDialog,
            selectedDocument: document
        };
        return dispatch(action);
    }
}

export const onAcceptRiskWarningClick: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const {
            selectedDocument
        } = getState().DocumentsDownloadLocalState;
        if (selectedDocument === undefined) {
            return;
        }
        
        // Check if it's a PDF file
        const isPdf = selectedDocument.fileName.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
            // Open PDF viewer for PDF files
            dispatch({
                type: DocumentsDownloadEvents.CloseRiskWarningDialog
            });
            return dispatch({
                type: DocumentsDownloadEvents.OpenPdfViewer,
                selectedDocument: selectedDocument
            });
        } else {
            // For non-PDF files, do nothing (prevent automatic download)
            return dispatch({
                type: DocumentsDownloadEvents.CloseRiskWarningDialog
            });
        }
    }
}

export const onCancelRiskWarningClick: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: DocumentsDownloadEvents.CloseRiskWarningDialog
        });
    }
}

export const onClosePdfViewer: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: DocumentsDownloadEvents.ClosePdfViewer
        });
    }
}