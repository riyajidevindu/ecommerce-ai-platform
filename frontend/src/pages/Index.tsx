import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>AI Seller Assistant – Modern e-commerce automation</title>
        <meta name="description" content="AI-powered assistant for e-commerce: WhatsApp integration, stock management, and automated chat replies." />
        <link rel="canonical" href="/" />
      </Helmet>
      <div className="text-center animate-enter">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">AI Seller Assistant</h1>
        <p className="text-lg text-muted-foreground mb-6">Streamline customer conversations, manage stock, and boost sales.</p>
        <div className="flex gap-3 justify-center">
          <NavLink to="/dashboard"><Button>Open Dashboard</Button></NavLink>
          <NavLink to="/login"><Button variant="secondary">Login</Button></NavLink>
        </div>
      </div>
    </div>
  );
};

export default Index;
