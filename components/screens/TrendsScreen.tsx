

import React, { useState } from 'react';
import { Plan, Screen, TrendSuggestion } from '../../types';
import { suggestTrends } from '../../services/geminiService';
import { TrendIcon } from '../icons/NavIcons';
import { useI18n } from '../../hooks/useI18n';

interface TrendsScreenProps {
    currentPlan: Plan;
    onAttemptAiUse: () => boolean;
    setActiveScreen: (screen: Screen) => void;
}

const LoadingSpinner: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-gray-300 ml-3 text-lg">{t('trends.loading')}</span>
        </div>
    )
};

const TrendsScreen: React.FC<TrendsScreenProps> = ({ currentPlan, onAttemptAiUse, setActiveScreen }) => {
    const { t } = useI18n();
    const [trends, setTrends] = useState<TrendSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasAccess = currentPlan.id === 'pro' || currentPlan.id === 'premium';

    const handleFetchTrends = async () => {
        if (!onAttemptAiUse()) return;

        setIsLoading(true);
        setError(null);
        setTrends([]);

        try {
            const result = await suggestTrends();
            setTrends(result);
        } catch (e: any) {
            setError(e.message || t('trends.error'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasAccess) {
        return (
            <div className="p-6 text-white text-center flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="w-16 h-16 bg-brand-dark-secondary rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-xl font-bold">{t('common.exclusiveFeature')}</h2>
                <p className="text-gray-400 mt-2 mb-6">{t('trends.exclusiveFeatureDesc')}</p>
                <button 
                    onClick={() => setActiveScreen(Screen.Plans)}
                    className="bg-brand-green text-brand-dark font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                    {t('common.upgradeNow')}
                </button>
            </div>
        );
    }


    return (
        <div className="p-4 text-white animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">{t('trends.title')}</h1>
            <p className="text-gray-400 mb-6">{t('trends.subtitle')}</p>
            
            <button 
                onClick={handleFetchTrends} 
                disabled={isLoading}
                className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
            >
                <TrendIcon className="w-5 h-5" />
                <span>{isLoading ? t('trends.searching') : t('trends.searchButton')}</span>
            </button>

            {isLoading && (
                <div className="mt-10">
                    <LoadingSpinner />
                </div>
            )}

            {error && <p className="text-red-400 text-center mt-4">{error}</p>}

            {trends.length > 0 && (
                 <div className="space-y-4">
                    {trends.map((trend, index) => (
                        <div key={index} className="bg-brand-dark-secondary p-4 rounded-lg">
                            <h3 className="font-bold text-brand-lime text-lg">{trend.productName}</h3>
                            <p className="text-gray-300 text-sm mt-1">{trend.reasoning}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrendsScreen;