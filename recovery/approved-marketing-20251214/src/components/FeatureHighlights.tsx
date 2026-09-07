import { motion } from 'motion/react';
import { Shield, Lock } from 'lucide-react';

interface FeatureHighlightsProps {
  translations: any;
}

export function FeatureHighlights({ translations }: FeatureHighlightsProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Single Scan Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -8 }}
          className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-500/30 text-white hover:shadow-purple-500/40 transition-all duration-300"
        >
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <div className="mb-3 inline-block">
            <span className="text-sm font-semibold bg-white/20 px-4 py-1.5 rounded-full">
              {translations.features.singleScanBadge}
            </span>
          </div>

          <h3 className="mb-4 text-white">{translations.features.singleScanTitle}</h3>
          
          <p className="text-purple-100 mb-6 text-lg leading-relaxed">
            {translations.features.singleScanDescription}
          </p>

          <div className="space-y-3">
            {[
              translations.features.singleScanFeature1,
              translations.features.singleScanFeature2,
              translations.features.singleScanFeature3
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-purple-50">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dual Scan Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -8 }}
          className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 md:p-10 shadow-2xl shadow-pink-500/30 text-white hover:shadow-pink-500/40 transition-all duration-300"
        >
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <div className="mb-3 inline-block">
            <span className="text-sm font-semibold bg-white/20 px-4 py-1.5 rounded-full">
              {translations.features.dualScanBadge}
            </span>
          </div>

          <h3 className="mb-4 text-white">{translations.features.dualScanTitle}</h3>
          
          <p className="text-pink-100 mb-6 text-lg leading-relaxed">
            {translations.features.dualScanDescription}
          </p>

          <div className="space-y-3 mb-6">
            {[
              translations.features.dualScanFeature1,
              translations.features.dualScanFeature2,
              translations.features.dualScanFeature3
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-pink-50">{feature}</span>
              </div>
            ))}
          </div>

          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <span className="text-sm text-white/90">{translations.features.dualScanFeature4}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}