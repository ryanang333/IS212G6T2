import express from 'express';
import { getArrangementRequests } from '../controllers/submitted_viewController.js';

const router = express.Router();

router.get('/', getArrangementRequests);

export default router;