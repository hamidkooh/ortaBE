import dotenv from "dotenv";
import Together from "together-ai";
import fetch from 'node-fetch';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import faiss from 'faiss-node';

dotenv.config();

const TOGETHER_AI_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"; 

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_EMBED_MODEL = 'embed-english-v3.0';

let faqChunks = [];
let faqIndex = null;
let embeddingDimension = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// path to FAQ
const FAQ_FILE_PATH = path.join(__dirname, '..', 'public', 'faq.txt');

const initializeFAQData = async () => {
    try {
        console.log(FAQ_FILE_PATH)
        console.log(`Attempting to load FAQ data from: ${FAQ_FILE_PATH}`);
        const faqContent = await readFile(FAQ_FILE_PATH, 'utf-8');
        // simple chunking based on empty line
        faqChunks = faqContent.split(/\n\s*\n/).filter(chunk => chunk.trim() !== '');

        if (faqChunks.length > 0) {
            console.log(`Successfully loaded ${faqChunks.length} FAQ chunks.`);
            console.log("Generating embeddings for FAQ chunks...");
            const faqEmbeddings = await getEmbeddings(faqChunks, 'search_document');
            
            if (faqEmbeddings.length > 0) {
                console.log(`Generated embeddings for ${faqEmbeddings.length} FAQ chunks.`);
                
                embeddingDimension = faqEmbeddings[0].length;
                console.log(`Embedding dimension: ${embeddingDimension}`);
                
                faqIndex = new faiss.IndexFlatIP(embeddingDimension);
                
                const embeddingMatrix = [];
                for (const embedding of faqEmbeddings) {
                    faqIndex.add(embedding)
                }

                console.log(`Added ${faqEmbeddings.length} vectors to FAISS index.`);
            } else {
                console.warn("Failed to generate embeddings for FAQ chunks.");
            }
        } else {
            console.warn("FAQ file is empty or could not be chunked. No grounding data loaded.");
        }
    } catch (error) {
        console.error("Error initializing FAQ data:", error.message);
        console.error("Please ensure 'faq.txt' exists at the specified path and contains content.");
    }
};

const getEmbeddings = async (texts, inputType) => {
    if (!COHERE_API_KEY) {
        console.error("COHERE_API_KEY is not set. Cannot generate embeddings.");
        return [];
    }
    if (!texts || texts.length === 0) {
        return [];
    }

    try {
        const response = await fetch('https://api.cohere.ai/v1/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`
            },
            body: JSON.stringify({
                texts: texts,
                model: COHERE_EMBED_MODEL,
                input_type: inputType 
            })
        });

        const data = await response.json();
        if (response.ok && data.embeddings) {
            console.log('successfully got the embeddings')
            console.log('len: ', data.embeddings.length)
            return data.embeddings;
        } else {
            console.error("Error getting embeddings from Cohere API:", data);
            return [];
        }
    } catch (error) {
        console.error("Network or Cohere API call failed:", error.message);
        return [];
    }
};

const retrieveRelevantFAQs = (queryEmbedding, topK = 3) => {
    if (!queryEmbedding || queryEmbedding.length === 0 || !faqIndex || faqChunks.length === 0) {
        console.warn("Cannot retrieve relevant FAQs: embeddings, FAISS index, or chunks are missing.");
        return [];
    }

    try {
        const queryArray = Array.from(queryEmbedding);
        
        const results = faqIndex.search(queryArray, topK);
        
        const relevantFAQs = [];
        for (let i = 0; i < results.labels.length; i++) {
            const index = results.labels[i];
            const score = results.distances[i];
            
            if (index >= 0 && index < faqChunks.length) {
                relevantFAQs.push({
                    chunk: faqChunks[index],
                    score: score
                });
            }
        }
        
        console.log(`Found ${relevantFAQs.length} relevant FAQs with scores:`, 
                   relevantFAQs.map(f => f.score));
        
        return relevantFAQs.map(item => item.chunk);
    } catch (error) {
        console.error("Error during FAISS search:", error.message);
        return [];
    }
};

const chatWithTogather = async (req, res) => {

    console.log('FAISS index status: ', faqIndex ? 'initialized' : 'not initialized')

    const together = new Together({
        apiKey: process.env.TOGETHER_API_KEY
    });

    const { message, _ } = req.body;
    console.log("User message received:", message);

    try {
        const queryEmbeddings = await getEmbeddings([message], 'search_query');
        if (!queryEmbeddings || queryEmbeddings.length === 0) {
            throw new Error("Failed to generate embedding for the user's query.");
        }
        const queryEmbedding = queryEmbeddings[0];

        const relevantFAQs = retrieveRelevantFAQs(queryEmbedding, 3); 

        let promptContext = "";
        if (relevantFAQs.length > 0) {
            promptContext = "Here is some relevant information from our frequently asked questions that might help answer the user's current question:\n\n";
            relevantFAQs.forEach((faq, index) => {
                promptContext += `--- FAQ Entry ${index + 1} ---\n${faq.trim()}\n\n`;
            });
            promptContext += "Please use ONLY the provided FAQ information to answer the user's question. If the FAQ information does not contain a direct answer, state that you cannot find the answer in the provided FAQs and offer to connect them with support. Do NOT use your general knowledge to answer questions that are not covered by the FAQs.\n\n";
        } else {
            promptContext = "No specific information was found in our frequently asked questions related to your query. I will try my best to answer based on my general knowledge, but please be aware that I may not have specific details for this topic. If you need precise information, please contact our support team.\n\n";
        }

        const systemInstruction = "You are a helpful and accurate assistant. Respond concisely. Always prioritize the provided context from the FAQs. If the information is not in the provided FAQs, clearly state that you cannot find the answer there.";

        const messagesForLLM = [
            {
                role: "system",
                content: systemInstruction
            }
        ];

        messagesForLLM.push({
            role: "user",
            content: `${promptContext}User's current question: ${message}`
        });

        const response = await together.chat.completions.create({
            messages: messagesForLLM,
            model: TOGETHER_AI_MODEL
        });

        const llmResponseContent = response.choices[0].message.content;
        console.log("LLM Response sent:", llmResponseContent);

        res.json({ message: llmResponseContent });

    } catch (error) {
        console.error("Error in chatWithTogather function:", error);
        res.status(500).json({ error: "An error occurred while processing your request. " + error.message });
    }
};

export { chatWithTogather, initializeFAQData };