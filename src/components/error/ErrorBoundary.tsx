// src/components/errors/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary component to catch errors in child components
 * and display a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // You could also send error to an error reporting service here
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Render custom fallback UI or default error message
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        margin: '20px',
                        padding: '20px',
                        backgroundColor: '#ffdddd',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        color: '#333',
                        fontFamily: 'MS Sans Serif, Arial, sans-serif',
                        fontSize: '12px'
                    }}
                >
                    <h3 style={{ margin: '0 0 10px 0' }}>Something went wrong</h3>
                    <p>
                        {this.state.error?.message || 'An unknown error occurred.'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;