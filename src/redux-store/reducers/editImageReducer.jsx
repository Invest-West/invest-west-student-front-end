import * as editImageActions from '../actions/editImageActions';
import * as authActions from '../actions/authActions';
import * as createBusinessProfileActions from '../actions/createBusinessProfileActions';
import {
    UPLOAD_PROFILE_PICTURE_MODE,
    UPLOAD_LOGO_MODE
} from '../../shared-components/uploading-dialog/UploadingDialog';

const initState = {
    editImageDialogOpen: false,
    mode: null,

    imgEditor: null,
    imgEdited: null, // blob file obtained after editing

    imgZoom: 1,

    imgPreEdited: null, // file chosen from computer or url from previous logos
    imgPreEditedLoaded: true,
    imgPreIndex: -1, // index of previous image in the original list (not sorted) on firebase (when choose)

    previousPhotos: null
};

const editImageReducer = (state = initState, action) => {

    switch(action.type) {
        case authActions.LOG_OUT:
            return initState;
        case editImageActions.TOGGLE_EDIT_IMAGE_DIALOG:
            return {
                ...state,
                editImageDialogOpen: action.hasOwnProperty('waitForUploading') && !action.waitForUploading ? false : !state.editImageDialogOpen,
                mode: action.hasOwnProperty('mode') ? action.mode : state.mode,
                imgPreIndex: action.hasOwnProperty('waitForUploading') && action.waitForUploading ? state.imgPreIndex : -1,
                previousPhotos:
                    action.mode === UPLOAD_LOGO_MODE
                        ?
                        !action.hasOwnProperty('user') || (action.hasOwnProperty('user') && !action.user.BusinessProfile.logo)
                            ?
                            []
                            :
                            JSON.parse(JSON.stringify(action.user.BusinessProfile.logo))
                        :
                        action.mode === UPLOAD_PROFILE_PICTURE_MODE
                            ?
                            !action.hasOwnProperty('user') || (action.hasOwnProperty('user') && !action.user.profilePicture)
                                ?
                                []
                                :
                                JSON.parse(JSON.stringify(action.user.profilePicture))
                            :
                            [],
                imgEdited: null,
                imgZoom: 1,
                imgPreEdited: null,
                imgPreEditedLoaded: true
            };
        case editImageActions.CREATE_BUSINESS_PROFILE_SAVE_EDITED_IMAGE:
            return {
                ...initState,
                mode: state.mode
            };
        case createBusinessProfileActions.CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION:
            return {
                ...initState,
                mode: state.mode
            };
        case editImageActions.SET_IMAGE_EDITOR_REFERENCE:
            return {
                ...state,
                imgEditor: action.editor
            };
        case editImageActions.LOADING_IMAGE_FILE:
            return {
                ...state,
                imgPreEdited: null,
                imgPreEditedLoaded: false
            };
        case editImageActions.IMAGE_FILES_LOADED:
            return {
                ...state,
                imgPreEdited: window.URL.createObjectURL(action.blob),
                imgPreEditedLoaded: true,
                imgPreIndex: -1
            };
        case editImageActions.IMAGE_ZOOM_CHANGED:
            return {
                ...state,
                imgZoom: action.zoom
            };
        case editImageActions.LOADING_PREVIOUS_IMAGE:
            return {
                ...state,
                imgPreEdited: null,
                imgPreEditedLoaded: false,
                imgPreIndex: -1
            };
        case editImageActions.FINISHED_LOADING_PREVIOUS_IMAGE:
            return {
                ...state,
                imgPreEdited: window.URL.createObjectURL(action.blob),
                imgPreEditedLoaded: true,
                imgPreIndex: state.previousPhotos.length - 1 - action.selectedIndex, // get the original index
            };
        case editImageActions.CANCEL_EDITING_CURRENT_IMAGE:
            return {
                ...state,
                imgPreEdited: null,
                imgPreEditedLoaded: true,
                imgEdited: null,
                imgZoom: 1,
                imgPreIndex: -1
            };
        case editImageActions.EDITED_IMAGE_OBTAINED:
            return {
                ...state,
                imgEdited: action.blob
            };
        default:
            return state;
    }
};

export default editImageReducer;