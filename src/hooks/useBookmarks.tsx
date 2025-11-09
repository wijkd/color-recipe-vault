import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarkedIds(new Set());
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bookmarks')
      .select('profile_id')
      .eq('user_id', user.id);

    if (data && !error) {
      setBookmarkedIds(new Set(data.map(b => b.profile_id)));
    }
    setLoading(false);
  };

  const toggleBookmark = useCallback(async (profileId: string) => {
    if (!user) {
      toast({ 
        title: 'Please sign in to bookmark profiles', 
        variant: 'destructive' 
      });
      return false;
    }

    const isBookmarked = bookmarkedIds.has(profileId);

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      if (!error) {
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
        toast({ title: 'Removed from bookmarks' });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, profile_id: profileId });

      if (!error) {
        setBookmarkedIds(prev => new Set(prev).add(profileId));
        toast({ title: 'Added to bookmarks' });
        return true;
      }
    }

    return isBookmarked;
  }, [user, bookmarkedIds, toast]);

  const isBookmarked = useCallback((profileId: string) => {
    return bookmarkedIds.has(profileId);
  }, [bookmarkedIds]);

  return {
    isBookmarked,
    toggleBookmark,
    loading,
    bookmarkedIds
  };
};
