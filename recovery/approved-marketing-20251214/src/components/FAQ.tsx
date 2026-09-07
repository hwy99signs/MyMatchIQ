import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQProps {
  translations: any;
}

export function FAQ({ translations }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: translations.faq.q1,
      answer: translations.faq.a1
    },
    {
      question: translations.faq.q2,
      answer: translations.faq.a2
    },
    {
      question: translations.faq.q3,
      answer: translations.faq.a3
    },
    {
      question: translations.faq.q4,
      answer: translations.faq.a4
    },
    {
      question: translations.faq.q5,
      answer: translations.faq.a5
    },
    {
      question: translations.faq.q6,
      answer: translations.faq.a6
    }
  ];

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-purple-900 mb-4">{translations.faq.title}</h2>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-purple-500/10 border border-purple-100 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-purple-50/50 transition-colors duration-200"
            >
              <span className="font-semibold text-purple-900 pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-purple-600" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}