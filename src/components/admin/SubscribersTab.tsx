import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Search, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_subscribed: boolean | null;
  source: string | null;
  subscribed_at: string;
}

interface SubscribersTabProps {
  subscribers: Subscriber[];
  loading: boolean;
  onRefresh: () => void;
}

const SubscribersTab = ({ subscribers, loading, onRefresh }: SubscribersTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    
    const { error } = await supabase.from("email_subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting subscriber", variant: "destructive" });
    } else {
      toast({ title: "Subscriber deleted" });
      onRefresh();
    }
  };

  const toggleSubscription = async (subscriber: Subscriber) => {
    const { error } = await supabase
      .from("email_subscribers")
      .update({ 
        is_subscribed: !subscriber.is_subscribed,
        unsubscribed_at: !subscriber.is_subscribed ? null : new Date().toISOString()
      })
      .eq("id", subscriber.id);

    if (!error) {
      toast({ title: subscriber.is_subscribed ? "Unsubscribed" : "Resubscribed" });
      onRefresh();
    }
  };

  const exportCSV = () => {
    const headers = ["Email", "First Name", "Last Name", "Status", "Source", "Subscribed At"];
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      sub.first_name || "",
      sub.last_name || "",
      sub.is_subscribed ? "Subscribed" : "Unsubscribed",
      sub.source || "",
      new Date(sub.subscribed_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Subscribers exported" });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const activeCount = subscribers.filter(s => s.is_subscribed).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">{activeCount} active / {subscribers.length} total subscribers</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search subscribers..." 
              className="pl-9 w-full sm:w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No email subscribers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <a href={`mailto:${subscriber.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      {subscriber.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    {subscriber.first_name || subscriber.last_name 
                      ? `${subscriber.first_name || ""} ${subscriber.last_name || ""}`.trim()
                      : "-"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={subscriber.is_subscribed ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleSubscription(subscriber)}
                    >
                      {subscriber.is_subscribed ? "Subscribed" : "Unsubscribed"}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscriber.source || "-"}</TableCell>
                  <TableCell>{new Date(subscriber.subscribed_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(subscriber.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default SubscribersTab;
