/**
 * Invited user interface
 */
import User from "./user";
import GroupProperties from "./group_properties";
import Project from "./project";
import InvestorSelfCertification from "./investor_self_certification";
import GroupOfMembership from "./group_of_membership";
import Pledge from "./pledge";

export default interface InvitedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    type: number;
    status: number;

    /**
     * id of the group that the user is in
     */
    invitedBy: string;

    /**
     * can be number (date in milliseconds) or string ("none")
     *
     * --> date (milliseconds):
     *      - indicates the date an unregistered user was invited by [invitedBy] group.
     *          --> [requestedToJoin] = false and [requestedToJoinDate] = "none"
     *
     *      - indicates the date an unregistered user used PUBLIC URL to registered to [invitedBy] group
     *          --> [requestedToJoin] = false and [requestedToJoinDate] = date in milliseconds
     *
     * --> "none": the user who requested to join the [invitedBy] group from their home group
     */
    invitedDate: number | "none";

    /**
     * this field only exists when the user is a registered user and [officialUserID] must map to a valid User profile
     */
    officialUserID?: string;

    /**
     * the date the user joined a group either
     *
     * - by invitation (an unregistered user was invited by a group admin)
     *
     * - or by registering via the PUBLIC URL (an unregistered registered to group a group via its public url)
     *
     * - or by requesting to access (the user must send a request access which has to be accepted by the group admins)
     */
    joinedDate?: number;

    /**
     * can be true or false
     *
     * --> true: the user to requested to join a group from their home group
     *
     * --> false: the other cases specified above
     */
    requestedToJoin?: boolean;

    /**
     * can be number (date in milliseconds) or string ("none")
     *
     * --> date (milliseconds): the user to requested to join a group from their home group or registered to a group
     * via its PUBLIC URL
     *
     * --> "none": the user was invited to a group
     */
    requestedToJoinDate?: number | "none";
}

/**
 * Invited user with official profile
 */
export interface InvitedUserWithProfile extends InvitedUser {
    profile?: User;
    homeGroup: GroupProperties;
    groupsOfMembership: GroupOfMembership[];
    offersCreated?: Project[]; // for issuers
    pledges?: Pledge[]; // for investors
    certification?: InvestorSelfCertification | null; // self-certification of investors (undefined: user is an issuer, null: an investor has not certified)
}

/**
 * An interface that specifies the format of a user in csv
 */
export interface InvitedUserCsv {
    name: string; // user's official profile --> title + first name + last name
    email: string;
    userType: "investor" | "issuer";
    memberType: "home" | "platform";
    homeGroup?: string; // specified only when exporting to csv for super admins
    statusInGroup: "unregistered" | "active"; // this list will be expanded more in the future
    joinedDate: string | undefined;
    offersCreated: string | "none" | "not applicable"; // none if the issuer has not created any offers, not applicable if the user is not an issuer
    pledges: number | "not applicable"; // number of pledges for investor, not applicable if the user is not an issuer
    certifiedDate: string | "not certified" | "not applicable";
}

/**
 * Check if an invited user a home member in a group
 *
 * @param user
 */
export const isHomeMember = (user: InvitedUser | InvitedUserWithProfile) => {
    // if either of these 2 fields is undefined, it means the invited user has been invited
    // by a group and not yet registered
    if (user.requestedToJoin === undefined || user.requestedToJoinDate === undefined) {
        return true;
    }

    // user was invited
    if (user.invitedDate !== "none" && !user.requestedToJoin && user.requestedToJoinDate === "none") {
        return true;
    }

    // user registered via the public url
    if (user.invitedDate !== "none" && !user.requestedToJoin && user.requestedToJoinDate !== "none") {
        return true;
    }

    // in other cases, the user is not a home member of the group
    return false;
}

/**
 * Check if an invited user has registered or not
 *
 * @param user
 */
export const hasRegistered = (user: InvitedUser | InvitedUserWithProfile) => {
    return user.officialUserID !== undefined;
}