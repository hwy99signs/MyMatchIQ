import { motion } from 'motion/react';
import { Shield, Lock, CheckCircle2, Heart, Users, Brain } from 'lucide-react';

interface TrustPositioningProps {
  translations: any;
}

export function TrustPositioning({ translations }: TrustPositioningProps) {
  const trustPoints = [
    {
      icon: Shield,
      title: translations.trustPositioning.point1Title,
      description: translations.trustPositioning.point1Description,
      emphasized: false
    },
    {
      icon: Lock,
      title: translations.trustPositioning.point2Title,
      description: translations.trustPositioning.point2Description,
      emphasized: false
    },
    {
      icon: CheckCircle2,
      title: translations.trustPositioning.point3Title,
      description: translations.trustPositioning.point3Description,
      emphasized: false
    },
    {
      icon: Heart,
      title: translations.trustPositioning.point4Title,
      description: translations.trustPositioning.point4Description,
      emphasized: false
    },
    {
      icon: Users,
      title: translations.trustPositioning.point5Title,
      description: translations.trustPositioning.point5Description,
      emphasized: false
    },
    {
      icon: Brain,
      title: translations.trustPositioning.point6Title,
      description: translations.trustPositioning.point6Description,
      emphasized: true
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-purple-900 mb-4">
            {translations.trustPositioning.title}
          </h2>
        </div>

        {/* Trust Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trustPoints.map((point, index) => {
            const IconComponent = point.icon;
            const isEmphasized = point.emphasized;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white/60 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 ${
                  isEmphasized 
                    ? 'border-purple-200 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/15 bg-gradient-to-br from-white/80 to-purple-50/30' 
                    : 'border-purple-100 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10'
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  isEmphasized 
                    ? 'bg-gradient-to-br from-purple-200 to-purple-100' 
                    : 'bg-gradient-to-br from-purple-100 to-purple-50'
                }`}>
                  <IconComponent className={`w-7 h-7 ${isEmphasized ? 'text-purple-700' : 'text-purple-600'}`} strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className={`mb-3 text-lg ${isEmphasized ? 'text-purple-900 font-medium' : 'text-purple-900'}`}>
                  {point.title}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed ${isEmphasized ? 'text-gray-700' : 'text-gray-600'}`}>
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}