import mongoose, { isValidObjectId } from "mongoose";
import { Post } from "../modles/post.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllPost = asyncHandler(async (req, res) => {
  // Todo- Get all post
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "invalid UserId");
  }

  const post = await Post.find({ owner: userId });

  if (!post.length) {
    throw new ApiError(401, "No post found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, post, "All post have been fetched successfully")
    );
});

const createPost = asyncHandler(async (req, res) => {
  // Create post

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(401, "title and description are required");
  }

  const postImgLocalPath = req.files?.postImg[0]?.path;

  if (!postImgLocalPath) {
    throw new ApiError(401, "postImg is required");
  }

  // uploading the postImg to the cloudinary

  const postImg = await uploadOnCloudinary(postImgLocalPath);
  if (!postImg) {
    throw new ApiError(401, "Error while uploading the postImg to cloudinary");
  }

  const post = await Post.create(req.user._id, {
    title: title,
    description: description,
    owner: req.user._id,
    postImg: postImg.url,
  });

  if (!post) {
    throw new ApiError(401, "Error while creating a post");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "The post has been created Successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  // update post

  const { postId } = req.params;
  const { postImgLocalPath } = req.file?.path;

  if (!isValidObjectId(postId)) {
    throw new ApiError(401, "Invalid postId");
  }

  if (!postImgLocalPath) {
    throw new ApiError(401, "postImg file is missing");
  }

  const oldPostImgUrl = req.post.url;
  console.log(oldPostImgUrl);

  const postImg = await uploadOnCloudinary(postImgLocalPath);
  if (!postImg.url) {
    throw new ApiError(401, "Error while uploading the postimg on cloudinary");
  }

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      title,
      description,
      postImg: postImg.url,
    },
    {
      new: true,
    }
  );

  if (!post) {
    throw new ApiError(401, "Error while updating the post");
  }
  if (oldPostImgUrl) {
    await deleteFromCloudinary(oldPostImgUrl);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post has been updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  // delete post
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(401, "Invalid postId");
  }

  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    throw new ApiError(401, "No post found with this id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post has been deleted Successfully"));
});

export { getAllPost, createPost, deletePost, updatePost };
