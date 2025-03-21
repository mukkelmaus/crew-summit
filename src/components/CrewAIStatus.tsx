
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CrewAIService } from "@/services/api";

export function CrewAIStatus() {
  const [status, setStatus] = useState<{ connected: boolean; version: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const result = await CrewAIService.getStatus();
      setStatus(result);
    } catch (error) {
      console.error("Failed to check CrewAI status:", error);
      toast.error("Failed to check CrewAI status");
      setStatus({ connected: false, version: "unknown" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
    setRefreshing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          CrewAI Integration
          {status?.connected ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 ml-2">
              <CheckCircle className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              <XCircle className="h-3 w-3 mr-1" /> Disconnected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Status of the CrewAI framework integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-2 text-center">Checking CrewAI status...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-medium">
                  {status?.connected ? "Connected" : "Disconnected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <p className="font-medium">{status?.version || "Unknown"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Integration Details</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• CrewAI provides multi-agent orchestration capabilities</li>
                <li>• Agent roles, tools, and collaborative workflows</li>
                <li>• Task assignment and execution tracking</li>
                <li>• Memory and context sharing between agents</li>
              </ul>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh Status"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
