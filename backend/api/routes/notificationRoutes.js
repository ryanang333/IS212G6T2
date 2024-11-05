import express from "express";
import {
  createNotification,
  getNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/staff/:staffId", getNotifications);

export default router;
