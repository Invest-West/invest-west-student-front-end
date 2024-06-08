import * as createPledgeDialogActions from '../actions/createPledgeDialogActions';
import * as authActions from '../actions/authActions';
import * as utils from '../../utils/utils';
import {CREATE_PLEDGE_STATUS_NONE} from '../../shared-components/create-pledge-dialog/CreatePledgeDialog';

const initState = {
    open: false,
    project: null,
    postMoneyValuation: '',
    expiredDate: null,
    extraNotes: '',
    createStatus: CREATE_PLEDGE_STATUS_NONE
};

const createPledgeDialogReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case createPledgeDialogActions.TOGGLE_CREATE_PLEDGE_DIALOG:
            return {
                ...initState,
                open: !state.open
            };
        case createPledgeDialogActions.CREATE_PLEDGE_DIALOG_SET_PROJECT:
            return {
                ...state,
                project: JSON.parse(JSON.stringify(action.project)),
                postMoneyValuation:
                    action.project.Pitch.hasOwnProperty('postMoneyValuation')
                        ?
                        Number(action.project.Pitch.postMoneyValuation.toFixed(2)).toLocaleString()
                        :
                        ''
                ,
                expiredDate: utils.getDateWithDaysFurtherThanToday(1),
                extraNotes: ''
            };
        case createPledgeDialogActions.CREATE_PLEDGE_DIALOG_HANDLE_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case createPledgeDialogActions.CREATE_PLEDGE_DIALOG_HANDLE_DATE_CHANGED:
            return {
                ...state,
                expiredDate:
                    action.date && action.date === "Invalid Date"
                        ?
                        NaN
                        :
                        action.date === null
                            ?
                            null
                            :
                            action.date.getTime()
            };
        case createPledgeDialogActions.CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED:
            return {
                ...state,
                createStatus: action.status
            };
        default:
            return state;
    }
};

export default createPledgeDialogReducer;