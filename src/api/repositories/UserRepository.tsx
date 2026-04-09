import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';
import User, { ProfileImage, ProfileVideo } from '../../models/user';

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

class UserRepository {
  /**
   * Sign up
   *
   * @param data
   */
  public async signUp(data: SignUpData) {
    return await apiClient.post(ApiRoutes.createUser, data);
  }

  /**
   * Retrieve user
   *
   * @param uid
   */
  public async retrieveUser(uid: string) {
    return await apiClient.get(ApiRoutes.retrieveUser.replace(':uid', uid));
  }

  /**
   * Retrieve invited user
   *
   * @param invitedUserID
   */
  public async retrieveInvitedUser(invitedUserID: string) {
    return await apiClient.get(
      ApiRoutes.retrieveInvitedUser.replace(':invitedUserID', invitedUserID)
    );
  }

  /**
   * Invite student - creates Firebase Auth account, Users record, InvitedUsers record, sends email with password
   *
   * @param data
   */
  public async inviteStudent(data: {
    email: string;
    userType: number;
    groupID: string;
    groupDisplayName: string;
    groupUserName: string;
    groupLogo: string;
  }) {
    return await apiClient.post(ApiRoutes.inviteStudentRoute, data);
  }

  /**
   * Update user
   *
   * @param data
   */
  public async updateUser(data: UpdateUserData) {
    return await apiClient.put(ApiRoutes.updateUser, data);
  }

  /**
   * List groups of membership
   *
   * @param uid
   */
  public async listGroupsOfMembership(uid: string) {
    return await apiClient.get(ApiRoutes.listGroupsOfMembership.replace(':uid', uid));
  }
}

export { UserRepository };
export default new UserRepository();
