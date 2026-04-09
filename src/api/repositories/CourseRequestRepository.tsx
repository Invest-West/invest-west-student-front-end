import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';

export interface FetchCourseRequestsOptions {
  requestedBy?: string;
  universityId?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

class CourseRequestRepository {
  /**
   * Fetch course requests
   */
  public async fetchCourseRequests(options?: FetchCourseRequestsOptions) {
    return await apiClient.get(ApiRoutes.listCourseRequestsRoute, { params: options });
  }

  /**
   * Create course request
   *
   * @param courseName
   * @param universityId
   */
  public async createCourseRequest(courseName: string, universityId: string) {
    return await apiClient.post(ApiRoutes.createCourseRequestRoute, { courseName, universityId });
  }

  /**
   * Approve course request
   *
   * @param requestId
   */
  public async approveCourseRequest(requestId: string) {
    return await apiClient.post(ApiRoutes.approveCourseRequestRoute, { requestId });
  }

  /**
   * Reject course request
   *
   * @param requestId
   * @param reason
   */
  public async rejectCourseRequest(requestId: string, reason: string) {
    return await apiClient.post(ApiRoutes.rejectCourseRequestRoute, { requestId, reason });
  }
}

export { CourseRequestRepository };
export default new CourseRequestRepository();
