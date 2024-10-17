import express from "express";
import {
  getArrangementRequests,
  getStaffArrangementRequests,
  createTempArrangementRequests,
  createRegArrangementRequests,
  getOwnSchedule,
  getTeamSchedule,
  withdrawStaffRequests
} from "../controllers/arrangementRequestsController.js";

const router = express.Router();

router.get("/", getArrangementRequests);
router.get("/staff", getStaffArrangementRequests);
router.post("/temp", createTempArrangementRequests);
router.post("/reg", createRegArrangementRequests);
router.get("/myschedule", getOwnSchedule);
router.get("/teamschedule", getTeamSchedule);
router.patch('/staffwithdrawal', withdrawStaffRequests);

export default router;
