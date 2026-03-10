import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to Start Your African Adventure?
          </h2>
          <p className="text-lg text-white/90">
            Let our travel experts create your perfect safari experience. 
            From wildlife encounters to beach escapes, we'll handle every detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 bg-primary hover:bg-primary/90">
              <Link to="/booking">Book Your Safari Now</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-foreground"
            >
              <Link to="/experiences">Browse Tours</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}