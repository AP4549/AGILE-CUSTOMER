
import { useState } from "react";
import { useAgents } from "@/contexts/AgentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewTicketFormProps {
  onSubmitSuccess?: () => void;
}

export function NewTicketForm({ onSubmitSuccess }: NewTicketFormProps) {
  const { addTicket } = useAgents();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    customerName: "",
    customerEmail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = {
      id: `T${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      status: "new" as "new", // Explicitly cast the status to the correct type
    };
    addTicket(newTicket);
    setFormData({ subject: "", description: "", customerName: "", customerEmail: "" });
    
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>
      <div>
        <Textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full min-h-[80px]"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="customerEmail"
          placeholder="Customer Email"
          value={formData.customerEmail}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Ticket
      </Button>
    </form>
  );
}
