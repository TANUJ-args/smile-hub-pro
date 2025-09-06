import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoNav from '@/assets/smile-hub-logo-nav.svg';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/20 border-t border-border/50">
      {/* Decorative Top Wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoNav} 
                alt="SmileHub Family Dental" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-muted-foreground">
              Professional dental management platform engineered with modern technology for exceptional patient care delivery.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                  aria-label={`Social link ${index + 1}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Patients', 'Features', 'Pricing'].map((link) => (
                <li key={link}>
                  <Link 
                    to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:w-2 transition-all duration-300" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Services</h4>
            <ul className="space-y-2">
              {['Patient Management', 'Treatment Tracking', 'Financial Reports', 'Appointment Scheduling'].map((service) => (
                <li key={service}>
                  <span className="text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href="mailto:screative845@gmail.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">screative845@gmail.com</span>
              </a>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">Contact via Email</span>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-lg bg-muted/50">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">Visakhapatnam, Andhra Pradesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Smile Hub. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}