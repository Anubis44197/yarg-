import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { Document } from '../types';

// FIX: Initialize GoogleGenAI with a named parameter for the API key from process.env, as per the coding guidelines. This resolves the 'import.meta.env' error.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// FIX: Use the correct model name 'gemini-2.5-flash'.
const model = 'gemini-2.5-flash';

const generateContent = async (prompt: string): Promise<string> => {
    try {
        // FIX: Added GenerateContentResponse type for clarity and safety.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        // FIX: Access the generated text directly from the 'text' property.
        return response.text;
    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        if (error instanceof Error) {
            return `Gemini API hatası: ${error.message}`;
        }
        return "Gemini API ile iletişim kurulurken bilinmeyen bir hata oluştu.";
    }
};

export const summarizeDocument = async (doc: Document): Promise<string> => {
    const prompt = `
        Aşağıdaki hukuk belgesini, ana argümanları, hukuki dayanakları ve varılan sonucu vurgulayarak,
        profesyonel ve anlaşılır bir dille özetle. Özet, belgenin özünü yansıtmalı ve
        bir hukuk profesyonelinin hızlıca anlayabileceği şekilde yapılandırılmalıdır.

        Belge Başlığı: ${doc.title}
        Mahkeme: ${doc.court}
        Tarih: ${doc.date}
        Esas ve Karar No: ${doc.documentId}

        Belge İçeriği:
        ---
        ${doc.pageContent}
        ---

        Lütfen sadece özet metnini döndür.
    `;
    return generateContent(prompt);
};

export const compareDocuments = async (docs: Document[]): Promise<string> => {
    let documentsText = "";
    docs.forEach((doc, index) => {
        documentsText += `
            --- Belge ${index + 1} ---
            Başlık: ${doc.title}
            Mahkeme: ${doc.court}
            Tarih: ${doc.date}
            Esas ve Karar No: ${doc.documentId}
            İçerik: ${doc.pageContent.substring(0, 8000)}... 
            --- Bitiş Belge ${index + 1} ---
        `;
    });

    const prompt = `
        Aşağıda ${docs.length} adet hukuk belgesi bulunmaktadır. Bu belgeleri karşılaştırarak aşağıdaki maddeleri analiz et:

        1.  **Benzerlikler:** Belgelerdeki benzer hukuki argümanları, olayları veya sonuçları belirt.
        2.  **Farklılıklar:** Belgeler arasındaki temel farkları (hukuki yorum, olay örgüsü, sonuç vb.) vurgula.
        3.  **Ortak Tema/İlke:** Belgelerin tartıştığı ortak hukuki tema veya ilkeyi tanımla.
        4.  **Sonuç:** Karşılaştırmalı bir analiz sunarak belgelerin birbirine göre konumunu özetle.

        Analizini Markdown formatında, başlıklar ve listeler kullanarak yapılandır.

        ${documentsText}
    `;
    return generateContent(prompt);
};

export const getChatResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], newMessage: string): Promise<string> => {
    // FIX: Added Chat type for clarity and safety.
    const chat: Chat = ai.chats.create({
        model,
        history,
        config: {
            systemInstruction: "Sen, Türkiye hukuk sistemi konusunda uzman bir yapay zeka asistanısın. Kullanıcının sunduğu belgeler ve analizler hakkında sorduğu sorulara, profesyonel, doğru ve net yanıtlar ver. Yanıtlarını Markdown formatında yapılandır."
        }
    });

    try {
        // FIX: According to guidelines, sendMessage takes an object with a message property.
        const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
        // FIX: Access the generated text directly from the 'text' property.
        return response.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
         if (error instanceof Error) {
            return `Gemini API hatası: ${error.message}`;
        }
        return "Gemini API ile iletişim kurulurken bilinmeyen bir hata oluştu.";
    }
};
