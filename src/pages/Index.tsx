
import { Dashboard } from "@/components/Dashboard";
import { AgentProvider } from "@/contexts/AgentContext";

const Index = () => {
  return (
    <AgentProvider>
      <Dashboard />
    </AgentProvider>
  );
};

export default Index;
