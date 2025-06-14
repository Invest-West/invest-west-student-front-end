/**
 * Admin interface
 */
import User from "./user";

export default interface Admin {
    id: string;
    anid: string;
    email: string;
    superAdmin: boolean;
    superGroupAdmin: boolean;
    type: number;
    isInvestWest: boolean;
    dateAdded?: number; // superAdmin doesn't have this field
    lastLoginDate?: number; // timestamp when admin last logged in
}

/**
 * Check if a user is an admin
 *
 * @param user
 */
export const isAdmin = (user: User | Admin): Admin | null => {
    if (user && "anid" in user) {
        return JSON.parse(JSON.stringify(user));
    }
    return null;
}