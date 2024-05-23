import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../modles/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";


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

    const UserNameExist = User.findOne({userName})
    const UserEmailExist = User.findOne({email})

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
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export default registerUser