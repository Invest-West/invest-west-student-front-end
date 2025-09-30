/**
 * Course URL conversion utilities
 *
 * Handles the mapping between URL-friendly course names (kebab-case)
 * and actual course display names (Title Case with spaces)
 */

/**
 * Convert a display name to a URL-friendly format
 * "History MSc" -> "history-msc"
 * "Student Showcase" -> "student-showcase"
 */
export const courseDisplayNameToUrlName = (displayName: string): string => {
    return displayName
        .toLowerCase()
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters except hyphens
};

/**
 * Convert a URL-friendly name to display name format
 * "history-msc" -> "History MSc"
 * "student-showcase" -> "Student Showcase"
 */
export const courseUrlNameToDisplayName = (urlName: string): string => {
    return urlName
        .split('-')
        .map(word => {
            // Handle special cases like MSc, PhD, etc.
            if (word.toLowerCase() === 'msc') return 'MSc';
            if (word.toLowerCase() === 'phd') return 'PhD';
            if (word.toLowerCase() === 'bsc') return 'BSc';
            if (word.toLowerCase() === 'ba') return 'BA';
            if (word.toLowerCase() === 'ma') return 'MA';

            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};

/**
 * Find a course display name from available courses that matches the URL name
 * @param urlName - The URL-friendly course name (e.g., "history-msc")
 * @param availableCourses - Array of available course display names
 * @returns The matching course display name or null if not found
 */
export const findCourseDisplayNameByUrl = (urlName: string, availableCourses: string[]): string | null => {
    if (!urlName || !availableCourses) return null;

    // First, try exact match by converting display names to URL names
    const matchingCourse = availableCourses.find(course =>
        courseDisplayNameToUrlName(course) === urlName.toLowerCase()
    );

    if (matchingCourse) {
        return matchingCourse;
    }

    // If no exact match, try case-insensitive search with normalization
    const normalizedUrl = urlName.toLowerCase().trim();
    return availableCourses.find(course => {
        const courseUrlName = courseDisplayNameToUrlName(course);
        return courseUrlName === normalizedUrl;
    }) || null;
};

/**
 * Validate if a course URL name exists in the available courses
 * @param urlName - The URL-friendly course name
 * @param availableCourses - Array of available course display names
 * @returns true if the course exists, false otherwise
 */
export const validateCourseUrlName = (urlName: string, availableCourses: string[]): boolean => {
    return findCourseDisplayNameByUrl(urlName, availableCourses) !== null;
};

/**
 * Get all available course URL names from display names
 * @param availableCourses - Array of available course display names
 * @returns Array of URL-friendly course names
 */
export const getAvailableCourseUrlNames = (availableCourses: string[]): string[] => {
    return availableCourses.map(courseDisplayNameToUrlName);
};

/**
 * Course object interface
 */
export interface CourseObject {
    anid: string;
    displayName: string;
    courseUserName: string;
    description: string;
    isDefault: boolean;
    status: number;
    dateAdded: number;
}

/**
 * Generate a unique course ANID
 * @returns Unique course identifier
 */
export const generateCourseAnid = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `course_${timestamp}_${random}`;
};

/**
 * Create a course object with all required fields
 * @param displayName - Human-readable course name
 * @param description - Course description
 * @param isDefault - Whether this is the default course
 * @returns Complete course object
 */
export const createCourseObject = (displayName: string, description: string = '', isDefault: boolean = false): CourseObject => {
    return {
        anid: generateCourseAnid(),
        displayName,
        courseUserName: courseDisplayNameToUrlName(displayName),
        description,
        isDefault,
        status: 1, // Active
        dateAdded: Date.now()
    };
};

/**
 * Convert existing availableCourses array to new courses structure
 * @param availableCourses - Array of course display names
 * @returns Courses object with courseUserName keys
 */
export const convertAvailableCoursesToStructured = (availableCourses: string[] = []): Record<string, CourseObject> => {
    const courses: Record<string, CourseObject> = {};

    // Always add student-showcase as default
    courses['student-showcase'] = createCourseObject(
        'Student Showcase',
        'Showcase platform for student projects and investment opportunities',
        true
    );

    // Add existing courses
    availableCourses.forEach(courseName => {
        if (courseName && courseName !== 'Student Showcase') {
            const courseUserName = courseDisplayNameToUrlName(courseName);
            courses[courseUserName] = createCourseObject(courseName);
        }
    });

    return courses;
};

/**
 * Get default course from courses object
 * @param courses - Courses object
 * @returns Default course or null if not found
 */
export const getDefaultCourse = (courses: Record<string, CourseObject> = {}): CourseObject | null => {
    return Object.values(courses).find(course => course.isDefault) || null;
};

/**
 * Get course by courseUserName
 * @param courses - Courses object
 * @param courseUserName - URL-safe course name
 * @returns Course object or null if not found
 */
export const getCourseByUserName = (courses: Record<string, CourseObject> = {}, courseUserName: string): CourseObject | null => {
    return courses[courseUserName] || null;
};