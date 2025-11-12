
import React, { useState, useRef, useEffect } from 'react';
import { analyzeProduct, generateAds } from '../../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../../utils/fileUtils';
import { ProductAnalysis, GeneratedAds, Product, Plan, Screen } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface AnalyzerScreenProps {
    remainingAiUses: number | 'unlimited';
    onAttemptAiUse: () => boolean;
    onAddProduct: (newProduct: Omit<Product, 'id' | 'sales'>) => void;
    currentPlan: Plan;
    setActiveScreen: (screen: Screen) => void;
}

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-gray-300 ml-2">{text}</span>
    </div>
);

const AdCard: React.FC<{ platform: string, content: GeneratedAds[keyof GeneratedAds] }> = ({ platform, content }) => {
    const { t } = useI18n();
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(t('analyzer.copied', { platform }));
    };

    const fullText = `${t('analyzer.adTitle')}: ${content.title}\n\n${t('analyzer.adDescription')}: ${content.body}\n\nHashtags: ${content.hashtags.map(h => `#${h}`).join(' ')}`;

    return (
        <div className="bg-brand-dark-secondary p-4 rounded-lg text-white">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg capitalize text-brand-lime">{platform}</h4>
                <button onClick={() => copyToClipboard(fullText)} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
            </div>
            <p className="text-sm font-semibold mb-1">{content.title}</p>
            <p className="text-xs text-gray-300 mb-2">{content.body}</p>
            <div className="flex flex-wrap gap-1">
                {content.hashtags.map(tag => <span key={tag} className="text-xs bg-slate-700 px-2 py-1 rounded-full">#{tag}</span>)}
            </div>
        </div>
    );
};


const AnalyzerScreen: React.FC<AnalyzerScreenProps> = ({ remainingAiUses, onAttemptAiUse, onAddProduct, currentPlan, setActiveScreen }) => {
    const { t } = useI18n();
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
    const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [adLoading, setAdLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const hasAccess = currentPlan.id !== 'free';

    useEffect(() => {
        return () => { // Cleanup on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert(t('analyzer.cameraError'));
        }
    };
    
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    stopCamera();
                }
            }, 'image/jpeg');
        }
    };
    
    if (!hasAccess) {
        return (
            <div className="p-6 text-white text-center flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="w-16 h-16 bg-brand-dark-secondary rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-xl font-bold">{t('analyzer.exclusiveFeatureTitle')}</h2>
                <p className="text-gray-400 mt-2 mb-6 max-w-xs">{t('analyzer.exclusiveFeatureDesc')}</p>
                <button 
                    onClick={() => setActiveScreen(Screen.Plans)}
                    className="bg-brand-green text-brand-dark font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                    {t('common.seePlans')}
                </button>
            </div>
        );
    }

    if (isCameraOpen) {
        return (
            <div className="p-4 text-white h-full flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-center">{t('analyzer.cameraTitle')}</h1>
                <div className="relative flex-1">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg bg-black"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <button onClick={handleCapture} className="w-full bg-brand-green text-brand-dark font-bold py-3 rounded-lg">{t('analyzer.capture')}</button>
                    <button onClick={stopCamera} className="w-full bg-slate-700 text-white font-bold py-3 rounded-lg">{t('common.cancel')}</button>
                </div>
            </div>
        );
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!description.trim()) {
            setError(t('analyzer.errorDescription'));
            return;
        }
        
        if (!onAttemptAiUse()) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setGeneratedAds(null);

        try {
            let imagePayload;
            if (imageFile) {
                const base64Data = await fileToBase64(imageFile);
                imagePayload = { mimeType: imageFile.type, data: base64Data };
            }
            const result = await analyzeProduct(description, imagePayload);
            setAnalysis(result);
        } catch (e: any) {
            setError(e.message || t('analyzer.errorAnalyze'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateAds = async () => {
        if(!analysis) return;
        if (!onAttemptAiUse()) return;
        
        setAdLoading(true);
        try {
            const ads = await generateAds(analysis);
            setGeneratedAds(ads);
        } catch (e: any) {
            setError(e.message || t('analyzer.errorAds'));
        } finally {
            setAdLoading(false);
        }
    };
    
    const handleAddProductFromAnalysis = async () => {
        if (!analysis) return;

        if (window.confirm(t('analyzer.confirmAddProduct', { 
            name: description, 
            price: analysis.maxProfitPrice.price, 
            stock: 10 
        }))) {
            const priceString = analysis.maxProfitPrice.price.replace(/[^0-9,.-]+/g, '').replace('.', '').replace(',', '.');
            const price = parseFloat(priceString);

            let imageUrl: string | undefined;
            if (imageFile) {
                try {
                    imageUrl = await fileToDataUrl(imageFile);
                } catch (error) {
                    console.error("Error converting file to data URL:", error);
                    alert(t('addProduct.imageError'));
                    return;
                }
            }

            const newProduct: Omit<Product, 'id' | 'sales'> = {
                name: description,
                price: isNaN(price) ? 0 : price,
                stock: 10,
                imageUrl,
            };
            onAddProduct(newProduct);
            alert(t('analyzer.productAddedSuccess'));
        }
    };

    const hasCredits = remainingAiUses === 'unlimited' || remainingAiUses > 0;

    return (
        <div className="p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">{t('analyzer.title')}</h1>
            
            <div className="space-y-4 bg-brand-dark-secondary p-4 rounded-lg">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('analyzer.placeholder')}
                    className="w-full h-24 p-2 bg-slate-700 rounded-md placeholder-gray-400 focus:ring-2 focus:ring-brand-green outline-none"
                    disabled={isLoading || !hasCredits}
                />
                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

                <div className="flex items-center space-x-4">
                    <button onClick={startCamera} className="flex-1 text-center bg-slate-600 hover:bg-slate-500 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed" disabled={!hasCredits}>{t('analyzer.useCamera')}</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-center bg-slate-600 hover:bg-slate-500 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed" disabled={!hasCredits}>
                        {imageFile ? t('analyzer.changeImage') : t('analyzer.attachImage')}
                    </button>
                    {imagePreview && (
                        <div className="w-16 h-16 rounded-md overflow-hidden">
                             <img src={imagePreview} alt={t('analyzer.productPreviewAlt')} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
               
                <button onClick={handleAnalyze} disabled={isLoading || !hasCredits} className="w-full bg-brand-green hover:bg-brand-lime text-brand-dark font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? <LoadingSpinner text={t('analyzer.loading')} /> : t('analyzer.analyzeButton')}
                </button>
                {!hasCredits && <p className="text-yellow-400 text-sm mt-2 text-center">{t('analyzer.noCredits')}</p>}
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {analysis && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold">{t('analyzer.resultsTitle')}</h2>
                    <div className="bg-brand-dark-secondary p-4 rounded-lg">
                        <p><strong>{t('analyzer.category')}:</strong> {analysis.category}</p>
                        <p><strong>{t('analyzer.marketValue')}:</strong> {analysis.marketValue}</p>
                        <p><strong>{t('analyzer.targetAudience')}:</strong> {analysis.targetAudience}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-brand-dark-secondary p-4 rounded-lg">
                            <h3 className="font-bold text-brand-lime">{t('analyzer.quickSalePrice')}</h3>
                            <p className="text-2xl font-bold">{analysis.quickSalePrice.price}</p>
                            <p className="text-xs text-gray-400">{analysis.quickSalePrice.reasoning}</p>
                        </div>
                        <div className="bg-brand-dark-secondary p-4 rounded-lg">
                             <h3 className="font-bold text-brand-lime">{t('analyzer.maxProfitPrice')}</h3>
                            <p className="text-2xl font-bold">{analysis.maxProfitPrice.price}</p>
                            <p className="text-xs text-gray-400">{analysis.maxProfitPrice.reasoning}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                         <button onClick={handleAddProductFromAnalysis} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            {t('analyzer.addToProducts')}
                        </button>
                        <button onClick={handleGenerateAds} disabled={adLoading || !hasCredits} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {adLoading ? t('analyzer.generatingAds') : `✨ ${t('analyzer.generateAds')}`}
                        </button>
                    </div>
                </div>
            )}
            
            {generatedAds && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold">{t('analyzer.generatedAdsTitle')}</h2>
                    <div className="space-y-4">
                        <AdCard platform="instagram" content={generatedAds.instagram} />
                        <AdCard platform="whatsapp" content={generatedAds.whatsapp} />
                        <AdCard platform="shopee" content={generatedAds.shopee} />
                        <AdCard platform="mercadoLivre" content={generatedAds.mercadoLivre} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyzerScreen;