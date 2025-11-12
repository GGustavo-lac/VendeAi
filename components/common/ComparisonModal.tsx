import React, { useMemo } from 'react';
import { Product } from '../../types';
import { useI18n } from '../../hooks/useI18n';

const ProductImagePlaceholder: React.FC = () => (
    <div className="aspect-square w-full bg-slate-700 flex items-center justify-center rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
);

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, products }) => {
    const { t, language } = useI18n();

    const stats = useMemo(() => {
        if (products.length === 0) return { minPrice: 0, maxStock: 0, maxSales: 0 };
        const prices = products.map(p => p.price);
        const stocks = products.map(p => p.stock);
        const sales = products.map(p => p.sales);
        return {
            minPrice: Math.min(...prices),
            maxStock: Math.max(...stocks),
            maxSales: Math.max(...sales),
        };
    }, [products]);
    
    const formatCurrency = (value: number) => {
        const locales = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const currencies = { 'pt': 'BRL', 'en': 'USD', 'es': 'EUR' };
        return value.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    }

    if (!isOpen) return null;

    const StatRow: React.FC<{ label: string }> = ({ label, children }) => (
        <div className="flex items-center border-b border-slate-700">
            <div className="w-24 flex-shrink-0 p-3 font-semibold text-gray-400 text-sm">{label}</div>
            {children}
        </div>
    );

    const ProductCell: React.FC<{ value: string | number; isHighlighted?: boolean; children?: React.ReactNode }> = ({ value, isHighlighted = false, children }) => (
        <div className={`w-36 flex-shrink-0 p-3 text-sm flex items-center ${isHighlighted ? 'text-brand-lime font-bold' : 'text-white'}`}>
            {children || value}
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-lg h-[80vh] flex flex-col p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold">{t('comparison.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
               
                <div className="overflow-auto">
                    {/* Header Row */}
                    <div className="flex items-center">
                        <div className="w-24 flex-shrink-0 p-3"></div>
                        {products.map(product => (
                            <div key={product.id} className="w-36 flex-shrink-0 p-3 text-sm font-bold truncate">
                                {product.name}
                            </div>
                        ))}
                    </div>

                    {/* Image Row */}
                    <StatRow label={t('comparison.image')}>
                        {products.map(product => (
                            <ProductCell key={product.id} value="">
                                <div className="w-full h-24">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
                                    ) : <ProductImagePlaceholder />}
                                </div>
                            </ProductCell>
                        ))}
                    </StatRow>

                    {/* Price Row */}
                    <StatRow label={t('comparison.price')}>
                        {products.map(product => (
                            <ProductCell 
                                key={product.id} 
                                value={formatCurrency(product.price)}
                                isHighlighted={products.length > 1 && product.price === stats.minPrice}
                            />
                        ))}
                    </StatRow>

                    {/* Stock Row */}
                    <StatRow label={t('comparison.stock')}>
                        {products.map(product => (
                            <ProductCell 
                                key={product.id} 
                                value={product.stock}
                                isHighlighted={products.length > 1 && product.stock === stats.maxStock}
                            />
                        ))}
                    </StatRow>

                    {/* Sales Row */}
                    <StatRow label={t('comparison.sales')}>
                        {products.map(product => (
                            <ProductCell 
                                key={product.id} 
                                value={product.sales}
                                isHighlighted={products.length > 1 && product.sales === stats.maxSales}
                            />
                        ))}
                    </StatRow>
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;