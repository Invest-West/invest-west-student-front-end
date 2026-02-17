import { useState, useEffect, useCallback } from 'react';
import Api from '../api/Api';

/**
 * API Routes for public university/course validation
 */
const PUBLIC_UNI_API_ROUTES = {
    validateRoute: '/public/uni',
    getUniversity: '/public/uni'
};

/**
 * Response from route validation API
 */
export interface RouteValidationResponse {
    valid: boolean;
    found?: boolean;  // Used by getUniversityBySlug endpoint
    error?: string;
    code?: string;
    university?: {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
    };
    course?: {
        id: string;
        name: string;
        slug: string;
    };
}

/**
 * State returned by the useRouteValidation hook
 */
export interface RouteValidationState {
    isLoading: boolean;
    isValid: boolean;
    error: string | null;
    errorCode: string | null;
    university: RouteValidationResponse['university'] | null;
    course: RouteValidationResponse['course'] | null;
    retry: () => void;
}

/**
 * Hook for validating university and course routes
 *
 * This hook calls the public API endpoint to validate that the university
 * and course exist before rendering the page content.
 *
 * @param universitySlug - The university slug from URL params
 * @param courseSlug - The course slug from URL params (optional)
 * @returns RouteValidationState
 */
export const useRouteValidation = (
    universitySlug: string | undefined,
    courseSlug: string | undefined
): RouteValidationState => {
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [university, setUniversity] = useState<RouteValidationResponse['university'] | null>(null);
    const [course, setCourse] = useState<RouteValidationResponse['course'] | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const validateRoute = useCallback(async () => {
        // Skip validation if no university slug
        if (!universitySlug) {
            setIsLoading(false);
            setIsValid(false);
            setError('No university specified');
            setErrorCode('NO_UNIVERSITY');
            return;
        }

        setIsLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            let endpoint: string;

            if (courseSlug) {
                // Validate both university and course
                endpoint = `${PUBLIC_UNI_API_ROUTES.validateRoute}/${universitySlug}/${courseSlug}`;
            } else {
                // Just get university info
                endpoint = `${PUBLIC_UNI_API_ROUTES.getUniversity}/${universitySlug}`;
            }

            const response = await Api.doGet(endpoint);
            const data = response.data as RouteValidationResponse;

            if (data.valid || data.found) {
                setIsValid(true);
                setUniversity(data.university || null);
                setCourse(data.course || null);
            } else {
                setIsValid(false);
                setError(data.error || 'Route validation failed');
                setErrorCode(data.code || 'VALIDATION_FAILED');
                setUniversity(data.university || null);
            }
        } catch (err: any) {
            const errorMessage = err.toString();

            // Parse error message for more context
            if (errorMessage.includes('404')) {
                if (errorMessage.toLowerCase().includes('university')) {
                    setError('University not found');
                    setErrorCode('UNIVERSITY_NOT_FOUND');
                } else if (errorMessage.toLowerCase().includes('course')) {
                    setError('Course not found');
                    setErrorCode('COURSE_NOT_FOUND');
                } else {
                    setError('Page not found');
                    setErrorCode('NOT_FOUND');
                }
            } else if (errorMessage.includes('Network') || errorMessage.includes('Server')) {
                setError('Unable to connect to server. Please check your connection.');
                setErrorCode('NETWORK_ERROR');
            } else {
                setError('An unexpected error occurred');
                setErrorCode('UNKNOWN_ERROR');
            }
            setIsValid(false);
        } finally {
            setIsLoading(false);
        }
    }, [universitySlug, courseSlug, retryCount]);

    useEffect(() => {
        validateRoute();
    }, [validateRoute]);

    const retry = useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

    return {
        isLoading,
        isValid,
        error,
        errorCode,
        university,
        course,
        retry
    };
};

export default useRouteValidation;
