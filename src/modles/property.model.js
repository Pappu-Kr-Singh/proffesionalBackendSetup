import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Apartment", "House", "Vila"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    propertyImg: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Property = mongoose.model("Property", propertySchema);
