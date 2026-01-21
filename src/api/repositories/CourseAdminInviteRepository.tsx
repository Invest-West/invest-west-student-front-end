import Api, {ApiRoutes} from "../Api";

export interface RequestAdminAccessData {
    email: string;
    universityId: string;
    role?: 'admin' | 'lecturer';
}

export interface CourseAdminSignupData {
    token: string;
    title: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface UpgradeResponseData {
    requestId: string;
    action: 'accept' | 'decline';
}

export default class CourseAdminInviteRepository {

    /**
     * Request admin access for an email (super admin only)
     *
     * @param data - Request data containing email, universityId, and optional role
     */
    public async requestAdminAccess(data: RequestAdminAccessData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.requestAdminAccessRoute,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * Validate a course admin invite token (public)
     *
     * @param token - The invite token
     */
    public async validateCourseAdminInvite(token: string) {
        const route = ApiRoutes.validateCourseAdminInviteRoute.replace(':token', token);
        return await new Api()
            .request(
                "get",
                route,
                {
                    queryParameters: null,
                    requestBody: null
                }
            );
    }

    /**
     * Complete course admin signup (public)
     *
     * @param data - Signup data
     */
    public async completeCourseAdminSignup(data: CourseAdminSignupData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.completeCourseAdminSignupRoute,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * Validate an upgrade request (auth required)
     *
     * @param requestId - The upgrade request ID
     */
    public async validateUpgradeRequest(requestId: string) {
        const route = ApiRoutes.validateUpgradeRequestRoute.replace(':requestId', requestId);
        return await new Api()
            .request(
                "get",
                route,
                {
                    queryParameters: null,
                    requestBody: null
                }
            );
    }

    /**
     * Respond to an upgrade request (auth required)
     *
     * @param data - Response data containing requestId and action
     */
    public async respondToUpgradeRequest(data: UpgradeResponseData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.respondToUpgradeRequestRoute,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * Get pending upgrade requests for the current user (auth required)
     */
    public async getMyUpgradeRequests() {
        return await new Api()
            .request(
                "get",
                ApiRoutes.getMyUpgradeRequestsRoute,
                {
                    queryParameters: null,
                    requestBody: null
                }
            );
    }
}
