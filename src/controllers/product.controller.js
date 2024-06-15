import mongoose, { Schema, isValidObjectId } from "mongoose";
import { Product } from "../modles/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../modles/user.model.js";

const getAllProducts = asyncHandler(async (req, res) => {
  // Todo -- Get all Products
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid userId");
  }
  // fetch all prouduct
  const product = await Product.find();

  if (!product) {
    throw new ApiError(401, "No Products found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "All Products Fetched Successfully"));
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, stockQuantity, categories, price } = req.body;
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!name || !description || stockQuantity || !categories || !price) {
    throw new ApiError(401, "all Fields are required");
  }

  // Checking the product file
  const productImgLocalPath = req.files?.productImg[0].path;

  if (productImgLocalPath) {
    throw new ApiError(401, "Product image is required");
  }

  const productImg = await uploadOnCloudinary(productImgLocalPath);

  if (!productImg) {
    throw new ApiError(
      401,
      "Error while uploading the productImg on the cloudinary"
    );
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "You are not authorized user");
  }

  // Adding Product in db
  const product = await Product.create({
    name,
    description,
    price,
    productImg: productImg.url,
    stockQuantity,
    publishedBy: userId,
    categories,
    isAvailable: true,
  });

  if (!user) {
    throw new ApiError(401, "Error while adding the product in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product is created Successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, stockQuantity, description } = req.body;
  const { productId, userId } = req.params;

  if (!isValidObjectId(productId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid product or userId");
  }

  const user = await User.findById(userId);

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        name,
        price,
        stockQuantity,
        description,
      },
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(
      401,
      "Product Id not found/ Error while updating the product"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    throw new ApiError(401, "Invalid product Id");
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(401, "Product Id not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product has been deleted successfully"));
});

export { getAllProducts, createProduct, updateProduct, deleteProduct };
