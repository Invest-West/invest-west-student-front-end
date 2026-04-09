import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';
import { SystemAttributes } from '../../models/system_attributes';

class SystemAttributesRepository {
  /**
   * Fetch system attributes
   */
  public async getSystemAttributes() {
    return await apiClient.get(ApiRoutes.retrieveSystemAttributesRoute);
  }

  /**
   * Update system attributes
   */
  public async updateSystemAttributes(systemAttributes: SystemAttributes) {
    return await apiClient.put(ApiRoutes.updateSystemAttributesRoute, systemAttributes);
  }
}

export { SystemAttributesRepository };
export default new SystemAttributesRepository();
