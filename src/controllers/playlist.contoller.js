import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../modles/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(401, "name and description are required");
  }

  const playlist = await PlayList.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(401, "Error while creating a playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist has been created Successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "UserId Not found");
  }

  const userPlayList = await PlayList.findById(userId);

  if (!userPlayList) {
    throw new ApiError(401, "There is no playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlayList,
        "userPlaylist has been fetched succefully by UserId"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid Playlist Id");
  }

  const playList = await PlayList.findById(PlayList._id);

  if (!playList) {
    throw new ApiError(401, "Playlist doesn't exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playList,
        "Playlist has been fetched successfully by playlistId"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid PlayList or UserId");
  }

  const playList = await PlayList.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!playList) {
    throw new ApiError(401, "Error while adding video to playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playList,
        "Video has been added to the playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid playlist or videoId");
  }

  const playList = await PlayList.findByIdAndUpdate(
    playlistId,

    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playList) {
    throw new ApiError(401, "Couldn't find videoId in the playlist to delete");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playList,
        "Video has been removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId");
  }

  const playList = await PlayList.findByIdAndDelete(playlistId);

  if (!playList) {
    throw new ApiError(401, "Couldn't find playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playList, "PlayList has been deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playListId");
  }

  if (!name || !description) {
    throw new ApiError(401, "name and video are required");
  }

  const playList = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      name: name,
      description: description,
    },
    { new: true }
  );

  if (!playList) {
    throw new ApiError(
      500,
      "Error while updating the video name and description"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playList, "PlayList has been updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
