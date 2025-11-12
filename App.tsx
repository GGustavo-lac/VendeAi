

import React, { useState, useMemo, useEffect } from 'react';
import { Screen, Product, Plan, SalesGoal, User, ProductAnalysis, Language } from './types';
import BottomNav from './components/layout/BottomNav';
import HomeScreen from './components/screens/HomeScreen';
import AnalyzerScreen from './components/screens/AnalyzerScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import SmartChatScreen from './components/screens/SmartChatScreen';
import PlansScreen, { plans } from './components/screens/PlansScreen';
import ProductsScreen from './components/screens/ProductsScreen';
import TrendsScreen from './components/screens/TrendsScreen';
import LoginScreen from './components/screens/LoginScreen';
import WelcomeScreen from './components/screens/WelcomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import { fileToDataUrl } from './utils/fileUtils';
import CompetitorAnalysisScreen from './components/screens/CompetitorAnalysisScreen';
import AddProductModal from './components/common/AddProductModal';
import AuthCallbackPage from './components/pages/AuthCallbackPage';
import { I18nProvider } from './context/I18nContext';
import { useAuth } from './hooks/useAuth';


const USERS_DB_KEY = 'vendeAiUsersDb';
const CURRENT_USER_EMAIL_KEY = 'vendeAiCurrentUserEmail';

type AuthScreen = 'welcome' | 'login' | 'register';

const App: React.FC = () => {
    const { user: currentUser, loading, logout, updateProfile } = useAuth();
    const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');

    const updateCurrentUserState = (updatedData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        setUsersDb(prevDb => ({
            ...prevDb,
            [currentUser.email]: updatedUser
        }));
    };

    const currentPlan = useMemo(() =>
        plans.find(p => p.id === (currentUser?.currentPlanId || 'free'))!,
    [currentUser]);

    const remainingAiUses: number | 'unlimited' = useMemo(() => {
        if (!currentUser) return 0;
        if (currentPlan.aiUses === 'unlimited') return 'unlimited';
        return currentPlan.aiUses - currentUser.aiUses;
    }, [currentPlan, currentUser]);

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'sales'>) => {
        if (!currentUser) return;
        const productLimit = 5;
        if (currentPlan.id === 'free' && currentUser.products.length >= productLimit) {
            alert(`Você atingiu o limite de ${productLimit} produtos do plano Grátis. Faça upgrade para adicionar mais.`);
            return;
        }
        const products = [...currentUser.products, { ...newProduct, id: Date.now().toString(), sales: 0 }];
        updateCurrentUserState({ products });
    };

    const handleUpdateSales = (productId: string, newSales: number) => {
         if (!currentUser) return;
        const products = currentUser.products.map(p => p.id === productId ? { ...p, sales: Math.max(0, newSales) } : p);
        updateCurrentUserState({ products });
    };

    const handleSetPlan = (planId: string) => {
        const newPlan = plans.find(p => p.id === planId);
        if (newPlan) {
            updateCurrentUserState({ currentPlanId: planId, aiUses: 0 });
        }
    };

    const handleAttemptAiUse = () => {
        if (remainingAiUses === 'unlimited' || remainingAiUses > 0) {
            if (remainingAiUses !== 'unlimited' && currentUser) {
                updateCurrentUserState({ aiUses: currentUser.aiUses + 1 });
            }
            return true;
        }
        alert('Você atingiu seu limite de uso da IA. Por favor, faça upgrade do seu plano para continuar.');
        return false;
    };

    const handleSetSalesGoal = (goal: SalesGoal | null) => {
        updateCurrentUserState({ salesGoal: goal });
    };
    
    const handleUpdateProfilePicture = async (file: File) => {
        try {
            const dataUrl = await fileToDataUrl(file);
            updateCurrentUserState({ profilePictureUrl: dataUrl });
        } catch (error) {
            console.error("Error updating profile picture:", error);
            alert("Não foi possível atualizar a foto de perfil.");
        }
    };
    
    const handleChangeLanguage = (lang: Language) => {
        updateCurrentUserState({ language: lang });
    };

    const handleEmailRegister = (name: string, email: string, password: string): boolean => {
        if (usersDb[email]) {
            alert("Este e-mail já está em uso.");
            return false;
        }
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            password,
            provider: 'email',
            products: [],
            currentPlanId: 'free',
            aiUses: 0,
            salesGoal: null,
            language: 'pt',
        };
        setUsersDb(prevDb => ({ ...prevDb, [email]: newUser }));
        setCurrentUser(newUser);
        return true;
    };

    const handleSocialRegister = (provider: 'google' | 'facebook'): boolean => {
        // Simple simulation
        const email = `user${Date.now()}@${provider}.com`;
        const name = `Usuário ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            provider,
            products: [],
            currentPlanId: 'free',
            aiUses: 0,
            salesGoal: null,
            language: 'pt',
        };
        setUsersDb(prevDb => ({ ...prevDb, [email]: newUser }));
        setCurrentUser(newUser);
        return true;
    };

    const handleEmailLogin = (email: string, password: string): boolean => {
        const user = usersDb[email];
        if (user && user.password === password) {
            setCurrentUser(user);
            return true;
        }
        alert("E-mail ou senha inválidos.");
        return false;
    };

    const handleSocialLogin = (provider: 'google' | 'facebook'): boolean => {
       // Super simple simulation: find first user with this provider or create one.
       // FIX: Explicitly type 'u' as User to help TypeScript's type inference.
       let user = Object.values(usersDb).find((u: User) => u.provider === provider);
       if (!user) {
           return handleSocialRegister(provider);
       }
       setCurrentUser(user);
       return true;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
        setAuthScreen('welcome');
    };
    
    if (isLoading) {
        return <div className="bg-brand-dark h-screen w-screen flex items-center justify-center text-white">Carregando...</div>;
    }

    if (!currentUser) {
        return (
            <I18nProvider language="pt">
                 {(() => {
                    switch (authScreen) {
                        case 'login':
                            return <LoginScreen onEmailLogin={handleEmailLogin} onSocialLogin={handleSocialLogin} onNavigateToRegister={() => setAuthScreen('register')} />;
                        case 'register':
                            return <RegisterScreen onEmailRegister={handleEmailRegister} onSocialRegister={handleSocialRegister} onNavigateToLogin={() => setAuthScreen('login')} />;
                        case 'welcome':
                        default:
                            return <WelcomeScreen onNavigateToLogin={() => setAuthScreen('login')} onNavigateToRegister={() => setAuthScreen('register')} />;
                    }
                })()}
            </I18nProvider>
        );
    }

    const MainApp = () => {
        const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
        const [isAddModalOpen, setIsAddModalOpen] = useState(false);
        const [prefilledProduct, setPrefilledProduct] = useState<Partial<Omit<Product, 'id' | 'sales'>> | null>(null);

        const handleOpenAddProductModal = (initialData: Partial<Omit<Product, 'id' | 'sales'>> | null = null) => {
            setPrefilledProduct(initialData);
            setIsAddModalOpen(true);
        };

        const handleCloseAddProductModal = () => {
            setIsAddModalOpen(false);
            setPrefilledProduct(null); // Clear data when closing
        };
        
        const renderScreen = () => {
            switch (activeScreen) {
                case Screen.Home:
                    return <HomeScreen setActiveScreen={setActiveScreen} currentUser={currentUser} currentPlan={currentPlan} remainingAiUses={remainingAiUses} />;
                case Screen.Analyzer:
                    return <AnalyzerScreen remainingAiUses={remainingAiUses} onAttemptAiUse={handleAttemptAiUse} onAddProduct={handleAddProduct} currentPlan={currentPlan} setActiveScreen={setActiveScreen} />;
                case Screen.Dashboard:
                    return <DashboardScreen products={currentUser.products} salesGoal={currentUser.salesGoal} onSetSalesGoal={handleSetSalesGoal} currentPlan={currentPlan} setActiveScreen={setActiveScreen} />;
                case Screen.Products:
                    return <ProductsScreen products={currentUser.products} onAddProduct={handleAddProduct} onUpdateSales={handleUpdateSales} currentPlan={currentPlan} setActiveScreen={setActiveScreen} onAttemptAiUse={handleAttemptAiUse} onOpenAddModal={handleOpenAddProductModal} />;
                case Screen.Plans:
                    return <PlansScreen currentPlanId={currentUser.currentPlanId} onSubscriptionSuccess={handleSetPlan} />;
                case Screen.Chat:
                    return <SmartChatScreen onAttemptAiUse={handleAttemptAiUse} />;
                case Screen.Trends:
                    return <TrendsScreen currentPlan={currentPlan} onAttemptAiUse={handleAttemptAiUse} setActiveScreen={setActiveScreen} />;
                case Screen.CompetitorAnalysis:
                    return <CompetitorAnalysisScreen currentPlan={currentPlan} onAttemptAiUse={handleAttemptAiUse} setActiveScreen={setActiveScreen} />;
                 case Screen.Profile:
                    return <ProfileScreen currentUser={currentUser} onLogout={handleLogout} onUpdateProfilePicture={handleUpdateProfilePicture} onChangeLanguage={handleChangeLanguage} />;
                default:
                    return <HomeScreen setActiveScreen={setActiveScreen} currentUser={currentUser} currentPlan={currentPlan} remainingAiUses={remainingAiUses} />;
            }
        };

        return (
            <div className="relative mx-auto h-screen w-full max-w-md overflow-hidden bg-brand-dark-secondary shadow-2xl flex flex-col">
                <main className="flex-1 overflow-y-auto pb-20">
                    {renderScreen()}
                </main>
                <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
                 <AddProductModal 
                    isOpen={isAddModalOpen}
                    onClose={handleCloseAddProductModal}
                    onAddProduct={(product) => {
                        handleAddProduct(product);
                        handleCloseAddProductModal();
                    }}
                    initialData={prefilledProduct}
                />
            </div>
        )
    };

    return (
        <I18nProvider language={currentUser.language || 'pt'}>
            <div className="bg-brand-dark font-sans">
                <MainApp />
            </div>
        </I18nProvider>
    );
};

export default App;