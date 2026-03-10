import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, Mail, Home, Info, Briefcase, BookOpen, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/experiences", label: "Experiences", icon: MapPin },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/booking", label: "Book Now", icon: Calendar },
];

const countryLinks = [
  { name: "Kenya", href: "/experiences?country=Kenya" },
  { name: "Uganda", href: "/experiences?country=Uganda" },
  { name: "Tanzania", href: "/experiences?country=Tanzania" },
  { name: "Rwanda", href: "/experiences?country=Rwanda" },
  { name: "South Africa", href: "/experiences?country=South Africa" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        // Always show header near top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else {
        // Scrolling up - show header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-transform duration-300",
        !isVisible && "-translate-y-full"
      )}
    >
      {/* Top bar */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+254116735102" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" />
              <span>+254 116 735 102</span>
            </a>
            <a href="mailto:reservations@eikafricaexperience.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="w-4 h-4" />
              <span>reservations@eikafricaexperience.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>Your trusted travel partner in Africa</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Eika Africa Experience" className="h-24 md:h-28" />
          </Link>

          {/* Desktop Country Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-1">
            {countryLinks.map((country) => (
              <Link
                key={country.name}
                to={country.href}
                className={cn(
                  "px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
                  location.pathname === "/experiences" && new URLSearchParams(window.location.search).get("country") === country.name
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                )}
              >
                {country.name}
              </Link>
            ))}
          </nav>

          {/* Book Now Button + Hamburger - Right */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <Button asChild>
                <Link to="/booking">Book Now</Link>
              </Button>
            </div>
            
            {/* Mobile Book Button */}
            <div className="lg:hidden">
              <Button asChild size="sm">
                <Link to="/booking">Book</Link>
              </Button>
            </div>

            {/* Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <img src={logo} alt="Eika Africa Experience" className="h-20" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === link.href
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                
                {/* Contact info in sidebar */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Contact Us</p>
                  <a href="tel:+254116735102" className="flex items-center gap-2 text-sm mb-2 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>+254 116 735 102</span>
                  </a>
                  <a href="mailto:reservations@eikafricaexperience.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>reservations@eikafricaexperience.com</span>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}