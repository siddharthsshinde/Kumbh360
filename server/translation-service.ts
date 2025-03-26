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

    // Handle empty or very short text
    if (!text || text.trim().length < 2) {
      log('Text too short for language detection, defaulting to English', 'translation');
      return 'en';
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
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" }, { apiVersion: "v1" });
      
      const prompt = `Detect the language of the following text. 
Respond with only the language code (e.g., 'en' for English, 'hi' for Hindi, 'mr' for Marathi, etc.):

"""
${text}
"""

If you're unsure, respond with 'en'.`;
      
      // Add timeout and retry logic
      let attempts = 0;
      const maxAttempts = 2;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        try {
          const result = await model.generateContent(prompt);
          
          // Check if we got a valid response
          if (!result || !result.response) {
            throw new Error('Empty response from Gemini API');
          }
          
          let languageCode: string;
          
          try {
            // Safely extract text with error handling for potential parsing issues
            const responseText = result.response.text();
            
            if (!responseText || typeof responseText !== 'string') {
              throw new Error('Invalid response text format from Gemini API');
            }
            
            languageCode = responseText.trim().toLowerCase();
            
            // Additional validation to ensure the code is not too long (likely an error response)
            if (languageCode.length > 5) {
              log(`Unexpected language code format: "${languageCode.substring(0, 20)}..."`, 'translation');
              languageCode = 'en'; // Default to English for unexpected formats
            }
          } catch (parseError) {
            log(`Error parsing Gemini response: ${parseError}`, 'translation');
            throw new Error(`Failed to parse Gemini response: ${parseError}`);
          }
          
          // Enhanced validation to ensure we get a valid language code
          const validCode = Object.keys(SUPPORTED_LANGUAGES).includes(languageCode) 
            ? languageCode 
            : 'en';
          
          // Cache the result
          await cacheManager.set(CacheType.TRANSLATION, cacheKey, validCode);
          
          return validCode;
        } catch (error) {
          lastError = error;
          log(`Language detection attempt ${attempts + 1} failed: ${error}`, 'translation');
          attempts++;
          
          // Wait before retrying (exponential backoff)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts)));
          }
        }
      }
      
      // If we get here, all attempts failed
      log(`Error detecting language after ${maxAttempts} attempts: ${lastError}`, 'translation');
      return 'en'; // Default to English on error
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

    // Handle empty or very short text
    if (!text || text.trim().length < 2) {
      log('Text too short for translation, returning original', 'translation');
      return text;
    }

    // Validate target language
    if (!targetLanguage || !Object.keys(SUPPORTED_LANGUAGES).includes(targetLanguage)) {
      log(`Invalid target language: ${targetLanguage}, defaulting to English`, 'translation');
      targetLanguage = 'en';
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
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" }, { apiVersion: "v1" });
      
      const targetLanguageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES] || 'English';
      const sourceLanguageName = SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] || 'unknown language';
      
      const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}.
Provide ONLY the translated text without explanations, notes, or any additional content.

Text to translate:
"""
${text}
"""`;
      
      // Add timeout and retry logic
      let attempts = 0;
      const maxAttempts = 2;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        try {
          const result = await model.generateContent(prompt);
          
          // Check if we got a valid response
          if (!result || !result.response) {
            throw new Error('Empty response from Gemini API');
          }
          
          let translation: string;
          
          try {
            // Safely extract text with error handling for potential parsing issues
            const responseText = result.response.text();
            
            if (!responseText || typeof responseText !== 'string') {
              throw new Error('Invalid response text format from Gemini API');
            }
            
            translation = responseText;
            
            // Check for potential error responses or instructions that weren't filtered out
            if (translation.toLowerCase().includes('cannot translate') || 
                translation.toLowerCase().includes('unable to translate') ||
                translation.toLowerCase().includes('i apologize')) {
              throw new Error(`Gemini returned an error message: "${translation.substring(0, 40)}..."`);
            }
            
            // Basic validation that the translation is reasonable
            if (translation.trim().length === 0) {
              throw new Error('Empty translation returned');
            }
            
            // Suspiciously short translation for a long text likely indicates an error
            if (translation.length < 3 && text.length > 20) {
              throw new Error(`Translation seems too short (${translation.length} chars) compared to original (${text.length} chars)`);
            }
          } catch (parseError) {
            log(`Error parsing Gemini translation response: ${parseError}`, 'translation');
            throw new Error(`Failed to parse Gemini translation response: ${parseError}`);
          }
          
          // Cache the translation
          await cacheManager.set(CacheType.TRANSLATION, cacheKey, translation);
          
          return translation;
        } catch (error) {
          lastError = error;
          log(`Translation attempt ${attempts + 1} failed: ${error}`, 'translation');
          attempts++;
          
          // Wait before retrying (exponential backoff)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts)));
          }
        }
      }
      
      // If we get here, all attempts failed
      log(`Error translating text after ${maxAttempts} attempts: ${lastError}`, 'translation');
      return text; // Return original text on error
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
    // Validate message structure
    if (!message || typeof message.content !== 'string') {
      log('Invalid message format for translation', 'translation');
      return message;
    }
    
    // Validate target language
    if (!targetLanguage || !Object.keys(SUPPORTED_LANGUAGES).includes(targetLanguage)) {
      log(`Invalid target language: ${targetLanguage}, defaulting to English`, 'translation');
      targetLanguage = 'en';
    }
    
    try {
      // Skip translation for very short messages
      if (message.content.trim().length < 2) {
        return { ...message, detectedLanguage: 'en' };
      }
      
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
      
      // Verify translation result
      if (!translatedContent || translatedContent.trim().length === 0) {
        log('Empty translation result, returning original message', 'translation');
        return { ...message, detectedLanguage };
      }
      
      // Return translated message with detected language info
      return {
        ...message,
        content: translatedContent,
        detectedLanguage,
        translatedFrom: detectedLanguage,
        translatedTo: targetLanguage
      };
    } catch (error) {
      log(`Error translating message: ${error}`, 'translation');
      return message; // Return original message on error
    }
  }
}

export const translationService = TranslationService.getInstance();