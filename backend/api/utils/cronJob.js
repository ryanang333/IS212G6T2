import cron from 'node-cron';
import { autoRejectPendingRequests } from '../controllers/arrangementRequestsController.js';

const setupAutoRejectCronJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await autoRejectPendingRequests();
    } catch (error) {
      console.error('Failed to auto-reject pending requests:', error.message);
    }
  });

};

export default setupAutoRejectCronJob;
