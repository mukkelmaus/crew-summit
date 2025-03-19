
import { useState } from "react";
import { Flow } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { saveFlow } from "@/lib/localDatabase";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Webhook, 
  RefreshCw,
  Database,
  Zap,
  Plus,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

interface FlowEventTriggersProps {
  flow: Flow;
  onFlowUpdate?: (flow: Flow) => void;
}

export default function FlowEventTriggers({ flow, onFlowUpdate }: FlowEventTriggersProps) {
  const { toast } = useToast();
  const [triggerType, setTriggerType] = useState<string>("webhook");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [triggerEnabled, setTriggerEnabled] = useState<boolean>(false);
  const [intervalValue, setIntervalValue] = useState<string>("5");
  const [intervalUnit, setIntervalUnit] = useState<string>("minutes");
  
  const handleSaveTrigger = async () => {
    // In a full implementation, this would add the trigger to the flow
    // and save it to the database
    
    toast({
      title: "Trigger saved",
      description: `Event trigger has been configured for ${flow.name}`,
    });
    
    setTriggerEnabled(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Event Triggers</h3>
        <Switch
          checked={triggerEnabled}
          onCheckedChange={setTriggerEnabled}
        />
      </div>
      
      <Select value={triggerType} onValueChange={setTriggerType}>
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
              <CalendarIcon className="h-4 w-4 mr-2" />
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
      
      {triggerType === "webhook" && (
        <div className="space-y-4">
          <div>
            <Label>Webhook Endpoint</Label>
            <div className="flex items-center mt-1.5">
              <Input
                value="/api/flows/trigger/sample-endpoint"
                readOnly
                className="bg-muted"
              />
              <Button variant="outline" className="ml-2">
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
      )}
      
      {triggerType === "schedule" && (
        <div className="space-y-4">
          <div>
            <Label>Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left mt-1.5">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Time</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <Select defaultValue="09">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["00", "15", "30", "45"].map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="repeat" defaultChecked />
            <Label htmlFor="repeat">Repeat</Label>
          </div>
          
          <div>
            <Label>Repeat Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {triggerType === "interval" && (
        <div className="space-y-4">
          <div>
            <Label>Run every</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <Input 
                type="number" 
                min="1" 
                value={intervalValue}
                onChange={(e) => setIntervalValue(e.target.value)}
              />
              <Select value={intervalUnit} onValueChange={setIntervalUnit}>
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
      )}
      
      {triggerType === "database" && (
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
      )}
      
      <Button onClick={handleSaveTrigger}>
        <Plus className="h-4 w-4 mr-2" />
        Save Trigger
      </Button>
      
      {triggerEnabled && (
        <div className="border rounded-md p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {triggerType === "webhook" && <Webhook className="h-4 w-4 mr-2" />}
              {triggerType === "schedule" && <CalendarIcon className="h-4 w-4 mr-2" />}
              {triggerType === "interval" && <RefreshCw className="h-4 w-4 mr-2" />}
              {triggerType === "database" && <Database className="h-4 w-4 mr-2" />}
              <span className="font-medium">
                {triggerType === "webhook" && "Webhook Trigger"}
                {triggerType === "schedule" && "Schedule Trigger"}
                {triggerType === "interval" && `Run every ${intervalValue} ${intervalUnit}`}
                {triggerType === "database" && "Database Change Trigger"}
              </span>
            </div>
            <Button variant="ghost" size="sm">
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
      )}
    </div>
  );
}
