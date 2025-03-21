
import React from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIProviderSettings from "@/components/AIProviderSettings";
import { DatabaseConfigPanel } from "@/components/DatabaseConfigPanel";
import { CrewAIStatus } from "@/components/CrewAIStatus";

export default function Settings() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
        
        <Tabs defaultValue="ai-providers">
          <TabsList className="mb-6">
            <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-providers">
            <AIProviderSettings />
          </TabsContent>
          
          <TabsContent value="database">
            <DatabaseConfigPanel />
          </TabsContent>
          
          <TabsContent value="integrations">
            <div className="grid gap-6 md:grid-cols-2">
              <CrewAIStatus />
              {/* Additional integration components can be added here */}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
