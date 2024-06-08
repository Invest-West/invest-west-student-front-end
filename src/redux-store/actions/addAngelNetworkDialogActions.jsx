import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as myUtils from '../../utils/utils';
import {
    ADD_STATUS_CHECKING_FOR_EXISTING_ANGEL_NETWORK,
    ADD_STATUS_CREATING_ANGEL_NETWORK_PROFILE,
    ADD_STATUS_EMAIL_ALREADY_USED,
    ADD_STATUS_ERROR_HAPPENED,
    ADD_STATUS_SUCCESSFULLY_ADDED,
    ADD_STATUS_UPLOADING_ANGEL_NETWORK_LOGO,
    ADD_STATUS_USER_NAME_EXISTS,
    UPLOAD_LOGO_WITH_TEXT,
    UPLOAD_PLAIN_LOGO
} from '../../pages/admin/components/AddAngelNetWorkDialog';
import * as ROUTES from '../../router/routes';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import Api, {ApiRoutes} from "../../api/Api.tsx";

export const TOGGLE_ADD_ANGEL_NETWORK_DIALOG = 'TOGGLE_ADD_ANGEL_NETWORK_DIALOG';
export const toggleAddAngelNetworkDialog = () => {
    return {
        type: TOGGLE_ADD_ANGEL_NETWORK_DIALOG
    }
};

export const ADD_ANGEL_NETWORK_DIALOG_INPUT_CHANGED = 'ADD_ANGEL_NETWORK_DIALOG_INPUT_CHANGED';
export const handleAddAngelNetworkInputChanged = event => {
    return {
        type: ADD_ANGEL_NETWORK_DIALOG_INPUT_CHANGED,
        event
    }
};

export const ADD_ANGEL_NETWORK_ADD_BUTTON_CLICKED = 'ADD_ANGEL_NETWORK_ADD_BUTTON_CLICKED';
export const ADD_ANGEL_NETWORK_RESULT_CHANGED = 'ADD_ANGEL_NETWORK_RESULT_CHANGED';
export const addNewAngelNetwork = () => {
    return async (dispatch, getState) => {

        const currentUser = getState().auth.user;

        dispatch({
            type: ADD_ANGEL_NETWORK_ADD_BUTTON_CLICKED
        });

        const {
            angelNetworkName,
            angelNetworkUsername,
            email,
            website,
            primaryColor,
            secondaryColor,
            plainLogo,
            logoWithText
        } = getState().manageAddAngelNetworkDialog;

        dispatch({
            type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
            result: ADD_STATUS_CHECKING_FOR_EXISTING_ANGEL_NETWORK
        });

        // generate group id
        const anid = firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .push()
            .key;

        try {
            // check if the group username has been used or not
            const snapshots = await firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                .orderByChild("groupUserName")
                .equalTo(angelNetworkUsername.toLowerCase())
                .once("value");

            // username has already exists
            if (snapshots.numChildren() > 0) {
                dispatch({
                    type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                    result: ADD_STATUS_USER_NAME_EXISTS
                });
                return;
            }

            const checkExistingUser = await realtimeDBUtils.doesUserExist(email);

            // email has already been used
            if (checkExistingUser.userExists) {
                dispatch({
                    type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                    result: ADD_STATUS_EMAIL_ALREADY_USED
                });
                return;
            }

            // upload plain logo
            const uploadedPlainLogo = await uploadLogo(dispatch, anid, UPLOAD_PLAIN_LOGO, plainLogo);

            // upload logo with text
            const uploadedLogoWithText = await uploadLogo(dispatch, anid, UPLOAD_LOGO_WITH_TEXT, logoWithText);

            // new group properties
            const newGroupProperties = {
                anid,
                isInvestWest: false,
                displayName: angelNetworkName,
                displayNameLower: angelNetworkName.toLowerCase(), // for search function
                groupUserName: angelNetworkUsername.toLowerCase(),
                description: "",
                website: website,
                dateAdded: myUtils.getCurrentDate(),
                status: DB_CONST.GROUP_STATUS_ACTIVE,
                plainLogo: [{
                    storageID: uploadedPlainLogo.storageID,
                    url: uploadedPlainLogo.url
                }],
                logoWithText:
                    !uploadedLogoWithText
                        ?
                        null
                        :
                        [{
                            storageID: uploadedLogoWithText.storageID,
                            url: uploadedLogoWithText.url
                        }],
                settings: {
                    projectVisibility: DB_CONST.PROJECT_VISIBILITY_PRIVATE,
                    makeInvestorsContactDetailsVisibleToIssuers: false, // initially set this to false
                    primaryColor: primaryColor.toUpperCase(),
                    secondaryColor: secondaryColor.toUpperCase()
                }
            }

            // add new group properties to the database
            await firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                .child(anid)
                .set(newGroupProperties);

            dispatch({
                type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_CREATING_ANGEL_NETWORK_PROFILE
            });

            await new Api().request(
                "post",
                ApiRoutes.addGroupAdminRoute,
                {
                    requestBody: {
                        adder: currentUser,
                        groupProperties: newGroupProperties,
                        newGroupAdminEmail: email
                    }
                }
            );

            // send a notification to the newly created super group admin
            await realtimeDBUtils
                .sendNotification({
                    title: "Change your password",
                    message: "Welcome to Invest West. It is important to change your password as soon as possible. Please do it by clicking on the Password tab in your dashboard.",
                    userID: anid,
                    action: `${ROUTES.ADMIN_INVEST_WEST_SUPER}?tab=Change password`
                });

            // adding a new super group admin succeeds
            dispatch({
                type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_SUCCESSFULLY_ADDED
            });
        } catch (error) {
            // remove the added group properties if error happened
            await firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                .child(anid)
                .remove();

            dispatch({
                type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_ERROR_HAPPENED,
                error
            });
        }
    }
};

/**
 * This function is used to upload an image (logo or profile picture)
 *
 * @returns {Promise<*>}
 */
const uploadLogo = async (dispatch, anid, mode, blob) => {

    return new Promise((resolve, reject) => {

        if (!blob) {
            return resolve(null);
        }

        let firebaseStorage = firebase.storage();

        dispatch({
            type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
            result: ADD_STATUS_UPLOADING_ANGEL_NETWORK_LOGO,
            progress: 0
        });

        let storageID = myUtils.getCurrentDate();
        let storageLocation = `${mode === UPLOAD_PLAIN_LOGO ? DB_CONST.PLAIN_LOGOS_CHILD : DB_CONST.LOGOS_WITH_TEXT_CHILD}/${storageID}`;

        const storageRef = firebaseStorage
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(anid)
            .child(storageLocation);

        // upload logo to firebase storage
        const uploadTask = storageRef.put(blob);
        uploadTask.on('state_changed', snapshot => {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            dispatch({
                type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_UPLOADING_ANGEL_NETWORK_LOGO,
                progress,
                mode
            });
            // handle error
        }, error => {

            dispatch({
                type: ADD_ANGEL_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_ERROR_HAPPENED,
                mode
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

                return resolve(imgUploadedObj);
            });
        });
    });
};

export const ADD_ANGEL_NETWORK_LOADING_IMAGE_FILE = 'ADD_ANGEL_NETWORK_LOADING_IMAGE_FILE';
export const ADD_ANGEL_NETWORK_IMAGE_FILES_LOADED = 'ADD_ANGEL_NETWORK_IMAGE_FILES_LOADED';
export const handleImageFilesChanged = (mode, files) => {
    return (dispatch, getState) => {
        if (getState().manageAddAngelNetworkDialog.imgUploadError.trim().length > 0 || getState().manageAddAngelNetworkDialog.imgUploadErrorSnackbarOpen) {
            return null;
        }

        dispatch({
            type: ADD_ANGEL_NETWORK_LOADING_IMAGE_FILE,
            mode
        });

        const blob = new Blob([files[files.length - 1]], {type: 'image/jpg'});

        dispatch({
            type: ADD_ANGEL_NETWORK_IMAGE_FILES_LOADED,
            blob,
            mode
        });
    }
};

export const ADD_ANGEL_NETWORK_IMAGE_FILE_ERROR = 'ADD_ANGEL_NETWORK_IMAGE_FILE_ERROR';
export const handleImageFileError = (mode, error, file) => {
    if (error.code === 2) {
        return {
            type: ADD_ANGEL_NETWORK_IMAGE_FILE_ERROR,
            error,
            file,
            mode
        }
    }
};

export const ADD_ANGEL_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR = 'ADD_ANGEL_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR';
export const closeImageFileErrorSnackbar = () => {
    return {
        type: ADD_ANGEL_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR
    }
};

export const ADD_ANGEL_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED = 'ADD_ANGEL_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED';
export const resetImageFileErrorMessageWhenSnackbarExited = () => {
    return {
        type: ADD_ANGEL_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED
    }
};

