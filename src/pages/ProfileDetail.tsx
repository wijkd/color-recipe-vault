import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Download, ArrowLeft, Bookmark, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileImage {
  id: string;
  image_url: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string | null };
}

const ProfileDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [profile, setProfile] = useState<any>(null);
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchImages();
      fetchComments();
      if (user) fetchUserRating();
      incrementViewCount();
    }
  }, [id, user]);

  const incrementViewCount = async () => {
    // Only increment if not already viewed in this session
    const viewedKey = `viewed_${id}`;
    if (!sessionStorage.getItem(viewedKey)) {
      const { error } = await supabase.rpc('increment_view_count', { profile_id: id });
      if (!error) {
        sessionStorage.setItem(viewedKey, 'true');
      }
    }
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('color_profiles')
      .select('*, profiles!color_profiles_user_id_fkey(username)')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setErrorMessage(null);
    } else if (error) {
      setErrorMessage(error.message);
      toast({ title: error.message, variant: 'destructive' });
    } else {
      setErrorMessage('Profile not found');
    }
    setLoading(false);
  };

  const fetchImages = async () => {
    const { data } = await supabase
      .from('profile_images')
      .select('*')
      .eq('profile_id', id);

    if (data) setImages(data);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, profiles!comments_user_id_fkey(username)')
      .eq('profile_id', id)
      .order('created_at', { ascending: false });

    if (data) setComments(data as any);
  };

  const fetchUserRating = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('profile_id', id)
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) setUserRating((data as any).rating);
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({ title: 'Please sign in to rate', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('ratings')
      .upsert({ 
        profile_id: id!, 
        user_id: user.id, 
        rating 
      } as any);

    if (!error) {
      setUserRating(rating);
      fetchProfile();
      toast({ title: 'Rating submitted' });
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({ title: 'Please sign in to comment', variant: 'destructive' });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({ 
        profile_id: id!, 
        user_id: user.id, 
        content: newComment 
      } as any);

    if (!error) {
      setNewComment('');
      fetchComments();
      toast({ title: 'Comment posted' });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>{errorMessage ?? 'Profile not found'}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8 -ml-2 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img 
                  src={images[0].image_url} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(1).map(img => (
                  <div key={img.id} className="aspect-square overflow-hidden bg-muted">
                    <img 
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-5xl font-display font-medium mb-4 tracking-tight">{profile.name}</h1>
              <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
                by{' '}
                {profile.user_id ? (
                  <Link 
                    to={`/user/${profile.user_id}`}
                    className="hover:text-foreground transition-colors hover:underline"
                  >
                    {profile.profiles?.username || 'Unknown user'}
                  </Link>
                ) : (
                  profile.profiles?.username || 'Unknown user'
                )}
              </p>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">{profile.description}</p>
              
              {/* View and Download Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>Viewed {profile.view_count.toLocaleString()} {profile.view_count === 1 ? 'time' : 'times'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  <span>Downloaded {profile.download_count.toLocaleString()} {profile.download_count === 1 ? 'time' : 'times'}</span>
                </div>
              </div>
              
              <div className="mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="h-6 w-6 fill-foreground text-foreground" />
                  <span className="text-2xl font-display">
                    {profile.avg_rating ? profile.avg_rating.toFixed(1) : 'New'}
                  </span>
                  {profile.total_ratings > 0 && (
                    <span className="text-muted-foreground">({profile.total_ratings} {profile.total_ratings === 1 ? 'rating' : 'ratings'})</span>
                  )}
                </div>
                
                {user && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="hover:scale-125 transition-transform duration-200"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= userRating
                              ? 'fill-foreground text-foreground'
                              : 'text-border hover:text-foreground/40'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                size="icon"
                className="h-14 w-14 flex-shrink-0"
                onClick={() => toggleBookmark(id!)}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked(id!) ? 'fill-foreground' : ''}`} />
              </Button>
              
              <Button 
                className="flex-1 h-14 text-base bg-foreground text-background hover:bg-foreground/90 transition-colors"
                onClick={async () => {
                if (images.length === 0) {
                  toast({ title: 'No image available', variant: 'destructive' });
                  return;
                }
                try {
                  // Increment download count
                  await supabase.rpc('increment_download_count', { profile_id: id });
                  
                  const response = await fetch(images[0].image_url);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${profile.name}.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast({ title: 'Download started' });
                  
                  // Refresh profile to show updated download count
                  fetchProfile();
                } catch (error) {
                  toast({ title: 'Download failed', variant: 'destructive' });
                }
              }}
              >
                <Download className="h-5 w-5 mr-2" />
                Download for OM Workspace
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-display font-medium mb-8 tracking-tight">Comments</h2>
            
            {user && (
              <div className="mb-10 pb-10 border-b border-border">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-4 min-h-[120px] resize-none bg-background border-border"
                />
                <Button 
                  onClick={handleComment}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Post Comment
                </Button>
              </div>
            )}

            <div className="space-y-8">
              {comments.map(comment => (
                <div key={comment.id} className="pb-8 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-baseline gap-3 mb-3">
                    <div className="font-medium text-foreground">{comment.profiles.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileDetail;
