import safariLion from "@/assets/safari-lion.jpg";

export function WelcomeSection() {

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Welcome to Eika Africa Experience
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your trusted gateway to authentic, unforgettable adventures across Africa and beyond. Founded on a deep passion for showcasing Africa's untamed beauty, vibrant cultures, and world-class destinations.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Philosophy */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Our Philosophy
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Travel is not just about seeing new places - it's about experiencing them with your soul. 
              At Eika Africa Experience, we believe in immersive travel where every journey is a connection 
              to the culture, people, and landscapes that make Africa so unique.
            </p>
            
            {/* Quote */}
            <div className="border-l-4 border-primary pl-6 py-2 bg-primary/5">
              <p className="text-primary font-medium italic text-lg">
                "Your Home to Unforgettable African Journeys"
              </p>
              <p className="text-muted-foreground text-sm mt-1">- Our Motto</p>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={safariLion}
              alt="Safari vehicles viewing a lion in the African savanna"
              className="rounded-xl shadow-2xl w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
