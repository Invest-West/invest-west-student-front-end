/**
 * User interface
 *
 * "none" means this user profile doesn't actually exist
 */
import {TYPE_INVESTOR, TYPE_ISSUER} from "../firebase/databaseConsts";
import Admin from "./admin";
import Address from "./address";

export const UserTitles = ["Ms.", "Mrs.", "Miss", "Mr.", "Mx", "Dr.", "Prof."];
export const HearAbout = ["Google", "Newsletter", "Linkedin", "Event"];

export default interface User {
    id: string | "none";
    email: string;
    linkedin?: string;
    firstName: string | "none";
    lastName: string | "none";
    title: string | "none";
    discover: string | "none";
    course?: string;
    company?: string; // investor company
    companyName?: string; // investor company name
    description?: string; // investor description
    profilePicture?: ProfileImage[];
    BusinessProfile?: BusinessProfile;
    type: number;
    lastLoginDate?: number; // timestamp when user last logged in
    registrationDate?: number; // timestamp when user first registered/created account
}

export interface BusinessProfile {
    companyName: string;
    companyWebsite: string;
    sector: string;
    university: string;
    course?: string; // Optional specific course within the university
    logo: ProfileImage[];
    video?: ProfileVideo[];
}

export interface ProfileImage {
    storageID: number;
    url: string;
    removed?: boolean;
}

export interface ProfileVideo {
    storageID: number;
    dateUploaded: number;
    url: string;
    removed?: boolean;
}

export const isIssuer = (user: User | Admin) => {
    return user.type === TYPE_ISSUER;
}

export const isInvestor = (user: User | Admin) => {
    return user.type === TYPE_INVESTOR;
}

export const hasBusinessProfile = (user: User) => {
    return user.BusinessProfile !== undefined;
}

export const getProfilePicture = (user: User): string | null => {
    if (!user.profilePicture) {
        return null;
    }

    const index: number = user.profilePicture.findIndex((profilePicture: ProfileImage) =>
        profilePicture.removed === undefined);

    if (index === -1) {
        return null;
    }
    return user.profilePicture[index].url;
}