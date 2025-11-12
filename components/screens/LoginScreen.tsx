
import React, { useState } from 'react';
import Logo from '../common/Logo';
import { GoogleIcon } from '../icons/SocialIcons';
import SocialLoginButton from '../common/SocialLoginButton';
import { useI18n } from '../../hooks/useI18n';

interface LoginScreenProps {
    onEmailLogin: (email: string, password: string) => boolean;
    onSocialLogin: (provider: 'google') => boolean;
    onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onEmailLogin, onSocialLogin, onNavigateToRegister }) => {
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            onEmailLogin(email, password);
        } else {
            alert(t('login.fillFieldsError'));
        }
    };

    const handleSocialLogin = (provider: 'google') => {
        onSocialLogin(provider);
    };

    return (
        <div className="bg-brand-dark font-sans h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm mx-auto text-white animate-fade-in">
                <header className="text-center mb-8">
                    <Logo className="justify-center" />
                    <h1 className="text-2xl font-bold mt-4">{t('login.welcomeBack')}</h1>
                    <p className="mt-2 text-gray-400">
                        {t('login.signInToContinue')}
                    </p>
                </header>

                <div className="space-y-4">
                    <SocialLoginButton provider="Google" icon={<GoogleIcon />} onClick={() => handleSocialLogin('google')} />
                </div>
                
                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">{t('common.or')}</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('common.email')}</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            placeholder="you@email.com"
                            className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none transition-all" 
                        />
                    </div>
                     <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-1">{t('common.password')}</label>
                        <input 
                            id="password-login" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            placeholder="••••••••"
                            className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none transition-all" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        {t('login.signIn')}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-8">
                    {t('login.noAccount')}{' '}
                    <button onClick={onNavigateToRegister} className="font-semibold text-brand-lime hover:text-brand-green underline">
                        {t('login.register')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;