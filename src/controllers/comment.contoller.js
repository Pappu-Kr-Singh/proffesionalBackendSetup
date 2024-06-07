import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// const getVideoComments = asyncHandler(async (req, res) => {
//   //TODO: get all comments for a video
//   const { videoId } = req.params;
//   const { page = 1, limit = 10 } = req.query;

//   // const filterComments =
// });

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Create the aggregation pipeline
  const pipeline = [
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        content: 1,
        video: 1,
        owner: {
          _id: 1,
          username: 1,
          email: 1, // Adjust the fields as needed
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // Use the mongooseAggregatePaginate plugin to paginate the results
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(pipeline),
    options
  );

  res
    .status(200)
    .json(new ApiResponse(comments, "Comments fetched successfully"));
});

export { getVideoComments };

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
