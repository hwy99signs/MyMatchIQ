import { useState } from 'react';
import { Hero } from './components/Hero';
import { TrustPositioning } from './components/TrustPositioning';
import { WaitlistForm } from './components/WaitlistForm';
import { HowItWorks } from './components/HowItWorks';
import { FeatureHighlights } from './components/FeatureHighlights';
import { TrustSafety } from './components/TrustSafety';
import { SocialProof } from './components/SocialProof';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { Language, getTranslation } from './translations';

type Page = 'home' | 'privacy' | 'terms';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>('en');
  
  const t = getTranslation(language);

  if (currentPage === 'privacy') {
    return <PrivacyPolicy onClose={() => setCurrentPage('home')} translations={t} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onClose={() => setCurrentPage('home')} translations={t} />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50">
      {/* Abstract background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Hero language={language} onLanguageChange={setLanguage} translations={t} />
        <TrustPositioning translations={t} />
        <HowItWorks translations={t} />
        <FeatureHighlights translations={t} />
        <TrustSafety translations={t} />
        <SocialProof translations={t} />
        <FAQ translations={t} />
        <FinalCTA translations={t} />
        <WaitlistForm translations={t} />
        <Footer onNavigate={setCurrentPage} translations={t} />
      </div>
    </div>
  );
}