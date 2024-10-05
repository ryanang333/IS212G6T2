import express from "express";
import {
  getArrangementRequests,
  getStaffArrangementRequests,
  createTempArrangementRequests,
  createRegArrangementRequests,
  getOwnSchedule,
} from "../controllers/arrangementRequestsController.js";

const router = express.Router();

router.get("/", getArrangementRequests);
router.get("/staff", getStaffArrangementRequests);
router.post("/temp", createTempArrangementRequests);
router.post("/reg", createRegArrangementRequests);
router.get("/myschedule", getOwnSchedule);

export default router;
