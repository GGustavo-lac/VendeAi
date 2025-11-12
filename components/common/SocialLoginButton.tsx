
import React from 'react';
import { useI18n } from '../../hooks/useI18n';

interface SocialLoginButtonProps {
    provider: 'Google' | 'Facebook';
    icon: React.ReactNode;
    onClick: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, icon, onClick }) => {
    const { t } = useI18n();
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg bg-brand-dark-secondary hover:bg-slate-700 transition-colors"
        >
            {icon}
            <span className="font-semibold text-white">{t('common.continueWith', { provider })}</span>
        </button>
    );
};

export default SocialLoginButton;