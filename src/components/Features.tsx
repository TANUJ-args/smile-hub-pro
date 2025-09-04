import { UserCheck, TrendingUp, Microscope, Shield, Clock, HeartHandshake } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: UserCheck,
    title: 'Personal Patient Management',
    description: 'Comprehensive patient profiling with advanced treatment tracking. Each user maintains their own private patient database.',
    gradient: 'from-primary to-primary-light'
  },
  {
    icon: TrendingUp,
    title: 'Private Financial Tracking',
    description: 'Monitor total fees, payments received, and outstanding dues with detailed financial reporting. Your data stays private.',
    gradient: 'from-accent to-accent-light'
  },
  {
    icon: Microscope,
    title: 'Secure Treatment Plans',
    description: 'Track various dental treatments including orthodontics, prosthodontics, and specialized procedures with complete privacy.',
    gradient: 'from-secondary to-secondary-light'
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Bank-level encryption ensures your patient data is protected. HIPAA compliant with regular security audits.',
    gradient: 'from-primary-dark to-primary'
  },
  {
    icon: Clock,
    title: 'Appointment Scheduling',
    description: 'Smart scheduling system with automated reminders and conflict detection. Never miss an appointment again.',
    gradient: 'from-accent-light to-accent'
  },
  {
    icon: HeartHandshake,
    title: 'Patient Communication',
    description: 'Built-in messaging system for secure communication with patients. Send treatment plans and updates easily.',
    gradient: 'from-secondary-light to-secondary'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold font-heading">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your dental practice efficiently and securely
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-hover transition-all duration-500 hover:-translate-y-2 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative p-8 space-y-4">
                  {/* Icon Container */}
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-glow`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold font-heading group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Hover Indicator */}
                  <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Card Border Glow Effect */}
                <div className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}