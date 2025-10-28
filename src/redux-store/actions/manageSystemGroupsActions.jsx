import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_SYSTEM_GROUPS = 'LOADING_SYSTEM_GROUPS';
export const FINISHED_LOADING_SYSTEM_GROUPS = 'FINISHED_LOADING_SYSTEM_GROUPS';
export const loadGroups = () => {
    return async (dispatch, getState) => {
        const {
            loadingGroups,
            groupsLoaded
        } = getState().manageSystemGroups;

        if (!loadingGroups && !groupsLoaded) {
            dispatch({
                type: LOADING_SYSTEM_GROUPS
            });

            try {
                // Load universities from GroupProperties
                const universities = await realtimeDBUtils.loadAngelNetworks({}, realtimeDBUtils.SEARCH_ANGEL_NETWORKS_NONE);

                // Load courses from new Courses node
                const coursesSnapshot = await firebase
                    .database()
                    .ref(DB_CONST.COURSES_CHILD)
                    .once('value');

                let courses = [];
                if (coursesSnapshot.exists()) {
                    const coursesObject = coursesSnapshot.val();
                    courses = Object.keys(coursesObject).map(key => coursesObject[key]);
                }

                // Merge universities and courses
                const allGroups = [...universities, ...courses];

                dispatch({
                    type: FINISHED_LOADING_SYSTEM_GROUPS,
                    groups: allGroups
                });
            } catch (error) {
                console.error('Error loading groups:', error);
                dispatch({
                    type: FINISHED_LOADING_SYSTEM_GROUPS,
                    groups: []
                });
            }
        }
    }
};

let groupsListener = null;
let coursesListener = null;

export const SYSTEM_GROUPS_CHANGED = 'SYSTEM_GROUPS_CHANGED';
export const startListeningForSystemGroupsChanged = () => {
    return (dispatch, getState) => {
        // Listen to universities (GroupProperties node)
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

        // Listen to courses (Courses node)
        if (!coursesListener) {
            coursesListener = firebase
                .database()
                .ref(DB_CONST.COURSES_CHILD);

            coursesListener
                .on('child_added', snapshot => {
                    const course = snapshot.val();

                    let groups = [...getState().manageSystemGroups.systemGroups];
                    const groupIndex = groups.findIndex(existingGroup => existingGroup.anid === course.anid);
                    if (groupIndex === -1) {
                        dispatch({
                            type: SYSTEM_GROUPS_CHANGED,
                            groups: [...groups, course]
                        });
                    }
                });

            coursesListener
                .on('child_changed', snapshot => {
                    const course = snapshot.val();

                    let groups = [...getState().manageSystemGroups.systemGroups];
                    const groupIndex = groups.findIndex(existingGroup => existingGroup.anid === course.anid);
                    if (groupIndex !== -1) {
                        groups[groupIndex] = course;

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
        if (coursesListener) {
            coursesListener.off('child_added');
            coursesListener.off('child_changed');
            coursesListener = null;
        }
    }
}