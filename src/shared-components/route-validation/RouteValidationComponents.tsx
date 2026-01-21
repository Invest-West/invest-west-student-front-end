import React from 'react';
import { Box, Button, Typography, Paper } from '@material-ui/core';
import { BarLoader } from 'react-spinners';
import HashLoader from 'react-spinners/HashLoader';
import { useHistory } from 'react-router-dom';

/**
 * Props for RouteLoadingIndicator
 */
interface RouteLoadingIndicatorProps {
    message?: string;
    color?: string;
}

/**
 * Loading indicator shown while validating a route
 */
export const RouteLoadingIndicator: React.FC<RouteLoadingIndicatorProps> = ({
    message = 'Loading...',
    color = '#1976d2'
}) => {
    return (
        <Box>
            <BarLoader
                color={color}
                width="100%"
                height={4}
            />
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
            >
                <HashLoader color={color} size={50} />
                <Box height="20px" />
                <Typography variant="body1" color="textSecondary">
                    {message}
                </Typography>
            </Box>
        </Box>
    );
};

/**
 * Props for RouteErrorDisplay
 */
interface RouteErrorDisplayProps {
    errorCode: string | null;
    errorMessage: string | null;
    universityName?: string | null;
    onRetry?: () => void;
}

/**
 * Error display shown when route validation fails
 */
export const RouteErrorDisplay: React.FC<RouteErrorDisplayProps> = ({
    errorCode,
    errorMessage,
    universityName,
    onRetry
}) => {
    const history = useHistory();

    const getErrorTitle = () => {
        switch (errorCode) {
            case 'UNIVERSITY_NOT_FOUND':
                return 'University Not Found';
            case 'COURSE_NOT_FOUND':
                return 'Course Not Found';
            case 'NETWORK_ERROR':
                return 'Connection Error';
            case 'NO_UNIVERSITY':
                return 'Invalid URL';
            default:
                return 'Page Not Found';
        }
    };

    const getErrorDescription = () => {
        switch (errorCode) {
            case 'UNIVERSITY_NOT_FOUND':
                return 'The university you are looking for does not exist or may have been removed.';
            case 'COURSE_NOT_FOUND':
                return universityName
                    ? `The course you are looking for does not exist within ${universityName}.`
                    : 'The course you are looking for does not exist or may have been removed.';
            case 'NETWORK_ERROR':
                return 'We could not connect to the server. Please check your internet connection and try again.';
            case 'NO_UNIVERSITY':
                return 'The URL you entered is not valid. Please check the link and try again.';
            default:
                return errorMessage || 'The page you are looking for could not be found.';
        }
    };

    const getSuggestions = () => {
        switch (errorCode) {
            case 'UNIVERSITY_NOT_FOUND':
                return [
                    'Check that the university name in the URL is correct',
                    'Contact your university administrator if you believe this is an error'
                ];
            case 'COURSE_NOT_FOUND':
                return [
                    'Check that the course name in the URL is correct',
                    'The course may not have been set up yet',
                    'Contact your administrator for assistance'
                ];
            case 'NETWORK_ERROR':
                return [
                    'Check your internet connection',
                    'Try refreshing the page',
                    'If the problem persists, please try again later'
                ];
            default:
                return [
                    'Check that the URL is correct',
                    'Go back to the home page'
                ];
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="70vh"
            padding="20px"
        >
            <Paper
                elevation={0}
                style={{
                    padding: '40px',
                    maxWidth: '600px',
                    textAlign: 'center',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                }}
            >
                {/* Error code badge */}
                <Box
                    display="inline-block"
                    bgcolor="#f5f5f5"
                    borderRadius="4px"
                    padding="4px 12px"
                    marginBottom="20px"
                >
                    <Typography variant="caption" color="textSecondary">
                        Error: {errorCode || 'UNKNOWN'}
                    </Typography>
                </Box>

                {/* Error title */}
                <Typography variant="h4" color="error" gutterBottom>
                    {getErrorTitle()}
                </Typography>

                {/* Error description */}
                <Typography variant="body1" color="textSecondary" paragraph>
                    {getErrorDescription()}
                </Typography>

                {/* Suggestions */}
                <Box textAlign="left" marginY="24px">
                    <Typography variant="subtitle2" gutterBottom>
                        What you can do:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {getSuggestions().map((suggestion, index) => (
                            <li key={index}>
                                <Typography variant="body2" color="textSecondary">
                                    {suggestion}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Box>

                {/* Action buttons */}
                <Box display="flex" justifyContent="center" marginTop="24px">
                    {onRetry && errorCode === 'NETWORK_ERROR' && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onRetry}
                            style={{ marginRight: '16px' }}
                        >
                            Try Again
                        </Button>
                    )}
                    <Button
                        variant={onRetry && errorCode === 'NETWORK_ERROR' ? 'outlined' : 'contained'}
                        color="primary"
                        onClick={() => history.push('/groups/invest-west/student-showcase')}
                    >
                        Go to Home
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

/**
 * Props for ValidatedRouteWrapper
 */
interface ValidatedRouteWrapperProps {
    isLoading: boolean;
    isValid: boolean;
    error: string | null;
    errorCode: string | null;
    universityName?: string | null;
    onRetry?: () => void;
    loadingMessage?: string;
    primaryColor?: string;
    children: React.ReactNode;
}

/**
 * Wrapper component that shows loading/error states based on route validation
 */
export const ValidatedRouteWrapper: React.FC<ValidatedRouteWrapperProps> = ({
    isLoading,
    isValid,
    error,
    errorCode,
    universityName,
    onRetry,
    loadingMessage = 'Validating...',
    primaryColor = '#1976d2',
    children
}) => {
    if (isLoading) {
        return (
            <RouteLoadingIndicator
                message={loadingMessage}
                color={primaryColor}
            />
        );
    }

    if (!isValid && error) {
        return (
            <RouteErrorDisplay
                errorCode={errorCode}
                errorMessage={error}
                universityName={universityName}
                onRetry={onRetry}
            />
        );
    }

    return <>{children}</>;
};

export default ValidatedRouteWrapper;
