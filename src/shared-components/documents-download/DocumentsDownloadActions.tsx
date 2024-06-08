import {Action, ActionCreator, Dispatch} from "redux";
import {PitchDocument} from "../../models/project";
import {AppState} from "../../redux-store/reducers";

export enum DocumentsDownloadEvents {
    OpenRiskWarningDialog = "DocumentsDownloadEvents.OpenRiskWarningDialog",
    CloseRiskWarningDialog = "DocumentsDownloadEvents.CloseRiskWarningDialog"
}

export interface DocumentsDownloadAction extends Action {

}

export interface DocumentClickAction extends DocumentsDownloadAction {
    selectedDocument?: PitchDocument;
}

export const onDocumentClick: ActionCreator<any> = (document: PitchDocument, shouldShowRiskWarning: boolean) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        if (!shouldShowRiskWarning) {
            window.open(document.downloadURL, "_blank");
            return;
        }
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
        window.open(selectedDocument.downloadURL, "_blank");
        return dispatch({
            type: DocumentsDownloadEvents.CloseRiskWarningDialog
        });
    }
}

export const onCancelRiskWarningClick: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: DocumentsDownloadEvents.CloseRiskWarningDialog
        });
    }
}