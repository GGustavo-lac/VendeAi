

import React from 'react';
import { getTermsOfService, getPrivacyPolicy } from '../../utils/legalContent';
import { useI18n } from '../../hooks/useI18n';

interface LegalDocModalProps {
    isOpen: boolean;
    onClose: () => void;
    docType: 'terms' | 'privacy';
}

const LegalDocModal: React.FC<LegalDocModalProps> = ({ isOpen, onClose, docType }) => {
    const { t, language } = useI18n();

    if (!isOpen) return null;

    const title = docType === 'terms' ? t('legal.termsTitle') : t('legal.privacyTitle');
    const content = docType === 'terms' ? getTermsOfService(language) : getPrivacyPolicy(language);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-lg h-[90vh] flex flex-col p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 prose prose-invert prose-sm text-gray-300">
                    <p className="whitespace-pre-wrap">{content}</p>
                </div>
                 <button onClick={onClose} className="w-full mt-4 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex-shrink-0">
                    {t('legal.closeButton')}
                </button>
            </div>
        </div>
    );
};

export default LegalDocModal;