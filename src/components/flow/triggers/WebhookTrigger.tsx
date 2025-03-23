
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

interface WebhookTriggerProps {
  onTest?: () => void;
}

export function WebhookTrigger({ onTest }: WebhookTriggerProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Webhook Endpoint</Label>
        <div className="flex items-center mt-1.5">
          <Input
            value="/api/flows/trigger/sample-endpoint"
            readOnly
            className="bg-muted"
          />
          <Button variant="outline" className="ml-2" onClick={onTest}>
            <Zap className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Use this endpoint to trigger your flow from external systems.
        </p>
      </div>
      
      <div>
        <Label>Authentication</Label>
        <Select defaultValue="apikey">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="payload" />
        <Label htmlFor="payload">Require payload validation</Label>
      </div>
    </div>
  );
}
