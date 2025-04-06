
import { Header } from "@/components/Header";
import { TicketList } from "@/components/TicketList";
import { TicketDetail } from "@/components/TicketDetail";
import { AgentResults } from "@/components/AgentResults";
import { OllamaConfig } from "@/components/OllamaConfig";
import { NewTicketForm } from "@/components/NewTicketForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, MessageSquare, Plus, ChevronDown } from "lucide-react";
import { useAgents } from "@/contexts/AgentContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Dashboard() {
  const { ollamaStatus } = useAgents();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 h-full relative">
          {/* Sidebar/Left Column */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
            <Card className="flex-1 shadow-md border-muted/40 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-0">
                <Tabs defaultValue="tickets" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-2">
                    <TabsTrigger value="tickets" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Tickets</span>
                    </TabsTrigger>
                    <TabsTrigger value="config" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Config</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tickets" className="pt-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium">Support Tickets</h3>
                      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Plus className="h-3.5 w-3.5" />
                            <span>New Ticket</span>
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-4">
                          <NewTicketForm onSubmitSuccess={() => setDropdownOpen(false)} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <TicketList limit={7} />
                  </TabsContent>
                  
                  <TabsContent value="config" className="pt-2">
                    <OllamaConfig />
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Ticket Details */}
            <Card className="h-auto lg:h-full overflow-hidden shadow-md border-muted/40 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-auto">
                <TicketDetail />
              </CardContent>
            </Card>
            
            {/* AI Agent Results */}
            <Card className="h-auto lg:h-full overflow-hidden shadow-md border-muted/40 backdrop-blur-sm bg-card/95">
              <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    ollamaStatus === "connected" ? "bg-green-500 animate-pulse-subtle" : 
                    ollamaStatus === "error" ? "bg-red-500" : "bg-yellow-500"
                  }`}></div>
                  AI Agent Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-auto">
                <AgentResults />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
