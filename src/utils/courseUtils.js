/**
 * Utility functions for handling course data and URL conversion
 */

/**
 * Convert a course display name to a URL-safe courseUserName
 * @param {string} displayName - The human-readable course name
 * @returns {string} URL-safe course name with hyphens
 */
export const convertToCourseUserName = (displayName) => {
    if (!displayName) return '';
    
    return displayName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique course ANID
 * @returns {string} Unique course identifier
 */
export const generateCourseAnid = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `course_${timestamp}_${random}`;
};

/**
 * Create a course object with all required fields
 * @param {string} displayName - Human-readable course name
 * @param {string} description - Course description
 * @param {boolean} isDefault - Whether this is the default course
 * @returns {object} Complete course object
 */
export const createCourseObject = (displayName, description = '', isDefault = false) => {
    return {
        anid: generateCourseAnid(),
        displayName,
        courseUserName: convertToCourseUserName(displayName),
        description,
        isDefault,
        status: 1, // Active
        dateAdded: Date.now()
    };
};

/**
 * Convert existing availableCourses array to new courses structure
 * @param {Array} availableCourses - Array of course display names
 * @returns {object} Courses object with courseUserName keys
 */
export const convertAvailableCoursesToStructured = (availableCourses = []) => {
    const courses = {};
    
    // Always add student-showcase as default
    courses['student-showcase'] = createCourseObject(
        'Student Showcase', 
        'Showcase platform for student projects and investment opportunities',
        true
    );
    
    // Add existing courses
    availableCourses.forEach(courseName => {
        if (courseName && courseName !== 'Student Showcase') {
            const courseUserName = convertToCourseUserName(courseName);
            courses[courseUserName] = createCourseObject(courseName);
        }
    });
    
    return courses;
};

/**
 * Get default course from courses object
 * @param {object} courses - Courses object
 * @returns {object|null} Default course or null if not found
 */
export const getDefaultCourse = (courses = {}) => {
    return Object.values(courses).find(course => course.isDefault) || null;
};

/**
 * Get course by courseUserName
 * @param {object} courses - Courses object
 * @param {string} courseUserName - URL-safe course name
 * @returns {object|null} Course object or null if not found
 */
export const getCourseByUserName = (courses = {}, courseUserName) => {
    return courses[courseUserName] || null;
};