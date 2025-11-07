/**
 * Admin Access Request interface
 *
 * --> Allows normal admins to request admin access for users (upgrade existing or invite new)
 * --> Super admins review and action these requests
 */
import Admin from "./admin";
import GroupProperties from "./group_properties";
import User from "./user";

export default interface AdminAccessRequest {
    id: string;
    requestedBy: string;          // Admin user ID who made the request
    requestedEmail: string;        // Email of the user to upgrade or invite
    requestType: "upgrade" | "invite";  // upgrade existing user OR invite new user
    groupId: string;               // Course/group anid where admin access is requested
    reason?: string;               // Optional justification for the request
    status: "pending" | "approved" | "rejected";
    requestedDate: number;         // Timestamp when request was created

    // Approval information (if approved)
    approvalInfo?: {
        approvedBy: string;        // Super admin who approved
        approvedDate: number;      // Timestamp when approved
    };

    // Rejection feedback (if rejected)
    rejectionFeedback?: {
        rejectedBy: string;        // Super admin who rejected
        rejectedDate: number;      // Timestamp when rejected
        reason: string;            // Reason for rejection
    };
}

export interface AdminAccessRequestInstance {
    request: AdminAccessRequest;
    requester: Admin;              // The admin who made the request
    group: GroupProperties;        // The course/group where access is requested
    requestedUser?: User | Admin;  // The user if they already exist in the system
}
