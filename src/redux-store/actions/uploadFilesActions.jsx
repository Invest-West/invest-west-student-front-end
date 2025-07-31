import firebase from '../../firebase/firebaseApp';
import * as utils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';
import {UPLOADING} from './uploadingStatusActions';
import {
    UPLOAD_LEGAL_DOCUMENTS_MODE,
    UPLOAD_PITCH_COVER_MODE,
    UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE,
    UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE,
    UPLOAD_ERROR,
    UPLOAD_DONE_MODE
} from '../../shared-components/uploading-dialog/UploadingDialog';

export const FILE_UPLOAD_CHANGED = 'FILE_UPLOAD_CHANGED';
export const handleFilesChanged = (mode, files, user = null, project = null) => {
    return (dispatch, getState) => {

        const fileUploadErrorMessage = getState().uploadFiles.fileUploadErrorMessage;
        const fileUploadErrorSnackbarOpen = getState().uploadFiles.fileUploadErrorSnackbarOpen;

        if (fileUploadErrorMessage.trim().length > 0 || fileUploadErrorSnackbarOpen) {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const fileRead = {
                file: files[files.length - 1],
                preview: reader.result,
                description: '' // Initialize empty description
            };

            switch (mode) {
                case UPLOAD_LEGAL_DOCUMENTS_MODE:

                    const legalDocuments = getState().uploadFiles.filesToBeUploaded.legalDocuments;

                    // user is an issuer
                    if (user.type === DB_CONST.TYPE_ISSUER) {
                        if (user.LegalDocuments) {
                            if (legalDocuments.length >=
                                DB_CONST.MAX_LEGAL_DOCUMENTS_UPLOAD_FOR_ISSUER - user.LegalDocuments.filter(document => !document.hasOwnProperty('removed')).length) {
                                dispatch({
                                    type: FILE_UPLOAD_ERROR,
                                    error: 'Max file count reached'
                                });
                                return;
                            }
                        } else {
                            if (legalDocuments.length >= DB_CONST.MAX_LEGAL_DOCUMENTS_UPLOAD_FOR_ISSUER) {
                                dispatch({
                                    type: FILE_UPLOAD_ERROR,
                                    error: 'Max file count reached'
                                });
                                return;
                            }
                        }
                    }
                    // user is an investor
                    else if (user.type === DB_CONST.TYPE_INVESTOR) {
                        if (legalDocuments.length >= 1) {
                            dispatch({
                                type: FILE_UPLOAD_ERROR,
                                error: 'Max file count reached'
                            });
                            return;
                        }
                    }
                    else {
                        return;
                    }
                    break;
                case UPLOAD_PITCH_COVER_MODE:
                    return;
                case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                    return;
                case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                    return;
                default:
                    return;
            }

            dispatch({
                type: FILE_UPLOAD_CHANGED,
                mode,
                fileRead
            });
        });
        reader.readAsDataURL(files[files.length - 1]);
    }
};

export const FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR';
export const handleFileError = (error, file) => {
    return (dispatch, getState) => {
        // handle file upload error
        let errorMessage = error.message;
        errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

        dispatch({
            type: FILE_UPLOAD_ERROR,
            error: errorMessage
        });
    }
};

export const CLOSE_FILE_UPLOAD_ERROR_SNACKBAR = 'CLOSE_FILE_UPLOAD_ERROR_SNACKBAR';
export const closeErrorSnackbar = () => {
    return {
        type: CLOSE_FILE_UPLOAD_ERROR_SNACKBAR
    }
};

export const UPDATE_DOCUMENT_DESCRIPTION = 'UPDATE_DOCUMENT_DESCRIPTION';
export const updateDocumentDescription = (mode, index, description) => {
    return {
        type: UPDATE_DOCUMENT_DESCRIPTION,
        mode,
        index,
        description
    };
};

export const RESET_ERROR_MESSAGE_WHEN_FILE_UPLOAD_ERROR_SNACKBAR_EXITED = 'RESET_ERROR_MESSAGE_WHEN_FILE_UPLOAD_ERROR_SNACKBAR_EXITED';
export const resetErrorMessageWhenSnackbarExited = () => {
    return {
        type: RESET_ERROR_MESSAGE_WHEN_FILE_UPLOAD_ERROR_SNACKBAR_EXITED
    }
};

export const DELETE_UPLOADED_LEGAL_DOCUMENT = 'DELETE_UPLOADED_LEGAL_DOCUMENT';
export const DELETE_UPLOADED_PITCH_COVER = 'DELETE_UPLOADED_PITCH_COVER';
export const DELETE_UPLOADED_PITCH_PRESENTATION_DOCUMENT = 'DELETED_UPLOADED_PITCH_PRESENTATION_DOCUMENT';
export const DELETE_UPLOADED_PITCH_SUPPORTING_DOCUMENT = 'DELETE_UPLOADED_PITCH_SUPPORTING_DOCUMENT';
export const deleteUploadedFile = (mode, index, user = null, project = null) => {
    return (dispatch, getState) => {
        switch (mode) {
            case DELETE_UPLOADED_LEGAL_DOCUMENT:
                const legalDocumentsUserID = getState().legalDocuments.userID;
                let updateLegalDocuments = [...getState().legalDocuments.legalDocuments];
                updateLegalDocuments[index].removed = true;
                firebase
                    .database()
                    .ref(DB_CONST.LEGAL_DOCUMENTS_CHILD)
                    .child(legalDocumentsUserID)
                    .update(updateLegalDocuments);
                return;
            case DELETE_UPLOADED_PITCH_COVER:
                return;
            case DELETE_UPLOADED_PITCH_PRESENTATION_DOCUMENT:
                return;
            case DELETE_UPLOADED_PITCH_SUPPORTING_DOCUMENT:
                return;
            default:
                return;
        }
    }
};

export const DELETE_TO_BE_UPLOADED_FILE = 'DELETE_TO_BE_UPLOADED_FILE';
export const DELETE_TO_BE_UPLOADED_LEGAL_DOCUMENT = 'DELETE_TO_BE_UPLOADED_LEGAL_DOCUMENT';
export const DELETE_TO_BE_UPLOADED_PITCH_COVER = 'DELETE_TO_BE_UPLOADED_PITCH_COVER';
export const DELETE_TO_BE_UPLOADED_PITCH_PRESENTATION_DOCUMENT = 'DELETE_TO_BE_UPLOADED_PITCH_PRESENTATION_DOCUMENT';
export const DELETE_TO_BE_UPLOADED_PITCH_SUPPORTING_DOCUMENT = 'DELETE_TO_BE_UPLOADED_PITCH_SUPPORTING_DOCUMENT';
export const deleteToBeUploadedFile = (mode, index) => {
    return (dispatch, getState) => {

        let updatedFilesToBeUploaded = null;

        switch (mode) {
            case DELETE_TO_BE_UPLOADED_LEGAL_DOCUMENT:
                updatedFilesToBeUploaded = JSON.parse(JSON.stringify(getState().uploadFiles.filesToBeUploaded.legalDocuments));
                break;
            case DELETE_TO_BE_UPLOADED_PITCH_COVER:
                updatedFilesToBeUploaded = JSON.parse(JSON.stringify(getState().uploadFiles.filesToBeUploaded.pitchCover));
                break;
            case DELETE_TO_BE_UPLOADED_PITCH_PRESENTATION_DOCUMENT:
                updatedFilesToBeUploaded = JSON.parse(JSON.stringify(getState().uploadFiles.filesToBeUploaded.pitchPresentationDocument));
                break;
            case DELETE_TO_BE_UPLOADED_PITCH_SUPPORTING_DOCUMENT:
                updatedFilesToBeUploaded = JSON.parse(JSON.stringify(getState().uploadFiles.filesToBeUploaded.pitchSupportingDocuments));
                break;
            default:
                return;
        }

        updatedFilesToBeUploaded.splice(index, 1);

        dispatch({
            type: DELETE_TO_BE_UPLOADED_FILE,
            mode,
            updatedFilesToBeUploaded
        });
    };
};

export const FINISHED_UPLOADING_A_LEGAL_DOCUMENT = 'FINISHED_UPLOADING_A_LEGAL_DOCUMENT';
export const FINISHED_UPLOADING_A_PITCH_COVER = 'FINISHED_UPLOADING_A_PITCH_COVER';
export const FINISHED_UPLOADING_A_PITCH_PRESENTATION_DOCUMENT = 'FINISHED_UPLOADING_A_PITCH_PRESENTATION_DOCUMENT';
export const FINISHED_UPLOADING_A_PITCH_SUPPORTING_DOCUMENT = 'FINISHED_UPLOADING_A_PITCH_SUPPORTING_DOCUMENT';
export const FINISHED_UPLOADING_ALL_FILES = 'FINISHED_UPLOADING_ALL_FILES';
export const uploadFiles = (mode, user = null, project = null) => {
    return (dispatch, getState) => {

        let files = [];

        switch (mode) {
            case UPLOAD_LEGAL_DOCUMENTS_MODE:
                files = getState().uploadFiles.filesToBeUploaded.legalDocuments;
                break;
            case UPLOAD_PITCH_COVER_MODE:
                files = getState().uploadFiles.filesToBeUploaded.pitchCover;
                break;
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                files = getState().uploadFiles.filesToBeUploaded.pitchPresentationDocument;
                break;
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                files = getState().uploadFiles.filesToBeUploaded.pitchSupportingDocuments;
                break;
            default:
                return;
        }

        dispatch({
            type: UPLOADING,
            mode,
            progress: 0
        });

        Promise.all(
            files.map(file => uploadIndividualFile(dispatch, mode, file, files.length, user, project))
        ).then(() => {
            // call this to clear temporarily files
            dispatch({
                type: FINISHED_UPLOADING_ALL_FILES,
                mode,
                waitingForUploadingReferences: true
            });
            putFilesReferencesToDatabase(dispatch, getState, mode, user, project)
                .then(() => {
                    dispatch({
                        type: FINISHED_UPLOADING_ALL_FILES,
                        mode,
                        waitingForUploadingReferences: false
                    });
                })
                .catch(error => {
                    // handle error
                });
        }).catch(error => {
            dispatch({
                type: UPLOADING,
                mode: UPLOAD_ERROR,
                progress: 100,
                error: error
            });
        });
    }
};

/**
 * Upload a file to Firebase storage
 *
 * @param dispatch
 * @param mode
 * @param file: a single file to be uploaded
 * @param totalFiles: length of the files array --> calculate percent done
 * @param user: set when uploading legal documents
 * @param project: set when uploading project cover, project deck, or project supporting documents
 */
const uploadIndividualFile = async (dispatch, mode, file, totalFiles, user = null, project = null) => {

    let fileRef = firebase.storage();

    const storageID = utils.getCurrentDate();
    const storageFileName = utils.constructStorageFileName(file, storageID);

    switch (mode) {
        case UPLOAD_LEGAL_DOCUMENTS_MODE:
            fileRef = fileRef
                .ref(DB_CONST.USERS_CHILD)
                .child(user.id)
                .child(DB_CONST.LEGAL_DOCUMENTS_CHILD)
                .child(storageFileName);
            break;
        case UPLOAD_PITCH_COVER_MODE:
            fileRef = fileRef
                .ref(DB_CONST.USERS_CHILD)
                .child(project.issuerID)
                .child(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .child(DB_CONST.PROJECT_COVER_CHILD)
                .child(`${storageID}.${document.file.extension}`);
            break;
        case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
            fileRef = fileRef
                .ref(DB_CONST.USERS_CHILD)
                .child(project.issuerID)
                .child(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .child(DB_CONST.PROJECT_PRESENTATION_DOCUMENT_CHILD)
                .child(storageFileName);
            break;
        case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
            fileRef = fileRef
                .ref(DB_CONST.USERS_CHILD)
                .child(project.issuerID)
                .child(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .child(DB_CONST.PROJECT_SUPPORTING_DOCUMENTS_CHILD)
                .child(storageFileName);
            break;
        default:
            return;
    }

    return new Promise((resolve, reject) => {
        const uploadTask = fileRef.put(file.file);
        uploadTask
            .on('state_changed', snapshot => {
                // do nothing here
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                if (mode === UPLOAD_PITCH_COVER_MODE || mode === UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE) {
                    dispatch({
                        type: UPLOADING,
                        mode,
                        progress: progress.toFixed(0)
                    });
                }

            }, error => {
                // handle error
                return reject(error);
            }, () => {

                uploadTask
                    .snapshot
                    .ref
                    .getDownloadURL()
                    .then(fileDownloadURL => {

                        let percentDone = 0;

                        switch (mode) {
                            case UPLOAD_LEGAL_DOCUMENTS_MODE:
                                percentDone = 100 / totalFiles;
                                const legalDocument = {
                                    fileName: storageFileName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT)[1],
                                    readableSize: file.file.sizeReadable,
                                    downloadURL: fileDownloadURL,
                                    storageID: storageID,
                                    description: file.description || ''
                                };
                                // updating progress
                                dispatch({
                                    type: UPLOADING,
                                    mode,
                                    progress: percentDone
                                });
                                // updating array of uploaded files
                                dispatch({
                                    type: FINISHED_UPLOADING_A_LEGAL_DOCUMENT,
                                    fileDBRef: legalDocument
                                });
                                break;
                            case UPLOAD_PITCH_COVER_MODE:
                                const formattedCover = {
                                    url: fileDownloadURL,
                                    fileType: file.file.type === "video/mp4" ? DB_CONST.FILE_TYPE_VIDEO : DB_CONST.FILE_TYPE_IMAGE,
                                    fileExtension: document.file.extension,
                                    storageID: storageID
                                };
                                // updating progress
                                dispatch({
                                    type: UPLOADING,
                                    mode,
                                    progress: 100
                                });
                                // updating array of uploaded files
                                dispatch({
                                    type: FINISHED_UPLOADING_A_PITCH_COVER,
                                    fileDBRef: formattedCover
                                });
                                break;
                            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                                const formattedPresentationDocument = {
                                    fileName: storageFileName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT)[1],
                                    readableSize: file.file.sizeReadable,
                                    downloadURL: fileDownloadURL,
                                    storageID: storageID,
                                    description: file.description || ''
                                };
                                // updating progress
                                dispatch({
                                    type: UPLOADING,
                                    mode,
                                    progress: 100
                                });
                                // updating array of uploaded files
                                dispatch({
                                    type: FINISHED_UPLOADING_A_PITCH_PRESENTATION_DOCUMENT,
                                    fileDBRef: formattedPresentationDocument
                                });
                                break;
                            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                                percentDone = 100 / totalFiles;
                                const formattedSupportingDocument = {
                                    fileName: storageFileName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT)[1],
                                    readableSize: file.file.sizeReadable,
                                    downloadURL: fileDownloadURL,
                                    storageID: storageID,
                                    description: file.description || ''
                                };
                                // updating progress
                                dispatch({
                                    type: UPLOADING,
                                    mode,
                                    progress: percentDone
                                });
                                // updating array of uploaded files
                                dispatch({
                                    type: FINISHED_UPLOADING_A_PITCH_SUPPORTING_DOCUMENT,
                                    fileDBRef: formattedSupportingDocument
                                });
                                break;
                            default:
                                break;
                        }

                        return resolve();
                    });
            });
    });
};

const putFilesReferencesToDatabase = async (dispatch, getState, mode, user = null, project = null) => {

    let firebaseRef = firebase.database();

    return new Promise((resolve, reject) => {
        switch (mode) {
            case UPLOAD_LEGAL_DOCUMENTS_MODE:
                const legalDocumentsUserID = getState().legalDocuments.userID;
                const existingLegalDocuments = getState().legalDocuments.legalDocuments;

                const filesDBReferences = getState().uploadFiles.filesDBReferences.legalDocuments;
                let filesReferencesToBeUploaded = [];

                if (existingLegalDocuments) {
                    filesReferencesToBeUploaded = [...existingLegalDocuments, ...filesDBReferences];
                } else {
                    filesReferencesToBeUploaded = filesDBReferences;
                }

                firebaseRef
                    .ref(DB_CONST.LEGAL_DOCUMENTS_CHILD)
                    .child(legalDocumentsUserID)
                    .set(filesReferencesToBeUploaded)
                    .then(() => {
                        dispatch({
                            type: UPLOADING,
                            mode: UPLOAD_DONE_MODE,
                            progress: 100
                        });
                        return resolve();
                    })
                    .catch(error => {
                        dispatch({
                            type: UPLOADING,
                            mode: UPLOAD_ERROR,
                            progress: 100
                        });
                        return reject(error);
                    });

                break;
            case UPLOAD_PITCH_COVER_MODE:
                return;
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                return;
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                return;
            default:
                return;
        }
    });
};

