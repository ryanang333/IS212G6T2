import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const { Schema } = mongoose;
const AutoIncrement = mongooseSequence(mongoose);

const arrangementRequestSchema = new Schema(
  {
    request_id: {
      type: Number,
      required: true,
      unique: true,
    },
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
      enum: ['pending', 'approved', 'rejected', 'canceled', 'withdrawn'],
      required: true,
    },
    manager_id: {
      type: Number,
      required: true,
    },
    group_id: {
      type: Number,
      required: false,
    },
    request_time: {
      type: String,
      enum: ['am', 'pm', 'full day'],
      required: true,
    },
  },
  {
    collection: 'arrangement_requests',
    timestamps: false,
  }
);

// Add auto-increment plugin
arrangementRequestSchema.plugin(AutoIncrement, { inc_field: 'request_id' });

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
