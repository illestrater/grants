const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const organizer = {
  admins: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
  logo: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  wallet: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
};

const OrganizerSchema = new Schema(organizer);

OrganizerSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

export default mongoose.models.Organizer ||
  mongoose.model("Organizer", OrganizerSchema);
