import os
import csv
import json
from pathlib import Path

class DataLoader:
    def __init__(self):
        """Initialize data loader and load historical ticket data and conversations"""
        self.data_dir = Path(__file__).parent / "data"
        self.historical_tickets = self._load_historical_tickets()
        self.conversations = self._load_conversations()
        print(f"Loaded {len(self.historical_tickets)} historical tickets and {len(self.conversations)} conversations")

    def _load_historical_tickets(self):
        """Load historical ticket data from CSV file"""
        tickets = []
        csv_path = self.data_dir / "Historical_ticket_data.csv"
        
        try:
            with open(csv_path, mode='r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                for row in csv_reader:
                    # Clean up the row data (remove whitespace from keys)
                    clean_row = {k.strip(): v.strip() for k, v in row.items()}
                    tickets.append(clean_row)
            return tickets
        except Exception as e:
            print(f"Error loading historical tickets: {e}")
            return []

    def _load_conversations(self):
        """Load conversation examples from the Conversation directory"""
        conversations = {}
        conv_dir = self.data_dir / "Conversation"
        
        if not conv_dir.exists():
            print(f"Conversation directory not found: {conv_dir}")
            return {}
            
        try:
            for file_path in conv_dir.glob("*.txt"):
                category = file_path.stem
                with open(file_path, mode='r', encoding='utf-8') as file:
                    content = file.read()
                    conversations[category] = content
            return conversations
        except Exception as e:
            print(f"Error loading conversations: {e}")
            return {}

    def get_combined_data_for_ticket(self, ticket):
        """Get relevant historical data and conversations for a ticket"""
        # Simple keyword matching to find relevant tickets
        keywords = ticket['subject'].lower().split() + ticket['description'].lower().split()
        keywords = [k for k in keywords if len(k) > 3]  # Filter short words
        
        # Find relevant historical tickets
        relevant_tickets = []
        for hist_ticket in self.historical_tickets:
            category = hist_ticket.get('Issue Category', '').lower()
            if any(keyword in category for keyword in keywords):
                relevant_tickets.append(hist_ticket)
        
        # Find relevant conversations
        relevant_conversation = None
        best_match_count = 0
        for category, conversation in self.conversations.items():
            category_lower = category.lower()
            match_count = sum(1 for keyword in keywords if keyword in category_lower)
            if match_count > best_match_count:
                best_match_count = match_count
                relevant_conversation = conversation
        
        # Combine the data
        combined_data = ""
        
        if relevant_tickets:
            combined_data += "Historical similar cases:\n"
            for ticket in relevant_tickets[:3]:  # Limit to 3 most relevant
                combined_data += f"Case #{ticket.get('Ticket ID', 'Unknown')}: "
                combined_data += f"{ticket.get('Issue Category', 'Unknown issue')} ({ticket.get('Sentiment', 'Unknown sentiment')}). "
                combined_data += f"Solution: {ticket.get('Solution', 'No solution recorded')}. "
                combined_data += f"Priority: {ticket.get('Priority', 'Unknown priority')}.\n"
        
        if relevant_conversation:
            combined_data += "\nRelated conversation example:\n"
            combined_data += relevant_conversation
        
        return combined_data
