import * as manageMarketingPreferencesActions from '../actions/manageMarketingPreferencesActions';
import * as authActions from '../actions/authActions';

const initState = {
    marketingPreferences: [],
    loadingMarketingPreferences: false,
    marketingPreferencesLoaded: false
};

const manageMarketingPreferencesReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageMarketingPreferencesActions.LOADING_MARKETING_PREFERENCES:
            return {
                ...state,
                marketingPreferences: [],
                loadingMarketingPreferences: true,
                marketingPreferencesLoaded: false
            };
        case manageMarketingPreferencesActions.FINISHED_LOADING_MARKETING_PREFERENCES:
            return {
                ...state,
                marketingPreferences: JSON.parse(JSON.stringify(action.marketingPreferences)),
                loadingMarketingPreferences: false,
                marketingPreferencesLoaded: true
            };
        default:
            return state;
    }
}

export default manageMarketingPreferencesReducer;