

import React, { useState, useEffect } from 'react';
import { Product, Plan, Screen } from '../../types';
import { generateAdCopy } from '../../services/geminiService';
import { useI18n } from '../../hooks/useI18n';

interface ProductActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    currentPlan: Plan;
    onAttemptAiUse: () => boolean;
    setActiveScreen: (screen: Screen) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-brand-dark animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-dark animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-dark animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);


const ProductActionsModal: React.FC<ProductActionsModalProps> = ({ isOpen, onClose, product, currentPlan, onAttemptAiUse, setActiveScreen }) => {
    const { t, language } = useI18n();
    const [platform, setPlatform] = useState('Instagram');
    const [tone, setTone] = useState(t('productActions.tones.friendly'));
    const [description, setDescription] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setGeneratedText('');
            setIsLoading(false);
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const handleGenerate = async () => {
        if(!description.trim()){
            alert(t('productActions.errorDescription'));
            return;
        }

        if (!onAttemptAiUse()) {
            // onAttemptAiUse shows its own alert, but we can also navigate
            onClose(); // Close this modal first
            setActiveScreen(Screen.Plans);
            return;
        }
        setIsLoading(true);
        setGeneratedText('');
        try {
            const text = await generateAdCopy(product, description, platform, tone);
            setGeneratedText(text);
        } catch (error) {
            console.error("Failed to generate ad copy:", error);
            alert(t('productActions.errorGenerate'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        alert(t('productActions.copied'));
    };

    const formatCurrency = (value: number) => {
        const locales = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const currencies = { 'pt': 'BRL', 'en': 'USD', 'es': 'EUR' };
        return value.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    }

    const hasLinks = product.links && (product.links.shopee || product.links.mercadoLivre);
    const hasAiAccess = currentPlan.id === 'pro' || currentPlan.id === 'premium';
    const tones = [t('productActions.tones.friendly'), t('productActions.tones.professional'), t('productActions.tones.fun'), t('productActions.tones.urgent')];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-sm p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">{t('productActions.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="text-center mb-6">
                    <p className="font-semibold text-lg">{product.name}</p>
                    <p className="text-brand-lime font-bold text-2xl">{formatCurrency(product.price)}</p>
                </div>
                
                <div className="space-y-6">
                    {hasLinks && (
                        <div>
                            <h3 className="font-semibold text-center mb-3">{t('productActions.myAds')}</h3>
                            <div className="space-y-2">
                                {product.links?.shopee && (
                                     <a href={product.links.shopee} target="_blank" rel="noopener noreferrer" className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                                        <span>{t('productActions.openShopee')}</span>
                                     </a>
                                )}
                                {product.links?.mercadoLivre && (
                                     <a href={product.links.mercadoLivre} target="_blank" rel="noopener noreferrer" className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                                        <span>{t('productActions.openML')}</span>
                                     </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-center mb-3">{t('productActions.adGeneratorTitle')} ✨</h3>
                        {!hasAiAccess ? (
                             <div className="bg-slate-800 border border-brand-green p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-300 mb-3">{t('productActions.exclusiveFeature')}</p>
                                <button onClick={() => { onClose(); setActiveScreen(Screen.Plans); }} className="bg-brand-green text-brand-dark font-bold py-2 px-4 rounded-lg text-sm">{t('common.upgrade')}</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="description" className="block text-xs font-medium text-gray-400 mb-1">{t('productActions.describeProduct')}</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder={t('productActions.descriptionPlaceholder')}
                                        className="w-full h-20 p-2 bg-slate-700 rounded-md text-sm placeholder-gray-500 focus:ring-2 focus:ring-brand-green outline-none"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <div className="flex-1">
                                        <label htmlFor="platform" className="block text-xs font-medium text-gray-400 mb-1">{t('productActions.platform')}</label>
                                        <select id="platform" value={platform} onChange={e => setPlatform(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-sm focus:ring-2 focus:ring-brand-green outline-none">
                                            <option>Instagram</option>
                                            <option>WhatsApp</option>
                                            <option>Facebook</option>
                                            <option>TikTok</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                         <label htmlFor="tone" className="block text-xs font-medium text-gray-400 mb-1">{t('productActions.tone')}</label>
                                        <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-sm focus:ring-2 focus:ring-brand-green outline-none">
                                            {tones.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleGenerate} disabled={isLoading} className="w-full h-11 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-slate-600">
                                    {isLoading ? <LoadingSpinner /> : t('productActions.generateButton')}
                                </button>
                                {generatedText && (
                                    <div className="bg-slate-800 p-3 rounded-lg mt-3 animate-fade-in relative">
                                        <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
                                        <button onClick={handleCopy} title={t('productActions.copy')} className="absolute top-2 right-2 p-1 bg-slate-700 rounded-md hover:bg-slate-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductActionsModal;