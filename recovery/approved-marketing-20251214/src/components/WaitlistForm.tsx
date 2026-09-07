import { motion } from 'motion/react';
import { useState } from 'react';

interface WaitlistFormProps {
  translations: any;
}

export function WaitlistForm({ translations }: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    interest: '',
    country: '',
    language: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    email: ''
  });

  // Comprehensive list of countries including Caribbean islands
  const countries = [
    // Caribbean Islands
    'Anguilla', 'Antigua and Barbuda', 'Aruba', 'Bahamas', 'Barbados', 'Bonaire', 
    'British Virgin Islands', 'Cayman Islands', 'Cuba', 'Curaçao', 'Dominica', 
    'Dominican Republic', 'Grenada', 'Guadeloupe', 'Haiti', 'Jamaica', 'Martinique', 
    'Montserrat', 'Puerto Rico', 'Saba', 'Saint Barthélemy', 'Saint Kitts and Nevis', 
    'Saint Lucia', 'Saint Martin', 'Saint Vincent and the Grenadines', 'Sint Eustatius', 
    'Sint Maarten', 'Trinidad and Tobago', 'Turks and Caicos Islands', 
    'U.S. Virgin Islands',
    // World Countries (Alphabetically)
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 
    'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 
    'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Ecuador', 'Egypt', 
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 
    'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
    'Greece', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Honduras', 'Hungary', 
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 
    'Ivory Coast', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 
    'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 
    'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 
    'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 
    'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 
    'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 
    'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Tunisia', 'Turkey', 'Turkmenistan', 
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 
    'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ].sort();

  const languageOptions = [
    { value: 'en', label: 'English (EN)' },
    { value: 'es', label: 'Español (SP)' },
    { value: 'fr', label: 'Français (FR)' }
  ];

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      email: ''
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = translations.waitlist.errorMessage;
    }

    if (!formData.email.trim()) {
      newErrors.email = translations.waitlist.errorMessage;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = translations.waitlist.errorMessage;
    }

    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.email;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create mailto link with form data
    const subject = encodeURIComponent(`MyMatchIQ Waitlist - ${formData.firstName}`);
    const body = encodeURIComponent(
      `Name: ${formData.firstName}\nEmail: ${formData.email}\nInterest Level: ${formData.interest || 'Not specified'}\nCountry: ${formData.country || 'Not specified'}\nLanguage: ${formData.language || 'Not specified'}`
    );
    
    window.location.href = `mailto:Support@mymatchiq.com?subject=${subject}&body=${body}`;
    
    // Show success message
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ firstName: '', email: '', interest: '', country: '', language: '' });
      setErrors({ firstName: '', email: '' });
    }, 3000);
  };

  return (
    <section id="waitlist" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-500/10 p-8 md:p-12 border border-purple-100">
          <div className="text-center mb-8">
            <h2 className="text-purple-900 mb-4">{translations.waitlist.title}</h2>
            <p className="text-gray-700 text-lg">
              {translations.waitlist.subtitle}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.waitlist.namePlaceholder}
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500/20'
                  } focus:ring-2 outline-none transition-all`}
                  placeholder={translations.waitlist.namePlaceholder}
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.waitlist.emailPlaceholder}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-500/20'
                  } focus:ring-2 outline-none transition-all`}
                  placeholder={translations.waitlist.emailPlaceholder}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Interest Dropdown */}
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.waitlist.tierLabel}
                </label>
                <select
                  id="interest"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">{translations.waitlist.tierLabel}</option>
                  <option value="basic">{translations.waitlist.tierBasic}</option>
                  <option value="premier">{translations.waitlist.tierPremier}</option>
                  <option value="elite">{translations.waitlist.tierElite}</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {translations.waitlist.tierHelper}
                </p>
              </div>

              {/* Country Dropdown */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.waitlist.countryLabel}
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">{translations.waitlist.countryLabel}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Language Dropdown */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.waitlist.languageLabel}
                </label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">{translations.waitlist.languageLabel}</option>
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
              >
                {translations.waitlist.submitButton}
              </motion.button>

              {/* Microcopy */}
              <p className="text-center text-sm text-gray-500">
                {translations.waitlist.privacyNote}
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-purple-900 mb-2">{translations.waitlist.successMessage}</h3>
              <p className="text-gray-600">{translations.waitlist.successSubtext}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}