import { useState, useEffect, useMemo } from 'react';
import { Helmet } from "react-helmet-async";
import { getConversations, Conversation, Message, getCurrentUser } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Bot, Search } from 'lucide-react';
import './AIChat.css';

const AIChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Scope conversations to the currently logged-in user
        const me = await getCurrentUser();
        const data = await getConversations(me.id);
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch conversations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c =>
      c.whatsapp_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.first_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>AI Conversations – AI Seller Assistant</title>
        <meta name="description" content="Browse customer conversations handled by the AI agent." />
        <link rel="canonical" href="/ai-chat" />
      </Helmet>
  <div className="chat-container" style={{ color: "hsl(var(--foreground))" }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-foreground">Conversations</h1>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            {filteredConversations.map((c) => {
              const fallbackId = c.messages?.[0]?.customer_id ? `customer:${c.messages[0].customer_id}` : undefined;
              const convKey = c.whatsapp_no || fallbackId || Math.random().toString(36).slice(2);
              const displayName = c.whatsapp_no || fallbackId || 'Customer';
              const avatarSeed = c.whatsapp_no || fallbackId || 'customer';
              const avatarFallback = (c.whatsapp_no || 'CU').slice(0, 2).toUpperCase();
              return (
              <div
                key={convKey}
                className={`p-4 border-b cursor-pointer hover:bg-muted ${selectedConversation === c ? 'bg-muted' : ''}`}
                onClick={() => setSelectedConversation(c)}
              >
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${avatarSeed}`} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 overflow-hidden min-w-0">
                    <p className="font-semibold truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground truncate break-words">{c.first_message}</p>
                  </div>
                </div>
              </div>
            );})}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center">
                <Avatar>
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedConversation.whatsapp_no || 'customer'}`} />
                  <AvatarFallback>{(selectedConversation.whatsapp_no || 'CU').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold ml-3 text-foreground">{selectedConversation.whatsapp_no || (selectedConversation.messages?.[0]?.customer_id ? `customer:${selectedConversation.messages[0].customer_id}` : 'Customer')}</h2>
              </div>
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="flex flex-col gap-4">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className="flex flex-col items-start">
                      <div className="message-bubble user-message break-words">
                        <p className="font-semibold mb-1">You</p>
                        <p>{message.user_message}</p>
                      </div>
                      {message.response_message && (
                        <div className="message-bubble ai-message mt-2 break-words">
                          <p className="font-semibold mb-1">AI Assistant</p>
                          <p>{message.response_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="h-12 w-12 mb-4" />
              <p>Select a conversation to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIChat;
