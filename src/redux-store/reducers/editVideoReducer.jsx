import * as editVideoActions from '../actions/editVideoActions';
import * as authActions from '../actions/authActions';
import * as createBusinessProfileActions from '../actions/createBusinessProfileActions';
import {
    UPLOAD_VIDEO_MODE
} from '../../shared-components/uploading-dialog/UploadingDialog';

const initState = {
    editVideoDialogOpen: false,
    mode: null,

    videoTypeSelected: null,
    videoChosen: null,
    previousVideos: null,
    videoPreIndex: -1
};

const editVideoReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case editVideoActions.TOGGLE_EDIT_VIDEO_DIALOG:
            return {
                ...state,
                editVideoDialogOpen: action.hasOwnProperty('waitForUploading') && !action.waitForUploading ? false : !state.editVideoDialogOpen,
                mode: action.hasOwnProperty('mode') ? action.mode : state.mode,
                videoPreIndex: action.hasOwnProperty('waitForUploading') && action.waitForUploading ? state.videoPreIndex : -1,
                previousVideos:
                    action.mode === UPLOAD_VIDEO_MODE
                        ?
                        !action.hasOwnProperty('user') || (action.hasOwnProperty('user') && !action.user.BusinessProfile.video)
                            ?
                            []
                            :
                            JSON.parse(JSON.stringify(action.user.BusinessProfile.video))
                        :
                        [],
                videoChosen: action.hasOwnProperty('waitForUploading') && action.waitForUploading ? state.videoChosen : null,
                videoTypeSelected: action.hasOwnProperty('waitForUploading') && action.waitForUploading ? state.videoTypeSelected : null
            };
        case editVideoActions.CREATE_BUSINESS_PROFILE_SAVE_VIDEO:
            return {
                ...initState,
                mode: state.mode
            };
        case createBusinessProfileActions.CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION:
            return {
                ...initState,
                mode: state.mode
            };
        case editVideoActions.VIDEO_TYPE_CHOSEN:
            return {
                ...state,
                videoTypeSelected: action.videoType,
                videoChosen: null,
                videoPreIndex: -1
            };
        case editVideoActions.VIDEO_URL_CHANGED:
            return {
                ...state,
                videoChosen: action.url
            };
        case editVideoActions.VIDEO_FILE_CHANGED:
            return {
                ...state,
                videoChosen: action.blob,
                videoPreIndex: -1
            };
        case editVideoActions.CANCEL_EDITING_CURRENT_VIDEO:
            return {
                ...state,
                videoChosen: null,
                videoPreIndex: -1
            };
        case editVideoActions.PREVIOUS_VIDEO_SELECTED:
            return {
                ...state,
                videoChosen: state.previousVideos[action.selectedIndex].url,
                videoPreIndex: state.previousVideos.length - 1 - action.selectedIndex,
                videoTypeSelected: null
            };
        default:
            return state;
    }
};

export default editVideoReducer;