import * as uploadFilesActions from '../actions/uploadFilesActions';
import {
    UPLOAD_LEGAL_DOCUMENTS_MODE,
    UPLOAD_PITCH_COVER_MODE,
    UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE,
    UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE
} from '../../shared-components/uploading-dialog/UploadingDialog';
import * as authActions from '../actions/authActions';

const initState = {
    mode: null, // file upload mode (e.g. Legal documents, Project cover, Project deck, and Project supporting documents)
    filesToBeUploaded: {
        legalDocuments: [],
        pitchCover: [],
        pitchPresentationDocument: [],
        pitchSupportingDocuments: []
    }, // arrays of files that will be uploaded to Firebase storage
    filesDBReferences: {
        legalDocuments: [],
        pitchCover: [],
        pitchPresentationDocument: [],
        pitchSupportingDocuments: []
    }, // references of the uploaded files in the Firebase realtime DB

    fileUploadErrorMessage: '',
    fileUploadErrorSnackbarOpen: false
};

const uploadFilesReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case uploadFilesActions.DELETE_TO_BE_UPLOADED_FILE:
            return {
                ...state,
                filesToBeUploaded: {
                    ...state.filesToBeUploaded,
                    legalDocuments:
                        action.mode === uploadFilesActions.DELETE_TO_BE_UPLOADED_LEGAL_DOCUMENT
                            ?
                            action.updatedFilesToBeUploaded
                            :
                            state.filesToBeUploaded.legalDocuments,
                    pitchCover:
                        action.mode === uploadFilesActions.DELETE_TO_BE_UPLOADED_PITCH_COVER
                            ?
                            action.updatedFilesToBeUploaded
                            :
                            state.filesToBeUploaded.pitchCover,
                    pitchPresentationDocument:
                        action.mode === uploadFilesActions.DELETE_TO_BE_UPLOADED_PITCH_PRESENTATION_DOCUMENT
                            ?
                            action.updatedFilesToBeUploaded
                            :
                            state.filesToBeUploaded.pitchPresentationDocument,
                    pitchSupportingDocuments:
                        action.mode === uploadFilesActions.DELETE_TO_BE_UPLOADED_PITCH_SUPPORTING_DOCUMENT
                            ?
                            action.updatedFilesToBeUploaded
                            :
                            state.filesToBeUploaded.pitchSupportingDocuments
                }
            };
        case uploadFilesActions.FINISHED_UPLOADING_ALL_FILES:
            return {
                ...state,
                filesToBeUploaded: {
                    ...state.filesToBeUploaded,
                    legalDocuments:
                        action.mode === UPLOAD_LEGAL_DOCUMENTS_MODE
                            ?
                            []
                            :
                            state.filesToBeUploaded.legalDocuments,
                    pitchCover:
                        action.mode === UPLOAD_PITCH_COVER_MODE
                            ?
                            []
                            :
                            state.filesToBeUploaded.pitchCover,
                    pitchPresentationDocument:
                        action.mode === UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE
                            ?
                            []
                            :
                            state.filesToBeUploaded.pitchPresentationDocument,
                    pitchSupportingDocuments:
                        action.mode === UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE
                            ?
                            []
                            :
                            state.filesToBeUploaded.pitchSupportingDocuments
                },
                filesDBReferences: {
                    ...state.filesToBeUploaded,
                    legalDocuments:
                        action.mode === UPLOAD_LEGAL_DOCUMENTS_MODE
                        && action.hasOwnProperty('waitingForUploadingReferences')
                        && !action.waitingForUploadingReferences
                            ?
                            []
                            :
                            state.filesDBReferences.legalDocuments,
                    pitchCover:
                        action.mode === UPLOAD_PITCH_COVER_MODE
                        && action.hasOwnProperty('waitingForUploadingReferences')
                        && !action.waitingForUploadingReferences
                            ?
                            []
                            :
                            state.filesDBReferences.pitchCover,
                    pitchPresentationDocument:
                        action.mode === UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE
                        && action.hasOwnProperty('waitingForUploadingReferences')
                        && !action.waitingForUploadingReferences
                            ?
                            []
                            :
                            state.filesDBReferences.pitchPresentationDocument,
                    pitchSupportingDocuments:
                        action.mode === UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE
                        && action.hasOwnProperty('waitingForUploadingReferences')
                        && !action.waitingForUploadingReferences
                            ?
                            []
                            :
                            state.filesDBReferences.pitchSupportingDocuments
                },
                mode: null,
                fileUploadErrorMessage: '',
                fileUploadErrorSnackbarOpen: false
            };
        case uploadFilesActions.FILE_UPLOAD_CHANGED:
            return {
                ...state,
                filesToBeUploaded: {
                    ...state.filesToBeUploaded,
                    legalDocuments:
                        action.mode === UPLOAD_LEGAL_DOCUMENTS_MODE
                            ?
                            [...state.filesToBeUploaded.legalDocuments, action.fileRead]
                            :
                            state.filesToBeUploaded.legalDocuments,
                    pitchCover:
                        action.mode === UPLOAD_PITCH_COVER_MODE
                            ?
                            [action.fileRead]
                            :
                            state.filesToBeUploaded.pitchCover,
                    pitchPresentationDocument:
                        action.mode === UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE
                            ?
                            [action.fileRead]
                            :
                            state.filesToBeUploaded.pitchPresentationDocument,
                    pitchSupportingDocuments:
                        action.mode === UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE
                            ?
                            [...state.filesToBeUploaded.pitchSupportingDocuments, action.fileRead]
                            :
                            state.filesToBeUploaded.pitchSupportingDocuments
                }
            };
        case uploadFilesActions.FILE_UPLOAD_ERROR:
            return {
                ...state,
                fileUploadErrorMessage: action.error,
                fileUploadErrorSnackbarOpen: true
            };
        case uploadFilesActions.CLOSE_FILE_UPLOAD_ERROR_SNACKBAR:
            return {
                ...state,
                fileUploadErrorSnackbarOpen: false
            };
        case uploadFilesActions.RESET_ERROR_MESSAGE_WHEN_FILE_UPLOAD_ERROR_SNACKBAR_EXITED:
            return {
                ...state,
                fileUploadErrorMessage: ''
            };
        case uploadFilesActions.FINISHED_UPLOADING_A_LEGAL_DOCUMENT:
            return {
                ...state,
                filesDBReferences: {
                    ...state.filesDBReferences,
                    legalDocuments: [...state.filesDBReferences.legalDocuments, action.fileDBRef]
                }
            };
        case uploadFilesActions.FINISHED_UPLOADING_A_PITCH_COVER:
            return {
                ...state,
                filesDBReferences: {
                    ...state.filesDBReferences,
                    pitchCover: [...state.filesDBReferences.pitchCover, action.fileDBRef]
                }
            };
        case uploadFilesActions.FINISHED_UPLOADING_A_PITCH_PRESENTATION_DOCUMENT:
            return {
                ...state,
                filesDBReferences: {
                    ...state.filesDBReferences,
                    pitchPresentationDocument: [...state.filesDBReferences.pitchPresentationDocument, action.fileDBRef]
                }
            };
        case uploadFilesActions.FINISHED_UPLOADING_A_PITCH_SUPPORTING_DOCUMENT:
            return {
                ...state,
                filesDBReferences: {
                    ...state.filesDBReferences,
                    pitchSupportingDocuments: [...state.filesDBReferences.pitchSupportingDocuments, action.fileDBRef]
                }
            };
        default:
            return state;
    }
};

export default uploadFilesReducer;