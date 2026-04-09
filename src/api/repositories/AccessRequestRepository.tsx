import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';

export interface FetchAccessRequestsOptions {
  user?: string;
  group?: string;
  orderBy: 'user' | 'group';
}

class AccessRequestRepository {
  /**
   * Fetch access requests
   */
  public async fetchAccessRequests(options?: FetchAccessRequestsOptions) {
    return await apiClient.get(ApiRoutes.listAccessRequestsRoute, { params: options });
  }

  /**
   * Create access request
   *
   * @param userID
   * @param groupID
   */
  public async createAccessRequest(userID: string, groupID: string) {
    return await apiClient.post(ApiRoutes.createAccessRequestRoute, { userID, groupID });
  }

  /**
   * Remove access request
   *
   * @param requestID
   */
  public async removeAccessRequest(requestID: string) {
    return await apiClient.delete(ApiRoutes.removeAccessRequestRoute, { data: { requestID } });
  }
}

export { AccessRequestRepository };
export default new AccessRequestRepository();
