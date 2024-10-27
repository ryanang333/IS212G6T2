import cron from 'node-cron';
import { autoRejectPendingRequests } from '../controllers/arrangementRequestsController.js';

const setupAutoRejectCronJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
   
      await autoRejectPendingRequests();
      console.log('Auto-reject cron job executed successfully.');
    } catch (error) {
      console.error('Failed to auto-reject pending requests:', error.message);
    }
  });

  console.log('Auto-reject scheduled to run daily at midnight');
};

export default setupAutoRejectCronJob;
