import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';
import { fileToDataUrl } from '../../utils/fileUtils';
import { useI18n } from '../../hooks/useI18n';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (newProduct: Omit<Product, 'id' | 'sales'>) => void;
    initialData?: Partial<Omit<Product, 'id' | 'sales'>> | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct, initialData }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [shopeeLink, setShopeeLink] = useState('');
    const [mercadoLivreLink, setMercadoLivreLink] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setName('');
        setPrice('');
        setStock('');
        setShopeeLink('');
        setMercadoLivreLink('');
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || '');
                setPrice(initialData.price?.toString() || '');
                setStock(initialData.stock?.toString() || '');
                setShopeeLink(initialData.links?.shopee || '');
                setMercadoLivreLink(initialData.links?.mercadoLivre || '');
                 if (initialData.imageUrl) {
                    setImagePreview(initialData.imageUrl);
                 }
            }
        } else {
            resetState();
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let imageUrl: string | undefined = imagePreview || undefined;
        if (imageFile) {
            try {
                imageUrl = await fileToDataUrl(imageFile);
            } catch (error) {
                console.error("Error converting file to data URL:", error);
                alert(t('addProduct.imageError'));
                return;
            }
        }
        
        const newProduct = {
            name,
            price: parseFloat(price.replace(',', '.')),
            stock: parseInt(stock, 10),
            imageUrl,
            links: {
                shopee: shopeeLink,
                mercadoLivre: mercadoLivreLink,
            },
        };
        if(name && !isNaN(newProduct.price) && !isNaN(newProduct.stock)) {
            onAddProduct(newProduct);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark-secondary rounded-2xl w-full max-w-sm p-6 text-white animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">{t('addProduct.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
               
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.nameLabel')}</label>
                        <input id="product-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="product-price" className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.priceLabel')}</label>
                            <input id="product-price" type="text" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} required placeholder={t('addProduct.pricePlaceholder')} className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="product-stock" className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.stockLabel')}</label>
                            <input id="product-stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required placeholder={t('addProduct.stockPlaceholder')} className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.imageLabel')}</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-md bg-slate-700 overflow-hidden flex-shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt={t('addProduct.imagePreviewAlt')} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-slate-600 hover:bg-slate-500 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                            >
                                {imageFile ? t('addProduct.changeImage') : t('addProduct.selectImage')}
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>
                    <div>
                        <label htmlFor="shopee-link" className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.shopeeLinkLabel')}</label>
                        <input id="shopee-link" type="url" value={shopeeLink} onChange={e => setShopeeLink(e.target.value)} placeholder="https://..." className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" />
                    </div>
                     <div>
                        <label htmlFor="ml-link" className="block text-sm font-medium text-gray-300 mb-1">{t('addProduct.mercadoLivreLinkLabel')}</label>
                        <input id="ml-link" type="url" value={mercadoLivreLink} onChange={e => setMercadoLivreLink(e.target.value)} placeholder="https://..." className="w-full p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-brand-green outline-none" />
                    </div>
                    <button type="submit" className="w-full !mt-6 bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg">{t('addProduct.saveButton')}</button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;