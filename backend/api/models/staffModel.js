import mongoose from "mongoose";

const { Schema } = mongoose;

const staffSchema = new Schema(
  {
    staff_id: {
      type: Number,
      required: true,
      unique: true,
    },
    staff_fname: {
      type: String,
      required: true,
      maxlength: 50,
    },
    staff_lname: {
      type: String,
      required: true,
      maxlength: 50,
    },
    dept: {
      type: String,
      required: true,
      maxlength: 50,
    },
    position: {
      type: String,
      required: true,
      maxlength: 50,
    },
    country: {
      type: String,
      required: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    reporting_manager: {
      type: Number,
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "staff",
    timestamps: false,
  }
);

staffSchema.virtual("manager", {
  ref: "Staff",
  localField: "reporting_manager",
  foreignField: "staff_id",
});

staffSchema.virtual("subordinates", {
  ref: "Staff",
  localField: "staff_id",
  foreignField: "reporting_manager",
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
