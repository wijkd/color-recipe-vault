import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Download, ArrowLeft } from 'lucide-react';
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
  const [profile, setProfile] = useState<any>(null);
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchImages();
      fetchComments();
      if (user) fetchUserRating();
    }
  }, [id, user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('color_profiles')
      .select('*, profiles!color_profiles_user_id_fkey(username)')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else if (error) {
      toast({ title: 'Profile not found', variant: 'destructive' });
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
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            {images.length > 0 && (
              <img 
                src={images[0].image_url} 
                alt={profile.name}
                className="w-full rounded-lg"
              />
            )}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.slice(1).map(img => (
                  <img 
                    key={img.id}
                    src={img.image_url}
                    alt=""
                    className="w-full aspect-square object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{profile.name}</h1>
            <p className="text-muted-foreground mb-4">{profile.description}</p>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold">
                  {profile.avg_rating ? profile.avg_rating.toFixed(1) : 'No ratings'}
                </span>
                <span className="text-muted-foreground">({profile.total_ratings} ratings)</span>
              </div>
              
              {user && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= userRating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download JPG for OM Workspace
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            {user && (
              <div className="mb-6">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleComment}>Post Comment</Button>
              </div>
            )}

            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="font-semibold">{comment.profiles.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                  <p className="mt-2">{comment.content}</p>
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
