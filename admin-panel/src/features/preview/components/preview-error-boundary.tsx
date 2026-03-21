"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface State {
  hasError: boolean;
}

export class PreviewErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Preview rendering failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-semibold">Preview temporarily unavailable</p>
              <p className="text-sm text-muted-foreground">
                We kept your editor safe. Reset the preview or continue editing and save normally.
              </p>
            </div>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Retry preview
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
