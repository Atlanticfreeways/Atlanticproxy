'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Warning } from '@phosphor-icons/react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                    <div className="p-4 bg-red-500/10 rounded-full mb-4">
                        <Warning className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        We encountered an unexpected error. Our team has been notified.
                    </p>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        variant="outline"
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
