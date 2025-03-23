
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

interface IntervalTriggerProps {
  intervalValue: string;
  intervalUnit: string;
  onIntervalValueChange: (value: string) => void;
  onIntervalUnitChange: (unit: string) => void;
}

export function IntervalTrigger({
  intervalValue,
  intervalUnit,
  onIntervalValueChange,
  onIntervalUnitChange
}: IntervalTriggerProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Run every</Label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          <Input 
            type="number" 
            min="1" 
            value={intervalValue}
            onChange={(e) => onIntervalValueChange(e.target.value)}
          />
          <Select value={intervalUnit} onValueChange={onIntervalUnitChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Start From</Label>
        <div className="flex items-center space-x-2 mt-1.5">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Now
          </Button>
          <span className="text-muted-foreground">or</span>
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Set Date/Time
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="active-hours" />
        <Label htmlFor="active-hours">Only run during active hours</Label>
      </div>
    </div>
  );
}
