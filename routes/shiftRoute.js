import express from "express";
import { addShift, getShift, removeShift } from "../controllers/shiftController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shift
 *   description: Shift scheduling and management
 */

/**
 * @swagger
 * /shift/addShift:
 *   post:
 *     summary: Add a new shift
 *     tags: [Shift]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Night Shift
 *               description:
 *                 type: string
 *                 example: 10pm to 6am in Zone A
 *     responses:
 *       200:
 *         description: Shift added and confirmation email sent
 *       500:
 *         description: Server error or database failure
 */
router.post("/addShift", requireAuth, addShift);

/**
 * @swagger
 * /shift/getShift:
 *   get:
 *     summary: Get all shifts for the authenticated user
 *     tags: [Shift]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       501:
 *         description: Server error
 */
router.get("/getShift", requireAuth, getShift);

/**
 * @swagger
 * /shift/removeShift:
 *   get:
 *     summary: Remove a shift by ID
 *     tags: [Shift]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the shift to delete
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       501:
 *         description: Server error
 */
router.get("/removeShift", requireAuth, removeShift);

export default router;
