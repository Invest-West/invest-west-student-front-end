import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const SET_GROUP_USER_NAME_FROM_PARAMS = 'SET_GROUP_USER_NAME_FROM_PARAMS';
export const setGroupUserNameFromParams = groupUserName => {
    return (dispatch, getState) => {
        const prevGroupUserName = getState().manageGroupFromParams.groupUserName;

        // if the newly set groupUserName is different from the current groupUserName, check again
        if (prevGroupUserName !== groupUserName) {
            dispatch({
                type: SET_GROUP_USER_NAME_FROM_PARAMS,
                groupUserName
            });
        }
    }
};

export const SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING = 'SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING';
export const setExpectedAndCurrentPathsForChecking = (expectedPath, currentPath) => {
    return {
        type: SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING,
        expectedPath,
        currentPath
    }
};

export const LOADING_ANGEL_NETWORK = 'LOADING_ANGEL_NETWORK';
export const ANGEL_NETWORK_LOADED = 'ANGEL_NETWORK_LOADED';
export const loadAngelNetwork = () => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const {
                groupUserName,
                groupProperties,
                groupPropertiesLoaded,
                angelNetworkBeingLoaded,

                expectedPath,
                currentPath
            } = getState().manageGroupFromParams;

            const firebaseUser = firebase.auth().currentUser;

            // angel network has not been loaded before
            if (!groupProperties && !groupPropertiesLoaded && !angelNetworkBeingLoaded) {
                dispatch({
                    type: LOADING_ANGEL_NETWORK
                });

                // path expected and current path not matched
                if (expectedPath !== currentPath) {
                    dispatch({
                        type: ANGEL_NETWORK_LOADED,
                        angelNetwork: null,
                        shouldLoadOtherData: false
                    });
                    resolve();
                    return;
                }

                // groupUserName is not specified --> Invest West super
                if (!groupUserName) {
                    // the user is logged in
                    if (firebaseUser) {
                        realtimeDBUtils
                            .getUserBasedOnID(firebaseUser.uid)
                            .then(user => {
                                if (user.type === DB_CONST.TYPE_ADMIN) {
                                    if (user.superAdmin) {
                                        dispatch({
                                            type: ANGEL_NETWORK_LOADED,
                                            angelNetwork: null,
                                            shouldLoadOtherData: true
                                        });
                                    } else {
                                        dispatch({
                                            type: ANGEL_NETWORK_LOADED,
                                            angelNetwork: null,
                                            shouldLoadOtherData: false
                                        });
                                    }
                                } else {
                                    dispatch({
                                        type: ANGEL_NETWORK_LOADED,
                                        angelNetwork: null,
                                        shouldLoadOtherData: false
                                    });
                                }
                                resolve();
                            })
                            .catch(error => {
                                console.error('Error loading user:', error);
                                dispatch({
                                    type: ANGEL_NETWORK_LOADED,
                                    angelNetwork: null,
                                    shouldLoadOtherData: false
                                });
                                reject(error);
                            });
                    }
                    // the user is not logged in
                    else {
                        dispatch({
                            type: ANGEL_NETWORK_LOADED,
                            angelNetwork: null,
                            shouldLoadOtherData: true
                        });
                        resolve();
                        return;
                    }
                    return;
                }

                // angel network has been loaded before
                if (groupProperties) {
                    // if anid = null (Invest West) or anid = angel network's anid
                    // do not need to load the angel network again
                    if (groupUserName === groupProperties.groupUserName) {
                        dispatch({
                            type: ANGEL_NETWORK_LOADED,
                            angelNetwork: groupProperties,
                            shouldLoadOtherData: true
                        });
                        resolve();
                        return;
                    }
                    // if the loaded angel network's anid is not the same as the anid specified in the URL --> load again
                    else {
                        dispatch({
                            type: SET_GROUP_USER_NAME_FROM_PARAMS,
                            groupUserName
                        });

                        dispatch({
                            type: LOADING_ANGEL_NETWORK
                        });
                    }
                }

                realtimeDBUtils
                    .loadAngelNetworkBasedOnGroupUserName(groupUserName)
                    .then(angelNetwork => {
                        dispatch({
                            type: ANGEL_NETWORK_LOADED,
                            angelNetwork,
                            shouldLoadOtherData: true
                        });
                        resolve();
                    })
                    .catch(error => {
                        console.error('Error loading angel network:', error);
                        dispatch({
                            type: ANGEL_NETWORK_LOADED,
                            angelNetwork: null,
                            shouldLoadOtherData: false
                        });
                        reject(error);
                    });
            }
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let angelNetworkListener = null;

export const ANGEL_NETWORK_PROPERTIES_CHANGED = 'ANGEL_NETWORK_PROPERTIES_CHANGED';
export const startListeningForAngelNetworkChanged = () => {
    return (dispatch, getState) => {
        if (!angelNetworkListener) {
            const {
                groupProperties
            } = getState().manageGroupFromParams;

            if (groupProperties) {
                if (angelNetworkListener) {
                    return;
                }
                angelNetworkListener = firebase
                    .database()
                    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                    .child(groupProperties.anid)
                    .on('child_changed', snapshot => {
                        const key = snapshot.key;
                        const value = snapshot.val();
                        dispatch({
                            type: ANGEL_NETWORK_PROPERTIES_CHANGED,
                            key,
                            value
                        });
                    });
            }
            else {
                if (angelNetworkListener) {
                    angelNetworkListener.off('child_changed');
                    angelNetworkListener = null;
                }
            }
        }
    }
};

export const stopListeningForAngelNetworkChanged = () => {
    return (dispatch, getState) => {
        if (angelNetworkListener) {
            angelNetworkListener.off('child_changed');
            angelNetworkListener = null;
        }
    }
};