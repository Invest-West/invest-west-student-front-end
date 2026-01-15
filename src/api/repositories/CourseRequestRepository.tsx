import Api, {ApiRoutes} from "../Api";

export interface FetchCourseRequestsOptions {
    requestedBy?: string;
    universityId?: string;
    status?: "pending" | "approved" | "rejected";
}

export default class CourseRequestRepository {

    /**
     * Fetch course requests
     */
    public async fetchCourseRequests(options?: FetchCourseRequestsOptions) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listCourseRequestsRoute,
                {
                    requestBody: null,
                    queryParameters: options ?? null
                }
            );
    }

    /**
     * Create course request
     *
     * @param courseName
     * @param universityId
     */
    public async createCourseRequest(courseName: string, universityId: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createCourseRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        courseName,
                        universityId
                    }
                }
            );
    }

    /**
     * Approve course request
     *
     * @param requestId
     */
    public async approveCourseRequest(requestId: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.approveCourseRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestId
                    }
                }
            );
    }

    /**
     * Reject course request
     *
     * @param requestId
     * @param reason
     */
    public async rejectCourseRequest(requestId: string, reason: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.rejectCourseRequestRoute,
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
