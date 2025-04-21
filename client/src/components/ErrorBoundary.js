import React from "react";

class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        sessionStorage.setItem("lastError", {
            message: error,
            info: errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return window.location.href = '/error'
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
