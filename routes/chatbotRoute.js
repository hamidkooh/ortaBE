import express from 'express';
import { chatWithTogather } from '../controllers/chatBotController.js';
import requireAuth from "../middleware/requireAuth.js";
import chatRateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Handles request to the chatbot
 */


/**
 * @swagger
 * /chatbot/chat:
 *  post:
 *    tags: [Chatbot]
 *    summary: Get a response from the AI assistant with FAQ context.
 *    description: This endpoint allows users to send messages to an AI assistant. The assistant attempts to retrieve relevant information from an internal FAQ knowledge base based on the user's query and uses this context to generate a concise and accurate response via a Large Language Model. If no relevant FAQ is found, it will attempt to answer using general knowledge or suggest contacting support.
 *    requestBody:
 *      description: User message and optional chat history for context.
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                description: The user's message to the AI assistant.
 *                example: "How do I reset my password?"
 *    responses:
 *      '200':
 *        description: Successful response from the AI assistant.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: The AI assistant's response to the user's message.
 *                  example: "To reset your password, please visit the 'Account Settings' section and click on 'Forgot Password'."
 *      '500':
 *        description: Internal Server Error - An error occurred during the chat processing.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: A descriptive error message.
 *                  example: "An error occurred while processing your request. Failed to generate embedding for the user's query."
 */
router.post('/chat', requireAuth, chatRateLimiter, chatWithTogather)

export default router;