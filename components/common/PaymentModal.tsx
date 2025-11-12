
import React, { useState, useEffect } from 'react';
import { Plan } from '../../types';
import QrCodeIcon from '../icons/QrCodeIcon';
import { useI18n } from '../../hooks/useI18n';

// --- Stripe.js Mocks & Componente CheckoutForm ---
// Esta seção simula a biblioteca Stripe.js e seus componentes React.
// Em uma aplicação real, você usaria 'npm install @stripe/stripe-js @stripe/react-stripe-js'
// e importaria esses componentes. A estrutura do código abaixo espelha a implementação real.

// TODO: Substitua pela sua chave publicável real do Stripe.
// É seguro colocar esta chave no frontend. NUNCA coloque sua chave secreta aqui.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'; // Chave de teste de exemplo

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'border-brand-dark' }) => (
    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${className}`}></div>
);

// Mock do hook useStripe - simula a confirmação do pagamento.
const useStripe = () => ({
    confirmCardPayment: async (clientSecret: string, { payment_method }: any) => {
        console.log("Simulando Stripe.confirmCardPayment com o clientSecret:", clientSecret);
        console.log("Usando o método de pagamento mockado:", payment_method.card.id);
        
        // Simula uma chamada de rede para a Stripe
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simula uma resposta de sucesso da Stripe
        if (payment_method && payment_method.card) {
            return {
                paymentIntent: {
                    id: `pi_${Date.now()}`,
                    status: 'succeeded',
                },
            };
        }
        
        // Simula uma resposta de erro da Stripe
        return {
            error: {
                message: 'Seu cartão foi recusado. Verifique os detalhes ou tente um cartão diferente.',
            },
        };
    }
});

// Mock do hook useElements - simula o acesso ao componente de formulário do cartão.
const useElements = () => ({
    getElement: (type: any) => ({
        // Este objeto mock representa o CardElement que seria montado pelo Stripe.js
        id: 'mock-card-element'
    })
});

// Mock do componente CardElement - este é o campo de formulário seguro do Stripe.
const CardElement: React.FC = () => (
    <div className="w-full p-3 bg-slate-800 rounded-md border border-slate-600 focus-within:border-brand-green focus-within:ring-1 focus-within:ring-brand-green">
        <div className="flex justify-between items-center text-gray-400">
            <span>•••• •••• •••• 4242</span>
            <span>12/25</span>
            <span>•••</span>
        </div>
    </div>
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
            // Stripe.js ainda não carregou. Desativa o envio do formulário.
            return;
        }
        onProcessing(true);
        setError(null);

        // --- ETAPA DE BACKEND (REAL) ---
        // Esta chamada 'fetch' vai para o seu servidor.
        // Seu servidor, usando a CHAVE SECRETA do Stripe, cria um PaymentIntent
        // e retorna o 'clientSecret' para o frontend.
        // IMPORTANTE: Substitua 'http://localhost:4242' pela URL do seu servidor real quando estiver online.
        const response = await fetch('http://localhost:4242/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: plan.id }),
        }).then(res => res.json()).catch(err => {
            console.error("Erro de conexão com o backend:", err);
            return { error: 'Não foi possível conectar ao servidor de pagamento. Tente novamente mais tarde.' };
        });
        
        if (response.error || !response.clientSecret) {
            setError(response.error || 'Falha ao inicializar o pagamento.');
            onProcessing(false);
            return;
        }
        // --- FIM DA ETAPA DE BACKEND ---

        // Confirma o pagamento no frontend usando o clientSecret do backend.
        const cardElement = elements.getElement(CardElement);
        // @ts-ignore
        const result = await stripe.confirmCardPayment(response.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: 'Cliente VendeAí', // Em um app real, você coletaria o nome do cliente.
                },
            },
        });
        
        // @ts-ignore
        if (result.error) {
            // @ts-ignore
            setError(result.error.message);
            onProcessing(false);
        } else {
            // @ts-ignore
            if (result.paymentIntent.status === 'succeeded') {
                console.log("Pagamento bem-sucedido!");
                onSuccess();
            }
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <h3 className="font-semibold text-lg text-center mb-4">{t('payment.payWithCard')}</h3>
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 block mb-1">{t('payment.cardDetails')}</label>
                <CardElement />
                
                <button type="submit" disabled={isProcessing} className="w-full h-12 !mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                    {isProcessing ? <LoadingSpinner /> : t('payment.payAmount', { itemPrice: plan.price })}
                </button>
                 {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
        </form>
    );
};

// --- Componente Principal PaymentModal ---

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
    
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod(null);
            setPaymentSuccess(false);
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen || !plan) return null;

    const formatCurrency = (value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9,.-]+/g, '').replace(',', '.'));
        const locales = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const currencies = { 'pt': 'BRL', 'en': 'USD', 'es': 'EUR' };
        return numericValue.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    }

    const handleConfirmPixPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
        }, 2500);
    };
    
    const handleSuccessAndClose = () => {
        onPaymentSuccess();
        onClose();
    }
    
    const renderContent = () => {
        if(paymentSuccess) {
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
            return (
                <div>
                    <h3 className="font-semibold text-lg text-center mb-2">{t('payment.payWithPix')}</h3>
                    <p className="text-xs text-gray-400 text-center mb-4">{t('payment.pixInstructions')}</p>
                    <QrCodeIcon className="w-40 h-40 mx-auto bg-slate-800 p-2 rounded-lg" />
                    <button onClick={handleConfirmPixPayment} disabled={isProcessing} className="w-full h-12 mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70">
                        {isProcessing ? <LoadingSpinner /> : t('payment.confirmPixPayment')}
                    </button>
                    <button onClick={() => setPaymentMethod(null)} className="w-full mt-2 text-gray-400 text-sm hover:text-white">{t('common.back')}</button>
                </div>
            );
        }

        if (paymentMethod === 'card') {
            return (
                 <div>
                    <CheckoutForm 
                        plan={plan}
                        onSuccess={() => {
                            // FIX: The function to update the processing state is `setIsProcessing`, not `onProcessing`.
                            setIsProcessing(false);
                            setPaymentSuccess(true);
                        }}
                        onProcessing={setIsProcessing}
                        isProcessing={isProcessing}
                    />
                    <button onClick={() => { if(!isProcessing) setPaymentMethod(null); }} className="w-full mt-2 text-gray-400 text-sm hover:text-white">{t('common.back')}</button>
                </div>
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
