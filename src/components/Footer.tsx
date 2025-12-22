import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/vitalityx-logo.jpg';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src={logo} alt="VitalityX Health" className="h-10 w-auto mb-4" />
            <p className="text-muted-foreground max-w-md mb-6">
              The first closed-loop health and wellness system. Your genetics inform everything. 
              Your results speak for themselves.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <Phone size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <MapPin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-secondary transition-colors">Genetic Testing</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Lab Analysis</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Nutrition Plans</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Personal Training</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Mental Wellness</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Supplements</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-secondary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Client Portal</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} VitalityX Health. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Genetics. Wellness. Optimized.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
