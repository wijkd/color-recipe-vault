import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We've encountered an error. Please try refreshing the page.
          </p>
        </div>

        {isDevelopment && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
            <p className="font-mono text-sm text-destructive break-words">
              {error.message}
            </p>
          </div>
        )}

        <Button 
          onClick={() => window.location.reload()} 
          className="w-full"
          size="lg"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
