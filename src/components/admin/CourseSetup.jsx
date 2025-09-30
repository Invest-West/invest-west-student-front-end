import React, { useState } from 'react';
import { Button, Alert, Card, Spinner } from 'react-bootstrap';
import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import { convertAvailableCoursesToStructured } from '../../utils/courseUtils';

/**
 * Temporary component to set up the course structure for invest-west group
 * This can be run once and then removed
 */
const CourseSetup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const setupCourseStructure = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            
            // Get the invest-west group
            const groupRef = firebase.database().ref(DB_CONST.GROUP_PROPERTIES_CHILD);
            const snapshot = await groupRef.orderByChild('groupUserName').equalTo('invest-west').once('value');
            
            if (!snapshot.exists()) {
                throw new Error('invest-west group not found in database');
            }
            
            let investWestKey = null;
            let investWestData = null;
            
            snapshot.forEach(childSnapshot => {
                investWestKey = childSnapshot.key;
                investWestData = childSnapshot.val();
                return true;
            });
            
            if (!investWestKey || !investWestData) {
                throw new Error('Could not retrieve invest-west group data');
            }
            
            
            // Check if courses already exist
            if (investWestData.courses && investWestData.courses['student-showcase']) {
                setMessage('✅ Course structure already exists! No changes needed.');
                return;
            }
            
            // Convert existing availableCourses to new structure
            const structuredCourses = convertAvailableCoursesToStructured(investWestData.availableCourses || []);
            
            
            // Update the database
            const updates = {
                [`${DB_CONST.GROUP_PROPERTIES_CHILD}/${investWestKey}/courses`]: structuredCourses
            };
            
            await firebase.database().ref().update(updates);
            
            const courseList = Object.entries(structuredCourses)
                .map(([courseUserName, course]) => `${course.displayName} (${courseUserName})${course.isDefault ? ' - DEFAULT' : ''}`)
                .join(', ');
            
            setMessage(`✅ Successfully set up course structure! Added courses: ${courseList}`);
            
        } catch (error) {
            console.error('Setup failed:', error);
            setError(`❌ Setup failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="m-3">
            <Card.Header>
                <h5>Course Structure Setup</h5>
            </Card.Header>
            <Card.Body>
                <p>
                    This will add the course structure to your invest-west group, including:
                </p>
                <ul>
                    <li><strong>Student Showcase</strong> (student-showcase) - Default course</li>
                    <li><strong>History MSc</strong> (history-msc) - From existing availableCourses</li>
                </ul>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                
                <Button 
                    variant="primary" 
                    onClick={setupCourseStructure}
                    disabled={isLoading}
                >
                    {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                    {isLoading ? 'Setting up...' : 'Setup Course Structure'}
                </Button>
                
                <div className="mt-3">
                    <small className="text-muted">
                        <strong>Note:</strong> This is safe to run multiple times. If the structure already exists, no changes will be made.
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CourseSetup;