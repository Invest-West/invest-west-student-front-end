import Api, {ApiRoutes} from "../Api";
import {SystemAttributes} from "../../models/system_attributes";

export default class SystemAttributesRepository {

    /**
     * Fetch system attributes
     */
    public async getSystemAttributes() {
        return await new Api()
            .request("get", ApiRoutes.retrieveSystemAttributesRoute);
    }

    /**
     * Update system attributes
     */
    public async updateSystemAttributes(systemAttributes: SystemAttributes) {
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateSystemAttributesRoute,
                {
                    requestBody: systemAttributes,
                    queryParameters: null
                }
            );
    }
}