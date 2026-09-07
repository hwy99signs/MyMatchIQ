import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import logoImage from 'figma:asset/e59cdf8a52814bfc4e60ccc52f8cdfd978064d6e.png';
import heroBackgroundImage from 'figma:asset/a62c2c040c06dcf93d9c78587e391fcc95887294.png';
import { LanguageToggle } from './LanguageToggle';
import { Language } from '../translations';

interface HeroProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  translations: any;
}

export function Hero({ language, onLanguageChange, translations }: HeroProps) {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroBackgroundImage}')`,
            filter: 'saturate(0.85)'
          }}
        />
        {/* Gradient Overlay - Deep purple to soft lavender */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.80) 0%, rgba(167, 139, 250, 0.75) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8">
          <img 
            src={logoImage} 
            alt="MyMatchIQ Logo" 
            className="h-32 md:h-40 w-auto"
          />
        </div>

        {/* Language Toggle - Top Right */}
        <div className="absolute top-8 right-8">
          <LanguageToggle 
            currentLanguage={language} 
            onLanguageChange={onLanguageChange} 
          />
        </div>

        <div className="max-w-md mx-auto px-6 py-20 md:py-32 pt-64 md:pt-72">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white mb-6 text-4xl md:text-5xl"
              style={{ lineHeight: '1.1' }}
            >
              {translations.hero.headline}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white mb-12 text-lg md:text-xl"
              style={{ opacity: 0.95, lineHeight: '1.6' }}
            >
              {translations.hero.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col gap-4 w-full"
            >
              <motion.button
                onClick={scrollToHowItWorks}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-white text-purple-700 rounded-full shadow-2xl hover:shadow-white/30 transition-all duration-300 text-base"
              >
                {translations.hero.learnMore}
              </motion.button>
              
              <motion.button
                onClick={scrollToWaitlist}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-transparent text-white rounded-full border-2 border-white/80 hover:bg-white/10 transition-all duration-300 text-base"
              >
                {translations.hero.waitlistButton}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - MyMatchIQ Logo with Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1"
        >
          <img 
            src={logoImage} 
            alt="MyMatchIQ" 
            className="h-8 w-auto"
          />
          <ArrowDown className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>
    </section>
  );
}