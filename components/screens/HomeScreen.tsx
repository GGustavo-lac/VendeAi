

import React from 'react';
import { Screen, Plan, User } from '../../types';
import Logo from '../common/Logo';
import UserIcon from '../icons/UserIcon';
import { SpyglassIcon, LockIcon } from '../icons/FeatureIcons';
import { useI18n } from '../../hooks/useI18n';

interface HomeScreenProps {
  setActiveScreen: (screen: Screen) => void;
  currentUser: User;
  currentPlan: Plan;
  remainingAiUses: number | 'unlimited';
}

const ActionCard: React.FC<{ title: string, description: string, icon: string | React.ReactNode, onClick: () => void, isNew?: boolean }> = ({ title, description, icon, onClick, isNew = false }) => {
    const { t } = useI18n();
    return (
        <button onClick={onClick} className="bg-brand-dark-secondary p-6 rounded-xl w-full text-left transition-transform transform hover:scale-105 hover:bg-slate-700 relative">
            {isNew && <span className="absolute top-3 right-3 text-xs bg-brand-lime text-brand-dark font-bold px-2 py-0.5 rounded-full">{t('common.new')}</span>}
            <div className="flex items-center space-x-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
            </div>
        </button>
    )
};

const PlanStatus: React.FC<{ plan: Plan; uses: number | 'unlimited'; onChangePlan: () => void }> = ({ plan, uses, onChangePlan }) => {
    const { t } = useI18n();
    return (
        <div className="bg-brand-dark-secondary p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400">{t('home.yourPlan')}</p>
                    <p className="font-bold text-white">{plan.name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 text-right">{t('home.aiUsage')}</p>
                    <p className="font-bold text-white text-right">
                        {uses === 'unlimited' ? t('home.unlimited') : t('home.remaining', { count: uses })}
                    </p>
                </div>
            </div>
            {plan.id === 'free' && (
                <button onClick={onChangePlan} className="w-full mt-3 text-center bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-md text-sm font-semibold text-brand-lime transition-colors">
                    {t('home.changePlan')}
                </button>
            )}
        </div>
    )
};


const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen, currentUser, currentPlan, remainingAiUses }) => {
  const { t } = useI18n();
  const isPaidFeatureLocked = currentPlan.id === 'free';
  return (
    <div className="p-6 text-white animate-fade-in">
      <header className="mb-6">
        <div className="flex justify-between items-center">
            <Logo />
            <button onClick={() => setActiveScreen(Screen.Profile)} title={t('home.viewProfile')} className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center overflow-hidden">
                {currentUser.profilePictureUrl ? (
                    <img src={currentUser.profilePictureUrl} alt={t('profile.profilePictureAlt')} className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="w-6 h-6 text-gray-300" />
                )}
            </button>
        </div>
        <p className="mt-4 text-gray-300 text-lg">{t('home.greeting', { name: currentUser.name.split(' ')[0] })}</p>
      </header>
      
      <div className="space-y-6">
        <PlanStatus plan={currentPlan} uses={remainingAiUses} onChangePlan={() => setActiveScreen(Screen.Plans)} />

        <h2 className="text-xl font-semibold text-white pt-2">{t('home.startSellingMore')}</h2>
        <ActionCard
            title={t('home.analyzeMyProduct')}
            description={t('home.analyzeMyProductDesc')}
            icon={isPaidFeatureLocked ? <LockIcon className="w-8 h-8 text-yellow-400" /> : "✨"}
            onClick={() => setActiveScreen(isPaidFeatureLocked ? Screen.Plans : Screen.Analyzer)}
        />
         <ActionCard
            title={t('home.competitorAnalysis')}
            description={t('home.competitorAnalysisDesc')}
            icon={isPaidFeatureLocked ? <LockIcon className="w-8 h-8 text-yellow-400" /> : <SpyglassIcon className="w-8 h-8 text-brand-lime" />}
            onClick={() => setActiveScreen(isPaidFeatureLocked ? Screen.Plans : Screen.CompetitorAnalysis)}
            isNew
        />
        <ActionCard
            title={t('home.myProducts')}
            description={t('home.myProductsDesc')}
            icon="📦"
            onClick={() => setActiveScreen(Screen.Products)}
        />
        <ActionCard
            title={t('home.salesDashboard')}
            description={t('home.salesDashboardDesc')}
            icon={isPaidFeatureLocked ? <LockIcon className="w-8 h-8 text-yellow-400" /> : "📊"}
            onClick={() => setActiveScreen(isPaidFeatureLocked ? Screen.Plans : Screen.Dashboard)}
        />
        <ActionCard
            title={t('home.talkToAssistant')}
            description={t('home.talkToAssistantDesc')}
            icon="🤖"
            onClick={() => setActiveScreen(Screen.Chat)}
        />
         <ActionCard
            title={t('home.seePlans')}
            description={t('home.seePlansDesc')}
            icon="👑"
            onClick={() => setActiveScreen(Screen.Plans)}
        />
      </div>
    </div>
  );
};

export default HomeScreen;