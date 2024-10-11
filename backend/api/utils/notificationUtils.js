// Notification utility for manager notifications

export const sendManagerNotification = async (managerId, message) => {
    try {
      // Save the notification in the database or send an email to the manager
      console.log(`Notification sent to manager (${managerId}): ${message}`);
      
      // If using email, you can implement an email service like Nodemailer here
    } catch (error) {
      console.error('Error sending manager notification:', error);
    }
  };
  