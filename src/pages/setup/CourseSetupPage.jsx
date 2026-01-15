import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CourseSetup from '../../components/admin/CourseSetup';
import AddStudentShowcase from '../../components/admin/AddStudentShowcase';

const CourseSetupPage = () => {
    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="text-center my-4">Database Course Structure Setup</h2>
                    
                    {/* Step 1: Add Student Showcase to availableCourses */}
                    <AddStudentShowcase />
                    
                    {/* Step 2: Set up structured course data */}
                    <CourseSetup />
                </Col>
            </Row>
        </Container>
    );
};

export default CourseSetupPage;