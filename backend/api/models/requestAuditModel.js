import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const { Schema } = mongoose;

const requestAuditSchema = new Schema(
  {
    audit_id: {
      type: Number,
      required: true,
      unique: true,
    },
    request_id: {
      type: Number,
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
      enum: ["pending", "approved", "rejected", "canceled", "withdrawn"],
      required: true,
    },
    new_status: {
      type: String,
      enum: ["pending", "approved", "rejected", "canceled", "withdrawn"],
      required: true,
    },
  },
  {
    collection: 'request_audit',
    timestamps: false,
  }
);

// Add auto-increment plugin
requestAuditSchema.plugin(AutoIncrement, { inc_field: 'audit_id' });

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
