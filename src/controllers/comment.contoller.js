import mongoose from "mongoose";
import { Comment } from "../modles/comment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const { ObjectId } = mongoose.Types;

  const aggregate = Comment.aggregate([
    {
      $match: { video: new ObjectId(videoId) },
    },
  ]);

  const comments = await Comment.aggregatePaginate(aggregate, options);

  if (!comments) {
    throw new ApiError(
      408,
      "There is no comments / error while fetching comments"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        "All comments have been fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { content, videoId, ownerId } = req.body;

  if (!content) {
    throw new ApiError(208, "content is required");
  }
  if (!videoId) {
    throw new ApiError(208, "video is required");
  }
  if (!ownerId) {
    throw new ApiError(208, "owner field is required");
  }

  const comment = await new Comment({
    content: content,
    video: videoId,
    owner: ownerId,
  });

  await comment.save();

  const createdComment = await Comment.findById(comment._id);

  if (!createdComment) {
    throw new ApiError(500, "something went wrong while creating comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdComment,
        "Comment has been created Successfully"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  console.log("req comment ", req.params);

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(208, "Couldnot found Comment");
  }

  return res
    .status(208)
    .json(new ApiResponse(208, comment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndUpdate(commentId);

  if (!comment) {
    throw new ApiError(408, "can't find comment");
  }

  if (String(comment.owner) != req.user._d) await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
