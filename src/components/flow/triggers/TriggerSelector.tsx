
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Webhook, Calendar, RefreshCw, Database } from "lucide-react";

interface TriggerSelectorProps {
  triggerType: string;
  onTriggerTypeChange: (type: string) => void;
}

export function TriggerSelector({ triggerType, onTriggerTypeChange }: TriggerSelectorProps) {
  return (
    <Select value={triggerType} onValueChange={onTriggerTypeChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select trigger type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="webhook">
          <div className="flex items-center">
            <Webhook className="h-4 w-4 mr-2" />
            Webhook
          </div>
        </SelectItem>
        <SelectItem value="schedule">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </div>
        </SelectItem>
        <SelectItem value="interval">
          <div className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Interval
          </div>
        </SelectItem>
        <SelectItem value="database">
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Database Change
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
