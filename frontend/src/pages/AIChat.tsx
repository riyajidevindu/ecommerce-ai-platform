import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "user", content: "Hi! What is the status of my order #12345?" },
    { id: "2", role: "assistant", content: "Your order #12345 has been shipped and will arrive by Friday." },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");

  const previewReply = () => {
    // Simulate AI proposal
    setDraft(`Proposed reply: Hello! Thanks for reaching out. ${input}`);
  };

  const approveAndSend = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: Date.now().toString(), role: "assistant", content: draft }]);
    setDraft("");
    setInput("");
  };

  return (
    <div>
      <Helmet>
        <title>AI Chat Automation – AI Seller Assistant</title>
        <meta name="description" content="Preview, approve or edit AI-generated replies before sending." />
        <link rel="canonical" href="/ai-chat" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6">AI Chat Automation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[480px] overflow-auto pr-2">
                {messages.map((m) => (
                  <div key={m.id} className={`p-3 rounded-md border ${m.role === 'assistant' ? 'bg-secondary' : 'bg-card'}`}>
                    <div className="text-xs text-muted-foreground mb-1">{m.role === 'assistant' ? 'Assistant' : 'Customer'}</div>
                    <div>{m.content}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Compose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Customer message context" value={input} onChange={(e) => setInput(e.target.value)} />
              <Button onClick={previewReply}>Generate Reply</Button>
              <Textarea placeholder="Edit the AI draft here" value={draft} onChange={(e) => setDraft(e.target.value)} rows={6} />
              <div className="flex gap-2">
                <Button onClick={approveAndSend}>Approve & Send</Button>
                <Button variant="secondary" onClick={() => setDraft("")}>Discard</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
