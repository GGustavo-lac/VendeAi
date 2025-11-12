
import React, { useState, useRef } from 'react';
import { User, Language } from '../../types';
import UserIcon from '../icons/UserIcon';
import LegalDocModal from '../common/LegalDocModal';
import { useI18n } from '../../hooks/useI18n';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';

interface ProfileScreenProps {
    currentUser: User;
    onLogout: () => void;
    onUpdateProfilePicture: (file: File) => void;
    onChangeLanguage: (lang: Language) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onLogout, onUpdateProfilePicture, onChangeLanguage }) => {
    const { t } = useI18n();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalDocType, setLegalDocType] = useState<'terms' | 'privacy'>('terms');

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpdateProfilePicture(file);
        }
    };
    
    const openLegalModal = (docType: 'terms' | 'privacy') => {
        setLegalDocType(docType);
        setIsLegalModalOpen(true);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeLanguage(e.target.value as Language);
    };
    
    const handleSupportClick = () => {
        window.location.href = `mailto:${t('supportEmail')}`;
    };

    const ProfileOption: React.FC<{ label: string, onClick: () => void, isDestructive?: boolean, icon?: React.ReactNode }> = ({ label, onClick, isDestructive = false, icon }) => (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg transition-colors flex items-center space-x-3 ${
                isDestructive
                    ? 'bg-red-900/50 text-red-400 hover:bg-red-900/80'
                    : 'bg-brand-dark-secondary text-white hover:bg-slate-700'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="p-6 text-white animate-fade-in">
            <h1 className="text-2xl font-bold text-center mb-8">{t('profile.title')}</h1>
            
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <button onClick={handleAvatarClick} className="w-24 h-24 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center overflow-hidden border-2 border-brand-lime">
                        {currentUser.profilePictureUrl ? (
                            <img src={currentUser.profilePictureUrl} alt={t('profile.profilePictureAlt')} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-gray-300" />
                        )}
                    </button>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center border-2 border-brand-dark-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <h2 className="text-xl font-semibold mt-4">{currentUser.name}</h2>
                <p className="text-gray-400">{currentUser.email}</p>
            </div>

            <div className="space-y-3">
                <div className="bg-brand-dark-secondary p-4 rounded-lg flex justify-between items-center">
                    <label htmlFor="language" className="text-white">{t('profile.language')}</label>
                    <select id="language" onChange={handleLanguageChange} value={currentUser.language} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-brand-green focus:border-brand-green p-2">
                        <option value="pt">Português (Brasil)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>
                <ProfileOption label={t('profile.support')} onClick={handleSupportClick} icon={<EnvelopeIcon className="w-5 h-5" />} />
                <ProfileOption label={t('profile.terms')} onClick={() => openLegalModal('terms')} />
                <ProfileOption label={t('profile.privacy')} onClick={() => openLegalModal('privacy')} />
                <div className="pt-4">
                    <ProfileOption label={t('profile.logout')} onClick={onLogout} isDestructive />
                </div>
            </div>
            
             <LegalDocModal 
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                docType={legalDocType}
            />
        </div>
    );
};

export default ProfileScreen;