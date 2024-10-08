import mongoose from 'mongoose';

const { Schema } = mongoose;

const arrangementRequestSchema = new Schema(
  {
    staff_id: {
      type: Number,
      required: true,
    },
    request_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn'],
      required: true,
    },
    manager_id: {
      type: Number,
      required: true,
    },
    group_id: {
      type: String,
      required: false,
    },
    request_time: {
      type: String,
      enum: ['AM', 'PM', 'Full Day'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    }
  },
  {
    collection: 'arrangement_requests',
    timestamps: false,
  }
);

// Virtuals for relationships
arrangementRequestSchema.virtual('staff', {
  ref: 'Staff',
  localField: 'staff_id',
  foreignField: 'staff_id',
  justOne: true,
});

arrangementRequestSchema.virtual('manager', {
  ref: 'Staff',
  localField: 'manager_id',
  foreignField: 'staff_id',
  justOne: true,
});

// Create the ArrangementRequest model
const ArrangementRequest = mongoose.model('ArrangementRequest', arrangementRequestSchema);

export default ArrangementRequest;
