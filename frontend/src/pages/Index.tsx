import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, ShoppingCart } from 'lucide-react';
import './Landing.css';

const Index = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: MessageSquare, title: "Automated WhatsApp Chats", description: "Engage customers 24/7 with an AI-powered chat assistant." },
    { icon: ShoppingCart, title: "Intelligent Stock Management", description: "Keep track of your inventory and get smart restock suggestions." },
    { icon: Zap, title: "Seamless Integration", description: "Connect your favorite tools and services with just a few clicks." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>AI Seller Assistant – Grow with AI</title>
        <meta name="description" content="Automate customer chats, manage stock, and sell smarter with AI." />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <img src="/logo.png" alt="Logo" className="h-10 w-10" />
          <span className="font-bold text-xl">AI Seller Assistant</span>
        </motion.div>
        <div>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 mt-20 mb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-display font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl">
            <span className="hero-gradient">Sell smarter,</span> not harder.
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground"
          >
            Your all-in-one platform to automate customer chats, manage stock, and grow your business with the power of AI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="text-lg px-8 py-6">Get Started for Free</Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-xl border bg-background feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Seller Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
