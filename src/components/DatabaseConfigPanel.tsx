
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { DatabaseService } from "@/services/api";

export function DatabaseConfigPanel() {
  const [databaseType, setDatabaseType] = useState<"sqlite" | "postgresql">("sqlite");
  const [connection, setConnection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await DatabaseService.getConfig();
        setDatabaseType(config.type);
        setConnection(config.connection);
      } catch (error) {
        console.error("Failed to load database configuration:", error);
        toast.error("Failed to load database configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await DatabaseService.updateConfig({
        type: databaseType,
        connection,
      });
      toast.success("Database configuration saved successfully");
    } catch (error) {
      console.error("Failed to save database configuration:", error);
      toast.error("Failed to save database configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
        <CardDescription>
          Configure the database backend for CrewSUMMIT.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="py-4 text-center">Loading configuration...</div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label className="text-base">Database Type</Label>
                <RadioGroup
                  value={databaseType}
                  onValueChange={(value) => setDatabaseType(value as "sqlite" | "postgresql")}
                  className="mt-2 flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sqlite" id="sqlite" />
                    <Label htmlFor="sqlite" className="cursor-pointer">
                      SQLite (Lightweight, file-based)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="postgresql" id="postgresql" />
                    <Label htmlFor="postgresql" className="cursor-pointer">
                      PostgreSQL (Production-ready, scalable)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connection">Connection String</Label>
                <Input
                  id="connection"
                  value={connection}
                  onChange={(e) => setConnection(e.target.value)}
                  placeholder={
                    databaseType === "sqlite"
                      ? "sqlite:///./crewsummit.db"
                      : "postgresql://user:password@localhost/crewsummit"
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {databaseType === "sqlite"
                    ? "Path to SQLite database file"
                    : "PostgreSQL connection string including credentials and database name"}
                </p>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Database Setup Notes</h4>
                {databaseType === "sqlite" ? (
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• SQLite is ideal for development and small deployments</li>
                    <li>• No additional setup required, file will be created automatically</li>
                    <li>• Data stored in a single file on the filesystem</li>
                    <li>• Limited concurrency support</li>
                  </ul>
                ) : (
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• PostgreSQL provides improved performance and scalability</li>
                    <li>• Requires a PostgreSQL server installation</li>
                    <li>• Database must be created before connecting</li>
                    <li>• Ensure the user has appropriate permissions</li>
                    <li>• Format: postgresql://username:password@hostname:port/database</li>
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => {
          setDatabaseType("sqlite");
          setConnection("sqlite:///./crewsummit.db");
        }}>
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
}
