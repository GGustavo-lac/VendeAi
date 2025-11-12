
import React from 'react';
import Logo from '../common/Logo';
import { useI18n } from '../../hooks/useI18n';

interface WelcomeScreenProps {
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
    const { t } = useI18n();

    return (
        <div className="bg-brand-dark font-sans h-screen flex flex-col justify-between p-8 text-white text-center">
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <Logo className="justify-center" />
                <h1 className="text-3xl md:text-4xl font-bold mt-6">
                    {t('welcome.headline1')} <span className="text-brand-lime">{t('welcome.headline2')}</span>
                </h1>
                <p className="mt-4 max-w-md text-gray-300 text-lg">
                    {t('welcome.subtitle')}
                </p>
            </div>

            <div className="flex-shrink-0 space-y-4 animate-fade-in-up">
                <button 
                    onClick={onNavigateToRegister}
                    className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    {t('welcome.register')}
                </button>
                <button 
                    onClick={onNavigateToLogin}
                    className="w-full bg-brand-dark-secondary hover:bg-slate-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-colors"
                >
                    {t('welcome.signIn')}
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;