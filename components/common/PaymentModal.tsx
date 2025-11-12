import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Plan } from '../../types';
import QrCodeIcon from '../icons/QrCodeIcon';
import { useI18n } from '../../hooks/useI18n';
import { paymentAPI } from '../../services/apiService';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'border-brand-dark' }) => (
    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${className}`}></div>
);

interface CheckoutFormProps {
    plan: Plan;
    onSuccess: () => void;
    onProcessing: (isProcessing: boolean) => void;
    isProcessing: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ plan, onSuccess, onProcessing, isProcessing }) => {
    const { t } = useI18n();
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        onProcessing(true);
        setError(null);

        try {
            // Create payment intent on backend
            const response = await paymentAPI.createStripeIntent(plan.id);
            const { clientSecret, paymentIntentId } = response.data;

            // Confirm payment on frontend
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: 'Cliente VendeAí',
                    },
                },
            });

            if (paymentError) {
                setError(paymentError.message || 'Payment failed');
            } else {
                // Confirm subscription on backend
                await paymentAPI.confirmStripePayment(paymentIntentId);
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Payment failed');
        } finally {
            onProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="font-semibold text-lg text-center mb-4">{t('payment.payWithCard')}</h3>
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 block mb-1">{t('payment.cardDetails')}</label>
                <div className="w-full p-3 bg-slate-800 rounded-md border border-slate-600 focus-within:border-brand-green focus-within:ring-1 focus-within:ring-brand-green">
                    <CardElement options={{
                        style: {
                            base: {
                                color: '#fff',
                                fontSize: '16px',
                                '::placeholder': {
                                    color: '#9ca3af',
                                },
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    }} />
                </div>

                <button type="submit" disabled={isProcessing} className="w-full h-12 !mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                    {isProcessing ? <LoadingSpinner /> : t('payment.payAmount', { itemPrice: plan.price })}
                </button>
                {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
        </form>
    );
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
    const { t, language } = useI18n();
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pixData, setPixData] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            setPaymentMethod(null);
            setPaymentSuccess(false);
            setIsProcessing(false);
            setPixData(null);
        }
    }, [isOpen]);

    if (!isOpen || !plan) return null;

    const formatCurrency = (value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9,.-]+/g, '').replace(',', '.'));
        const locales = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const currencies = { 'pt': 'BRL', 'en': 'USD', 'es': 'EUR' };
        return numericValue.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    };

    const handleCreatePixPayment = async () => {
        setIsProcessing(true);
        try {
            const response = await paymentAPI.createMercadoPagoPix(plan.id);
            setPixData(response.data);
        } catch (err: any) {
            console.error('PIX creation error:', err);
            alert('Failed to create PIX payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmPixPayment = () => {
        setPaymentSuccess(true);
    };

    const handleSuccessAndClose = () => {
        onPaymentSuccess();
        onClose();
    };

    const renderContent = () => {
        if (paymentSuccess) {
            return (
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-brand-green rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">{t('payment.planSuccessTitle')}</h3>
                    <p className="text-gray-300 mt-2">{t('payment.planSuccessMessage', { itemName: plan.name })}</p>
                    <button onClick={handleSuccessAndClose} className="w-full mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg">
                        {t('payment.startUsing')}
                    </button>
                </div>
            )
        }

        if (paymentMethod === 'pix') {
            if (!pixData) {
                // Show PIX creation/loading state
                return (
                    <div>
                        <h3 className="font-semibold text-lg text-center mb-2">{t('payment.payWithPix')}</h3>
                        <p className="text-xs text-gray-400 text-center mb-4">{t('payment.pixInstructions')}</p>
                        <button onClick={handleCreatePixPayment} disabled={isProcessing} className="w-full h-12 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70">
                            {isProcessing ? <LoadingSpinner /> : t('payment.generatePix')}
                        </button>
                        <button onClick={() => setPaymentMethod(null)} className="w-full mt-2 text-gray-400 text-sm hover:text-white">{t('common.back')}</button>
                    </div>
                );
            }

            return (
                <div>
                    <h3 className="font-semibold text-lg text-center mb-2">{t('payment.payWithPix')}</h3>
                    <p className="text-xs text-gray-400 text-center mb-4">{t('payment.pixInstructions')}</p>
                    {pixData.qrCodeBase64 ? (
                        <div className="w-40 h-40 mx-auto bg-slate-800 p-2 rounded-lg">
                            <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="PIX QR Code" className="w-full h-full" />
                        </div>
                    ) : (
                        <QrCodeIcon className="w-40 h-40 mx-auto bg-slate-800 p-2 rounded-lg" />
                    )}
                    <button onClick={handleConfirmPixPayment} disabled={isProcessing} className="w-full h-12 mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70">
                        {isProcessing ? <LoadingSpinner /> : t('payment.confirmPixPayment')}
                    </button>
                    <button onClick={() => setPaymentMethod(null)} className="w-full mt-2 text-gray-400 text-sm hover:text-white">{t('common.back')}</button>
                </div>
            );
        }

        if (paymentMethod === 'card') {
            return (
                <Elements stripe={stripePromise}>
                    <div>
                        <CheckoutForm
                            plan={plan}
                            onSuccess={() => {
                                setIsProcessing(false);
                                setPaymentSuccess(true);
                            }}
                            onProcessing={setIsProcessing}
                            isProcessing={isProcessing}
                        />
                        <button onClick={() => { if (!isProcessing) setPaymentMethod(null); }} className="w-full mt-2 text-gray-400 text-sm hover:text-white">{t('common.back')}</button>
                    </div>
                </Elements>
            )
        }

        return (
            <div>
                <h2 className="text-xl font-bold text-center">{t('payment.subscribeTo', { itemName: plan.name })}</h2>
                <p className="text-center text-gray-400 mt-1 mb-6">{t('payment.amount')}: <span className="font-bold text-brand-lime text-lg">{formatCurrency(plan.price)}</span>{plan.priceDetails}</p>
                <div className="space-y-3">
                    <button onClick={() => setPaymentMethod('pix')} className="w-full text-lg font-semibold py-4 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg">{t('payment.pixMethod')}</button>
                    <button onClick={() => setPaymentMethod('card')} className="w-full text-lg font-semibold py-4 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg">{t('payment.creditCard')}</button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-sm p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white disabled:opacity-50" disabled={isProcessing}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentModal;