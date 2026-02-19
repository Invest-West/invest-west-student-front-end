import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';

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

class CourseAdminInviteRepository {
  /**
   * Request admin access for an email (super admin only)
   *
   * @param data - Request data containing email, universityId, and optional role
   */
  public async requestAdminAccess(data: RequestAdminAccessData) {
    return await apiClient.post(ApiRoutes.requestAdminAccessRoute, data);
  }

  /**
   * Validate a course admin invite token (public)
   *
   * @param token - The invite token
   */
  public async validateCourseAdminInvite(token: string) {
    return await apiClient.get(ApiRoutes.validateCourseAdminInviteRoute.replace(':token', token));
  }

  /**
   * Complete course admin signup (public)
   *
   * @param data - Signup data
   */
  public async completeCourseAdminSignup(data: CourseAdminSignupData) {
    return await apiClient.post(ApiRoutes.completeCourseAdminSignupRoute, data);
  }

  /**
   * Validate an upgrade request (auth required)
   *
   * @param requestId - The upgrade request ID
   */
  public async validateUpgradeRequest(requestId: string) {
    return await apiClient.get(
      ApiRoutes.validateUpgradeRequestRoute.replace(':requestId', requestId)
    );
  }

  /**
   * Respond to an upgrade request (auth required)
   *
   * @param data - Response data containing requestId and action
   */
  public async respondToUpgradeRequest(data: UpgradeResponseData) {
    return await apiClient.post(ApiRoutes.respondToUpgradeRequestRoute, data);
  }

  /**
   * Get pending upgrade requests for the current user (auth required)
   */
  public async getMyUpgradeRequests() {
    return await apiClient.get(ApiRoutes.getMyUpgradeRequestsRoute);
  }
}

export { CourseAdminInviteRepository };
export default new CourseAdminInviteRepository();
