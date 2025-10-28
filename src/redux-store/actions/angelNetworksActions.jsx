import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_ANGEL_NETWORKS = 'LOADING_ANGEL_NETWORKS';
export const FINISHED_LOADING_ANGEL_NETWORKS = 'FINISHED_LOADING_ANGEL_NETWORKS';
export const loadAngelNetworks = () => {
    return (dispatch, getState) => {
        const admin = getState().auth.user;

        console.log('%c=== LOAD ANGEL NETWORKS DEBUG ===', 'background: #222; color: #bada55; font-size: 14px');
        console.log('Current Admin User:', admin);
        console.log('superAdmin:', admin?.superAdmin);
        console.log('superGroupAdmin:', admin?.superGroupAdmin);
        console.log('type:', admin?.type, '(TYPE_ADMIN = 3)');
        console.log('anid:', admin?.anid);

        if (!admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN)) {
            console.log('%c❌ BLOCKED: User does not have admin permissions', 'color: red; font-weight: bold');
            dispatch({
                type: FINISHED_LOADING_ANGEL_NETWORKS
            });
            return;
        }

        dispatch({
            type: LOADING_ANGEL_NETWORKS
        });

        realtimeDBUtils
            .loadAngelNetworks({}, realtimeDBUtils.SEARCH_ANGEL_NETWORKS_NONE)
            .then(angelNetworks => {
                console.log('%c📊 Loaded Universities:', 'color: blue; font-weight: bold');
                console.log('Total count:', angelNetworks.length);
                console.table(angelNetworks.map(n => ({
                    name: n.displayName,
                    anid: n.anid,
                    isInvestWest: n.isInvestWest
                })));

                // Note: Courses are now in separate Courses node, so we don't need to filter them out here
                let filteredAngelNetworks = angelNetworks;

                // Check filtering logic - super admins OR super group admins see everything
                const isSuperUser = admin.superAdmin || admin.superGroupAdmin;
                const shouldFilter = !isSuperUser && admin.type === DB_CONST.TYPE_ADMIN && admin.anid;
                console.log('Is Super User (superAdmin OR superGroupAdmin)?', isSuperUser);
                console.log('Should filter for group admin?', shouldFilter);

                // Only regular group admins (not super admins or super group admins) see filtered view
                if (shouldFilter) {
                    console.log('%c🔒 FILTERING: Regular group admin mode - showing only admin.anid:', 'color: orange', admin.anid);
                    filteredAngelNetworks = angelNetworks.filter(network => network.anid === admin.anid);
                } else {
                    console.log('%c✅ NO FILTERING: Super user mode (superAdmin OR superGroupAdmin) - showing ALL universities', 'color: green; font-weight: bold');
                }

                console.log('%c📤 Dispatching filtered results:', 'color: purple; font-weight: bold');
                console.log('Filtered count:', filteredAngelNetworks.length);
                console.table(filteredAngelNetworks.map(n => ({
                    name: n.displayName,
                    anid: n.anid
                })));
                console.log('%c=================================', 'background: #222; color: #bada55');

                dispatch({
                    type: FINISHED_LOADING_ANGEL_NETWORKS,
                    angelNetworks: filteredAngelNetworks
                });
            })
            .catch(error => {
                console.error('%c❌ ERROR loading angel networks:', 'color: red; font-weight: bold', error);
                dispatch({
                    type: FINISHED_LOADING_ANGEL_NETWORKS,
                    error
                });
            });
    }
};

export const ANGEL_NETWORKS_TABLE_PAGE_CHANGED = 'ANGEL_NETWORKS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: ANGEL_NETWORKS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const ANGEL_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED = 'ANGEL_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: ANGEL_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const ANGEL_NETWORKS_TABLE_INPUT_CHANGED = 'ANGEL_NETWORKS_TABLE_INPUT_CHANGED';
export const handleAngelNetworksTableInputChanged = event => {
    return (dispatch, getState) => {
        const angelNetworks = [...getState().manageAngelNetworks.angelNetworks];

        const searchText = event.target.value;
        let matchedAngelNetworks = angelNetworks.filter(angelNetwork => angelNetwork.displayName.toLowerCase().includes(searchText.trim().toLowerCase()));

        dispatch({
            type: ANGEL_NETWORKS_TABLE_INPUT_CHANGED,
            searchText,
            matchedAngelNetworks
        });
    }
};

export const TOGGLE_SEARCH_MODE_IN_ANGEL_NETWORKS_TABLE = 'TOGGLE_SEARCH_MODE_IN_ANGEL_NETWORKS_TABLE';
export const toggleSearchMode = () => {
    return (dispatch, getState) => {
        const inSearchMode = getState().manageAngelNetworks.inSearchMode;
        const searchText = getState().manageAngelNetworks.searchText;
        const angelNetworks = [...getState().manageAngelNetworks.angelNetworks];

        if (inSearchMode) {
            dispatch({
                type: TOGGLE_SEARCH_MODE_IN_ANGEL_NETWORKS_TABLE,
                enter: false,
                matchedAngelNetworks: []
            });
        } else {
            let matchedAngelNetworks = angelNetworks.filter(angelNetwork => angelNetwork.displayName.toLowerCase().includes(searchText.trim().toLowerCase()));
            dispatch({
                type: TOGGLE_SEARCH_MODE_IN_ANGEL_NETWORKS_TABLE,
                enter: true,
                matchedAngelNetworks
            });
        }
    }
};

// Listeners -----------------------------------------------------------------------------------------------------------

let angelNetworksListener = null;

export const ANGEL_NETWORKS_IN_TABLE_CHANGED = 'ANGEL_NETWORKS_IN_TABLE_CHANGED';

export const startListeningForAngelNetworksChanged = () => {
    return (dispatch, getState) => {
        if (!angelNetworksListener) {
            const admin = getState().auth.user;

            angelNetworksListener = firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD);

            angelNetworksListener
                .on('child_added', snapshot => {
                    let angelNetwork = snapshot.val();

                    // Only regular group admins (not super admins or super group admins) should be filtered
                    const isSuperUser = admin.superAdmin || admin.superGroupAdmin;
                    if (!isSuperUser && admin.type === DB_CONST.TYPE_ADMIN && admin.anid) {
                        if (angelNetwork.anid !== admin.anid) {
                            return; // Skip this network if it doesn't belong to the regular group admin
                        }
                    }

                    let angelNetworks = [...getState().manageAngelNetworks.angelNetworks];
                    let angelNetworkIndex = angelNetworks.findIndex(existingAN => existingAN.anid === angelNetwork.anid);

                    if (angelNetworkIndex === -1) {
                        dispatch({
                            type: ANGEL_NETWORKS_IN_TABLE_CHANGED,
                            angelNetworks: [...angelNetworks, angelNetwork]
                        });
                    }
                });

            angelNetworksListener
                .on('child_changed', snapshot => {
                    let angelNetwork = snapshot.val();

                    // Only regular group admins (not super admins or super group admins) should be filtered
                    const isSuperUser = admin.superAdmin || admin.superGroupAdmin;
                    if (!isSuperUser && admin.type === DB_CONST.TYPE_ADMIN && admin.anid) {
                        if (angelNetwork.anid !== admin.anid) {
                            return; // Skip this network if it doesn't belong to the regular group admin
                        }
                    }

                    let angelNetworks = [...getState().manageAngelNetworks.angelNetworks];
                    let angelNetworkIndex = angelNetworks.findIndex(existingAN => existingAN.anid === angelNetwork.anid);

                    if (angelNetworkIndex !== -1) {
                        angelNetworks[angelNetworkIndex] = angelNetwork;
                        dispatch({
                            type: ANGEL_NETWORKS_IN_TABLE_CHANGED,
                            angelNetworks
                        });
                    }
                });
        }
    }
};

export const stopListeningForAngelNetworksChanged = () => {
    return (dispatch, getState) => {
        if (angelNetworksListener) {
            angelNetworksListener.off('child_added');
            angelNetworksListener.off('child_changed');
            angelNetworksListener = null;
        }
    }
};