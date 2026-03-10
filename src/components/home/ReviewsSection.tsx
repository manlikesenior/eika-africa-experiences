import { useEffect } from "react";

export function ReviewsSection() {

  useEffect(() => {
    // Load Elfsight script if not already loaded
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-wider uppercase mb-2">
            Testimonials
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Customer Reviews
          </h2>
        </div>
        <div className="max-w-5xl mx-auto">
          <div 
            className="elfsight-app-b8de98a1-ac69-4b17-a5ee-74ee3b0d8c57" 
            data-elfsight-app-lazy
          />
        </div>
      </div>
    </section>
  );
}
