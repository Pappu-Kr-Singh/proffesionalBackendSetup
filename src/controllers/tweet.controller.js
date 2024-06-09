import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../modles/tweet.model.js";
import { User } from "../modles/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "content and userId required");
  }

  const tweet = await Tweet.create(req.user._id, {
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Error while creating a tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet has been created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const tweet = await Tweet.find({ owner: userId });

  if (!tweet.length) {
    throw new ApiError(408, "Tweets not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, tweet, "User tweets has been fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid tweetId");
  }

  if (!content) {
    throw new ApiError(401, "Content is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(500, "Couldn't found any tweet with the provided id");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, tweet, "Tweet has been updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid tweetId");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(500, "Error while deleting the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet has been deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
