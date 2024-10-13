import express from 'express';
import { 
    getArrangementRequests,
    getStaffArrangementRequests, 
    createTempArrangementRequests, 
    createRegArrangementRequests,
    getOwnSchedule,
    getTeamSchedule,
    updateRequestStatus,
    approveRequest,
    rejectRequest,
    approveSelectedRequests,
    rejectSelectedRequests,
    approveGroupRequests,
    rejectGroupRequests,
    approveAllRequests,
    rejectAllRequests,
} from '../controllers/arrangementRequestsController.js';

const router = express.Router();

router.get('/', getArrangementRequests);
router.get('/staff', getStaffArrangementRequests);
router.post('/temp', createTempArrangementRequests);
router.post('/reg', createRegArrangementRequests);
router.get("/myschedule", getOwnSchedule);
router.get("/teamschedule", getTeamSchedule);
router.patch('/withdrawal/:id', updateRequestStatus);
router.post('/approve', approveRequest);
router.post('/reject', rejectRequest);
router.post('/approveSelected', approveSelectedRequests);
router.post('/rejectSelected', rejectSelectedRequests);
router.post('/approveGroup', approveGroupRequests);
router.post('/rejectGroup', rejectGroupRequests);
router.post('/approveAll', approveAllRequests);
router.post('/rejectAll', rejectAllRequests);

export default router;
