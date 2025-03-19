
import { useState, useEffect } from "react";
import { AIProvider } from "@/lib/types";
import { defaultAIProviders, validateAPIKey } from "@/lib/aiProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, PlusCircle, Save, TestTube, Trash2, Check, XCircle } from "lucide-react";

interface AIProviderSettingsProps {
  onProviderChange?: (providers: AIProvider[]) => void;
}

export default function AIProviderSettings({ onProviderChange }: AIProviderSettingsProps) {
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    const savedProviders = localStorage.getItem("ai-providers");
    return savedProviders ? JSON.parse(savedProviders) : defaultAIProviders;
  });
  
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<null | "success" | "error">(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      setSelectedProviderId(providers[0].id);
    }
  }, [providers, selectedProviderId]);
  
  useEffect(() => {
    localStorage.setItem("ai-providers", JSON.stringify(providers));
    if (onProviderChange) {
      onProviderChange(providers);
    }
  }, [providers, onProviderChange]);
  
  const selectedProvider = selectedProviderId 
    ? providers.find(p => p.id === selectedProviderId) || null
    : null;
  
  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    setValidationStatus(null);
  };
  
  const handleApiKeyChange = (apiKey: string) => {
    if (!selectedProviderId) return;
    
    setProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === selectedProviderId
          ? { ...provider, apiKey }
          : provider
      )
    );
    
    setValidationStatus(null);
  };
  
  const handleModelChange = (modelName: string) => {
    if (!selectedProviderId) return;
    
    setProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === selectedProviderId
          ? { ...provider, defaultModel: modelName }
          : provider
      )
    );
  };
  
  const handleValidateApiKey = async () => {
    if (!selectedProvider || !selectedProvider.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to validate",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    setValidationStatus(null);
    
    try {
      const isValid = await validateAPIKey(selectedProvider, selectedProvider.apiKey);
      
      setValidationStatus(isValid ? "success" : "error");
      
      toast({
        title: isValid ? "API Key Valid" : "API Key Invalid",
        description: isValid 
          ? `Successfully validated API key for ${selectedProvider.name}`
          : `Failed to validate API key for ${selectedProvider.name}`,
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error validating API key:", error);
      setValidationStatus("error");
      
      toast({
        title: "Validation Error",
        description: "An error occurred while validating the API key",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleAddProvider = () => {
    const newProvider: AIProvider = {
      id: `custom-${Date.now()}`,
      name: "New Custom Provider",
      type: "custom",
      apiEndpoint: "https://api.example.com",
      models: ["default-model"],
      defaultModel: "default-model",
    };
    
    setProviders([...providers, newProvider]);
    setSelectedProviderId(newProvider.id);
    
    toast({
      title: "Provider Added",
      description: "New custom AI provider has been added",
    });
  };
  
  const handleDeleteProvider = () => {
    if (!selectedProviderId) return;
    
    // Don't allow deleting the last provider
    if (providers.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "At least one AI provider must be available",
        variant: "destructive",
      });
      return;
    }
    
    const providerToDelete = providers.find(p => p.id === selectedProviderId);
    if (!providerToDelete) return;
    
    const updatedProviders = providers.filter(p => p.id !== selectedProviderId);
    setProviders(updatedProviders);
    setSelectedProviderId(updatedProviders[0]?.id || null);
    
    toast({
      title: "Provider Deleted",
      description: `${providerToDelete.name} has been removed`,
    });
  };
  
  const handleSaveProviderSettings = () => {
    if (!selectedProviderId || !selectedProvider) return;
    
    // Save updated provider settings
    localStorage.setItem("ai-providers", JSON.stringify(providers));
    
    toast({
      title: "Settings Saved",
      description: `${selectedProvider.name} settings have been saved`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">AI Provider Settings</h3>
        <Button onClick={handleAddProvider}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Available Providers</h4>
          <div className="space-y-2">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant={selectedProviderId === provider.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleProviderChange(provider.id)}
              >
                {provider.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedProvider ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedProvider.name}</CardTitle>
                <CardDescription>
                  Configure settings for this AI provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input 
                    id="provider-name"
                    value={selectedProvider.name}
                    onChange={(e) => {
                      setProviders(prevProviders => 
                        prevProviders.map(provider => 
                          provider.id === selectedProviderId
                            ? { ...provider, name: e.target.value }
                            : provider
                        )
                      );
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider-type">Provider Type</Label>
                  <Select 
                    value={selectedProvider.type}
                    onValueChange={(value: any) => {
                      setProviders(prevProviders => 
                        prevProviders.map(provider => 
                          provider.id === selectedProviderId
                            ? { ...provider, type: value }
                            : provider
                        )
                      );
                    }}
                  >
                    <SelectTrigger id="provider-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input 
                    id="api-endpoint"
                    value={selectedProvider.apiEndpoint}
                    onChange={(e) => {
                      setProviders(prevProviders => 
                        prevProviders.map(provider => 
                          provider.id === selectedProviderId
                            ? { ...provider, apiEndpoint: e.target.value }
                            : provider
                        )
                      );
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-model">Default Model</Label>
                  <Select
                    value={selectedProvider.defaultModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger id="default-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider.models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="api-key">API Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-3 w-3 mr-1" />
                      ) : (
                        <Eye className="h-3 w-3 mr-1" />
                      )}
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input 
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={selectedProvider.apiKey || ""}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        className="pr-10"
                      />
                      {validationStatus && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {validationStatus === "success" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleValidateApiKey}
                      disabled={isValidating || !selectedProvider.apiKey}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {isValidating ? "Validating..." : "Validate"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    API keys are stored locally in your browser and never sent to our servers.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleDeleteProvider}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleSaveProviderSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Select a provider to view and edit its settings
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
