import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Image, Download, TrendingUp, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminUsers from './AdminUsers';
import AdminProfiles from './AdminProfiles';
import AdminMessages from './AdminMessages';

interface Stats {
  totalUsers: number;
  totalProfiles: number;
  totalDownloads: number;
  profilesThisWeek: number;
}

interface TopProfile {
  id: string;
  name: string;
  download_count: number;
  avg_rating: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProfiles: 0,
    totalDownloads: 0,
    profilesThisWeek: 0
  });
  const [topProfiles, setTopProfiles] = useState<TopProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchTopProfiles();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Total profiles
    const { count: profilesCount } = await supabase
      .from('color_profiles')
      .select('*', { count: 'exact', head: true });

    // Total downloads
    const { data: downloadData } = await supabase
      .from('color_profiles')
      .select('download_count');

    const totalDownloads = downloadData?.reduce((sum, p) => sum + p.download_count, 0) || 0;

    // Profiles this week
    const { count: weekCount } = await supabase
      .from('color_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    setStats({
      totalUsers: usersCount || 0,
      totalProfiles: profilesCount || 0,
      totalDownloads,
      profilesThisWeek: weekCount || 0
    });
    setLoading(false);
  };

  const fetchTopProfiles = async () => {
    const { data } = await supabase
      .from('color_profiles')
      .select('id, name, download_count, avg_rating')
      .order('download_count', { ascending: false })
      .limit(5);

    if (data) setTopProfiles(data);
  };

  if (roleLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin Dashboard - OM Profiles"
        description="Manage OM Profiles platform"
        url="/admin"
      />
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="text-4xl font-display font-medium mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalProfiles}</div>
                      <p className="text-xs text-muted-foreground">Color profiles uploaded</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">All-time downloads</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Week</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.profilesThisWeek}</div>
                      <p className="text-xs text-muted-foreground">New profiles uploaded</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Downloaded Profiles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProfiles.map((profile, index) => (
                        <div key={profile.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-display text-muted-foreground">#{index + 1}</span>
                            <div>
                              <div className="font-medium">{profile.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Rating: {profile.avg_rating ? profile.avg_rating.toFixed(1) : 'New'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{profile.download_count.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">downloads</div>
                          </div>
                        </div>
                      ))}
                      {topProfiles.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No profiles yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="profiles">
            <AdminProfiles />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
