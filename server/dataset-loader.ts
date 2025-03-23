// Dataset loader for Kumbh Mela real human dataset
import fs from 'fs';
import path from 'path';
import { storage } from './storage';

// Load the enhanced dataset for the chatbot
export async function loadRealHumanDataset() {
  try {
    // Path to the dataset file - corrected filename
    const datasetPath = path.join(__dirname, '../attached_assets/kumbh_mela_main.json');

    // Read and parse the JSON file
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const dataset = JSON.parse(rawData);

    console.log(`[Dataset Loader] Loading ${dataset.questions.length} QA pairs from the real human dataset`);

    // Store each QA pair in the knowledge base
    let loadedCount = 0;
    for (const qa of dataset.questions) {
      try {
        await storage.storeKnowledgeBase({
          topic: qa.question,
          content: qa.answer,
          source: 'kumbh_mela_main',
          confidence: 95 // High confidence score for curated human dataset
        });
        loadedCount++;
      } catch (error) {
        console.error(`Failed to load QA pair: ${qa.question}`, error);
      }
    }

    console.log(`[Dataset Loader] Successfully loaded ${loadedCount} QA pairs into the knowledge base`);
    return loadedCount;
  } catch (error) {
    console.error('Failed to load the real human dataset:', error);
    return 0;
  }
}

// Update the knowledge base with real-time data
export async function updateRealTimeData() {
  try {
    // This function would be called periodically to update real-time data
    // For demonstration purposes, we'll add a few real-time entries

    const realTimeData = [
      {
        topic: 'Current crowd level at Ramkund',
        content: `As of ${new Date().toLocaleString()}, crowd levels at Ramkund are moderate. 
                  Best time to visit is early morning before 7 AM or late evening after 8 PM. 
                  Current wait time is approximately 30-45 minutes.`,
        confidence: 90
      },
      {
        topic: 'Weather conditions for Kumbh Mela today',
        content: `Today's weather forecast for Nashik shows temperatures between 
                  ${Math.floor(22 + Math.random() * 10)}°C and ${Math.floor(30 + Math.random() * 8)}°C. 
                  ${Math.random() > 0.7 ? 'Light rain is expected in the evening.' : 'Conditions are clear with low humidity.'}
                  Pilgrims are advised to ${Math.random() > 0.5 ? 'carry umbrellas' : 'wear light clothing and stay hydrated'}.`,
        confidence: 85
      },
      {
        topic: 'Transportation updates for Kumbh Mela',
        content: `Special shuttle services are running every 15 minutes from Nashik Road station to 
                  Ramkund and Tapovan. The last shuttle returns at 11 PM. Avoid private vehicles 
                  as parking areas are ${Math.random() > 0.6 ? 'fully occupied' : 'operating at 80% capacity'}.`,
        confidence: 80
      }
    ];

    for (const data of realTimeData) {
      await storage.storeKnowledgeBase({
        topic: data.topic,
        content: data.content,
        source: 'real_time_update',
        confidence: data.confidence
      });
    }

    console.log(`[Dataset Loader] Updated real-time data at ${new Date().toLocaleString()}`);
    return realTimeData.length;
  } catch (error) {
    console.error('Failed to update real-time data:', error);
    return 0;
  }
}