/**
 * This file contains all Firebase paths and constant values.
 */

/**
 * FIREBASE DATABASE NODES ---------------------------------------------------------------------------------------------
 *
 * @type {string}
 */

// Groups node
export const GROUP_PROPERTIES_CHILD = "AngelNetworkProperties";

// Admins node
export const ADMINISTRATORS_CHILD = "Administrators";

// System's attributes node
export const CLUB_ATTRIBUTES_CHILD = "ClubAttributes";

// Users node
export const USERS_CHILD = "Users";

// Projects node
export const PROJECTS_CHILD = "Projects";

// Activities log node
export const ACTIVITIES_LOG_CHILD = "ActivitiesLog";

// Access requests to a group node
export const REQUESTS_TO_JOIN_CHILD = "RequestsToJoin";

// Contact us enquiries node
export const CONTACT_US_ENQUIRIES_CHILD = "ContactUsEnquiries";

// Marketing preferences node
export const MARKETING_PREFERENCES_CHILD = "MarketingPreferences";

// Invited users node
export const INVITED_USERS_CHILD = "InvitedUsers";

// Business profile node
export const BUSINESS_PROFILE_CHILD = "BusinessProfile";

// Accepted create pitch T&Cs node
export const ACCEPTED_CREATE_PITCH_TERM_AND_CONDITIONS_CHILD = "AcceptedCreatePitchTermsAndConditions";

// Project comments node
export const COMMENTS_CHILD = "Comments";

// Project comment replies node
export const COMMENT_REPLIES_CHILD = "CommentReplies";

// Pledges node
export const PLEDGES_CHILD = "Pledges";

// Project votes node
export const VOTES_CHILD = "Votes";

// Pledge FAQs node
export const PLEDGE_FAQS_CHILD = "PledgeFAQs";

// Notifications node
export const NOTIFICATIONS_CHILD = "Notifications";

// Forums node
export const FORUMS_CHILD = "Forums";

// Forum threads node
export const FORUM_THREADS_CHILD = "ForumThreads";

// Forum thread replies node
export const FORUM_THREAD_REPLIES_CHILD = "ForumThreadReplies";
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * FIREBASE STORAGE DIRECTORIES ----------------------------------------------------------------------------------------
 *
 * @type {string}
 */

// Plain logos directory
export const PLAIN_LOGOS_CHILD = "PlainLogos";

// Logos with text directory
export const LOGOS_WITH_TEXT_CHILD = "LogosWithText";

// Legal documents directory
export const LEGAL_DOCUMENTS_CHILD = "LegalDocuments";

// Logos directory
export const LOGOS_CHILD = "Logos";

// Videos directory
export const INTRO_VIDEOS_CHILD = "Videos";

// Profile pictures directory
export const PROFILE_PICTURES_CHILD = "ProfilePictures";
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * FIREBASE DATABASE ATTRIBUTES ----------------------------------------------------------------------------------------
 *
 * @type {string}
 */
export const PROJECT_SUPPORTING_DOCUMENTS_CHILD = "supportingDocuments";

export const PROJECT_PRESENTATION_DOCUMENT_CHILD = "presentationDocument";

export const PROFILE_PICTURE_CHILD = "profilePicture";

export const PROJECT_COVER_CHILD = "cover";

export const LOGO_CHILD = "logo";

export const INTRO_VIDEO_CHILD = "video";
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * ACTIVITY LOG TYPES --------------------------------------------------------------------------------------------------
 *
 * @type {number}
 */
export const ACTIVITY_TYPE_CLICK = 1; // profile, pitch/offer
export const ACTIVITY_TYPE_VIEW = 2; // profile, pitch/offer, group
export const ACTIVITY_TYPE_DOWNLOAD = 3; // download documents
export const ACTIVITY_TYPE_POST = 4; // comments, forums, threads, replies, pledges, likes, changes password
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * INVITED USER STATUS -------------------------------------------------------------------------------------------------
 *
 * This value is used to determine the status of a user in a group.
 *
 * @type {number}
 */
export const INVITED_USER_NOT_REGISTERED = 0;
export const INVITED_USER_DECLINED_TO_REGISTER = 1;
export const INVITED_USER_STATUS_ACTIVE = 2;
export const INVITED_USER_STATUS_LEFT = 3;
export const INVITED_USER_STATUS_KICKED_OUT = 4;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * GROUP STATUS --------------------------------------------------------------------------------------------------------
 *
 * This value is used to determine the status of a group.
 *
 * @type {number}
 */
export const GROUP_STATUS_ACTIVE = 1;
export const GROUP_STATUS_SUSPENDED = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * USER TYPE -----------------------------------------------------------------------------------------------------------
 *
 * @type {number}
 */
export const TYPE_INVESTOR = 1;
export const TYPE_ISSUER = 2;
export const TYPE_ADMIN = 3;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * PROJECT VISIBILITY --------------------------------------------------------------------------------------------------
 *
 * This value is used to determine the visibility of a project (offer).
 *
 * @type {number}
 */
export const PROJECT_VISIBILITY_PRIVATE = 1;
export const PROJECT_VISIBILITY_RESTRICTED = 2;
export const PROJECT_VISIBILITY_PUBLIC = 3;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * INVESTOR AGREEMENT TYPE ---------------------------------------------------------------------------------------------
 *
 * This value is used to determine the investors' self-certification type.
 *
 * @type {number}
 */
export const HIGH_NET_WORTH_INVESTOR_AGREEMENT = 1;
export const SELF_CERTIFIED_SOPHISTICATED_INVESTOR_AGREEMENT = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * PROJECT STATUS ------------------------------------------------------------------------------------------------------
 *
 * @type {number}
 */

// --- Project overall status ---
export const PROJECT_STATUS_DRAFT = -2; // project has not been published yet
export const PROJECT_STATUS_REJECTED = -1; // this status means the project failed even before it is publicly showed
export const PROJECT_STATUS_BEING_CHECKED = 0; // the project (offer) must be checked by admin first
export const PROJECT_STATUS_PITCH_PHASE = 1;
export const PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED = 2;
export const PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED = 3;
export const PROJECT_STATUS_PRIMARY_OFFER_PHASE = 4;
export const PROJECT_STATUS_SUCCESSFUL = 5;
export const PROJECT_STATUS_FAILED = 6;

// --- Pitch status only ---
export const PITCH_STATUS_ON_GOING = 1;
export const PITCH_STATUS_ACCEPTED = 2;
export const PITCH_STATUS_REJECTED = 3;
// when the admin accepts a pitch, its status will change to this state (pitch accepted and waiting for primary offer to be created)
// when the issuer creates a primary offer, the pitch's status will change to PITCH_STATUS_ACCEPTED
export const PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER = 4;
// this status means the pitch has expired but admin has not accepted or rejected it
export const PITCH_STATUS_WAITING_FOR_ADMIN = 5;

// --- Pledge status only ---
export const PRIMARY_OFFER_STATUS_ON_GOING = 1;
export const PRIMARY_OFFER_STATUS_EXPIRED = 2;
export const PRIMARY_OFFER_STATUS_REJECTED = 3;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * PROJECT COMMENT STATUS ----------------------------------------------------------------------------------------------
 *
 * @type {number}
 */
export const COMMENT_STATUS_POSTED = 1;
export const COMMENT_STATUS_EDITED = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * PROJECT COMMENT REPLY STATUS ----------------------------------------------------------------------------------------
 *
 * @type {number}
 */
export const COMMENT_REPLY_STATUS_POSTED = 1;
export const COMMENT_REPLY_STATUS_EDITED = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * CONTROL IF A PLEDGE IS NEWLY CREATED OR EDITED ----------------------------------------------------------------------
 *
 * @type {number}
 */
export const MAKE_A_NEW_PLEDGE = 1;
export const EDIT_A_PLEDGE = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * USER TITLES ---------------------------------------------------------------------------------------------------------
 *
 * @type {string[]}
 */
export const USER_TITLES = ["Please select", "Ms.", "Mrs.", "Miss", "Mr.", "Mx", "Dr.", "Prof."];

export const HEAR_ABOUT = ["Please select", "Google", "Newsletter", "Linkedin", "Event"];

/**
 * FINANCIAL ROUNDS ----------------------------------------------------------------------------------------------------
 *
 * @type {string[]}
 */
export const FINANCIAL_ROUNDS = ["Yes", "No"];

export const EIS_BADGE = ["Yes", "No"];

export const SEIS_BADGE = ["Yes", "No"];

/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * MULTIMEDIA TYPE (VIDEO OR IMAGE) ------------------------------------------------------------------------------------
 *
 * @type {number}
 */
export const FILE_TYPE_VIDEO = 1;
export const FILE_TYPE_IMAGE = 2;
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */

/**
 * FILE CONFIGURATION ---------------------------------------------------------------------------------------------
 *
 * @type {number|string}
 */
export const MAX_FILE_SIZE_IN_MB = 15;
export const MAX_FILE_SIZE_IN_BYTES = 15000000;

export const MAX_VIDEO_OR_IMAGE_SIZE_IN_MB = 30;
export const MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES = 30000000;

export const MAX_LEGAL_DOCUMENTS_UPLOAD_FOR_ISSUER = 2;
export const MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS = 10;

export const STORAGE_FILE_NAME_ID_SPLIT = "-invest-west-";
/**
 * ./// ----------------------------------------------------------------------------------------------------------------
 */