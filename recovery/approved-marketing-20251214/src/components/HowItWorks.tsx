import { motion } from 'motion/react';
import { FileText, Scan, TrendingUp } from 'lucide-react';

interface HowItWorksProps {
  translations: any;
}

export function HowItWorks({ translations }: HowItWorksProps) {
  const steps = [
    {
      icon: FileText,
      title: translations.howItWorks.step1Title,
      description: translations.howItWorks.step1Description,
      color: 'from-purple-500 to-purple-400'
    },
    {
      icon: Scan,
      title: translations.howItWorks.step2Title,
      description: translations.howItWorks.step2Description,
      color: 'from-purple-600 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: translations.howItWorks.step3Title,
      description: translations.howItWorks.step3Description,
      color: 'from-pink-500 to-purple-500'
    }
  ];

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-purple-900 mb-4">{translations.howItWorks.title}</h2>
        <p className="text-gray-700 text-xl max-w-2xl mx-auto">
          {translations.howItWorks.subtitle}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-purple-500/10 border border-purple-100 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{index + 1}</span>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-purple-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="inline-block bg-purple-50 border border-purple-200 rounded-2xl px-6 py-4">
          <p className="text-purple-900 font-medium">
            {translations.features.subtitle}
          </p>
        </div>
      </motion.div>
    </section>
  );
}