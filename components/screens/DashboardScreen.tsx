
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Product, SalesGoal, Plan, Screen } from '../../types';
import SetGoalModal from '../common/SetGoalModal';
import { useI18n } from '../../hooks/useI18n';

interface DashboardScreenProps {
    products: Product[];
    salesGoal: SalesGoal | null;
    onSetSalesGoal: (goal: SalesGoal | null) => void;
    currentPlan: Plan;
    setActiveScreen: (screen: Screen) => void;
}

const COLORS = ['#10B981', '#34D399', '#86EFAC', '#A7F3D0', '#D1FAE5'];

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-brand-dark-secondary p-4 rounded-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ products, salesGoal, onSetSalesGoal, currentPlan, setActiveScreen }) => {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const { t, language } = useI18n();

    const { totalProfit, totalSales, averageTicket, chartData } = useMemo(() => {
        const totalSales = products.reduce((acc, p) => acc + p.sales, 0);
        const totalProfit = products.reduce((acc, p) => acc + (p.price * p.sales), 0);
        const averageTicket = totalSales > 0 ? totalProfit / totalSales : 0;

        const chartData = [...products]
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map(p => ({ name: p.name, [t('dashboard.sales')]: p.sales }));

        return { totalProfit, totalSales, averageTicket, chartData };
    }, [products, t]);

    const formatCurrency = (value: number) => {
        const locales = {
            'pt': 'pt-BR',
            'en': 'en-US',
            'es': 'es-ES'
        }
        const currencies = {
            'pt': 'BRL',
            'en': 'USD',
            'es': 'EUR'
        }
        return value.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    }

    const GoalProgress: React.FC = () => {
        if (!salesGoal) {
            return (
                <div className="bg-brand-dark-secondary p-4 rounded-lg text-center">
                    <p className="text-gray-400 mb-3">{t('dashboard.noGoalSet')}</p>
                    <button onClick={() => setIsGoalModalOpen(true)} className="bg-brand-green text-brand-dark font-bold py-2 px-5 rounded-lg text-sm transition-transform transform hover:scale-105">
                        {t('dashboard.setGoal')}
                    </button>
                </div>
            )
        }
        
        const isProfit = salesGoal.type === 'profit';
        const currentValue = isProfit ? totalProfit : totalSales;
        const targetValue = salesGoal.value;
        const progress = Math.min((currentValue / targetValue) * 100, 100);
        const goalLabel = isProfit ? t('dashboard.profitGoal') : t('dashboard.salesGoal');
        const currentValueFormatted = isProfit ? formatCurrency(currentValue) : `${currentValue} ${t('dashboard.units')}`;
        const targetValueFormatted = isProfit ? formatCurrency(targetValue) : `${targetValue} ${t('dashboard.units')}`;

        return (
             <div className="bg-brand-dark-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">{goalLabel}</h2>
                    <button onClick={() => setIsGoalModalOpen(true)} className="text-sm text-brand-lime hover:text-brand-green font-medium">
                        {t('common.edit')}
                    </button>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-white font-bold text-xl">{currentValueFormatted}</span>
                    <span className="text-gray-400 text-sm">{t('dashboard.of')} {targetValueFormatted}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-brand-green h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-1">{t('dashboard.achieved', { progress: progress.toFixed(0) })}</p>
            </div>
        )
    }

    if (currentPlan.id === 'free') {
        return (
            <div className="p-6 text-white text-center flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="w-16 h-16 bg-brand-dark-secondary rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-xl font-bold">{t('dashboard.exclusiveFeatureTitle')}</h2>
                <p className="text-gray-400 mt-2 mb-6 max-w-xs">{t('dashboard.exclusiveFeatureDesc')}</p>
                <button 
                    onClick={() => setActiveScreen(Screen.Plans)}
                    className="bg-brand-green text-brand-dark font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                    {t('common.seePlans')}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 text-white animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard title={t('dashboard.estimatedProfit')} value={formatCurrency(totalProfit)} />
                <StatCard title={t('dashboard.totalSales')} value={totalSales.toString()} />
                <StatCard title={t('dashboard.averageTicket')} value={formatCurrency(averageTicket)} />
                <StatCard title={t('dashboard.productsRegistered')} value={products.length.toString()} />
            </div>
            
            <div className="mb-6">
                <GoalProgress />
            </div>

            <div className="bg-brand-dark-secondary p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">{t('dashboard.topProducts')}</h2>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        border: '1px solid #334155',
                                        color: '#FFFFFF'
                                    }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                />
                                <Bar dataKey={t('dashboard.sales')} radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-center text-gray-400">
                        <p>{t('dashboard.noSalesYet')}<br/>{t('dashboard.startSelling')}</p>
                    </div>
                )}
            </div>
            <SetGoalModal 
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                currentGoal={salesGoal}
                onSaveGoal={(goal) => {
                    onSetSalesGoal(goal);
                    setIsGoalModalOpen(false);
                }}
            />
        </div>
    );
};

export default DashboardScreen;