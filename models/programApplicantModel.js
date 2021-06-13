const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./programModel");

const programApplicant = {
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  program: {
    type: mongoose.Schema.ObjectId,
    ref: "Program",
    required: true,
  },
  statement: {
    type: String,
    trim: true,
    required: true,
  },
  additional: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  canvas: {
    type: String,
    required: true,
  },
  art: {
    type: String,
    required: true,
  },
  artWeb: {
    type: String,
    required: true,
  },
  ineligible: {
    type: Boolean,
    default: false,
  },
  flagged: [
    {
      id: {
        type: String,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        trim: true,
      },
      message: {
        type: String,
      },
    },
  ],
  approvalCount: {
    type: Number,
    default: 0,
  },
  rejectCount: {
    type: Number,
    default: 0,
  },
  approved: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  rejected: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  emailed: {
    type: Boolean,
    default: false,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  prepared: {
    type: Boolean,
    default: false,
  },
  finalized: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
  },
  arweave: {
    type: String,
  },
};

const ProgramApplicantSchema = new Schema(programApplicant);

ProgramApplicantSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

export default mongoose.models.ProgramApplicant ||
  mongoose.model("ProgramApplicant", ProgramApplicantSchema);
