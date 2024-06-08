import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_SYSTEM_GROUPS = 'LOADING_SYSTEM_GROUPS';
export const FINISHED_LOADING_SYSTEM_GROUPS = 'FINISHED_LOADING_SYSTEM_GROUPS';
export const loadGroups = () => {
    return (dispatch, getState) => {
        const {
            loadingGroups,
            groupsLoaded
        } = getState().manageSystemGroups;

        if (!loadingGroups && !groupsLoaded) {
            dispatch({
                type: LOADING_SYSTEM_GROUPS
            });

            realtimeDBUtils
                .loadAngelNetworks({}, realtimeDBUtils.SEARCH_ANGEL_NETWORKS_NONE)
                .then(groups => {
                    dispatch({
                        type: FINISHED_LOADING_SYSTEM_GROUPS,
                        groups: [...groups]
                    });
                })
                .catch(error => {
                    // handle error
                });
        }
    }
};

let groupsListener = null;

export const SYSTEM_GROUPS_CHANGED = 'SYSTEM_GROUPS_CHANGED';
export const startListeningForSystemGroupsChanged = () => {
    return (dispatch, getState) => {
        if (!groupsListener) {
            groupsListener = firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD);

            groupsListener
                .on('child_added', snapshot => {
                    const group = snapshot.val();

                    let groups = [...getState().manageSystemGroups.systemGroups];
                    const groupIndex = groups.findIndex(existingGroup => existingGroup.anid === group.anid);
                    if (groupIndex === -1) {
                        dispatch({
                            type: SYSTEM_GROUPS_CHANGED,
                            groups: [...groups, group]
                        });
                    }
                });

            groupsListener
                .on('child_changed', snapshot => {
                    const group = snapshot.val();

                    let groups = [...getState().manageSystemGroups.systemGroups];
                    const groupIndex = groups.findIndex(existingGroup => existingGroup.anid === group.anid);
                    if (groupIndex !== -1) {

                        groups[groupIndex] = group;

                        dispatch({
                            type: SYSTEM_GROUPS_CHANGED,
                            groups: [...groups]
                        });
                    }
                });
        }
    }
}

export const stopListeningForSystemGroupsChanged = () => {
    return (dispatch, getState) => {
        if (groupsListener) {
            groupsListener.off('child_added');
            groupsListener.off('child_changed');
            groupsListener = null;
        }
    }
}