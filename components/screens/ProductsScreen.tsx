

import React, { useState, useMemo } from 'react';
import { Product, Plan, Screen } from '../../types';
import ComparisonModal from '../common/ComparisonModal';
import ProductActionsModal from '../common/ProductActionsModal';
import { useI18n } from '../../hooks/useI18n';

interface ProductsScreenProps {
    products: Product[];
    onAddProduct: (newProduct: Omit<Product, 'id' | 'sales'>) => void;
    onUpdateSales: (productId: string, newSales: number) => void;
    currentPlan: Plan;
    setActiveScreen: (screen: Screen) => void;
    onAttemptAiUse: () => boolean;
    onOpenAddModal: () => void;
}

const ProductImagePlaceholder: React.FC = () => (
    <div className="aspect-square w-full bg-slate-700 flex items-center justify-center rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
);

const ProductCard: React.FC<{
    product: Product;
    onUpdateSales: (productId: string, newSales: number) => void;
    onShare: (product: Product) => void;
    isComparisonMode: boolean;
    isSelected: boolean;
    onSelect: (productId: string) => void;
}> = ({ product, onUpdateSales, onShare, isComparisonMode, isSelected, onSelect }) => {
    const { t, language } = useI18n();

    const handleClick = () => {
        if (isComparisonMode) {
            onSelect(product.id);
        }
    };
    
    const formatCurrency = (value: number) => {
        const locales = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const currencies = { 'pt': 'BRL', 'en': 'USD', 'es': 'EUR' };
        return value.toLocaleString(locales[language], { style: 'currency', currency: currencies[language] });
    }

    return (
        <div 
            onClick={handleClick}
            className={`bg-brand-dark-secondary rounded-lg flex flex-col overflow-hidden shadow-lg transition-all duration-200 relative ${isComparisonMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-2 border-brand-green' : 'border-2 border-transparent'}`}
        >
             {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}
            {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
            ) : (
                <div className="w-full h-32 p-2">
                    <ProductImagePlaceholder />
                </div>
            )}
            <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-white truncate">{product.name}</h3>
                    <p className="text-brand-lime font-semibold">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-400">{t('products.stock')}: {product.stock}</p>
                </div>
                <div className="mt-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300">{t('products.sales')}: <span className="font-bold text-white">{product.sales}</span></p>
                        <div className="flex items-center space-x-1">
                            <button disabled={isComparisonMode} onClick={() => onUpdateSales(product.id, product.sales - 1)} className="w-7 h-7 bg-slate-700 rounded-full font-bold text-lg flex items-center justify-center disabled:opacity-50">-</button>
                            <button disabled={isComparisonMode} onClick={() => onUpdateSales(product.id, product.sales + 1)} className="w-7 h-7 bg-brand-green text-brand-dark rounded-full font-bold text-lg flex items-center justify-center disabled:opacity-50">+</button>
                        </div>
                    </div>
                     <button
                        onClick={() => !isComparisonMode && onShare(product)}
                        disabled={isComparisonMode}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                        <span>{t('products.actions')}</span>
                    </button>
                </div>
            </div>
        </div>
    )
};


const ProductsScreen: React.FC<ProductsScreenProps> = ({ products, onAddProduct, onUpdateSales, currentPlan, setActiveScreen, onAttemptAiUse, onOpenAddModal }) => {
    const { t } = useI18n();
    const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [comparisonList, setComparisonList] = useState<string[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

    const productLimit = 5;
    const isFreePlan = currentPlan.id === 'free';
    const isProductLimitReached = isFreePlan && products.length >= productLimit;

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const toggleComparisonMode = () => {
        setIsComparisonMode(prev => !prev);
        setComparisonList([]); // Clear selection when toggling mode
    };

    const handleSelectProduct = (productId: string) => {
        setComparisonList(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const productsToCompare = useMemo(() => {
        return products.filter(p => comparisonList.includes(p.id));
    }, [products, comparisonList]);
    
    const handleActionsClick = (product: Product) => {
        setSelectedProduct(product);
        setIsActionsModalOpen(true);
    };
    
    return (
        <div className="p-4 text-white animate-fade-in pb-24">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('products.title')}</h1>
                 <div className="flex items-center space-x-2">
                    {products.length > 1 && (
                        <button onClick={toggleComparisonMode} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            {isComparisonMode ? t('common.cancel') : t('products.compare')}
                        </button>
                    )}
                    <button onClick={onOpenAddModal} disabled={isProductLimitReached} className="bg-brand-green text-brand-dark font-bold py-2 px-4 rounded-lg text-sm disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">
                        + {t('products.add')}
                    </button>
                </div>
            </div>

            {isProductLimitReached && (
                 <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm p-3 rounded-lg mb-4 text-center">
                    {t('products.limitReached', { limit: productLimit })}
                    <button onClick={() => setActiveScreen(Screen.Plans)} className="font-bold underline ml-1 hover:text-white">{t('products.upgrade')}</button>
                </div>
            )}
            
             <div className="mb-6">
                <input 
                    type="text"
                    placeholder={t('products.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-brand-dark-secondary rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-brand-green outline-none"
                />
            </div>
            {isComparisonMode && (
                <p className="text-center text-sm text-gray-400 mb-4 animate-fade-in">{t('products.selectToCompare')}</p>
            )}

            {products.length === 0 ? (
                <div className="text-center py-10 bg-brand-dark-secondary rounded-lg">
                    <p className="text-gray-400">{t('products.noProducts')}</p>
                    <p className="text-gray-400 mt-2">{t('products.clickToAdd')}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                 <div className="text-center py-10 bg-brand-dark-secondary rounded-lg">
                    <p className="text-gray-400">{t('products.noProductsFound', { searchTerm })}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                       <ProductCard 
                            key={product.id} 
                            product={product} 
                            onUpdateSales={onUpdateSales} 
                            onShare={handleActionsClick}
                            isComparisonMode={isComparisonMode}
                            isSelected={comparisonList.includes(product.id)}
                            onSelect={handleSelectProduct}
                        />
                    ))}
                </div>
            )}
            
            <ProductActionsModal
                isOpen={isActionsModalOpen}
                onClose={() => setIsActionsModalOpen(false)}
                product={selectedProduct}
                currentPlan={currentPlan}
                onAttemptAiUse={onAttemptAiUse}
                setActiveScreen={setActiveScreen}
            />

            <ComparisonModal 
                isOpen={isComparisonModalOpen}
                onClose={() => setIsComparisonModalOpen(false)}
                products={productsToCompare}
            />

            {isComparisonMode && (
                <div className="fixed bottom-16 left-0 right-0 w-full bg-brand-dark border-t border-slate-700 p-4 shadow-lg animate-fade-in">
                     <div className="max-w-md md:max-w-2xl mx-auto flex justify-between items-center">
                        <p className="text-white font-semibold">
                            {t('products.productsSelected', { count: comparisonList.length })}
                        </p>
                        <button 
                            onClick={() => {
                                setIsComparisonModalOpen(true);
                                setIsComparisonMode(false);
                                setComparisonList([]);
                            }}
                            disabled={comparisonList.length < 2}
                            className="bg-brand-green text-brand-dark font-bold py-2 px-6 rounded-lg disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('products.compare')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsScreen;