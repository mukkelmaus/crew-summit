
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  color?: "primary" | "secondary" | "muted";
}

export function LoadingIndicator({ 
  size = "md", 
  className, 
  text,
  color = "primary"
}: LoadingIndicatorProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  const colorClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted-foreground"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin", colorClass[color], sizeClass[size])} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}
