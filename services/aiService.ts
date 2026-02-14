
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI for Doctors: Suggests a structured prescription based on patient context/symptoms.
 */
export const draftPrescriptionWithAI = async (symptoms: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a clinical assistant. Suggest a structured prescription for these symptoms: "${symptoms}". 
        Include: Medication Name, Dosage, Frequency, and Duration.
        Format your response as a clear, concise text block suitable for a medical record.`,
        config: {
            systemInstruction: "You are an expert medical assistant for doctors. Be precise, conservative, and professional.",
            temperature: 0.2,
        },
    });
    return response.text;
};

/**
 * AI for Pharmacy Admins: Analyzes sales data to find trends and inventory advice.
 */
export const analyzeSalesWithAI = async (salesData: any[]) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this pharmacy sales data: ${JSON.stringify(salesData)}. 
        Provide: 
        1. Top revenue driver trend.
        2. Inventory risk (potential expiry or dead stock).
        3. A business recommendation for the next 30 days.
        Keep it under 150 words.`,
        config: {
            systemInstruction: "You are a senior pharmaceutical business consultant. Analyze data for profit optimization.",
        },
    });
    return response.text;
};

/**
 * AI for Super Admins: Summarizes system metrics into an executive brief.
 */
export const generateExecutiveBriefWithAI = async (healthData: any) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Summarize this system health data for the CTO: ${JSON.stringify(healthData)}. 
        Focus on risk metrics, failed operations, and high-risk pharmacies. 
        Start with a 'Health Score' (0-100).`,
    });
    return response.text;
};

/**
 * AI for Patients: Intelligent medicine discovery from symptom-based queries.
 */
export const suggestMedicinesForSymptoms = async (query: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The patient is searching for: "${query}". 
        List 3 common over-the-counter medicine categories or active ingredients they might be looking for. 
        Return only the names separated by commas.`,
        config: {
            systemInstruction: "You are a helpful pharmacy search assistant. Suggest generic medicine names for common symptoms.",
        },
    });
    return response.text;
};
