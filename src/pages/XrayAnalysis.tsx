import Navigation from '@/components/Navigation';
import XrayAnalysis from '@/components/XrayAnalysis';

export default function XrayAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      <main className="pt-24 pb-12">
        <XrayAnalysis />
      </main>
    </div>
  );
}
