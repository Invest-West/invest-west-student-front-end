import React, { useState } from 'react';
import { Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';

/**
 * Component to add "Student Showcase" to the availableCourses array
 */
const AddStudentShowcase = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentCourses, setCurrentCourses] = useState(null);

    const checkCurrentCourses = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const groupRef = firebase.database().ref(DB_CONST.GROUP_PROPERTIES_CHILD);
            const snapshot = await groupRef.orderByChild('groupUserName').equalTo('invest-west').once('value');
            
            if (!snapshot.exists()) {
                throw new Error('invest-west group not found');
            }
            
            let investWestData = null;
            snapshot.forEach(childSnapshot => {
                investWestData = childSnapshot.val();
                return true;
            });
            
            setCurrentCourses(investWestData?.availableCourses || []);
            setMessage('✅ Current courses loaded successfully');
            
        } catch (error) {
            setError(`❌ Failed to load courses: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addStudentShowcase = async () => {
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
            
            const currentCourses = investWestData.availableCourses || [];
            
            // Check if Student Showcase already exists
            if (currentCourses.includes('Student Showcase')) {
                setMessage('✅ Student Showcase is already in the availableCourses list!');
                setCurrentCourses(currentCourses);
                return;
            }
            
            // Add Student Showcase as the first course (default)
            const updatedCourses = ['Student Showcase', ...currentCourses];
            
            
            // Update the database
            const updates = {
                [`${DB_CONST.GROUP_PROPERTIES_CHILD}/${investWestKey}/availableCourses`]: updatedCourses
            };
            
            await firebase.database().ref().update(updates);
            
            setCurrentCourses(updatedCourses);
            setMessage(`✅ Successfully added "Student Showcase" as the default course! Total courses: ${updatedCourses.length}`);
            
        } catch (error) {
            console.error('Failed to add Student Showcase:', error);
            setError(`❌ Failed to add course: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="m-3">
            <Card.Header>
                <h5>Add Student Showcase Course</h5>
            </Card.Header>
            <Card.Body>
                <p>
                    This will add "Student Showcase" as the default course to your invest-west group's availableCourses array.
                </p>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                
                <div className="mb-3">
                    <Button 
                        variant="info" 
                        onClick={checkCurrentCourses}
                        disabled={isLoading}
                        className="me-2"
                    >
                        {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                        Check Current Courses
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={addStudentShowcase}
                        disabled={isLoading}
                    >
                        {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                        Add Student Showcase
                    </Button>
                </div>
                
                {currentCourses && (
                    <div>
                        <h6>Current Available Courses:</h6>
                        <ListGroup>
                            {currentCourses.length === 0 ? (
                                <ListGroup.Item>No courses found</ListGroup.Item>
                            ) : (
                                currentCourses.map((course, index) => (
                                    <ListGroup.Item 
                                        key={index}
                                        variant={course === 'Student Showcase' ? 'success' : 'light'}
                                    >
                                        {index === 0 && <span className="badge bg-primary me-2">DEFAULT</span>}
                                        {course}
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </div>
                )}
                
                <div className="mt-3">
                    <small className="text-muted">
                        <strong>Note:</strong> "Student Showcase" will be added as the first course in the list, making it the default course for routing.
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AddStudentShowcase;