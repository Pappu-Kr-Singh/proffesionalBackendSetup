import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../modles/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";
import jwt, { decode } from "jsonwebtoken"



const generateAccessAndRefreshToken = async(userId)=>{
  try {
    const user  = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken  // to add refresh token in mongodb
    await user.save({validateBeforeSave: false})  // don't do validation here because there's no need  

    return {accessToken, refreshToken};

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Refressh and Acess Token")
  }
}

const registerUser = asyncHandler(async (req, res) =>{
  // get user details from frontend
  // validataion  - is empty
  // check if the user already exist
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refress token from responce
  // check for user creation
  // return res


  //getting the user details.
  const {fullName, email, userName, password}= req.body
  // console.log("email",  email)


  // applying validation

  //  NORMAL WAY OF VALIDATION

  // if(fullName === ""){
  //   throw new ApiError(400, "fullname is required")
  // } else if( email ===""){
  //   throw new ApiError(400, "email is required")
  // }  

  // OR
  if(
    [fullName, email, userName, password].some((fields)=>
      fields?.trim() ===""
    ) 
  ) {
      throw new ApiError(400, "All fields are required")
    }

    // Checking @ in email

    const emailValidate = email.includes("@")
    if (!emailValidate) {
      throw new ApiError(400, "email is not correct")
    }


    // Validation for already exited user

    const UserNameExist = await User.findOne({userName})
    const UserEmailExist = await User.findOne({email})

    if(UserEmailExist){
      throw new ApiError(408, "Email Already Exist");
    }

    if(UserNameExist){
      throw new ApiError(409, "Username Already Exist")
    }

    // OR

    // const existedUser = User.findOne({
    //   $or: [{userName}, {email}]
    // })

    // if(existedUser){
    //   throw new ApiError(409, "User Already Exist with email or username")
    // }

   

    // Checking the avatar image 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
      coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is required")
    }

    // uploading the avatar and coverImage to the cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
      throw new ApiError(400, "Avatar is required")
    }

    // adding details in db

  const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName : userName.toLowerCase()
    })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering a user")
   }

   return res.status(201).json(
    new ApiResponce(200, createdUser, "User Registered Successfully")
   )


})

const loginUser = asyncHandler(async(req, res) =>{
  // get user details
  // username or email
  // find user
  // password check 
  // access and refresh token
  // send cookie


    const {email, password, userName} = req.body

    if(!(userName || !email)){
      throw new ApiError(400, "username of email is required")
    }

    const user = await User.findOne({
      $or: [{userName}, {email}]
    })

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credientials")
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
      httpOnly : true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200, {
          user: loggedInUser, accessToken, refreshToken
        }, 
        "User Loggin Successfully"
      )
    )

})

const logoutUser = asyncHandler(async(req, res) =>{
  await User.findByIdAndUpdate(
  req.user._id,
  {
    $unset: {
      refreshToken : undefined
    }
  },
  {
    new: true
  }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponce(200, {}, "User logout successfully"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "anAuthorized access");
  }
  
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESS_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "invalid refreshToken")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
  
    const options ={
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
  
    return res
    .status(200)
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", newRefreshToken, options)
    .json(
      new ApiResponce(200),
      {accessToken, refreshToken: newRefreshToken},
      "Access Token Refreshed Successfully"
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")
  }

})

export  {
  registerUser, 
  loginUser,
  logoutUser,
  refreshAccessToken
}