import * as clubAttributesActions from '../actions/clubAttributesActions';

const initState = {
    clubAttributes: null,
    clubAttributesLoaded: false,
    clubAttributesBeingLoaded: false
};

const clubAttributesReducer = (state = initState, action) => {
    switch (action.type) {
        case clubAttributesActions.LOADING_CLUB_ATTRIBUTES:
            return {
                ...state,
                clubAttributes: null,
                clubAttributesLoaded: false,
                clubAttributesBeingLoaded: true
            };
        case clubAttributesActions.CLUB_ATTRIBUTES_LOADED:
            return {
                ...state,
                clubAttributes: JSON.parse(JSON.stringify(action.clubAttributes)),
                clubAttributesLoaded: true,
                clubAttributesBeingLoaded: false
            };
        case clubAttributesActions.CLUB_ATTRIBUTES_CHANGED:
            return {
                ...state,
                clubAttributes: {
                    ...state.clubAttributes,
                    [action.key]: action.value
                }
            };
        default:
            return state;
    }
};

export default clubAttributesReducer;