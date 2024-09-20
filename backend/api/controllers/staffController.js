import Staff from "../models/staffModel.js";

export const getStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findOne({ staff_id: req.params.staff_id })
      .populate("manager")
      .populate("subordinates");

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json(staffMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
