/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Thunks and Firebase listeners remain here; sync actions use the slice.
 */
import {
  setLoadingClubAttributes,
  setClubAttributesLoaded,
  setClubAttributeChanged,
} from '../slices/clubAttributesSlice';

import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

// Re-export action type strings for any consumers that match on them
export const LOADING_CLUB_ATTRIBUTES = setLoadingClubAttributes.type;
export const CLUB_ATTRIBUTES_LOADED = setClubAttributesLoaded.type;
export const CLUB_ATTRIBUTES_CHANGED = setClubAttributeChanged.type;

export const loadClubAttributes = () => {
  return (dispatch, getState) => {
    const { clubAttributesLoaded, clubAttributesBeingLoaded } = getState().manageClubAttributes;

    if (!clubAttributesLoaded && clubAttributesBeingLoaded) {
      return;
    }

    dispatch(setLoadingClubAttributes());

    realtimeDBUtils.loadClubAttributes().then((clubAttributes) => {
      dispatch(setClubAttributesLoaded({ clubAttributes }));
    });
  };
};

export const startListeningForClubAttributesChanged = () => {
  return (dispatch) => {
    const clubAttributesRef = firebase.database().ref(DB_CONST.CLUB_ATTRIBUTES_CHILD);

    clubAttributesRef.on('child_changed', (snapshot) => {
      dispatch(setClubAttributeChanged({ key: snapshot.key, value: snapshot.val() }));
    });
  };
};

export const stopListeningForClubAttributesChanged = () => {
  return () => {
    const clubAttributesRef = firebase.database().ref(DB_CONST.CLUB_ATTRIBUTES_CHILD);
    clubAttributesRef.off('child_changed');
  };
};
