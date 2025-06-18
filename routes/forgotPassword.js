import express from "express";
import { forgotPassword, resetPassword } from "../controllers/forgotPasswordController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Forgot and Reset Password endpoints
 */

/**
 * @swagger
 * /forgotPassword:
 *   post:
 *     summary: Send a password reset email to the user
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found
 */
router.post("/forgotPassword", forgotPassword);

/**
 * @swagger
 * /resetPassword:
 *   post:
 *     summary: Reset user password using a valid token
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: d4c68f30aa0b5c2d...
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPassword123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post("/resetPassword", resetPassword);

export default router;
