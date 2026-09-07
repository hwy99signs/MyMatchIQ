import { motion } from 'motion/react';
import { Language } from '../translations';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' }
  ];

  return (
    <div className="flex items-center gap-0.5 bg-white/60 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-purple-200">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className="relative px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200"
          aria-label={`Switch to ${lang.label}`}
        >
          {/* Active background */}
          {currentLanguage === lang.code && (
            <motion.div
              layoutId="activeLanguage"
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          
          {/* Text */}
          <span
            className={`relative z-10 ${
              currentLanguage === lang.code
                ? 'text-white'
                : 'text-gray-700 hover:text-purple-700'
            }`}
          >
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  );
}