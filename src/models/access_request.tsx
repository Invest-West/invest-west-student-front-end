/**
 * Access request interface
 *
 * --> User requests to access a group
 */
import User from "./user";
import GroupProperties from "./group_properties";

export default interface AccessRequest {
    id: string;
    userID: string;
    groupToJoin: string;
    requestedDate: number;
}

export interface AccessRequestInstance {
    request: AccessRequest;
    user: User;
    group: GroupProperties;
}