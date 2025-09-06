import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatPreview.css';

const messages = [
  { text: "Hi, I'd like to know if the 'Smart Watch X' is in stock.", sender: 'user', delay: 1000 },
  { text: "Of course! Let me check that for you. One moment...", sender: 'ai', delay: 2000 },
  { text: "Good news! The 'Smart Watch X' is in stock. We have 12 units available.", sender: 'ai', delay: 2500 },
  { text: "Great! I'll take one.", sender: 'user', delay: 1500 },
  { text: "Excellent! I've added it to your cart. Your order number is #A1B2C3D4.", sender: 'ai', delay: 2000 },
];

export function ChatPreview() {
  const [currentMessages, setCurrentMessages] = useState<Omit<typeof messages[0], 'delay'>[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setCurrentMessages([]);
    let messageTimeout: NodeJS.Timeout;

    const showMessage = (index: number) => {
      if (index >= messages.length) {
        // After all messages, restart the animation
        setTimeout(() => {
          setCurrentMessages([]);
          setIsTyping(false);
          showMessage(0);
        }, 3000);
        return;
      }

      const message = messages[index];
      const nextMessageIsAi = messages[index + 1]?.sender === 'ai';

      messageTimeout = setTimeout(() => {
        if (nextMessageIsAi) setIsTyping(true);
        setCurrentMessages(prev => [...prev, { text: message.text, sender: message.sender }]);
        
        if (message.sender === 'user' && nextMessageIsAi) {
          setTimeout(() => {
            setIsTyping(false);
            showMessage(index + 1);
          }, 1500); // Typing indicator duration
        } else {
          showMessage(index + 1);
        }
      }, message.delay);
    };

    showMessage(0);

    return () => clearTimeout(messageTimeout);
  }, []);

  return (
    <div className="w-full max-w-lg h-[25rem] bg-background border rounded-2xl p-4 flex flex-col gap-4 overflow-hidden shadow-2xl">
      <motion.div
        animate={{ y: -currentMessages.length * 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col"
      >
        <AnimatePresence>
          {currentMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="typing-indicator"
          >
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce delay-75" />
              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
