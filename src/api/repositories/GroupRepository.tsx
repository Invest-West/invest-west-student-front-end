import Api, {ApiRoutes} from "../Api";
import firebase from "../../firebase/firebaseApp";
import {GROUP_PROPERTIES_CHILD, GROUP_STATUS_ACTIVE, COURSES_CHILD} from "../../firebase/databaseConsts";
import GroupProperties from "../../models/group_properties";

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
     * Fetch courses for a parent group (university)
     * Queries Firebase directly for courses with matching parentGroupId from the Courses node
     *
     * @param parentGroupId - The ID of the parent university group
     * @returns Promise<GroupProperties[]> - Array of course groups
     */
    public async fetchCoursesByParentGroup(parentGroupId: string): Promise<GroupProperties[]> {
        try {
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
                // Only include active courses with groupType='course'
                if (courseData.groupType === 'course' && courseData.status === GROUP_STATUS_ACTIVE) {
                    courses.push(courseData);
                }
            });

            console.log(`[GroupRepository] Fetched ${courses.length} courses for parent group: ${parentGroupId}`);
            return courses;
        } catch (error) {
            console.error('[GroupRepository] Error fetching courses:', error);
            throw error;
        }
    }

    /**
     * Get a specific course by its groupUserName from the Courses node
     *
     * @param courseUserName - The groupUserName of the course
     * @returns Promise<GroupProperties | null>
     */
    public async getCourseByUserName(courseUserName: string): Promise<GroupProperties | null> {
        try {
            const courseSnapshot = await firebase
                .database()
                .ref(COURSES_CHILD)
                .orderByChild('groupUserName')
                .equalTo(courseUserName)
                .limitToFirst(1)
                .once('value');

            if (!courseSnapshot.exists()) {
                console.log(`[GroupRepository] Course not found: ${courseUserName}`);
                return null;
            }

            let course: GroupProperties | null = null;
            courseSnapshot.forEach((snapshot) => {
                course = snapshot.val();
            });

            console.log(`[GroupRepository] Found course: ${courseUserName}`, course);
            return course;
        } catch (error) {
            console.error('[GroupRepository] Error fetching course by username:', error);
            throw error;
        }
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

    /**
     * Update university/group logo (system admin only)
     *
     * @param groupUserName
     * @param imageUrl
     */
    public async updateGroupLogo(groupUserName: string, imageUrl: string) {
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateGroupLogo.replace(":groupUserName", groupUserName),
                {
                    requestBody: { imageUrl },
                    queryParameters: null
                }
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
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateCourseImage
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName),
                {
                    requestBody: { imageUrl },
                    queryParameters: null
                }
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
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateCourseName
                    .replace(":groupUserName", groupUserName)
                    .replace(":courseUserName", courseUserName),
                {
                    requestBody: { newName },
                    queryParameters: null
                }
            );
    }
}