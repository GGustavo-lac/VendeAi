import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../locales';

type I18nContextType = {
  language: Language;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextType>({
  language: 'pt',
  t: () => '',
});

type I18nProviderProps = {
  children: ReactNode;
  language: Language;
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, language }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const t = (key: string, options?: Record<string, string | number>): string => {
    const langDict = translations[currentLanguage] || translations.pt;
    let text = key.split('.').reduce((obj: any, k: string) => obj && obj[k], langDict);

    if (!text) {
        // Fallback to English if key not found in current language
        const fallbackDict = translations.en;
        text = key.split('.').reduce((obj: any, k: string) => obj && obj[k], fallbackDict);
        if(!text) {
            console.warn(`Translation key not found: ${key}`);
            return key; // Return the key itself if not found anywhere
        }
    }

    if (options) {
      Object.keys(options).forEach(placeholder => {
        text = text.replace(`{{${placeholder}}}`, String(options[placeholder]));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ language: currentLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
