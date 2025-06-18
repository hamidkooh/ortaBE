import express from 'express';
import { receiveDoc } from '../controllers/documentController.js';


const router = express.Router();

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });



/**
 * @swagger
 * tags:
 *   name: Document Validation
 *   description: Handle document validation, classification and information extraction
 */

/**
 * @swagger
 * /processDocs/validate:
 *  post:
 *    tags: [Document Validation]
 *    summary: Process and classify an uploaded identity document
 *    description: This endpoint receives an identity document (PDF or image), processes it with Google Document AI for text extraction, and then uses a Large Language Model to classify the document type (Passport, Driving License, or None) and extract key information like the owner's name and expiration date.
 *    requestBody:
 *      description: Document file and its expected type
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              documentType:
 *                type: string
 *                description: The expected type of the document (e.g., "Passport", "Driving License").
 *                enum:
 *                  - Passport
 *                  - Driving License
 *              file:
 *                type: string
 *                format: binary
 *                description: The document file to upload (JPEG, JPG, PNG).
 *            required:
 *              - documentType
 *              - file
 *    responses:
 *      '200':
 *        description: Document processed and validated successfully, or an invalid document detected.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isValid:
 *                  type: string
 *                  description: Indicates if the document is valid ("valid") or invalid ("invalid") based on classification and type matching.
 *                  enum:
 *                    - valid
 *                    - invalid
 *                message:
 *                  type: string
 *                  description: A descriptive message about the validation result.
 *                ocrResult:
 *                  type: object
 *                  description: The structured output from the LLM after processing the document text.
 *                  properties:
 *                    document_type:
 *                      type: string
 *                      description: The classified type of the document.
 *                      enum:
 *                        - Passport
 *                        - Driving License
 *                        - None
 *                    name:
 *                      type: string
 *                      nullable: true
 *                      description: The full name of the document owner, or null if not found.
 *                    expiration_date:
 *                      type: string
 *                      format: date
 *                      nullable: true
 *                      description: The expiration date of the document in YYYY-MM-DD format, or null if not found.
 *              examples:
 *                validPassport:
 *                  value:
 *                    isValid: "valid"
 *                    message: "Your document was validated"
 *                    ocrResult:
 *                      document_type: "Passport"
 *                      name: "John Doe"
 *                      expiration_date: "2030-12-31"
 *                invalidFileType:
 *                  value:
 *                    isValid: "invalid"
 *                    message: "Uploaded file is not a valid document (Passport | Driving license)"
 *                    ocrResult:
 *                      document_type: "None"
 *                      name: null
 *                      expiration_date: null
 *                typeMismatch:
 *                  value:
 *                    isValid: "invalid"
 *                    message: "Your document did not match the selected document type"
 *                    ocrResult:
 *                      document_type: "Driving License"
 *                      name: "Jane Smith"
 *                      expiration_date: "2028-06-15"
 *      '400':
 *        description: Bad Request - No file uploaded.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isValid:
 *                  type: string
 *                  example: "invalid"
 *                message:
 *                  type: string
 *                  example: "No file uploaded."
 *      '500':
 *        description: Internal Server Error - Failed to process document with OCR or an unexpected error occurred.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isValid:
 *                  type: string
 *                  example: "invalid"
 *                message:
 *                  type: string
 *                  example: "Failed to process document with OCR."
 */
router.post('/validate', upload.single('file'), receiveDoc);

export default router;