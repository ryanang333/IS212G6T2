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

    const groupedData = {};

    arrangementRequests.forEach(request => {
      const { group_id, request_date } = request;

      if (group_id) {
        if (!groupedData[group_id]) {
          groupedData[group_id] = {
            group_id,
            start_date: request_date,
            end_date: request_date,
            requests: []
          };
        }

        groupedData[group_id].start_date = 
          new Date(groupedData[group_id].start_date) < new Date(request_date) ?
          groupedData[group_id].start_date : request_date;
        groupedData[group_id].end_date = 
          new Date(groupedData[group_id].end_date) > new Date(request_date) ?
          groupedData[group_id].end_date : request_date;

        groupedData[group_id].requests.push(request);
      } 
      else {
        if (!groupedData['individuals']) {
          groupedData['individuals'] = [];
        }
        groupedData['individuals'].push(request);
      }
    });

    const groupedArrangementRequests = Object.values(groupedData);

    res.status(200).json(groupedArrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};