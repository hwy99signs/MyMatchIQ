import { motion } from 'motion/react';
import { Shield, Lock, Eye, Settings } from 'lucide-react';

interface TrustSafetyProps {
  translations: any;
}

export function TrustSafety({ translations }: TrustSafetyProps) {
  const features = [
    {
      icon: Shield,
      title: translations.trust.privacyTitle,
      description: translations.trust.privacyDescription
    },
    {
      icon: Lock,
      title: translations.trust.securityTitle,
      description: translations.trust.securityDescription
    },
    {
      icon: Eye,
      title: translations.trust.transparencyTitle,
      description: translations.trust.transparencyDescription
    },
    {
      icon: Settings,
      title: translations.trust.controlTitle,
      description: translations.trust.controlDescription
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[4rem] my-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-purple-900 mb-4">{translations.trust.title}</h2>
        <p className="text-gray-700 text-xl max-w-2xl mx-auto">
          {translations.trust.subtitle}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-700 font-medium leading-relaxed">{feature.title}</p>
              <p className="text-gray-500 text-sm leading-relaxed mt-2">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Promise Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-purple-200 shadow-lg"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        
        <div className="text-center pt-4">
          <h3 className="text-purple-900 mb-3">{translations.trust.promiseTitle}</h3>
          <p className="text-gray-700 text-xl italic">
            "{translations.trust.promiseQuote}"
          </p>
        </div>
      </motion.div>
    </section>
  );
}