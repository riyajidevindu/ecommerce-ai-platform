import { useState, useEffect } from 'react';
import { getConversations, Conversation, Message } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AIChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        setError('Failed to fetch conversations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">AI Conversations</h1>
      <Accordion type="single" collapsible className="w-full">
        {conversations.map((conversation) => (
          <AccordionItem key={conversation.whatsapp_no} value={conversation.whatsapp_no}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${conversation.whatsapp_no}`} />
                    <AvatarFallback>{conversation.whatsapp_no.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">{conversation.whatsapp_no}</p>
                    <p className="text-sm text-gray-500 truncate">{conversation.first_message}</p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                {conversation.messages.map((message: Message) => (
                  <div key={message.id} className="mb-4">
                    <p className="font-semibold">You:</p>
                    <p>{message.user_message}</p>
                    {message.response_message && (
                      <>
                        <p className="font-semibold mt-2">AI:</p>
                        <p>{message.response_message}</p>
                      </>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AIChat;
