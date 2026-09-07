import { motion } from 'motion/react';
import logoImage from 'figma:asset/e59cdf8a52814bfc4e60ccc52f8cdfd978064d6e.png';

interface FooterProps {
  onNavigate: (page: 'home' | 'privacy' | 'terms') => void;
  translations: any;
}

export function Footer({ onNavigate, translations }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-purple-200">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img 
              src={logoImage} 
              alt="MyMatchIQ Logo" 
              className="h-12 w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
            <p className="text-sm text-gray-600">
              {translations.footer.copyright}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <button
              onClick={() => onNavigate('privacy')}
              className="text-gray-600 hover:text-purple-700 transition-colors duration-200"
            >
              {translations.footer.privacy}
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-gray-600 hover:text-purple-700 transition-colors duration-200"
            >
              {translations.footer.terms}
            </button>
            <a
              href="mailto:Support@mymatchiq.com"
              className="text-gray-600 hover:text-purple-700 transition-colors duration-200"
            >
              {translations.footer.contact}
            </a>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic max-w-2xl mx-auto">
            {translations.footer.tagline}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}