const FlexibleArrangement = require('../models/tempFlexiWfh');
const Staff = require('../models/staffModel'); 

// Apply for temp flexible work arrangement
exports.FlexibleArrangement = async (req, res) => {
    try {
        const { staff_id, arrangementDates, arrangementTime, reason } = req.body;

        // Fetch staff member and manager (manager)
        const staffMember = await Staff.findById(staff_id);
        const manager = await Staff.findOne({ role: 'manager' });

        // Check WFH limits (no more than 2 WFH days in a week)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const existingArrangements = await FlexibleArrangement.find({
            staffMember: staff_id,
            arrangementDates: { $gte: weekStart, $lte: weekEnd }
        });

        if (existingArrangements.length >= 2 || arrangementDates.length + existingArrangements.length > 2) {
            return res.status(400).json({ message: 'Oops! You cannot book more than 2 WFH dates in a week :(' });
        }

        // Create the flexible arrangement
        const newArrangement = new FlexibleArrangement({
            staffMember: staff_id,
            manager: manager_id,
            arrangementDates,
            arrangementTime,
            reason
        });

        await newArrangement.save();

        // Pop-up confirmation of submission
        res.status(201).json({
            message: 'Your application has been submitted for approval.',
            auditInfo: newArrangement.auditInfo
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
