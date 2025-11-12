import { GoogleGenAI, Chat, Part } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { fileToBase64, fileToDataUrl } from '../../utils/fileUtils';
import PaperclipIcon from '../icons/PaperclipIcon';

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
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: t('chat.systemInstruction'),
            },
        });
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const dataUrl = await fileToDataUrl(file);
            setImagePreview(dataUrl);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleSend = async () => {
        if ((!input.trim() && !imageFile) || isLoading || !chatRef.current) return;
        
        if(!onAttemptAiUse()) return;

        const userMessage: ChatMessage = { role: 'user', text: input, imageUrl: imagePreview };
        setMessages(prev => [...prev, userMessage]);
        
        const localInput = input;
        const localImageFile = imageFile;
        
        setInput('');
        removeImage();
        setIsLoading(true);

        try {
            const parts: Part[] = [];
            if (localImageFile) {
                const base64Data = await fileToBase64(localImageFile);
                parts.push({
                    inlineData: { mimeType: localImageFile.type, data: base64Data }
                });
            }
            if (localInput.trim()) {
                parts.push({ text: localInput });
            }

            const response = await chatRef.current.sendMessage({ message: parts });
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
                           {msg.imageUrl && <img src={msg.imageUrl} alt={t('chat.imageAlt')} className="rounded-lg mb-2 max-h-48" />}
                           {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
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
             {imagePreview && (
                <div className="mt-2 relative w-24 h-24 p-1 bg-brand-dark-secondary rounded-lg">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded"/>
                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">X</button>
                </div>
            )}
            <div className="mt-4 flex items-center">
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full text-gray-300 hover:bg-brand-dark-secondary transition-colors" aria-label={t('chat.attachImage')}>
                    <PaperclipIcon className="w-6 h-6" />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 p-3 mx-2 bg-brand-dark-secondary rounded-full placeholder-gray-400 focus:ring-2 focus:ring-brand-green outline-none"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || (!input.trim() && !imageFile)} className="bg-brand-green p-3 rounded-full text-brand-dark disabled:bg-gray-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
        </div>
    );
};

export default SmartChatScreen;