import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Brain, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/vitalityx-logo.jpg';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const navItems = [
  { name: 'Why Us', href: '/why-us', isPage: true },
  { name: 'Biomarkers', href: '/biomarkers', isPage: true },
  { name: 'Supplements', href: '/supplements', isPage: true },
  { name: 'Contact', href: '/contact', isPage: true },
];

const programItems = [
  { 
    name: 'Wellness', 
    href: '/programs#wellness', 
    description: 'Foundational health optimization program',
    icon: Heart
  },
  { 
    name: 'Sleep Optimization', 
    href: '/programs#sleep', 
    description: 'Transform your sleep quality and recovery',
    icon: Moon
  },
  { 
    name: 'Mental Performance', 
    href: '/programs#mental', 
    description: 'Enhance focus, memory, and cognitive function',
    icon: Brain
  },
  { 
    name: 'Recovery Bundle', 
    href: '/programs#bundle', 
    description: 'Complete sleep + mental performance package',
    icon: Package
  },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <img src={logo} alt="VitalityX Health" className="h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Why Us - simple link */}
            <Link
              to="/why-us"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium text-sm tracking-wide"
            >
              Why Us
            </Link>

            {/* Programs Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground hover:bg-transparent data-[state=open]:bg-transparent font-medium text-sm tracking-wide h-auto p-0">
                    Programs
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[320px] gap-1 p-3 bg-background border border-border rounded-lg shadow-lg">
                      {programItems.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="flex items-start gap-3 rounded-md p-3 hover:bg-accent transition-colors"
                            >
                              <item.icon className="w-5 h-5 text-secondary mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {item.name}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      <li className="border-t border-border mt-1 pt-1">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/programs"
                            className="flex items-center justify-center rounded-md p-2 text-sm font-medium text-secondary hover:bg-accent transition-colors"
                          >
                            View All Programs
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Rest of nav items */}
            {navItems.slice(1).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium text-sm tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <CartDrawer />
            <Link to={user ? "/portal" : "/auth"}>
              <Button variant="heroOutline" size="sm">
                My VitalityX
              </Button>
            </Link>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {/* Why Us */}
              <Link
                to="/why-us"
                className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Why Us
              </Link>

              {/* Programs with sub-items */}
              <div className="flex flex-col">
                <Link
                  to="/programs"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Programs
                </Link>
                <div className="pl-4 flex flex-col gap-1 border-l border-border ml-2">
                  {programItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors py-1.5 text-sm flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 text-secondary" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rest of nav items */}
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <div className="flex justify-center">
                  <CartDrawer />
                </div>
                <Link to={user ? "/portal" : "/auth"} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="heroOutline" size="lg" className="w-full">
                    My VitalityX
                  </Button>
                </Link>
                <Button variant="hero" size="lg" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
