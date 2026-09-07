import { motion } from 'motion/react';

interface FinalCTAProps {
  translations: any;
}

export function FinalCTA({ translations }: FinalCTAProps) {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-[4rem] p-12 md:p-20 overflow-hidden shadow-2xl shadow-purple-500/30"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl"></div>

        <div className="relative text-center">
          <h2 className="text-white mb-6">{translations.finalCta.title}</h2>
          <p className="text-purple-100 text-xl mb-10 max-w-2xl mx-auto">
            {translations.finalCta.subtitle}
          </p>

          <motion.button
            onClick={scrollToWaitlist}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white text-purple-700 rounded-full shadow-2xl hover:shadow-white/30 transition-all duration-300 text-lg"
          >
            {translations.finalCta.button}
          </motion.button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              { number: translations.finalCta.stat1Number, label: translations.finalCta.stat1Label },
              { number: translations.finalCta.stat2Number, label: translations.finalCta.stat2Label },
              { number: translations.finalCta.stat3Number, label: translations.finalCta.stat3Label }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Stats Disclaimer */}
          <p className="text-purple-200/70 text-xs mt-6 text-center">
            {translations.finalCta.statsDisclaimer}
          </p>
        </div>
      </motion.div>
    </section>
  );
}