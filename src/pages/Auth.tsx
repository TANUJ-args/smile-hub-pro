import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Heart, Shield, Zap, ArrowLeft, Home, Users } from 'lucide-react';
import logoMain from '@/assets/smile-hub-logo.svg';

// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://smilehub-pro-backend.onrender.com' 
  : '';

const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
};

export default function Auth() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }

      const { accessToken } = await response.json();
      login(accessToken);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }

      toast({
        title: "Registration Successful",
        description: "You can now log in with your credentials.",
      });
      
      // Switch to login tab after successful registration
      setActiveTab('login');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background - matching home page */}
      <div className="absolute inset-0 bg-background"></div>
      <div className="absolute inset-0 bg-gradient-radial"></div>
      
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border group-hover:bg-card/70 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card/70 transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link 
              to="/patients" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card/70 transition-all"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Patients</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating Elements - using theme colors */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-primary/20 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-accent/20 rounded-full opacity-40 animate-bounce delay-1000"></div>
      <div className="absolute bottom-32 left-16 w-16 h-16 bg-primary/15 rounded-full opacity-35 animate-pulse delay-500"></div>
      <div className="absolute bottom-20 right-20 w-8 h-8 bg-accent/25 rounded-full opacity-50 animate-bounce delay-2000"></div>

      {/* Left Side - Brand/Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="max-w-md space-y-8 text-center relative z-10">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="mx-auto">
              <img 
                src={logoMain} 
                alt="SmileHub Family Dental" 
                className="h-24 w-auto mx-auto animate-float"
              />
            </div>
            <h1 className="text-4xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
              SmileHub Pro
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced Dental Practice Management
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border shadow-elegant">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">HIPAA compliant data protection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border shadow-elegant">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Optimized for busy practices</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border shadow-elegant">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Smart X-ray analysis & insights</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">1000+</div>
              <div className="text-xs text-muted-foreground">Happy Dentists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">50K+</div>
              <div className="text-xs text-muted-foreground">Patients Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
              SmileHub Pro
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-sm border border-border">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <Card className="bg-card/70 backdrop-blur-xl border border-border shadow-elegant">
                <CardHeader className="space-y-4 text-center">
                  <CardTitle className="text-3xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-base">
                    Sign in to your account to continue managing your practice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="login-password" 
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-primary hover:shadow-glow text-primary-foreground font-semibold shadow-elegant hover:shadow-hover transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Sign In to Your Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <Card className="bg-card/70 backdrop-blur-xl border border-border shadow-elegant">
                <CardHeader className="space-y-4 text-center">
                  <CardTitle className="text-3xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
                    Join SmileHub Pro
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create your account and transform your dental practice today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="register-password" 
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          required 
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="confirm-password" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          required 
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-primary hover:shadow-glow text-primary-foreground font-semibold shadow-elegant hover:shadow-hover transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Create Your Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Skip Link and Navigation */}
          <div className="space-y-4">
            <div className="text-center">
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary/5 border border-primary/20 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Explore without signing in</span>
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              </Link>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <span>Quick access: </span>
              <Link to="/patients" className="text-primary hover:text-primary-light transition-colors">Patients</Link>
              <span className="mx-2">•</span>
              <Link to="/xray-analysis" className="text-primary hover:text-primary-light transition-colors">AI X-ray</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
