import { Property } from "../modles/property.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../modles/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addProperty = asyncHandler(async (req, res) => {
  const { title, desc, price, category, location } = req.body;
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!title || !desc || price || !category || !location) {
    throw new ApiError(401, "all Fields are required");
  }

  // checking the propertyImg File

  return res
    .status(200)
    .json(
      new ApiResponse(200, property, "Property has been added successfully")
    );
});

const getProperty = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, property, "Property has been fetched successfully")
    );
});

const getAllproperty = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        property,
        "All properties has been fetched successfully"
      )
    );
});

const updateProperty = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, property, "Property has been updated successfully")
    );
});

const deleteProperty = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, property, "Property has been added successfully")
    );
});

export {
  addProperty,
  getAllproperty,
  getProperty,
  updateProperty,
  deleteProperty,
};
