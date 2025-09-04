import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <head>
        <title>Smile Hub - Professional Dental Patient Management Platform</title>
        <meta name="description" content="Streamline your dental practice with Smile Hub. Manage patient records, track treatments, and handle financial reporting with our secure, HIPAA-compliant platform." />
        <meta name="keywords" content="dental management, patient records, dental practice software, treatment tracking, HIPAA compliant, appointment scheduling" />
        <meta property="og:title" content="Smile Hub - Professional Dental Management" />
        <meta property="og:description" content="Modern dental practice management platform for efficient patient care" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://smilehub.com" />
      </head>

      <Navigation />
      
      <main>
        <Hero />
        <Features />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
