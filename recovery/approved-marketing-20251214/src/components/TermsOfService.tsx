import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import logoImage from 'figma:asset/e59cdf8a52814bfc4e60ccc52f8cdfd978064d6e.png';

interface TermsOfServiceProps {
  onClose: () => void;
  translations: any;
}

export function TermsOfService({ onClose, translations }: TermsOfServiceProps) {
  const t = translations.terms;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50 z-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backButton}</span>
          </button>
          
          <img 
            src={logoImage} 
            alt="MyMatchIQ Logo" 
            className="h-16 w-auto mb-6"
            style={{ mixBlendMode: 'multiply' }}
          />
          
          <h1 className="text-purple-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-purple-100">
          <div className="prose prose-purple max-w-none">
            {/* Section 1: Agreement to Terms */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section1Title}</h2>
              <p className="text-gray-700 mb-4">{t.section1Text1}</p>
              <p className="text-gray-700">{t.section1Text2}</p>
            </section>

            {/* Section 2: Description of Service */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section2Title}</h2>
              <p className="text-gray-700 mb-4">{t.section2Text1}</p>
              <p className="text-gray-700">{t.section2Text2}</p>
              <ul className="text-gray-700 space-y-2">
                {t.section2List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 3: Eligibility */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section3Title}</h2>
              <p className="text-gray-700 mb-4">{t.section3Text1}</p>
              <ul className="text-gray-700 space-y-2">
                {t.section3List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 4: Account Registration and Security */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section4Title}</h2>
              <p className="text-gray-700 mb-4">{t.section4Text1}</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                {t.section4List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700">{t.section4Text2}</p>
            </section>

            {/* Section 4A: Identity Verification */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section4ATitle}</h2>
              <p className="text-gray-700 mb-4">{t.section4AText1}</p>
              <p className="text-gray-700">{t.section4AText2}</p>
            </section>

            {/* Section 5: Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section5Title}</h2>
              
              <h3 className="text-purple-800 mb-3">{t.section5Subtitle1}</h3>
              <ul className="text-gray-700 mb-6 space-y-2">
                {t.section5DontList.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-purple-800 mb-3">{t.section5Subtitle2}</h3>
              <ul className="text-gray-700 space-y-2">
                {t.section5DoList.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 6: Consent and Privacy */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section6Title}</h2>
              <p className="text-gray-700 mb-4">{t.section6Text1}</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                {t.section6List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700">{t.section6Text2}</p>
            </section>

            {/* Section 7: Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section7Title}</h2>
              <p className="text-gray-700 mb-4">{t.section7Text1}</p>
              <p className="text-gray-700">{t.section7Text2}</p>
            </section>

            {/* Section 8: Subscription and Payment */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section8Title}</h2>
              <p className="text-gray-700 mb-4">{t.section8Text1}</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                {t.section8List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700">{t.section8Text2}</p>
            </section>

            {/* Section 9: Disclaimers and Limitations */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section9Title}</h2>
              
              <h3 className="text-purple-800 mb-3">{t.section9Subtitle1}</h3>
              <p className="text-gray-700 mb-4">{t.section9Text1}</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                {t.section9List1.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-purple-800 mb-3">{t.section9Subtitle2}</h3>
              <p className="text-gray-700 mb-4">{t.section9Text2}</p>
              <p className="text-gray-700 mb-6">{t.section9Text2A}</p>
              
              <h3 className="text-purple-800 mb-3">{t.section9Subtitle3}</h3>
              <p className="text-gray-700">{t.section9Text3}</p>
            </section>

            {/* Section 10: Indemnification */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section10Title}</h2>
              <p className="text-gray-700">{t.section10Text1}</p>
            </section>

            {/* Section 11: Termination */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section11Title}</h2>
              <p className="text-gray-700 mb-4">{t.section11Text1}</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                {t.section11List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700">{t.section11Text2}</p>
            </section>

            {/* Section 12: Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section12Title}</h2>
              <p className="text-gray-700 mb-4">{t.section12Text1}</p>
              <p className="text-gray-700">{t.section12Text2}</p>
            </section>

            {/* Section 13: Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section13Title}</h2>
              <p className="text-gray-700">{t.section13Text1}</p>
            </section>

            {/* Section 14: Miscellaneous */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{t.section14Title}</h2>
              <ul className="text-gray-700 space-y-2">
                {t.section14List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 15: Contact Us */}
            <section>
              <h2 className="text-purple-900 mb-4">{t.section15Title}</h2>
              <p className="text-gray-700 mb-4">{t.section15Text1}</p>
              <p className="text-gray-700 mb-2">{t.section15Email}</p>
              <p className="text-gray-700">{t.section15Address}</p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}