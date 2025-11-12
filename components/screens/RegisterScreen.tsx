
import React, { useState } from 'react';
import Logo from '../common/Logo';
import { GoogleIcon, FacebookIcon } from '../icons/SocialIcons';
import SocialLoginButton from '../common/SocialLoginButton';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/apiService';

interface RegisterScreenProps {
    onNavigateToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
    const { t } = useI18n();
    const { register, loading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim() && password.trim()) {
            await register(email, password, name);
        } else {
            alert(t('register.fillFieldsError'));
        }
    };

    const handleSocialRegister = (provider: 'google' | 'facebook') => {
        const url = provider === 'google' ? authAPI.getGoogleOAuthUrl() : authAPI.getFacebookOAuthUrl();
        window.location.href = url;
    };

    return (
        <div className="bg-brand-dark font-sans h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm mx-auto text-white animate-fade-in">
                <header className="text-center mb-8">
                    <Logo className="justify-center" />
                    <h1 className="text-2xl font-bold mt-4">{t('register.createAccount')}</h1>
                    <p className="mt-2 text-gray-400">{t('register.startSelling')}</p>
                </header>
                
                <div className="space-y-4">
                    <SocialLoginButton provider="Google" icon={<GoogleIcon />} onClick={() => handleSocialRegister('google')} />
                    <SocialLoginButton provider="Facebook" icon={<FacebookIcon />} onClick={() => handleSocialRegister('facebook')} />
                </div>
                
                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">{t('common.or')}</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <form onSubmit={handleEmailRegister} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('common.name')}</label>
                        <input 
                            id="name" 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                            placeholder={t('register.namePlaceholder')}
                            className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none transition-all" 
                        />
                    </div>
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-gray-300 mb-1">{t('common.email')}</label>
                        <input 
                            id="email-register" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            placeholder="you@email.com"
                            className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none transition-all" 
                        />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-300 mb-1">{t('common.password')}</label>
                        <input 
                            id="password-register" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            placeholder="••••••••"
                            className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none transition-all" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        {t('register.registerButton')}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-8">
                    {t('register.haveAccount')}{' '}
                    <button onClick={onNavigateToLogin} className="font-semibold text-brand-lime hover:text-brand-green underline">
                        {t('register.signIn')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterScreen;