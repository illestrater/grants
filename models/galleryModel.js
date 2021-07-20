const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./userModel");

const gallery = {
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  nfts: [
    {
      id: {
        type: String,
        default: 0,
      },
      order: {
        type: Number,
        default: 0,
      },
      creatorAddress: {
        type: String,
        trim: true,
      },
      creatorName: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      image: {
        type: String,
        trim: true,
      },
      imageType: {
        type: String,
        trim: true,
      },
      poster: {
        type: String,
        trim: true,
      },
      external: {
        type: String,
        trim: true,
      },
      opensea: {
        type: String,
        trim: true,
      },
      traits: [
        {
          displayType: {
            type: String,
            trim: true,
          },
          maxValue: {
            type: String,
            trim: true,
          },
          order: {
            type: String,
            trim: true,
          },
          traitCount: {
            type: Number,
            trim: true,
          },
          traitType: {
            type: String,
            trim: true,
          },
          value: {
            type: String,
            trim: true,
          },
        },
      ],
    },
  ],
};

const GallerySchema = new Schema(gallery);

GallerySchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

export default mongoose.models.Gallery ||
  mongoose.model("Gallery", GallerySchema);
