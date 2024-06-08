import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so that the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error and error info
        console.error("Error caught by ErrorBoundary:", error);
        console.error("Error info:", errorInfo);

        // Update state with error details
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI when an error occurs
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    {this.state.error && (
                        <details style={{ whiteSpace: 'pre-wrap' }}>
                            <strong>Error:</strong> {this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && (
                                <>
                                    <strong>Component Stack:</strong>
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                </>
                            )}
                        </details>
                    )}
                </div>
            );
        }

        // Render children when there are no errors
        return this.props.children;
    }
}

export default ErrorBoundary;
