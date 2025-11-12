import { GoogleGenAI, Chat } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface SmartChatScreenProps {
    onAttemptAiUse: () => boolean;
}

const SmartChatScreen: React.FC<SmartChatScreenProps> = ({ onAttemptAiUse }) => {
    const { t } = useI18n();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: t('chat.initialMessage') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // We create the chat instance inside a ref to avoid re-creation on every render
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: t('chat.systemInstruction'),
            },
        });
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;
        
        if(!onAttemptAiUse()) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            const errorMessage: ChatMessage = { role: 'model', text: t('chat.errorMessage') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 text-white">
            <h1 className="text-2xl font-bold mb-4 text-center">{t('chat.title')}</h1>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-green text-brand-dark rounded-br-none' : 'bg-brand-dark-secondary text-white rounded-bl-none'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-3 rounded-2xl bg-brand-dark-secondary text-white rounded-bl-none flex items-center">
                           <span className="w-2 h-2 bg-brand-lime rounded-full animate-pulse mr-2" style={{animationDelay: '0s'}}></span>
                           <span className="w-2 h-2 bg-brand-lime rounded-full animate-pulse mr-2" style={{animationDelay: '0.2s'}}></span>
                           <span className="w-2 h-2 bg-brand-lime rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 p-3 bg-brand-dark-secondary rounded-full placeholder-gray-400 focus:ring-2 focus:ring-brand-green outline-none"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="ml-3 bg-brand-green p-3 rounded-full text-brand-dark disabled:bg-gray-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            </div>
        </div>
    );
};

export default SmartChatScreen;