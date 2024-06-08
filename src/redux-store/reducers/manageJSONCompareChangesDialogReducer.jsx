import * as manageJSONCompareChangesDialogActions from '../actions/manageJSONCompareChangesDialogActions';
import * as authActions from '../actions/authActions';

const initState = {
    dialogOpen: false,
    jsonBefore: {},
    jsonAfter: {}
};

const manageJSONCompareChangesDialogReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageJSONCompareChangesDialogActions.JSON_COMPARE_CHANGES_DIALOG_SET_DATA:
            return {
                ...state,
                dialogOpen: true,
                jsonBefore: JSON.parse(JSON.stringify(action.jsonBefore)),
                jsonAfter: JSON.parse(JSON.stringify(action.jsonAfter))
            };
        case manageJSONCompareChangesDialogActions.JSON_COMPARE_CHANGES_DIALOG_RESET_DATA:
            return {
                ...state,
                dialogOpen: false,
                jsonBefore: {},
                jsonAfter: {}
            };
        default:
            return state;
    }
};

export default manageJSONCompareChangesDialogReducer;