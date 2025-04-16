// src/components/error/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { useSounds } from "@/hooks/useSounds";
import styles from "../styles/ErrorBoundary.module.scss";

interface Props {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Wrapper for sound hook (can't use hooks in class components)
const ErrorSound: React.FC<{ error: Error | null }> = ({ error }) => {
    const { playSound } = useSounds();

    React.useEffect(() => {
        if (error) {
            playSound("error");
        }
    }, [error, playSound]);

    return null;
};

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log the error
        console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);

        // Call any custom error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Render custom fallback if provided
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    return (
                        <>
                            <ErrorSound error={this.state.error} />
                            {this.props.fallback(this.state.error!, this.resetError)}
                        </>
                    );
                }
                return (
                    <>
                        <ErrorSound error={this.state.error} />
                        {this.props.fallback}
                    </>
                );
            }

            // Otherwise render default error UI
            return (
                <div className={styles.errorContainer}>
                    <ErrorSound error={this.state.error} />
                    <div className={styles.errorDialog}>
                        <div className={styles.errorHeader}>
                            <div className={styles.errorIcon}>✕</div>
                            <div className={styles.errorTitle}>
                                Error in {this.props.componentName || 'Component'}
                            </div>
                        </div>
                        <div className={styles.errorBody}>
                            <p className={styles.errorMessage}>
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <p className={styles.errorDetail}>
                                {this.state.error?.stack?.split('\n')[0] || ""}
                            </p>
                        </div>
                        <div className={styles.errorFooter}>
                            <button
                                className={styles.errorButton}
                                onClick={this.resetError}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;