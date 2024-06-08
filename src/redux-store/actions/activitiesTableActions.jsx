import * as DB_CONST from '../../firebase/databaseConsts';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import firebase from '../../firebase/firebaseApp';

export const ACTIVITIES_TABLE_SET_TABLE_USER = 'ACTIVITIES_TABLE_SET_TABLE_USER';
export const setTableUser = newUser => {
    return (dispatch, getState) => {
        const prevTableUser = getState().manageActivitiesTable.tableUser;

        // if user is set to null --> meaning that we're resetting the table
        // if the previous table user is null --> still set the new user
        if (!newUser || !prevTableUser) {
            dispatch({
                type: ACTIVITIES_TABLE_SET_TABLE_USER,
                user: newUser
            });
            return;
        }

        // previous table user is an actual user of normal users or admins
        if (prevTableUser.hasOwnProperty('id')) {
            // new table user is also an actual user of normal users or admins
            if (newUser.hasOwnProperty('id')) {
                if (prevTableUser.id === newUser.id) {
                    return;
                } else {
                    // set new table user
                }
            }
            // new table user is a groupProperties object
            else {
                // set new table user
            }
        }
        // previous table user is a groupProperties object
        else {
            // new table user is an actual user of normal users or admins
            if (newUser.hasOwnProperty('id')) {
                // set new table user
            }
            // new table user is also a groupProperties object
            else {
                if (prevTableUser.anid === newUser.anid) {
                    return;
                }
            }
        }

        dispatch({
            type: ACTIVITIES_TABLE_SET_TABLE_USER,
            user: newUser
        });
    }
};

export const ACTIVITIES_TABLE_LOADING_ACTIVITIES = 'ACTIVITIES_TABLE_LOADING_ACTIVITIES';
export const ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES = 'ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES';
export const loadActivities = () => {
    return (dispatch, getState) => {
        const tableUser = getState().manageActivitiesTable.tableUser;
        const currentUser = getState().auth.user;

        if (!tableUser || !currentUser) {
            dispatch({
                type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                activities: []
            });
            return;
        }

        // current user is not an admin
        if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
            // and the current user is not the user referenced in the table
            if (tableUser.hasOwnProperty('id') && currentUser.id === tableUser.id) {
                // do nothing as the current user is actually the table user
            } else {
                dispatch({
                    type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                    activities: []
                });
                return;
            }
        }

        dispatch({
            type: ACTIVITIES_TABLE_LOADING_ACTIVITIES
        });

        // table user is an actual user
        if (tableUser.hasOwnProperty('id')) {
            realtimeDBUtils
                .fetchActivitiesBy({
                    userID: tableUser.id,
                    fetchBy: realtimeDBUtils.FETCH_ACTIVITIES_BY_USER
                })
                .then(activities => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: [...activities]
                    });
                })
                .catch(error => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: []
                    });
                });
        }
        // table user is a groupProperties object
        else {
            realtimeDBUtils
                .loadGroupAdminsBasedOnGroupID(tableUser.anid)
                .then(groupAdmins => {

                    let allActivities = [];

                    Promise.all(
                        groupAdmins.map(groupAdmin => {
                            return new Promise((resolve, reject) => {
                                realtimeDBUtils
                                    .fetchActivitiesBy({
                                        userID: groupAdmin.id,
                                        shouldLoadUserProfile: true,
                                        fetchBy: realtimeDBUtils.FETCH_ACTIVITIES_BY_USER
                                    })
                                    .then(activities => {
                                        allActivities = [...allActivities, ...activities];
                                        return resolve(allActivities);
                                    })
                                    .catch(error => {
                                        return reject(error);
                                    });
                            });
                        })
                    ).then(() => {
                        dispatch({
                            type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                            activities: [...allActivities]
                        });
                    }).catch(error => {
                        dispatch({
                            type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                            activities: []
                        });
                    });

                })
                .catch(error => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: []
                    });
                });
        }
    }
};

export const ACTIVITIES_TABLE_PAGE_CHANGED = 'ACTIVITIES_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: ACTIVITIES_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED = 'ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

//----------------------------------------------------------------------------------------------------------------------
let activitiesListener = null;

export const ACTIVITIES_IN_TABLE_CHANGED = 'ACTIVITIES_IN_TABLE_CHANGED';
export const startListeningForActivitiesChanged = () => {
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const tableUser = getState().manageActivitiesTable.tableUser;

        if (currentUser.type !== DB_CONST.TYPE_ADMIN && currentUser.id !== tableUser.id) {
            return;
        }

        if (activitiesListener) {
            return;
        }

        // table user is an actual user
        if (tableUser.hasOwnProperty('id')) {
            activitiesListener = firebase
                .database()
                .ref(DB_CONST.ACTIVITIES_LOG_CHILD)
                .orderByChild('userID')
                .equalTo(tableUser.id);
        }
        // table user is a groupProperties object
        else {
            activitiesListener = firebase
                .database()
                .ref(DB_CONST.ACTIVITIES_LOG_CHILD);
        }

        activitiesListener
            .on('child_added', snapshot => {
                const activity = snapshot.val();
                let activities = [...getState().manageActivitiesTable.activities];

                const activityIndex = activities.findIndex(existingActivity => existingActivity.id === activity.id);
                if (activityIndex === -1) {
                    // table user is an actual user
                    if (tableUser.hasOwnProperty('id')) {
                        dispatch({
                            type: ACTIVITIES_IN_TABLE_CHANGED,
                            activities: [...activities, activity]
                        });
                    }
                    // table user is a groupProperties object
                    else {
                        realtimeDBUtils
                            .loadGroupAdminsBasedOnGroupID(tableUser.anid)
                            .then(groupAdmins => {
                                const adminIndex = groupAdmins.findIndex(groupAdmin => groupAdmin.id === activity.userID);
                                if (adminIndex !== -1) {
                                    activity.userProfile = groupAdmins[adminIndex];
                                    dispatch({
                                        type: ACTIVITIES_IN_TABLE_CHANGED,
                                        activities: [...activities, activity]
                                    });
                                }
                            });
                    }
                }
            });
    }
};

export const stopListeningForActivitiesChanged = () => {
    return (dispatch, getState) => {
        if (activitiesListener) {
            activitiesListener.off('child_added');
            activitiesListener = null;
        }
    }
};