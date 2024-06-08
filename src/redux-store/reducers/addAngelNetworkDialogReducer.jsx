import * as addAngelNetworkDialogActions from '../actions/addAngelNetworkDialogActions';
import * as authActions from '../actions/authActions';
import {
    ADD_STATUS_NONE,
    ADD_STATUS_SUCCESSFULLY_ADDED,
    UPLOAD_PLAIN_LOGO,
    UPLOAD_NONE,
    UPLOAD_LOGO_WITH_TEXT
} from '../../pages/admin/components/AddAngelNetWorkDialog';
import * as DB_CONST from "../../firebase/databaseConsts";

const initState = {
    addAngelNetworkDialogOpen: false,

    angelNetworkName: '',
    angelNetworkUsername: '',
    email: '',
    website: '',
    primaryColor: '',
    secondaryColor: '',

    plainLogo: null,
    loadingPlainLogo: false,
    logoWithText: null,
    loadingLogoWithText: false,

    uploadMode: UPLOAD_NONE,
    uploadProgress: 0,

    imgUploadError: '',
    imgUploadErrorSnackbarOpen: false,

    addButtonClicked: false,
    addResult: ADD_STATUS_NONE,
};

const addAngelNetworkDialogReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case addAngelNetworkDialogActions.TOGGLE_ADD_ANGEL_NETWORK_DIALOG:
            return {
                ...initState,
                addAngelNetworkDialogOpen: !state.addAngelNetworkDialogOpen
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_DIALOG_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_ADD_BUTTON_CLICKED:
            return {
                ...state,
                addButtonClicked: true
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_RESULT_CHANGED:
            return {
                ...state,
                addResult: action.result,

                angelNetworkName: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? '' : state.angelNetworkName,
                angelNetworkUsername: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? '' : state.angelNetworkUsername,
                email: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? '' : state.email,
                primaryColor: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? '' : state.primaryColor,
                secondaryColor: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? '' : state.secondaryColor,

                plainLogo: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? null : state.plainLogo,
                logoWithText: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? null : state.logoWithText,

                uploadMode: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? UPLOAD_NONE : action.hasOwnProperty('mode') ? action.mode : state.uploadMode,
                uploadProgress: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? 0 : action.hasOwnProperty('progress') ? action.progress : state.uploadProgress,

                addButtonClicked: action.result === ADD_STATUS_SUCCESSFULLY_ADDED ? false : state.addButtonClicked
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_LOADING_IMAGE_FILE:
            return {
                ...state,
                plainLogo: action.mode === UPLOAD_PLAIN_LOGO ? null : state.plainLogo,
                loadingPlainLogo: action.mode === UPLOAD_PLAIN_LOGO ? true : state.loadingPlainLogo,
                logoWithText: action.mode === UPLOAD_LOGO_WITH_TEXT ? null : state.logoWithText,
                loadingLogoWithText: action.mode === UPLOAD_LOGO_WITH_TEXT ? true : state.loadingLogoWithText
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_IMAGE_FILES_LOADED:
            return {
                ...state,
                plainLogo: action.mode === UPLOAD_PLAIN_LOGO ? action.blob : state.plainLogo,
                loadingPlainLogo: action.mode === UPLOAD_PLAIN_LOGO ? false : state.loadingPlainLogo,
                logoWithText: action.mode === UPLOAD_LOGO_WITH_TEXT ? action.blob : state.logoWithText,
                loadingLogoWithText: action.mode === UPLOAD_LOGO_WITH_TEXT ? false : state.loadingLogoWithText
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_IMAGE_FILE_ERROR:
            return {
                ...state,
                imgUploadError: `Image is too large. The maximum size is ${DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.`,
                imgUploadErrorSnackbarOpen: true
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED:
            return {
                ...state,
                imgUploadError: ''
            };
        case addAngelNetworkDialogActions.ADD_ANGEL_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR:
            return {
                ...state,
                imgUploadErrorSnackbarOpen: false
            };
        default:
            return state;
    }
};

export default addAngelNetworkDialogReducer;