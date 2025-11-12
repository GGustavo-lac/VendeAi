

import React, { useState } from 'react';
import { Plan, Screen, CompetitorAnalysisResult } from '../../types';
import { analyzeCompetitor } from '../../services/geminiService';
import { SpyglassIcon } from '../icons/FeatureIcons';
import { useI18n } from '../../hooks/useI18n';

interface CompetitorAnalysisScreenProps {
    currentPlan: Plan;
    onAttemptAiUse: () => boolean;
    setActiveScreen: (screen: Screen) => void;
}

const LoadingSpinner: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-gray-300 ml-2">{t('competitor.loading')}</span>
        </div>
    );
};

const CompetitorAnalysisScreen: React.FC<CompetitorAnalysisScreenProps> = ({ currentPlan, onAttemptAiUse, setActiveScreen }) => {
    const { t } = useI18n();
    const [description, setDescription] = useState('');
    const [analysis, setAnalysis] = useState<CompetitorAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasAccess = currentPlan.id === 'pro' || currentPlan.id === 'premium';

    const handleAnalyze = async () => {
        if (!description.trim()) {
            setError(t('competitor.errorDescription'));
            return;
        }
        if (!onAttemptAiUse()) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeCompetitor(description);
            setAnalysis(result);
        } catch (e: any) {
            setError(e.message || t('competitor.errorAnalyze'));
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
                <p className="text-gray-400 mt-2 mb-6 max-w-xs">{t('competitor.exclusiveFeatureDesc')}</p>
                <button 
                    onClick={() => setActiveScreen(Screen.Plans)}
                    className="bg-brand-green text-brand-dark font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                    {t('common.seePlans')}
                </button>
            </div>
        );
    }

    const ResultBlock: React.FC<{title: string, items: string[]}> = ({title, items}) => (
        <div className="bg-brand-dark-secondary p-4 rounded-lg">
            <h3 className="font-bold text-brand-lime mb-2">{title}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    );

    return (
        <div className="p-4 text-white">
            <h1 className="text-2xl font-bold mb-2">{t('competitor.title')}</h1>
            <p className="text-gray-400 mb-6">{t('competitor.subtitle')}</p>
            
            <div className="space-y-4 bg-brand-dark-secondary p-4 rounded-lg">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('competitor.placeholder')}
                    className="w-full h-28 p-2 bg-slate-700 rounded-md placeholder-gray-400 focus:ring-2 focus:ring-brand-green outline-none"
                    disabled={isLoading}
                />
               
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                     <SpyglassIcon className="w-5 h-5" />
                    <span>{isLoading ? t('competitor.analyzing') : t('competitor.analyzeButton')}</span>
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {isLoading && <div className="mt-8"><LoadingSpinner /></div>}

            {analysis && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold">{t('competitor.resultsTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ResultBlock title={`👍 ${t('competitor.strengths')}`} items={analysis.strengths} />
                        <ResultBlock title={`👎 ${t('competitor.weaknesses')}`} items={analysis.weaknesses} />
                    </div>
                    <ResultBlock title={`💡 ${t('competitor.opportunities')}`} items={analysis.opportunities} />
                     <div className="bg-brand-dark-secondary p-4 rounded-lg">
                        <h3 className="font-bold text-brand-lime mb-2">💰 {t('competitor.pricingStrategy')}</h3>
                        <p className="text-sm text-gray-300">{analysis.pricingStrategy}</p>
                    </div>
                     <div className="bg-slate-800 border border-brand-lime p-4 rounded-lg">
                        <h3 className="font-bold text-white mb-2">🏆 {t('competitor.finalRecommendation')}</h3>
                        <p className="text-sm text-gray-300">{analysis.finalRecommendation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitorAnalysisScreen;