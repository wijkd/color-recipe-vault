import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Mail } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  issueType: z.string().min(1, { message: "Please select an issue type" }),
  message: z.string().trim().min(1, { message: "Message is required" }).max(2000, { message: "Message must be less than 2000 characters" })
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = contactSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: validation.data.name,
        email: validation.data.email,
        issue_type: validation.data.issueType,
        message: validation.data.message,
        user_id: user?.id || null
      });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible."
      });
      navigate('/');
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us - OM Color Profiles"
        description="Get help with OM color profiles, report issues, or contact our support team"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">Contact Us</CardTitle>
              </div>
              <CardDescription>
                Have a question or issue? Send us a message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueType">Issue Type *</Label>
                  <Select 
                    value={formData.issueType} 
                    onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                  >
                    <SelectTrigger id="issueType">
                      <SelectValue placeholder="Select an issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report_problem">Report a problem</SelectItem>
                      <SelectItem value="download_issue">Can't download profile</SelectItem>
                      <SelectItem value="account_issue">Account issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.issueType && (
                    <p className="text-sm text-destructive">{errors.issueType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    maxLength={2000}
                    placeholder="Please describe your issue in detail..."
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.message.length}/2000
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Contact;
