import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["CashOnDelivery", "Prepaid", "Card"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: pending,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
