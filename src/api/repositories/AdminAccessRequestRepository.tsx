import Api, {ApiRoutes} from "../Api";

export interface FetchAdminAccessRequestsOptions {
    requestedBy?: string;
    groupId?: string;
    status?: "pending" | "approved" | "rejected";
    requestedEmail?: string;
}

export default class AdminAccessRequestRepository {

    /**
     * Fetch admin access requests
     */
    public async fetchAdminAccessRequests(options?: FetchAdminAccessRequestsOptions) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listAdminAccessRequestsRoute,
                {
                    requestBody: null,
                    queryParameters: options ?? null
                }
            );
    }

    /**
     * Create admin access request
     *
     * @param requestedEmail
     * @param groupId
     * @param reason
     */
    public async createAdminAccessRequest(requestedEmail: string, groupId: string, reason?: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createAdminAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestedEmail,
                        groupId,
                        reason
                    }
                }
            );
    }

    /**
     * Approve admin access request
     *
     * @param requestId
     */
    public async approveAdminAccessRequest(requestId: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.approveAdminAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestId
                    }
                }
            );
    }

    /**
     * Reject admin access request
     *
     * @param requestId
     * @param reason
     */
    public async rejectAdminAccessRequest(requestId: string, reason: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.rejectAdminAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestId,
                        reason
                    }
                }
            );
    }
}
