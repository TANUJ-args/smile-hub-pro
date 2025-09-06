import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Home, Users, Phone, LogIn, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logoNav from '@/assets/smile-hub-logo-nav.svg';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getUserDisplayName = () => {
    if (token) {
      try {
        // Basic decoding to get email from JWT payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email.split('@')[0];
      } catch (e) {
        return 'User';
      }
    }
    return 'Guest';
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/xray-analysis', label: 'AI X-ray', icon: Zap },
    { href: '#contact', label: 'Contact', icon: Phone },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "py-2" : "py-4",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
          "backdrop-blur-xl rounded-2xl border transition-all duration-300",
          isScrolled 
            ? "bg-background/80 border-border shadow-card" 
            : "bg-background/60 border-border/50"
        )}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <img 
                src={logoNav} 
                alt="SmileHub Family Dental" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = location.pathname === href;
                return (
                  <Button key={href} asChild variant="ghost" className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground bg-primary/10"
                  )}>
                    <Link to={href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated() ? (
                <>
                  <span className="text-sm text-muted-foreground">Hello, {getUserDisplayName()}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" className="bg-gradient-primary hover:shadow-glow">
                  <Link to="/auth" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-2">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card/90 backdrop-blur-lg rounded-lg border border-border/50">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Button key={href} asChild variant="ghost" className="w-full justify-start">
                    <Link to={href} onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  </Button>
                ))}
                <div className="border-t border-border/50 pt-4">
                  {isAuthenticated() ? (
                    <>
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Hello, {getUserDisplayName()}
                      </div>
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                        <LogIn className="w-5 h-5" />
                        Login / Register
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}