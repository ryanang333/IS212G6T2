import express from 'express';
import { createAuditEntry, fetchAuditLogs } from '../controllers/requestAuditController.js';

const router = express.Router();

router.post('/', createAuditEntry)
router.get('/', fetchAuditLogs);

export default router;
