import mongoose, { isValidObjectId } from "mongoose";
import { Order } from "../modles/order.model.js";
import { User } from "../modles/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const myOrder = asyncHandler(async (req, res) => {
  // Todo - Get all orders

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid user Id");
  }

  const order = await Order.find();

  if (!order) {
    throw new ApiError(401, "No orderFound");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Orders has been fetched successfully"));
});

const createOrder = asyncHandler(async (req, res) => {
  const { productId, userId } = req.params;
  const { address, totalPrice, paymentMode, quantity, status } = req.body;

  if (!isValidObjectId(productId) || !isValidObjectId(userId)) {
    throw new ApiError(401, "user and productId is invalid");
  }

  if (!address || !totalPrice || !paymentMode || !quantity || !status) {
    throw new ApiError(401, "All fields are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(401, "UnAuthorized user");
  }

  const order = await Order.create(userId, {
    product: productId,
    address,
    totalPrice,
    paymentMode,
    quantity,
    status,
    user: userId,
  });

  if (!order) {
    throw new ApiError(401, "Error while adding order details in db");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "order has been created Successfully"));
});

const updateOrder = asyncHandler(async (req, res) => {
  const { orderId, userId } = req.params;
  const { address } = req.body;

  if (!address) {
    throw new ApiError(401, "Address is required");
  }
  if (!isValidObjectId(orderId) || !isValidObjectId(userId)) {
    throw new ApiError(401, "user and order id is not valid");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        address,
      },
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(401, "orderId not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order updated successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { userId, orderId } = req.body;

  if (!isValidObjectId(userId) || !isValidObjectId(orderId)) {
    throw new ApiError(401, "invalid user and orderID");
  }

  const checkOrder = await Order.findById(orderId);

  if (!checkOrder) {
    throw new ApiError(401, "Order not found");
  }

  if (checkOrder.status === "Cancelled") {
    throw new ApiError(401, "order Is already Cancelled");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status: "Cancelled",
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Order has been cancelled successfully"));
});

export { myOrder, createOrder, updateOrder, cancelOrder };
