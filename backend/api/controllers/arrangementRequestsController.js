import ArrangementRequest from "../models/arrangementRequestsModel.js";

export const getArrangementRequests = async (req, res) => {
  try {
    const { manager_id } = req.query;

    if (!manager_id) {
      return res.status(400).json({ error: 'manager_id is required' });
    }

    const numericManagerId = Number(manager_id);

    const arrangementRequests = await ArrangementRequest.find({
      manager_id: numericManagerId,
      status: 'Pending'
    }).populate('staff');

    if (arrangementRequests.length === 0) {
      return res.status(404).json({ message: 'No arrangement requests found for this manager' });
    }

    res.status(200).json(arrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getStaffArrangementRequests = async (req, res) => {
  try {
    const { staff_id } = req.query;
    console.log('Staff ID:', staff_id);

    if (!staff_id) {
      return res.status(400).json({ error: 'staff_id is required' });
    }

    const numericStaffID = Number(staff_id);

    const arrangementRequests = await ArrangementRequest.find({
      staff_id: numericStaffID,
    }).populate('staff');

    if (arrangementRequests.length === 0) {
      return res.status(404).json({ message: 'No arrangement requests found for this staff' });
    }

    res.status(200).json(arrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply for temp flexible work arrangement
const Staff = require('../models/staffModel'); 

export const FlexibleArrangement = async (req, res) => {
    try {
        const { staff_id, arrangementDates, arrangementTime, reason } = req.body;

        // Fetch staff member and manager (manager)
        const staffMember = await Staff.findById(staff_id);
        const manager_id = staffMember.manager_id;
        if(!staffMember){
            return res.status(404).json({message:"Staff member not found. Please try again."})
        }
        
        // Check WFH limits (no more than 2 WFH days in a week)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const existingArrangements = await ArrangementRequest.find({
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
