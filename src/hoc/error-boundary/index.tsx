import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/helpers';
import ErrorBoundaryScreen from './screen';

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError = (error: Error): State => {
    console.log(' ~~~ ErrorBoundary getDerivedStateFromError. Error:', error);
    return { hasError: true };
  };

  componentDidCatch = (error: Error, errorInfo: ErrorInfo) => {
    console.log(' ~~~ ErrorBoundary componentDidCatch. Error:', error, errorInfo);
    logError(error);
  };

  render = () => {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <ErrorBoundaryScreen />;
    }

    return children ? children : null;
  };
}

export default ErrorBoundary;
