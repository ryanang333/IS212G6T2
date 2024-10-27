import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema({
  request_id: {
    type: Schema.Types.ObjectId,
    ref: 'ArrangementRequest',
    required: true,
  },
  request_type: {
    type: String,
    enum: ["Manager_Action", "Staff_Action"],
    required: true,
  },
  changed_by: {
    type: Number,
    required: true,
  },
  receiver_id: {
    type: Number,
    required: true,
  },
  change_timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  old_status: {
    type: String,
    enum: ["N/A", "Pending", "Approved", "Rejected", "Cancelled", "Withdrawn", "Pending Withdrawal"],
    required: true,
  },
  new_status: {
    type: String,
    enum: ["N/A", "Pending", "Approved", "Rejected", "Cancelled", "Withdrawn", "Pending Withdrawal"],
    required: true,
  },
  reason:{
    type: String,
    maxLength: 100,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'notifications',
  timestamps: false,
});

notificationSchema.virtual('request', {
  ref: 'ArrangementRequest',
  localField: 'request_id',
  foreignField: 'request_id',
});

notificationSchema.virtual('changedBy', {
  ref: 'Staff',
  localField: 'changed_by',
  foreignField: 'staff_id',
});
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
