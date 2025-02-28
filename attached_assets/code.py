rom fastapi import FastAPI, HTTPException
import requests
import os
import json
from pydantic import BaseModel
from typing import List
import faiss
import numpy as np

# Set API Key directly (Replace with your actual key)
DEEPSEEK_API_KEY = "sk-ca48f9468ddf41c1b715a13a96d2be9b"

# Initialize FastAPI app
app = FastAPI()

# Load dataset
with open("kumbh_mela_advanced_dataset.json", "r", encoding="utf-8") as f:
    kumbh_data = json.load(f)["kumbh_mela"]["faq"]

# Extract questions and answers
questions = [item["question"] for item in kumbh_data]
answers = [item["answer"] for item in kumbh_data]

# Convert questions to vectors (dummy vectors for now, replace with real embeddings)
np.random.seed(42)
question_vectors = np.random.rand(len(questions), 512).astype('float32')

# Create FAISS index
index = faiss.IndexFlatL2(512)
index.add(question_vectors)

class QueryRequest(BaseModel):
    query: str

@app.post("/chat")
def chat(request: QueryRequest):
    query = request.query
    
    # Convert query to vector (dummy for now, replace with real embedding generation)
    query_vector = np.random.rand(1, 512).astype('float32')
    _, indices = index.search(query_vector, 1)  # Retrieve closest question
    best_match = indices[0][0]
    
    if best_match < len(answers):
        return {"response": answers[best_match]}  # Return pre-stored answer
    
    # Fallback to DeepSeek AI if no good match
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {DEEPSEEK_API_KEY}"}
    payload = {"model": "deepseek-chat", "messages": [{"role": "user", "content": query}]}
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return {"response": response.json()["choices"][0]["message"]["content"]}
    else:
        raise HTTPException(status_code=500, detail="DeepSeek AI error")

@app.get("/")
def home():
    return {"message": "Kumbh Mela Chatbot is running!"}