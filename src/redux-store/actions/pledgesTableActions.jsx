import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const MANAGE_PLEDGES_TABLE_SET_PROJECT = 'MANAGE_PLEDGES_TABLE_SET_PROJECT';
export const setProject = project => {
    return (dispatch, getState) => {
        const prevProject = getState().managePledgesTable.project;
        // if the newly set project is actually the same as the one set before
        // do nothing
        if (prevProject && prevProject.id === project.id) {
            return;
        }

        dispatch({
            type: MANAGE_PLEDGES_TABLE_SET_PROJECT,
            project
        });
    };
};

export const MANAGE_PLEDGES_TABLE_LOADING_PLEDGES = 'MANAGE_PLEDGES_TABLE_LOADING_PLEDGES';
export const MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES = 'MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES';
export const loadPledges = () => {
    return (dispatch, getState) => {
        const {
            project
        } = getState().managePledgesTable;

        dispatch({
            type: MANAGE_PLEDGES_TABLE_LOADING_PLEDGES
        });

        realtimeDBUtils
            .loadPledges(project.id, null, realtimeDBUtils.LOAD_PLEDGES_ORDER_BY_PROJECT)
            .then(pledges => {
                Promise.all(pledges.map(pledge => {
                    return new Promise((resolve, reject) => {
                        realtimeDBUtils
                            .loadGroupsUserIsIn(pledge.investorID)
                            .then(groupsInvestorIsIn => {
                                pledge.groupsInvestorIsIn = groupsInvestorIsIn;
                                return resolve(pledges);
                            });
                    })
                })).then(() => {
                    dispatch({
                        type: MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES,
                        pledges
                    });
                }).catch(error => {
                    dispatch({
                        type: MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES,
                        pledges: [],
                        error
                    });
                });
            });
    }
};

export const MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE = 'MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return (dispatch, getState) => {
        const inSearchMode = getState().managePledgesTable.inSearchMode;
        const searchText = getState().managePledgesTable.searchText;
        const pledges = getState().managePledgesTable.pledges;

        if (inSearchMode) {
            dispatch({
                type: MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE,
                enter: false,
                matchedPledges: []
            });
        } else {
            let matchedPledges = pledges.filter(
                pledge => pledge.investor.firstName.toLowerCase().includes(searchText.trim().toLowerCase())
                    || pledge.investor.lastName.toLowerCase().includes(searchText.trim().toLowerCase())
            );
            dispatch({
                type: MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE,
                enter: true,
                matchedPledges
            });
        }
    }
};

export const MANAGE_PLEDGES_TABLE_PAGE_CHANGED = 'MANAGE_PLEDGES_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: MANAGE_PLEDGES_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const MANAGE_PLEDGES_TABLE_ROWS_PER_PAGE_CHANGED = 'MANAGE_PLEDGES_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: MANAGE_PLEDGES_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const MANAGE_PLEDGES_TABLE_INPUT_CHANGED = 'MANAGE_PLEDGES_TABLE_INPUT_CHANGED';
export const handlePledgesTableInputChanged = event => {
    return (dispatch, getState) => {
        const pledges = getState().managePledgesTable.pledges;

        const searchText = event.target.value;
        let matchedPledges = pledges.filter(
            pledge => pledge.investor.firstName.toLowerCase().includes(searchText.trim().toLowerCase())
                || pledge.investor.lastName.toLowerCase().includes(searchText.trim().toLowerCase())
        );

        dispatch({
            type: MANAGE_PLEDGES_TABLE_INPUT_CHANGED,
            searchText,
            matchedPledges
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let pledgesListener = null;

export const MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED = 'MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED';
export const startListeningForPledgesChanged = () => {
    return (dispatch, getState) => {
        if (!pledgesListener) {
            const project = getState().managePledgesTable.project;

            pledgesListener = firebase
                .database()
                .ref(DB_CONST.PLEDGES_CHILD)
                .orderByChild('projectID')
                .equalTo(project.id);

            pledgesListener
                .on('child_added', snapshot => {
                    let pledge = snapshot.val();

                    const pledges = [...getState().managePledgesTable.pledges];
                    let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledge.id);
                    if (pledgeIndex === -1) {
                        realtimeDBUtils
                            .getUserBasedOnID(pledge.investorID)
                            .then(investor => {
                                pledge.investor = investor;

                                realtimeDBUtils
                                    .loadGroupsUserIsIn(pledge.investorID)
                                    .then(groupsInvestorIsIn => {
                                        pledge.groupsInvestorIsIn = groupsInvestorIsIn;

                                        dispatch({
                                            type: MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED,
                                            pledges: [...pledges, pledge]
                                        });
                                    });
                            });
                    }
                });

            pledgesListener
                .on('child_changed', snapshot => {
                    let pledge = snapshot.val();

                    const pledges = [...getState().managePledgesTable.pledges];
                    let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledge.id);

                    // pledge is in the local list
                    if (pledgeIndex !== -1) {
                        let updatedPledges = [...pledges];

                        if (pledge.amount !== '') {
                            pledge.investor = updatedPledges[pledgeIndex].investor;
                            pledge.groupsInvestorIsIn = updatedPledges[pledgeIndex].groupsInvestorIsIn;
                            updatedPledges[pledgeIndex] = pledge;
                        }
                        else {
                            updatedPledges.splice(pledgeIndex, 1);
                        }

                        dispatch({
                            type: MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED,
                            pledges: [...updatedPledges]
                        });
                    }
                    // pledge is not in the local list
                    else {
                        if (pledge.amount !== '') {
                            realtimeDBUtils
                                .getUserBasedOnID(pledge.investorID)
                                .then(investor => {
                                    pledge.investor = investor;

                                    realtimeDBUtils
                                        .loadGroupsUserIsIn(pledge.investorID)
                                        .then(groupsInvestorIsIn => {
                                            pledge.groupsInvestorIsIn = groupsInvestorIsIn;

                                            dispatch({
                                                type: MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED,
                                                pledges: [...pledges, pledge]
                                            });
                                        });
                                });
                        }
                    }
                });

            pledgesListener
                .on('child_removed', snapshot => {
                    let pledgeRemovedID = snapshot.key;

                    const pledges = [...getState().managePledgesTable.pledges];
                    let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledgeRemovedID);

                    if (pledgeIndex !== -1) {
                        let updatedPledges = pledges;
                        updatedPledges.splice(pledgeIndex, 1);

                        dispatch({
                            type: MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED,
                            pledges: updatedPledges
                        });
                    }
                });
        }
    }
};

export const stopListeningForPledgesChanged = () => {
    return (dispatch, getState) => {
        if (pledgesListener) {
            pledgesListener.off('child_added');
            pledgesListener.off('child_changed');
            pledgesListener.off('child_removed');
            pledgesListener = null;
        }
    }
};