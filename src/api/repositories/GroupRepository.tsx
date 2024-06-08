import Api, {ApiRoutes} from "../Api";

export interface FetchGroupsParams {
    groupIds?: string[];
    name?: string;
}

export default class GroupRepository {

    /**
     * Get group
     *
     * @param groupUserName
     */
    public async getGroup(groupUserName: string) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.retrieveGroup.replace(":groupUserName", groupUserName)
            );
    }

    /**
     * Fetch groups
     *
     * @param params
     */
    public async fetchGroups(params?: FetchGroupsParams) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listGroups,
                {
                    requestBody: null,
                    queryParameters: params
                }
            );
    }

    /**
     * Fetch group members
     *
     * @param groupID
     */
    public async fetchGroupMembers(groupID: string | "system") {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listGroupMembers.replace(":group", groupID)
            );
    }
}