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