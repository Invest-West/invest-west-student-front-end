import * as superAdminSettingsActions from '../actions/superAdminSettingsActions';
import * as clubAttributesActions from '../actions/clubAttributesActions';
import * as DB_CONST from '../../firebase/databaseConsts';

const initState = {
    clubAttributesEdited: null,

    addNewPledgeFAQ: false,
    addedPledgeQuestion: '',
    addedPledgeAnswer: '',
    expandedPledgeFAQ: null,
    editExpandedPledgeFAQ: false,
    editedPledgeQuestion: '',
    editedPledgeAnswer: ''
};

const superAdminSettingsReducer = (state = initState, action) => {
    switch (action.type) {
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_INITIALIZE_CLUB_ATTRIBUTES_EDITED:
            return {
                ...state,
                clubAttributesEdited: JSON.parse(JSON.stringify(action.clubAttributes))
            };
        case clubAttributesActions.CLUB_ATTRIBUTES_CHANGED:
            return {
                ...state,
                clubAttributesEdited: {
                    ...state.clubAttributesEdited,
                    [action.key]: action.value
                },
                expandedPledgeFAQ:
                    !state.expandedPledgeFAQ
                        ?
                        null
                        :
                        action.key !== DB_CONST.PLEDGE_FAQS_CHILD
                            ?
                            state.expandedPledgeFAQ
                            :
                            !action.value.hasOwnProperty(DB_CONST.PLEDGE_FAQS_CHILD)
                                ?
                                null
                                :
                                !state.expandedPledgeFAQ
                                    ?
                                    null
                                    :
                                    action.value.findIndex(faq => faq.id === state.expandedPledgeFAQ.id) === -1
                                        ?
                                        state.expandedPledgeFAQ
                                        :
                                        action.value[action.value.findIndex(faq => faq.id === state.expandedPledgeFAQ.id)]
            };
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_INPUT_CHANGED:
            const isPropertyOfClubAttributes = action.isPropertyOfClubAttributes;

            if (isPropertyOfClubAttributes) {
                return {
                    ...state,
                    clubAttributesEdited: {
                        ...state.clubAttributesEdited,
                        [action.name]: action.value
                    }
                };
            } else {
                return {
                    ...state,
                    [action.name]: action.value
                };
            }
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED:
            return {
                ...state,
                clubAttributesEdited: {
                    ...state.clubAttributesEdited,
                    [action.fieldName]: action.value
                }
            };
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED:
            return {
                ...state,
                expandedPledgeFAQ: action.expandedPledgeFAQ,
                editExpandedPledgeFAQ: action.editExpandedPledgeFAQ
            };
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ:
            return {
                ...state,
                addNewPledgeFAQ: !state.addNewPledgeFAQ,
                addedPledgeQuestion: '',
                addedPledgeAnswer: ''
            };
        case superAdminSettingsActions.SUPER_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ:
            return {
                ...state,
                editExpandedPledgeFAQ: !state.editExpandedPledgeFAQ,
                editedPledgeQuestion: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.question : '',
                editedPledgeAnswer: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.answer : ''
            };
        default:
            return state;
    }
};

export default superAdminSettingsReducer;