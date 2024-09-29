import express from 'express';
import { createAuditEntry } from '../controllers/requestAuditController.js';

const router = express.Router();

router.post('/', createAuditEntry)

export default router;
