
import React, { useState, useEffect } from 'react';
import { SalesGoal } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface SetGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: SalesGoal | null;
    onSaveGoal: (goal: SalesGoal | null) => void;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ isOpen, onClose, currentGoal, onSaveGoal }) => {
    const { t } = useI18n();
    const [goalType, setGoalType] = useState<'profit' | 'quantity'>(currentGoal?.type || 'profit');
    const [goalValue, setGoalValue] = useState<string>(currentGoal?.value.toString() || '');

    useEffect(() => {
        if (isOpen) {
            setGoalType(currentGoal?.type || 'profit');
            setGoalValue(currentGoal?.value.toString() || '');
        }
    }, [isOpen, currentGoal]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(goalValue.replace(',', '.'));
        if (!isNaN(numericValue) && numericValue > 0) {
            onSaveGoal({ type: goalType, value: numericValue });
        }
    };
    
    const handleRemove = () => {
        onSaveGoal(null);
    }

    const isProfit = goalType === 'profit';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-sm p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">{t('setGoal.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
               
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('setGoal.goalType')}</label>
                        <div className="flex bg-slate-700 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setGoalType('profit')}
                                className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${isProfit ? 'bg-brand-green text-brand-dark' : 'text-gray-300'}`}
                            >
                                {t('setGoal.totalProfit')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setGoalType('quantity')}
                                className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${!isProfit ? 'bg-brand-green text-brand-dark' : 'text-gray-300'}`}
                            >
                                {t('setGoal.salesUnits')}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="goal-value" className="block text-sm font-medium text-gray-300 mb-1">
                            {isProfit ? t('setGoal.goalValueProfit') : t('setGoal.goalValueQuantity')}
                        </label>
                        <input 
                            id="goal-value" 
                            type="text"
                            inputMode="decimal"
                            min="1"
                            value={goalValue} 
                            onChange={e => setGoalValue(e.target.value)} 
                            required 
                            placeholder={isProfit ? 'ex: 5000' : 'ex: 100'} 
                            className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" 
                        />
                    </div>
                    
                    <button type="submit" className="w-full mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg">
                        {t('setGoal.saveButton')}
                    </button>
                    {currentGoal && (
                        <button type="button" onClick={handleRemove} className="w-full mt-2 text-red-400 hover:text-red-300 text-sm">
                            {t('setGoal.removeButton')}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SetGoalModal;