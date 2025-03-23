
import React from "react";
import { Flow } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface FlowSettingsTabProps {
  flow: Flow;
}

export function FlowSettingsTab({ flow }: FlowSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flow Settings</CardTitle>
        <CardDescription>
          Configure advanced settings for this flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Flow ID</label>
              <input 
                type="text" 
                value={flow.id} 
                readOnly 
                className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Created At</label>
              <input 
                type="text" 
                value={new Date(flow.createdAt).toLocaleString()} 
                readOnly 
                className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Updated At</label>
              <input 
                type="text" 
                value={flow.updatedAt 
                  ? new Date(flow.updatedAt).toLocaleString() 
                  : "Never"} 
                readOnly 
                className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Crew ID</label>
              <input 
                type="text" 
                value={flow.crewId} 
                readOnly 
                className="w-full py-2 px-3 border rounded-md bg-muted text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Advanced Options</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Storage Type</label>
              <select className="w-full py-2 px-3 border rounded-md bg-background text-sm" defaultValue="local">
                <option value="local">Local (IndexedDB)</option>
                <option value="external">External Connection</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-Retry on Failure</label>
              <select className="w-full py-2 px-3 border rounded-md bg-background text-sm" defaultValue="false">
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Retries</label>
              <input 
                type="number" 
                defaultValue={3}
                min={0}
                max={10}
                className="w-full py-2 px-3 border rounded-md bg-background text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeout (seconds)</label>
              <input 
                type="number" 
                defaultValue={300}
                min={0}
                className="w-full py-2 px-3 border rounded-md bg-background text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
