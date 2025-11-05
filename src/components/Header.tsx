import { Link } from 'react-router-dom';
import { Camera, Upload, LogOut, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isContributor } = useUserRole();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-3 group">
          <Camera className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
          <span className="font-display text-xl tracking-tight">OM Color Profiles</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isContributor && (
                <Link to="/upload">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
