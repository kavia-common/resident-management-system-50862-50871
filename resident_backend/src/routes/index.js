const express = require('express');
const healthController = require('../controllers/health');

const router = express.Router();

// --------------------
// In-memory data store
// --------------------
// NOTE: As requested, this is in-memory only (no database). Data resets on server restart.
const residents = [];
let nextResidentId = 1;

// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * tags:
 *   - name: Residents
 *     description: Manage residents (in-memory CRUD)
 *
 * components:
 *   schemas:
 *     Resident:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Jane Doe
 *         age:
 *           type: integer
 *           example: 35
 *       required: [id, name, age]
 *     ResidentCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe
 *         age:
 *           type: integer
 *           example: 35
 *       required: [name, age]
 */

/**
 * @swagger
 * /api/residents:
 *   get:
 *     summary: List all residents
 *     description: Returns all residents from the in-memory store.
 *     tags: [Residents]
 *     responses:
 *       200:
 *         description: List of residents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resident'
 */
router.get('/api/residents', (req, res) => {
  return res.status(200).json(residents);
});

/**
 * @swagger
 * /api/residents:
 *   post:
 *     summary: Add a resident
 *     description: Creates a new resident in the in-memory store and auto-generates an id.
 *     tags: [Residents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResidentCreateRequest'
 *     responses:
 *       201:
 *         description: Resident created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resident'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Field \"name\" is required"
 */
router.post('/api/residents', (req, res) => {
  const { name, age } = req.body || {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Field "name" is required',
    });
  }

  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge) || parsedAge < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Field "age" must be a non-negative number',
    });
  }

  const resident = {
    id: nextResidentId++,
    name: name.trim(),
    age: Math.trunc(parsedAge),
  };

  residents.push(resident);
  return res.status(201).json(resident);
});

/**
 * @swagger
 * /api/residents/{id}:
 *   delete:
 *     summary: Delete a resident by id
 *     description: Removes a resident from the in-memory store by id.
 *     tags: [Residents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resident id
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Resident deleted
 *       404:
 *         description: Resident not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Resident not found
 */
router.delete('/api/residents/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(404).json({ status: 'error', message: 'Resident not found' });
  }

  const idx = residents.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ status: 'error', message: 'Resident not found' });
  }

  residents.splice(idx, 1);
  return res.status(204).send();
});

module.exports = router;
