import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, ShoppingCart } from 'lucide-react';
import { ChatPreview } from '@/components/common/ChatPreview';
import { Testimonials } from '@/components/common/Testimonials';
import './Landing.css';

const Index = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: MessageSquare, title: "Automated WhatsApp Chats", description: "Engage customers 24/7 with an AI-powered chat assistant." },
    { icon: ShoppingCart, title: "Intelligent Stock Management", description: "Keep track of your inventory and get smart restock suggestions." },
    { icon: Zap, title: "Seamless Integration", description: "Connect your favorite tools and services with just a few clicks." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden animated-gradient">
      <Helmet>
        <title>AI Seller Assistant – Grow with AI</title>
        <meta name="description" content="Automate customer chats, manage stock, and sell smarter with AI." />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="relative">
        {/* Header */}
        <header className="container mx-auto px-8 py-8 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-16 w-16" />
            <span className="font-bold text-3xl">AI Seller Assistant</span>
          </div>
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
        <main className="container mx-auto px-8 grid md:grid-cols-2 gap-16 items-center" style={{ minHeight: 'calc(100vh - 20rem)' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-text-container"
          >
            <h1 className="font-display font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl">
              <span className="hero-gradient">Sell smarter,</span> not harder.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground hero-paragraph">
              Your all-in-one platform to automate customer chats, manage stock, and grow your business with the power of AI.
            </p>
            <div className="mt-10">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="text-lg px-8 py-6">Get Started for Free</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <ChatPreview />
          </motion.div>
        </main>
      </div>

      {/* Features Section */}
      <section className="bg-background/80 backdrop-blur-sm py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-xl border bg-background/50 feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
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

      <Testimonials />

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground relative z-10 hero-text-container">
        <p>&copy; {new Date().getFullYear()} AI Seller Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
