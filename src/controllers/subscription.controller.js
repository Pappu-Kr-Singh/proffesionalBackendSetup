import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../modles/user.model.js";
import { Subscription } from "../modles/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Invalid channel Id");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
  });

  if (!existingSubscription) {
    await existingSubscription.deleteOne();
    return res.status(200).json(new ApiResponse(200, "Subscription removed"));
  } else {
    const newSubcription = await Subscription.create({ channel: channelId });
    return res.status(200).json(new ApiResponse(200, "Subscription Added"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Invalid Channel Id");
  }

  const channelSubscriber = await Subscription.find({ channelId });

  if (!channelSubscriber) {
    throw new ApiError(401, "Couldn't find any subcriber of this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscriber, "Subscriber fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(401, "Invalid subscriberId");
  }

  const subscribedChannel = await subscribedChannel.find({ subscriberId });

  if (!subscribedChannel) {
    throw new ApiError(401, "Couldn't find any subscribed channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannel,
        "Subscribed channel fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
