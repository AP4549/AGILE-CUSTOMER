
export type Priority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority?: Priority;
  assignedTo?: string;
  estimatedResolution?: string;
}

export interface AgentSummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AgentAction {
  actions: {
    type: 'escalation' | 'follow-up' | 'information' | 'resolution';
    description: string;
    priority: Priority;
  }[];
}

export interface AgentRouting {
  recommendedTeam: 'technical-support' | 'billing' | 'product' | 'sales' | 'general';
  confidence: number;
  alternativeTeams: {
    team: string;
    confidence: number;
  }[];
  reasoning: string;
}

export interface AgentRecommendation {
  suggestedResolutions: {
    title: string;
    steps: string[];
    confidence: number;
    source?: string;
  }[];
}

export interface AgentTimeEstimation {
  estimatedMinutes: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
  }[];
}

export interface AgentResponse {
  id: string;
  ticketId: string;
  timestamp: string;
  summary?: AgentSummary;
  actions?: AgentAction;
  routing?: AgentRouting;
  recommendations?: AgentRecommendation;
  timeEstimation?: AgentTimeEstimation;
}
