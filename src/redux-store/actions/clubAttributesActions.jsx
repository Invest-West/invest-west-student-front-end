import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_CLUB_ATTRIBUTES = 'LOADING_CLUB_ATTRIBUTES';
export const CLUB_ATTRIBUTES_LOADED = 'CLUB_ATTRIBUTES_LOADED';
export const loadClubAttributes = () => {
    return (dispatch, getState) => {

        const {
            clubAttributesLoaded,
            clubAttributesBeingLoaded
        } = getState().manageClubAttributes;

        if (!clubAttributesLoaded && clubAttributesBeingLoaded) {
            return;
        }

        dispatch({
            type: LOADING_CLUB_ATTRIBUTES
        });

        realtimeDBUtils
            .loadClubAttributes()
            .then(clubAttributes => {
                dispatch({
                    type: CLUB_ATTRIBUTES_LOADED,
                    clubAttributes
                });
            });
    }
};

export const CLUB_ATTRIBUTES_CHANGED = 'CLUB_ATTRIBUTES_CHANGED';
export const startListeningForClubAttributesChanged = () => {
    return (dispatch, getState) => {
        let clubAttributesRef = firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD);

        clubAttributesRef
            .on('child_changed', snapshot => {
                dispatch({
                    type: CLUB_ATTRIBUTES_CHANGED,
                    key: snapshot.key,
                    value: snapshot.val()
                });
            });
    }
};

export const stopListeningForClubAttributesChanged = () => {
    return (dispatch, getState) => {
        let clubAttributesRef = firebase
            .database()
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD);

        clubAttributesRef.off('child_changed');
    }
};