import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-hidden bg-background">
      <Helmet>
        <title>AI Seller Assistant – Grow with AI</title>
        <meta name="description" content="Automate customer chats, manage stock, and sell smarter with AI." />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="container mx-auto px-4 min-h-screen flex items-center justify-center" style={{ color: 'hsl(var(--foreground))' }}>
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-6 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          </div>
          <h1 className="font-display font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl">Sell smarter with your AI assistant</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Connect WhatsApp, automate replies, and manage your stock in one place. Fast, reliable, and privacy-first.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="w-40" size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button className="w-40" size="sm">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="w-40" size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
