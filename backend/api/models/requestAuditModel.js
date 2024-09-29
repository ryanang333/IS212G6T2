import mongoose from 'mongoose';

const { Schema } = mongoose;

const requestAuditSchema = new Schema(
  {
    request_id: {
      type: Schema.Types.ObjectId,
      ref: 'ArrangementRequest',
      required: true,
    },
    changed_by: {
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
      enum: ["N/A", "Pending", "Approved", "Rejected", "Canceled", "Withdrawn"],
      required: true,
    },
    new_status: {
      type: String,
      enum: ["N/A", "Pending", "Approved", "Rejected", "Canceled", "Withdrawn"],
      required: true,
    },
  },
  {
    collection: 'request_audit',
    timestamps: false,
  }
);

// virtuals for relationships
requestAuditSchema.virtual('request', {
  ref: 'ArrangementRequest',
  localField: 'request_id',
  foreignField: 'request_id',
});

requestAuditSchema.virtual('changedBy', {
  ref: 'Staff',
  localField: 'changed_by',
  foreignField: 'staff_id',
});

const RequestAudit = mongoose.model('RequestAudit', requestAuditSchema);

export default RequestAudit;
