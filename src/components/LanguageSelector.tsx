import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  selectedLanguage: 'en' | 'ja';
  onLanguageChange: (language: 'en' | 'ja') => void;
  onContinue: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  onContinue
}) => {
  const { t } = useLanguage();

  const languages = [
    {
      code: 'en' as const,
      name: t('language.english'),
      flag: '🇺🇸',
      description: t('language.englishDesc')
    },
    {
      code: 'ja' as const,
      name: t('language.japanese'),
      flag: '🇯🇵',
      description: t('language.japaneseDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('language.title')}
          </h1>
          <p className="text-white/70">
            {t('language.description')}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedLanguage === language.code
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold">{language.name}</div>
                    <div className="text-sm opacity-70">{language.description}</div>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          {t('language.continue')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;