import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../modles/like.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const { userId } = rew.user._id;

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid video and userId");
  }

  const existingLike = await Like.findOne({ video: videoId, user: userId });

  if (existingLike) {
    await existingLike.deleteOne();
    res.status(200).json(new ApiResponse(200, existingLike, "Like removed"));
  } else {
    const newLike = await Like.create({ video: videoId, user: userId });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, "Like added"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body._id;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId) || !isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid user and commentId");
  }

  const existingLike = await Like.findOne({ comment: commentId, user: userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, existingLike, "Like Removed"));
  } else {
    const newLike = await Like.create({ comment: commentId, user: userId });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, "Like Added"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { userId } = req.body;
  //TODO: toggle like on tweet

  const existingLike = await Like.findOne({ tweet: tweetId, user: userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, existingLike, "Like removed"));
  } else {
    const newLike = await Like.create({ tweet: tweetId, user: userId });
    await newLike.save();
    res.status(200).json(new ApiResponse(200, newLike, "Like Added"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: userId, video: { $exists: true } },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $replaceRoot: {
        newRoot: "$videoDetails",
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(404, "No Liked Videos Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "likedVideos Fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
