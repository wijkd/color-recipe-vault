import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-6xl font-display font-bold">404</h1>
        <p className="text-2xl text-muted-foreground">Oops! Page not found</p>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Having issues? Contact us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
