import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>404 – Page not found</title>
        <meta name="description" content="The page you are looking for does not exist." />
        <link rel="canonical" href={location.pathname} />
      </Helmet>
      <div className="text-center animate-enter">
        <h1 className="text-6xl font-display font-bold mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Oops! Page not found</p>
        <NavLink to="/dashboard" className="underline">Return to Dashboard</NavLink>
      </div>
    </div>
  );
};

export default NotFound;
