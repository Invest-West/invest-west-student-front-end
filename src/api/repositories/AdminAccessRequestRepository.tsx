import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';

export interface FetchAdminAccessRequestsOptions {
  requestedBy?: string;
  groupId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestedEmail?: string;
}

class AdminAccessRequestRepository {
  /**
   * Fetch admin access requests
   */
  public async fetchAdminAccessRequests(options?: FetchAdminAccessRequestsOptions) {
    return await apiClient.get(ApiRoutes.listAdminAccessRequestsRoute, { params: options });
  }

  /**
   * Create admin access request
   *
   * @param requestedEmail
   * @param groupId
   * @param reason
   */
  public async createAdminAccessRequest(requestedEmail: string, groupId: string, reason?: string) {
    return await apiClient.post(ApiRoutes.createAdminAccessRequestRoute, {
      requestedEmail,
      groupId,
      reason,
    });
  }

  /**
   * Approve admin access request
   *
   * @param requestId
   */
  public async approveAdminAccessRequest(requestId: string) {
    return await apiClient.post(ApiRoutes.approveAdminAccessRequestRoute, { requestId });
  }

  /**
   * Reject admin access request
   *
   * @param requestId
   * @param reason
   */
  public async rejectAdminAccessRequest(requestId: string, reason: string) {
    return await apiClient.post(ApiRoutes.rejectAdminAccessRequestRoute, { requestId, reason });
  }
}

export { AdminAccessRequestRepository };
export default new AdminAccessRequestRepository();
