import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";
import { sanitizeInput, stripHtml } from "@/lib/sanitize";
import { trackEvent } from "@/lib/analytics";
import { captureError, addBreadcrumb } from "@/lib/sentry";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
  accommodation?: string;
}

interface PricingTier {
  price: number;
  description: string;
  accommodation_level: string;
}

interface PricingTiers {
  silver?: PricingTier;
  gold?: PricingTier;
  platinum?: PricingTier;
}

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  overview: string | null;
  duration: string;
  price: number | null;
  price_note: string | null;
  image_url: string | null;
  gallery: string[] | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  destinations: string[] | null;
  highlights: string[] | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  itinerary: unknown;
  category: string | null;
  pricing_tiers: unknown;
  created_at: string;
}

interface ToursTabProps {
  tours: Tour[];
  loading: boolean;
  onRefresh: () => void;
}

const TOUR_CATEGORIES = [
  "Safari Adventures",
  "Beach Holidays",
  "Cultural Tours",
  "Honeymoon Packages",
  "Family Safaris",
  "Luxury Tours",
  "Budget Tours",
  "Group Tours",
  "Private Tours",
  "Wildlife Photography",
  "Mountain Climbing",
  "Bird Watching"
];

const ToursTab = ({ tours, loading, onRefresh }: ToursTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    overview: "",
    duration: "",
    price: "",
    price_note: "",
    image_url: "",
    gallery: [] as string[],
    is_published: true,
    is_featured: false,
    destinations: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    category: "",
    itinerary: [] as ItineraryDay[],
    pricingTiers: {
      silver: { enabled: false, price: "", description: "", accommodation_level: "" },
      gold: { enabled: false, price: "", description: "", accommodation_level: "" },
      platinum: { enabled: false, price: "", description: "", accommodation_level: "" }
    }
  });
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      overview: "",
      duration: "",
      price: "",
      price_note: "",
      image_url: "",
      gallery: [],
      is_published: true,
      is_featured: false,
      destinations: "",
      highlights: "",
      inclusions: "",
      exclusions: "",
      category: "",
      itinerary: [],
      pricingTiers: {
        silver: { enabled: false, price: "", description: "", accommodation_level: "" },
        gold: { enabled: false, price: "", description: "", accommodation_level: "" },
        platinum: { enabled: false, price: "", description: "", accommodation_level: "" }
      }
    });
    setEditingTour(null);
    setNewGalleryUrl("");
  };

  const openEditDialog = (tour: Tour) => {
    setEditingTour(tour);
    const itinerary = Array.isArray(tour.itinerary) 
      ? tour.itinerary as ItineraryDay[]
      : [];
    
    const pricingTiers = tour.pricing_tiers as PricingTiers | null;
    
    setFormData({
      title: tour.title,
      slug: tour.slug,
      description: tour.description || "",
      overview: tour.overview || "",
      duration: tour.duration,
      price: tour.price?.toString() || "",
      price_note: tour.price_note || "",
      image_url: tour.image_url || "",
      gallery: tour.gallery || [],
      is_published: tour.is_published ?? true,
      is_featured: tour.is_featured ?? false,
      destinations: tour.destinations?.join(", ") || "",
      highlights: tour.highlights?.join("\n") || "",
      inclusions: tour.inclusions?.join("\n") || "",
      exclusions: tour.exclusions?.join("\n") || "",
      category: tour.category || "",
      itinerary,
      pricingTiers: {
        silver: { 
          enabled: !!pricingTiers?.silver, 
          price: pricingTiers?.silver?.price?.toString() || "", 
          description: pricingTiers?.silver?.description || "",
          accommodation_level: pricingTiers?.silver?.accommodation_level || ""
        },
        gold: { 
          enabled: !!pricingTiers?.gold, 
          price: pricingTiers?.gold?.price?.toString() || "", 
          description: pricingTiers?.gold?.description || "",
          accommodation_level: pricingTiers?.gold?.accommodation_level || ""
        },
        platinum: { 
          enabled: !!pricingTiers?.platinum, 
          price: pricingTiers?.platinum?.price?.toString() || "", 
          description: pricingTiers?.platinum?.description || "",
          accommodation_level: pricingTiers?.platinum?.accommodation_level || ""
        }
      }
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build pricing tiers object
    const pricingTiers: PricingTiers = {};
    if (formData.pricingTiers.silver.enabled && formData.pricingTiers.silver.price) {
      pricingTiers.silver = {
        price: parseFloat(formData.pricingTiers.silver.price),
        description: formData.pricingTiers.silver.description,
        accommodation_level: formData.pricingTiers.silver.accommodation_level
      };
    }
    if (formData.pricingTiers.gold.enabled && formData.pricingTiers.gold.price) {
      pricingTiers.gold = {
        price: parseFloat(formData.pricingTiers.gold.price),
        description: formData.pricingTiers.gold.description,
        accommodation_level: formData.pricingTiers.gold.accommodation_level
      };
    }
    if (formData.pricingTiers.platinum.enabled && formData.pricingTiers.platinum.price) {
      pricingTiers.platinum = {
        price: parseFloat(formData.pricingTiers.platinum.price),
        description: formData.pricingTiers.platinum.description,
        accommodation_level: formData.pricingTiers.platinum.accommodation_level
      };
    }
    
    const tourData = {
      title: sanitizeInput(formData.title),
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description ? sanitizeInput(formData.description) : null,
      overview: formData.overview ? sanitizeInput(formData.overview) : null,
      duration: formData.duration,
      price: formData.price ? parseFloat(formData.price) : null,
      price_note: formData.price_note ? sanitizeInput(formData.price_note) : null,
      image_url: formData.image_url || null,
      gallery: formData.gallery.length > 0 ? formData.gallery : null,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      destinations: formData.destinations ? formData.destinations.split(",").map(d => sanitizeInput(d.trim())) : null,
      highlights: formData.highlights ? formData.highlights.split("\n").filter(h => h.trim()).map(h => sanitizeInput(h)) : null,
      inclusions: formData.inclusions ? formData.inclusions.split("\n").filter(i => i.trim()).map(i => sanitizeInput(i)) : null,
      exclusions: formData.exclusions ? formData.exclusions.split("\n").filter(e => e.trim()).map(e => sanitizeInput(e)) : null,
      category: formData.category || null,
      itinerary: formData.itinerary.length > 0 ? JSON.parse(JSON.stringify(formData.itinerary)) : null,
      pricing_tiers: Object.keys(pricingTiers).length > 0 ? JSON.parse(JSON.stringify(pricingTiers)) : null
    };

    addBreadcrumb(`Tour ${editingTour ? "update" : "create"} started`, "admin", { title: tourData.title });

    if (editingTour) {
      const { error } = await supabase
        .from("tours")
        .update(tourData)
        .eq("id", editingTour.id);

      if (error) {
        captureError(new Error(`Failed to update tour: ${error.message}`), { tourId: editingTour.id });
        toast({ title: "Error updating tour", variant: "destructive" });
      } else {
        trackEvent("admin_tour_updated", { tour_title: tourData.title, tour_slug: tourData.slug });
        toast({ title: "Tour updated successfully" });
        setIsDialogOpen(false);
        resetForm();
        onRefresh();
      }
    } else {
      const { error } = await supabase
        .from("tours")
        .insert([tourData]);

      if (error) {
        captureError(new Error(`Failed to create tour: ${error.message}`));
        toast({ title: "Error creating tour", variant: "destructive" });
      } else {
        trackEvent("admin_tour_created", { tour_title: tourData.title, tour_slug: tourData.slug });
        toast({ title: "Tour created successfully" });
        setIsDialogOpen(false);
        resetForm();
        onRefresh();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    
    addBreadcrumb("Tour delete initiated", "admin", { tourId: id });
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) {
      captureError(new Error(`Failed to delete tour: ${error.message}`), { tourId: id });
      toast({ title: "Error deleting tour", variant: "destructive" });
    } else {
      trackEvent("admin_tour_deleted", { tour_id: id });
      toast({ title: "Tour deleted" });
      onRefresh();
    }
  };

  const togglePublished = async (tour: Tour) => {
    const { error } = await supabase
      .from("tours")
      .update({ is_published: !tour.is_published })
      .eq("id", tour.id);

    if (!error) {
      toast({ title: tour.is_published ? "Tour unpublished" : "Tour published" });
      onRefresh();
    }
  };

  const toggleFeatured = async (tour: Tour) => {
    const { error } = await supabase
      .from("tours")
      .update({ is_featured: !tour.is_featured })
      .eq("id", tour.id);

    if (!error) {
      toast({ title: tour.is_featured ? "Removed from featured" : "Added to featured" });
      onRefresh();
    }
  };

  // Itinerary management
  const addItineraryDay = () => {
    const newDay: ItineraryDay = {
      day: formData.itinerary.length + 1,
      title: "",
      description: "",
      meals: "",
      accommodation: ""
    };
    setFormData({ ...formData, itinerary: [...formData.itinerary, newDay] });
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string | number) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, itinerary: updated });
  };

  const removeItineraryDay = (index: number) => {
    const updated = formData.itinerary.filter((_, i) => i !== index);
    // Re-number days
    const renumbered = updated.map((day, i) => ({ ...day, day: i + 1 }));
    setFormData({ ...formData, itinerary: renumbered });
  };

  // Gallery management
  const addGalleryImage = (url: string) => {
    if (url && !formData.gallery.includes(url)) {
      setFormData({ ...formData, gallery: [...formData.gallery, url] });
      setNewGalleryUrl("");
    }
  };

  const removeGalleryImage = (index: number) => {
    const updated = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: updated });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{tours.length} tours total</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Tour</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? "Edit Tour" : "Add New Tour"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="auto-generated if empty" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Input id="duration" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="e.g., 5 Days / 4 Nights" required />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOUR_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price_note">Price Note</Label>
                    <Input id="price_note" value={formData.price_note} onChange={(e) => setFormData({...formData, price_note: e.target.value})} placeholder="e.g., per person sharing" />
                  </div>

                  <ImageUpload 
                    value={formData.image_url} 
                    onChange={(url) => setFormData({...formData, image_url: url})} 
                    label="Main Tour Image"
                    folder="tours"
                  />

                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
                  </div>

                  <div>
                    <Label htmlFor="overview">Overview</Label>
                    <Textarea id="overview" value={formData.overview} onChange={(e) => setFormData({...formData, overview: e.target.value})} rows={4} />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} />
                      <Label htmlFor="is_published">Published</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})} />
                      <Label htmlFor="is_featured">Featured</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6 mt-4">
                  <div>
                    <Label className="text-base font-semibold">Legacy Pricing (Fallback)</Label>
                    <p className="text-sm text-muted-foreground mb-3">Used when no tier pricing is set</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Base Price (USD)</Label>
                        <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                      </div>
                      <div>
                        <Label htmlFor="price_note">Price Note</Label>
                        <Input id="price_note" value={formData.price_note} onChange={(e) => setFormData({...formData, price_note: e.target.value})} placeholder="e.g., per person sharing" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <Label className="text-base font-semibold">Tiered Pricing</Label>
                    <p className="text-sm text-muted-foreground mb-4">Set up Silver, Gold, and Platinum packages</p>
                    
                    {/* Silver Tier */}
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-slate-500" />
                            <CardTitle className="text-sm">Silver Package</CardTitle>
                          </div>
                          <Switch 
                            checked={formData.pricingTiers.silver.enabled} 
                            onCheckedChange={(checked) => setFormData({
                              ...formData, 
                              pricingTiers: { ...formData.pricingTiers, silver: { ...formData.pricingTiers.silver, enabled: checked }}
                            })} 
                          />
                        </div>
                      </CardHeader>
                      {formData.pricingTiers.silver.enabled && (
                        <CardContent className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Price (USD)</Label>
                            <Input 
                              type="number" 
                              value={formData.pricingTiers.silver.price} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, silver: { ...formData.pricingTiers.silver, price: e.target.value }}
                              })}
                              placeholder="e.g., 1200"
                            />
                          </div>
                          <div>
                            <Label>Accommodation Level</Label>
                            <Input 
                              value={formData.pricingTiers.silver.accommodation_level} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, silver: { ...formData.pricingTiers.silver, accommodation_level: e.target.value }}
                              })}
                              placeholder="e.g., Budget camps"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input 
                              value={formData.pricingTiers.silver.description} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, silver: { ...formData.pricingTiers.silver, description: e.target.value }}
                              })}
                              placeholder="e.g., Essential comfort"
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Gold Tier */}
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-500" />
                            <CardTitle className="text-sm">Gold Package</CardTitle>
                          </div>
                          <Switch 
                            checked={formData.pricingTiers.gold.enabled} 
                            onCheckedChange={(checked) => setFormData({
                              ...formData, 
                              pricingTiers: { ...formData.pricingTiers, gold: { ...formData.pricingTiers.gold, enabled: checked }}
                            })} 
                          />
                        </div>
                      </CardHeader>
                      {formData.pricingTiers.gold.enabled && (
                        <CardContent className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Price (USD)</Label>
                            <Input 
                              type="number" 
                              value={formData.pricingTiers.gold.price} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, gold: { ...formData.pricingTiers.gold, price: e.target.value }}
                              })}
                              placeholder="e.g., 2000"
                            />
                          </div>
                          <div>
                            <Label>Accommodation Level</Label>
                            <Input 
                              value={formData.pricingTiers.gold.accommodation_level} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, gold: { ...formData.pricingTiers.gold, accommodation_level: e.target.value }}
                              })}
                              placeholder="e.g., Mid-range lodges"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input 
                              value={formData.pricingTiers.gold.description} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, gold: { ...formData.pricingTiers.gold, description: e.target.value }}
                              })}
                              placeholder="e.g., Premium experience"
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Platinum Tier */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-violet-500" />
                            <CardTitle className="text-sm">Platinum Package</CardTitle>
                          </div>
                          <Switch 
                            checked={formData.pricingTiers.platinum.enabled} 
                            onCheckedChange={(checked) => setFormData({
                              ...formData, 
                              pricingTiers: { ...formData.pricingTiers, platinum: { ...formData.pricingTiers.platinum, enabled: checked }}
                            })} 
                          />
                        </div>
                      </CardHeader>
                      {formData.pricingTiers.platinum.enabled && (
                        <CardContent className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Price (USD)</Label>
                            <Input 
                              type="number" 
                              value={formData.pricingTiers.platinum.price} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, platinum: { ...formData.pricingTiers.platinum, price: e.target.value }}
                              })}
                              placeholder="e.g., 3500"
                            />
                          </div>
                          <div>
                            <Label>Accommodation Level</Label>
                            <Input 
                              value={formData.pricingTiers.platinum.accommodation_level} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, platinum: { ...formData.pricingTiers.platinum, accommodation_level: e.target.value }}
                              })}
                              placeholder="e.g., Luxury 5-star lodges"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input 
                              value={formData.pricingTiers.platinum.description} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                pricingTiers: { ...formData.pricingTiers, platinum: { ...formData.pricingTiers.platinum, description: e.target.value }}
                              })}
                              placeholder="e.g., Ultimate luxury"
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="destinations">Destinations (comma-separated)</Label>
                    <Input id="destinations" value={formData.destinations} onChange={(e) => setFormData({...formData, destinations: e.target.value})} placeholder="e.g., Kenya, Tanzania, Uganda" />
                  </div>

                  <div>
                    <Label htmlFor="highlights">Highlights (one per line)</Label>
                    <Textarea id="highlights" value={formData.highlights} onChange={(e) => setFormData({...formData, highlights: e.target.value})} rows={4} placeholder="Game drives in Maasai Mara&#10;Hot air balloon safari&#10;Cultural village visit" />
                  </div>

                  <div>
                    <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                    <Textarea id="inclusions" value={formData.inclusions} onChange={(e) => setFormData({...formData, inclusions: e.target.value})} rows={4} placeholder="All park entrance fees&#10;Full board accommodation&#10;Private 4x4 safari vehicle" />
                  </div>

                  <div>
                    <Label htmlFor="exclusions">Exclusions (one per line)</Label>
                    <Textarea id="exclusions" value={formData.exclusions} onChange={(e) => setFormData({...formData, exclusions: e.target.value})} rows={4} placeholder="International flights&#10;Travel insurance&#10;Personal expenses" />
                  </div>
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Day by Day Itinerary</Label>
                    <Button type="button" size="sm" onClick={addItineraryDay}>
                      <Plus className="w-4 h-4 mr-1" /> Add Day
                    </Button>
                  </div>

                  {formData.itinerary.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No itinerary days added yet. Click "Add Day" to start.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {formData.itinerary.map((day, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Day {day.day}</CardTitle>
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeItineraryDay(index)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label>Title</Label>
                              <Input 
                                value={day.title} 
                                onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                                placeholder="e.g., Arrival in Nairobi"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea 
                                value={day.description} 
                                onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                                rows={3}
                                placeholder="Describe the day's activities..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Meals</Label>
                                <Input 
                                  value={day.meals || ""} 
                                  onChange={(e) => updateItineraryDay(index, "meals", e.target.value)}
                                  placeholder="e.g., Breakfast, Lunch, Dinner"
                                />
                              </div>
                              <div>
                                <Label>Accommodation</Label>
                                <Input 
                                  value={day.accommodation || ""} 
                                  onChange={(e) => updateItineraryDay(index, "accommodation", e.target.value)}
                                  placeholder="e.g., Sarova Mara Game Camp"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="gallery" className="space-y-4 mt-4">
                  <MultiImageUpload
                    values={formData.gallery}
                    onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                    label="Gallery Images"
                    folder="tours/gallery"
                    maxFiles={20}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit">{editingTour ? "Update Tour" : "Create Tour"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tours.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tours yet. Add your first tour!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tours.map((tour) => (
            <Card key={tour.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {tour.image_url && (
                      <img src={tour.image_url} alt={tour.title} className="w-24 h-16 object-cover rounded" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{tour.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tour.duration}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant={tour.is_published ? "default" : "secondary"}>
                          {tour.is_published ? "Published" : "Draft"}
                        </Badge>
                        {tour.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        {tour.category && <Badge variant="outline">{tour.category}</Badge>}
                        {tour.price && <Badge variant="outline">${tour.price}</Badge>}
                        {tour.gallery && tour.gallery.length > 0 && (
                          <Badge variant="secondary">{tour.gallery.length} images</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => toggleFeatured(tour)} title={tour.is_featured ? "Remove from featured" : "Add to featured"}>
                      {tour.is_featured ? <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => togglePublished(tour)} title={tour.is_published ? "Unpublish" : "Publish"}>
                      {tour.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(tour)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(tour.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {tour.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToursTab;