import * as DB_CONST from "../firebase/databaseConsts";
import {
    FILE_TYPE_IMAGE,
    FILE_TYPE_VIDEO,
    PROJECT_VISIBILITY_PRIVATE,
    PROJECT_VISIBILITY_PUBLIC,
    PROJECT_VISIBILITY_RESTRICTED
} from "../firebase/databaseConsts";
import CreatePitchAgreement from "./create_pitch_agreement";
import GroupProperties from "./group_properties";
import User, {isIssuer} from "./user";
import Pledge from "./pledge";
import Admin, {isAdmin} from "./admin";
import GroupOfMembership from "./group_of_membership";

/**
 * Project interface
 */
export default interface Project {
    id: string;
    anid: string;
    issuerID: string;
    visibility: number;
    status: number;
    projectName?: string; // optional for draft projects only
    description?: string; // optional for draft projects only
    sector?: string; // optional for draft projects only
    course?: string; // optional for draft projects only
    edited?: number;
    temporarilyClosed?: boolean;

    /**
     * This field contains the user id of the group admin who
     * - created the project on their own
     *      --> [issuerID] = user id of the group admin as well
     *
     * - created the project on behalf of an issuer
     *      --> [issuerID] = user id of the issuer whom the group admin created the project for
     */
    createdByGroupAdmin?: string;

    Pitch: ProjectPitch;
    PrimaryOffer?: ProjectPledge;

    createPitchAgreement?: CreatePitchAgreement | null
}

/**
 * Instance of project at load time that contains extra information from other collections
 */
export interface ProjectInstance {
    projectDetail: Project;
    group: GroupProperties;
    issuer: User | Admin;
    pledges: Pledge[];
    rejectFeedbacks: ProjectRejectFeedback[];
}

/**
 * An interface that specifies the format of a project in csv
 */
export interface ProjectCsv {
    visibility: "public" | "restricted" | "private";
    projectName: string | undefined;
    description: string | undefined;
    sector: string | undefined;
    course: string | undefined;
    postedDate: number | undefined; // = pitch postedDate
    //financialRound: string | undefined; // = pitch financialRound

    detailsAboutEarlierFundraisingRounds: string | undefined; // = pitch detailsAboutEarlierFundraisingRounds
    investorsCommitted: string | undefined; // = pitch investorsCommitted
    fundRequired: number | undefined; // = pitch fundRequired
    postMoneyValuation: number | undefined;
    coverURL: string | undefined; // = active pitch cover
    mainDocument: string | undefined; // = active pitch presentationDocument
    mainText: string | undefined; // = pitch presentationPlainText
    supportingDocuments: string | undefined; // = active pitch supportingDocuments

    pitchExpiryDate: string | undefined; // = pitch expiredDate

    pledgeExpiryDate: string | undefined; // = pledge expiredDate

    // this field is only available for QIB group
    qibSpecialNews?: string | undefined; // = pitch qibSpecialNews

    agreedToShareRaisePublicly?: "yes" | "no" | undefined;
}

/**
 * Project - pitch interface
 */
export interface ProjectPitch {
    postedDate: number;
    status: number;
    fundRequired?: number;
    totalRaise?: number;
    expiredDate?: number;
    cover?: PitchCover[];
    postMoneyValuation?: number;
    detailsAboutEarlierFundraisingRounds?: string;
    investorsCommitted?: string;
    //financialRound?: string;
    presentationDocument?: PitchDocument[];
    supportingDocuments?: PitchDocument[];
    presentationText?: any;
    presentationPlainText?: string; // a text-only version of the presentationText which is a Quill object

    /**
     * This field is only available for QIB
     */
    qibSpecialNews?: string;
}

/**
 * Project - pledge interface
 */
export interface ProjectPledge {
    expiredDate: number;
    status: number;
    extraNotes?: string;
    postMoneyValuation?: number;
}

/**
 * Project reject feedback
 */
export interface ProjectRejectFeedback {
    projectID: string;
    sentBy: string;
    date: number;
    feedback: string;
}

/**
 * Project - pitch cover interface
 */
export interface PitchCover {
    fileExtension: string;
    fileType: number;
    storageID: number;
    url: string;
    removed?: boolean;
}

/**
 * Project - pitch document interface
 */
export interface PitchDocument {
    fileName: string;
    readableSize: string;
    storageID: number;
    downloadURL: string;
    removed?: boolean;
    description?: string;
}

/**
 * Check if a project is live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectLive = (project: Project) => {
    return isProjectInLivePitchPhase(project) || isProjectInLivePledgePhase(project);
};

/**
 * Check if a project is a draft
 *
 * @param project
 * @returns {boolean}
 */
export const isDraftProject = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_DRAFT;
};

/**
 * Check if a draft project to submitted to the group admin for review
 *
 * @param project
 */
export const isDraftProjectNotSubmitted = (project: Project) => {
    return isDraftProject(project) && project.Pitch.status === DB_CONST.PROJECT_STATUS_DRAFT;
}

/**
 * Check if a project is waiting to go live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectWaitingToGoLive = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED;
};

/**
 * Check if a project is rejected to go live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectRejectedToGoLive = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_REJECTED;
};

/**
 * Check if a project is in live pitch phase
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectInLivePitchPhase = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE
        && project.Pitch.status === DB_CONST.PITCH_STATUS_ON_GOING;
};

/**
 * Check if the pitch has expired and waiting for admin to make decision
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectPitchExpiredWaitingForAdminToCheck = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
        && project.Pitch.status === DB_CONST.PITCH_STATUS_WAITING_FOR_ADMIN;
};

/**
 * Check if a project has been moved to pledge phase and waiting for the pledge page to be created
 *
 * @param project
 * @returns {boolean|boolean}
 */
export const isProjectWaitingForPledgeToBeCreated = (project: Project) => {
    return (project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
            && project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        )
        || (
            project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE
            && project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        );
}

/**
 * Check if a project's pledge is waiting to be checked
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectWaitingForPledgeToBeChecked = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED;
}

/**
 * Check if a project is in live pledge phase
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectInLivePledgePhase = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE;
};

/**
 * Check if a project has ended with at least 1 pledge
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectSuccessful = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_SUCCESSFUL;
};

/**
 * Check if a project has ended with no pledges
 * @param project
 * @returns {boolean}
 */
export const isProjectFailed = (project: Project) => {
    return project.status === DB_CONST.PROJECT_STATUS_FAILED;
};

/**
 * Check if a project is temporarily closed
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectTemporarilyClosed = (project: Project) => {
    return project.temporarilyClosed !== undefined && project.temporarilyClosed;
};

/**
 * Check if a project has reject feedbacks
 *
 * @param projectInstance
 */
export const doesProjectHaveRejectFeedbacks = (projectInstance: ProjectInstance) => {
    return projectInstance.rejectFeedbacks.length > 0;
}

/**
 * Check if a project is created by an admin
 *
 * @param project
 */
export const isProjectCreatedByGroupAdmin = (project: Project) => {
    return project.createdByGroupAdmin !== undefined && project.createdByGroupAdmin !== null;
}

/**
 * Set a project to draft
 *
 * @param project
 */
export const setProjectToDraft = (project: Project): Project => {
    project.Pitch.status = DB_CONST.PITCH_STATUS_ON_GOING;
    project.status = DB_CONST.PROJECT_STATUS_DRAFT;
    return project;
}

export const getPitchCover = (project: Project) => {
    if (project.Pitch.cover === undefined) {
        return null;
    }
    const index = project.Pitch.cover.findIndex(cover => cover.removed === undefined || !cover.removed);
    if (index === -1) {
        return null;
    }
    return project.Pitch.cover[index];
}

export const isImagePitchCover = (pitchCover: PitchCover) => {
    return pitchCover.fileType === FILE_TYPE_IMAGE;
}

export const isVideoPitchCover = (pitchCover: PitchCover) => {
    return pitchCover.fileType === FILE_TYPE_VIDEO;
}

export const isProjectPublic = (project: Project) => {
    return project.visibility === PROJECT_VISIBILITY_PUBLIC;
}

export const isProjectRestricted = (project: Project) => {
    return project.visibility === PROJECT_VISIBILITY_RESTRICTED;
}

export const isProjectPrivate = (project: Project) => {
    return project.visibility === PROJECT_VISIBILITY_PRIVATE;
}

/**
 * Should hide project information from a user
 *
 * --> true: hide
 * --> false: not hide
 *
 * @param user
 * @param groupsOfMembership
 * @param project
 */
export const shouldHideProjectInformationFromUser = (user: User | Admin, groupsOfMembership: GroupOfMembership[], project: Project) => {
    const admin: Admin | null = isAdmin(user);
    // user is an admin
    if (admin) {
        // user is a super admin
        if (admin.superAdmin) {
            return false;
        }

        // user is a group admin and is the group that owns the project
        if (admin.anid === project.anid) {
            return false;
        }

        // other group admins must go through the checks of project's visibility
        switch (project.visibility) {
            case PROJECT_VISIBILITY_PUBLIC:
                return false;
            case PROJECT_VISIBILITY_RESTRICTED:
                return true;
            case PROJECT_VISIBILITY_PRIVATE:
                return true;
            default:
                return true;
        }
    }
    // user is not an admin
    else {
        // should not hide any information if the user is an issuer that created this offer
        if (isIssuer(user) && user.id === project.issuerID) {
            return false;
        }

        // user is a member of the group that owns this offer
        if (groupsOfMembership.findIndex(groupOfMembership => groupOfMembership.group.anid === project.anid) !== -1) {
            return false;
        }

        // other group admins must go through the checks of project's visibility
        switch (project.visibility) {
            case PROJECT_VISIBILITY_PUBLIC:
                return false;
            case PROJECT_VISIBILITY_RESTRICTED:
                return true;
            case PROJECT_VISIBILITY_PRIVATE:
                return true;
            default:
                return true;
        }
    }
}

/**
 * Check if a user is the owner of a project
 *
 * @param user
 * @param project
 */
export const isProjectOwner = (user: User | Admin, project: Project) => {
    const admin: Admin | null = isAdmin(user);
    // super admin does not own a project
    if (admin && admin.superAdmin) {
        return false;
    }

    if (admin) {
        return admin.anid === project.anid;
    } else {
        return user?.id === project.issuerID;
    }
}