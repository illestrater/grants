const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./organizerModel");
require("./userModel");

const program = {
  organizers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Organizer",
    },
  ],
  name: {
    type: String,
    trim: true,
    required: true,
  },
  url: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  tagline: {
    type: String,
    trime: true,
  },
  logistics: {
    type: String,
    trim: true,
    required: true,
  },
  criteria: {
    type: String,
    trim: true,
    required: true,
  },
  curators: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  active: {
    // Shown in application list
    type: Boolean,
    default: false,
  },
  isProtected: {
    type: Boolean,
    default: false,
  },
  passcode: {
    type: String,
  },
  open: {
    type: Date,
  },
  close: {
    type: Date,
  },
  closeApplication: {
    type: Boolean,
  },
  perpetual: {
    type: Boolean,
    default: false,
  },
  passByVotes: {
    type: Boolean,
    default: true,
  },
  blindVoting: {
    type: Boolean,
    default: true,
  },
  topThreshold: {
    type: Number,
    default: 10,
  },
  voteThreshold: {
    type: Number,
    default: 3,
  },
  contractAddress: {
    type: String,
  },
  creationInProgress: {
    type: Boolean,
    default: false,
  },
  ownershipTransferred: {
    type: Boolean,
    default: false,
  },
  mintToArtist: {
    type: Boolean,
    default: false,
  },
  curationLock: {
    type: Boolean,
    default: false,
  },
  hideResults: {
    type: Boolean,
    default: false,
  },
  curatorAddress: {
    type: String,
  },
  mintInProgress: {
    type: Boolean,
  },
  exhibiting: {
    type: Boolean,
    default: false,
  },
  finalized: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
  },
  total: {
    type: Number,
    default: 0,
  },
};

const ProgramSchema = new Schema(program);

ProgramSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

export default mongoose.models.Program ||
  mongoose.model("Program", ProgramSchema);
