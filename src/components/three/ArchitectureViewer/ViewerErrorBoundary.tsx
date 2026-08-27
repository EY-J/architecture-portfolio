"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ViewerErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ViewerErrorBoundaryState = {
  hasError: boolean;
};

export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  state: ViewerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("Architecture viewer failed to initialize.", error, info);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
