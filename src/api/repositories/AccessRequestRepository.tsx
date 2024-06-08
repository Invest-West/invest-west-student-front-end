import Api, {ApiRoutes} from "../Api";

export interface FetchAccessRequestsOptions {
    user?: string;
    group?: string;
    orderBy: "user" | "group";
}

export default class AccessRequestRepository {

    /**
     * Fetch access requests
     */
    public async fetchAccessRequests(options?: FetchAccessRequestsOptions) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listAccessRequestsRoute,
                {
                    requestBody: null,
                    queryParameters: options ?? null
                }
            );
    }

    /**
     * Create access request
     *
     * @param userID
     * @param groupID
     */
    public async createAccessRequest(userID: string, groupID: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        userID,
                        groupID
                    }
                }
            );
    }

    /**
     * Remove access request
     *
     * @param requestID
     */
    public async removeAccessRequest(requestID: string) {
        return await new Api()
            .request(
                "delete",
                ApiRoutes.removeAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestID
                    }
                }
            );
    }
}