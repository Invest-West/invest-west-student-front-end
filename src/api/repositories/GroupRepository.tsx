import apiClient from '../apiClient';
import { ApiRoutes } from '../Api';
import firebase from '../../firebase/firebaseApp';
import { GROUP_STATUS_ACTIVE, COURSES_CHILD } from '../../firebase/databaseConsts';
import GroupProperties from '../../models/group_properties';

export interface FetchGroupsParams {
  groupIds?: string[];
  name?: string;
}

class GroupRepository {
  /**
   * Get group
   *
   * @param groupUserName
   */
  public async getGroup(groupUserName: string) {
    return await apiClient.get(ApiRoutes.retrieveGroup.replace(':groupUserName', groupUserName));
  }

  /**
   * Fetch courses for a parent group (university)
   * Queries Firebase directly for courses with matching parentGroupId from the Courses node
   *
   * @param parentGroupId - The ID of the parent university group
   * @returns Promise<GroupProperties[]> - Array of course groups
   */
  public async fetchCoursesByParentGroup(parentGroupId: string): Promise<GroupProperties[]> {
    const coursesSnapshot = await firebase
      .database()
      .ref(COURSES_CHILD)
      .orderByChild('parentGroupId')
      .equalTo(parentGroupId)
      .once('value');

    if (!coursesSnapshot.exists()) {
      return [];
    }

    const courses: GroupProperties[] = [];
    coursesSnapshot.forEach((courseSnapshot) => {
      const courseData = courseSnapshot.val();
      if (courseData.groupType === 'course' && courseData.status === GROUP_STATUS_ACTIVE) {
        courses.push(courseData);
      }
    });

    return courses;
  }

  /**
   * Get a specific course by its groupUserName from the Courses node
   *
   * @param courseUserName - The groupUserName of the course
   * @returns Promise<GroupProperties | null>
   */
  public async getCourseByUserName(courseUserName: string): Promise<GroupProperties | null> {
    const courseSnapshot = await firebase
      .database()
      .ref(COURSES_CHILD)
      .orderByChild('groupUserName')
      .equalTo(courseUserName)
      .limitToFirst(1)
      .once('value');

    if (!courseSnapshot.exists()) {
      return null;
    }

    let course: GroupProperties | null = null;
    courseSnapshot.forEach((snapshot) => {
      course = snapshot.val();
    });

    return course;
  }

  /**
   * Get a specific course by parent group ID and course slug
   *
   * @param parentGroupId - The ID of the parent university
   * @param courseSlug - The groupUserName/slug of the course
   * @returns Promise<GroupProperties | null>
   */
  public async getCourseByParentAndSlug(
    parentGroupId: string,
    courseSlug: string
  ): Promise<GroupProperties | null> {
    const coursesSnapshot = await firebase
      .database()
      .ref(COURSES_CHILD)
      .orderByChild('parentGroupId')
      .equalTo(parentGroupId)
      .once('value');

    if (!coursesSnapshot.exists()) {
      return null;
    }

    let matchingCourse: GroupProperties | null = null;
    coursesSnapshot.forEach((snapshot) => {
      const course = snapshot.val() as GroupProperties;
      if (course.groupUserName === courseSlug && snapshot.key) {
        matchingCourse = { ...course, anid: snapshot.key };
        return true; // Stop iteration
      }
      return false; // Continue iteration
    });

    return matchingCourse;
  }

  /**
   * Fetch groups
   *
   * @param params
   */
  public async fetchGroups(params?: FetchGroupsParams) {
    return await apiClient.get(ApiRoutes.listGroups, { params });
  }

  /**
   * Fetch group members
   *
   * @param groupID
   */
  public async fetchGroupMembers(groupID: string | 'system') {
    return await apiClient.get(ApiRoutes.listGroupMembers.replace(':group', groupID));
  }

  /**
   * Update university/group logo (system admin only)
   *
   * @param groupUserName
   * @param imageUrl
   */
  public async updateGroupLogo(groupUserName: string, imageUrl: string) {
    return await apiClient.put(ApiRoutes.updateGroupLogo.replace(':groupUserName', groupUserName), {
      imageUrl,
    });
  }

  /**
   * Update university name (super admin or super group admin only)
   *
   * @param groupUserName - University groupUserName
   * @param newName - New university name
   */
  public async updateUniversityName(groupUserName: string, newName: string) {
    return await apiClient.put(
      ApiRoutes.updateUniversityName.replace(':groupUserName', groupUserName),
      { newName }
    );
  }

  /**
   * Update course image (system admin only)
   *
   * @param groupUserName - University groupUserName
   * @param courseUserName - Course groupUserName
   * @param imageUrl
   */
  public async updateCourseImage(groupUserName: string, courseUserName: string, imageUrl: string) {
    return await apiClient.put(
      ApiRoutes.updateCourseImage
        .replace(':groupUserName', groupUserName)
        .replace(':courseUserName', courseUserName),
      { imageUrl }
    );
  }

  /**
   * Update course name (system admin only)
   *
   * @param groupUserName - University groupUserName
   * @param courseUserName - Course groupUserName
   * @param newName - New course name
   */
  public async updateCourseName(groupUserName: string, courseUserName: string, newName: string) {
    return await apiClient.put(
      ApiRoutes.updateCourseName
        .replace(':groupUserName', groupUserName)
        .replace(':courseUserName', courseUserName),
      { newName }
    );
  }

  /**
   * Delete a university (super admin only)
   *
   * @param groupUserName - University groupUserName
   */
  public async deleteUniversity(groupUserName: string) {
    return await apiClient.delete(
      ApiRoutes.deleteUniversity.replace(':groupUserName', groupUserName)
    );
  }

  /**
   * Delete a course (super admin only)
   *
   * @param groupUserName - University groupUserName
   * @param courseUserName - Course groupUserName
   */
  public async deleteCourse(groupUserName: string, courseUserName: string) {
    return await apiClient.delete(
      ApiRoutes.deleteCourse
        .replace(':groupUserName', groupUserName)
        .replace(':courseUserName', courseUserName)
    );
  }
}

export { GroupRepository };
export default new GroupRepository();
