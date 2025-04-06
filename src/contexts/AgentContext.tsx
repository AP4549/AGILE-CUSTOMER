import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AgentResponse, Ticket } from '@/types/agent-types';
import { ollamaClient } from '@/lib/ollama';
import { useToast } from '@/components/ui/use-toast';
import { getCombinedHistoricalData } from '@/lib/historicalData';

interface AgentContextType {
  tickets: Ticket[];
  agentResponses: AgentResponse[];
  selectedTicket: Ticket | null;
  isProcessing: boolean;
  addTicket: (ticket: Ticket) => void;
  selectTicket: (ticketId: string) => void;
  processTicket: (ticketId: string) => Promise<void>;
  configureOllama: (baseUrl: string, model: string, mode?: string) => void;
  ollamaStatus: 'disconnected' | 'connected' | 'error';
  ollamaConfig: {
    baseUrl: string;
    model: string;
    mode: string;
  };
  updateTicketStatus: (ticketId: string, status: 'new' | 'in-progress' | 'resolved' | 'closed') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Sample historical data
const mockHistoricalData = `
Case #1: Customer reported login issues. Resolution: Cleared browser cache and reset password. Time to resolve: 25 minutes.
Case #2: Customer couldn't access premium features. Resolution: Account was not properly upgraded, fixed subscription status. Time to resolve: 45 minutes.
Case #3: Customer experienced slow performance. Resolution: Identified network congestion during peak hours, recommended off-peak usage. Time to resolve: 30 minutes.
`;

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "T001",
      subject: "Cannot login to my account",
      description: "I've been trying to login to my account for the past hour but keep getting 'invalid credentials'.",
      customerName: "Alex Johnson",
      customerEmail: "alex.johnson@example.com",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T002",
      subject: "Billing issue with my recent purchase",
      description: "I was charged twice for my subscription renewal last week.",
      customerName: "Sarah Miller",
      customerEmail: "sarah.miller@example.com",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: "resolved",
    },
    {
      id: "T003",
      subject: "Product feature request",
      description: "I think it would be much better if you could add a dark mode option.",
      customerName: "Miguel Rodriguez",
      customerEmail: "miguel.r@example.com",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T004",
      subject: "Software installation issue",
      description: "The software installation fails at 75% with an unknown error.",
      customerName: "Emily Davis",
      customerEmail: "emily.davis@example.com",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T005",
      subject: "Account synchronization problem",
      description: "My project data isn't syncing between my laptop and tablet.",
      customerName: "John Smith",
      customerEmail: "john.smith@example.com",
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      status: "resolved",
    },
    {
      id: "T009",
      subject: "Mobile app crashes on startup",
      description: "Your mobile app crashes immediately after the splash screen on my iPhone 15 Pro. I've already tried reinstalling it but the issue persists.",
      customerName: "Rachel Green",
      customerEmail: "rachel.green@example.com",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T010",
      subject: "Cannot access premium content",
      description: "I purchased the premium plan yesterday but I still can't access any of the premium content. My account shows I'm a premium member.",
      customerName: "Ross Geller",
      customerEmail: "ross.geller@example.com",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T011",
      subject: "Error during checkout process",
      description: "I keep getting an 'Invalid payment method' error when trying to complete my purchase, but my credit card works fine on other sites.",
      customerName: "Chandler Bing",
      customerEmail: "chandler.bing@example.com",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T012",
      subject: "Data export not working",
      description: "When I try to export my data as CSV, the download starts but the file is always empty. I need this data for a presentation tomorrow.",
      customerName: "Monica Geller",
      customerEmail: "monica.geller@example.com",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T013",
      subject: "API integration failing",
      description: "We're trying to integrate your API with our system but keep getting 403 Forbidden errors despite using the correct API key.",
      customerName: "Joey Tribbiani",
      customerEmail: "joey.tribbiani@example.com",
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T014",
      subject: "Request for bulk user import",
      description: "We need to migrate 500+ users from our old system to your platform. Is there a way to do this in bulk rather than one by one?",
      customerName: "Phoebe Buffay",
      customerEmail: "phoebe.buffay@example.com",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T015",
      subject: "Authentication failure with SAML SSO",
      description: "We're trying to set up SAML SSO for our organization, but users keep getting authentication failures when they attempt to log in through our identity provider.",
      customerName: "Ted Mosby",
      customerEmail: "ted.mosby@example.com",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T016",
      subject: "Performance degradation in dashboard",
      description: "Our team has noticed significant slowdowns in the analytics dashboard over the past week. Pages that used to load in seconds now take 30+ seconds to render.",
      customerName: "Barney Stinson",
      customerEmail: "barney.stinson@example.com",
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T017",
      subject: "Email notifications not being delivered",
      description: "Our users have stopped receiving email notifications for important events. We've checked our email settings and everything appears to be configured correctly.",
      customerName: "Robin Scherbatsky",
      customerEmail: "robin.scherbatsky@example.com",
      createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T018",
      subject: "Custom domain configuration issue",
      description: "We've been trying to set up our custom domain for a week now but keep getting SSL certificate errors when we visit the site. DNS records appear to be correct.",
      customerName: "Lily Aldrin",
      customerEmail: "lily.aldrin@example.com",
      createdAt: new Date(Date.now() - 38 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "T019",
      subject: "Data visualization renders incorrectly",
      description: "The charts in our reports module are displaying incorrect data. The numbers in the tables are correct, but the visualizations don't match the values.",
      customerName: "Marshall Eriksen",
      customerEmail: "marshall.eriksen@example.com",
      createdAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
  ]);

  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [ollamaConfig, setOllamaConfig] = useState({
    baseUrl: "http://localhost:11434",
    model: "llama3",
    mode: "direct" // "direct" (browser to Ollama) or "backend" (via API server)
  });
  
  const { toast } = useToast();

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
  }, []);

  const selectTicket = useCallback((ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId) || null;
    setSelectedTicket(ticket);
  }, [tickets]);

  const configureOllama = useCallback((baseUrl: string, model: string, mode: string = "direct") => {
    // Store the original baseUrl for later reference
    let ollamaEndpoint = baseUrl;
    
    // If using backend mode, make sure we're using the right URL for backend
    if (mode === "backend" && baseUrl === "http://localhost:11434") {
      // If the user is trying to use backend mode but provided the Ollama URL,
      // automatically change to the Flask backend URL
      baseUrl = "http://localhost:5000";
      toast({
        title: "URL Automatically Updated",
        description: `Backend mode requires the Flask API URL (changed to ${baseUrl})`,
      });
    }
    
    setOllamaConfig({ baseUrl, model, mode });
    
    // If using backend mode, test backend connection
    if (mode === "backend") {
      console.log(`Attempting to connect to backend API at ${baseUrl}/status`);
      
      // First make sure the URL is valid
      if (!baseUrl.startsWith('http')) {
        setOllamaStatus('error');
        toast({
          title: "Invalid Backend URL",
          description: `URL must start with http:// or https://`,
          variant: "destructive",
        });
        return;
      }
      
      fetch(`${baseUrl}/status`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Failed to connect to backend: ${response.status} ${response.statusText}`);
          }
        })
        .then(data => {
          console.log("Backend API connection successful:", data);
          setOllamaStatus('connected');
          toast({
            title: "Backend Connected",
            description: `Successfully connected to backend API at ${baseUrl}`,
          });
        })
        .catch(error => {
          console.error("Failed to connect to backend:", error);
          setOllamaStatus('error');
          
          // Provide more helpful error message
          let errorMessage = error.message;
          if (error.message.includes("404")) {
            errorMessage = `Backend API endpoint not found (404). Make sure the Flask server is running at ${baseUrl} and has a /status endpoint.`;
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage = `Cannot reach the server at ${baseUrl}. Make sure the Flask server is running and CORS is enabled.`;
          }
          
          toast({
            title: "Backend Connection Failed",
            description: errorMessage,
            variant: "destructive",
          });
        });
      return;
    }
    
    // Direct Ollama connection (original code)
    fetch(`${baseUrl}/api/tags`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to connect: ${response.status}`);
        }
      })
      .then(data => {
        console.log("Ollama API connection successful:", data);
        
        const modelExists = data.models && data.models.some((m: any) => 
          m.name === model || m.name.startsWith(`${model}:`)
        );
        
        if (!modelExists) {
          console.log("Available models:", data.models);
          if (data.models && data.models.length > 0) {
            setOllamaStatus('connected');
            toast({
              title: "Model Not Found",
              description: `The model '${model}' was not found, but Ollama is connected. Please pull the model with 'ollama pull ${model}'`,
              variant: "destructive",
            });
          } else {
            setOllamaStatus('connected');
            toast({
              title: "Ollama Connected",
              description: `Connected to Ollama API. Please pull the '${model}' model with 'ollama pull ${model}'`,
            });
          }
        } else {
          setOllamaStatus('connected');
          toast({
            title: "Ollama Connected",
            description: `Successfully connected to Ollama at ${baseUrl} with model ${model}`,
          });
        }
      })
      .catch(error => {
        console.error("Failed to connect to Ollama:", error);
        setOllamaStatus('error');
        toast({
          title: "Ollama Connection Failed",
          description: `Could not connect to Ollama: ${error.message}. Make sure Ollama is running.`,
          variant: "destructive",
        });
      });
  }, [toast]);

  const updateTicketStatus = useCallback((ticketId: string, status: 'new' | 'in-progress' | 'resolved' | 'closed') => {
    setTickets(prev => 
      prev.map(t => t.id === ticketId ? { ...t, status } : t)
    );
    
    if (status === 'resolved') {
      toast({
        title: "Ticket Resolved",
        description: `Ticket ${ticketId} has been marked as resolved.`,
      });
    }
  }, [toast]);

  const processTicket = useCallback(async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      toast({
        title: "Error",
        description: `Ticket ${ticketId} not found`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    toast({
      title: "Processing Ticket",
      description: `AI agents are analyzing ticket ${ticketId}...`,
    });

    try {
      // Choose processing method based on connection mode
      if (ollamaConfig.mode === "backend") {
        // Process via backend API
        const response = await fetch(`${ollamaConfig.baseUrl}/process-ticket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            ticket,
            model: ollamaConfig.model
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update ticket status
        setTickets(prev => 
          prev.map(t => t.id === ticketId ? { 
            ...t, 
            status: 'in-progress' as const,
            estimatedResolution: result.timeEstimation ? new Date(Date.now() + result.timeEstimation.estimatedMinutes * 60 * 1000).toISOString() : undefined,
            priority: result.actions?.actions?.some((a: any) => a.priority === 'high') ? 'high' : 
                     result.actions?.actions?.some((a: any) => a.priority === 'medium') ? 'medium' : 'low'
          } : t)
        );
        
        // Add agent response
        const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setAgentResponses(prev => [...prev, {
          id: responseId,
          ticketId,
          timestamp: new Date().toISOString(),
          ...result
        }]);
        
      } else {
        // Original direct Ollama processing
        const client = ollamaClient;
        client.setConfig(ollamaConfig.baseUrl, ollamaConfig.model);

        const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        setTickets(prev => 
          prev.map(t => t.id === ticketId ? { ...t, status: 'in-progress' as const } : t)
        );

        const initialResponse: AgentResponse = {
          id: responseId,
          ticketId,
          timestamp: new Date().toISOString()
        };
        
        setAgentResponses(prev => [...prev, initialResponse]);

        const historicalData = getCombinedHistoricalData(ticket);

        const [summary, actions, routing, recommendations, timeEstimation] = await Promise.all([
          client.generateSummary(ticket),
          client.extractActions(ticket),
          client.suggestRouting(ticket),
          client.recommendResolutions(ticket, historicalData),
          client.estimateResolutionTime(ticket, historicalData)
        ]);

        const completeResponse: AgentResponse = {
          ...initialResponse,
          summary,
          actions,
          routing,
          recommendations,
          timeEstimation
        };

        setAgentResponses(prev => 
          prev.map(r => r.id === responseId ? completeResponse : r)
        );

        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + timeEstimation.estimatedMinutes);
        
        setTickets(prev => 
          prev.map(t => t.id === ticketId ? { 
            ...t, 
            estimatedResolution: estimatedTime.toISOString(),
            priority: actions.actions.some(a => a.priority === 'high') ? 'high' : 
                     actions.actions.some(a => a.priority === 'medium') ? 'medium' : 'low'
          } : t)
        );
      }

      toast({
        title: "Analysis Complete",
        description: `AI agents have completed analysis of ticket ${ticketId}`,
      });
    } catch (error) {
      console.error("Error processing ticket:", error);
      toast({
        title: "Processing Error",
        description: `Error analyzing ticket: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [tickets, ollamaConfig, toast]);

  useEffect(() => {
    configureOllama(ollamaConfig.baseUrl, ollamaConfig.model, ollamaConfig.mode);
  }, []);

  // Fetch tickets from the backend
  useEffect(() => {
    fetch("http://localhost:5000/tickets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        return response.json();
      })
      .then((data) => {
        setTickets(data); // Replace dummy tickets with fetched tickets
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
      });
  }, []);

  return (
    <AgentContext.Provider
      value={{
        tickets,
        agentResponses,
        selectedTicket,
        isProcessing,
        addTicket,
        selectTicket,
        processTicket,
        configureOllama,
        ollamaStatus,
        ollamaConfig,
        updateTicketStatus
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};
