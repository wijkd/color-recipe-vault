import { Link } from 'react-router-dom';
import { Camera, Upload, LogOut, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isContributor } = useUserRole();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Camera className="h-6 w-6 text-primary" />
          <span>OM Color Profiles</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isContributor && (
                <Link to="/upload">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Profile
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
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
