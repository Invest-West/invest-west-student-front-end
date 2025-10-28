/**
 * Course request interface
 *
 * --> Group admin requests to create a course under their university
 */
import Admin from "./admin";
import GroupProperties from "./group_properties";

export default interface CourseRequest {
    id: string;
    requestedBy: string;        // Group admin user ID who made the request
    universityId: string;        // Parent university anid
    courseName: string;          // Requested course name
    courseUsername: string;      // Auto-generated username
    requestedDate: number;       // Timestamp
    status: "pending" | "approved" | "rejected";

    // Rejection feedback (if rejected)
    rejectionFeedback?: {
        rejectedBy: string;      // Super admin who rejected
        rejectedDate: number;
        reason: string;
    };
}

export interface CourseRequestInstance {
    request: CourseRequest;
    requester: Admin;            // The group admin who made the request
    university: GroupProperties; // The parent university
}
