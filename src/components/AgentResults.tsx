
import { useAgents } from "@/contexts/AgentContext";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Clock, 
  FilterX, 
  List, 
  BarChart, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Lightbulb
} from "lucide-react";

export function AgentResults() {
  const { selectedTicket, agentResponses } = useAgents();
  
  const ticketResponses = selectedTicket 
    ? agentResponses.filter(resp => resp.ticketId === selectedTicket.id)
    : [];
  
  const latestResponse = ticketResponses.length > 0 
    ? ticketResponses[ticketResponses.length - 1] 
    : null;
  
  if (!selectedTicket) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center max-w-xs">
          <FilterX className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <h3 className="font-medium mb-1">No Ticket Selected</h3>
          <p className="text-sm">Select a ticket from the list to view AI analysis</p>
        </div>
      </div>
    );
  }
  
  if (!latestResponse || !latestResponse.summary) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center max-w-xs">
          <Brain className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <h3 className="font-medium mb-1">No Analysis Available</h3>
          <p className="text-sm">Process the ticket with AI to view analysis results</p>
        </div>
      </div>
    );
  }

  // Determine sentiment icon
  const SentimentIcon = latestResponse.summary.sentiment === "positive" 
    ? ThumbsUp 
    : latestResponse.summary.sentiment === "negative" 
      ? ThumbsDown 
      : Brain;

  return (
    <ScrollArea className="h-[calc(100vh-200px)] py-2 px-4">
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="space-y-3">
          <div className="flex items-center text-sm font-medium text-primary">
            <Brain className="mr-2 h-4 w-4" />
            AI Summary
          </div>
          <div className="bg-muted/30 rounded-md p-4 border border-border/50">
            <p className="text-sm mb-3">{latestResponse.summary.summary}</p>
            <div className="flex items-center">
              <Badge variant={
                latestResponse.summary.sentiment === "positive" ? "secondary" :
                latestResponse.summary.sentiment === "negative" ? "destructive" : "outline"
              } className={
                latestResponse.summary.sentiment === "positive" 
                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : 
                latestResponse.summary.sentiment === "negative"
                ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                : ""
              }>
                <SentimentIcon className="mr-1 h-3 w-3" />
                {latestResponse.summary.sentiment} sentiment
              </Badge>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase font-medium text-muted-foreground mb-2 flex items-center">
              <Lightbulb className="h-3 w-3 mr-1" />
              Key Points
            </h4>
            <ul className="grid gap-2">
              {latestResponse.summary.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Separator className="bg-border/50" />
        
        <Accordion type="single" collapsible className="w-full">
          {/* Actions Section */}
          <AccordionItem value="actions" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <div className="flex items-center text-primary">
                <List className="mr-2 h-4 w-4" />
                Recommended Actions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {latestResponse.actions?.actions.map((action: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-md p-3 border border-border/50">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{action.type}</span>
                      <Badge variant={
                        action.priority === "high" ? "destructive" :
                        action.priority === "medium" ? "secondary" : "outline"
                      } className={
                        action.priority === "high" 
                        ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200" :
                        action.priority === "medium"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200" 
                      }>
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Routing Section */}
          <AccordionItem value="routing" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <div className="flex items-center text-primary">
                <Users className="mr-2 h-4 w-4" />
                Team Routing
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                <div className="bg-muted/30 rounded-md p-3 border border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Recommended Team</h4>
                    <Badge variant="outline" className="bg-support-routing/10 text-support-routing border-support-routing/30">
                      {Math.round(latestResponse.routing?.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="text-sm mt-2 font-medium">{latestResponse.routing?.recommendedTeam}</div>
                  <p className="text-xs text-muted-foreground mt-2 bg-background/50 p-2 rounded border border-border/30">{latestResponse.routing?.reasoning}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Time Estimation Section */}
          <AccordionItem value="time" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <div className="flex items-center text-primary">
                <Clock className="mr-2 h-4 w-4" />
                Resolution Time
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                <div className="bg-muted/30 rounded-md p-3 border border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Estimated Time</h4>
                    <Badge variant="outline" className="bg-blue-100/30 text-blue-700 border-blue-200">
                      {Math.round(latestResponse.timeEstimation?.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="mt-2 p-2 rounded bg-primary/5 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <p className="text-sm font-medium">
                      {latestResponse.timeEstimation?.estimatedMinutes} minutes 
                      ({Math.floor(latestResponse.timeEstimation?.estimatedMinutes / 60)} hours and {latestResponse.timeEstimation?.estimatedMinutes % 60} minutes)
                    </p>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-xs uppercase font-medium text-muted-foreground mb-2">Contributing Factors</h5>
                    <div className="border border-border/50 rounded-md overflow-hidden">
                      {latestResponse.timeEstimation?.factors.map((factor: any, idx: number) => (
                        <div key={idx} className={`flex justify-between items-center text-xs px-3 py-2 ${idx % 2 === 0 ? 'bg-muted/30' : 'bg-background/80'}`}>
                          <span>{factor.name}</span>
                          <Badge variant={
                            factor.impact > 10 ? "destructive" : 
                            factor.impact > 5 ? "secondary" : "outline"
                          } className={`text-[10px] ${
                            factor.impact > 10 ? 'bg-red-100/70 text-red-800 border-red-200' :
                            factor.impact > 5 ? 'bg-amber-100/70 text-amber-800 border-amber-200' :
                            'bg-blue-100/70 text-blue-800 border-blue-200'
                          }`}>
                            {factor.impact > 0 ? "+" : ""}{factor.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
