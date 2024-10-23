import express from "express";
import {
  getArrangementRequests,
  getStaffArrangementRequests,
  createTempArrangementRequests,
  createRegArrangementRequests,
  getOwnSchedule,
  getTeamSchedule,
  approveStaffRequests,
  rejectStaffRequests,
  withdrawStaffRequests,
  cancelStaffRequests,
  ApproveWithdrawalRequest,
  RejectWithdrawalRequest,
  withdrawRequestsAsManager
} from "../controllers/arrangementRequestsController.js";

const router = express.Router();

router.get("/", getArrangementRequests);
router.get("/staff", getStaffArrangementRequests);
router.post("/temp", createTempArrangementRequests);
router.post("/reg", createRegArrangementRequests);
router.get("/myschedule", getOwnSchedule);
router.get("/teamschedule", getTeamSchedule);
router.patch('/staffapproval', approveStaffRequests);
router.patch('/staffrejection', rejectStaffRequests);
router.patch('/staffwithdrawal', withdrawStaffRequests);
router.patch('/staffcancellation', cancelStaffRequests);
router.patch('/approvewithdrawal', ApproveWithdrawalRequest);
router.patch('/rejectwithdrawal', RejectWithdrawalRequest);
router.patch('/managerwithdrawal', withdrawRequestsAsManager);

export default router;
