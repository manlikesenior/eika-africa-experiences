import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Calendar, Users } from "lucide-react";

interface BookingInquiry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  tour_name: string | null;
  travel_date: string | null;
  adults: number;
  children: number;
  status: string;
  created_at: string;
  message: string | null;
}

interface InquiriesTabProps {
  inquiries: BookingInquiry[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500"
};

const InquiriesTab = ({ inquiries, loading, onUpdateStatus }: InquiriesTabProps) => {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No booking inquiries yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {inquiry.first_name} {inquiry.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {inquiry.tour_name || "General Inquiry"}
                </p>
              </div>
              <Select value={inquiry.status} onValueChange={(v) => onUpdateStatus(inquiry.id, v)}>
                <SelectTrigger className="w-32">
                  <Badge className={statusColors[inquiry.status]}>{inquiry.status}</Badge>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 text-primary hover:underline">
                <Mail className="w-4 h-4" /> {inquiry.email}
              </a>
              {inquiry.phone && (
                <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {inquiry.phone}
                </a>
              )}
              {inquiry.travel_date && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> {inquiry.travel_date}
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" /> {inquiry.adults} Adults, {inquiry.children} Children
              </span>
            </div>
            {inquiry.message && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {inquiry.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Received: {new Date(inquiry.created_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InquiriesTab;
