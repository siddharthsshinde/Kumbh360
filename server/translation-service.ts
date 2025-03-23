/**
 * Translation Service with Gemini API for Kumbh Mela Chatbot
 * 
 * This module implements translation capabilities using Gemini API,
 * enabling multilingual support for the Kumbh Mela chatbot.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cacheManager, CacheType } from './cache-manager';
import { log } from './vite';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu"
};

class TranslationService {
  private static instance: TranslationService;
  private genAI: GoogleGenerativeAI | null = null;
  public isInitialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Initialize the Gemini API service for translation
   */
  public initialize(apiKey: string): void {
    if (this.isInitialized) return;

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isInitialized = true;
      log('Translation Service initialized successfully', 'translation');
    } catch (error) {
      log(`Failed to initialize Translation Service: ${error}`, 'translation');
      throw error;
    }
  }

  /**
   * Detect the language of a text
   */
  public async detectLanguage(text: string): Promise<string> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Translation Service not initialized');
    }

    try {
      // Check cache first
      const cacheKey = `detect-${text.substring(0, 100)}`;
      const cachedResult = await cacheManager.get<string>(CacheType.TRANSLATION, cacheKey);
      
      if (cachedResult) {
        log('Language detection result retrieved from cache', 'translation');
        return cachedResult;
      }

      // Use Gemini to detect language with API version set to v1
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: "v1" });
      
      const prompt = `Detect the language of the following text. 
Respond with only the language code (e.g., 'en' for English, 'hi' for Hindi, 'mr' for Marathi, etc.):

"""
${text}
"""

If you're unsure, respond with 'en'.`;
      
      const result = await model.generateContent(prompt);
      const languageCode = result.response.text().trim().toLowerCase();
      
      // Simple validation to ensure we get a language code
      const validCode = Object.keys(SUPPORTED_LANGUAGES).includes(languageCode) 
        ? languageCode 
        : 'en';
      
      // Cache the result
      await cacheManager.set(CacheType.TRANSLATION, cacheKey, validCode);
      
      return validCode;
    } catch (error) {
      log(`Error detecting language: ${error}`, 'translation');
      return 'en'; // Default to English on error
    }
  }

  /**
   * Translate text from one language to another
   */
  public async translateText(
    text: string,
    targetLanguage: string = 'en',
    sourceLanguage: string | null = null
  ): Promise<string> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Translation Service not initialized');
    }

    try {
      // Generate cache key based on text, target language, and source language
      const cacheKey = `translate-${sourceLanguage || 'auto'}-${targetLanguage}-${text.substring(0, 100)}`;
      const cachedTranslation = await cacheManager.get<string>(CacheType.TRANSLATION, cacheKey);
      
      if (cachedTranslation) {
        log('Translation retrieved from cache', 'translation');
        return cachedTranslation;
      }

      // Detect source language if not provided
      if (!sourceLanguage) {
        sourceLanguage = await this.detectLanguage(text);
      }
      
      // Skip translation if source and target are the same
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      // Use Gemini for translation with API version set to v1
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: "v1" });
      
      const targetLanguageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES] || 'English';
      const sourceLanguageName = SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] || 'unknown language';
      
      const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}.
Provide ONLY the translated text without explanations, notes, or any additional content.

Text to translate:
"""
${text}
"""`;
      
      const result = await model.generateContent(prompt);
      const translation = result.response.text();
      
      // Cache the translation
      await cacheManager.set(CacheType.TRANSLATION, cacheKey, translation);
      
      return translation;
    } catch (error) {
      log(`Error translating text: ${error}`, 'translation');
      return text; // Return original text on error
    }
  }

  /**
   * Translate chat messages
   */
  public async translateMessage(
    message: { content: string; [key: string]: any },
    targetLanguage: string = 'en'
  ): Promise<{ content: string; detectedLanguage?: string; [key: string]: any }> {
    try {
      // Detect the language of the message
      const detectedLanguage = await this.detectLanguage(message.content);
      
      // If already in target language, return as is
      if (detectedLanguage === targetLanguage) {
        return { ...message, detectedLanguage };
      }
      
      // Translate the content
      const translatedContent = await this.translateText(
        message.content,
        targetLanguage,
        detectedLanguage
      );
      
      // Return translated message with detected language info
      return {
        ...message,
        content: translatedContent,
        detectedLanguage
      };
    } catch (error) {
      log(`Error translating message: ${error}`, 'translation');
      return message; // Return original message on error
    }
  }
}

export const translationService = TranslationService.getInstance();