import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  destinations: string[];
  image_url: string;
  price: number | null;
}

export function FeaturedTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTours() {
      const { data, error } = await supabase
        .from("tours")
        .select("id, title, slug, description, duration, destinations, image_url, price")
        .eq("is_featured", true)
        .eq("is_published", true)
        .limit(3);

      if (!error && data) {
        setTours(data);
      }
      setLoading(false);
    }
    fetchTours();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading tours...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-wider uppercase mb-2">
            Popular Destinations
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Featured Experiences
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Card 
              key={tour.id} 
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={tour.image_url || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600"} 
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
                {tour.price && (
                  <div className="absolute top-4 right-4 bg-background/95 text-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    From ${tour.price.toLocaleString()} pps
                  </div>
                )}
              </div>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">
                  {tour.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {tour.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.destinations?.[0] || "Kenya"}</span>
                  </div>
                </div>
                <Link 
                  to={`/tours/${tour.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/experiences">View All Experiences</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}