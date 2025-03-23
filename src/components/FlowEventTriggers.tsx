
import { useState } from "react";
import { Flow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { WebhookTrigger } from "@/components/flow/triggers/WebhookTrigger";
import { ScheduleTrigger } from "@/components/flow/triggers/ScheduleTrigger";
import { IntervalTrigger } from "@/components/flow/triggers/IntervalTrigger";
import { DatabaseTrigger } from "@/components/flow/triggers/DatabaseTrigger";
import { TriggerCard } from "@/components/flow/triggers/TriggerCard";
import { TriggerSelector } from "@/components/flow/triggers/TriggerSelector";

interface FlowEventTriggersProps {
  flow: Flow;
  onFlowUpdate?: (flow: Flow) => void;
}

export default function FlowEventTriggers({ flow, onFlowUpdate }: FlowEventTriggersProps) {
  const { toast } = useToast();
  const [triggerType, setTriggerType] = useState<string>("webhook");
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

  const handleDeleteTrigger = () => {
    setTriggerEnabled(false);
    
    toast({
      title: "Trigger deleted",
      description: "Event trigger has been removed",
    });
  };
  
  const renderTriggerForm = () => {
    switch (triggerType) {
      case "webhook":
        return <WebhookTrigger onTest={() => console.log("Testing webhook")} />;
      case "schedule":
        return <ScheduleTrigger selectedDate={selectedDate} onDateSelect={setSelectedDate} />;
      case "interval":
        return (
          <IntervalTrigger
            intervalValue={intervalValue}
            intervalUnit={intervalUnit}
            onIntervalValueChange={setIntervalValue}
            onIntervalUnitChange={setIntervalUnit}
          />
        );
      case "database":
        return <DatabaseTrigger />;
      default:
        return null;
    }
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
      
      <TriggerSelector 
        triggerType={triggerType} 
        onTriggerTypeChange={setTriggerType} 
      />
      
      {renderTriggerForm()}
      
      <Button onClick={handleSaveTrigger}>
        <Plus className="h-4 w-4 mr-2" />
        Save Trigger
      </Button>
      
      {triggerEnabled && (
        <TriggerCard
          triggerType={triggerType}
          triggerDetails={{
            intervalValue,
            intervalUnit,
            selectedDate
          }}
          onDelete={handleDeleteTrigger}
        />
      )}
    </div>
  );
}
