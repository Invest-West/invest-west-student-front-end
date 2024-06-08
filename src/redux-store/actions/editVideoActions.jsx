import {
    UPLOAD_VIDEO_FIRST_TIME_MODE,
    UPLOAD_DONE_MODE,
    UPLOAD_ERROR
} from '../../shared-components/uploading-dialog/UploadingDialog';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import {UPLOADING} from  './uploadingStatusActions';
import firebase from '../../firebase/firebaseApp';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';

export const TOGGLE_EDIT_VIDEO_DIALOG = 'TOGGLE_EDIT_VIDEO_DIALOG';
export const toggleEditVideoDialog = mode => {
    return (dispatch, getState) => {
        dispatch({
            type: TOGGLE_EDIT_VIDEO_DIALOG,
            mode, // upload video (first time or not)
            user: getState().auth.user
        });
    }
};

export const VIDEO_TYPE_CHOSEN = 'VIDEO_TYPE_CHOSEN';
export const chooseVideoType = videoType => {
    return {
        type: VIDEO_TYPE_CHOSEN,
        videoType
    }
};

export const VIDEO_URL_CHANGED = 'VIDEO_URL_CHANGED';
export const handleVideoURLChanged = event => {
    return {
        type: VIDEO_URL_CHANGED,
        url: event.target.value
    }
};

export const VIDEO_FILE_CHANGED = 'VIDEO_FILE_CHANGED';
export const handleVideoFilesChanged = files => {
    return (dispatch, getState) => {
        if (getState().manageFeedbackSnackbar.message.trim().length > 0 || getState().manageFeedbackSnackbar.open) {
            return;
        }
        const blob = new Blob([files[files.length - 1]], {type: 'video/mp4'});
        dispatch({
            type: VIDEO_FILE_CHANGED,
            blob
        });
    }
};

export const VIDEO_FILE_ERROR = 'VIDEO_FILE_ERROR';
export const handleVideoFileError = (error, file) => {
    if (error.code === 2) {
        return {
            type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
            message: `Video is too large. The maximum size is ${DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.`,
            color: "error",
            position: "bottom"
        };
    }
};

export const CREATE_BUSINESS_PROFILE_SAVE_VIDEO = 'CREATE_BUSINESS_PROFILE_SAVE_VIDEO';
export const handleSaveVideo = () => {
    return (dispatch, getState) => {
        if (getState().editVideo.mode === UPLOAD_VIDEO_FIRST_TIME_MODE) {
            dispatch({
                type: CREATE_BUSINESS_PROFILE_SAVE_VIDEO,
                video: getState().editVideo.videoChosen
            });
            return;
        }
        // dismiss edit image dialog
        dispatch({
            type: TOGGLE_EDIT_VIDEO_DIALOG,
            waitForUploading: true
        });
        // start uploading image
        uploadVideo(dispatch, getState().auth.user, getState().editVideo, getState().editVideo.videoChosen);
    }
};

export const PREVIOUS_VIDEO_SELECTED = 'PREVIOUS_VIDEO_SELECTED';
export const handlePreviousVideoItemClick = index => {
    return {
        type: PREVIOUS_VIDEO_SELECTED,
        selectedIndex: index
    }
};

export const CANCEL_EDITING_CURRENT_VIDEO = 'CANCEL_EDITING_CURRENT_VIDEO';
export const cancelEditingCurrentVideo = () => {
    return {
        type: CANCEL_EDITING_CURRENT_VIDEO
    }
};

/**
 * This function is used to upload intro video to firebase storage
 *
 * @param dispatch
 * @param user
 * @param editVideoState
 * @param video
 * @returns {Promise<unknown>}
 */
export const uploadVideo = async (dispatch, user, editVideoState, video) => {

    const {
        mode,
        videoPreIndex
    } = editVideoState;

    dispatch({
        type: UPLOADING,
        mode,
        progress: 0
    });

    let downloadedPreviousVideo = null;

    // edit previous image --> overwrite existing one in the storage instead of saving a new entry
    // video entry with storageID = "" is the one not stored in Firebase storage
    if (videoPreIndex !== -1) {
        // select previously uploaded video as the current video
        if (user.BusinessProfile.video[videoPreIndex].storageID !== "") {
            // send request through a CORS proxy can avoid cors problem
            // src: https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors?rq=1
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

            await fetch(proxyUrl + user.BusinessProfile.video[videoPreIndex].url)
                .then(response => {
                    return response.blob();
                })
                .then(blob => {
                    downloadedPreviousVideo = blob;
                });

            // don't need to check for BusinessProfile and video nodes here because videoPreIndex only be set if the user already has videos uploaded
            const videoName = user.BusinessProfile.video[videoPreIndex].storageID;
            // delete old video, don't need to wait for this to complete as the file will be deleted anyway
            firebase.storage()
                .ref(DB_CONST.USERS_CHILD)
                .child(user.id)
                .child(`${DB_CONST.INTRO_VIDEOS_CHILD}/${videoName}`)
                .delete();
        }
        // select previous video URL as the current video
        else {
            const videoUploadedObj = {
                storageID: "",
                dateUploaded: utils.getCurrentDate(),
                url: video
            };

            return new Promise((resolve, reject) => {
                putUploadedVideoToFirebaseRealtime(dispatch, user, videoUploadedObj, videoPreIndex)
                    .then(() => {
                        return resolve();
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
        }
    } else {
        // do nothing here
    }

    // upload a new video URL
    if (typeof (video) === "string") {
        const videoUploadedObj = {
            storageID: "",
            dateUploaded: utils.getCurrentDate(),
            url: video
        };

        return new Promise((resolve, reject) => {
            putUploadedVideoToFirebaseRealtime(dispatch, user, videoUploadedObj, videoPreIndex)
                .then(() => {
                    return resolve();
                })
                .catch(error => {
                    return reject(error);
                });
        });
    }

    const storageID = utils.getCurrentDate();
    const storageLocation = `${DB_CONST.INTRO_VIDEOS_CHILD}/${storageID}`;

    const storageRef = firebase.storage()
        .ref(DB_CONST.USERS_CHILD)
        .child(user.id)
        .child(storageLocation);

    return new Promise((resolve, reject) => {
        // upload logo to firebase storage
        const videoUploadTask = storageRef.put(downloadedPreviousVideo ? downloadedPreviousVideo : video);
        videoUploadTask.on('state_changed', snapshot => {
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
            // video successfully uploaded
        }, () => {

            // get download URL of the uploaded video
            videoUploadTask.snapshot.ref.getDownloadURL().then(videoDownloadURL => {

                const videoUploadedObj = {
                    storageID: storageID,
                    dateUploaded: storageID,
                    url: videoDownloadURL
                };

                putUploadedVideoToFirebaseRealtime(dispatch, user, videoUploadedObj, videoPreIndex)
                    .then(() => {
                        return resolve();
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
        });
    });
};

/**
 * Handle to put the uploaded video to Firebase realtime
 *
 * @param dispatch
 * @param user
 * @param videoUploadedObj
 * @param videoPreIndex
 * @returns {Promise<unknown>}
 */
const putUploadedVideoToFirebaseRealtime = async (dispatch, user, videoUploadedObj, videoPreIndex) => {

    return new Promise((resolve, reject) => {
        let prevNodeVideos = [];
        let firebaseRef = firebase.database()
            .ref(DB_CONST.USERS_CHILD)
            .child(user.id)
            .child(DB_CONST.BUSINESS_PROFILE_CHILD)
            .child(DB_CONST.INTRO_VIDEO_CHILD);

        // user has not uploaded any videos
        if (!user.BusinessProfile || (user.BusinessProfile && !user.BusinessProfile.video)) {
            prevNodeVideos = [];
            prevNodeVideos.push(videoUploadedObj);
        }
        // user has uploaded videos
        else {
            prevNodeVideos = user.BusinessProfile.video;

            // edit previous video --> don't need to save new, just need to edit the node instead
            if (videoPreIndex !== -1) {
                prevNodeVideos.splice(videoPreIndex, 1);
                prevNodeVideos.forEach(imgItem => {
                    imgItem.removed = true;
                });
                prevNodeVideos.push(videoUploadedObj);
            }
            // upload new video
            else {
                prevNodeVideos.forEach(imgItem => {
                    imgItem.removed = true;
                });
                prevNodeVideos.push(videoUploadedObj);
            }
        }

        firebaseRef
            .set(prevNodeVideos)
            .then(() => {
                dispatch({
                    type: UPLOADING,
                    mode: UPLOAD_DONE_MODE,
                    progress: 100
                });

                dispatch({
                    type: TOGGLE_EDIT_VIDEO_DIALOG,
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
                    type: TOGGLE_EDIT_VIDEO_DIALOG,
                    waitForUploading: false
                });

                return reject(error);
            });
    });
};


