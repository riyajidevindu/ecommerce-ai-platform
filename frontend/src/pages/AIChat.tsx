import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

interface Message {
  id: number;
  user_id: number;
  message: string;
  response: string | null;
  created_at: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/messages");
      if (!response.ok) {
        throw new Error("Failed to fetch messages.");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMessages = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/v1/process-messages", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to process messages.");
      }
      // Refresh messages after processing
      fetchMessages();
    } catch (error) {
      console.error("Error processing messages:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div>
      <Helmet>
        <title>AI Automated Responses – AI Seller Assistant</title>
        <meta name="description" content="View automated AI-generated responses to customer messages." />
        <link rel="canonical" href="/ai-chat" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-semibold">AI Automated Responses</h1>
        <div className="flex gap-2">
          <Button onClick={fetchMessages} disabled={isLoading}>
            <ReloadIcon className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={processMessages} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Process New Messages"}
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <p className="text-muted-foreground">No conversations yet. New messages from WhatsApp will appear here.</p>
              )}
              {isLoading && <p>Loading conversations...</p>}
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-md border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">User ID: {msg.user_id}</span>
                    <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-md bg-card mb-2">
                    <p className="font-semibold mb-1">Customer Message:</p>
                    <p>{msg.message}</p>
                  </div>
                  <div className={`p-3 rounded-md ${msg.response ? 'bg-secondary' : 'bg-muted'}`}>
                    <p className="font-semibold mb-1">AI Response:</p>
                    <p>{msg.response || "Awaiting response..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
