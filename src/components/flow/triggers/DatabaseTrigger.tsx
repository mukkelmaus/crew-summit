
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function DatabaseTrigger() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Watch Collection</Label>
        <Select defaultValue="agents">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agents">Agents</SelectItem>
            <SelectItem value="crews">Crews</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="flows">Flows</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Trigger on</Label>
        <div className="space-y-2 mt-1.5">
          <div className="flex items-center space-x-2">
            <Checkbox id="create" defaultChecked />
            <Label htmlFor="create">Create</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="update" />
            <Label htmlFor="update">Update</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="delete" />
            <Label htmlFor="delete">Delete</Label>
          </div>
        </div>
      </div>
      
      <div>
        <Label>Condition (Optional)</Label>
        <Input 
          placeholder="e.g. status === 'completed'"
          className="mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-1">
          JavaScript expression to filter events
        </p>
      </div>
    </div>
  );
}
