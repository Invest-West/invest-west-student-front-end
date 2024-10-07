/**
 * This file contains all of the utility functions relating to Firebase database.
 */

import firebase from "./firebaseApp";

import * as ROUTES from "../router/routes";
import * as DB_CONST from "./databaseConsts";
import * as utils from "../utils/utils";
import Api, {ApiRoutes} from "../api/Api";

/**
 * This function is used to track activities of a user
 *
 * @param userID
 * @param activityType
 * @param interactedObjectLocation
 * @param interactedObjectID
 * @param activitySummary
 * @param action
 * @param value
 */
export const trackActivity = (
    {
        userID, // user id (note that this id is the official user id for group admins and super admins)
        activityType,
        interactedObjectLocation = null, // main node in database (when changing password, this is null)
        interactedObjectID = null, // object's id (when changing password, this is null)
        activitySummary, // brief summary of the activity
        action = null,
        value = null // optional --> track changes of a node if it does.
        // Format:
        //  + value: {before: node_before_changed, after: node_after_changed} --> if there are changes
        //  + value: node_object --> if the node has just been created
    }
) => {
    const id = firebase
        .database()
        .ref(DB_CONST.ACTIVITIES_LOG_CHILD)
        .push()
        .key;

    firebase
        .database()
        .ref(DB_CONST.ACTIVITIES_LOG_CHILD)
        .child(id)
        .set({
            id,
            userID,
            activityType,
            interactedObjectLocation,
            interactedObjectID,
            activitySummary,
            action,
            value,
            time: utils.getCurrentDate()
        })
        .then(() => {
            // do nothing
        })
        .catch(error => {
            // handle error
        });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const FETCH_ACTIVITIES_BY_USER = 'FETCH_ACTIVITIES_BY_USER';
export const FETCH_ACTIVITIES_BY_TYPE = 'FETCH_ACTIVITIES_BY_TYPE';
export const FETCH_ACTIVITIES_BY_INTERACTED_OBJECT = 'FETCH_ACTIVITIES_BY_INTERACTED_OBJECT';

/**
 * Fetch activities
 *
 * @param userID
 * @param activityType
 * @param interactedObjectID
 * @param shouldLoadUserProfile
 * @param fetchBy
 * @returns {Promise<unknown>}
 */
export const fetchActivitiesBy = async (
    {
        userID = null,
        activityType = null,
        interactedObjectID = null,
        // this should only be set to True when loading activities for a group
        // as a group has multiple group admins and each of them can perform different activities
        shouldLoadUserProfile = false,
        fetchBy = null // fetch mode
    }
) => {
    return new Promise((resolve, reject) => {
        if (!fetchBy) {
            return reject("Invalid mode.");
        }

        let activitiesRef = firebase
            .database()
            .ref(DB_CONST.ACTIVITIES_LOG_CHILD);

        switch (fetchBy) {
            case FETCH_ACTIVITIES_BY_USER: {
                if (!userID) {
                    return reject("Invalid call. userID is null.");
                }

                activitiesRef = activitiesRef
                    .orderByChild('userID')
                    .equalTo(userID);

                break;
            }
            case FETCH_ACTIVITIES_BY_TYPE: {
                if (!activityType) {
                    return reject("Invalid call. activityType is null.");
                }

                activitiesRef = activitiesRef
                    .orderByChild('activityType')
                    .equalTo(activityType);

                break;
            }
            case FETCH_ACTIVITIES_BY_INTERACTED_OBJECT: {
                if (!interactedObjectID) {
                    return reject("Invalid call. interactedObjectID is null.");
                }

                activitiesRef = activitiesRef
                    .orderByChild('interactedObjectID')
                    .equalTo(interactedObjectID);

                break;
            }
            default:
                return reject("Invalid mode.");
        }

        let activities = [];

        activitiesRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(activities);
                }

                snapshots.forEach(snapshot => {
                    activities.push(snapshot.val());
                });

                if (shouldLoadUserProfile) {
                    Promise.all(
                        activities.map(activity => {
                            return new Promise((resolve, reject) => {
                                getUserBasedOnID(activity.userID)
                                    .then(user => {
                                        activity.userProfile = user;
                                        return resolve(activities);
                                    })
                                    .catch(error => {
                                        // handle error
                                        return reject(error);
                                    });
                            });
                        })
                    ).then(() => {
                        return resolve(activities);
                    }).catch(error => {
                        // handle error
                        return reject(error);
                    });
                } else {
                    return resolve(activities);
                }
            })
            .catch(error => {
                return reject(error);
            });
    });
};

export const ACTIVITY_SUMMARY_TEMPLATE_SENT_A_GROUP_INVITATION = "Invited %group% to Invest West platform.";
export const ACTIVITY_SUMMARY_TEMPLATE_SENT_A_USER_INVITATION = "Invited %userName% to %group% as an %userType%.";
export const ACTIVITY_SUMMARY_TEMPLATE_RESENT_A_USER_INVITATION = "Resent invitation email to %userName% to %group% as an %userType%.";
export const ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PITCH = "Published %project% pitch.";
export const ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PITCH = "Rejected %project% pitch.";
export const ACTIVITY_SUMMARY_TEMPLATE_MOVED_PITCH_TO_PLEDGE = "Moved %project% to pledge phase.";
export const ACTIVITY_SUMMARY_TEMPLATE_CLOSED_PITCH = "Closed %project% pitch.";
export const ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PLEDGE = "Published %project% pledge.";
export const ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PLEDGE = "Rejected %project% pledge.";
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_PLEDGE = "Created pledge for %project%.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_PROJECT = "Edited %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_PROJECT = "Created %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_GROUP_ITEM = "Clicked to view %group%.";
export const ACTIVITY_SUMMARY_TEMPLATE_VIEWED_GROUP_DETAILS = "Viewed %group% group.";
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_NEW_PLEDGE = "Made new pledge for %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_PLEDGE = "Edited pledge for %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_CANCELLED_PLEDGE = "Cancelled pledge for %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_PROJECT_ITEM = "Clicked to view %project%.";
export const ACTIVITY_SUMMARY_TEMPLATE_VIEWED_PROJECT_DETAILS = "Viewed %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_A_VOTE_FOR_PROJECT = "Made a vote for %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_VOTE_FOR_PROJECT = "Edited vote for %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_COMMENTED_IN_PROJECT = "Commented in %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_COMMENT_IN_PROJECT = "Edited comment in %project% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_UPLOADED_BUSINESS_PROFILE = "Uploaded business profile.";
export const ACTIVITY_SUMMARY_TEMPLATE_UPDATED_BUSINESS_PROFILE = "Updated business profile.";
export const ACTIVITY_SUMMARY_TEMPLATE_UPDATED_PERSONAL_DETAILS = "Updated personal details.";
export const ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_BUSINESS_PROFILE = "Updated business profile of %user%.";
export const ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_PERSONAL_DETAILS = "Updated personal details of %user%.";
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_FORUM = "Created \"%forum%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_THREAD = "Created \"%thread%\" thread in \"%forum%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_THREAD = "Replied to \"%thread%\" thread in \"%forum%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_CHANGED_PASSWORD = "Changed password.";
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_AN_ENQUIRY = "Made an enquiry to %group% group.";
export const ACTIVITY_SUMMARY_TEMPLATE_CLOSED_A_LIVE_PROJECT_TEMPORARILY = "Closed %project% temporarily.";
export const ACTIVITY_SUMMARY_TEMPLATE_OPEN_A_TEMPORARILY_CLOSED_PROJECT_AGAIN = "Opened %project% again.";
export const ACTIVITY_SUMMARY_TEMPLATE_ADDED_A_NEW_GROUP_ADMIN = "Added %groupAdminEmail% as a group admin.";
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_FORUM = "Deleted \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_FORUM = "Edited \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD = "Edited \"%threadName%\" thread in \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD = "Deleted \"%threadName%\" thread in \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD_REPLY = "Edited reply in \"%threadName%\" thread of \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD_REPLY = "Deleted reply in \"%threadName%\" thread of \"%forumName%\" forum.";
export const ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_COMMENT = "Replied to a comment in %projectName% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_REPLY_OF_A_COMMENT = "Deleted a reply of a comment in %projectName% offer.";
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_REPLY_OF_A_COMMENT = "Edited a reply of a comment in %projectName% offer.";
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Send a notification
 *
 * @param title
 * @param message
 * @param userID
 * @param action
 * @returns {Promise<unknown>}
 */
export const sendNotification = async ({title = "", message = "", userID = "", action = ""}) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        const id = db
            .ref(DB_CONST.NOTIFICATIONS_CHILD)
            .push()
            .key;
        db
            .ref(DB_CONST.NOTIFICATIONS_CHILD)
            .child(id)
            .set({
                id,
                title,
                message,
                userID,
                action,
                date: utils.getCurrentDate()
            })
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject("Failed to send notification.");
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Log enquiries from users
 *
 * @param enquiry
 */
export const logContactUsEnquiry = (
    {
        userID = null, // anonymous user --> userID = null, otherwise, not null
        anid = null, // null = Invest West, not null = group
        email,
        name,
        phone = null,
        subject,
        description
    }
) => {
    return new Promise((resolve, reject) => {
        const dbRef = firebase
            .database()
            .ref(DB_CONST.CONTACT_US_ENQUIRIES_CHILD);

        const enquiryID = dbRef.push().key;

        dbRef
            .child(enquiryID)
            .set({
                userID,
                groupContacted: anid,
                email,
                name,
                phone,
                subject,
                description,
                id: enquiryID,
                time: utils.getCurrentDate()
            })
            .then(() => {
                return resolve(enquiryID);
            })
            .catch(error => {
                // handle error
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all admins of a group based on groupID (anid)
 *
 * @param groupID
 * @returns {Promise<unknown>}
 */
export const loadGroupAdminsBasedOnGroupID = async (groupID) => {
    return new Promise((resolve, reject) => {

        let groupAdmins = [];

        firebase
            .database()
            .ref(DB_CONST.ADMINISTRATORS_CHILD)
            .orderByChild('anid')
            .equalTo(groupID)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(groupAdmins);
                }

                snapshots.forEach(snapshot => {
                    groupAdmins.push(snapshot.val());
                });

                return resolve(groupAdmins);
            })
            .catch(error => {
                return reject(error);
            });
    });
};

/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to check if an email has already been used.
 *
 * @param email
 * @returns {Promise<unknown>}
 */
export const doesUserExist = async (email) => {
    return new Promise((resolve, reject) => {
        const firebaseDB = firebase.database();
        // check admin first
        firebaseDB
            .ref(DB_CONST.ADMINISTRATORS_CHILD)
            .orderByChild('email')
            .equalTo(email.toLowerCase())
            .once('value', snapshots => {
                if (snapshots && snapshots.val() && snapshots.numChildren() > 0) {

                    let admin = null;
                    snapshots.forEach(snapshot => {
                        admin = snapshot.val();
                    });

                    // admin exists
                    return resolve({
                        userExists: true,
                        userIsAnAdmin: true,
                        admin: admin
                    });
                }

                firebaseDB
                    .ref(DB_CONST.USERS_CHILD)
                    .orderByChild('email')
                    .equalTo(email.toLowerCase())
                    .once('value', snapshots => {
                        if (snapshots && snapshots.val() && snapshots.numChildren() > 0) {

                            let user = null;
                            snapshots.forEach(snapshot => {
                                user = snapshot.val();
                            });

                            // normal user exists
                            return resolve({
                                userExists: true,
                                userIsAnAdmin: false,
                                user: user
                            });
                        } else {
                            // user does not exist
                            return resolve({
                                userExists: false
                            });
                        }
                    })
                    .catch(error => {
                        return reject(error);
                    });
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all the groups that the user is in
 *
 * @param userID
 * @returns {Promise<unknown>}
 */
export const loadGroupsUserIsIn = async (userID) => {

    let groupsUserIsIn = [];

    return new Promise((resolve, reject) => {
        // search through the InvitedUsers node
        firebase
            .database()
            .ref(DB_CONST.INVITED_USERS_CHILD)
            .orderByChild('officialUserID')
            .equalTo(userID)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(groupsUserIsIn);
                }

                snapshots.forEach(snapshot => {
                    const invitedUser = snapshot.val();
                    // search for invited user with the officialID matched
                    if (invitedUser.hasOwnProperty('officialUserID')) {
                        groupsUserIsIn.push({
                            invitedUser: invitedUser,
                            anid: invitedUser.invitedBy,
                            userInGroupStatus: invitedUser.status
                        });
                    }
                });

                Promise.all(groupsUserIsIn.map(groupUserIsIn => {
                    return new Promise((resolve, reject) => {
                        firebase
                            .database()
                            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                            .child(groupUserIsIn.anid)
                            .once('value', snapshot => {
                                const angelNetwork = snapshot.val();
                                groupUserIsIn.isInvestWest = angelNetwork.isInvestWest;
                                groupUserIsIn.groupDetails = angelNetwork;
                                return resolve(groupUserIsIn);
                            });
                    });
                }))
                    .then(() => {
                        return resolve(groupsUserIsIn);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load angel network based on anid
 *
 * @param anid
 * @returns {Promise<unknown>}
 */
export const loadAngelNetworkBasedOnANID = async (anid) => {
    return new Promise((resolve, reject) => {
        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(anid)
            .once('value', snapshot => {
                if (!snapshot || !snapshot.exists()) {
                    return reject("Angel network not found");
                }

                return resolve(snapshot.val());
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load angel network based on groupUserName
 *
 * @param groupUserName
 * @returns {Promise<unknown>}
 */
export const loadAngelNetworkBasedOnGroupUserName = async (groupUserName) => {
    return new Promise((resolve, reject) => {
        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .orderByChild('groupUserName')
            .equalTo(groupUserName)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return reject("No group found.");
                }

                snapshots.forEach(snapshot => {
                    return resolve(snapshot.val());
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const SEARCH_ANGEL_NETWORKS_NONE = 0;
export const SEARCH_ANGEL_NETWORKS_BY_NAME = 1;
/**
 * Load angel networks
 *
 * @returns {Promise<unknown>}
 */
export const loadAngelNetworks = async ({name = null, email = null}, mode) => {
    return new Promise((resolve, reject) => {

        if (mode !== SEARCH_ANGEL_NETWORKS_NONE
            && mode !== SEARCH_ANGEL_NETWORKS_BY_NAME
        ) {
            return reject("Incorrect mode");
        }

        let angelNetworks = [];

        let angelNetworksRef;

        if (mode === SEARCH_ANGEL_NETWORKS_NONE) {
            angelNetworksRef = firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD);
        } else {
            angelNetworksRef = firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                .orderByChild('displayNameLower',)
                .startAt(name.toLowerCase());
        }

        angelNetworksRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(angelNetworks);
                }

                snapshots.forEach(snapshot => {
                    const angelNetwork = snapshot.val();
                    if (mode === SEARCH_ANGEL_NETWORKS_BY_NAME) {
                        if (angelNetwork.displayNameLower.includes(name.toLowerCase())) {
                            angelNetworks.push(snapshot.val());
                        }
                    } else {
                        angelNetworks.push(snapshot.val());
                    }
                });

                return resolve(angelNetworks);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load the angel networks that invited the user with the specified email
 *
 * @param email
 * @returns {Promise<unknown>}
 */
export const loadAngelNetworksInvitedAUser = async (email) => {

    const db = firebase.database();
    let angelNetworksInvitedUser = [];

    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.INVITED_USERS_CHILD)
            .orderByChild('email')
            .equalTo(email.toLowerCase())
            .once('value', snapshots => {

                // user has not been invited by any angel networks
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(angelNetworksInvitedUser);
                }

                snapshots.forEach(snapshot => {
                    const invitedUser = snapshot.val();
                    angelNetworksInvitedUser.push({
                        Invitor: invitedUser.invitedBy,
                        Invitee: invitedUser
                    });
                });

                Promise.all(angelNetworksInvitedUser.map(angelNetworkInvitedUser => {
                    return new Promise((resolve, reject) => {
                        db
                            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                            .child(angelNetworkInvitedUser.Invitor)
                            .once('value', snapshot => {
                                const angelNetwork = snapshot.val();
                                angelNetworkInvitedUser.Invitor = {
                                    anid: angelNetwork.anid,
                                    displayName: angelNetwork.displayName,
                                    logo: angelNetwork.logo
                                };
                                return resolve(angelNetworksInvitedUser);
                            });
                    });
                }))
                    .then(() => {
                        return resolve(angelNetworksInvitedUser);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to remove a join request
 *
 * @param requestID
 * @returns {Promise<unknown>}
 */
export const removeAJoinRequest = async (requestID) => {
    return new Promise((resolve, reject) => {
        firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
            .child(requestID)
            .remove()
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function will return a user object from firebase realtime db.
 *
 * Parameter:
 *  - type: 0 - retrieve a normal user (issuer, investor), 1 - retrieve an admin
 *  - firebaseUser
 *
 * @param {*} type
 * @param {*} userID
 */
export const getUser = async (type, userID) => {
    return new Promise((resolve, reject) => {
        // if type === 0, a normal user (issuer, investor) will be returned 
        if (type === 0) {
            firebase
                .database()
                .ref(DB_CONST.USERS_CHILD)
                .child(userID)
                .once('value', snapshot => {
                    //console.log("User snapshot value:", snapshot.val());
                    // if the user's node does not exist
                    if (!snapshot || !snapshot.exists()) {
                        return reject("User not found");
                    }

                    // return a user object from firebase realtime db
                    return resolve(snapshot.val());
                })
                .catch(error => {
                    return reject("User not found");
                });
        }
        // if type === 1, an admin will be returned
        else if (type === 1) {
            firebase
                .database()
                .ref(DB_CONST.ADMINISTRATORS_CHILD)
                .child(userID)
                .once('value', snapshot => {
                    //console.log("Admin snapshot value:", snapshot.val());
                    // if the user's node does not exist
                    if (!snapshot || !snapshot.exists()) {
                        return reject("User not found");
                    }

                    // return a user object from firebase realtime db
                    return resolve(snapshot.val());
                })
                .catch(error => {
                    return reject("User not found");
                });
        }
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function will return a user's profile based on the uid provided.
 *
 * @param {*} uid
 */
export const getUserBasedOnID = async (uid) => {
    return new Promise((resolve, reject) => {
        if (!uid) {
            console.warn("Null id provided");
            return resolve(null);
        }

        // get normal user
        getUser(0, uid)
            .then(user => {
                return resolve(user);
            })
            .catch(error => {
                // get admin
                getUser(1, uid)
                    .then(admin => {
                        // admin is a group admin
                        if (!admin.superAdmin) {
                            loadAngelNetworkBasedOnANID(admin.anid)
                                .then(groupDetails => {
                                    admin.groupDetails = groupDetails;
                                    return resolve(admin);
                                })
                                .catch(error => {
                                    console.error("Error loading group details:", error);
                                    return resolve(null);
                                });
                        }
                        // admin is a super admin
                        else {
                            return resolve(admin);
                        }
                    })
                    .catch(error => {
                        console.warn("Admin not found for uid:", uid);
                        return resolve(null);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to create a forums
 *
 * Parameters:
 *      + forumObj with the following structure
 *
 * {
 *      forumName,
 *      forumDesc,
 *      forumAuthor: userID
 * }
 * @param {*} forumObj
 */
export const createForum = async (forumObj) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        const forumID = db.ref(DB_CONST.FORUMS_CHILD).push().key;
        forumObj.id = forumID;
        db
            .ref(DB_CONST.FORUMS_CHILD)
            .child(forumObj.id)
            .set(forumObj)
            .then(() => {
                return resolve(forumID);
            })
            .catch(error => {
                return reject(error);
            })
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const LOAD_LIVE_FORUMS = "LOAD_LIVE_FORUMS";
export const LOAD_DELETED_FORUMS = "LOAD_DELETED_FORUMS";
/**
 * This function is used to load all forums.
 *
 * A forums object has the following structure:
 *
 * {
 *      id,
 *      forumName,
 *      forumDesc,
 *      forumAuthor,
 * 
 *      ...
 * }
 */
export const loadForums = async (mode) => {
    return new Promise((resolve, reject) => {
        let forums = [];

        if (mode !== LOAD_LIVE_FORUMS && mode !== LOAD_DELETED_FORUMS) {
            return reject("Invalid mode.");
        }

        const db = firebase.database();

        db
            .ref(DB_CONST.FORUMS_CHILD)
            .once('value', snapshots => {

                // no forums
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(forums);
                }

                snapshots.forEach(snapshot => {
                    let forum = snapshot.val();
                    if (mode === LOAD_LIVE_FORUMS) {
                        if (!forum.hasOwnProperty('deleted')
                            || (forum.hasOwnProperty('deleted') && forum.deleted === false)) {
                            forums.push(forum);
                        }
                    } else {
                        if (forum.hasOwnProperty('deleted') && forum.deleted === true) {
                            forums.push(forum);
                        }
                    }
                });

                Promise.all(forums.map(forum => {
                    return new Promise((resolve, reject) => {
                        getUserBasedOnID(forum.author.id)
                            .then(user => {
                                forum.author = user;
                                return resolve(forums);
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    })
                }))
                    .then(() => {
                        return resolve(forums);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to edit a forum
 *
 * @param editedForum
 * @returns {Promise<unknown>}
 */
export const editForum = async (editedForum) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUMS_CHILD)
            .child(editedForum.id)
            .update(editedForum)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to delete a forum by adding a property called 'deleted' with the value = true
 *
 * @param forumID
 * @returns {Promise<unknown>}
 */
export const deleteForum = async (forumID) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUMS_CHILD)
            .child(forumID)
            .child('deleted')
            .set(true)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to create a thread within a forums
 *
 * @param {*} threadObj
 */
export const createThread = async (threadObj) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        const threadID = db.ref(DB_CONST.FORUM_THREADS_CHILD).push().key;
        threadObj.id = threadID;
        db
            .ref(DB_CONST.FORUM_THREADS_CHILD)
            .child(threadObj.id)
            .set(threadObj)
            .then(() => {
                return resolve(threadID);
            })
            .catch(error => {
                return reject(error);
            })
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to edit a thread
 *
 * @param editedThread
 * @returns {Promise<unknown>}
 */
export const editThread = async (editedThread) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUM_THREADS_CHILD)
            .child(editedThread.id)
            .update(editedThread)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to delete a thread by adding a property called 'deleted' with the value = true
 *
 * @param threadID
 * @returns {Promise<unknown>}
 */
export const deleteThread = async (threadID) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUM_THREADS_CHILD)
            .child(threadID)
            .child('deleted')
            .set(true)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const LOAD_LIVE_THREADS = "LOAD_LIVE_THREADS";
export const LOAD_DELETED_THREADS = "LOAD_DELETED_THREADS";
/**
 * This function is used to load the details of the author for each thread.
 * The reason for creating this function is that the author of each thread is stored in Firebase just by a userID.
 * Therefore, in order to load the user details, we need this function.
 *
 * @param mode
 * @param {*} forumSelected
 */
export const loadThreads = async (mode, forumSelected) => {
    const db = firebase.database();
    let threads = [];

    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.FORUM_THREADS_CHILD)
            .orderByChild("forumID")
            .equalTo(forumSelected.id)
            .once('value', snapshots => {

                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(threads);
                }

                snapshots.forEach(snapshot => {
                    let thread = snapshot.val();

                    if (mode === LOAD_LIVE_THREADS) {
                        if (!thread.hasOwnProperty('deleted')
                            || (thread.hasOwnProperty('deleted') && thread.deleted === false)) {
                            threads.push(thread);
                        }
                    } else {
                        if (thread.hasOwnProperty('deleted') && thread.deleted === true) {
                            threads.push(thread);
                        }
                    }
                });

                Promise.all(threads.map(thread => {
                    return new Promise((resolve, reject) => {
                        getUserBasedOnID(thread.author.id)
                            .then(user => {
                                thread.author = user;
                                return resolve(threads);
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    })
                })).then(() => {
                    return resolve(threads);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to create a reply to a thread.
 *
 * @param {*} replyObj
 */
export const createThreadReply = async (replyObj) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        const replyID = db.ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD).push().key;
        replyObj.id = replyID;
        db
            .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
            .child(replyObj.id)
            .set(replyObj)
            .then(() => {
                return resolve(replyID);
            })
            .catch(error => {
                return reject(error);
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to edit an existing thread reply
 *
 * @param editedThreadReply
 * @returns {Promise<unknown>}
 */
export const editThreadReply = async (editedThreadReply) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
            .child(editedThreadReply.id)
            .update(editedThreadReply)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to delete a thread reply
 *
 * @param threadReplyID
 * @returns {Promise<unknown>}
 */
export const deleteThreadReply = async (threadReplyID) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
            .child(threadReplyID)
            .child('deleted')
            .set(true)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            })
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load the details of the author for each thread reply.
 * The reason for creating this function is that the author of each thread reply is stored in Firebase just by a userID.
 * Therefore, in order to load the user details, we need this function.
 *
 * @param {*} threadSelected
 */
export const loadThreadReplies = async (threadSelected) => {
    const db = firebase.database();
    let replies = [];

    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
            .orderByChild("threadID")
            .equalTo(threadSelected.id)
            .once('value', snapshots => {

                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(replies);
                }

                snapshots.forEach(snapshot => {
                    let replyObj = snapshot.val();
                    replies.push(replyObj);
                });

                Promise.all(replies.map(reply => {
                    return new Promise((resolve, reject) => {
                        getUserBasedOnID(reply.author.id)
                            .then(user => {
                                reply.author = user;
                                return resolve(replies);
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    })
                })).then(() => {
                    return resolve(replies);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function will load club attributes
 *
 * @returns {Promise<*>}
 */
export const loadClubAttributes = async () => {
    const db = firebase.database();
    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
            .once('value', snapshot => {
                const clubAttributes = snapshot.val();
                return resolve(clubAttributes);
            });
    });
};

/**
 * This function is used to load invited users of an angel network or ALL for super admin
 *
 * @returns {Promise<*>}
 */
export const loadInvitedUsers = async (anid) => {
    const db = firebase.database();
    return new Promise((resolve, reject) => {
        let invitedUsers = [];

        let dbRef;

        // load invited users of an angel network
        if (anid) {
            dbRef = db
                .ref(DB_CONST.INVITED_USERS_CHILD)
                .orderByChild('invitedBy')
                .equalTo(anid);
        }
        // load ALL invited users
        else {
            dbRef = db
                .ref(DB_CONST.INVITED_USERS_CHILD);
        }

        dbRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(invitedUsers);
                }
                snapshots.forEach(snapshot => {
                    let user = snapshot.val();
                    invitedUsers.push(user);
                });

                Promise.all(invitedUsers.map(invitedUser => {
                    return new Promise((resolve, reject) => {
                        loadAngelNetworkBasedOnANID(invitedUser.invitedBy)
                            .then(angelNetwork => {
                                invitedUser.Invitor = {
                                    anid: angelNetwork.anid,
                                    displayName: angelNetwork.displayName,
                                    logo: angelNetwork.logo
                                };

                                if (invitedUser.hasOwnProperty('officialUserID')) {
                                    getUserBasedOnID(invitedUser.officialUserID)
                                        .then(officialUser => {
                                            invitedUser.officialUser = officialUser;
                                            return resolve(invitedUsers);
                                        });
                                } else {
                                    return resolve(invitedUsers);
                                }
                            });
                    });
                }))
                    .then(() => {
                        return resolve(invitedUsers);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            })
            .catch(error => {
                return reject({error: "No users"});
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load requests to join (users request to join angel networks)
 *
 * @param userID
 * @param anid
 * @returns {Promise<unknown>}
 */
export const loadRequestsToJoin = async ({userID = null, anid = null}) => {
    return new Promise((resolve, reject) => {
        let requestsRef = firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD);

        if (userID && anid) {
            return reject("userID and anid cannot be defined at the same time");
        }

        if (userID) {
            requestsRef = requestsRef
                .orderByChild('userID')
                .equalTo(userID);
        }

        if (anid) {
            requestsRef = requestsRef
                .orderByChild('groupToJoin')
                .equalTo(anid);
        }

        if (!requestsRef) {
            return reject("Error happened");
        }

        let requests = [];

        requestsRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(requests);
                }

                snapshots.forEach(snapshot => {
                    requests.push(snapshot.val());
                });

                Promise.all(requests.map(request => {
                    return new Promise((resolve, reject) => {
                        getUserBasedOnID(request.userID)
                            .then(userProfile => {

                                request.userProfile = userProfile;

                                loadAngelNetworkBasedOnANID(request.groupToJoin)
                                    .then(angelNetwork => {

                                        request.group = angelNetwork;

                                        return resolve(requests);
                                    })
                                    .catch(error => {
                                        return reject(error);
                                    });
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    });
                }))
                    .then(() => {
                        return resolve(requests);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load an invited user based on the official user IF
 *
 * @param idOrEmail
 * @param mode
 * @returns {Promise<*>}
 */
export const GET_INVITED_USER_BASED_ON_INVITED_ID = 1;
export const GET_INVITED_USER_BASED_ON_OFFICIAL_ID = 2;
export const GET_INVITED_USER_BASED_ON_EMAIL = 3;
export const getInvitedUserBasedOnIDOrEmail = async (idOrEmail, mode) => {
    const db = firebase.database();
    return new Promise((resolve, reject) => {

        let invitedUsers = [];

        if (mode !== GET_INVITED_USER_BASED_ON_INVITED_ID
            && mode !== GET_INVITED_USER_BASED_ON_OFFICIAL_ID
            && mode !== GET_INVITED_USER_BASED_ON_EMAIL
        ) {
            return reject("Incorrect mode");
        }

        db
            .ref(DB_CONST.INVITED_USERS_CHILD)
            .orderByChild(
                mode === GET_INVITED_USER_BASED_ON_INVITED_ID
                    ?
                    'id'
                    :
                    mode === GET_INVITED_USER_BASED_ON_OFFICIAL_ID
                        ?
                        'officialUserID'
                        :
                        'email'
            )
            .equalTo(idOrEmail)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return reject("No invited users found.");
                }

                snapshots.forEach(snapshot => {
                    let invitedUser = snapshot.val();
                    invitedUsers.push(invitedUser);
                });

                Promise.all(invitedUsers.map(invitedUser => {
                    return new Promise((resolve, reject) => {
                        db
                            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                            .child(invitedUser.invitedBy)
                            .once('value', snapshot => {
                                const angelNetwork = snapshot.val();
                                invitedUser.Invitor = {
                                    anid: angelNetwork.anid,
                                    displayName: angelNetwork.displayName,
                                    logo: angelNetwork.logo
                                };
                                return resolve(invitedUsers);
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    });
                }))
                    .then(() => {
                        return resolve(invitedUsers);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const FETCH_PROJECTS_ORDER_BY_NONE = 0;
export const FETCH_PROJECTS_ORDER_BY_VISIBILITY = 1;
export const FETCH_PROJECTS_ORDER_BY_ANGEL_NETWORK = 2;
export const FETCH_PROJECTS_ORDER_BY_ISSUER = 3;
export const FETCH_PROJECTS_ORDER_BY_STATUS = 4;

export const FETCH_PROJECTS_IN_ANY_PHASE = 111;
export const FETCH_LIVE_PROJECTS = 222;
export const FETCH_SUCCESSFUL_PROJECTS = 333;
export const FETCH_FAILED_PROJECTS = 444;

/**
 * This function is used to fetch projects with filter parameters and limit parameter
 *
 * @param visibility
 * @param angelNetwork
 * @param issuer
 * @param projectsWithStatus
 * @param orderBy
 * @param limit
 * @returns {Promise<unknown>}
 */
export const fetchProjectsBy = async (
    {
        visibility = null, // fetch projects by their visibility: PRIVATE, RESTRICTED, or PUBLIC
        angelNetwork = null, // fetch projects by angel network
        issuer = null, // fetch projects by issuer
        sector = null, // fetch projects by sector
        projectsWithStatus = FETCH_LIVE_PROJECTS, // fetch projects by status
        fetchOrderBy = null // mode to use orderByChild
    },
    limit = 100000 // number of instances to be loaded
) => {
    return new Promise((resolve, reject) => {
        let projects = [];

        const db = firebase.database();
        let projectsRef = db.ref(DB_CONST.PROJECTS_CHILD);

        switch (fetchOrderBy) {
            case FETCH_PROJECTS_ORDER_BY_NONE:
                break;
            case FETCH_PROJECTS_ORDER_BY_VISIBILITY:
                projectsRef = projectsRef
                    .orderByChild('visibility')
                    .equalTo(visibility);
                break;
            case FETCH_PROJECTS_ORDER_BY_ANGEL_NETWORK:
                projectsRef = projectsRef
                    .orderByChild('anid')
                    .equalTo(angelNetwork);
                break;
            case FETCH_PROJECTS_ORDER_BY_ISSUER:
                projectsRef = projectsRef
                    .orderByChild('issuerID')
                    .equalTo(issuer);
                break;
            case FETCH_PROJECTS_ORDER_BY_STATUS:
                if (projectsWithStatus === FETCH_LIVE_PROJECTS) {
                    projectsRef = projectsRef
                        .orderByChild('status')
                        .startAt(DB_CONST.PROJECT_STATUS_PITCH_PHASE)
                        .endAt(DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE);
                } else if (projectsWithStatus === FETCH_SUCCESSFUL_PROJECTS) {
                    projectsRef = projectsRef
                        .orderByChild('status')
                        .equalTo(DB_CONST.PROJECT_STATUS_SUCCESSFUL);
                }
                break;
            default:
                return reject("Incorrect mode to fetch projects");
        }

        projectsRef
            .limitToLast(limit)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(projects);
                }

                snapshots.forEach(snapshot => {
                    let project = snapshot.val();

                    if (projectsWithStatus) {
                        switch (projectsWithStatus) {
                            case FETCH_PROJECTS_IN_ANY_PHASE:
                                projects.push(project);
                                break;
                            case FETCH_LIVE_PROJECTS:
                                if (utils.isProjectLive(project) && !utils.isProjectTemporarilyClosed(project)) {
                                    projects.push(project);
                                }
                                break;
                            case FETCH_SUCCESSFUL_PROJECTS:
                                if (utils.isProjectSuccessful(project)) {
                                    projects.push(project);
                                }
                                break;
                            case FETCH_FAILED_PROJECTS:
                                if (utils.isProjectFailed(project)) {
                                    projects.push(project);
                                }
                                break;
                            default:
                                if (project.status === projectsWithStatus) {
                                    projects.push(project);
                                }
                                break;
                        }
                    } else {
                        projects.push(project);
                    }
                });

                Promise.all(
                    projects.map(project => {
                        return new Promise((resolve, reject) => {
                            loadAngelNetworkBasedOnANID(project.anid)
                                .then(group => {
                                    project.group = group;
                                    getUserBasedOnID(project.issuerID)
                                        .then(user => {
                                            project.issuer = user;
                                            // only load pledges when a project is in pledge phase
                                            // or it has gone through pledge phase and closed
                                            if (utils.isProjectInLivePledgePhase(project)
                                                || utils.isProjectSuccessful(project)
                                                || utils.isProjectFailed(project)
                                            ) {
                                                // load pledges
                                                loadPledges(project.id, null, LOAD_PLEDGES_ORDER_BY_PROJECT)
                                                    .then(pledges => {
                                                        project.pledges = pledges;
                                                        return resolve(projects);
                                                    })
                                                    .catch(error => {
                                                        // error in loading pledges
                                                        return reject(error);
                                                    });
                                            } else {
                                                return resolve(projects);
                                            }
                                        })
                                        .catch(error => {
                                            return reject(error);
                                        });
                                })
                                .catch(error => {
                                    return reject(error);
                                });
                        });
                    })
                )
                    .then(() => {
                        return resolve(projects);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load a particular project from its id
 *
 * @param projectID
 * @returns {Promise<*>}
 */
export const loadAParticularProject = async (projectID) => {
    const db = firebase.database();
    const user = firebase.auth().currentUser;
  
    return new Promise((resolve, reject) => {
      db.ref(DB_CONST.PROJECTS_CHILD)
        .child(projectID)
        .once('value')
        .then(snapshot => {
          if (!snapshot || !snapshot.exists() || !snapshot.val()) {
            console.error("No project found with ID:", projectID);
            return reject("No project found.");
          }
  
          let project = snapshot.val();
          project.id = projectID;
  
          // Check project visibility
          if (project.visibility !== 3 && !user) {
            console.error("Project is not public or user is not authenticated.");
            return reject("Access denied. Project is not public.");
          }
  
          // Load group data (assumed to be publicly accessible)
          loadAngelNetworkBasedOnANID(project.anid)
            .then(group => {
              project.group = group;
  
              // Conditionally load issuer data
              if (user) {
                getUserBasedOnID(project.issuerID)
                  .then(issuer => {
                    project.issuer = issuer;
                    // Load pledges if needed
                    // ...
                    return resolve(project);
                  })
                  .catch(error => {
                    console.error("Couldn't load project issuer:", error);
                    return reject("Couldn't load project issuer");
                  });
              } else {
                // For unauthenticated users, proceed without issuer data
                return resolve(project);
              }
            })
            .catch(error => {
              console.error("Couldn't load group:", error);
              return reject("Couldn't load group");
            });
        })
        .catch(error => {
          console.error("Error accessing project data:", error);
          return reject(error);
        });
    });
  };
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Close a live project temporarily or open a temporarily closed project again
 *
 * @param admin
 * @param project
 * @returns {Promise<unknown>}
 */
export const toggleProjectLivelinessTemporarily = async (admin, project) => {
    return new Promise((resolve, reject) => {

        let shouldSendNotificationForIssuer = false;
        if (project.issuer.type === DB_CONST.TYPE_ISSUER) {
            shouldSendNotificationForIssuer = true;
        }

        project.issuer = null;
        project.pledges = null;
        project.group = null;

        let projectBeforeUpdating = JSON.parse(JSON.stringify(project));

        project.temporarilyClosed = !project.hasOwnProperty('temporarilyClosed')
            ?
            true
            :
            !project.temporarilyClosed;

        firebase
            .database()
            .ref(DB_CONST.PROJECTS_CHILD)
            .child(project.id)
            .update(project)
            .then(() => {
                let activitySummary =
                    project.temporarilyClosed === true
                        ?
                        ACTIVITY_SUMMARY_TEMPLATE_CLOSED_A_LIVE_PROJECT_TEMPORARILY
                        :
                        ACTIVITY_SUMMARY_TEMPLATE_OPEN_A_TEMPORARILY_CLOSED_PROJECT_AGAIN;

                // track admin activity
                trackActivity({
                    userID: admin.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                    interactedObjectID: project.id,
                    activitySummary: activitySummary.replace("%project%", project.projectName),
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                    value: {
                        before: projectBeforeUpdating,
                        after: project
                    }
                });

                // send notification to the issuer
                if (shouldSendNotificationForIssuer) {
                    sendNotification({
                        title:
                            project.temporarilyClosed
                                ?
                                `${project.projectName} has been closed temporarily`
                                :
                                `${project.projectName} has been opened again`
                        ,
                        message:
                            project.temporarilyClosed
                                ?
                                "This investment opportunity has been closed temporarily by your group admin. We will notify you when it is opened again."
                                :
                                "This investment opportunity has been opened again. The students can now interact with it."
                        ,
                        userID: project.issuerID,
                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                    })
                        .then(() => {
                            // do nothing
                        })
                        .catch(error => {
                            // handle error
                        });
                }

                // Send notifications to investors who voted or pledged
                // load votes
                loadVotes(project.id, null, LOAD_VOTES_ORDER_BY_PROJECT)
                    .then(votes => {

                        let listOfInvestorsToBeNotified = [];
                        votes.forEach(vote => {
                            listOfInvestorsToBeNotified.push(vote.investorID);
                        });

                        // load pledges
                        loadPledges(project.id, null, LOAD_PLEDGES_ORDER_BY_PROJECT)
                            .then(pledges => {
                                pledges.forEach(pledge => {
                                    if (listOfInvestorsToBeNotified.findIndex(investorID => investorID === pledge.investorID) === -1) {
                                        listOfInvestorsToBeNotified.push(pledge.investorID);
                                    }
                                });

                                let notifications = [];
                                listOfInvestorsToBeNotified.forEach(investorID => {
                                    const notification = {
                                        title:
                                            project.temporarilyClosed
                                                ?
                                                `${project.projectName} has been closed temporarily`
                                                :
                                                `${project.projectName} has been opened again`
                                        ,
                                        message:
                                            project.temporarilyClosed
                                                ?
                                                "This investment opportunity has been closed temporarily by the group admin. We will notify you when it is opened again."
                                                :
                                                "This investment opportunity has been opened again. You can now interact with it as usual."
                                        ,
                                        userID: investorID,
                                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                                    };
                                    notifications.push(notification);
                                });

                                // push all the notifications to firebase
                                Promise.all(notifications.map(notification => {
                                    return new Promise((resolve, reject) => {
                                        sendNotification(notification)
                                            .then(() => {
                                                return resolve();
                                            })
                                            .catch(error => {
                                                return reject(error);
                                            });
                                    });
                                })).then(() => {
                                    // do nothing
                                }).catch(error => {
                                    // handle error
                                });
                            });
                    });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project can go live
 *
 * @param admin
 * @param project
 * @param decisionObj
 * @returns {Promise<unknown>}
 */
export const makeProjectGoLiveDecision = async (admin, project, decisionObj) => {
    return new Promise(async (resolve, reject) => {
        let projectBeforeDecision = JSON.parse(JSON.stringify(project));
        projectBeforeDecision.issuer = null;
        projectBeforeDecision.pledges = null;
        projectBeforeDecision.group = null;

        // project goes live
        if (decisionObj.decision) {
            project.visibility = decisionObj.projectVisibilitySetting === -1 ? project.visibility : decisionObj.projectVisibilitySetting;
            project.status = DB_CONST.PROJECT_STATUS_PITCH_PHASE;
        }
        // project cannot go live
        else {
            project.status = DB_CONST.PROJECT_STATUS_REJECTED;
            project.Pitch.status = DB_CONST.PITCH_STATUS_REJECTED;
        }

        project.issuer = null;
        project.pledges = null;
        project.group = null;

        try {
            await firebase
                .database()
                .ref(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .update(project);

            let activitySummary =
                decisionObj.decision
                    ?
                    ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PITCH
                    :
                    ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PITCH;

            await new Api().request(
                "post",
                ApiRoutes.sendEmailRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        emailType: 2,
                        emailInfo: {
                            projectID: project.id
                        }
                    }
                }
            );

            // track admin activity
            trackActivity({
                userID: admin.id,
                activityType: DB_CONST.ACTIVITY_TYPE_POST,
                interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                interactedObjectID: project.id,
                activitySummary: activitySummary.replace("%project%", project.projectName),
                action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                value: {
                    before: projectBeforeDecision,
                    after: project
                }
            });

            // send a notification to notify the issuer
            await
                sendNotification({
                    title: project.projectName,
                    message:
                        decisionObj.decision
                            ?
                            `Congratulations! Your offer has been published.`
                            :
                            `Unfortunately your offer has been rejected. Contact your course's administrator for further information.`
                    ,
                    userID: project.issuerID,
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                });

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project can go to the Pledge phase
 *
 * @param admin
 * @param project
 * @param decision
 * @returns {Promise<unknown>}
 */
export const makeProjectGoToPledgePhaseDecision = async (admin, project, decision) => {

    let projectBeforeDecision = JSON.parse(JSON.stringify(project));
    projectBeforeDecision.issuer = null;
    projectBeforeDecision.pledges = null;
    projectBeforeDecision.group = null;

    // project can go to the Pledge phase --> the issuer can create their Pledge
    if (decision) {
        project.Pitch.status = DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER;
    }
    // project cannot go to Pledge phase --> it failed
    else {
        project.status = DB_CONST.PROJECT_STATUS_FAILED;
        project.Pitch.status = DB_CONST.PITCH_STATUS_REJECTED;
    }

    project.issuer = null;
    project.pledges = null;
    project.group = null;

    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.PROJECTS_CHILD)
            .child(project.id)
            .update(project)
            .then(() => {
                let activitySummary =
                    decision
                        ?
                        ACTIVITY_SUMMARY_TEMPLATE_MOVED_PITCH_TO_PLEDGE
                        :
                        ACTIVITY_SUMMARY_TEMPLATE_CLOSED_PITCH;
                // track admin's activity
                trackActivity({
                    userID: admin.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                    interactedObjectID: project.id,
                    activitySummary: activitySummary.replace("%project%", project.projectName),
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                    value: {
                        before: projectBeforeDecision,
                        after: project
                    }
                });

                // send a notification to notify the issuer
                sendNotification({
                    title: project.projectName,
                    message:
                        decision
                            ?
                            `Congratulations! Your investment opportunity has moved to the pledge phase. You can now create your pledge page. Your pledge page will be checked by the course admin before publication.`
                            :
                            `Unfortunately your investment opportunity has been rejected. Contact your course's administrator for further information.`
                    ,
                    userID: project.issuerID,
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                })
                    .then(() => {
                        return resolve();
                    })
                    .catch(error => {
                        return reject(error);
                    });
            })
            .catch(error => {
                // handle error
                return reject("Process failed");
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project's Pledge can go live
 *
 * @param admin
 * @param project
 * @param decisionObj
 * @returns {Promise<unknown>}
 */
export const makeProjectPledgeGoLiveDecision = async (admin, project, decisionObj) => {

    let projectBeforeDecision = JSON.parse(JSON.stringify(project));
    projectBeforeDecision.issuer = null;
    projectBeforeDecision.pledges = null;
    projectBeforeDecision.group = null;

    // project's Pledge can go live --> the investors can start pledging it
    if (decisionObj.decision) {
        project.visibility = decisionObj.projectVisibilitySetting === -1 ? project.visibility : decisionObj.projectVisibilitySetting;
        project.status = DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE;
    }
    // project's pledge cannot go to live --> it failed
    else {
        project.status = DB_CONST.PROJECT_STATUS_FAILED;
        project.PrimaryOffer.status = DB_CONST.PRIMARY_OFFER_STATUS_REJECTED;
    }

    project.issuer = null;
    project.pledges = null;
    project.group = null;

    const db = firebase.database();
    return new Promise((resolve, reject) => {
        db.ref(DB_CONST.PROJECTS_CHILD)
            .child(project.id)
            .update(project)
            .then(() => {
                let activitySummary =
                    decisionObj.decision
                        ?
                        ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PLEDGE
                        :
                        ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PLEDGE;
                // track admin's activity
                trackActivity({
                    userID: admin.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                    interactedObjectID: project.id,
                    activitySummary: activitySummary.replace("%project%", project.projectName),
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                    value: {
                        before: projectBeforeDecision,
                        after: project
                    }
                });

                // send a notification to notify the issuer
                sendNotification({
                    title: project.projectName,
                    message:
                        decisionObj.decision
                            ?
                            `Congratulations! Your project has been published.`
                            :
                            `Unfortunately your project has been rejected. Contact your course's admin for further information.`
                    ,
                    userID: project.issuerID,
                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                })
                    .then(() => {
                        return resolve();
                    })
                    .catch(error => {
                        return reject(error);
                    });
            })
            .catch(error => {
                // handle error
                return reject("Process failed");
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load all comments of a project
 *
 * @param projectID
 * @returns {Promise<*>}
 */
export const loadComments = async (projectID) => {
    const db = firebase.database();

    let comments = [];

    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.COMMENTS_CHILD)
            .orderByChild("projectID")
            .equalTo(projectID)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(comments);
                }

                snapshots.forEach(snapshot => {
                    let comment = snapshot.val();
                    comments.push(comment);
                });

                Promise.all(
                    comments.map(comment => {
                        return new Promise((resolve, reject) => {
                            getUserBasedOnID(comment.commentedBy)
                                .then(user => {
                                    comment.author = user;
                                    return resolve(comments);
                                })
                                .catch(error => {
                                    return reject(error);
                                });
                        });
                    })
                ).then(() => {
                    return resolve(comments);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load pledges of a project
 *
 * @param projectID
 * @param investorID
 * @param mode
 * @returns {Promise<void>}
 */
export const LOAD_PLEDGES_ORDER_BY_PROJECT = 1;
export const LOAD_PLEDGES_ORDER_BY_INVESTOR = 2;
export const loadPledges = async (projectID = null, investorID = null, mode) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        let pledgesRef = db.ref(DB_CONST.PLEDGES_CHILD);
        if (projectID && mode === LOAD_PLEDGES_ORDER_BY_PROJECT) {
            pledgesRef = pledgesRef
                .orderByChild("projectID")
                .equalTo(projectID);
        } else if (investorID && mode === LOAD_PLEDGES_ORDER_BY_INVESTOR) {
            pledgesRef = pledgesRef
                .orderByChild("investorID")
                .equalTo(investorID);
        } else {
            return reject("Invalid mode");
        }

        let pledges = [];

        pledgesRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(pledges);
                }

                snapshots.forEach(snapshot => {
                    let pledge = snapshot.val();
                    if (pledge.amount !== "") {
                        pledges.push(pledge);
                    }
                });

                Promise.all(
                    pledges.map(pledge => {
                        return new Promise((resolve, reject) => {
                            getUserBasedOnID(pledge.investorID)
                                .then(investor => {
                                    pledge.investor = investor;
                                    return resolve(pledges);
                                })
                                .catch(error => {
                                    return reject(error);
                                });
                        });
                    })
                ).then(() => {
                    return resolve(pledges);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load votes of a project
 *
 * @param projectID
 * @param investorID
 * @param mode
 * @returns {Promise<void>}
 */
export const LOAD_VOTES_ORDER_BY_PROJECT = 1;
export const LOAD_VOTES_ORDER_BY_INVESTOR = 2;
export const loadVotes = async (projectID = null, investorID = null, mode) => {
    const db = firebase.database();
    let votesRef = db.ref(DB_CONST.VOTES_CHILD);
    if (projectID && mode === LOAD_VOTES_ORDER_BY_PROJECT) {
        votesRef = votesRef
            .orderByChild("projectID")
            .equalTo(projectID);
    } else if (investorID && mode === LOAD_VOTES_ORDER_BY_INVESTOR) {
        votesRef = votesRef
            .orderByChild("investorID")
            .equalTo(investorID);
    } else {
        return null;
    }

    let votes = [];

    return new Promise((resolve, reject) => {
        votesRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(votes);
                }

                snapshots.forEach(snapshot => {
                    let vote = snapshot.val();
                    if (vote.voted !== "") {
                        votes.push(vote);
                    }
                });

                Promise.all(
                    votes.map(vote => {
                        return new Promise((resolve, reject) => {
                            getUserBasedOnID(vote.investorID)
                                .then(investor => {
                                    vote.investor = investor;
                                    return resolve(votes);
                                })
                                .catch(error => {
                                    return reject(error);
                                });
                        });
                    })
                ).then(() => {
                    return resolve(votes);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to load all notifications of a user
 *
 * @param userID
 * @returns {Promise<*>}
 */
export const loadNotifications = async (userID) => {
    const db = firebase.database();

    let notifications = [];

    return new Promise((resolve, reject) => {
        db
            .ref(DB_CONST.NOTIFICATIONS_CHILD)
            .orderByChild("userID")
            .equalTo(userID)
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(notifications);
                }

                snapshots.forEach(snapshot => {
                    let notification = snapshot.val();
                    notifications.push(notification);
                });

                return resolve(notifications);
            })
    });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * This function is used to delete all notifications of a user
 *
 * @param userID
 * @returns {Promise<*>}
 */
export const deleteAllNotifications = async (userID) => {
    const db = firebase.database();

    return new Promise((resolve, reject) => {
        // load all notifications of the specified user
        loadNotifications(userID)
            .then(notifications => {
                // delete them all
                Promise.all(notifications.map(notification => {
                    return new Promise((resolve, reject) => {
                        db
                            .ref(DB_CONST.NOTIFICATIONS_CHILD)
                            .child(notification.id)
                            .remove()
                            .then(() => {
                                return resolve();
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    });
                })).then(() => {
                    return resolve();
                }).catch(error => {
                    return reject(error);
                });
            })
            .catch(error => {
                return reject(error);
            });
    })
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Post a comment reply
 *
 * @param commentReply
 * @returns {Promise<unknown>}
 */
export const postCommentReply = commentReply => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();

        const replyID = db
            .ref(DB_CONST.COMMENT_REPLIES_CHILD)
            .push()
            .key;

        db
            .ref(DB_CONST.COMMENT_REPLIES_CHILD)
            .child(replyID)
            .set({
                ...commentReply,
                id: replyID
            })
            .then(() => {
                return resolve(replyID);
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load replies of comments
 *
 * @param comments
 * @returns {Promise<unknown>}
 */
export const loadCommentsReplies = comments => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();

        let updatedComments = [...comments];

        Promise.all(
            updatedComments.map(comment => {
                return new Promise((resolve, reject) => {
                    let replies = [];

                    db
                        .ref(DB_CONST.COMMENT_REPLIES_CHILD)
                        .orderByChild('commentID')
                        .equalTo(comment.id)
                        .once('value', snapshots => {
                            if (!snapshots
                                || !snapshots.exists()
                                || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                            ) {
                                comment.replies = replies;
                                return resolve(updatedComments);
                            }

                            snapshots.forEach(snapshot => {
                                const reply = snapshot.val();
                                if (reply.hasOwnProperty('deleted') && reply.deleted === true) {
                                    // do nothing
                                } else {
                                    replies.push(snapshot.val());
                                }
                            });

                            Promise.all(
                                replies.map(reply => {
                                    return new Promise((resolve, reject) => {
                                        getUserBasedOnID(reply.repliedBy)
                                            .then(user => {
                                                reply.author = user;
                                                return resolve(replies);
                                            })
                                            .catch(error => {
                                                return reject(error);
                                            });
                                    });
                                })
                            ).then(() => {
                                comment.replies = replies;
                                return resolve(updatedComments);
                            }).catch(error => {
                                return reject(error);
                            });
                        })
                        .catch(error => {
                            return reject(error);
                        });
                });
            })
        ).then(() => {
            return resolve(updatedComments);
        }).catch(error => {
            return reject(error);
        });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete a reply of a comment
 *
 * @param commentReplyID
 * @returns {Promise<unknown>}
 */
export const deleteCommentReply = commentReplyID => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.COMMENT_REPLIES_CHILD)
            .child(commentReplyID)
            .child('deleted')
            .set(true)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update a comment reply
 *
 * @param updatedCommentReply
 * @returns {Promise<unknown>}
 */
export const updateCommentReply = updatedCommentReply => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        db
            .ref(DB_CONST.COMMENT_REPLIES_CHILD)
            .child(updatedCommentReply.id)
            .update(updatedCommentReply)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load marketing preferences
 *
 * @param userID: null --> load all, not null --> load for a particular user
 * @returns {Promise<unknown>}
 */
export const loadMarketingPreferences = (userID) => {
    return new Promise((resolve, reject) => {
        const db = firebase.database();
        const marketingPreferencesRef =
            userID
                ?
                db
                    .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                    .orderByChild("userID")
                    .equalTo(userID)
                :
                db
                    .ref(DB_CONST.MARKETING_PREFERENCES_CHILD);

        let marketingPreferences = [];

        marketingPreferencesRef
            .once('value', snapshots => {
                if (!snapshots
                    || !snapshots.exists()
                    || (snapshots && (!snapshots.val() || snapshots.numChildren() === 0))
                ) {
                    return resolve(marketingPreferences);
                }

                snapshots.forEach(snapshot => {
                    let marketingPreference = snapshot.val();
                    marketingPreferences.push(marketingPreference);
                });

                Promise.all(
                    marketingPreferences.map(marketingPreference => {
                        return new Promise((resolve, reject) => {
                            getUserBasedOnID(marketingPreference.userID)
                                .then(user => {
                                    marketingPreference.user = user;
                                    return resolve(marketingPreferences);
                                })
                                .catch(error => {
                                    return reject(error);
                                });
                        });
                    })
                ).then(() => {
                    return resolve(marketingPreferences);
                }).catch(error => {
                    return reject(error);
                });
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Turn on/off marketing preferences
 *
 * @param userID
 * @param value
 * @returns {Promise<unknown>}
 */
export const toggleMarketingPreferences = async (
    {
        userID,
        value
    }
) => {
    return new Promise((resolve, reject) => {

        if (!userID || !value) {
            return reject("Missing arguments");
        }

        loadMarketingPreferences(userID)
            .then(marketingPreferences => {
                // user has not registered for Marketing preferences before
                if (marketingPreferences.length === 0) {
                    const id = firebase.database().ref(DB_CONST.MARKETING_PREFERENCES_CHILD).push().key;

                    const marketingPreferences = {
                        accepted: value,
                        date: utils.getCurrentDate(),
                        id,
                        userID
                    };

                    firebase
                        .database()
                        .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                        .child(id)
                        .set(marketingPreferences)
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                }
                // user has registered for Marketing preferences before
                else {
                    marketingPreferences[0].accepted = value;
                    marketingPreferences[0].date = utils.getCurrentDate();

                    firebase
                        .database()
                        .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                        .child(marketingPreferences[0].id)
                        .set(marketingPreferences[0])
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                }
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update a sub settings inside marketing preferences
 *
 * @param userID
 * @param field
 * @param value
 * @returns {Promise<unknown>}
 */
export const updateMarketingPreferencesSetting = async (
    {
        userID,
        field,
        value
    }
) => {
    return new Promise((resolve, reject) => {
        loadMarketingPreferences(userID)
            .then(marketingPreferences => {
                // user has not registered for Marketing preferences before
                if (marketingPreferences.length === 0) {
                    const id = firebase.database().ref(DB_CONST.MARKETING_PREFERENCES_CHILD).push().key;

                    const marketingPreferences = {
                        accepted: true,
                        date: utils.getCurrentDate(),
                        id,
                        userID,
                        settings: {
                            field: value
                        }
                    };

                    firebase
                        .database()
                        .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                        .child(id)
                        .set(marketingPreferences)
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                }
                // user has registered for Marketing preferences before
                else {
                    firebase
                        .database()
                        .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                        .child(marketingPreferences[0].id)
                        .child('settings')
                        .child(field)
                        .set(value)
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                }
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update group properties setting
 *
 * @param anid
 * @param field
 * @param value
 * @returns {Promise<unknown>}
 */
export const updateGroupPropertiesSetting = async (
    {
        anid,
        field,
        value
    }
) => {
    return new Promise((resolve, reject) => {
        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(anid)
            .child('settings')
            .child(field)
            .set(value)
            .then(() => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Bring an expired pitch back to live by setting a new expiry date
 *
 * @param project
 * @param newPitchExpiryDate
 * @returns {Promise<unknown>}
 */
export const bringPitchBackToLive = async ({project, newPitchExpiryDate}) => {
    return new Promise(async (resolve, reject) => {
        project.Pitch.status = DB_CONST.PITCH_STATUS_ON_GOING;
        project.status = DB_CONST.PROJECT_STATUS_PITCH_PHASE;
        project.Pitch.expiredDate = newPitchExpiryDate;

        try {
            await firebase
                .database()
                .ref(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .update(project);

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */