import express from 'express';
import { getArrangementRequests,getStaffArrangementRequests, createTempArrangementRequests } from '../controllers/arrangementRequestsController.js';

const router = express.Router();

router.get('/', getArrangementRequests);
router.get('/staff', getStaffArrangementRequests);
router.post('/temp', createTempArrangementRequests);

export default router;
