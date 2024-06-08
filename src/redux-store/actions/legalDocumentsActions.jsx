import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LEGAL_DOCUMENTS_SET_USER = 'LEGAL_DOCUMENTS_SET_USER';
export const setUserID = userID => {
    return {
        type: LEGAL_DOCUMENTS_SET_USER,
        userID
    }
};

export const LOADING_LEGAL_DOCUMENTS = 'LOADING_LEGAL_DOCUMENTS';
export const FINISHED_LOADING_LEGAL_DOCUMENTS = 'FINISHED_LOADING_LEGAL_DOCUMENTS';
export const getLegalDocuments = () => {
    return (dispatch, getState) => {

        const userID = getState().legalDocuments.userID;

        dispatch({
            type: LOADING_LEGAL_DOCUMENTS
        });

        firebase
            .database()
            .ref(DB_CONST.LEGAL_DOCUMENTS_CHILD)
            .child(userID)
            .once('value', snapshot => {
                if (!snapshot || !snapshot.exists()) {
                    dispatch({
                        type: FINISHED_LOADING_LEGAL_DOCUMENTS,
                        legalDocuments: null,
                        error: 'No legal documents'
                    });
                    return;
                }

                dispatch({
                    type: FINISHED_LOADING_LEGAL_DOCUMENTS,
                    legalDocuments: snapshot.val()
                });
            });
    }
};

let legalDocumentsListener = null;

export const LEGAL_DOCUMENTS_CHANGED = 'LEGAL_DOCUMENTS_CHANGED';
export const startListeningForLegalDocumentsChanged = () => {
    return (dispatch, getState) => {
        const userID = getState().legalDocuments.userID;

        if (!legalDocumentsListener) {
            legalDocumentsListener = firebase
                .database()
                .ref(DB_CONST.LEGAL_DOCUMENTS_CHILD)
                .child(userID);

            legalDocumentsListener
                .once('value', snapshot => {
                    // user has not uploaded any documents
                    if (!snapshot || !snapshot.exists()) {
                        legalDocumentsListener = null;
                        return;
                    }

                    legalDocumentsListener
                        .on('child_added', snapshot => {
                            let updatedLegalDocuments = Object.assign([], getState().legalDocuments.legalDocuments);
                            if (updatedLegalDocuments.length === 0) {
                                updatedLegalDocuments = [snapshot.val()];
                            }
                            else {
                                const index = updatedLegalDocuments.findIndex(doc => doc.storageID === snapshot.val().storageID);
                                if (index === -1) {
                                    updatedLegalDocuments.push(snapshot.val());
                                }
                            }

                            dispatch({
                                type: LEGAL_DOCUMENTS_CHANGED,
                                legalDocuments: updatedLegalDocuments
                            });
                        });

                    legalDocumentsListener
                        .on('child_changed', snapshot => {
                            let updatedLegalDocuments = [...getState().legalDocuments.legalDocuments];
                            updatedLegalDocuments[snapshot.key] = snapshot.val();

                            dispatch({
                                type: LEGAL_DOCUMENTS_CHANGED,
                                legalDocuments: updatedLegalDocuments
                            });
                        });
                });
        }
    }
};

export const stopListeningForLegalDocumentsChanged = () => {
    return (dispatch, getState) => {
        if (legalDocumentsListener) {
            legalDocumentsListener.off('child_added');
            legalDocumentsListener.off('child_changed');
            legalDocumentsListener = null;
        }
    }
};