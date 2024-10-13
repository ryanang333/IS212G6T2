import express from 'express';
import { getAllDepartments, getStaff } from '../controllers/staffController.js';

const router = express.Router();

router.get('/', getStaff);
router.get('/department', getAllDepartments);

export default router;
