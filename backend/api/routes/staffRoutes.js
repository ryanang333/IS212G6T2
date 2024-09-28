import express from 'express';
import { getStaff } from '../controllers/staffController.js';

const router = express.Router();

router.get('/:staff_id', getStaff);

export default router;