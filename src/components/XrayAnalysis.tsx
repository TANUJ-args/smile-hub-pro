import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function XrayAnalysis() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up">
            <CardHeader>
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
                AI X-Ray Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-semibold text-muted-foreground">
                Coming Soon!
              </p>
              <p className="text-lg text-muted-foreground">
                We're working hard to bring you AI-powered dental X-ray analysis. This feature will help you detect cavities and other anomalies with greater accuracy and speed.
              </p>
              <p className="text-muted-foreground">
                Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
