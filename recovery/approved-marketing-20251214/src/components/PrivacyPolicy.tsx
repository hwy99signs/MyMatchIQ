import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import logoImage from 'figma:asset/e59cdf8a52814bfc4e60ccc52f8cdfd978064d6e.png';

interface PrivacyPolicyProps {
  onClose: () => void;
  translations: any;
}

export function PrivacyPolicy({ onClose, translations }: PrivacyPolicyProps) {
  const p = translations.privacy;
  
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
            <span>{p.backButton}</span>
          </button>
          
          <img 
            src={logoImage} 
            alt="MyMatchIQ Logo" 
            className="h-16 w-auto mb-6"
            style={{ mixBlendMode: 'multiply' }}
          />
          
          <h1 className="text-purple-900 mb-2">{p.title}</h1>
          <p className="text-gray-600">{p.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-purple-100">
          <div className="prose prose-purple max-w-none">
            {/* Section 1: Introduction */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section1Title}</h2>
              <p className="text-gray-700 mb-4">{p.section1Text1}</p>
              <p className="text-gray-700">{p.section1Text2}</p>
            </section>

            {/* Section 2: Information We Collect */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section2Title}</h2>
              
              <h3 className="text-purple-800 mb-3">{p.section2Subtitle1}</h3>
              <p className="text-gray-700 mb-4">{p.section2Text1}</p>
              <ul className="text-gray-700 mb-4 space-y-2">
                {p.section2List1.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-purple-800 mb-3">{p.section2Subtitle2}</h3>
              <p className="text-gray-700 mb-4">{p.section2Text2}</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                {p.section2List2.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-purple-800 mb-3">{p.section2Subtitle3}</h3>
              <p className="text-gray-700 mb-4">{p.section2Text3}</p>
              <p className="text-gray-700">{p.section2Text4}</p>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section3Title}</h2>
              <p className="text-gray-700 mb-4">{p.section3Text1}</p>
              <ul className="text-gray-700 space-y-2">
                {p.section3List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 3A: Legal Basis for Processing */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section3ATitle}</h2>
              <p className="text-gray-700 mb-4">{p.section3AText1}</p>
              <ul className="text-gray-700 space-y-2">
                {p.section3AList.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 4: Information Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section4Title}</h2>
              
              <h3 className="text-purple-800 mb-3">{p.section4Subtitle1}</h3>
              <p className="text-gray-700 mb-4">{p.section4Text1}</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                {p.section4DontList.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-purple-800 mb-3">{p.section4Subtitle2}</h3>
              <p className="text-gray-700 mb-4">{p.section4Text2}</p>
              <ul className="text-gray-700 space-y-2">
                {p.section4DoList.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 5: Data Security */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section5Title}</h2>
              <p className="text-gray-700 mb-4">{p.section5Text1}</p>
              <ul className="text-gray-700 space-y-2">
                {p.section5List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 6: Your Rights and Choices */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section6Title}</h2>
              <p className="text-gray-700 mb-4">{p.section6Text1}</p>
              <ul className="text-gray-700 space-y-2">
                {p.section6List.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 7: Data Retention */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section7Title}</h2>
              <p className="text-gray-700">{p.section7Text1}</p>
            </section>

            {/* Section 8: Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section8Title}</h2>
              <p className="text-gray-700 mb-4">{p.section8Text1}</p>
              <p className="text-gray-700">{p.section8Text2}</p>
            </section>

            {/* Section 8A: Cookies and Tracking Technologies */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section8ATitle}</h2>
              <p className="text-gray-700">{p.section8AText1}</p>
            </section>

            {/* Section 9: International Data Transfers */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section9Title}</h2>
              <p className="text-gray-700">{p.section9Text1}</p>
            </section>

            {/* Section 10: Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-purple-900 mb-4">{p.section10Title}</h2>
              <p className="text-gray-700">{p.section10Text1}</p>
            </section>

            {/* Section 11: Contact Us */}
            <section>
              <h2 className="text-purple-900 mb-4">{p.section11Title}</h2>
              <p className="text-gray-700 mb-4">{p.section11Text1}</p>
              <p className="text-gray-700 mb-2">{p.section11Email}</p>
              <p className="text-gray-700">{p.section11Address}</p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}