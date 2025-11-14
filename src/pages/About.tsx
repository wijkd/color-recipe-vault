import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEO 
        title="About OM Profiles - Community Color Profile Sharing Platform"
        description="Learn about OM Profiles, a free community platform for OM System photographers to share and discover custom color profiles."
        url="/about"
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl mb-8 text-foreground">
            About OM Profiles
          </h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What This Is</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                A free community platform for OM System photographers to share custom color profiles. 
                Upload your JPEG files with embedded profiles and others can apply them via OM Workspace.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-3">
                <p>
                  <strong className="text-foreground">For Contributors:</strong> Upload JPEG images that contain your custom color profiles created in OM Workspace. 
                  Add details like camera model, lighting conditions, and tags to help others find your work.
                </p>
                <p>
                  <strong className="text-foreground">For Users:</strong> Browse profiles by camera model, category, or search for specific styles. 
                  Download JPEGs and apply the embedded profiles in OM Workspace to your own RAW files.
                </p>
                <p>
                  <strong className="text-foreground">Community Features:</strong> Bookmark your favorites, rate profiles, leave comments, 
                  and follow creators to discover new styles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Important Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                <p className="mb-4">
                  This is a hobby project provided free of charge.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Upload only your own profiles or ones you have permission to share</li>
                  <li>Downloaded profiles are used at your own risk</li>
                  <li>Be respectful in comments and ratings</li>
                  <li>We store your email and username to run the service</li>
                  <li className="flex items-center gap-2">
                    Contact: 
                    <a 
                      href="mailto:support@omprofiles.com" 
                      className="inline-flex items-center gap-1 text-foreground hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      support@omprofiles.com
                    </a> 
                    for issues or content removal
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default About;
