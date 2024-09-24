import express from 'express';
import { getArrangementRequests } from '../controllers/arrangementRequestsController.js';

const router = express.Router();

router.get('/', getArrangementRequests);

export default router;
