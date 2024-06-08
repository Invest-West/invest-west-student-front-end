import * as uploadingStatusActions from '../actions/uploadingStatusActions';
import * as authActions from '../actions/authActions';
import {
    UPLOAD_NONE
} from '../../shared-components/uploading-dialog/UploadingDialog';
import {DISMISS_UPLOADING_STATUS} from "../actions/uploadingStatusActions";

const initState = {
    mode: UPLOAD_NONE,
    progress: 0
};

const uploadingStatusReducer = (state = initState, action) => {
    switch(action.type) {
        case authActions.LOG_OUT:
            return initState;
        case uploadingStatusActions.UPLOADING:
            return {
                mode: action.mode,
                progress: action.progress
            };
        case DISMISS_UPLOADING_STATUS:
            return {
                mode: UPLOAD_NONE,
                progress: 0
            };
        default:
            return state;
    }
};

export default uploadingStatusReducer;