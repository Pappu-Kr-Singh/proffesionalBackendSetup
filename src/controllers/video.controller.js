import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../modles/video.model.js";
import { User } from "../modles/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const filterVideos = query ? { title: { $regex: query, $options: "i" } } : {};
  if (userId && isValidObjectId(userId)) {
    filterVideos.userId = userId;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  const videos = await Video.find(filterVideos)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments(filterVideos);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
      },
      "Total video have been fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!(title && description)) {
    throw new ApiError(401, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  console.log(videoLocalPath);

  let thumbnailLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
    console.log(thumbnailLocalPath);
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(401, "Thumbnail is required");
  }

  if (!videoLocalPath) {
    throw new ApiError(401, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Error while uploading the video on cloudinary");
  }

  if (!thumbnail) {
    throw new ApiError(
      500,
      "Error while uploading the thumbnail on cloudinary"
    );
  }

  // get user object

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user Not Found");
  }

  // adding video in db

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "Video have been Successfully uploaded to cloudinary and stored in database"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(401, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video has been fetched by id successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail

  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const oldVideo = req.video;
  console.log(oldVideo);
  // delete old video

  // if()

  const videoFile = await uploadOnCloudinary(videoId);

  if (!videoFile.url) {
    throw new ApiError(401, "Error while uploading the video on cloudinary");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        video: video.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been updated successfully"));
});
// this needs to be worked on......

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(201, "Invalid video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(201, "Video not found");
  }

  if (String(video.owner) !== String(req.user._id)) {
    throw new ApiError(408, "You are not authorized to delete the video");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(201, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(201, "Video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Video toggled successfull"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
