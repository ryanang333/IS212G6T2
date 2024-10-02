import express from 'express';
import { getArrangementRequests,getStaffArrangementRequests, createTempArrangementRequests, createRegArrangementRequests, updateRequestStatus } from '../controllers/arrangementRequestsController.js';

const router = express.Router();

router.get('/', getArrangementRequests);
router.get('/staff', getStaffArrangementRequests);
router.post('/temp', createTempArrangementRequests);
router.post('/reg', createRegArrangementRequests);
router.patch('/cancel/:id', updateRequestStatus);

export default router;
