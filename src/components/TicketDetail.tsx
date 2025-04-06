
import { FC } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ticket } from "@/types/agent-types";
import { Bot, Clock, User, Mail, AlertCircle } from "lucide-react";

export const TicketDetail: FC = () => {
  const { selectedTicket, isProcessing, processTicket, ollamaStatus } = useAgents();

  if (!selectedTicket) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-muted-foreground text-center">
        <div className="max-w-xs">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-medium mb-1">No Ticket Selected</h3>
          <p className="text-sm">Select a ticket from the list to view its details</p>
        </div>
      </div>
    );
  }

  const handleProcess = () => {
    processTicket(selectedTicket.id);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">{selectedTicket.subject}</h2>
          <div className="text-sm text-muted-foreground">Ticket #{selectedTicket.id}</div>
        </div>
        <StatusBadge ticket={selectedTicket} />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-accent/30">
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium">{selectedTicket.customerName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{selectedTicket.customerEmail}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Created {formatDistanceToNow(new Date(selectedTicket.createdAt))} ago</span>
        </div>

        {selectedTicket.estimatedResolution && (
          <div className="text-sm">
            <Badge variant="outline" className="bg-support-low/10 text-support-low">
              Est. Resolution: {formatDistanceToNow(new Date(selectedTicket.estimatedResolution))}
            </Badge>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium mb-2">Description</h3>
        <div className="text-sm whitespace-pre-line bg-muted/30 p-4 rounded-md border border-border/50">
          {selectedTicket.description}
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          className="w-full gap-2 relative overflow-hidden transition-all group"
          onClick={handleProcess}
          disabled={isProcessing || ollamaStatus !== 'connected'}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Bot className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
            {isProcessing ? "AI Processing..." : "Process with AI Agent"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></span>
        </Button>
        
        {ollamaStatus !== 'connected' && (
          <div className="text-xs text-center mt-2 text-amber-500">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Connect to Ollama in the Config tab to enable AI processing
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: FC<{ ticket: Ticket }> = ({ ticket }) => {
  let className = "";
  
  switch (ticket.status) {
    case "new":
      className = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      break;
    case "in-progress":
      className = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      break;
    case "resolved":
      className = "bg-green-500/10 text-green-500 border-green-500/20";
      break;
    case "closed":
      className = "bg-gray-500/10 text-gray-500 border-gray-500/20";
      break;
  }
  
  let label = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("-", " ");
  
  return <Badge variant="outline" className={className}>{label}</Badge>;
};
