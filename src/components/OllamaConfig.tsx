import { useState } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function OllamaConfig() {
  const { configureOllama, ollamaStatus, ollamaConfig } = useAgents();
  const [baseUrl, setBaseUrl] = useState(ollamaConfig.baseUrl);
  const [model, setModel] = useState(ollamaConfig.model);
  const [mode, setMode] = useState(ollamaConfig.mode);
  
  const handleConnect = () => {
    configureOllama(baseUrl, model, mode);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="connection" className="flex-1">Connection</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Connection Mode</Label>
                <RadioGroup 
                  defaultValue={mode} 
                  onValueChange={setMode}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct" className="cursor-pointer">
                      Direct to Ollama
                      <span className="text-xs text-muted-foreground block">
                        Connect directly from browser to Ollama API
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="backend" id="backend" />
                    <Label htmlFor="backend" className="cursor-pointer">
                      Backend API
                      <span className="text-xs text-muted-foreground block">
                        Connect to backend server (recommended)
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-url">
                  {mode === 'direct' ? 'Ollama URL' : 'Backend URL'}
                </Label>
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={mode === 'direct' ? 'http://localhost:11434' : 'http://localhost:5000'}
                  onFocus={(e) => {
                    // Auto-correct the URL when switching modes and focusing
                    if (mode === 'direct' && baseUrl === 'http://localhost:5000') {
                      setBaseUrl('http://localhost:11434');
                    } else if (mode === 'backend' && baseUrl === 'http://localhost:11434') {
                      setBaseUrl('http://localhost:5000');
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {mode === 'direct' 
                    ? 'The URL of your Ollama instance (default: http://localhost:11434)' 
                    : 'The URL of your backend API server (default: http://localhost:5000)'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="llama3"
                />
                <p className="text-xs text-muted-foreground">
                  The name of the model to use (e.g., llama3, mistral, codellama)
                </p>
              </div>
              
              <Button onClick={handleConnect} className="w-full mt-2">
                {ollamaStatus === 'connected' ? 'Reconnect' : 'Connect to AI'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Advanced settings will be available in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
