import fetch from 'node-fetch';
import { GoogleAuth } from 'google-auth-library';
import Together from "together-ai";
import dotenv from "dotenv";

dotenv.config()


const TOGETHER_AI_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

const receiveDoc = async (req, res) => {
    console.log('receiveDoc function called');
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
        console.error('No file uploaded.');
        return res.status(400).json({ isValid: 'invalid', message: 'No file uploaded.' });
    }


    const endpoint = process.env.OCR_ENDPOINT


    try {

        const auth = new GoogleAuth({
            keyFilename: `${process.env.GC_DOC_PATH}`,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const imageBuffer = file.buffer;
        const encodedImage = imageBuffer.toString('base64');

        const requestBody = {
            rawDocument: {
                content: encodedImage,
                mimeType: file.mimetype || 'application/pdf'
            }
        };

        console.log(`Making HTTP request to: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const extractedText = result.document.text;

        console.log('Extracted text:', extractedText);

        //use llm to classify 
        const together = new Together({
            apiKey: process.env.TOGETHER_API_KEY
        });

        // const systemInstruction = "You are a helpful and accurate assistant. The text is extracted from a document. Is it a Passport or a Driving License? only respond with one word"

        const systemInstruction = `
            You are a helpful and accurate assistant. The user will provide text extracted from an identity document. 
            Your task is to determine:
            1. The type of document either "Passport", "Driving License", or "None" (if the document is neither)
            2. The name of the document owner
            3. The expiration date

            Always return your response in the following strict JSON format:
            {
            "document_type": "Passport" | "Driving License" | "None",
            "name": "Full Name of the owner",
            "expiration_date": "YYYY-MM-DD"
            }
            If any information is missing or unclear, return null for that field. Be concise and only respond with the JSON object.
            `;

        const messagesForLLM = [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: extractedText
            }
        ];



        console.log('Sending the extracted text to LLM')
        const llmResponse = await together.chat.completions.create({
            messages: messagesForLLM,
            model: TOGETHER_AI_MODEL
        });

        const llmResponseContent = llmResponse.choices[0].message.content;

        const jsonText = llmResponseContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1');
        const jsonResult = JSON.parse(jsonText);

        console.log('documnet type: ', documentType)
        console.log("Parsed Output:", jsonResult);

        if (jsonResult['document_type'] === 'None' || jsonResult['document_type'] === 'null') {
            return res.status(200).json({
                isValid: 'invalid',
                message: 'Uploaded file is not a valid document (Passport | Driving license)',
                ocrResult: jsonResult,
            })
        }

        if (jsonResult['document_type'] === documentType) {
            return res.status(200).json({
                isValid: 'valid',
                message: 'Your documnet was validated',
                ocrResult: jsonResult,
            })
        } else {
            return res.status(200).json({
                isValid: 'invalid',
                message: 'Your documnet did not match the selected document type',
                ocrResult: jsonResult,
            })
        }


    } catch (error) {
        console.error('Error processing document:', error);
        return res.status(500).json({
            isValid: 'invalid',
            message: 'Failed to process document with OCR.',
            error: error.message,
        });
    }
};

export { receiveDoc };