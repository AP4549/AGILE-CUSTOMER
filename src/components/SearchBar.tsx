
import { useState, useEffect } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: "ticket" | "customer" | "solution";
};

export function SearchBar() {
  const { tickets, selectTicket } = useAgents();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Search tickets based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    
    // Search through tickets
    const ticketResults = tickets
      .filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery) || 
        ticket.description.toLowerCase().includes(searchQuery) ||
        ticket.customerName.toLowerCase().includes(searchQuery)
      )
      .map(ticket => ({
        id: ticket.id,
        title: ticket.subject,
        description: `${ticket.customerName} - ${ticket.description.substring(0, 60)}${ticket.description.length > 60 ? '...' : ''}`,
        type: "ticket" as const
      }));
    
    // Add mock customer results for demonstration
    const customerResults = [
      { id: "c1", title: "Alice Brown", description: "Premium customer - 5 active tickets", type: "customer" as const },
      { id: "c2", title: "Bob Smith", description: "Regular customer - 2 resolved tickets", type: "customer" as const },
    ].filter(customer => customer.title.toLowerCase().includes(searchQuery));
    
    // Add mock solution results for demonstration
    const solutionResults = [
      { id: "s1", title: "Payment Gateway Integration", description: "Steps to resolve SSL certificate issues", type: "solution" as const },
      { id: "s2", title: "Device Compatibility", description: "Common fixes for older device models", type: "solution" as const },
    ].filter(solution => solution.title.toLowerCase().includes(searchQuery));
    
    setResults([...ticketResults, ...customerResults, ...solutionResults]);
    
  }, [query, tickets]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (id: string, type: string) => {
    setIsOpen(false);
    setQuery("");
    
    if (type === "ticket") {
      selectTicket(id);
    }
    // For demo purposes, we'll just close the dialog for other types
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search tickets...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput 
          placeholder="Search tickets, customers, solutions..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <>
              {results.some(r => r.type === "ticket") && (
                <CommandGroup heading="Tickets">
                  {results.filter(r => r.type === "ticket").map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id, result.type)}
                    >
                      <div className="text-sm">
                        <div className="font-semibold">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.some(r => r.type === "customer") && (
                <CommandGroup heading="Customers">
                  {results.filter(r => r.type === "customer").map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id, result.type)}
                    >
                      <div className="text-sm">
                        <div className="font-semibold">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.some(r => r.type === "solution") && (
                <CommandGroup heading="Solutions">
                  {results.filter(r => r.type === "solution").map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.id, result.type)}
                    >
                      <div className="text-sm">
                        <div className="font-semibold">{result.title}</div>
                        <div className="text-xs text-muted-foreground">{result.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
