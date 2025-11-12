
import React, { useState, useMemo } from 'react';
import { Plan } from '../../types';
import PaymentModal from '../common/PaymentModal';
import { useI18n } from '../../hooks/useI18n';

export const plans: Plan[] = [
    {
        id: 'free',
        name: 'Grátis',
        price: 'R$0',
        priceDetails: 'para sempre',
        aiUses: 20,
        features: [
            'plans.free.feature1',
            'plans.free.feature2',
            'plans.free.feature3',
            'plans.free.feature4',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$29',
        priceDetails: '/mês',
        annualPrice: 'R$290',
        annualPriceDetails: '/ano',
        aiUses: 150,
        features: [
            'plans.pro.feature1',
            'plans.pro.feature2',
            'plans.pro.feature3',
            'plans.pro.feature4',
            'plans.pro.feature5',
            'plans.pro.feature6'
        ],
        isPopular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 'R$49',
        priceDetails: '/mês',
        annualPrice: 'R$490',
        annualPriceDetails: '/ano',
        aiUses: 'unlimited',
        features: [
            'plans.premium.feature1',
            'plans.premium.feature2',
            'plans.premium.feature3',
            'plans.premium.feature4',
            'plans.premium.feature5',
            'plans.premium.feature6'
        ],
    }
];

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-green" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const PlansScreen: React.FC<{
    currentPlanId: string;
    onSubscriptionSuccess: (planId: string) => void;
}> = ({ currentPlanId, onSubscriptionSuccess }) => {
    const { t } = useI18n();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const localizedPlans = useMemo(() => plans.map(plan => ({
        ...plan,
        name: t(`plans.${plan.id}.name`),
        priceDetails: t(`plans.${plan.id}.priceDetails`),
        annualPriceDetails: plan.annualPriceDetails ? t(`plans.${plan.id}.annualPriceDetails`) : undefined,
    })), [t]);

    const handleSelectPlan = (plan: Plan) => {
        if (plan.id === currentPlanId || plan.id === 'free') return;
        
        const effectivePlan = {
            ...plan,
            price: (billingCycle === 'annual' && plan.annualPrice) ? plan.annualPrice : plan.price,
            priceDetails: (billingCycle === 'annual' && plan.annualPriceDetails) ? plan.annualPriceDetails : plan.priceDetails,
        };

        setSelectedPlan(effectivePlan);
        setIsModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        if (selectedPlan) {
            onSubscriptionSuccess(selectedPlan.id);
        }
    }

    return (
        <div className="p-4 text-white animate-fade-in">
            <h1 className="text-2xl font-bold mb-2 text-center">{t('plans.title')}</h1>
            <p className="text-gray-400 text-center mb-6">{t('plans.subtitle')}</p>

             <div className="flex justify-center items-center mb-8 bg-brand-dark-secondary p-1 rounded-full w-fit mx-auto">
                <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-brand-green text-brand-dark' : 'text-gray-300'}`}>
                    {t('plans.monthly')}
                </button>
                <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${billingCycle === 'annual' ? 'bg-brand-green text-brand-dark' : 'text-gray-300'}`}>
                    {t('plans.annual')}
                    <span className="absolute -top-2 -right-2 bg-brand-lime text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full transform rotate-12">{t('plans.promo')}</span>
                </button>
            </div>

            <div className="space-y-5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
                {localizedPlans.map((plan) => {
                    const originalPlan = plans.find(p => p.id === plan.id)!;
                    const isCurrentPlan = plan.id === currentPlanId;
                    const displayPrice = billingCycle === 'annual' && originalPlan.annualPrice ? originalPlan.annualPrice : originalPlan.price;
                    const displayPriceDetails = billingCycle === 'annual' && plan.annualPriceDetails ? plan.annualPriceDetails : plan.priceDetails;

                    return (
                        <div key={plan.name} className={`bg-brand-dark-secondary p-6 rounded-xl border-2 ${originalPlan.isPopular ? 'border-brand-green' : 'border-slate-700'} relative flex flex-col`}>
                            {originalPlan.isPopular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-green text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase">{t('plans.popular')}</span>}
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                                <p className="mt-2">
                                    <span className="text-4xl font-extrabold">{displayPrice}</span>
                                    <span className="text-gray-400 ml-1">{displayPriceDetails}</span>
                                </p>
                                <ul className="mt-6 space-y-3">
                                    {originalPlan.features.map(featureKey => (
                                        <li key={featureKey} className="flex items-center space-x-2">
                                            <CheckIcon />
                                            <span className="text-gray-300 text-sm">{t(featureKey)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSelectPlan(originalPlan)}
                                disabled={isCurrentPlan || plan.id === 'free'}
                                className={`w-full mt-6 py-3 font-bold rounded-lg transition-colors ${originalPlan.isPopular ? 'bg-brand-green text-brand-dark hover:bg-brand-lime' : 'bg-slate-700 text-white hover:bg-slate-600'} disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                            >
                                {isCurrentPlan ? t('plans.currentPlan') : t('plans.subscribeNow')}
                            </button>
                        </div>
                    )
                })}
            </div>
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default PlansScreen;