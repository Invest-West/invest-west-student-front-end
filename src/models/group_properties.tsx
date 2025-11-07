/**
 * Group types for hierarchical structure
 */
export enum GroupType {
    UNIVERSITY = 'university',
    COURSE = 'course'
}

/**
 * Group properties interface
 */
export default interface GroupProperties {
    anid: string;
    dateAdded: number;
    description: string;
    displayName: string;
    displayNameLower: string;
    groupUserName: string;
    isInvestWest: boolean;
    status: number;
    website?: string;
    logoWithText?: GroupLogo[];
    plainLogo: GroupLogo[];
    settings: GroupSettings;
    
    // Hierarchical structure properties
    groupType?: GroupType;
    parentGroupId?: string; // For courses, this is the university ID
    subGroups?: string[]; // For universities, array of course IDs
    parentGroup?: GroupProperties; // Populated when loading hierarchical data
    childGroups?: GroupProperties[]; // Populated when loading hierarchical data
    memberCount?: number; // Number of members in this specific group/course
}

/**
 * This should always be returned when a group is queried by an unauthenticated user
 */
export interface PublicGroupProperties {
    description: string;
    displayName: string;
    groupUserName: string;
}

/**
 * Group settings interface
 */
export interface GroupSettings {
    primaryColor: string;
    secondaryColor: string;
    projectVisibility: number;
    makeInvestorsContactDetailsVisibleToIssuers: boolean;
    /**
     * @deprecated Use Firebase course entities instead - query groups with groupType='course' and parentGroupId
     * This field is kept for backward compatibility only and should not be used in new code
     */
    availableCourses?: string[];
    PledgeFAQs?: GroupPledgeFAQ[];
}

/**
 * Group logo interface
 */
export interface GroupLogo {
    storageID: number;
    url: string;
    removed?: boolean;
}

/**
 * Group pledge faq interface
 */
export interface GroupPledgeFAQ {
    id: string;
    question: string;
    answer: string;
}

export const getGroupLogo = (group: GroupProperties | null) => {
    if (!group) {
        return null;
    }
    if (group.plainLogo.length === 0) {
        return null;
    }
    return group.plainLogo[group.plainLogo.findIndex(logo => logo.removed === undefined)].url;
}

/**
 * Check if a group is a university (top-level group)
 */
export const isUniversity = (group: GroupProperties): boolean => {
    return group.groupType === GroupType.UNIVERSITY || (!group.groupType && !group.parentGroupId);
}

/**
 * Check if a group is a course (sub-group)
 */
export const isCourse = (group: GroupProperties): boolean => {
    return group.groupType === GroupType.COURSE || (!group.groupType && !!group.parentGroupId);
}

/**
 * Get all universities from a list of groups
 */
export const getUniversities = (groups: GroupProperties[]): GroupProperties[] => {
    return groups.filter(group => isUniversity(group));
}

/**
 * Get all courses for a specific university
 */
export const getCoursesForUniversity = (groups: GroupProperties[], universityId: string): GroupProperties[] => {
    return groups.filter(group => isCourse(group) && group.parentGroupId === universityId);
}

/**
 * Create a virtual course group from a course name
 */
const createVirtualCourseGroup = (courseName: string, universityId: string, universityUserName: string): GroupProperties | null => {
    // Validate courseName is not null, undefined, or empty
    if (!courseName || typeof courseName !== 'string' || courseName.trim() === '') {
        return null;
    }

    const courseNameLower = courseName.toLowerCase();
    const courseSlug = courseNameLower.replace(/\s+/g, '-');

    return {
        anid: `virtual-course-${universityId}-${courseSlug}`,
        dateAdded: Date.now(),
        description: `${courseName} course`,
        displayName: courseName,
        displayNameLower: courseNameLower,
        groupUserName: `${universityUserName}-${courseSlug}`,
        isInvestWest: false,
        status: 1,
        plainLogo: [],
        settings: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            projectVisibility: 0,
            makeInvestorsContactDetailsVisibleToIssuers: false
        },
        groupType: GroupType.COURSE,
        parentGroupId: universityId
    };
};

/**
 * Build hierarchical structure from flat group list
 */
export const buildHierarchicalGroups = (groups: GroupProperties[]): GroupProperties[] => {
    const universities = getUniversities(groups);
    const groupMap = new Map<string, GroupProperties>();

    // Create a map for quick lookups
    groups.forEach(group => groupMap.set(group.anid, group));

    // Build the hierarchical structure
    universities.forEach(university => {
        const actualCourses = getCoursesForUniversity(groups, university.anid);

        // If there are actual course groups, use them
        if (actualCourses.length > 0) {
            university.childGroups = actualCourses;

            // Set parent reference for courses
            actualCourses.forEach(course => {
                course.parentGroup = university;
            });
        } else {
            // If no actual courses but availableCourses exist, create virtual course groups
            const availableCourses = university.settings?.availableCourses || [];
            if (availableCourses.length > 0) {
                const virtualCourses = availableCourses
                    .map(courseName => createVirtualCourseGroup(courseName, university.anid, university.groupUserName))
                    .filter((course): course is GroupProperties => course !== null);
                university.childGroups = virtualCourses;

                // Set parent reference for virtual courses
                virtualCourses.forEach(course => {
                    course.parentGroup = university;
                });
            } else {
                university.childGroups = [];
            }
        }
    });

    return universities;
}

/**
 * Get the display path for a group (e.g., "University Name > Course Name")
 */
export const getGroupDisplayPath = (group: GroupProperties): string => {
    if (isUniversity(group)) {
        return group.displayName;
    }
    
    if (group.parentGroup) {
        return `${group.parentGroup.displayName} > ${group.displayName}`;
    }
    
    return group.displayName;
}