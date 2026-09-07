import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface SocialProofProps {
  translations: any;
}

export function SocialProof({ translations }: SocialProofProps) {
  const testimonials = [
    {
      text: translations.social.testimonial1,
      author: translations.social.testimonial1Author,
      rating: 5
    },
    {
      text: translations.social.testimonial2,
      author: translations.social.testimonial2Author,
      rating: 5
    },
    {
      text: translations.social.testimonial3,
      author: translations.social.testimonial3Author,
      rating: 5
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-purple-900 mb-4">{translations.social.title}</h2>
        <p className="text-gray-600">{translations.social.subtitle}</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-purple-500/10 border border-purple-100"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-purple-500 text-purple-500" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-700 mb-6 leading-relaxed italic">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <div className="border-t border-purple-100 pt-4">
              <p className="text-purple-900 font-semibold">{testimonial.author}</p>
              <p className="text-gray-500 text-sm">{translations.social.earlyTester}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}