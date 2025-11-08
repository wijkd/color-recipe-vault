import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';

interface ContributorRouteProps {
  children: React.ReactNode;
}

const ContributorRoute: React.FC<ContributorRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isContributor, loading: roleLoading } = useUserRole();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isContributor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">You need contributor access to this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ContributorRoute;
