/**
 * This file contains all of the utility functions relating to Firebase database.
 */

import firebase from './firebaseApp';

import * as ROUTES from '../router/routes';
import * as DB_CONST from './databaseConsts';
import * as utils from '../utils/utils';
import Api, { ApiRoutes } from '../api/Api';

/**
 * Track activities of a user (fire-and-forget)
 */
export const trackActivity = ({
  userID,
  activityType,
  interactedObjectLocation = null,
  interactedObjectID = null,
  activitySummary,
  action = null,
  value = null,
}: {
  userID: string;
  activityType: number;
  interactedObjectLocation?: string | null;
  interactedObjectID?: string | null;
  activitySummary: string;
  action?: string | null;
  value?: any;
}): void => {
  const id = firebase.database().ref(DB_CONST.ACTIVITIES_LOG_CHILD).push().key;

  firebase
    .database()
    .ref(DB_CONST.ACTIVITIES_LOG_CHILD)
    .child(id!)
    .set({
      id,
      userID,
      activityType,
      interactedObjectLocation,
      interactedObjectID,
      activitySummary,
      action,
      value,
      time: utils.getCurrentDate(),
    })
    .catch(() => {});
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const FETCH_ACTIVITIES_BY_USER = 'FETCH_ACTIVITIES_BY_USER';
export const FETCH_ACTIVITIES_BY_TYPE = 'FETCH_ACTIVITIES_BY_TYPE';
export const FETCH_ACTIVITIES_BY_INTERACTED_OBJECT = 'FETCH_ACTIVITIES_BY_INTERACTED_OBJECT';

/**
 * Fetch activities
 */
export const fetchActivitiesBy = async ({
  userID = null,
  activityType = null,
  interactedObjectID = null,
  shouldLoadUserProfile = false,
  fetchBy = null,
}: {
  userID?: string | null;
  activityType?: number | null;
  interactedObjectID?: string | null;
  shouldLoadUserProfile?: boolean;
  fetchBy?: string | null;
}): Promise<any[]> => {
  if (!fetchBy) {
    throw 'Invalid mode.';
  }

  let activitiesRef: any = firebase.database().ref(DB_CONST.ACTIVITIES_LOG_CHILD);

  switch (fetchBy) {
    case FETCH_ACTIVITIES_BY_USER: {
      if (!userID) {
        throw 'Invalid call. userID is null.';
      }
      activitiesRef = activitiesRef.orderByChild('userID').equalTo(userID);
      break;
    }
    case FETCH_ACTIVITIES_BY_TYPE: {
      if (!activityType) {
        throw 'Invalid call. activityType is null.';
      }
      activitiesRef = activitiesRef.orderByChild('activityType').equalTo(activityType);
      break;
    }
    case FETCH_ACTIVITIES_BY_INTERACTED_OBJECT: {
      if (!interactedObjectID) {
        throw 'Invalid call. interactedObjectID is null.';
      }
      activitiesRef = activitiesRef.orderByChild('interactedObjectID').equalTo(interactedObjectID);
      break;
    }
    default:
      throw 'Invalid mode.';
  }

  const activities: any[] = [];
  const snapshots = await activitiesRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return activities;
  }

  snapshots.forEach((snapshot: any) => {
    activities.push(snapshot.val());
  });

  if (shouldLoadUserProfile) {
    await Promise.all(
      activities.map(async (activity) => {
        activity.userProfile = await getUserBasedOnID(activity.userID);
      })
    );
  }

  return activities;
};

export const ACTIVITY_SUMMARY_TEMPLATE_SENT_A_GROUP_INVITATION =
  'Invited %group% to Invest West platform.';
export const ACTIVITY_SUMMARY_TEMPLATE_SENT_A_USER_INVITATION =
  'Invited %userName% to %group% as an %userType%.';
export const ACTIVITY_SUMMARY_TEMPLATE_RESENT_A_USER_INVITATION =
  'Resent invitation email to %userName% to %group% as an %userType%.';
export const ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PITCH = 'Published %project% pitch.';
export const ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PITCH = 'Rejected %project% pitch.';
export const ACTIVITY_SUMMARY_TEMPLATE_MOVED_PITCH_TO_PLEDGE = 'Moved %project% to pledge phase.';
export const ACTIVITY_SUMMARY_TEMPLATE_CLOSED_PITCH = 'Closed %project% pitch.';
export const ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PLEDGE = 'Published %project% pledge.';
export const ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PLEDGE = 'Rejected %project% pledge.';
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_PLEDGE = 'Created pledge for %project%.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_PROJECT = 'Edited %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_PROJECT = 'Created %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_GROUP_ITEM = 'Clicked to view %group%.';
export const ACTIVITY_SUMMARY_TEMPLATE_VIEWED_GROUP_DETAILS = 'Viewed %group% group.';
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_NEW_PLEDGE = 'Made new pledge for %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_PLEDGE = 'Edited pledge for %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_CANCELLED_PLEDGE = 'Cancelled pledge for %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_PROJECT_ITEM = 'Clicked to view %project%.';
export const ACTIVITY_SUMMARY_TEMPLATE_VIEWED_PROJECT_DETAILS = 'Viewed %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_A_VOTE_FOR_PROJECT = 'Made a vote for %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_VOTE_FOR_PROJECT = 'Edited vote for %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_COMMENTED_IN_PROJECT = 'Commented in %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_COMMENT_IN_PROJECT =
  'Edited comment in %project% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_UPLOADED_BUSINESS_PROFILE = 'Uploaded business profile.';
export const ACTIVITY_SUMMARY_TEMPLATE_UPDATED_BUSINESS_PROFILE = 'Updated business profile.';
export const ACTIVITY_SUMMARY_TEMPLATE_UPDATED_PERSONAL_DETAILS = 'Updated personal details.';
export const ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_BUSINESS_PROFILE =
  'Updated business profile of %user%.';
export const ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_USER_PERSONAL_DETAILS =
  'Updated personal details of %user%.';
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_FORUM = 'Created "%forum%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_THREAD =
  'Created "%thread%" thread in "%forum%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_THREAD =
  'Replied to "%thread%" thread in "%forum%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_CHANGED_PASSWORD = 'Changed password.';
export const ACTIVITY_SUMMARY_TEMPLATE_MADE_AN_ENQUIRY = 'Made an enquiry to %group% group.';
export const ACTIVITY_SUMMARY_TEMPLATE_CLOSED_A_LIVE_PROJECT_TEMPORARILY =
  'Closed %project% temporarily.';
export const ACTIVITY_SUMMARY_TEMPLATE_OPEN_A_TEMPORARILY_CLOSED_PROJECT_AGAIN =
  'Opened %project% again.';
export const ACTIVITY_SUMMARY_TEMPLATE_ADDED_A_NEW_GROUP_ADMIN =
  'Added %groupAdminEmail% as a group admin.';
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_FORUM = 'Deleted "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_FORUM = 'Edited "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD =
  'Edited "%threadName%" thread in "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD =
  'Deleted "%threadName%" thread in "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD_REPLY =
  'Edited reply in "%threadName%" thread of "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD_REPLY =
  'Deleted reply in "%threadName%" thread of "%forumName%" forum.';
export const ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_COMMENT =
  'Replied to a comment in %projectName% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_REPLY_OF_A_COMMENT =
  'Deleted a reply of a comment in %projectName% offer.';
export const ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_REPLY_OF_A_COMMENT =
  'Edited a reply of a comment in %projectName% offer.';
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Send a notification
 */
export const sendNotification = async ({
  title = '',
  message = '',
  userID = '',
  action = '',
}: {
  title?: string;
  message?: string;
  userID?: string;
  action?: string;
}): Promise<void> => {
  const db = firebase.database();
  const id = db.ref(DB_CONST.NOTIFICATIONS_CHILD).push().key;
  await db.ref(DB_CONST.NOTIFICATIONS_CHILD).child(id!).set({
    id,
    title,
    message,
    userID,
    action,
    date: utils.getCurrentDate(),
  });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Log enquiries from users
 */
export const logContactUsEnquiry = ({
  userID = null,
  anid = null,
  email,
  name,
  companyName,
  companyPosition,
  message,
}: {
  userID?: string | null;
  anid?: string | null;
  email: string;
  name: string;
  companyName: string;
  companyPosition: string;
  message: string;
}): Promise<string> => {
  const dbRef = firebase.database().ref(DB_CONST.CONTACT_US_ENQUIRIES_CHILD);
  const enquiryID = dbRef.push().key!;

  return dbRef
    .child(enquiryID)
    .set({
      userID,
      groupContacted: anid,
      email,
      name,
      companyName,
      companyPosition,
      message,
      id: enquiryID,
      time: utils.getCurrentDate(),
    })
    .then(() => enquiryID);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all admins of a group based on groupID (anid)
 */
export const loadGroupAdminsBasedOnGroupID = async (groupID: string): Promise<any[]> => {
  const groupAdmins: any[] = [];

  const snapshots = await firebase
    .database()
    .ref(DB_CONST.ADMINISTRATORS_CHILD)
    .orderByChild('anid')
    .equalTo(groupID)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return groupAdmins;
  }

  snapshots.forEach((snapshot: any) => {
    groupAdmins.push(snapshot.val());
  });

  return groupAdmins;
};

/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Check if an email has already been used
 */
export const doesUserExist = async (
  email: string
): Promise<{ userExists: boolean; userIsAnAdmin?: boolean; admin?: any; user?: any }> => {
  const firebaseDB = firebase.database();

  // check admin first
  const adminSnapshots = await firebaseDB
    .ref(DB_CONST.ADMINISTRATORS_CHILD)
    .orderByChild('email')
    .equalTo(email.toLowerCase())
    .once('value');

  if (adminSnapshots && adminSnapshots.val() && adminSnapshots.numChildren() > 0) {
    let admin: any = null;
    adminSnapshots.forEach((snapshot: any) => {
      admin = snapshot.val();
    });
    return { userExists: true, userIsAnAdmin: true, admin };
  }

  const userSnapshots = await firebaseDB
    .ref(DB_CONST.USERS_CHILD)
    .orderByChild('email')
    .equalTo(email.toLowerCase())
    .once('value');

  if (userSnapshots && userSnapshots.val() && userSnapshots.numChildren() > 0) {
    let user: any = null;
    userSnapshots.forEach((snapshot: any) => {
      user = snapshot.val();
    });
    return { userExists: true, userIsAnAdmin: false, user };
  }

  return { userExists: false };
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all the groups that the user is in
 */
export const loadGroupsUserIsIn = async (userID: string): Promise<any[]> => {
  const groupsUserIsIn: any[] = [];

  const snapshots = await firebase
    .database()
    .ref(DB_CONST.INVITED_USERS_CHILD)
    .orderByChild('officialUserID')
    .equalTo(userID)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return groupsUserIsIn;
  }

  snapshots.forEach((snapshot: any) => {
    const invitedUser = snapshot.val();
    if (invitedUser.hasOwnProperty('officialUserID')) {
      groupsUserIsIn.push({
        invitedUser: invitedUser,
        anid: invitedUser.invitedBy,
        userInGroupStatus: invitedUser.status,
      });
    }
  });

  await Promise.all(
    groupsUserIsIn.map(async (groupUserIsIn) => {
      const snapshot = await firebase
        .database()
        .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
        .child(groupUserIsIn.anid)
        .once('value');
      const angelNetwork = snapshot.val();
      groupUserIsIn.isInvestWest = angelNetwork.isInvestWest;
      groupUserIsIn.groupDetails = angelNetwork;
    })
  );

  return groupsUserIsIn;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load angel network based on anid
 * Also checks Courses node if not found in angel networks
 */
export const loadAngelNetworkBasedOnANID = async (anid: string): Promise<any> => {
  const snapshot = await firebase
    .database()
    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
    .child(anid)
    .once('value');

  if (snapshot && snapshot.exists()) {
    return snapshot.val();
  }

  // Not found in GROUP_PROPERTIES_CHILD, check if it's a course
  const courseSnapshot = await firebase
    .database()
    .ref(DB_CONST.COURSES_CHILD)
    .child(anid)
    .once('value');

  if (!courseSnapshot || !courseSnapshot.exists()) {
    throw 'Angel network not found';
  }

  const courseData = courseSnapshot.val();

  // If this is a course with a parent, load the parent university
  if (courseData.parentGroupId) {
    const parentSnapshot = await firebase
      .database()
      .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
      .child(courseData.parentGroupId)
      .once('value');

    if (!parentSnapshot || !parentSnapshot.exists()) {
      throw 'Parent university not found';
    }

    return parentSnapshot.val();
  }

  // Course without parent - just return the course data
  return courseData;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load angel network based on groupUserName
 */
export const loadAngelNetworkBasedOnGroupUserName = async (groupUserName: string): Promise<any> => {
  const snapshots = await firebase
    .database()
    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
    .orderByChild('groupUserName')
    .equalTo(groupUserName)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    throw 'No group found.';
  }

  let result: any = null;
  snapshots.forEach((snapshot: any) => {
    result = snapshot.val();
  });

  return result;
};

/**
 * Load course details from a group
 */
export const loadCourseFromGroup = async (
  groupUserName: string,
  courseUserName: string
): Promise<any | null> => {
  const group = await loadAngelNetworkBasedOnGroupUserName(groupUserName);

  // Check if the group has the new courses structure
  if (group.courses && group.courses[courseUserName]) {
    return {
      ...group.courses[courseUserName],
      groupData: group,
    };
  }

  // Fallback: check if courseUserName matches a legacy availableCourses entry
  if (group.availableCourses) {
    const matchingCourse = group.availableCourses.find((course: string) => {
      const convertedName = course
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return convertedName === courseUserName;
    });

    if (matchingCourse) {
      return {
        displayName: matchingCourse,
        courseUserName: courseUserName,
        description: `${matchingCourse} course`,
        isDefault: courseUserName === 'student-showcase',
        status: 1,
        groupData: group,
      };
    }
  }

  return null;
};

/**
 * Check if a course exists within a group
 */
export const courseExistsInGroup = async (
  groupUserName: string,
  courseUserName: string
): Promise<boolean> => {
  try {
    const course = await loadCourseFromGroup(groupUserName, courseUserName);
    return course !== null;
  } catch (error) {
    console.error('Error checking course existence:', error);
    return false;
  }
};

/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const SEARCH_ANGEL_NETWORKS_NONE = 0;
export const SEARCH_ANGEL_NETWORKS_BY_NAME = 1;
/**
 * Load angel networks
 */
export const loadAngelNetworks = async (
  { name = null, email = null }: { name?: string | null; email?: string | null },
  mode: number
): Promise<any[]> => {
  if (mode !== SEARCH_ANGEL_NETWORKS_NONE && mode !== SEARCH_ANGEL_NETWORKS_BY_NAME) {
    throw 'Incorrect mode';
  }

  const angelNetworks: any[] = [];
  let angelNetworksRef: any;

  if (mode === SEARCH_ANGEL_NETWORKS_NONE) {
    angelNetworksRef = firebase.database().ref(DB_CONST.GROUP_PROPERTIES_CHILD);
  } else {
    angelNetworksRef = firebase
      .database()
      .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
      .orderByChild('displayNameLower')
      .startAt(name!.toLowerCase());
  }

  const snapshots = await angelNetworksRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return angelNetworks;
  }

  snapshots.forEach((snapshot: any) => {
    const angelNetwork = snapshot.val();
    if (mode === SEARCH_ANGEL_NETWORKS_BY_NAME) {
      if (angelNetwork.displayNameLower.includes(name!.toLowerCase())) {
        angelNetworks.push(snapshot.val());
      }
    } else {
      angelNetworks.push(snapshot.val());
    }
  });

  return angelNetworks;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load the angel networks that invited the user with the specified email
 */
export const loadAngelNetworksInvitedAUser = async (email: string): Promise<any[]> => {
  const db = firebase.database();
  const angelNetworksInvitedUser: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.INVITED_USERS_CHILD)
    .orderByChild('email')
    .equalTo(email.toLowerCase())
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return angelNetworksInvitedUser;
  }

  snapshots.forEach((snapshot: any) => {
    const invitedUser = snapshot.val();
    angelNetworksInvitedUser.push({
      Invitor: invitedUser.invitedBy,
      Invitee: invitedUser,
    });
  });

  await Promise.all(
    angelNetworksInvitedUser.map(async (angelNetworkInvitedUser) => {
      const snapshot = await db
        .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
        .child(angelNetworkInvitedUser.Invitor)
        .once('value');
      const angelNetwork = snapshot.val();
      angelNetworkInvitedUser.Invitor = {
        anid: angelNetwork.anid,
        displayName: angelNetwork.displayName,
        logo: angelNetwork.logo,
      };
    })
  );

  return angelNetworksInvitedUser;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Remove a join request
 */
export const removeAJoinRequest = async (requestID: string): Promise<void> => {
  await firebase.database().ref(DB_CONST.REQUESTS_TO_JOIN_CHILD).child(requestID).remove();
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Return a user object from firebase realtime db.
 *
 * @param type - 0: normal user (issuer, investor), 1: admin
 * @param userID
 */
export const getUser = async (type: number, userID: string): Promise<any> => {
  if (type === 0) {
    const snapshot = await firebase
      .database()
      .ref(DB_CONST.USERS_CHILD)
      .child(userID)
      .once('value');

    if (!snapshot || !snapshot.exists()) {
      throw 'User not found';
    }
    return snapshot.val();
  } else if (type === 1) {
    const snapshot = await firebase
      .database()
      .ref(DB_CONST.ADMINISTRATORS_CHILD)
      .child(userID)
      .once('value');

    if (!snapshot || !snapshot.exists()) {
      throw 'User not found';
    }
    return snapshot.val();
  }

  throw 'User not found';
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Return a user's profile based on the uid provided.
 * Tries normal user first, then admin (with group details if group admin).
 */
export const getUserBasedOnID = async (uid: string): Promise<any> => {
  if (!uid) {
    console.warn('Null id provided');
    return null;
  }

  try {
    return await getUser(0, uid);
  } catch {
    try {
      const admin = await getUser(1, uid);
      if (!admin.superAdmin) {
        try {
          admin.groupDetails = await loadAngelNetworkBasedOnANID(admin.anid);
        } catch (error) {
          console.error('Error loading group details:', error);
          return null;
        }
      }
      return admin;
    } catch {
      console.warn('Admin not found for uid:', uid);
      return null;
    }
  }
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Create a forum
 */
export const createForum = async (forumObj: any): Promise<string> => {
  const db = firebase.database();
  const forumID = db.ref(DB_CONST.FORUMS_CHILD).push().key!;
  forumObj.id = forumID;
  await db.ref(DB_CONST.FORUMS_CHILD).child(forumObj.id).set(forumObj);
  return forumID;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const LOAD_LIVE_FORUMS = 'LOAD_LIVE_FORUMS';
export const LOAD_DELETED_FORUMS = 'LOAD_DELETED_FORUMS';
/**
 * Load all forums
 */
export const loadForums = async (mode: string): Promise<any[]> => {
  const forums: any[] = [];

  if (mode !== LOAD_LIVE_FORUMS && mode !== LOAD_DELETED_FORUMS) {
    throw 'Invalid mode.';
  }

  const db = firebase.database();
  const snapshots = await db.ref(DB_CONST.FORUMS_CHILD).once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return forums;
  }

  snapshots.forEach((snapshot: any) => {
    const forum = snapshot.val();
    if (mode === LOAD_LIVE_FORUMS) {
      if (
        !forum.hasOwnProperty('deleted') ||
        (forum.hasOwnProperty('deleted') && forum.deleted === false)
      ) {
        forums.push(forum);
      }
    } else {
      if (forum.hasOwnProperty('deleted') && forum.deleted === true) {
        forums.push(forum);
      }
    }
  });

  await Promise.all(
    forums.map(async (forum) => {
      forum.author = await getUserBasedOnID(forum.author.id);
    })
  );

  return forums;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Edit a forum
 */
export const editForum = async (editedForum: any): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.FORUMS_CHILD).child(editedForum.id).update(editedForum);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete a forum by adding a property called 'deleted' with the value = true
 */
export const deleteForum = async (forumID: string): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.FORUMS_CHILD).child(forumID).child('deleted').set(true);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Create a thread within a forum
 */
export const createThread = async (threadObj: any): Promise<string> => {
  const db = firebase.database();
  const threadID = db.ref(DB_CONST.FORUM_THREADS_CHILD).push().key!;
  threadObj.id = threadID;
  await db.ref(DB_CONST.FORUM_THREADS_CHILD).child(threadObj.id).set(threadObj);
  return threadID;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Edit a thread
 */
export const editThread = async (editedThread: any): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.FORUM_THREADS_CHILD).child(editedThread.id).update(editedThread);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete a thread by adding a property called 'deleted' with the value = true
 */
export const deleteThread = async (threadID: string): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.FORUM_THREADS_CHILD).child(threadID).child('deleted').set(true);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const LOAD_LIVE_THREADS = 'LOAD_LIVE_THREADS';
export const LOAD_DELETED_THREADS = 'LOAD_DELETED_THREADS';
/**
 * Load threads for a forum with author details
 */
export const loadThreads = async (mode: string, forumSelected: any): Promise<any[]> => {
  const db = firebase.database();
  const threads: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.FORUM_THREADS_CHILD)
    .orderByChild('forumID')
    .equalTo(forumSelected.id)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return threads;
  }

  snapshots.forEach((snapshot: any) => {
    const thread = snapshot.val();
    if (mode === LOAD_LIVE_THREADS) {
      if (
        !thread.hasOwnProperty('deleted') ||
        (thread.hasOwnProperty('deleted') && thread.deleted === false)
      ) {
        threads.push(thread);
      }
    } else {
      if (thread.hasOwnProperty('deleted') && thread.deleted === true) {
        threads.push(thread);
      }
    }
  });

  await Promise.all(
    threads.map(async (thread) => {
      thread.author = await getUserBasedOnID(thread.author.id);
    })
  );

  return threads;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Create a reply to a thread
 */
export const createThreadReply = async (replyObj: any): Promise<string> => {
  const db = firebase.database();
  const replyID = db.ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD).push().key!;
  replyObj.id = replyID;
  await db.ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD).child(replyObj.id).set(replyObj);
  return replyID;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Edit an existing thread reply
 */
export const editThreadReply = async (editedThreadReply: any): Promise<void> => {
  const db = firebase.database();
  await db
    .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
    .child(editedThreadReply.id)
    .update(editedThreadReply);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete a thread reply
 */
export const deleteThreadReply = async (threadReplyID: string): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD).child(threadReplyID).child('deleted').set(true);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load thread replies with author details
 */
export const loadThreadReplies = async (threadSelected: any): Promise<any[]> => {
  const db = firebase.database();
  const replies: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
    .orderByChild('threadID')
    .equalTo(threadSelected.id)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return replies;
  }

  snapshots.forEach((snapshot: any) => {
    replies.push(snapshot.val());
  });

  await Promise.all(
    replies.map(async (reply) => {
      reply.author = await getUserBasedOnID(reply.author.id);
    })
  );

  return replies;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load club attributes
 */
export const loadClubAttributes = async (): Promise<any> => {
  const db = firebase.database();
  const snapshot = await db.ref(DB_CONST.CLUB_ATTRIBUTES_CHILD).once('value');
  return snapshot.val();
};

/**
 * Load invited users of an angel network or ALL for super admin
 */
export const loadInvitedUsers = async (anid: string | null): Promise<any[]> => {
  const db = firebase.database();
  const invitedUsers: any[] = [];

  let dbRef: any;
  if (anid) {
    dbRef = db.ref(DB_CONST.INVITED_USERS_CHILD).orderByChild('invitedBy').equalTo(anid);
  } else {
    dbRef = db.ref(DB_CONST.INVITED_USERS_CHILD);
  }

  const snapshots = await dbRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return invitedUsers;
  }

  snapshots.forEach((snapshot: any) => {
    invitedUsers.push(snapshot.val());
  });

  await Promise.all(
    invitedUsers.map(async (invitedUser) => {
      const angelNetwork = await loadAngelNetworkBasedOnANID(invitedUser.invitedBy);
      invitedUser.Invitor = {
        anid: angelNetwork.anid,
        displayName: angelNetwork.displayName,
        logo: angelNetwork.logo,
      };

      if (invitedUser.hasOwnProperty('officialUserID')) {
        invitedUser.officialUser = await getUserBasedOnID(invitedUser.officialUserID);
      }
    })
  );

  return invitedUsers;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load requests to join (users request to join angel networks)
 */
export const loadRequestsToJoin = async ({
  userID = null,
  anid = null,
}: {
  userID?: string | null;
  anid?: string | null;
}): Promise<any[]> => {
  let requestsRef: any = firebase.database().ref(DB_CONST.REQUESTS_TO_JOIN_CHILD);

  if (userID && anid) {
    throw 'userID and anid cannot be defined at the same time';
  }

  if (userID) {
    requestsRef = requestsRef.orderByChild('userID').equalTo(userID);
  }

  if (anid) {
    requestsRef = requestsRef.orderByChild('groupToJoin').equalTo(anid);
  }

  if (!requestsRef) {
    throw 'Error happened';
  }

  const requests: any[] = [];
  const snapshots = await requestsRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return requests;
  }

  snapshots.forEach((snapshot: any) => {
    requests.push(snapshot.val());
  });

  await Promise.all(
    requests.map(async (request) => {
      request.userProfile = await getUserBasedOnID(request.userID);
      request.group = await loadAngelNetworkBasedOnANID(request.groupToJoin);
    })
  );

  return requests;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load an invited user based on ID or email
 */
export const GET_INVITED_USER_BASED_ON_INVITED_ID = 1;
export const GET_INVITED_USER_BASED_ON_OFFICIAL_ID = 2;
export const GET_INVITED_USER_BASED_ON_EMAIL = 3;
export const getInvitedUserBasedOnIDOrEmail = async (
  idOrEmail: string,
  mode: number
): Promise<any[]> => {
  const db = firebase.database();
  const invitedUsers: any[] = [];

  if (
    mode !== GET_INVITED_USER_BASED_ON_INVITED_ID &&
    mode !== GET_INVITED_USER_BASED_ON_OFFICIAL_ID &&
    mode !== GET_INVITED_USER_BASED_ON_EMAIL
  ) {
    throw 'Incorrect mode';
  }

  const orderByField =
    mode === GET_INVITED_USER_BASED_ON_INVITED_ID
      ? 'id'
      : mode === GET_INVITED_USER_BASED_ON_OFFICIAL_ID
        ? 'officialUserID'
        : 'email';

  const snapshots = await db
    .ref(DB_CONST.INVITED_USERS_CHILD)
    .orderByChild(orderByField)
    .equalTo(idOrEmail)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    throw 'No invited users found.';
  }

  snapshots.forEach((snapshot: any) => {
    invitedUsers.push(snapshot.val());
  });

  await Promise.all(
    invitedUsers.map(async (invitedUser) => {
      const snapshot = await db
        .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
        .child(invitedUser.invitedBy)
        .once('value');
      const angelNetwork = snapshot.val();
      invitedUser.Invitor = {
        anid: angelNetwork.anid,
        displayName: angelNetwork.displayName,
        logo: angelNetwork.logo,
      };
    })
  );

  return invitedUsers;
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
 * Fetch projects with filter parameters and limit parameter
 */
export const fetchProjectsBy = async (
  {
    visibility = null,
    angelNetwork = null,
    issuer = null,
    sector = null,
    projectsWithStatus = FETCH_LIVE_PROJECTS,
    fetchOrderBy = null,
  }: {
    visibility?: number | null;
    angelNetwork?: string | null;
    issuer?: string | null;
    sector?: string | null;
    projectsWithStatus?: number;
    fetchOrderBy?: number | null;
  },
  limit: number = 100000
): Promise<any[]> => {
  const projects: any[] = [];
  const db = firebase.database();
  let projectsRef: any = db.ref(DB_CONST.PROJECTS_CHILD);

  switch (fetchOrderBy) {
    case FETCH_PROJECTS_ORDER_BY_NONE:
      break;
    case FETCH_PROJECTS_ORDER_BY_VISIBILITY:
      projectsRef = projectsRef.orderByChild('visibility').equalTo(visibility);
      break;
    case FETCH_PROJECTS_ORDER_BY_ANGEL_NETWORK:
      projectsRef = projectsRef.orderByChild('anid').equalTo(angelNetwork);
      break;
    case FETCH_PROJECTS_ORDER_BY_ISSUER:
      projectsRef = projectsRef.orderByChild('issuerID').equalTo(issuer);
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
      throw 'Incorrect mode to fetch projects';
  }

  const snapshots = await projectsRef.limitToLast(limit).once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return projects;
  }

  snapshots.forEach((snapshot: any) => {
    const project = snapshot.val();

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

  await Promise.all(
    projects.map(async (project) => {
      project.group = await loadAngelNetworkBasedOnANID(project.anid);
      project.issuer = await getUserBasedOnID(project.issuerID);

      if (
        utils.isProjectInLivePledgePhase(project) ||
        utils.isProjectSuccessful(project) ||
        utils.isProjectFailed(project)
      ) {
        project.pledges = await loadPledges(project.id, null, LOAD_PLEDGES_ORDER_BY_PROJECT);
      }
    })
  );

  return projects;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load a particular project from its id
 */
export const loadAParticularProject = async (projectID: string): Promise<any> => {
  const db = firebase.database();
  const snapshot = await db.ref(DB_CONST.PROJECTS_CHILD).child(projectID).once('value');

  if (!snapshot || !snapshot.exists() || !snapshot.val()) {
    throw 'No project found.';
  }

  const project = snapshot.val();
  const isFirebaseKey = project.anid && project.anid.startsWith('-') && project.anid.length > 10;

  // Load group with fallback logic
  if (!isFirebaseKey && project.anid) {
    try {
      project.group = await loadAngelNetworkBasedOnGroupUserName(project.anid);
    } catch {
      try {
        project.group = await loadAngelNetworkBasedOnGroupUserName('invest-west');
      } catch {
        throw "Couldn't load group - all attempts failed";
      }
    }
  } else {
    try {
      project.group = await loadAngelNetworkBasedOnANID(project.anid);
    } catch {
      try {
        project.group = await loadAngelNetworkBasedOnGroupUserName('invest-west');
      } catch {
        throw "Couldn't load group - both primary and fallback failed";
      }
    }
  }

  // Load issuer
  try {
    project.issuer = await getUserBasedOnID(project.issuerID);
  } catch {
    throw "Couldn't load project issuer";
  }

  // Load pledges (only for projects not in pitch phase)
  if (project.status !== DB_CONST.PROJECT_STATUS_PITCH_PHASE) {
    project.pledges = await loadPledges(projectID, null, LOAD_PLEDGES_ORDER_BY_PROJECT);
  }

  return project;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all reject feedbacks for a specific project
 */
export const loadProjectRejectFeedbacks = async (projectID: string): Promise<any[]> => {
  const db = firebase.database();
  const rejectFeedbacks: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.PROJECT_REJECT_FEEDBACKS_CHILD)
    .orderByChild('projectID')
    .equalTo(projectID)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return rejectFeedbacks;
  }

  snapshots.forEach((snapshot: any) => {
    const feedback = snapshot.val();
    feedback.id = snapshot.key;
    rejectFeedbacks.push(feedback);
  });

  await Promise.all(
    rejectFeedbacks.map(async (feedback) => {
      try {
        feedback.admin = await getUserBasedOnID(feedback.sentBy);
      } catch (error) {
        console.warn('Could not load admin for feedback:', error);
        feedback.admin = null;
      }
    })
  );

  // Sort by date descending (most recent first)
  rejectFeedbacks.sort((a, b) => b.date - a.date);
  return rejectFeedbacks;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Close a live project temporarily or open a temporarily closed project again
 */
export const toggleProjectLivelinessTemporarily = async (
  admin: any,
  project: any
): Promise<void> => {
  let shouldSendNotificationForIssuer = false;
  if (project.issuer.type === DB_CONST.TYPE_ISSUER) {
    shouldSendNotificationForIssuer = true;
  }

  project.issuer = null;
  project.pledges = null;
  project.group = null;

  const projectBeforeUpdating = JSON.parse(JSON.stringify(project));

  project.temporarilyClosed = !project.hasOwnProperty('temporarilyClosed')
    ? true
    : !project.temporarilyClosed;

  await firebase.database().ref(DB_CONST.PROJECTS_CHILD).child(project.id).update(project);

  const activitySummary =
    project.temporarilyClosed === true
      ? ACTIVITY_SUMMARY_TEMPLATE_CLOSED_A_LIVE_PROJECT_TEMPORARILY
      : ACTIVITY_SUMMARY_TEMPLATE_OPEN_A_TEMPORARILY_CLOSED_PROJECT_AGAIN;

  // Track admin activity (fire-and-forget)
  trackActivity({
    userID: admin.id,
    activityType: DB_CONST.ACTIVITY_TYPE_POST,
    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
    interactedObjectID: project.id,
    activitySummary: activitySummary.replace('%project%', project.projectName),
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
    value: {
      before: projectBeforeUpdating,
      after: project,
    },
  });

  // Send notification to the issuer (fire-and-forget)
  if (shouldSendNotificationForIssuer) {
    sendNotification({
      title: project.temporarilyClosed
        ? `${project.projectName} has been closed temporarily`
        : `${project.projectName} has been opened again`,
      message: project.temporarilyClosed
        ? 'This investment opportunity has been closed temporarily by your group admin. We will notify you when it is opened again.'
        : 'This investment opportunity has been opened again. The students can now interact with it.',
      userID: project.issuerID,
      action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
    }).catch(() => {});
  }

  // Send notifications to investors who voted or pledged (fire-and-forget)
  void (async () => {
    try {
      const votes = (await loadVotes(project.id, null, LOAD_VOTES_ORDER_BY_PROJECT)) || [];
      const listOfInvestorsToBeNotified: string[] = [];
      votes.forEach((vote: any) => {
        listOfInvestorsToBeNotified.push(vote.investorID);
      });

      const pledges = await loadPledges(project.id, null, LOAD_PLEDGES_ORDER_BY_PROJECT);
      pledges.forEach((pledge: any) => {
        if (listOfInvestorsToBeNotified.indexOf(pledge.investorID) === -1) {
          listOfInvestorsToBeNotified.push(pledge.investorID);
        }
      });

      await Promise.all(
        listOfInvestorsToBeNotified.map((investorID) =>
          sendNotification({
            title: project.temporarilyClosed
              ? `${project.projectName} has been closed temporarily`
              : `${project.projectName} has been opened again`,
            message: project.temporarilyClosed
              ? 'This investment opportunity has been closed temporarily by the group admin. We will notify you when it is opened again.'
              : 'This investment opportunity has been opened again. You can now interact with it as usual.',
            userID: investorID,
            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
          }).catch(() => {})
        )
      );
    } catch {
      // fire-and-forget
    }
  })();
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project can go live
 */
export const makeProjectGoLiveDecision = async (
  admin: any,
  project: any,
  decisionObj: any
): Promise<void> => {
  const projectBeforeDecision = JSON.parse(JSON.stringify(project));
  projectBeforeDecision.issuer = null;
  projectBeforeDecision.pledges = null;
  projectBeforeDecision.group = null;

  // project goes live
  if (decisionObj.decision) {
    project.visibility =
      decisionObj.projectVisibilitySetting === -1
        ? project.visibility
        : decisionObj.projectVisibilitySetting;
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

  await firebase.database().ref(DB_CONST.PROJECTS_CHILD).child(project.id).update(project);

  // If project is approved (goes live), clear all reject feedbacks
  if (decisionObj.decision) {
    try {
      await new Api().request('post', ApiRoutes.clearProjectRejectFeedbacksRoute, {
        queryParameters: null,
        requestBody: {
          projectID: project.id,
        },
      });
    } catch (clearFeedbackError) {
      console.error('Error clearing reject feedbacks on project approval:', clearFeedbackError);
      // Continue even if clearing feedbacks fails - the project is already approved
    }
  }

  const activitySummary = decisionObj.decision
    ? ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PITCH
    : ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PITCH;

  await new Api().request('post', ApiRoutes.sendEmailRoute, {
    queryParameters: null,
    requestBody: {
      emailType: 2,
      emailInfo: {
        projectID: project.id,
      },
    },
  });

  // Track admin activity (fire-and-forget)
  trackActivity({
    userID: admin.id,
    activityType: DB_CONST.ACTIVITY_TYPE_POST,
    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
    interactedObjectID: project.id,
    activitySummary: activitySummary.replace('%project%', project.projectName),
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
    value: {
      before: projectBeforeDecision,
      after: project,
    },
  });

  // Send a notification to notify the issuer
  await sendNotification({
    title: project.projectName,
    message: decisionObj.decision
      ? `Congratulations! Your offer has been published.`
      : `Unfortunately your offer has been rejected. Contact your course's administrator for further information.`,
    userID: project.issuerID,
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
  });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project can go to the Pledge phase
 */
export const makeProjectGoToPledgePhaseDecision = async (
  admin: any,
  project: any,
  decision: boolean
): Promise<void> => {
  const projectBeforeDecision = JSON.parse(JSON.stringify(project));
  projectBeforeDecision.issuer = null;
  projectBeforeDecision.pledges = null;
  projectBeforeDecision.group = null;

  if (decision) {
    project.Pitch.status = DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER;
  } else {
    project.status = DB_CONST.PROJECT_STATUS_FAILED;
    project.Pitch.status = DB_CONST.PITCH_STATUS_REJECTED;
  }

  project.issuer = null;
  project.pledges = null;
  project.group = null;

  const db = firebase.database();
  await db.ref(DB_CONST.PROJECTS_CHILD).child(project.id).update(project);

  const activitySummary = decision
    ? ACTIVITY_SUMMARY_TEMPLATE_MOVED_PITCH_TO_PLEDGE
    : ACTIVITY_SUMMARY_TEMPLATE_CLOSED_PITCH;

  // Track admin's activity (fire-and-forget)
  trackActivity({
    userID: admin.id,
    activityType: DB_CONST.ACTIVITY_TYPE_POST,
    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
    interactedObjectID: project.id,
    activitySummary: activitySummary.replace('%project%', project.projectName),
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
    value: {
      before: projectBeforeDecision,
      after: project,
    },
  });

  // Send a notification to notify the issuer
  await sendNotification({
    title: project.projectName,
    message: decision
      ? `Congratulations! Your investment opportunity has moved to the pledge phase. You can now create your pledge page. Your pledge page will be checked by the course admin before publication.`
      : `Unfortunately your investment opportunity has been rejected. Contact your course's administrator for further information.`,
    userID: project.issuerID,
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
  });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Make decision whether a project's Pledge can go live
 */
export const makeProjectPledgeGoLiveDecision = async (
  admin: any,
  project: any,
  decisionObj: any
): Promise<void> => {
  const projectBeforeDecision = JSON.parse(JSON.stringify(project));
  projectBeforeDecision.issuer = null;
  projectBeforeDecision.pledges = null;
  projectBeforeDecision.group = null;

  if (decisionObj.decision) {
    project.visibility =
      decisionObj.projectVisibilitySetting === -1
        ? project.visibility
        : decisionObj.projectVisibilitySetting;
    project.status = DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE;
  } else {
    project.status = DB_CONST.PROJECT_STATUS_FAILED;
    project.PrimaryOffer.status = DB_CONST.PRIMARY_OFFER_STATUS_REJECTED;
  }

  project.issuer = null;
  project.pledges = null;
  project.group = null;

  const db = firebase.database();
  await db.ref(DB_CONST.PROJECTS_CHILD).child(project.id).update(project);

  const activitySummary = decisionObj.decision
    ? ACTIVITY_SUMMARY_TEMPLATE_PUBLISHED_PLEDGE
    : ACTIVITY_SUMMARY_TEMPLATE_REJECTED_PLEDGE;

  // Track admin's activity (fire-and-forget)
  trackActivity({
    userID: admin.id,
    activityType: DB_CONST.ACTIVITY_TYPE_POST,
    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
    interactedObjectID: project.id,
    activitySummary: activitySummary.replace('%project%', project.projectName),
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
    value: {
      before: projectBeforeDecision,
      after: project,
    },
  });

  // Send a notification to notify the issuer
  await sendNotification({
    title: project.projectName,
    message: decisionObj.decision
      ? `Congratulations! Your project has been published.`
      : `Unfortunately your project has been rejected. Contact your course's admin for further information.`,
    userID: project.issuerID,
    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(':projectID', project.id),
  });
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all comments of a project
 */
export const loadComments = async (projectID: string): Promise<any[]> => {
  const db = firebase.database();
  const comments: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.COMMENTS_CHILD)
    .orderByChild('projectID')
    .equalTo(projectID)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return comments;
  }

  snapshots.forEach((snapshot: any) => {
    comments.push(snapshot.val());
  });

  await Promise.all(
    comments.map(async (comment) => {
      comment.author = await getUserBasedOnID(comment.commentedBy);
    })
  );

  return comments;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load pledges of a project
 */
export const LOAD_PLEDGES_ORDER_BY_PROJECT = 1;
export const LOAD_PLEDGES_ORDER_BY_INVESTOR = 2;
export const loadPledges = async (
  projectID: string | null = null,
  investorID: string | null = null,
  mode: number
): Promise<any[]> => {
  const db = firebase.database();
  let pledgesRef: any = db.ref(DB_CONST.PLEDGES_CHILD);

  if (projectID && mode === LOAD_PLEDGES_ORDER_BY_PROJECT) {
    pledgesRef = pledgesRef.orderByChild('projectID').equalTo(projectID);
  } else if (investorID && mode === LOAD_PLEDGES_ORDER_BY_INVESTOR) {
    pledgesRef = pledgesRef.orderByChild('investorID').equalTo(investorID);
  } else {
    throw 'Invalid mode';
  }

  const pledges: any[] = [];
  const snapshots = await pledgesRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return pledges;
  }

  snapshots.forEach((snapshot: any) => {
    const pledge = snapshot.val();
    if (pledge.amount !== '') {
      pledges.push(pledge);
    }
  });

  await Promise.all(
    pledges.map(async (pledge) => {
      pledge.investor = await getUserBasedOnID(pledge.investorID);
    })
  );

  return pledges;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load votes of a project
 */
export const LOAD_VOTES_ORDER_BY_PROJECT = 1;
export const LOAD_VOTES_ORDER_BY_INVESTOR = 2;
export const loadVotes = async (
  projectID: string | null = null,
  investorID: string | null = null,
  mode: number
): Promise<any[] | null> => {
  const db = firebase.database();
  let votesRef: any = db.ref(DB_CONST.VOTES_CHILD);

  if (projectID && mode === LOAD_VOTES_ORDER_BY_PROJECT) {
    votesRef = votesRef.orderByChild('projectID').equalTo(projectID);
  } else if (investorID && mode === LOAD_VOTES_ORDER_BY_INVESTOR) {
    votesRef = votesRef.orderByChild('investorID').equalTo(investorID);
  } else {
    return null;
  }

  const votes: any[] = [];
  const snapshots = await votesRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return votes;
  }

  snapshots.forEach((snapshot: any) => {
    const vote = snapshot.val();
    if (vote.voted !== '') {
      votes.push(vote);
    }
  });

  await Promise.all(
    votes.map(async (vote) => {
      vote.investor = await getUserBasedOnID(vote.investorID);
    })
  );

  return votes;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load all notifications of a user
 */
export const loadNotifications = async (userID: string): Promise<any[]> => {
  const db = firebase.database();
  const notifications: any[] = [];

  const snapshots = await db
    .ref(DB_CONST.NOTIFICATIONS_CHILD)
    .orderByChild('userID')
    .equalTo(userID)
    .once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return notifications;
  }

  snapshots.forEach((snapshot: any) => {
    notifications.push(snapshot.val());
  });

  return notifications;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete all notifications of a user
 */
export const deleteAllNotifications = async (userID: string): Promise<void> => {
  const db = firebase.database();
  const notifications = await loadNotifications(userID);

  if (notifications.length === 0) {
    return;
  }

  await Promise.all(
    notifications.map(async (notification) => {
      await db.ref(DB_CONST.NOTIFICATIONS_CHILD).child(notification.id).remove();
    })
  );
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Post a comment reply
 */
export const postCommentReply = async (commentReply: any): Promise<string> => {
  const db = firebase.database();
  const replyID = db.ref(DB_CONST.COMMENT_REPLIES_CHILD).push().key!;

  await db
    .ref(DB_CONST.COMMENT_REPLIES_CHILD)
    .child(replyID)
    .set({
      ...commentReply,
      id: replyID,
    });

  return replyID;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load replies of comments
 */
export const loadCommentsReplies = async (comments: any[]): Promise<any[]> => {
  const db = firebase.database();
  const updatedComments = [...comments];

  await Promise.all(
    updatedComments.map(async (comment) => {
      const replies: any[] = [];

      const snapshots = await db
        .ref(DB_CONST.COMMENT_REPLIES_CHILD)
        .orderByChild('commentID')
        .equalTo(comment.id)
        .once('value');

      if (snapshots && snapshots.exists() && snapshots.numChildren() > 0) {
        snapshots.forEach((snapshot: any) => {
          const reply = snapshot.val();
          if (!(reply.hasOwnProperty('deleted') && reply.deleted === true)) {
            replies.push(snapshot.val());
          }
        });

        await Promise.all(
          replies.map(async (reply) => {
            reply.author = await getUserBasedOnID(reply.repliedBy);
          })
        );
      }

      comment.replies = replies;
    })
  );

  return updatedComments;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Delete a reply of a comment
 */
export const deleteCommentReply = async (commentReplyID: string): Promise<void> => {
  const db = firebase.database();
  await db.ref(DB_CONST.COMMENT_REPLIES_CHILD).child(commentReplyID).child('deleted').set(true);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update a comment reply
 */
export const updateCommentReply = async (updatedCommentReply: any): Promise<void> => {
  const db = firebase.database();
  await db
    .ref(DB_CONST.COMMENT_REPLIES_CHILD)
    .child(updatedCommentReply.id)
    .update(updatedCommentReply);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Load marketing preferences
 *
 * @param userID - null: load all, not null: load for a particular user
 */
export const loadMarketingPreferences = async (userID: string | null): Promise<any[]> => {
  const db = firebase.database();
  const marketingPreferencesRef = userID
    ? db.ref(DB_CONST.MARKETING_PREFERENCES_CHILD).orderByChild('userID').equalTo(userID)
    : db.ref(DB_CONST.MARKETING_PREFERENCES_CHILD);

  const marketingPreferences: any[] = [];
  const snapshots = await marketingPreferencesRef.once('value');

  if (!snapshots || !snapshots.exists() || snapshots.numChildren() === 0) {
    return marketingPreferences;
  }

  snapshots.forEach((snapshot: any) => {
    marketingPreferences.push(snapshot.val());
  });

  await Promise.all(
    marketingPreferences.map(async (marketingPreference) => {
      marketingPreference.user = await getUserBasedOnID(marketingPreference.userID);
    })
  );

  return marketingPreferences;
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Turn on/off marketing preferences
 */
export const toggleMarketingPreferences = async ({
  userID,
  value,
}: {
  userID: string;
  value: any;
}): Promise<void> => {
  if (!userID || !value) {
    throw 'Missing arguments';
  }

  const marketingPreferences = await loadMarketingPreferences(userID);

  if (marketingPreferences.length === 0) {
    // user has not registered for Marketing preferences before
    const id = firebase.database().ref(DB_CONST.MARKETING_PREFERENCES_CHILD).push().key!;

    const newPreference = {
      accepted: value,
      date: utils.getCurrentDate(),
      id,
      userID,
    };

    await firebase
      .database()
      .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
      .child(id)
      .set(newPreference);
  } else {
    // user has registered for Marketing preferences before
    marketingPreferences[0].accepted = value;
    marketingPreferences[0].date = utils.getCurrentDate();

    await firebase
      .database()
      .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
      .child(marketingPreferences[0].id)
      .set(marketingPreferences[0]);
  }
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update a sub settings inside marketing preferences
 */
export const updateMarketingPreferencesSetting = async ({
  userID,
  field,
  value,
}: {
  userID: string;
  field: string;
  value: any;
}): Promise<void> => {
  const marketingPreferences = await loadMarketingPreferences(userID);

  if (marketingPreferences.length === 0) {
    // user has not registered for Marketing preferences before
    const id = firebase.database().ref(DB_CONST.MARKETING_PREFERENCES_CHILD).push().key!;

    const newPreference = {
      accepted: true,
      date: utils.getCurrentDate(),
      id,
      userID,
      settings: {
        field: value,
      },
    };

    await firebase
      .database()
      .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
      .child(id)
      .set(newPreference);
  } else {
    // user has registered for Marketing preferences before
    await firebase
      .database()
      .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
      .child(marketingPreferences[0].id)
      .child('settings')
      .child(field)
      .set(value);
  }
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Update group properties setting
 */
export const updateGroupPropertiesSetting = async ({
  anid,
  field,
  value,
}: {
  anid: string;
  field: string;
  value: any;
}): Promise<void> => {
  await firebase
    .database()
    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
    .child(anid)
    .child('settings')
    .child(field)
    .set(value);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Bring an expired pitch back to live by setting a new expiry date
 */
export const bringPitchBackToLive = async ({
  project,
  newPitchExpiryDate,
}: {
  project: any;
  newPitchExpiryDate: string;
}): Promise<void> => {
  project.Pitch.status = DB_CONST.PITCH_STATUS_ON_GOING;
  project.status = DB_CONST.PROJECT_STATUS_PITCH_PHASE;
  project.Pitch.expiredDate = newPitchExpiryDate;

  await firebase.database().ref(DB_CONST.PROJECTS_CHILD).child(project.id).update(project);
};
/**
 * ---------------------------------------------------------------------------------------------------------------------
 */
