import ArrangementRequest from "../models/arrangementRequestsModel.js";

export const getArrangementRequests = async (req, res) => {
  try {
    const arrangementRequests = await ArrangementRequest.find()
    .populate('staff');
    
    res.status(200).json(arrangementRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
