import * as legalDocumentsActions from '../actions/legalDocumentsActions';
import * as authActions from '../actions/authActions';

const initState = {
    userID: null,

    legalDocuments: null,
    legalDocumentsLoaded: false,
    legalDocumentsBeingLoaded: false
};

const legalDocumentsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT: {
            return initState;
        }
        case legalDocumentsActions.LEGAL_DOCUMENTS_SET_USER:
            return {
                ...state,
                userID: action.userID
            };
        case legalDocumentsActions.LOADING_LEGAL_DOCUMENTS:
            return {
                ...state,
                legalDocuments: [],
                legalDocumentsLoaded: false,
                legalDocumentsBeingLoaded: true
            };
        case legalDocumentsActions.FINISHED_LOADING_LEGAL_DOCUMENTS:
            return {
                ...state,
                legalDocuments: action.legalDocuments,
                legalDocumentsLoaded: true,
                legalDocumentsBeingLoaded: false
            };
        case legalDocumentsActions.LEGAL_DOCUMENTS_CHANGED: {
            return {
                ...state,
                legalDocuments: action.legalDocuments
            };
        }
        default:
            return state;
    }
};

export default legalDocumentsReducer;

