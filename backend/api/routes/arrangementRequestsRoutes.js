import express from 'express';
import { getArrangementRequests,getStaffArrangementRequests,FlexibleArrangement  } from '../controllers/arrangementRequestsController.js';


const router = express.Router();

router.post('/apply', FlexibleArrangement);
router.get('/', getArrangementRequests);
router.get('/staff', getStaffArrangementRequests);

export default router;
