
import { useState } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, AlertCircle, Clock, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TicketListProps {
  limit?: number;
}

export function TicketList({ limit }: TicketListProps) {
  const { tickets, selectTicket, selectedTicket, ollamaStatus, updateTicketStatus } = useAgents();
  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [openTicketsOpen, setOpenTicketsOpen] = useState(true);
  const [resolvedTicketsOpen, setResolvedTicketsOpen] = useState(false);

  const filteredTickets = tickets
    .filter((ticket) => {
      if (filter === "resolved") return ticket.status === "resolved";
      if (filter === "unresolved") return ticket.status !== "resolved";
      return true;
    })
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const resolvedTickets = filteredTickets.filter(ticket => ticket.status === "resolved");
  const openTickets = filteredTickets.filter(ticket => ticket.status !== "resolved");
  
  const displayedOpenTickets = limit ? openTickets.slice(0, limit) : openTickets;
  const displayedResolvedTickets = limit ? resolvedTickets.slice(0, limit) : resolvedTickets;

  const markAsResolved = (ticketId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    updateTicketStatus(ticketId, "resolved");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select defaultValue={filter} onValueChange={(value) => setFilter(value as any)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Filter tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <div
            className={`h-2 w-2 rounded-full mr-1.5 ${
              ollamaStatus === "connected"
                ? "bg-green-500 animate-pulse"
                : ollamaStatus === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          ></div>
          <span className="text-xs text-muted-foreground">
            {ollamaStatus === "connected"
              ? "AI Connected"
              : ollamaStatus === "error"
              ? "AI Error"
              : "AI Disconnected"}
          </span>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm bg-accent/30 rounded-md">
          No tickets found.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
          <Collapsible open={openTicketsOpen} onOpenChange={setOpenTicketsOpen} className="w-full">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2 bg-accent/40 rounded-md mb-2">
              <span className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Open Tickets ({displayedOpenTickets.length})
              </span>
              {openTicketsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {displayedOpenTickets.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm bg-accent/20 rounded-md">
                  No open tickets.
                </div>
              ) : (
                displayedOpenTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id 
                        ? "bg-primary/5 border-primary/30 shadow-sm" 
                        : "hover:bg-accent/30 border-border/50"
                    }`}
                    onClick={() => selectTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">{ticket.subject}</div>
                      <div className="flex space-x-2">
                        <Badge 
                          variant="outline" 
                          className="bg-primary/80 text-xs ml-2 cursor-pointer hover:bg-green-500/80"
                          onClick={(e) => markAsResolved(ticket.id, e)}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" /> Mark Resolved
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ticket.customerName}</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(ticket.createdAt))} ago
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={resolvedTicketsOpen} onOpenChange={setResolvedTicketsOpen} className="w-full">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2 bg-accent/40 rounded-md mb-2">
              <span className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved Tickets ({displayedResolvedTickets.length})
              </span>
              {resolvedTicketsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {displayedResolvedTickets.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm bg-accent/20 rounded-md">
                  No resolved tickets.
                </div>
              ) : (
                displayedResolvedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id 
                        ? "bg-primary/5 border-primary/30 shadow-sm" 
                        : "hover:bg-accent/30 border-border/50"
                    }`}
                    onClick={() => selectTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">{ticket.subject}</div>
                      <Badge 
                        variant="outline" 
                        className="bg-green-500/10 text-green-600 hover:bg-green-500/15 hover:text-green-700 text-xs ml-2"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Resolved
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ticket.customerName}</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(ticket.createdAt))} ago
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
