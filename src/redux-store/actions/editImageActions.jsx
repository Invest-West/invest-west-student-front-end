import {
    UPLOAD_PROFILE_PICTURE_MODE,
    UPLOAD_LOGO_FIRST_TIME_MODE,
    UPLOAD_LOGO_MODE,
    UPLOAD_ERROR,
    UPLOAD_DONE_MODE
} from '../../shared-components/uploading-dialog/UploadingDialog';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as myUtils from '../../utils/utils';
import {UPLOADING} from  './uploadingStatusActions';
import firebase from '../../firebase/firebaseApp';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';

export const TOGGLE_EDIT_IMAGE_DIALOG = 'TOGGLE_EDIT_IMAGE_DIALOG';
export const toggleEditImageDialog = mode => {
    return (dispatch, getState) => {
        dispatch({
            type: TOGGLE_EDIT_IMAGE_DIALOG,
            mode, // upload logo (first time or not) or profile picture
            user: getState().auth.user
        });
    }
};

export const SET_IMAGE_EDITOR_REFERENCE = 'SET_IMAGE_EDITOR_REFERENCE';
export const setImageEditorReference = editor => {
    return {
        type: SET_IMAGE_EDITOR_REFERENCE,
        editor
    }
};

export const LOADING_IMAGE_FILE = 'LOADING_IMAGE_FILE';
export const IMAGE_FILES_LOADED = 'IMAGE_FILES_LOADED';
export const handleImageFilesChanged = files => {
    return (dispatch, getState) => {
        if (getState().manageFeedbackSnackbar.message.trim().length > 0 || getState().manageFeedbackSnackbar.open) {
            return;
        }

        dispatch({
            type: LOADING_IMAGE_FILE
        });

        const blob = new Blob([files[files.length - 1]], {type: 'image/jpg'});

        dispatch({
            type: IMAGE_FILES_LOADED,
            blob
        });
    }
};

export const handleImageFileError = (error, file) => {
    if (error.code === 2) {
        return {
            type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
            message: `Image is too large. The maximum size is ${DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.`,
            color: "error",
            position: "bottom"
        };
    }
};

export const LOADING_PREVIOUS_IMAGE = 'LOADING_PREVIOUS_IMAGE';
export const FINISHED_LOADING_PREVIOUS_IMAGE = 'FINISHED_LOADING_PREVIOUS_IMAGE';
export const handlePreviousImageItemClick = index => {
    return (dispatch, getState) => {

        dispatch({
            type: LOADING_PREVIOUS_IMAGE
        });

        // send request through a CORS proxy can avoid cors problem
        // src: https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors?rq=1
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

        fetch(proxyUrl + getState().editImage.previousPhotos[index].url)
            .then(response => {
                return response.blob();
            })
            .then(blob => {
                dispatch({
                    type: FINISHED_LOADING_PREVIOUS_IMAGE,
                    selectedIndex: index,
                    blob,
                });
            });
    }
};

export const IMAGE_ZOOM_CHANGED = 'IMAGE_ZOOM_CHANGED';
export const handleZoomSliderChanged = (event, newValue) => {
    return {
        type: IMAGE_ZOOM_CHANGED,
        zoom: newValue
    }
};

export const CANCEL_EDITING_CURRENT_IMAGE = 'CANCEL_EDITING_CURRENT_IMAGE';
export const cancelEditingCurrentImage = () => {
    return {
        type: CANCEL_EDITING_CURRENT_IMAGE
    }
};

export const EDITED_IMAGE_OBTAINED = 'EDITED_IMAGE_OBTAINED';
export const viewEditedImagePreview = () => {
    return (dispatch, getState) => {
        const imgEditor = getState().editImage.imgEditor;

        getEditedImage(imgEditor)
            .then(blob => {
                dispatch({
                    type: EDITED_IMAGE_OBTAINED,
                    blob
                });
            });
    }
};
/**
 * Util function to get edited image
 *
 * @param imgEditor
 * @returns {Promise<unknown>}
 */
const getEditedImage = async (imgEditor) => {
    return new Promise((resolve, reject) => {
        if (imgEditor && !isNaN(imgEditor.getCroppingRect().x)) {
            // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
            // drawn on another canvas, or added to the DOM.
            imgEditor.getImage().toBlob(blob => {
                return resolve(blob);
            }, 'image/jpg');
        }
        else {
            return reject();
        }
    });
};

export const CREATE_BUSINESS_PROFILE_SAVE_EDITED_IMAGE = 'CREATE_BUSINESS_PROFILE_SAVE_EDITED_IMAGE';
export const handleSaveEditedImage = () => {
    return (dispatch, getState) => {
        if (getState().editImage.mode === UPLOAD_LOGO_FIRST_TIME_MODE) {
            getEditedImage(getState().editImage.imgEditor)
                .then(blob => {
                    dispatch({
                        type: CREATE_BUSINESS_PROFILE_SAVE_EDITED_IMAGE,
                        blob
                    });
                });
            return;
        }

        getEditedImage(getState().editImage.imgEditor)
            .then(blob => {
                // dismiss edit image dialog
                dispatch({
                    type: TOGGLE_EDIT_IMAGE_DIALOG,
                    waitForUploading: true
                });
                // start uploading image
                uploadImage(dispatch, getState().auth.user, getState().editImage, blob);
            });
    }
};

/**
 * This function is used to upload an image (logo or profile picture)
 *
 * @returns {Promise<*>}
 */
export const uploadImage = async (dispatch, user, editImageState, blob) => {
    const {
        mode,
        imgPreIndex
    } = editImageState;

    let firebaseStorage = firebase.storage();
    let firebaseDB = firebase.database();

    if (mode !== UPLOAD_PROFILE_PICTURE_MODE && mode !== UPLOAD_LOGO_FIRST_TIME_MODE && mode !== UPLOAD_LOGO_MODE) {
        return;
    }

    dispatch({
        type: UPLOADING,
        mode,
        progress: 0
    });

    let storageID = 0;
    let storageLocation = '';

    // upload logo
    if (mode === UPLOAD_LOGO_MODE || mode === UPLOAD_LOGO_FIRST_TIME_MODE) {

        // edit previous image --> overwrite existing one in the storage instead of saving a new entry
        if (imgPreIndex !== -1) {
            // don't need to check for BusinessProfile and logo nodes here because imgPreIndex only be set if the user already has images uploaded
            const imgName = user.BusinessProfile.logo[imgPreIndex].storageID;
            // delete old image
            await firebaseStorage
                .ref(DB_CONST.USERS_CHILD)
                .child(user.id)
                .child(`${DB_CONST.LOGOS_CHILD}/${imgName}`)
                .delete();
        } else {
            // do nothing here
        }
        storageID = myUtils.getCurrentDate();
        storageLocation = `${DB_CONST.LOGOS_CHILD}/${storageID}`;
    }
    // upload profile picture
    else if (mode === UPLOAD_PROFILE_PICTURE_MODE) {

        // edit previous image --> overwrite existing one in the storage instead of saving a new entry
        if (imgPreIndex !== -1) {
            // don't need to check for profilePicture node here because imgPreIndex only be set if the user already has images uploaded
            const imgName = user.profilePicture[imgPreIndex].storageID;
            // delete old image
            await firebaseStorage
                .ref(DB_CONST.USERS_CHILD)
                .child(user.id)
                .child(`${DB_CONST.PROFILE_PICTURES_CHILD}/${imgName}`)
                .delete();
        } else {
            // do nothing here
        }
        storageID = myUtils.getCurrentDate();
        storageLocation = `${DB_CONST.PROFILE_PICTURES_CHILD}/${storageID}`;
    }
    // mode invalid
    else {
        return;
    }

    const storageRef = firebaseStorage
        .ref(DB_CONST.USERS_CHILD)
        .child(user.id)
        .child(storageLocation);

    return new Promise((resolve, reject) => {
        // upload logo to firebase storage
        const uploadTask = storageRef.put(blob);
        uploadTask.on('state_changed', snapshot => {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            dispatch({
                type: UPLOADING,
                mode,
                progress: progress.toFixed(0)
            });
            // handle error
        }, error => {

            dispatch({
                type: UPLOADING,
                mode: UPLOAD_ERROR,
                progress: 100
            });

            return reject(error);
            // logo successfully uploaded
        }, () => {

            // get download URL of the uploaded logo
            uploadTask.snapshot.ref.getDownloadURL().then(imgDownloadURL => {

                const imgUploadedObj = {
                    storageID: storageID,
                    url: imgDownloadURL
                };

                let prevNodeImgs = [];
                let firebaseRef = firebaseDB
                    .ref(DB_CONST.USERS_CHILD)
                    .child(user.id);

                // upload logo
                if (mode === UPLOAD_LOGO_MODE || mode === UPLOAD_LOGO_FIRST_TIME_MODE) {
                    // user has not uploaded any images
                    if (!user.BusinessProfile || (user.BusinessProfile && !user.BusinessProfile.logo)) {
                        prevNodeImgs = [];
                        prevNodeImgs.push(imgUploadedObj);
                    }
                    // user has uploaded images
                    else {
                        prevNodeImgs = user.BusinessProfile.logo;

                        // edit previous image --> don't to save new, just need to edit the node instead
                        if (imgPreIndex !== -1) {
                            prevNodeImgs.splice(imgPreIndex, 1);
                            prevNodeImgs.forEach(imgItem => {
                                imgItem.removed = true;
                            });
                            prevNodeImgs.push(imgUploadedObj);
                        }
                        // upload new image
                        else {
                            prevNodeImgs.forEach(imgItem => {
                                imgItem.removed = true;
                            });
                            prevNodeImgs.push(imgUploadedObj);
                        }
                    }

                    firebaseRef = firebaseRef
                        .child(DB_CONST.BUSINESS_PROFILE_CHILD)
                        .child(DB_CONST.LOGO_CHILD);
                }
                // upload profile picture
                else {
                    // user has not uploaded any images
                    if (!user.profilePicture) {
                        prevNodeImgs = [];
                        prevNodeImgs.push(imgUploadedObj);
                    } else {
                        prevNodeImgs = user.profilePicture;

                        // edit previous image --> don't to save new, just need to edit the node instead
                        if (imgPreIndex !== -1) {
                            prevNodeImgs.splice(imgPreIndex, 1);
                            prevNodeImgs.forEach(imgItem => {
                                imgItem.removed = true;
                            });
                            prevNodeImgs.push(imgUploadedObj);
                        }
                        // upload new image
                        else {
                            prevNodeImgs.forEach(imgItem => {
                                imgItem.removed = true;
                            });
                            prevNodeImgs.push(imgUploadedObj);
                        }
                    }

                    firebaseRef = firebaseRef
                        .child(DB_CONST.PROFILE_PICTURE_CHILD);
                }

                // update firebase realtime database
                firebaseRef
                    .set(prevNodeImgs)
                    .then(() => {
                        dispatch({
                            type: UPLOADING,
                            mode: UPLOAD_DONE_MODE,
                            progress: 100
                        });

                        dispatch({
                            type: TOGGLE_EDIT_IMAGE_DIALOG,
                            waitForUploading: false
                        });

                        return resolve();
                    })
                    .catch(error => {
                        dispatch({
                            type: UPLOADING,
                            mode: UPLOAD_ERROR,
                            progress: 100
                        });

                        dispatch({
                            type: TOGGLE_EDIT_IMAGE_DIALOG,
                            waitForUploading: false
                        });

                        return reject(error);
                    });
            });
        });
    });
};




