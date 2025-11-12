
export enum Screen {
  Home = 'HOME',
  Analyzer = 'ANALYZER',
  Dashboard = 'DASHBOARD',
  Plans = 'PLANS',
  Chat = 'CHAT',
  Products = 'PRODUCTS',
  Trends = 'TRENDS',
  Profile = 'PROFILE',
  CompetitorAnalysis = 'COMPETITOR_ANALYSIS',
}

export type Language = 'pt' | 'en' | 'es';

export interface Plan {
    id: string;
    name: string;
    price: string;
    priceDetails: string;
    annualPrice?: string;
    annualPriceDetails?: string;
    features: string[];
    aiUses: number | 'unlimited';
    isPopular?: boolean;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    sales: number;
    stock: number;
    imageUrl?: string;
    links?: {
        shopee?: string;
        mercadoLivre?: string;
    }
}


export interface ProductAnalysis {
  category: string;
  marketValue: string;
  targetAudience: string;
  quickSalePrice: {
    price: string;
    reasoning: string;
  };
  maxProfitPrice: {
    price: string;
    reasoning: string;
  };
}

export interface AdContent {
    title: string;
    body: string;
    hashtags: string[];
}

export interface GeneratedAds {
    instagram: AdContent;
    whatsapp: AdContent;
    shopee: AdContent;
    mercadoLivre: AdContent;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TrendSuggestion {
    productName: string;
    reasoning: string;
}

export interface SalesGoal {
  type: 'profit' | 'quantity';
  value: number;
}

export interface CompetitorAnalysisResult {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    pricingStrategy: string;
    finalRecommendation: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // For simulation only
    provider?: 'email' | 'google' | 'facebook';
    profilePictureUrl?: string;
    language: Language;

    // App State per user
    products: Product[];
    currentPlanId: string;
    aiUses: number;
    salesGoal: SalesGoal | null;
}