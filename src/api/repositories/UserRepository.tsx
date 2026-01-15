import User, {ProfileImage, ProfileVideo} from "../../models/user";
import Api, {ApiRoutes} from "../Api";

export interface UpdateUserData {
    updatedUser: User;
    newProfilePicture?: ProfileImage;
    newLogo?: ProfileImage;
    newVideo?: ProfileVideo;
    removeProfilePicture?: true;
}

export interface SignUpData {
    isPublicRegistration: boolean;
    invitedUserID?: string;
    userProfile: Partial<User>;
    password: string;
    groupID: string;
    discover: string;
    acceptMarketingPreferences: boolean;
    courseUserName?: string;
}

    export default class UserRepository {

    /**
     * Sign up
     *
     * @param data
     */
    public async signUp(data: SignUpData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createUser,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * Retrieve user
     *
     * @param uid
     */
    public async retrieveUser(uid: string) {
        return await new Api().request("get",
            ApiRoutes.retrieveUser.replace(":uid", uid));
    }

    /**
     * Retrieve invited user
     *
     * @param invitedUserID
     */
    public async retrieveInvitedUser(invitedUserID: string) {
        return await new Api().request("get",
            ApiRoutes.retrieveInvitedUser.replace(":invitedUserID", invitedUserID));
    }

    /**
     * Update user
     *
     * @param data
     */
    public async updateUser(data: UpdateUserData) {
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateUser,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * List groups of membership
     *
     * @param uid
     */
    public async listGroupsOfMembership(uid: string) {
        return await new Api().request("get",
            ApiRoutes.listGroupsOfMembership.replace(":uid", uid));
    }
}