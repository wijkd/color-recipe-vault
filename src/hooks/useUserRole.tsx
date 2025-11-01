import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'contributor' | 'consumer';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        setRoles(data.map((r: any) => r.role as UserRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isContributor = hasRole('contributor') || isAdmin;
  const isConsumer = hasRole('consumer') || isContributor;

  return { roles, hasRole, isAdmin, isContributor, isConsumer, loading };
};
