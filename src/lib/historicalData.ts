
import { Ticket } from "@/types/agent-types";

// Types for historical data
export interface HistoricalTicket {
  ticketId: string;
  issueCategory: string;
  sentiment: string;
  priority: string;
  solution: string;
  resolutionStatus: string;
  dateOfResolution: string;
}

// Hardcoded historical data (can be replaced with actual data loading function if needed)
export const historicalTickets: HistoricalTicket[] = [
  { ticketId: "TECH_021", issueCategory: "Software Installation Failure", sentiment: "Frustrated", priority: "High", solution: "Disable antivirus and retry installation", resolutionStatus: "Resolved", dateOfResolution: "2025-03-17" },
  { ticketId: "TECH_022", issueCategory: "Software Installation Failure", sentiment: "Frustrated", priority: "High", solution: "Download from direct link", resolutionStatus: "Resolved", dateOfResolution: "2025-03-17" },
  { ticketId: "TECH_023", issueCategory: "Software Installation Failure", sentiment: "Frustrated", priority: "High", solution: "Update to latest version of antivirus", resolutionStatus: "Resolved", dateOfResolution: "2025-03-17" },
  { ticketId: "TECH_024", issueCategory: "Network Connectivity Issue", sentiment: "Confused", priority: "Medium", solution: "Check app permissions for Local Network", resolutionStatus: "Resolved", dateOfResolution: "2025-03-16" },
  { ticketId: "TECH_025", issueCategory: "Network Connectivity Issue", sentiment: "Confused", priority: "Medium", solution: "Clear app cache and relog", resolutionStatus: "Resolved", dateOfResolution: "2025-03-16" },
  { ticketId: "TECH_026", issueCategory: "Network Connectivity Issue", sentiment: "Confused", priority: "Medium", solution: "Reinstall the app", resolutionStatus: "Resolved", dateOfResolution: "2025-03-16" },
  { ticketId: "TECH_027", issueCategory: "Device Compatibility Error", sentiment: "Annoyed", priority: "Critical", solution: "Rollback app to version 4.9", resolutionStatus: "Resolved", dateOfResolution: "2025-03-15" },
  { ticketId: "TECH_028", issueCategory: "Device Compatibility Error", sentiment: "Annoyed", priority: "Critical", solution: "Offer a discount on a compatible thermostat", resolutionStatus: "Resolved", dateOfResolution: "2025-03-15" },
  { ticketId: "TECH_029", issueCategory: "Device Compatibility Error", sentiment: "Annoyed", priority: "Critical", solution: "Contact thermostat support for an update", resolutionStatus: "Resolved", dateOfResolution: "2025-03-15" },
  { ticketId: "TECH_030", issueCategory: "Account Synchronization Bug", sentiment: "Anxious", priority: "High", solution: "Reset sync token manually", resolutionStatus: "Resolved", dateOfResolution: "2025-03-14" },
  { ticketId: "TECH_031", issueCategory: "Account Synchronization Bug", sentiment: "Anxious", priority: "High", solution: "Force Full Sync on both devices", resolutionStatus: "Resolved", dateOfResolution: "2025-03-14" },
  { ticketId: "TECH_032", issueCategory: "Account Synchronization Bug", sentiment: "Anxious", priority: "High", solution: "Clear app cache and relog", resolutionStatus: "Resolved", dateOfResolution: "2025-03-14" },
  { ticketId: "TECH_033", issueCategory: "Payment Gateway Integration Failure", sentiment: "Urgent", priority: "Critical", solution: "Upgrade server to TLS 1.3", resolutionStatus: "Resolved", dateOfResolution: "2025-03-13" },
  { ticketId: "TECH_034", issueCategory: "Payment Gateway Integration Failure", sentiment: "Urgent", priority: "Critical", solution: "Verify SSL certificate settings", resolutionStatus: "Resolved", dateOfResolution: "2025-03-13" },
  { ticketId: "TECH_035", issueCategory: "Payment Gateway Integration Failure", sentiment: "Urgent", priority: "Critical", solution: "Use a different gateway API", resolutionStatus: "Resolved", dateOfResolution: "2025-03-13" },
  { ticketId: "TECH_036", issueCategory: "Payment Gateway Integration Failure", sentiment: "Urgent", priority: "Critical", solution: "Check server firewall settings", resolutionStatus: "Resolved", dateOfResolution: "2025-03-13" }
];

// Function to get relevant historical data for a ticket
export function getRelevantHistoricalData(ticket: Ticket): string {
  // Simple keyword matching to find relevant tickets
  const keywords = ticket.subject.toLowerCase().split(" ").concat(
    ticket.description.toLowerCase().split(" ")
  );
  
  // Find historical tickets with matching keywords in their issue category
  const relevantTickets = historicalTickets.filter(histTicket => {
    const category = histTicket.issueCategory.toLowerCase();
    return keywords.some(keyword => 
      keyword.length > 3 && category.includes(keyword)
    );
  });

  if (relevantTickets.length === 0) {
    return "No historical data available for this type of issue.";
  }

  // Format relevant tickets as a string
  return relevantTickets.map(ticket => 
    `Case #${ticket.ticketId}: ${ticket.issueCategory} (${ticket.sentiment}). ` +
    `Solution: ${ticket.solution}. Priority: ${ticket.priority}. ` +
    `Resolved on: ${ticket.dateOfResolution}.`
  ).join("\n");
}

// Sample conversation data
const conversations = {
  "Software Installation Failure": 
`Customer: I'm having trouble installing your software. It keeps failing at 75%.
Agent: I understand that's frustrating. Could you tell me if you have any antivirus running?
Customer: Yes, I have Norton.
Agent: That might be interfering. Could you try temporarily disabling Norton and attempting the installation again?
Customer: That worked! Thank you.`,

  "Network Connectivity Issue":
`Customer: Your app won't connect to my network even though everything else works fine.
Agent: That's strange. Are you on WiFi or cellular data?
Customer: WiFi at home.
Agent: Let's check if the app has proper network permissions. On your device, could you go to Settings > Apps > Our App > Permissions?
Customer: It says the app doesn't have Local Network permission!
Agent: Let's enable that and try again.
Customer: Perfect, it's working now.`,

  "Device Compatibility Error":
`Customer: I'm getting an error saying my smart thermostat isn't compatible with your latest update.
Agent: I apologize for the inconvenience. What model of thermostat do you have?
Customer: I have the HomeTemp TX-200.
Agent: I see the issue. The TX-200 requires app version 4.9 for compatibility. Our latest update (5.0) has known issues with it. Let me help you downgrade.
Customer: Thank you, that fixed it.`,

  "Account Synchronization Bug":
`Customer: My account isn't syncing between my phone and tablet.
Agent: That's definitely frustrating. When did you first notice this issue?
Customer: After the last update, about 3 days ago.
Agent: We've identified a sync token issue in that update. Let me walk you through manually resetting it.
Customer: That's fixed it! Everything is showing up now.`,

  "Payment Gateway Integration Failure":
`Customer: We're trying to integrate your payment API but keep getting SSL handshake errors.
Agent: That suggests there might be a TLS version mismatch. What version of TLS is your server running?
Customer: We're on TLS 1.2.
Agent: Our new gateway requires TLS 1.3. You'll need to upgrade your server configuration.
Customer: We'll make that change and test again. Thanks for identifying the issue.`
};

// Function to get relevant conversation data
export function getRelevantConversation(ticket: Ticket): string {
  // Simple keyword matching to find relevant conversation
  const keywords = ticket.subject.toLowerCase().split(" ").concat(
    ticket.description.toLowerCase().split(" ")
  );
  
  let bestMatch = "";
  let highestMatchCount = 0;
  
  Object.entries(conversations).forEach(([category, conversation]) => {
    const categoryLower = category.toLowerCase();
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      if (keyword.length > 3 && categoryLower.includes(keyword)) {
        matchCount++;
      }
    });
    
    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      bestMatch = category;
    }
  });
  
  if (highestMatchCount === 0) {
    return "No relevant conversation history available.";
  }
  
  return `Related conversation about "${bestMatch}":\n${conversations[bestMatch]}`;
}

// Function to get combined historical data (both ticket data and conversations)
export function getCombinedHistoricalData(ticket: Ticket): string {
  const ticketData = getRelevantHistoricalData(ticket);
  const conversationData = getRelevantConversation(ticket);
  
  return `${ticketData}\n\n${conversationData}`;
}
