import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  //get user details from front-end
  const { fullName, email, username, password } = req.body;

  //validate user details
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required!");
  }

  //check if user already exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new apiError(409, "user with email or username already exist");

  //check for images and avater 

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) coverImageLocalPath = req.files.coverImage[0].path;

  let avaterLocalPath;
  if(req.files && Array.isArray(req.files.avater) && req.files.avater.length > 0) avaterLocalPath = req.files.avater[0].path;

  //upload them to cloudinary, avater
  const avater = await uploadFileOnCloudinary(avaterLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
  if (!avater) {
    throw new apiError(400, "Avater is required");
  }

  //create user object
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    avater: avater.url,
    coverImage: coverImage?.url || "",
    password,
    email,
  });

  //remove password and refreshToken field from resposne
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser)
    throw new apiError(500, "Something went wrong while registering the user!");

  //return res
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user created successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "login ok",
  });
});

export { registerUser, loginUser };
