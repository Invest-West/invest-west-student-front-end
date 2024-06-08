import * as myUtils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';

export const SUPER_ADMIN_SETTINGS_INITIALIZE_CLUB_ATTRIBUTES_EDITED = 'SUPER_ADMIN_SETTINGS_INITIALIZE_CLUB_ATTRIBUTES_EDITED';
export const initializeClubAttributesEdited = () => {
    return (dispatch, getState) => {
        dispatch({
            type: SUPER_ADMIN_SETTINGS_INITIALIZE_CLUB_ATTRIBUTES_EDITED,
            clubAttributes: getState().manageClubAttributes.clubAttributes
        });
    }
};

export const SUPER_ADMIN_SETTINGS_INPUT_CHANGED = 'SUPER_ADMIN_SETTINGS_INPUT_CHANGED';
export const handleInputChanged = event => {
    return (dispatch, getState) => {
        const clubAttributesEdited = getState().superAdminSettings.clubAttributesEdited;
        const target = event.target;

        let isPropertyOfClubAttributes = false;

        switch (target.type) {
            case 'checkbox':
                if (clubAttributesEdited.hasOwnProperty(target.name)) {
                    firebase
                        .database()
                        .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
                        .child(target.name)
                        .set(target.checked);

                    return;
                }
                break;
            case 'radio':
                if (clubAttributesEdited.hasOwnProperty(target.name)) {
                    firebase
                        .database()
                        .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
                        .child(target.name)
                        .set(!isNaN(target.value) ? parseInt(target.value) : target.value);

                    return;
                }
                break;
            case 'text':
                if (clubAttributesEdited.hasOwnProperty(target.name)) {
                    isPropertyOfClubAttributes = true;

                    firebase
                        .database()
                        .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
                        .child(target.name)
                        .set(target.value);
                }
                break;
            case 'textarea':
                if (clubAttributesEdited.hasOwnProperty(target.name)) {
                    isPropertyOfClubAttributes = true;

                    firebase
                        .database()
                        .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
                        .child(target.name)
                        .set(target.value);
                }
                break;
            default:
                return;
        }

        dispatch({
            type: SUPER_ADMIN_SETTINGS_INPUT_CHANGED,
            name: target.name,
            value: target.type === 'checkbox' ? target.checked : target.value,
            isPropertyOfClubAttributes
        });
    }
};

export const SUPER_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED = 'SUPER_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED';
export const handleQuillEditorChanged = (fieldName, content, delta, source, editor) => {
    return (dispatch, getState) => {
        if (editor.getText().trim().length === 0) {
            dispatch({
                type: SUPER_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED,
                fieldName,
                value: {ops: []}
            });
        } else {
            dispatch({
                type: SUPER_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED,
                fieldName,
                value: editor.getContents()
            });
        }
    }
};

export const saveEditedQuill = fieldName => {
    return (dispatch, getState) => {
        firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
            .child(fieldName)
            .set(getState().superAdminSettings.clubAttributesEdited[fieldName])
    }
};

export const SUPER_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED = 'SUPER_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED';
export const handleExpandPledgeFAQPanel = (FAQ, isExpanded) => {
    return (dispatch, getState) => {

        const expandedPledgeFAQ = getState().superAdminSettings.expandedPledgeFAQ;

        if (isExpanded) {
            dispatch({
                type: SUPER_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                expandedPledgeFAQ: FAQ,
                editExpandedPledgeFAQ: false
            });
        } else {
            if (expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id) {
                dispatch({
                    type: SUPER_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                    expandedPledgeFAQ: null,
                    editExpandedPledgeFAQ: false
                });
            }
        }
    }
};

export const SUPER_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ = 'SUPER_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ';
export const toggleEditExpandedPledgeFAQ = () => {
    return {
        type: SUPER_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
    }
};

export const SUPER_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ = 'SUPER_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ';
export const toggleAddNewPledgeFAQ = () => {
    return {
        type: SUPER_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
    }
};

export const submitNewPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            addedPledgeQuestion,
            addedPledgeAnswer
        } = getState().superAdminSettings;

        const clubAttributesEdited = Object.assign({}, getState().manageClubAttributes.clubAttributes);

        if (addedPledgeQuestion.trim().length === 0 || addedPledgeAnswer.trim().length === 0) {
            return;
        }

        const faq = {
            id: myUtils.getCurrentDate(),
            question: addedPledgeQuestion,
            answer: addedPledgeAnswer
        };

        if (clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]) {
            clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].push(faq);
        } else {
            clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD] = [faq];
        }

        firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .update(clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: SUPER_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
                });
            });
    }
};

export const saveEditedPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            clubAttributesEdited,
            expandedPledgeFAQ,
            editedPledgeQuestion,
            editedPledgeAnswer
        } = getState().superAdminSettings;

        if (editedPledgeQuestion.trim().length === 0 || editedPledgeAnswer.trim().length === 0) {
            return;
        }

        const editedFAQ = {
            id: expandedPledgeFAQ.id,
            question: editedPledgeQuestion,
            answer: editedPledgeAnswer
        };

        let index = clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD][index] = editedFAQ;

        firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: SUPER_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
                });
            });
    }
};

export const deleteExistingPledgeFAQ = () => {
    return (dispatch, getState) => {
        const expandedPledgeFAQ = getState().superAdminSettings.expandedPledgeFAQ;
        const clubAttributesEdited = Object.assign({}, getState().manageClubAttributes.clubAttributesEdited);

        let index = clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].splice(index, 1);

        firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]);
    }
};


