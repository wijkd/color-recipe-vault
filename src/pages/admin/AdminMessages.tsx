import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  issue_type: string;
  message: string;
  status: string;
  created_at: string;
}

const issueTypeLabels: Record<string, string> = {
  report_problem: 'Report a problem',
  download_issue: "Can't download profile",
  account_issue: 'Account issue',
  other: 'Other'
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Message marked as ${status}`
      });
      fetchMessages();
    }
  };

  const handleReply = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Re: Your message to OM Color Profiles&body=Hi ${name},%0D%0A%0D%0A`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>Manage user contact form submissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${message.email}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {message.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {issueTypeLabels[message.issue_type] || message.issue_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2">{message.message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            message.status === 'resolved' ? 'default' :
                            message.status === 'read' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {message.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(message.id, 'read')}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {message.status !== 'resolved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(message.id, 'resolved')}
                              title="Mark as resolved"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(message.email, message.name)}
                            title="Reply via email"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessages;
