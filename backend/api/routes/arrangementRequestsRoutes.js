import express from 'express';
import { getArrangementRequests,getStaffArrangementRequests  } from '../controllers/arrangementRequestsController.js';

const router = express.Router();

router.get('/', getArrangementRequests);
router.get('/staff', getStaffArrangementRequests);

export default router;
