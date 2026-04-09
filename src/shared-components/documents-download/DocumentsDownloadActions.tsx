import { Action, ActionCreator, Dispatch } from 'redux';
import { PitchDocument } from '../../models/project';
import { AppState } from '../../redux-store/reducers';
import { getDocumentType } from '../document-viewer/documentViewerUtils';

export enum DocumentsDownloadEvents {
  OpenRiskWarningDialog = 'DocumentsDownloadEvents.OpenRiskWarningDialog',
  CloseRiskWarningDialog = 'DocumentsDownloadEvents.CloseRiskWarningDialog',
  OpenPdfViewer = 'DocumentsDownloadEvents.OpenPdfViewer',
  ClosePdfViewer = 'DocumentsDownloadEvents.ClosePdfViewer',
}

export interface DocumentsDownloadAction extends Action {}

export interface DocumentClickAction extends DocumentsDownloadAction {
  selectedDocument?: PitchDocument;
}

export const onDocumentClick: ActionCreator<any> = (
  document: PitchDocument,
  shouldShowRiskWarning: boolean
) => {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const docType = getDocumentType(document.fileName);

    if (!shouldShowRiskWarning) {
      if (docType.canPreview) {
        // Open document viewer for all previewable file types (PDF, Word, PPT, Excel)
        const action: DocumentClickAction = {
          type: DocumentsDownloadEvents.OpenPdfViewer,
          selectedDocument: document,
        };
        return dispatch(action);
      } else {
        // For non-previewable files, do nothing (prevent automatic download)
        return;
      }
    }

    // Show risk warning dialog
    const action: DocumentClickAction = {
      type: DocumentsDownloadEvents.OpenRiskWarningDialog,
      selectedDocument: document,
    };
    return dispatch(action);
  };
};

export const onAcceptRiskWarningClick: ActionCreator<any> = () => {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const { selectedDocument } = getState().DocumentsDownloadLocalState;
    if (selectedDocument === undefined) {
      return;
    }

    const docType = getDocumentType(selectedDocument.fileName);

    if (docType.canPreview) {
      // Open document viewer for all previewable file types
      dispatch({
        type: DocumentsDownloadEvents.CloseRiskWarningDialog,
      });
      return dispatch({
        type: DocumentsDownloadEvents.OpenPdfViewer,
        selectedDocument: selectedDocument,
      });
    } else {
      // For non-previewable files, just close the risk warning
      return dispatch({
        type: DocumentsDownloadEvents.CloseRiskWarningDialog,
      });
    }
  };
};

export const onCancelRiskWarningClick: ActionCreator<any> = () => {
  return (dispatch: Dispatch, getState: () => AppState) => {
    return dispatch({
      type: DocumentsDownloadEvents.CloseRiskWarningDialog,
    });
  };
};

export const onClosePdfViewer: ActionCreator<any> = () => {
  return (dispatch: Dispatch, getState: () => AppState) => {
    return dispatch({
      type: DocumentsDownloadEvents.ClosePdfViewer,
    });
  };
};
