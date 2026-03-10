import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="lg:col-span-2 space-y-4">
            <img src={logo} alt="Eika Africa Experience" className="h-24 brightness-0 invert opacity-90" />
            <p className="text-footer-foreground/80 text-sm leading-relaxed">
              Eika Africa Experience is your trusted partner for unforgettable African adventures. 
              From wildlife safaris to beach getaways, we create memories that last a lifetime.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-footer-foreground/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-footer-foreground/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-footer-foreground/60 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Safari Experiences
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-footer-foreground/80 hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-footer-foreground/80">
                <MapPin className="w-5 h-5 shrink-0 text-primary" />
                <span>Nairobi, Kenya</span>
              </li>
              <li>
                <a 
                  href="tel:+254116735102" 
                  className="flex items-center gap-3 text-sm text-footer-foreground/80 hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0 text-primary" />
                  <span>+254 116 735 102</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:inquiries@eikafricaexperience.com" 
                  className="flex items-start gap-3 text-sm text-footer-foreground/80 hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5 shrink-0 text-primary" />
                  <span>inquiries@eikafricaexperience.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-footer-foreground/20 text-center text-sm text-footer-foreground/60">
          <p>&copy; {new Date().getFullYear()} Eika Africa Experience. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}