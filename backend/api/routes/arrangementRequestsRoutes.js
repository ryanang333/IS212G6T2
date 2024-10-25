import express from "express";
import {
  getArrangementRequests,
  getStaffArrangementRequests,
  createTempArrangementRequests,
  createRegArrangementRequests,
  getOwnSchedule,
  getTeamSchedule,
  withdrawStaffRequests,
  cancelStaffRequests,
  ApproveWithdrawalRequest,
  RejectWithdrawalRequest,
  withdrawRequestsAsManager,
  autoRejectPendingRequests,
} from "../controllers/arrangementRequestsController.js";

const router = express.Router();

router.get("/", getArrangementRequests);
router.get("/staff", getStaffArrangementRequests);
router.post("/temp", createTempArrangementRequests);
router.post("/reg", createRegArrangementRequests);
router.get("/myschedule", getOwnSchedule);
router.get("/teamschedule", getTeamSchedule);
router.patch('/staffwithdrawal', withdrawStaffRequests);
router.patch('/staffcancellation', cancelStaffRequests);
router.patch('/approveWithdrawal',ApproveWithdrawalRequest)
router.patch('/rejectWithdrawal',RejectWithdrawalRequest)
router.patch('/managerwithdrawal', withdrawRequestsAsManager);
router.get('/autoRejectPendingRequests',autoRejectPendingRequests);

export default router;
