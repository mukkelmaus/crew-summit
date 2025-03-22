
import { AlertTriangle, XCircle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppError, ErrorType } from "@/lib/errorHandler";

interface ErrorDisplayProps {
  error: Error | AppError | string;
  title?: string;
  retry?: () => void;
  dismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({ 
  error, 
  title, 
  retry, 
  dismiss, 
  className,
  showDetails = false
}: ErrorDisplayProps) {
  let errorMessage = typeof error === 'string' ? error : error.message;
  let errorType = (error as AppError)?.type || ErrorType.UNKNOWN;
  
  const getIcon = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
      case ErrorType.API:
        return <AlertTriangle className="h-5 w-5" />;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return <XCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const errorTitle = title || (
    errorType === ErrorType.NETWORK ? "Network Error" :
    errorType === ErrorType.API ? "API Error" :
    errorType === ErrorType.AUTHENTICATION ? "Authentication Error" :
    errorType === ErrorType.AUTHORIZATION ? "Authorization Error" :
    "An error occurred"
  );

  return (
    <Alert 
      variant="destructive" 
      className={cn("max-w-md", className)}
    >
      <AlertTitle className="flex items-center gap-2">
        {getIcon()}
        {errorTitle}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4 text-sm">
          {errorMessage}
        </p>
        
        {showDetails && (error as AppError)?.originalError && (
          <details className="text-xs mt-2 mb-4">
            <summary>Error details</summary>
            <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto">
              {JSON.stringify((error as AppError).originalError, null, 2)}
            </pre>
          </details>
        )}
        
        {(retry || dismiss) && (
          <div className="flex gap-2 mt-3">
            {retry && (
              <Button size="sm" variant="secondary" onClick={retry}>
                Try again
              </Button>
            )}
            {dismiss && (
              <Button size="sm" variant="outline" onClick={dismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function SuccessDisplay({ 
  message, 
  title = "Success", 
  dismiss,
  className
}: {
  message: string;
  title?: string;
  dismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert className={cn("border-green-500 bg-green-50 dark:bg-green-950/30", className)}>
      <AlertTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <CheckCircle className="h-5 w-5" />
        {title}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4 text-sm text-green-700 dark:text-green-400">
          {message}
        </p>
        
        {dismiss && (
          <Button size="sm" variant="outline" onClick={dismiss}>
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
