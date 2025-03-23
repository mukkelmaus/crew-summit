
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Webhook, RefreshCw, Database, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface TriggerCardProps {
  triggerType: string;
  triggerDetails: {
    intervalValue?: string;
    intervalUnit?: string;
    selectedDate?: Date;
  };
  onDelete: () => void;
}

export function TriggerCard({ triggerType, triggerDetails, onDelete }: TriggerCardProps) {
  const { intervalValue, intervalUnit, selectedDate } = triggerDetails;
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {triggerType === "webhook" && <Webhook className="h-4 w-4 mr-2" />}
          {triggerType === "schedule" && <Calendar className="h-4 w-4 mr-2" />}
          {triggerType === "interval" && <RefreshCw className="h-4 w-4 mr-2" />}
          {triggerType === "database" && <Database className="h-4 w-4 mr-2" />}
          <span className="font-medium">
            {triggerType === "webhook" && "Webhook Trigger"}
            {triggerType === "schedule" && "Schedule Trigger"}
            {triggerType === "interval" && `Run every ${intervalValue} ${intervalUnit}`}
            {triggerType === "database" && "Database Change Trigger"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {triggerType === "webhook" && "Endpoint: /api/flows/trigger/sample-endpoint"}
        {triggerType === "schedule" && selectedDate 
          ? `Scheduled for ${format(selectedDate, "PPP")} at 09:00` 
          : "Scheduled daily at 09:00"}
        {triggerType === "interval" && `Runs every ${intervalValue} ${intervalUnit} starting now`}
        {triggerType === "database" && "Triggers on document creation in agents collection"}
      </p>
      <div className="mt-2 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        <span>Last triggered: Never</span>
      </div>
    </div>
  );
}
