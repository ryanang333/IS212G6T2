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
  withdrawRequestsAsManager
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
router.patch('/managerwithdrawal', withdrawRequestsAsManager);

export default router;
