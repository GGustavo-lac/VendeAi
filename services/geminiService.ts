

import { GoogleGenAI, Type } from "@google/genai";
import { ProductAnalysis, GeneratedAds, TrendSuggestion, Product, CompetitorAnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, description: "Product category" },
        marketValue: { type: Type.STRING, description: "Estimated market value in BRL (e.g., 'R$100,00 - R$150,00')" },
        targetAudience: { type: Type.STRING, description: "Description of the target audience" },
        quickSalePrice: {
            type: Type.OBJECT,
            properties: {
                price: { type: Type.STRING, description: "Suggested price for a quick sale in BRL" },
                reasoning: { type: Type.STRING, description: "Reasoning for the quick sale price" },
            },
            required: ['price', 'reasoning']
        },
        maxProfitPrice: {
            type: Type.OBJECT,
            properties: {
                price: { type: Type.STRING, description: "Suggested price for maximum profit in BRL" },
                reasoning: { type: Type.STRING, description: "Reasoning for the max profit price" },
            },
            required: ['price', 'reasoning']
        },
    },
    required: ['category', 'marketValue', 'targetAudience', 'quickSalePrice', 'maxProfitPrice']
};


export const analyzeProduct = async (
    description: string,
    image?: { mimeType: string; data: string }
): Promise<ProductAnalysis> => {
    const model = image ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const prompt = `Analise este produto. Com base na descrição e/ou imagem, forneça uma análise detalhada. Descrição: "${description}". Responda em Português do Brasil.`;

    const textPart = { text: prompt };
    const parts = image
        ? [{ inlineData: { mimeType: image.mimeType, data: image.data } }, textPart]
        : [textPart];

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: productAnalysisSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProductAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("A resposta da IA não estava no formato JSON esperado.");
    }
};

const adContentSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'Catchy title for the ad' },
        body: { type: Type.STRING, description: 'Compelling body text for the ad' },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Relevant hashtags, without the # symbol'
        }
    },
    required: ['title', 'body', 'hashtags']
};

export const generateAds = async (productInfo: ProductAnalysis): Promise<GeneratedAds> => {
    const prompt = `Com base nas informações do produto a seguir, gere textos de anúncio otimizados para Instagram, WhatsApp, Shopee e Mercado Livre. Informações do produto: Categoria: ${productInfo.category}, Público-alvo: ${productInfo.targetAudience}, Preço sugerido: ${productInfo.maxProfitPrice.price}. Responda em Português do Brasil.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    instagram: adContentSchema,
                    whatsapp: adContentSchema,
                    shopee: adContentSchema,
                    mercadoLivre: adContentSchema,
                },
                required: ['instagram', 'whatsapp', 'shopee', 'mercadoLivre']
            }
        },
    });
    
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeneratedAds;
    } catch (e) {
        console.error("Failed to parse Gemini response for ads:", response.text);
        throw new Error("A resposta da IA para anúncios não estava no formato JSON esperado.");
    }
};

export const generateAdCopy = async (product: Product, description: string, platform: string, tone: string): Promise<string> => {
    const prompt = `Crie um texto de anúncio curto e persuasivo para o produto "${product.name}", que custa R$${product.price.toFixed(2)}. A descrição fornecida pelo usuário é: "${description}". O anúncio é para a plataforma "${platform}" e deve ter um tom "${tone}". Incorpore detalhes da descrição do usuário. Inclua emojis relevantes e uma chamada para ação clara. Responda em Português do Brasil.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

export const suggestTrends = async (): Promise<TrendSuggestion[]> => {
    const prompt = `Aja como um analista de tendências de mercado para e-commerce no Brasil. Sugira 5 produtos que estão em alta e com bom potencial de vendas. Para cada produto, forneça um nome claro e uma breve justificativa (reasoning) para a tendência. Responda em Português do Brasil.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING, description: 'Nome do produto em tendência.' },
                        reasoning: { type: Type.STRING, description: 'Breve explicação do porquê este produto é uma tendência.' }
                    },
                    required: ['productName', 'reasoning']
                }
            }
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
            return parsed as TrendSuggestion[];
        }
        if (typeof parsed === 'object' && parsed !== null) {
            const key = Object.keys(parsed)[0];
            if (Array.isArray(parsed[key])) {
                return parsed[key] as TrendSuggestion[];
            }
        }
        throw new Error("Parsed JSON is not in the expected format of an array of suggestions.");
    } catch (e) {
        console.error("Failed to parse Gemini response for trends:", response.text, e);
        throw new Error("A resposta da IA para tendências não estava no formato JSON esperado.");
    }
};

export const analyzeCompetitor = async (productDescription: string): Promise<CompetitorAnalysisResult> => {
    const prompt = `Aja como um especialista em e-commerce. Analise o seguinte produto ou concorrente descrito pelo usuário: "${productDescription}". Forneça uma análise SWOT simplificada (pontos fortes, fracos, oportunidades), sugira uma estratégia de precificação e finalize com uma recomendação clara para o usuário se destacar no mercado. Responda em Português do Brasil.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos fortes." },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos fracos." },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de oportunidades de mercado." },
                    pricingStrategy: { type: Type.STRING, description: "Estratégia de precificação sugerida." },
                    finalRecommendation: { type: Type.STRING, description: "Recomendação final e acionável." },
                },
                required: ['strengths', 'weaknesses', 'opportunities', 'pricingStrategy', 'finalRecommendation']
            }
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CompetitorAnalysisResult;
    } catch (e) {
        console.error("Failed to parse Gemini response for competitor analysis:", response.text);
        throw new Error("A resposta da IA para análise de concorrência não estava no formato JSON esperado.");
    }
};
