import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Edit, Eye, Code, FileText, Info } from "lucide-react";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  html_template: string;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface TemplatesTabProps {
  templates: EmailTemplate[];
  loading: boolean;
  onRefresh: () => void;
}

const AVAILABLE_PLACEHOLDERS = [
  { name: "firstName", description: "Customer's first name" },
  { name: "lastName", description: "Customer's last name" },
  { name: "email", description: "Customer's email address" },
  { name: "phone", description: "Customer's phone number" },
  { name: "country", description: "Customer's country" },
  { name: "tourName", description: "Selected tour name" },
  { name: "travelTheme", description: "Travel theme preference" },
  { name: "destination", description: "Destination" },
  { name: "travelDate", description: "Planned travel date" },
  { name: "duration", description: "Trip duration" },
  { name: "adults", description: "Number of adults" },
  { name: "children", description: "Number of children" },
  { name: "infants", description: "Number of infants" },
  { name: "budget", description: "Budget range" },
  { name: "services", description: "Selected services" },
  { name: "specialRequirements", description: "Special requirements" },
  { name: "message", description: "Customer's message" },
];

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 8900",
  country: "United States",
  tourName: "12-Day Uganda Explorer",
  travelTheme: "Wildlife Safari",
  destination: "Uganda",
  travelDate: "March 15, 2026",
  duration: "12 days",
  adults: "2",
  children: "1",
  infants: "0",
  budget: "$5,000 - $10,000",
  services: "Airport transfers, Safari guide",
  specialRequirements: "Vegetarian meals",
  message: "Looking forward to this adventure!",
};

const TemplatesTab = ({ templates, loading, onRefresh }: TemplatesTabProps) => {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedHtml, setEditedHtml] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<"code" | "preview">("preview");
  const { toast } = useToast();

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject);
    setEditedHtml(template.html_template);
    setEditedDescription(template.description || "");
    setIsActive(template.is_active ?? true);
    setPreviewTab("preview");
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    const { error } = await supabase
      .from("email_templates")
      .update({
        subject: editedSubject,
        html_template: editedHtml,
        description: editedDescription,
        is_active: isActive,
      })
      .eq("id", editingTemplate.id);

    if (error) {
      toast({
        title: "Failed to save template",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Template saved successfully" });
      setEditingTemplate(null);
      onRefresh();
    }
    setSaving(false);
  };

  // Replace placeholders with sample data for preview
  const renderPreview = (template: string): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return SAMPLE_DATA[key] || match;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates sent to customers and admins</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No email templates found</p>
              <p className="text-sm mt-2">Templates will appear here after running the migration</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description || "No description"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Subject:</span> {template.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last updated: {format(new Date(template.updated_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Placeholders Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Available Placeholders
          </CardTitle>
          <CardDescription>Use these placeholders in your templates with double curly braces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AVAILABLE_PLACEHOLDERS.map((p) => (
              <div key={p.name} className="p-2 bg-muted rounded-md">
                <code className="text-sm font-mono text-primary">{`{{${p.name}}}`}</code>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Modify the email template. Use {`{{placeholders}}`} for dynamic content.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  placeholder="Email subject line..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Template description..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Template Active</Label>
            </div>

            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "code" | "preview")}>
              <TabsList>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  HTML Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="mt-4">
                <Textarea
                  value={editedHtml}
                  onChange={(e) => setEditedHtml(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="HTML template..."
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: renderPreview(editedHtml) }} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesTab;
