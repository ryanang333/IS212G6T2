import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const { Schema } = mongoose;
// Application Schema for temporary flexible wfh application
const applyForTemporaryFlexibleWfhSchema = new Schema({
  
    arrangementDates: {
        type: Date,
        required: true
    },
    arrangementTime: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',  // Reference to the Staff schema
        required: true
    },
    manager_id: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',  // Reference to the Staff schema
        required: true
    },
    dateApplied: {
        type: Date,
        default: Date.now
    },
},
{
    collection: "temp_flexi_wfh_requests",
    timestamps: false,
  }
);

applyForTemporaryFlexibleWfhSchema.virtual('staff', {
    ref: 'Staff',
    localField: 'staff_id',
    foreignField: 'staff_id',
    justOne: true,
  });
  
applyForTemporaryFlexibleWfhSchema.virtual('manager', {
    ref: 'Staff',
    localField: 'manager_id',
    foreignField: 'staff_id',
    justOne: true,
  });
const TempFlexWfh = mongoose.model('applyForTemporaryFlexibleWfh', applyForTemporaryFlexibleWfhSchema)

export default TempFlexWfh;

