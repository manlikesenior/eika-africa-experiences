import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryCategory {
  label: string;
  href: string;
  description?: string;
}

interface CountryData {
  name: string;
  slug: string;
  categories: CountryCategory[];
}

const countryData: CountryData[] = [
  {
    name: "Kenya",
    slug: "kenya",
    categories: [
      { label: "All Kenya Experiences", href: "/experiences?country=Kenya" },
      { label: "Safaris and Tours", href: "/experiences?country=Kenya&category=Safari" },
      { label: "National Parks", href: "/experiences?country=Kenya&category=Safari" },
      { label: "Beach Holidays", href: "/experiences?country=Kenya&category=Beach" },
      { label: "Cultural Tours", href: "/experiences?country=Kenya&category=Cultural" },
      { label: "Adventure", href: "/experiences?country=Kenya&category=Adventure" },
    ],
  },
  {
    name: "Uganda",
    slug: "uganda",
    categories: [
      { label: "Gorilla Trekking", href: "/experiences?country=Uganda&category=Gorilla Trekking" },
      { label: "Discover Uganda", href: "/experiences?country=Uganda" },
      { label: "Wildlife Safaris", href: "/experiences?country=Uganda&category=Wildlife Safari" },
      { label: "Adventure", href: "/experiences?country=Uganda&category=Adventure" },
      { label: "Cultural Tours", href: "/experiences?country=Uganda&category=Cultural & Heritage" },
    ],
  },
  {
    name: "Tanzania",
    slug: "tanzania",
    categories: [
      { label: "Serengeti Safaris", href: "/experiences?country=Tanzania&category=Wildlife Safari" },
      { label: "Discover Tanzania", href: "/experiences?country=Tanzania" },
      { label: "Zanzibar Beach", href: "/experiences?country=Zanzibar&category=Beach & Coastal" },
      { label: "Kilimanjaro Treks", href: "/experiences?country=Tanzania&category=Adventure" },
      { label: "Cultural Tours", href: "/experiences?country=Tanzania&category=Cultural & Heritage" },
    ],
  },
  {
    name: "South Africa",
    slug: "south-africa",
    categories: [
      { label: "Kruger Safaris", href: "/experiences?country=South Africa&category=Wildlife Safari" },
      { label: "Discover SA", href: "/experiences?country=South Africa" },
      { label: "Cape Town", href: "/experiences?country=South Africa&category=Cultural & Heritage" },
      { label: "Garden Route", href: "/experiences?country=South Africa&category=Adventure" },
      { label: "Wine Tours", href: "/experiences?country=South Africa" },
    ],
  },
  {
    name: "Rwanda",
    slug: "rwanda",
    categories: [
      { label: "Gorilla Trekking", href: "/experiences?country=Rwanda&category=Gorilla Trekking" },
      { label: "Discover Rwanda", href: "/experiences?country=Rwanda" },
      { label: "Wildlife Safaris", href: "/experiences?country=Rwanda&category=Wildlife Safari" },
      { label: "Cultural Tours", href: "/experiences?country=Rwanda&category=Cultural & Heritage" },
    ],
  },
];

export function CountryMegaMenu() {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {countryData.map((country) => (
        <div
          key={country.slug}
          className="relative"
          onMouseEnter={() => setActiveCountry(country.slug)}
          onMouseLeave={() => setActiveCountry(null)}
        >
          <button
            className={cn(
              "flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
              activeCountry === country.slug
                ? "text-primary"
                : "text-foreground hover:text-primary"
            )}
          >
            {country.name}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                activeCountry === country.slug && "rotate-180"
              )}
            />
          </button>

          {/* Mega Menu Dropdown */}
          {activeCountry === country.slug && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
              <div className="bg-background border border-border rounded-lg shadow-xl min-w-[320px] p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                {/* View All Link */}
                <Link
                  to={`/experiences?country=${country.name}`}
                  className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary group"
                >
                  <span className="border-b-2 border-primary pb-1">
                    View All Experiences in {country.name}
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Category Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {country.categories.map((category) => (
                    <Link
                      key={category.label}
                      to={category.href}
                      className="block p-3 rounded-md hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {category.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Request Proposal CTA */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/booking"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Request a Custom Itinerary
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
