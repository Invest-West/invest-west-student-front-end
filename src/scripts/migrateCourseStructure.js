/**
 * Migration script to update the invest-west group with proper course structure
 * Run this once to update your database
 */

import firebase from '../firebase/firebaseApp';
import * as DB_CONST from '../firebase/databaseConsts';
import { convertAvailableCoursesToStructured } from '../utils/courseUtils';

const migrateCourseStructure = async () => {
    try {        
        // Get the invest-west group
        const groupRef = firebase.database().ref(DB_CONST.GROUP_PROPERTIES_CHILD);
        const snapshot = await groupRef.orderByChild('groupUserName').equalTo('invest-west').once('value');
        
        if (!snapshot.exists()) {
            console.error('invest-west group not found!');
            return;
        }
        
        let investWestKey = null;
        let investWestData = null;
        
        snapshot.forEach(childSnapshot => {
            investWestKey = childSnapshot.key;
            investWestData = childSnapshot.val();
            return true; // Exit forEach loop
        });
        
        if (!investWestKey || !investWestData) {
            console.error('Could not retrieve invest-west group data');
            return;
        }
        
        // Convert existing availableCourses to new structure
        const structuredCourses = convertAvailableCoursesToStructured(investWestData.availableCourses || []);
                
        // Update the database
        const updates = {
            [`${DB_CONST.GROUP_PROPERTIES_CHILD}/${investWestKey}/courses`]: structuredCourses
        };
        
        await firebase.database().ref().update(updates);
        
        Object.entries(structuredCourses).forEach(([courseUserName, course]) => {
            console.log(`  - ${course.displayName} (${courseUserName}) - ${course.isDefault ? 'DEFAULT' : 'REGULAR'}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
};

// Export for use in other scripts or components
export default migrateCourseStructure;

// If running directly (for testing)
if (typeof window !== 'undefined' && window.location.search.includes('migrate=true')) {
    migrateCourseStructure();
}